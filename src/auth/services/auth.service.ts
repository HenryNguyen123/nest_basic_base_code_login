import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../dtos/request/login.request.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { comparePassword, hashPassword } from 'src/commons/utils/password.util';
import { JwtService } from '@nestjs/jwt';
import {
  IPayloadJWTLogin,
  IPayloadLogin,
} from 'src/auth/interfaces/login.interface';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from 'src/auth/dtos/response/login.response.dto';
import ms, { StringValue } from 'ms';
import { RedisService } from 'src/redis/redis.service';
import { RegisterDto } from 'src/auth/dtos/request/register.request.dto';
import { Profile } from 'src/users/entities/profile.entity';
import { Role } from 'src/roles/entities/role.entity';
import { RoleEnum } from 'src/roles/enums/role.enum';
import { UserRole } from 'src/roles/entities/user-role.entity';
import { pathFileName } from 'src/commons/utils/path-file-name.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) { }
  // step: login
  async login(loginDto: LoginDto, ip: string) {
    // data login
    const { email, password } = loginDto;
    const keyAccess = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_SECRET_KEY',
    );
    const keyRefresh = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET_KEY',
    );
    const timeAccess = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    );
    const timeRefresh = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    );
    const timeRefreshMs = ms(timeRefresh as StringValue);
    // check validate
    if (!timeAccess || !timeRefresh || !keyAccess || !keyRefresh) {
      throw new InternalServerErrorException('Missing JWT configuration');
    }

    // check user exist
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermission')
      .leftJoinAndSelect('rolePermission.permission', 'permission')
      .where('user.email = :email', { email })
      .andWhere('user.is_active = true')
      .getOne();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // check redis
    const redisId = `user:${ip}:${user.email}`;
    const countRedis = Number((await this.redisService.get(redisId)) || 0);
    if (countRedis >= 5) {
      throw new UnauthorizedException('User is locked for 5 minutes');
    }
    // check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // set redis
      await this.redisService.incr(redisId, 300);
      throw new UnauthorizedException('Invalid password');
    }
    // reset redis
    await this.redisService.del(redisId);
    // payload
    const roles = user.userRoles.map((userRole) => {
      return {
        name: userRole.role.name,
        code: userRole.role.code,
      };
    });
    const roleCode = user.userRoles.map((userRole) => {
      return userRole.role.code;
    });
    // const permissionCodes = user.userRoles.map((userRole) => {
    //   return userRole.role.rolePermissions.map((rolePermission) => {
    //     return rolePermission.permission.code;
    //   });
    // });
    const permissionCodes = user.userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map((rp) => rp.permission.code),
    );
    const payload: IPayloadLogin = {
      email: user.email,
      userName: user.userName,
      isActive: user.isActive,
      role: roles,
      profile: {
        fullName: user.profile.fullName,
        gender: user.profile.gender,
        dob: user.profile.dob,
        phone: user.profile.phone,
        avatar: user.profile.avatar,
      },
    };
    const payloadJWT: IPayloadJWTLogin = {
      sub: user.id,
      roleCode: roleCode,
      permissionCodes: permissionCodes,
    };
    // generate token
    const accessToken = await this.jwtService.signAsync(payloadJWT, {
      secret: keyAccess,
      expiresIn: timeAccess as StringValue,
    });
    const refreshToken = await this.jwtService.signAsync(payloadJWT, {
      secret: keyRefresh,
      expiresIn: timeRefresh as StringValue,
    });
    // save refresh token
    await this.refreshTokenRepository.delete({
      userId: user.id,
    }); // delete all refresh token of user
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + timeRefreshMs),
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);
    // response
    return plainToInstance(LoginResponseDto, {
      accessToken,
      refreshToken,
      user: payload,
    });
  }

  // step: logout
  async logout(user: IPayloadJWTLogin, ip: string) {
    if (!user.sub) {
      throw new UnauthorizedException('User not found');
    }
    const userExist = await this.userRepository.findOneBy({
      id: user.sub,
    });
    if (!userExist) {
      throw new UnauthorizedException('User not found');
    }
    // check refresh token
    const refreshToken = await this.refreshTokenRepository.findOneBy({
      userId: user.sub,
    });
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    // delete refresh token
    await this.refreshTokenRepository.delete({
      userId: user.sub,
    });
    // delete redis
    await this.redisService.del(`user:${ip}:${userExist.email}`);
  }

  // step: register
  async register(registerDto: RegisterDto, file: Express.Multer.File | null, path: string) {
    const { email, password, userName, fullName, gender, dob, phone } = registerDto;
    // const RoleUserCode = RoleCodeEnum.USER;
    // check user exist
    const user = await this.userRepository.findOne({
      where: [
        { email },
        { userName },
      ],
    });
    if (user) {
      throw new ConflictException('Email or username already exists');
    }
    // hash password
    const hash = await hashPassword(password);
    // create user
    const userEntity = this.userRepository.create({
      email,
      password: hash,
      userName,
    });
    await this.userRepository.save(userEntity);
    // create profile
    let pathAvatar: string | null = null;
    if (file) {
      pathAvatar = pathFileName(file, path);
    }
    const profileEntity = this.profileRepository.create({
      user: userEntity,
      fullName,
      gender,
      dob,
      phone,
      avatar: pathAvatar ?? undefined,
    });
    await this.profileRepository.save(profileEntity);
    // get Role
    const role = await this.roleRepository.findOneBy({
      code: RoleEnum.USER,
    });
    if (!role) {
      throw new InternalServerErrorException('Role not found');
    }
    // create user role
    const userRoleEntity = this.userRoleRepository.create({
      user: userEntity,
      role,
    });
    await this.userRoleRepository.save(userRoleEntity);
  }
}

import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../dtos/request/login.request.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { comparePassword } from 'src/commons/utils/password.util';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}
  // step: login
  async login(loginDto: LoginDto, ip: string) {
    // data login
    const { email, password } = loginDto;
    const redisId = `user:${ip}`;
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
    // check redis
    const countRedis = Number((await this.redisService.get(redisId)) || 0);
    if (countRedis >= 5) {
      throw new UnauthorizedException('User is locked for 5 minutes');
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
    const permissionCodes = user.userRoles.flatMap(userRole =>
      userRole.role.rolePermissions.map(rp => rp.permission.code),
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
}

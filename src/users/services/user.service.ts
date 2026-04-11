import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { VerifyToken } from 'src/auth/entities/verify-token.entity';
import { hashPassword } from 'src/commons/utils/password.util';
import { pathFileName } from 'src/commons/utils/path-file-name.util';
import { MailService } from 'src/mails/services/mail.service';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/user-role.entity';
import { RoleEnum } from 'src/roles/enums/role.enum';
import { CreateUserDto } from 'src/users/dtos/request/create-user.dto';
import { Profile } from 'src/users/entities/profile.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(VerifyToken)
    private readonly verifyTokenRepository: Repository<VerifyToken>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}
  //create user
  async create(
    createUserDto: CreateUserDto,
    file: Express.Multer.File | null,
    path: string,
  ) {
    const { email, password, userName, fullName, gender, dob, phone } =
      createUserDto;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    // check user exits
    const userCheck = await this.userRepository.findOne({
      where: [{ email }, { userName }],
    });
    if (userCheck)
      throw new ConflictException('Email or username already exists');
    // hash password
    const hash = await hashPassword(password);
    // create new user
    const userEntity = this.userRepository.create({
      email,
      password: hash,
      userName,
    });
    await this.userRepository.save(userEntity);
    //create new profile
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
    // check role and get role
    const role = await this.roleRepository.findOneBy({
      code: RoleEnum.USER,
    });
    if (!role) throw new InternalServerErrorException('Role not found');
    // create new user role
    const userRoleEntity = this.userRoleRepository.create({
      user: userEntity,
      role,
    });
    await this.userRoleRepository.save(userRoleEntity);
    // send verify mail
    const uuid = randomUUID();
    // check verify token
    const checkVerifyToken = await this.verifyTokenRepository.findOneBy({
      userId: userEntity.id,
    });
    if (checkVerifyToken) {
      await this.verifyTokenRepository.delete({
        userId: userEntity.id,
      });
    }
    // create verify token
    const verifyTokenEntity = this.verifyTokenRepository.create({
      userId: userEntity.id,
      token: uuid,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await this.verifyTokenRepository.save(verifyTokenEntity);
    await this.mailService.sendVerifyMail(
      email,
      profileEntity.fullName,
      `${frontendUrl}/verify?token=${uuid}`,
      '24h',
    );
  }
}

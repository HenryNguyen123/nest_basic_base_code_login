import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/auth/controllers/auth.controller';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from 'src/auth/services/auth.service';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { RedisService } from 'src/redis/redis.service';
import { Profile } from 'src/users/entities/profile.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/user-role.entity';
import { VerifyToken } from 'src/auth/entities/verify-token.entity';
import { MailModule } from 'src/mails/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken, Profile, Role, UserRole, VerifyToken]), MailModule],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
  exports: [AuthService],
})
export class AuthModule { }

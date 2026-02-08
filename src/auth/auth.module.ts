import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/auth/controllers/auth.controller';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from 'src/auth/services/auth.service';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
  exports: [AuthService],
})
export class AuthModule {}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from 'src/auth/dtos/request/login.request.dto';
import { AuthService } from '../services/auth.service';
import { LoginResponseDto } from 'src/auth/dtos/response/login.response.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //step: login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto, ip);
  }

  // step: logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Ip() ip: string, @Req() req: Request): Promise<void> {
    const user = req['user'];
    await this.authService.logout(user, ip);
  }
}

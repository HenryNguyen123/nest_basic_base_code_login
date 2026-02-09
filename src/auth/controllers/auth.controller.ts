import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { LoginDto } from 'src/auth/dtos/request/login.request.dto';
import { AuthService } from '../services/auth.service';
import { LoginResponseDto } from 'src/auth/dtos/response/login.response.dto';

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
}

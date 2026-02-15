import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoginDto } from 'src/auth/dtos/request/login.request.dto';
import { AuthService } from '../services/auth.service';
import { LoginResponseDto } from 'src/auth/dtos/response/login.response.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { RegisterDto } from 'src/auth/dtos/request/register.request.dto';
import { UploadFileInterceptor } from 'src/commons/interceptors/upload-file.interceptor';

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

  // step: register
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: RegisterDto,
  })
  @UseInterceptors(UploadFileInterceptor('avatar', './public/images/avatar'))
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file: Express.Multer.File | null,
  ): Promise<void> {
    const path = '/images/avatar';
    await this.authService.register(registerDto, file, path);
  }
}

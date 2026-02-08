import { Controller, Get } from '@nestjs/common';
// import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
    // constructor(private readonly authService: AuthService) { }

    @Get()
    getHello(): string {
        return 'Hello World!';
    }

    // @Post('register')
    // async register(@Body() registerDto: RegisterDto) {
    //     return this.authService.register(registerDto);
    // }
}

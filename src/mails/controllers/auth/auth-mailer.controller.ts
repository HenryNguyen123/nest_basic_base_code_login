import { MailerService } from "@nestjs-modules/mailer";
import { Controller, Get } from "@nestjs/common";

@Controller('auth/mail')
export class AuthMailController {
    constructor(private readonly mailerService: MailerService) {}
    
    // test mail
    @Get('test')
    async testMail() {
        await this.mailerService.sendMail({
            to: 'nhokkudo143@gmail.com',
            subject: 'welcom to us, test mail',
            template: './test',
            context: {
                name: 'Nhật đại ca',
            },
        })
    }
}

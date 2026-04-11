import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadFileInterceptor } from 'src/commons/interceptors/upload-file.interceptor';
import { CreateUserDto } from 'src/users/dtos/request/create-user.dto';
import { UserService } from 'src/users/services/user.service';

@ApiTags('user')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(private userService: UserService) {}
  //create
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateUserDto,
  })
  @UseInterceptors(UploadFileInterceptor('avatar', './public/images/avatar'))
  async create(
    @Res() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File | null,
  ): Promise<void> {
    const path: string = '/images/avatar';
    await this.userService.create(createUserDto, file, path);
  }
}

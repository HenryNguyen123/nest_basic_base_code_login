import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadFileInterceptor } from 'src/commons/interceptors/upload-file.interceptor';
import { CreateUserDto } from 'src/users/dtos/request/create-user.dto';
import { ReadUserResponseDto } from 'src/users/dtos/response/read-user.response.dto';
import { UserResponseDto } from 'src/users/dtos/response/user.response.dto';
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
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File | null,
  ): Promise<void> {
    const path: string = '/images/avatar';
    await this.userService.create(createUserDto, file, path);
  }
  //update
  @Patch('update')
  async update() {}
  //read
  @Get('read')
  async read(): Promise<ReadUserResponseDto> {
    return await this.userService.read();
  }
  //find user by id
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return await this.userService.findById(id);
  }
}

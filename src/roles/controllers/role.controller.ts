import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleAdminGuard } from 'src/auth/guards/role-admin.guard';
import { IJwtPayload } from 'src/auth/interfaces/jwt.interface';
import { RoleCreateRequest } from 'src/roles/dtos/request/role-create.request.dto';
import { UpdateRoleRequest } from 'src/roles/dtos/request/role-update.request.dto';
import { RoleReadResponse } from 'src/roles/dtos/response/role-read.response.dto';
import { RoleResponseDto } from 'src/roles/dtos/response/role.response.dto';
import { RoleService } from 'src/roles/services/role.service';

@ApiTags('role')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}
  //create role by admin
  @Post('create')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    type: RoleCreateRequest,
  })
  async create(@Req() req: Request, @Body() body: RoleCreateRequest) {
    const jwtPayload = req['user'] as IJwtPayload;
    await this.roleService.create(jwtPayload, body);
  }
  //read role by admin
  @Get('read')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  async read(): Promise<RoleReadResponse> {
    return await this.roleService.read();
  }
  //update role by admin
  @Patch('update')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  @ApiBody({
    type: UpdateRoleRequest,
  })
  async update(@Body() body: UpdateRoleRequest): Promise<RoleResponseDto> {
    return await this.roleService.update(body);
  }
  //delete role by admin
  @Delete('destroy')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  async destroy() {}
}

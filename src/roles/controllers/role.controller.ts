import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleAdminGuard } from 'src/auth/guards/role-admin.guard';
import { IJwtPayload } from 'src/auth/interfaces/jwt.interface';
import { RoleReadResponse } from 'src/roles/dtos/response/role-read.response.dto';
import { RoleService } from 'src/roles/services/role.service';

@ApiTags('role')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}
  //create role by admin
  @Post('create')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  async create(@Req() req: Request) {
    const jwtPayload = req['user'] as IJwtPayload;
    return await this.roleService.create(jwtPayload);
  }
  //read role by admin
  @Get('read')
  @UseGuards(JwtAuthGuard, RoleAdminGuard)
  async read(): Promise<RoleReadResponse> {
    return await this.roleService.read();
  }
}

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth-decorator.decorator';
import { PermissionService } from 'src/permissions/services/permission.service';
import { RoleEnum } from 'src/roles/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionResponseDto } from 'src/permissions/dtos/response/permission-response.response.dto';
import { CreatePermissionRequestDto } from 'src/permissions/dtos/request/create-permission.request.dto';
import { ListPermissionRequestDto } from 'src/permissions/dtos/request/list-permission.request.dto';
import { PaginationPermissionResponseDto } from 'src/permissions/dtos/response/pagination-permission.response.dto';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // step: get all permission
  @Get()
  @Auth([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN])
  async findAll(
    @Query() query: ListPermissionRequestDto,
  ): Promise<PaginationPermissionResponseDto> {
    return this.permissionService.findAll(query);
  }

  // step: create permission
  @Post()
  @Auth([RoleEnum.SUPER_ADMIN])
  create(
    @Body() body: CreatePermissionRequestDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.create(body);
  }
}

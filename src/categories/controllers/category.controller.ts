import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Permissions } from 'src/permissions/decorators/permission.decorator';
import { PermissionEnum } from 'src/permissions/enums/permission-enums.enum';
import { PermissionsGuard } from 'src/permissions/guards/permissions.guard';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { RoleEnum } from 'src/roles/enums/role.enum';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor() {}

  //test
  @Get('test')
  @Roles(RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @Permissions(PermissionEnum.TEST_CATEGORY)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  test() {
    return 'test';
  }
}

import { Controller, Get, Post } from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth-decorator.decorator";
import { PermissionService } from "src/permissions/services/permission.service";
import { RoleEnum } from "src/roles/enums/role.enum";

@Controller('permissions')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService){}
    
    @Get()
    @Auth([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN])
    async findAll() {
        return this.permissionService.findAll();
    }

    @Post()
    @Auth([RoleEnum.SUPER_ADMIN])
    create() {
        return 'This action adds a new permission';
    }
}
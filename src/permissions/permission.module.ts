import { PermissionController } from "src/permissions/controllers/permission.controller";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "src/permissions/entities/permission.entity";
import { PermissionService } from "src/permissions/services/permission.service";
import { RolePermission } from "src/permissions/entities/role-permission.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Permission, RolePermission])],
    controllers: [PermissionController],
    providers: [PermissionService],
    exports: [PermissionService],
})
export class PermissionModule { }
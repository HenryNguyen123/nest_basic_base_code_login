import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { PermissionResponseDto } from "src/permissions/dtos/response/permission-response.response";
import { Permission } from "src/permissions/entities/permission.entity";
import { RolePermission } from "src/permissions/entities/role-permission.entity";
import { Repository } from "typeorm";

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        @InjectRepository(RolePermission)
        private readonly rolePermissionRepository: Repository<RolePermission>,
    ) { }
    // step: findAll
    async findAll() {
        const permissions = await this.permissionRepository.find(
            {
                relations: ['rolePermissions']
            }
        );
        return plainToInstance(PermissionResponseDto, permissions);
    }
}

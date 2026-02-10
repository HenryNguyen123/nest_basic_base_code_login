import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { CreatePermissionRequestDto } from "src/permissions/dtos/request/create-permission.request.dto";
import { PermissionResponseDto } from "src/permissions/dtos/response/permission-response.response.dto";
import { Permission } from "src/permissions/entities/permission.entity";
import { RolePermission } from "src/permissions/entities/role-permission.entity";
import { Role } from "src/roles/entities/role.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        @InjectRepository(RolePermission)
        private readonly rolePermissionRepository: Repository<RolePermission>,
    ) { }
    // step: get all permission
    async findAll(): Promise<PermissionResponseDto[]> {
        const permissions = await this.permissionRepository.find(
            {
                relations: {
                    rolePermissions: {
                        role: true,
                    },
                },
                order: {
                    name: 'ASC',
                },
            }
        );
        return plainToInstance(PermissionResponseDto, permissions, {
            excludeExtraneousValues: true,
        });
    }

    // step: create permission
    async create(body: CreatePermissionRequestDto): Promise<PermissionResponseDto> {
        const { name, code, description, module, roleCodes } = body;
        // check permission exists
        const permissionExists = await this.permissionRepository.findOne({
            where: {
                code,
            },
        });
        if (permissionExists) {
            throw new ConflictException('Permission already exists');
        }

        // check role exists
        const roleExists = await this.roleRepository.find({
            where: {
                code: In(roleCodes),
            },
        });
        if (roleExists.length !== roleCodes.length) {
            throw new NotFoundException('Role not found');
        }
        const permissionSave = this.permissionRepository.create({
            name,
            code,
            description,
            module,
        });
        const permission = await this.permissionRepository.save(permissionSave);
        // create role permission
        const rolePermissions = roleExists.map((role) => {
            return this.rolePermissionRepository.create({
                role,
                permission,
            });
        });
        await this.rolePermissionRepository.save(rolePermissions);
        return plainToInstance(PermissionResponseDto, permission, {
            excludeExtraneousValues: true,
        });
    }
}

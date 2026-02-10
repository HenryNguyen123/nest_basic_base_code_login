import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CreatePermissionRequestDto } from 'src/permissions/dtos/request/create-permission.request.dto';
import { ListPermissionRequestDto } from 'src/permissions/dtos/request/list-permission.request.dto';
import { PaginationPermissionResponseDto } from 'src/permissions/dtos/response/pagination-permission.response.dto';
import { PermissionResponseDto } from 'src/permissions/dtos/response/permission-response.response.dto';
import { Permission } from 'src/permissions/entities/permission.entity';
import { RolePermission } from 'src/permissions/entities/role-permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { In, Like, Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}
  // step: get all permission
  async findAll(
    query: ListPermissionRequestDto,
  ): Promise<PaginationPermissionResponseDto> {
    const { search, page = 1, limit = 10 } = query;
    const [permissions, total] = await this.permissionRepository.findAndCount({
      where: search
        ? [
            { name: Like(`%${search}%`) },
            { code: Like(`%${search}%`) },
            { description: Like(`%${search}%`) },
            { module: Like(`%${search}%`) },
          ]
        : {},
      order: {
        name: 'ASC',
      },
      relations: {
        rolePermissions: {
          role: true,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return plainToInstance(PaginationPermissionResponseDto, {
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
      data: permissions,
    });
  }

  // step: create permission
  async create(
    body: CreatePermissionRequestDto,
  ): Promise<PermissionResponseDto> {
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

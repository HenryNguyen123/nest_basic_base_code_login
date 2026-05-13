import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { IJwtPayload } from 'src/auth/interfaces/jwt.interface';
import { RoleReadResponse } from 'src/roles/dtos/response/role-read.response.dto';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/user-role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}
  //create role
  async create(jwt: IJwtPayload) {
    console.log('jwt', jwt);
  }
  //read roleas
  async read() {
    const res = await this.userRoleRepository.find({
      relations: {
        role: true,
        user: {
          profile: true,
        },
      },
    });
    const payload: RoleReadResponse[] = res.map((item) => ({
      roleId: item.roleId,
      roleName: item.role.name,
      roleCode: item.role.code,
      descRole: item.role.description,
      username: item.user.userName,
      email: item.user.email,
      isActive: item.user.isActive,
      fullName: item.user.profile.fullName,
      gender: item.user.profile.gender,
      avatar: item.user.profile.avatar,
    }));
    return plainToInstance(RoleReadResponse, { payload });
  }
}

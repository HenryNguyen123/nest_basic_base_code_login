import { Expose, Type } from "class-transformer";
import { RolePermissionResponseDto } from "src/permissions/dtos/response/role-permission.response";

export class PermissionResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    createdAt?: Date;

    @Expose()
    updatedAt?: Date;

    @Expose()
    @Type(() => RolePermissionResponseDto)
    rolePermissions: RolePermissionResponseDto[];
}
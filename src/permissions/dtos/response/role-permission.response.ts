import { Expose } from "class-transformer";

export class RolePermissionResponseDto {
    @Expose()
    roleId: number;

    @Expose()
    permissionId: number;

    @Expose()
    createdAt?: Date;

    @Expose()
    updatedAt?: Date;
}
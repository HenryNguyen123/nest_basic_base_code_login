import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RoleCode } from 'src/auth/enums/role-code.enum';
import { IJwtPayload } from 'src/auth/interfaces/jwt.interface';

@Injectable()
export class RoleAdminGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    // body
    const req = context.switchToHttp().getRequest<Request>();
    const user = req['user'] as IJwtPayload;
    const role = user.roleCode as RoleCode;
    // if (!role) return false;
    if (
      !user ||
      (!role.includes(RoleCode.ADMIN) && !role.includes(RoleCode.SUPERADMIN))
    )
      throw new ForbiddenException('nember dont have permission');
    return await Promise.resolve(
      role.includes(RoleCode.ADMIN) || role.includes(RoleCode.SUPERADMIN),
    );
  }
}

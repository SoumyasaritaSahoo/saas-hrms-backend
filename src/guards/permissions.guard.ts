import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../common/decorators/require-permissions.decorator';
import { PermissionService } from '../modules/permission/permission.service';

// Chain this AFTER UserAuthGuard (e.g. @UseGuards(UserAuthGuard, PermissionsGuard)).
// It always attaches request.user.permissions (fetched fresh per request, never
// cached in the JWT/session) so downstream services can scope query results —
// not just gate the route. If the route has no @RequirePermissions(...), it lets
// the request through once permissions are attached.
//
// Depends on PermissionService (not UserService) deliberately: UserModule
// already imports LeaveModule, so any feature module wiring this guard in
// (LeaveModule included) must not need to import UserModule, or it'd create
// a circular module dependency. PermissionModule has no such coupling.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    request.user = {
      ...request.user,
      permissions: userId
        ? await this.permissionService.getUserPermissionKeys(userId)
        : [],
    };

    if (!required?.length) return true;

    return required.some((key) => request.user.permissions.includes(key));
  }
}

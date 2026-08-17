import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// Declares which permission keys grant access to a route. PermissionsGuard
// allows the request through if the caller holds ANY of the listed keys
// (mirrors the frontend's canAny() semantics), e.g.:
//   @RequirePermissions('employees.view', 'employees.view-team')
export const RequirePermissions = (...keys: string[]) =>
  SetMetadata(PERMISSIONS_KEY, keys);

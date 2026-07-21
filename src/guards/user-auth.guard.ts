import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ClientType } from '../common/constants/client-type.constant';

@Injectable()
export class UserAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const clientType = request.clientType;

    // WEB SESSION AUTH
    if (clientType === ClientType.WEB) {
      if (!request.isAuthenticated()) {
        throw new UnauthorizedException('Unauthenticated');
      }

      return true;
    }

    return true;
  }
}

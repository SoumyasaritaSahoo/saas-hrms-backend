import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (!request.isAuthenticated()) {
      throw new UnauthorizedException('Unauthenticated');
    }

    if (request.user.type !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}

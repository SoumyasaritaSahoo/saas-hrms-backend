import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { ClientType } from '../common/constants/client-type.constant';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const clientType = req.headers['client-type'] as string;

    if (!clientType) {
      throw new BadRequestException('Client-Type header is required');
    }

    if (clientType !== ClientType.WEB && clientType !== ClientType.APP) {
      throw new BadRequestException('Invalid Client-Type');
    }

    req['clientType'] = clientType;

    next();
  }
}

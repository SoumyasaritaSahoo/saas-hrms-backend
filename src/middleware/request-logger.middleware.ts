import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 ${req.method} ${req.originalUrl}`);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    console.log('Params:', req.params);
    console.log('IP:', req.ip);

    res.on('finish', () => {
      const duration = Date.now() - start;

      console.log(`📤 ${res.statusCode} - ${duration}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    next();
  }
}

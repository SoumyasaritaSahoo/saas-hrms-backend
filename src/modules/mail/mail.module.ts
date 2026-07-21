import { Module } from '@nestjs/common';

import { MailService } from './mail.service';
import * as dotenv from 'dotenv';

dotenv.config();

// NOTE: the source project's mail.module.ts also imported MailerModule
// from '@nestjs-modules/mailer', but never wired it into `imports: []` or
// used it anywhere else — MailService talks to SMTP directly via
// nodemailer. That dead import (and the @nestjs-modules/mailer dependency)
// was dropped here.
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

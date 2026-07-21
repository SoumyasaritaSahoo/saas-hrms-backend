import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { SequelizeModule } from '@nestjs/sequelize';

import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';

import { User } from '../../database/models/user.model';
import { SaasUser } from '../../database/models/saas/saas-user.model';
import { SaasEmailVerification } from '../../database/models/saas/saas-email-verification.model';
import { EmailVerification } from '../../database/models/email-verification.model';
import { UserSession } from '../../database/models/user-session.model';
import { SessionSerializer } from './auth.serializer';
import { MailModule } from '../mail/mail.module';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MailModule,
    CompanyModule,
    UserModule,

    PassportModule.register({
      session: true,
    }),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),

    SequelizeModule.forFeature([
      SaasUser,
      SaasEmailVerification,
      User,
      EmailVerification,
      UserSession,
    ]),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, SessionSerializer],
})
export class AuthModule {}

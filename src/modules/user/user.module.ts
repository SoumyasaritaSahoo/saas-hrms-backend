import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from '../../database/models/user.model';
import { SaasUser } from '../../database/models/saas/saas-user.model';
import { UserRole } from '../../database/models/user-role.model';
import { UserAddress } from '../../database/models/user-address.model';
import { UserBankAccount } from '../../database/models/user-bank-account.model';
import { UserDocument } from '../../database/models/user-document.model';
import { EmailVerification } from '../../database/models/email-verification.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MailModule } from '../mail/mail.module';
import { LeaveModule } from '../leave/leave.module';
import { StorageModule } from '../storage/storage.module';
import { PermissionModule } from '../permission/permission.module';

// NOTE: the source project's UserModule also registered
// UserCompanyLocation, Location, SaasUserRole, SaasRole and
// SaasEmailVerification in SequelizeModule.forFeature — those back the
// SaaS admin user CRUD (findAllSaasUsers/createSaasUser/...) that was
// intentionally excluded from UserService/UserController for this
// Employee-management port (out of scope, see user.service.ts). Location
// and UserCompanyLocation are used via the plain (non-@InjectModel) model
// class in UserService, so they don't need a forFeature entry here either
// — only models actually injected via @InjectModel are listed below.
// LeaveModule/StorageModule/MailModule/PermissionModule are imported
// because UserService/PermissionsGuard genuinely depend on
// LeaveBalanceService/StorageService/MailService/PermissionService.
@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      SaasUser,
      UserRole,
      UserAddress,
      UserBankAccount,
      UserDocument,
      EmailVerification,
    ]),
    MailModule,
    LeaveModule,
    StorageModule,
    PermissionModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from '../../database/models/user.model';
import { SaasUser } from '../../database/models/saas/saas-user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';

// NOTE: simplified from the source project. UserModule originally also
// imported MailModule, LeaveModule, StorageModule and PermissionModule to
// support SaaS/employee CRUD (mail invites, leave balance init on hire,
// profile picture storage, permission-gated employee listing). Those
// endpoints were dropped from UserController/UserService for this
// auth-only port (see user.service.ts) — what remains (self profile +
// admin profile) only needs the User and SaasUser models.
@Module({
  imports: [SequelizeModule.forFeature([User, SaasUser])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

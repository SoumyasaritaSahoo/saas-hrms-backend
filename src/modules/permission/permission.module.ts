import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from 'src/database/models/permission.model';
import { PermissionGroup } from 'src/database/models/permission-group.model';
import { Role } from 'src/database/models/role.model';
import { RolePermission } from 'src/database/models/role-permission.model';
import { User } from 'src/database/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Permission,
      PermissionGroup,
      Role,
      RolePermission,
      User,
    ]),
  ],
  providers: [PermissionService],
  exports: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '../../database/models/role.model';
import { RolePermission } from '../../database/models/role-permission.model';
import { Permission } from '../../database/models/permission.model';
import { User } from '../../database/models/user.model';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Role, RolePermission, Permission, User]),
  ],
  providers: [RoleService],
  exports: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}

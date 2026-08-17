import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PermissionGroup } from 'src/database/models/permission-group.model';
import { Permission } from 'src/database/models/permission.model';
import { Role } from 'src/database/models/role.model';
import { RolePermission } from 'src/database/models/role-permission.model';
import { User } from 'src/database/models/user.model';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(PermissionGroup)
    private readonly permissionGroupModel: typeof PermissionGroup,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async findAll() {
    return this.permissionGroupModel.findAll({
      include: [
        {
          model: Permission,
        },
      ],
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
        [{ model: Permission, as: 'permissions' }, 'name', 'ASC'],
      ],
    });
  }

  // Used by PermissionsGuard on every authenticated request — lives here
  // (rather than on UserService) specifically to avoid a circular module
  // dependency: UserModule already imports LeaveModule, so any guard that
  // feature modules like LeaveModule need to use must not depend on
  // UserModule. PermissionModule has no such coupling either direction.
  async getUserPermissionKeys(userId: string): Promise<string[]> {
    const user = await this.userModel.findByPk(userId, {
      attributes: ['id'],
      include: [
        {
          model: Role,
          through: { attributes: [] },
          include: [
            {
              model: RolePermission,
              include: [{ model: Permission, attributes: ['key'] }],
            },
          ],
        },
      ],
    });

    if (!user) return [];

    const roles = (user as any).roles ?? [];
    const keys: string[] = roles
      .flatMap((role: any) =>
        (role.role_permissions ?? []).map((rp: any) => rp.permission?.key),
      )
      .filter(Boolean);

    return [...new Set(keys)];
  }
}

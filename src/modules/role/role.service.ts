import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Role } from '../../database/models/role.model';
import { RolePermission } from '../../database/models/role-permission.model';
import { Permission } from '../../database/models/permission.model';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionGroup } from 'src/database/models/permission-group.model';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
    @InjectModel(RolePermission)
    private readonly rolePermissionModel: typeof RolePermission,
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) {}

  generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  async createForCompany(
    companyId: string,
    name: string,
    assignAllPermissions = false,
  ) {
    const slug = this.generateSlug(name);

    const [role] = await this.roleModel.findOrCreate({
      where: { company_id: companyId, slug },
      defaults: {
        company_id: companyId,
        name,
        slug,
        is_deletable: false,
      },
    });

    if (assignAllPermissions) {
      const permissions = await this.permissionModel.findAll({
        attributes: ['id'],
      });

      await this.syncRolePermissions(
        role.id,
        companyId,
        permissions.map((p) => p.id),
      );
    }

    return role;
  }

  async syncRolePermissions(
    roleId: string,
    companyId: string,
    permissionIds: string[],
  ) {
    await this.rolePermissionModel.destroy({
      where: { role_id: roleId },
      force: true,
    });

    if (!permissionIds.length) {
      return;
    }

    await this.rolePermissionModel.bulkCreate(
      permissionIds.map((permissionId) => ({
        company_id: companyId,
        role_id: roleId,
        permission_id: permissionId,
      })),
    );
  }

  async create(creatorId: string, dto: CreateRoleDto) {
    const slug = this.generateSlug(dto.name);

    const role = await this.roleModel.create({
      company_id: dto.company_id,
      name: dto.name,
      slug,
      created_by: creatorId,
    });

    const permissionIds = await this.resolvePermissionIds(
      dto.permission_group_ids ?? [],
      dto.permission_ids ?? [],
    );

    await this.syncRolePermissions(role.id, dto.company_id, permissionIds);

    return role;
  }

  async resolvePermissionIds(
    groupIds: string[],
    permissionIds: string[],
  ): Promise<string[]> {
    const ids = new Set(permissionIds);

    if (groupIds.length) {
      const permissions = await this.permissionModel.findAll({
        where: {
          group_id: groupIds,
        },
        attributes: ['id'],
      });

      permissions.forEach((permission) => ids.add(permission.id));
    }

    return [...ids];
  }

  async update(updaterId: string, roleId: string, dto: CreateRoleDto) {
    const role = await this.roleModel.findByPk(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dto.name) {
      const slug = this.generateSlug(dto.name);

      await role.update({
        name: dto.name,
        slug,
        updated_by: updaterId,
      });
    }

    const permissionIds = await this.resolvePermissionIds(
      dto.permission_group_ids ?? [],
      dto.permission_ids ?? [],
    );

    await this.syncRolePermissions(role.id, role.company_id, permissionIds);

    return role;
  }

  async findAllRoles(companyId: string, page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    const where: any = { company_id: companyId };
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { rows, count } = await this.roleModel.findAndCountAll({
      where,
      include: [
        {
          model: RolePermission,
          include: [
            {
              model: Permission,
              include: [PermissionGroup],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.roleModel.findByPk(id, {
      include: [
        {
          model: RolePermission,
          include: [
            {
              model: Permission,
              include: [PermissionGroup],
            },
          ],
        },
      ],
    });
  }

  async remove(deleterId: string, roleId: string) {
    const role = await this.roleModel.findByPk(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!role.is_deletable) {
      throw new BadRequestException('This role cannot be deleted');
    }

    await role.update({
      deleted_by: deleterId,
    });

    await role.destroy();
  }

  async getAllRoles(companyId: string) {
    const roles = await this.roleModel.findAll({
      where: { company_id: companyId },
    });

    return roles;
  }
}

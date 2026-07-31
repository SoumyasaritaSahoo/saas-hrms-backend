import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';

import { PermissionGroup } from './permission-group.model';
import { User } from './user.model';
import { RolePermission } from './role-permission.model';

@Table({
  tableName: 'permissions',
  paranoid: true,
  underscored: true,
})
export class Permission extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => PermissionGroup)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare group_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  declare key: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_critical: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare created_by: string | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare updated_by: string | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare deleted_by: string | null;

  @BelongsTo(() => PermissionGroup)
  declare group: PermissionGroup;

  @HasMany(() => RolePermission)
  declare role_permissions: RolePermission[];
}

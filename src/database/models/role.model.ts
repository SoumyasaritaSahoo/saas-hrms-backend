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
  BelongsToMany,
} from 'sequelize-typescript';

import { Company } from './company.model';
import { User } from './user.model';
import { RolePermission } from './role-permission.model';
import { UserRole } from './user-role.model';

@Table({
  tableName: 'roles',
  paranoid: true,
  underscored: true,
})
export class Role extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare company_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare slug: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_deletable: boolean;

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

  @BelongsTo(() => Company)
  declare company: Company;

  @HasMany(() => RolePermission)
  declare role_permissions: RolePermission[];

  @HasMany(() => UserRole)
  declare user_roles: UserRole[];

  @BelongsToMany(() => User, () => UserRole)
  declare users: User[];
}

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { Company } from './company.model';
import { Role } from './role.model';
import { Permission } from './permission.model';

@Table({
  tableName: 'role_permissions',
  paranoid: true,
  underscored: true,
})
export class RolePermission extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Company)
  @Column(DataType.UUID)
  declare company_id: string;

  @ForeignKey(() => Role)
  @Column(DataType.UUID)
  declare role_id: string;

  @ForeignKey(() => Permission)
  @Column(DataType.UUID)
  declare permission_id: string;

  @BelongsTo(() => Company)
  declare company: Company;

  @BelongsTo(() => Role)
  declare role: Role;

  @BelongsTo(() => Permission)
  declare permission: Permission;
}

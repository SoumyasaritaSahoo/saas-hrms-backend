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
  HasMany,
} from 'sequelize-typescript';

import { User } from './user.model';
import { Permission } from './permission.model';

@Table({
  tableName: 'permission_groups',
  paranoid: true,
  underscored: true,
})
export class PermissionGroup extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare label: string;

  @Default(0)
  @Column(DataType.INTEGER)
  declare sort_order: number;

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

  @HasMany(() => Permission)
  declare permissions: Permission[];
}

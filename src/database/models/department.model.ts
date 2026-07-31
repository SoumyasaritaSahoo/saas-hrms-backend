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

import { Company } from './company.model';
import { User } from './user.model';

@Table({
  tableName: 'departments',
  paranoid: true,
  underscored: true,
})
export class Department extends Model {
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

  @ForeignKey(() => Department)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare parent_id: string | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare head_user_id: string | null;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare created_by: string | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare updated_by: string | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare deleted_by: string | null;

  // Relations

  @BelongsTo(() => Company)
  declare company: Company;

  @BelongsTo(() => Department, 'parent_id')
  declare parent: Department;

  @HasMany(() => Department, 'parent_id')
  declare children: Department[];

  @BelongsTo(() => User, 'head_user_id')
  declare head: User;
}

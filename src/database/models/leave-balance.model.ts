import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

import { Company } from './company.model';
import { User } from './user.model';
import { LeaveType } from './leave-type.model';

@Table({
  tableName: 'leave_balances',
  paranoid: true,
  underscored: true,
})
export class LeaveBalance extends Model {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @ForeignKey(() => LeaveType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare leave_type_id: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare year: number;

  @Column(DataType.DECIMAL(10, 2))
  declare opening_balance: number;

  @Column(DataType.DECIMAL(10, 2))
  declare accrued: number;

  @Column(DataType.DECIMAL(10, 2))
  declare total: number;

  @Column(DataType.DECIMAL(10, 2))
  declare used: number;

  @Column(DataType.DECIMAL(10, 2))
  declare remaining: number;

  @Column(DataType.DECIMAL(10, 2))
  declare carried_forward: number;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @BelongsTo(() => Company)
  declare company: Company;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => LeaveType)
  declare leave_type: LeaveType;
}

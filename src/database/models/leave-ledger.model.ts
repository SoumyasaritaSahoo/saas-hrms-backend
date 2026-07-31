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
import { LeaveRequest } from './leave-request.model';

@Table({
  tableName: 'leave_ledger',
  paranoid: true,
  underscored: true,
})
export class LeaveLedger extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Company)
  @Column(DataType.UUID)
  declare company_id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @ForeignKey(() => LeaveType)
  @Column(DataType.UUID)
  declare leave_type_id: string;

  @ForeignKey(() => LeaveRequest)
  @Column(DataType.UUID)
  declare leave_request_id: string | null;

  @Column({
    type: DataType.ENUM('credit', 'debit', 'carry_forward', 'adjustment'),
  })
  declare transaction_type: string;

  @Column(DataType.DECIMAL(10, 2))
  declare days: number;

  @Column(DataType.DECIMAL(10, 2))
  declare balance_after: number;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Column(DataType.STRING)
  declare accrual_period: string | null;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @Column(DataType.UUID)
  declare created_by: string | null;

  @Column(DataType.UUID)
  declare updated_by: string | null;

  @Column(DataType.UUID)
  declare deleted_by: string | null;

  @BelongsTo(() => Company)
  declare company: Company;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => LeaveType)
  declare leave_type: LeaveType;

  @BelongsTo(() => LeaveRequest)
  declare leave_request: LeaveRequest;
}

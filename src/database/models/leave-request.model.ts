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
import { Holiday } from './holiday.model';

@Table({
  tableName: 'leave_requests',
  paranoid: true,
  underscored: true,
})
export class LeaveRequest extends Model {
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

  @ForeignKey(() => Holiday)
  @Column(DataType.UUID)
  declare optional_holiday_id: string;

  @Column(DataType.DATEONLY)
  declare from_date: string;

  @Column(DataType.DATEONLY)
  declare to_date: string;

  @Column(DataType.DECIMAL(10, 2))
  declare total_days: number;

  @Column(DataType.TEXT)
  declare reason: string;

  @Column({
    type: DataType.ENUM('full_day', 'first_half', 'second_half'),
    defaultValue: 'full_day',
  })
  declare leave_duration: 'full_day' | 'first_half' | 'second_half';

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending',
  })
  declare status: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare reviewed_by: string | null;

  @Column(DataType.DATE)
  declare reviewed_at: Date | null;

  @Column(DataType.TEXT)
  declare reviewer_note: string | null;

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

  @BelongsTo(() => User, 'reviewed_by')
  declare reviewer: User;

  @BelongsTo(() => Holiday)
  declare optional_holiday: Holiday;
}

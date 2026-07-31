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

@Table({
  tableName: 'attendance_shifts',
  paranoid: true,
  underscored: true,
})
export class AttendanceShift extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Company)
  @Column(DataType.UUID)
  declare company_id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.STRING)
  declare code: string;

  @Column(DataType.TIME)
  declare start_time: string;

  @Column(DataType.TIME)
  declare end_time: string;

  @Column(DataType.INTEGER)
  declare break_minutes: number;

  @Column(DataType.DECIMAL(5, 2))
  declare half_day_hours: number;

  @Column(DataType.DECIMAL(5, 2))
  declare full_day_hours: number;

  @Column(DataType.DECIMAL(5, 2))
  declare overtime_after_hours: number;

  @Column(DataType.BOOLEAN)
  declare is_night_shift: boolean;

  @Column(DataType.BOOLEAN)
  declare is_flexible: boolean;

  @Column(DataType.INTEGER)
  declare before_grace_minutes: number;

  @Column(DataType.INTEGER)
  declare after_grace_minutes: number;

  @Column(DataType.STRING)
  declare weekdays: string;

  @Column(DataType.BOOLEAN)
  declare status: boolean;

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

  @BelongsTo(() => User, 'created_by')
  declare creator: User;
}

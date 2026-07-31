import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  BelongsTo,
} from 'sequelize-typescript';

import { Company } from './company.model';

@Table({
  tableName: 'leave_types',
  paranoid: true,
  underscored: true,
})
export class LeaveType extends Model {
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
  declare description: string;

  @Column(DataType.DECIMAL(10, 2))
  declare total_days_per_year: number;

  @Column({
    type: DataType.ENUM('yearly', 'monthly', 'quarterly', 'manual'),
    defaultValue: 'yearly',
  })
  declare accrual_type: string;

  @Column(DataType.DATEONLY)
  declare effective_from: Date | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare can_carry_forward: boolean;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  declare max_carry_forward_days: number;

  @Column(DataType.BOOLEAN)
  declare is_paid: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare requires_approval: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare exclude_holidays: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare supports_optional_holiday: boolean;

  @Column(DataType.BOOLEAN)
  declare status: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at: Date | null;

  @BelongsTo(() => Company)
  declare company: Company;
}

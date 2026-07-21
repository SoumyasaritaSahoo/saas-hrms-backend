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

// NOTE: simplified from the source project. The original User model also
// declared associations to Department, Designation, Role (via UserRole),
// UserCompanyLocation, LeaveBalance, AttendanceShift, UserAddress,
// UserDocument and UserBankAccount — all belonging to feature modules
// explicitly excluded from this auth-only port (department, designation,
// role, location, leave, attendance, plus the address/bank/document
// profile extras). Those `@BelongsTo`/`@HasMany`/`@ForeignKey` decorators
// were dropped so those models never need to be imported; the plain
// `department_id` / `designation_id` / `shift_id` UUID columns are kept
// (nullable, no FK constraint) so the column shape still matches the
// source `users` table if those modules are added back later.
@Table({
  tableName: 'users',
  paranoid: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Company)
  @Column(DataType.UUID)
  declare company_id: string;

  @Column(DataType.STRING(100))
  declare first_name: string;

  @Column(DataType.STRING(100))
  declare middle_name: string | null;

  @Column(DataType.STRING(100))
  declare last_name: string;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return [
        this.getDataValue('first_name'),
        this.getDataValue('middle_name'),
        this.getDataValue('last_name'),
      ]
        .filter(Boolean)
        .join(' ');
    },
  })
  declare full_name: string;

  @Column(DataType.STRING(255))
  declare email: string;

  @Column(DataType.STRING(20))
  declare phone: string | null;

  @Column(DataType.STRING(255))
  declare password: string;

  @Column(DataType.STRING(100))
  declare employee_code: string | null;

  @Column(DataType.DATEONLY)
  declare date_of_birth: string | null;

  @Column({
    type: DataType.ENUM('male', 'female', 'other'),
  })
  declare gender: string | null;

  @Column(DataType.STRING(255))
  declare highest_qualification: string | null;

  @Column(DataType.DECIMAL(4, 1))
  declare experience_years: number | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_married: boolean | null;

  @Column(DataType.STRING(255))
  declare emergency_contact_number: string | null;

  @Column(DataType.STRING(255))
  declare emergency_contact_name: string | null;

  @Column(DataType.STRING(255))
  declare emergency_contact_relation: string | null;

  @Column(DataType.DECIMAL(12, 2))
  declare base_salary: number | null;

  // Plain columns, no FK — see NOTE above.
  @Column(DataType.UUID)
  declare department_id: string | null;

  @Column(DataType.UUID)
  declare designation_id: string | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare manager_id: string | null;

  @Column(DataType.UUID)
  declare shift_id: string | null;

  @Column(DataType.DATEONLY)
  declare joining_date: Date | null;

  @Column({
    type: DataType.ENUM(
      'full_time',
      'part_time',
      'contract',
      'internship',
      'temporary',
    ),
  })
  declare employment_type: string | null;

  @Column({
    type: DataType.ENUM(
      'probation',
      'confirmed',
      'notice_period',
      'resigned',
      'terminated',
    ),
  })
  declare employment_status: string | null;

  @Column({
    type: DataType.ENUM('on_site', 'remote', 'hybrid'),
  })
  declare work_mode: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare status: boolean;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare profile_picture: string | null;

  @Column(DataType.DATE)
  declare last_login_at: Date | null;

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

  // Relations

  @BelongsTo(() => Company)
  declare company: Company;

  @BelongsTo(() => User, 'manager_id')
  declare manager: User;

  @HasMany(() => User, 'manager_id')
  declare team_members: User[];
}

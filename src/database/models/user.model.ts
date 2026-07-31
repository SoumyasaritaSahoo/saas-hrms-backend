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
import { Department } from './department.model';
import { Designation } from './designation.model';
import { Role } from './role.model';
import { UserRole } from './user-role.model';
import { UserCompanyLocation } from './user-company-location.model';
import { LeaveBalance } from './leave-balance.model';
import { AttendanceShift } from './attendance-shift.model';
import { UserAddress } from './user-address.model';
import { UserDocument } from './user-document.model';
import { UserBankAccount } from './user-bank-account.model';

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

  @ForeignKey(() => Department)
  @Column(DataType.UUID)
  declare department_id: string | null;

  @ForeignKey(() => Designation)
  @Column(DataType.UUID)
  declare designation_id: string | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare manager_id: string | null;

  @ForeignKey(() => AttendanceShift)
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

  @BelongsTo(() => Department)
  declare department: Department;

  @BelongsTo(() => Designation)
  declare designation: Designation;

  @BelongsTo(() => User, 'manager_id')
  declare manager: User;

  @BelongsTo(() => AttendanceShift)
  declare shift: AttendanceShift;

  @HasMany(() => User, 'manager_id')
  declare team_members: User[];

  @BelongsToMany(() => Role, () => UserRole)
  declare roles: Role[];

  @HasMany(() => UserCompanyLocation)
  declare user_company_locations: UserCompanyLocation[];

  @HasMany(() => LeaveBalance)
  declare leave_balances: LeaveBalance[];

  @HasMany(() => UserAddress)
  declare addresses: UserAddress[];

  @HasMany(() => UserDocument)
  declare documents: UserDocument[];

  @HasMany(() => UserBankAccount)
  declare bank_accounts: UserBankAccount[];
}

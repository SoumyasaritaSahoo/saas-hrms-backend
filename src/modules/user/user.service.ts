import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Op } from 'sequelize';
import { join } from 'path';
import { unlink } from 'fs';
import { UserRole } from '../../database/models/user-role.model';
import { User } from '../../database/models/user.model';
import { SaasUser } from '../../database/models/saas/saas-user.model';
import { MailService } from '../mail/mail.service';
import { Role } from 'src/database/models/role.model';
import { RolePermission } from 'src/database/models/role-permission.model';
import { Permission } from 'src/database/models/permission.model';
import { PermissionGroup } from 'src/database/models/permission-group.model';
import { Company } from 'src/database/models/company.model';
import { Department } from 'src/database/models/department.model';
import { Designation } from 'src/database/models/designation.model';
import { UserCompanyLocation } from 'src/database/models/user-company-location.model';
import { UserAddress } from 'src/database/models/user-address.model';
import { UserBankAccount } from 'src/database/models/user-bank-account.model';
import { UserDocument } from 'src/database/models/user-document.model';
import { Location } from 'src/database/models/location.model';
import { AttendanceShift } from 'src/database/models/attendance-shift.model';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailVerification } from 'src/database/models/email-verification.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { LeaveBalanceService } from '../leave/leave-balance.service';
import { AuditService } from '../audit/audit.service';
import { StorageService } from '../storage/storage.service';

export interface OnboardUserParams {
  company_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone?: string | null;
  password: string;
  profile_picture?: string | null;
  employee_code: string;
}

// NOTE: `createForCompany`/`getAdminProfile`/`updateAdminProfile` below are
// intentionally left exactly as they were in the auth-only port.
// `createForCompany` backs CompanyService.create() (the company
// registration bootstrap flow) and `getAdminProfile`/`updateAdminProfile`
// back the SaaS-platform-admin's own profile — neither is part of Employee
// management, so per the porting brief they were not touched here (the
// source's fuller createForCompany also assigns department_id/
// designation_id/role_id/location_id, but the calling company-onboarding
// wizard that would supply those was excluded from this backend before
// this port and stays excluded).
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(SaasUser)
    private readonly saasUserModel: typeof SaasUser,
    @InjectModel(UserRole)
    private readonly userRoleModel: typeof UserRole,
    @InjectModel(UserAddress)
    private readonly userAddressModel: typeof UserAddress,
    @InjectModel(UserBankAccount)
    private readonly userBankAccountModel: typeof UserBankAccount,
    @InjectModel(UserDocument)
    private readonly userDocumentModel: typeof UserDocument,
    @InjectModel(EmailVerification)
    private readonly emailVerificationModel: typeof EmailVerification,
    private readonly mailService: MailService,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly auditService: AuditService,
    private readonly storageService: StorageService,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userModel.findByPk(userId, {
      include: this.userIncludes(),
      attributes: { exclude: ['password', 'deleted_at', 'deleted_by'] },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException('User not found');

    const updates: any = {};
    if (dto.first_name !== undefined) updates.first_name = dto.first_name;
    if (dto.middle_name !== undefined) updates.middle_name = dto.middle_name;
    if (dto.last_name !== undefined) updates.last_name = dto.last_name;
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.date_of_birth !== undefined)
      updates.date_of_birth = dto.date_of_birth;
    if (dto.gender !== undefined) updates.gender = dto.gender;
    if (dto.highest_qualification !== undefined)
      updates.highest_qualification = dto.highest_qualification;
    if (dto.experience_years !== undefined)
      updates.experience_years = dto.experience_years;
    if (dto.is_married !== undefined) updates.is_married = dto.is_married;
    if (dto.emergency_contact_number !== undefined)
      updates.emergency_contact_number = dto.emergency_contact_number;
    if (dto.emergency_contact_name !== undefined)
      updates.emergency_contact_name = dto.emergency_contact_name;
    if (dto.emergency_contact_relation !== undefined)
      updates.emergency_contact_relation = dto.emergency_contact_relation;
    await user.update(updates);

    await this.upsertUserAddresses(userId, dto);
    await this.upsertUserBankAccount(userId, dto);

    return this.getUserProfile(userId);
  }

  async updateProfilePicture(userId: string, file: Express.Multer.File) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.storageService.delete(user.profile_picture);

    const path = await this.storageService.save(
      file.buffer,
      file.originalname,
      'profile-pictures',
    );
    user.profile_picture = path;
    await user.save();

    return this.getUserProfile(userId);
  }

  async removeProfilePicture(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.storageService.delete(user.profile_picture);
    user.profile_picture = null;
    await user.save();

    return this.getUserProfile(userId);
  }

  async getAdminProfile(userId: string) {
    const user = await this.saasUserModel.findByPk(userId, {
      attributes: { exclude: ['password', 'deleted_at', 'deleted_by'] },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateAdminProfile(userId: string, data: Partial<SaasUser>) {
    const user = await this.saasUserModel.findByPk(userId);
    if (!user) throw new NotFoundException('User not found');
    await user.update(data);
    return this.getAdminProfile(userId);
  }

  async createForCompany(params: OnboardUserParams) {
    const existingUser = await this.userModel.findOne({
      where: { email: params.email },
      paranoid: false,
    });

    const hashedPassword = await bcrypt.hash(params.password, 10);

    let user: User;

    if (existingUser) {
      await existingUser.restore();
      existingUser.password = hashedPassword;
      existingUser.employee_code = params.employee_code;
      await existingUser.save();
      user = existingUser;
    } else {
      user = await this.userModel.create({
        company_id: params.company_id,
        first_name: params.first_name,
        middle_name: params.middle_name ?? null,
        last_name: params.last_name,
        email: params.email,
        phone: params.phone ?? null,
        password: hashedPassword,
        profile_picture: params.profile_picture ?? null,
        employee_code: params.employee_code,
        manager_id: null,
        joining_date: null,
        status: true,
        last_login_at: null,
      });
    }

    return user;
  }

  private userIncludes() {
    return [
      { model: Company },
      { model: Department },
      { model: Designation },
      { model: User, as: 'manager' },
      { model: AttendanceShift, as: 'shift', required: false },
      {
        model: Role,
        through: { attributes: [] },
        include: [
          {
            model: RolePermission,
            include: [
              {
                model: Permission,
                include: [{ model: PermissionGroup }],
              },
            ],
          },
        ],
      },
      {
        model: UserCompanyLocation,
        required: false,
        include: [{ model: Location }],
      },
      {
        model: UserAddress,
        as: 'addresses',
        required: false,
      },
      {
        model: UserBankAccount,
        as: 'bank_accounts',
        required: false,
      },
      {
        model: UserDocument,
        as: 'documents',
        required: false,
      },
    ];
  }

  private async resolveEmployeeScope(
    callerId: string,
    callerPermissions: string[],
    clientManagerId?: string,
  ): Promise<{
    managerId?: string;
    teamScope?: boolean;
    callerManagerId?: string | null;
  }> {
    // When caller passes their own ID as manager_id, treat it as a
    // team-scope request — include the caller + their org tree.
    if (clientManagerId === callerId) {
      if (callerPermissions.includes('employees.view-team')) {
        const caller = await this.userModel.findByPk(callerId, {
          attributes: ['manager_id'],
        });
        return { teamScope: true, callerManagerId: caller?.manager_id ?? null };
      }
      return { managerId: callerId };
    }
    if (callerPermissions.includes('employees.view')) {
      return { managerId: clientManagerId };
    }
    if (callerPermissions.includes('employees.view-team')) {
      const caller = await this.userModel.findByPk(callerId, {
        attributes: ['manager_id'],
      });
      return { teamScope: true, callerManagerId: caller?.manager_id ?? null };
    }
    throw new ForbiddenException(
      'You do not have permission to view employees',
    );
  }

  async findAllUsers(
    companyId: string,
    callerId: string,
    callerPermissions: string[],
    page: number = 1,
    limit: number = 10,
    search?: string,
    departmentId?: string,
    designationId?: string,
    roleId?: string,
    managerId?: string,
    status?: boolean,
  ) {
    const offset = (page - 1) * limit;

    const scope = await this.resolveEmployeeScope(
      callerId,
      callerPermissions,
      managerId,
    );

    const where: any = { company_id: companyId };
    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }
    if (departmentId) where.department_id = departmentId;
    if (designationId) where.designation_id = designationId;
    if (scope.teamScope) {
      const teamOr: any[] = [{ id: callerId }];
      if (scope.callerManagerId) {
        teamOr.push({ manager_id: scope.callerManagerId });
        teamOr.push({ id: scope.callerManagerId });
      }
      teamOr.push({ manager_id: callerId });
      andConditions.push({ [Op.or]: teamOr });
    } else if (scope.managerId) {
      if (scope.managerId === callerId) {
        andConditions.push({
          [Op.or]: [{ id: callerId }, { manager_id: callerId }],
        });
      } else {
        where.manager_id = scope.managerId;
      }
    }
    if (status !== undefined) where.status = status;

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const includes: any[] = this.userIncludes().map((inc: any) => {
      if (inc.model === Role && roleId) {
        return { ...inc, where: { id: roleId }, required: true };
      }
      return inc;
    });

    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: includes,
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  async findOneUser(id: string) {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: this.userIncludes(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Every by-ID mutation below previously trusted the :id param with no
  // tenant check at all — any authenticated user could read/update/delete
  // a user record from ANY company just by guessing/enumerating a UUID.
  // This enforces the company boundary; reported as "not found" rather
  // than "forbidden" so cross-tenant lookups don't confirm a record exists.
  private assertSameCompany(
    target: User | null,
    companyId: string,
  ): asserts target is User {
    if (!target || target.company_id !== companyId) {
      throw new NotFoundException('User not found');
    }
  }

  private assertEmployeeInScope(
    target: User,
    callerId: string,
    callerPermissions: string[],
    callerManagerId: string | null | undefined,
    fullPermissions: string[],
    teamPermission: string,
  ) {
    if (fullPermissions.some((p) => callerPermissions.includes(p))) return;

    if (
      callerPermissions.includes(teamPermission) &&
      (target.manager_id === callerId ||
        target.id === callerId ||
        (callerManagerId && target.manager_id === callerManagerId) ||
        (callerManagerId && target.id === callerManagerId))
    ) {
      return;
    }

    throw new ForbiddenException(
      'You do not have permission to access this employee',
    );
  }

  async getEmployeeById(
    id: string,
    companyId: string,
    callerId: string,
    callerPermissions: string[],
  ) {
    const user = await this.findOneUser(id);
    this.assertSameCompany(user, companyId);

    const caller = await this.userModel.findByPk(callerId, {
      attributes: ['manager_id'],
    });

    this.assertEmployeeInScope(
      user,
      callerId,
      callerPermissions,
      caller?.manager_id ?? null,
      ['employees.view', 'employees.view-details'],
      'employees.view-team',
    );
    return user;
  }

  private async generateEmployeeCode(companyId: string): Promise<string> {
    const company = await Company.findByPk(companyId, {
      attributes: ['name'],
    });
    const companyName = company?.name ?? 'EMP';
    const initials = companyName
      .replace(/[^a-zA-Z\s]/g, '')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .join('')
      .slice(0, 4);

    const count = await this.userModel.count({
      where: { company_id: companyId },
      paranoid: false,
    });

    return `${initials}-${count + 1}`;
  }

  async createUser(companyId: string, userId: string, dto: CreateUserDto) {
    const existing = await this.userModel.findOne({
      where: { email: dto.email, company_id: companyId },
      paranoid: false,
    });
    if (existing) throw new BadRequestException('User already exists');

    const rawPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const employeeCode = await this.generateEmployeeCode(companyId);

    const user = await this.userModel.create({
      company_id: companyId,
      first_name: dto.first_name,
      middle_name: dto.middle_name ?? null,
      last_name: dto.last_name,
      email: dto.email,
      phone: dto.phone ?? null,
      password: hashedPassword,
      employee_code: employeeCode,
      department_id: dto.department_id,
      designation_id: dto.designation_id,
      manager_id: dto.manager_id ?? null,
      joining_date: dto.joining_date,
      shift_id: dto.shift_id ?? null,
      status: dto.status ?? true,
      date_of_birth: dto.date_of_birth ?? null,
      gender: dto.gender ?? null,
      highest_qualification: dto.highest_qualification ?? null,
      experience_years: dto.experience_years ?? null,
      is_married: dto.is_married ?? false,
      emergency_contact_number: dto.emergency_contact_number ?? null,
      emergency_contact_name: dto.emergency_contact_name ?? null,
      emergency_contact_relation: dto.emergency_contact_relation ?? null,
      base_salary: dto.base_salary ?? null,
      employment_type: dto.employment_type ?? null,
      employment_status: dto.employment_status ?? null,
      work_mode: dto.work_mode ?? null,
    });

    await this.userRoleModel.create({
      company_id: companyId,
      user_id: user.id,
      role_id: dto.role_id,
    });

    await UserCompanyLocation.create({
      user_id: user.id,
      location_id: dto.location_id,
      is_primary: true,
    });

    await this.leaveBalanceService.initializeUserBalances(
      companyId,
      user.id,
      new Date(dto.joining_date),
    );

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await this.emailVerificationModel.create({
      user_id: user.id,
      type: 'password_reset',
      hashed_token: tokenHash,
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    });

    const resetUrl = `${process.env.FRONTEND_URL}/en/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.full_name,
      resetUrl,
    );

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Created user',
      resourceType: 'User',
      resourceId: user.id,
      newValues: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
      },
    });

    return this.findOneUser(user.id);
  }

  private async upsertUserAddresses(
    userId: string,
    dto: {
      current_address_line_1?: string;
      current_address_line_2?: string;
      current_city?: string;
      current_state?: string;
      current_pincode?: string;
      current_country?: string;
      permanent_address_line_1?: string;
      permanent_address_line_2?: string;
      permanent_city?: string;
      permanent_state?: string;
      permanent_pincode?: string;
      permanent_country?: string;
    },
  ) {
    const hasCurrentAddress = [
      dto.current_address_line_1,
      dto.current_address_line_2,
      dto.current_city,
      dto.current_state,
      dto.current_pincode,
      dto.current_country,
    ].some((v) => v !== undefined);

    if (hasCurrentAddress) {
      await this.userAddressModel.destroy({
        where: { user_id: userId, type: 'current' },
        force: true,
      });
      await this.userAddressModel.create({
        user_id: userId,
        type: 'current',
        address_line_1: dto.current_address_line_1 ?? null,
        address_line_2: dto.current_address_line_2 ?? null,
        city: dto.current_city ?? null,
        state: dto.current_state ?? null,
        pincode: dto.current_pincode ?? null,
        country: dto.current_country ?? null,
      });
    }

    const hasPermanentAddress = [
      dto.permanent_address_line_1,
      dto.permanent_address_line_2,
      dto.permanent_city,
      dto.permanent_state,
      dto.permanent_pincode,
      dto.permanent_country,
    ].some((v) => v !== undefined);

    if (hasPermanentAddress) {
      await this.userAddressModel.destroy({
        where: { user_id: userId, type: 'permanent' },
        force: true,
      });
      await this.userAddressModel.create({
        user_id: userId,
        type: 'permanent',
        address_line_1: dto.permanent_address_line_1 ?? null,
        address_line_2: dto.permanent_address_line_2 ?? null,
        city: dto.permanent_city ?? null,
        state: dto.permanent_state ?? null,
        pincode: dto.permanent_pincode ?? null,
        country: dto.permanent_country ?? null,
      });
    }
  }

  private async upsertUserBankAccount(
    userId: string,
    dto: {
      bank_name?: string;
      account_holder_name?: string;
      account_number?: string;
      ifsc_code?: string;
      branch_name?: string;
    },
  ) {
    const hasBankAccount = [
      dto.bank_name,
      dto.account_holder_name,
      dto.account_number,
      dto.ifsc_code,
      dto.branch_name,
    ].some((v) => v !== undefined);

    if (hasBankAccount) {
      await this.userBankAccountModel.destroy({
        where: { user_id: userId },
        force: true,
      });
      await this.userBankAccountModel.create({
        user_id: userId,
        bank_name: dto.bank_name ?? null,
        account_holder_name: dto.account_holder_name ?? null,
        account_number: dto.account_number ?? null,
        ifsc_code: dto.ifsc_code ?? null,
        branch_name: dto.branch_name ?? null,
      });
    }
  }

  async updateUser(
    id: string,
    companyId: string,
    userId: string,
    dto: UpdateUserDto,
  ) {
    const user = await this.userModel.findByPk(id);
    this.assertSameCompany(user, companyId);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel.findOne({
        where: {
          email: dto.email,
          company_id: user.company_id,
          id: { [Op.ne]: id },
        },
        paranoid: false,
      });
      if (existing) throw new BadRequestException('Email already in use');
    }

    const updates: any = {};
    if (dto.first_name !== undefined) updates.first_name = dto.first_name;
    if (dto.middle_name !== undefined) updates.middle_name = dto.middle_name;
    if (dto.last_name !== undefined) updates.last_name = dto.last_name;
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.department_id !== undefined)
      updates.department_id = dto.department_id;
    if (dto.designation_id !== undefined)
      updates.designation_id = dto.designation_id;
    if (dto.manager_id !== undefined) updates.manager_id = dto.manager_id;
    if (dto.joining_date !== undefined) updates.joining_date = dto.joining_date;
    if (dto.shift_id !== undefined) updates.shift_id = dto.shift_id ?? null;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.date_of_birth !== undefined)
      updates.date_of_birth = dto.date_of_birth;
    if (dto.gender !== undefined) updates.gender = dto.gender;
    if (dto.highest_qualification !== undefined)
      updates.highest_qualification = dto.highest_qualification;
    if (dto.experience_years !== undefined)
      updates.experience_years = dto.experience_years;
    if (dto.is_married !== undefined) updates.is_married = dto.is_married;
    if (dto.emergency_contact_number !== undefined)
      updates.emergency_contact_number = dto.emergency_contact_number;
    if (dto.emergency_contact_name !== undefined)
      updates.emergency_contact_name = dto.emergency_contact_name;
    if (dto.emergency_contact_relation !== undefined)
      updates.emergency_contact_relation = dto.emergency_contact_relation;
    if (dto.base_salary !== undefined) updates.base_salary = dto.base_salary;
    if (dto.employment_type !== undefined)
      updates.employment_type = dto.employment_type;
    if (dto.employment_status !== undefined)
      updates.employment_status = dto.employment_status;
    if (dto.work_mode !== undefined) updates.work_mode = dto.work_mode;

    const shouldInitLeaveBalances = !user.joining_date && !!dto.joining_date;

    await user.update(updates);

    // if (shouldInitLeaveBalances) {
    //   await this.leaveBalanceService.initializeUserBalances(
    //     companyId,
    //     id,
    //     new Date(dto.joining_date as string),
    //   );
    // }

    if (dto.role_id) {
      await this.userRoleModel.destroy({
        where: { user_id: id },
        force: true,
      });
      await this.userRoleModel.create({
        company_id: user.company_id,
        user_id: id,
        role_id: dto.role_id,
      });
    }

    if (dto.location_id) {
      await UserCompanyLocation.destroy({
        where: { user_id: id },
        force: true,
      });
      await UserCompanyLocation.create({
        user_id: id,
        location_id: dto.location_id,
        is_primary: true,
      });
    }

    await this.upsertUserAddresses(id, dto);
    await this.upsertUserBankAccount(id, dto);

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Updated user',
      resourceType: 'User',
      resourceId: id,
      newValues: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        department_id: dto.department_id,
        designation_id: dto.designation_id,
      },
    });

    return this.findOneUser(id);
  }

  private static readonly DOCUMENT_TYPES = [
    'identity_proof',
    'experience_letter',
    'medical_certificate',
    'other',
  ];

  async addUserDocuments(
    id: string,
    companyId: string,
    items: { type: string; title?: string | null; file_path: string }[],
  ) {
    const user = await this.userModel.findByPk(id);
    this.assertSameCompany(user, companyId);

    for (const item of items) {
      if (!UserService.DOCUMENT_TYPES.includes(item.type)) {
        throw new BadRequestException(`Invalid document type: ${item.type}`);
      }
    }

    await this.userDocumentModel.bulkCreate(
      items.map((item) => ({
        user_id: id,
        type: item.type,
        title: item.title ?? null,
        file_path: item.file_path,
      })),
    );

    return this.findOneUser(id);
  }

  async removeUserDocument(id: string, companyId: string, documentId: string) {
    const user = await this.userModel.findByPk(id);
    this.assertSameCompany(user, companyId);

    const document = await this.userDocumentModel.findOne({
      where: { id: documentId, user_id: id },
    });
    if (!document) throw new NotFoundException('Document not found');

    if (document.file_path) {
      const absolutePath = join(process.cwd(), 'public', document.file_path);
      unlink(absolutePath, () => {});
    }

    await document.destroy();

    return this.findOneUser(id);
  }

  async updateUserDocument(
    id: string,
    companyId: string,
    documentId: string,
    updates: { type?: string; title?: string | null },
  ) {
    const user = await this.userModel.findByPk(id);
    this.assertSameCompany(user, companyId);

    const document = await this.userDocumentModel.findOne({
      where: { id: documentId, user_id: id },
    });
    if (!document) throw new NotFoundException('Document not found');

    if (
      updates.type !== undefined &&
      !UserService.DOCUMENT_TYPES.includes(updates.type)
    ) {
      throw new BadRequestException(`Invalid document type: ${updates.type}`);
    }

    if (updates.type !== undefined) document.type = updates.type;
    if (updates.title !== undefined) document.title = updates.title;
    await document.save();

    return this.findOneUser(id);
  }

  async removeUser(id: string, companyId: string, userId: string) {
    const user = await this.userModel.findByPk(id);
    this.assertSameCompany(user, companyId);

    const managedUsers = await this.userModel.count({
      where: { manager_id: id },
    });
    if (managedUsers > 0) {
      throw new BadRequestException(
        'Cannot delete user who is a manager of other users. Please reassign the team members first.',
      );
    }

    await user.save();
    await user.destroy();

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Deleted user',
      resourceType: 'User',
      resourceId: id,
    });
  }

  async getAllUsers(
    companyId: string,
    callerId: string,
    callerPermissions: string[],
  ) {
    const scope = await this.resolveEmployeeScope(callerId, callerPermissions);

    const where: any = { company_id: companyId };
    if (scope.teamScope) {
      const teamOr: any[] = [{ id: callerId }];
      if (scope.callerManagerId) {
        teamOr.push({ manager_id: scope.callerManagerId });
        teamOr.push({ id: scope.callerManagerId });
      }
      teamOr.push({ manager_id: callerId });
      where[Op.or] = teamOr;
    } else if (scope.managerId) {
      where.manager_id = scope.managerId;
    }

    const users = await this.userModel.findAll({
      where,
      attributes: { exclude: ['password'] },
    });

    return users;
  }
}

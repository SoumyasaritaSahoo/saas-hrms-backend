import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Company } from '../../database/models/company.model';
import { User } from '../../database/models/user.model';
import { SaasUser } from '../../database/models/saas/saas-user.model';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

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

// NOTE: heavily simplified from the source project. The original
// UserService also handled: employee CRUD scoped by manager/permissions
// (findAllUsers/findOneUser/createUser/updateUser/removeUser), SaaS admin
// user CRUD with role assignment (findAllSaasUsers/createSaasUser/...),
// profile picture upload/removal via StorageService, and address/bank
// account/document upserts. All of that depended on Department,
// Designation, Role, UserRole, UserCompanyLocation, Location,
// UserAddress, UserBankAccount, UserDocument models plus
// MailModule/LeaveModule/StorageModule/PermissionModule/AuditModule —
// none of which are needed for authentication itself, and all excluded
// per the auth-only port. What remains is: the profile lookup used by
// AuthService.register() and the self/admin profile endpoints.
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(SaasUser)
    private readonly saasUserModel: typeof SaasUser,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userModel.findByPk(userId, {
      include: [{ model: Company }],
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
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Company } from '../../database/models/company.model';
import { User } from '../../database/models/user.model';
import { Industry } from '../../database/models/industry.model';
import { getIndustryLabel } from '../../common/helpers/helper';
import { CompanyMeta } from '../../database/models/company-meta.model';
import { UserService } from '../user/user.service';
import { CompanyMetaService } from './company-meta.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyMetaKeys } from 'src/common/constants/company-meta-keys.constant';

export interface RegistrationData {
  companyName: string;
  emailDomain: string;
  user: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email: string;
    password: string;
  };
}

// NOTE: heavily simplified from the source project. The original
// CompanyService also had:
//   - create() — a full company "onboarding wizard" that created a
//     LocationType, Location, Department, Designation and Role alongside
//     the Company, plus default leave types and an attendance shift.
//   - updateLogo() / removeLogo() — backed by StorageService.
//   - auditService.log(...) calls on every mutation.
// All of that depended on the location, location-type, department,
// designation, role, leave, attendance, storage and audit feature modules,
// which are explicitly out of scope for this auth-only port. What's left
// here — createForRegistration() (used by AuthService.register()) and
// findAll/findOne/update() (basic company read/update) — only needs
// Industry, Company, CompanyMeta and UserService.
@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company)
    private readonly companyModel: typeof Company,
    @InjectModel(Industry)
    private readonly industryModel: typeof Industry,
    private readonly userService: UserService,
    private readonly companyMetaService: CompanyMetaService,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    const where: any = { deleted_at: null };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email_domain: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await this.companyModel.findAndCountAll({
      where,
      include: [{ model: Industry, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const data = rows.map((company) => {
      const json = company.toJSON();
      if (json.industry) {
        json.industry = {
          ...json.industry,
          label: getIndustryLabel(json.industry.name),
        };
      }
      return json;
    });

    return {
      data,
      meta: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string) {
    const company = await this.companyModel.findByPk(id, {
      include: [
        { model: Industry, attributes: ['id', 'name'] },
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email', 'status'],
        },
        { model: CompanyMeta, attributes: ['meta_key', 'meta_value'] },
      ],
    });

    if (!company) throw new NotFoundException('Company not found');

    const result = company.toJSON();
    if (result.industry) {
      result.industry = {
        ...result.industry,
        label: getIndustryLabel(result.industry.name),
      };
    }

    if (result.meta) {
      result.meta = Object.fromEntries(
        (result.meta as any[]).map((m: any) => [m.meta_key, m.meta_value]),
      );
    }

    return result;
  }

  async createForRegistration(data: RegistrationData) {
    const industry = await Industry.findOne();
    if (!industry) {
      throw new Error('No industries configured in the system');
    }

    const domainToCheck = data.emailDomain.replace(/^@/, '');
    const existingCompany = await this.companyModel.findOne({
      where: {
        [Op.or]: [
          { email_domain: domainToCheck },
          { email_domain: `@${domainToCheck}` },
        ],
      },
      paranoid: false,
    });

    if (existingCompany) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: 'Your company is already registered.',
        error_code: 'COMPANY_ALREADY_EXISTS',
      });
    }

    const [company] = await Company.findOrCreate({
      where: { email_domain: data.emailDomain },
      defaults: {
        industry_id: industry.id,
        name: data.companyName,
        email_domain: data.emailDomain,
        country: 'India',
        currency: 'INR',
        status: true,
      },
    });

    const existingCount = await User.count({
      where: { company_id: company.id },
      paranoid: false,
    });

    const companyPrefix = data.companyName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase();
    const employeeCode = `${companyPrefix}-${existingCount + 1}`;

    const user = await this.userService.createForCompany({
      company_id: company.id,
      first_name: data.user.first_name,
      middle_name: data.user.middle_name ?? null,
      last_name: data.user.last_name,
      email: data.user.email,
      phone: null,
      password: data.user.password,
      profile_picture: null,
      employee_code: employeeCode,
    });

    await this.createDefaultMeta(company.id);

    return { company, user };
  }

  async update(id: string, dto: UpdateCompanyDto, updatedBy?: string) {
    const company = await this.companyModel.findByPk(id);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const {
      financial_year_start_month,
      financial_year_end_month,
      working_week_days,
      company_size,
      ...companyFields
    } = dto;

    const updates: any = { ...companyFields };
    if (updatedBy) {
      updates.updated_by = updatedBy;
    }

    await company.update(updates);

    if (financial_year_start_month !== undefined) {
      await this.companyMetaService.createOrUpdate(
        id,
        CompanyMetaKeys.FINANCIAL_YEAR_START_MONTH,
        String(financial_year_start_month),
      );
    }

    if (financial_year_end_month !== undefined) {
      await this.companyMetaService.createOrUpdate(
        id,
        CompanyMetaKeys.FINANCIAL_YEAR_END_MONTH,
        String(financial_year_end_month),
      );
    }

    if (working_week_days !== undefined) {
      await this.companyMetaService.createOrUpdate(
        id,
        'working_week_days',
        working_week_days,
      );
    }

    if (company_size !== undefined) {
      await this.companyMetaService.createOrUpdate(
        id,
        CompanyMetaKeys.COMPANY_SIZE,
        company_size,
      );
    }

    return await this.findOne(id);
  }

  private async createDefaultMeta(companyId: string) {
    await Promise.all([
      this.companyMetaService.create(
        companyId,
        CompanyMetaKeys.FINANCIAL_YEAR_START_MONTH,
        '1',
      ),
      this.companyMetaService.create(
        companyId,
        CompanyMetaKeys.FINANCIAL_YEAR_END_MONTH,
        '12',
      ),
      this.companyMetaService.create(
        companyId,
        CompanyMetaKeys.WORKING_WEEK_DAYS,
        '1,2,3,4,5',
      ),
    ]);
  }
}

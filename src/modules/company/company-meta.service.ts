import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CompanyMeta } from '../../database/models/company-meta.model';
import { CompanyMetaKeys } from 'src/common/constants/company-meta-keys.constant';

@Injectable()
export class CompanyMetaService {
  constructor(
    @InjectModel(CompanyMeta)
    private readonly companyMetaModel: typeof CompanyMeta,
  ) {}

  async create(companyId: string, metaKey: string, metaValue: string) {
    return this.companyMetaModel.create({
      company_id: companyId,
      meta_key: metaKey,
      meta_value: metaValue,
    });
  }

  async get(companyId: string, metaKey: string): Promise<string | null> {
    const entry = await this.companyMetaModel.findOne({
      where: {
        company_id: companyId,
        meta_key: metaKey,
      },
    });

    return entry?.meta_value ?? null;
  }

  async update(companyId: string, metaKey: string, metaValue: string) {
    const entry = await this.findOneOrFail(companyId, metaKey);
    entry.meta_value = metaValue;
    await entry.save();
    return entry;
  }

  async createOrUpdate(companyId: string, metaKey: string, metaValue: string) {
    const existing = await this.companyMetaModel.findOne({
      where: { company_id: companyId, meta_key: metaKey },
    });
    if (existing) {
      existing.meta_value = metaValue;
      return existing.save();
    }
    return this.companyMetaModel.create({
      company_id: companyId,
      meta_key: metaKey,
      meta_value: metaValue,
    });
  }

  private async findOneOrFail(companyId: string, metaKey: string) {
    const entry = await this.companyMetaModel.findOne({
      where: { company_id: companyId, meta_key: metaKey },
    });
    if (!entry) {
      throw new NotFoundException('Company meta not found');
    }
    return entry;
  }

  async getWorkingWeekDays(companyId: string): Promise<number[]> {
    const value = await this.get(companyId, CompanyMetaKeys.WORKING_WEEK_DAYS);

    if (!value) {
      return [1, 2, 3, 4, 5];
    }

    return value
      .split(',')
      .map(Number)
      .filter((v) => !Number.isNaN(v));
  }

  async getFinancialYear(companyId: string) {
    const start = await this.get(
      companyId,
      CompanyMetaKeys.FINANCIAL_YEAR_START_MONTH,
    );

    const end = await this.get(
      companyId,
      CompanyMetaKeys.FINANCIAL_YEAR_END_MONTH,
    );

    return {
      startMonth: Number(start ?? 1),
      endMonth: Number(end ?? 12),
    };
  }

  async getFinancialYearFromDate(
    companyId: string,
    date: Date,
  ): Promise<number> {
    const configuredStartMonth = await this.get(
      companyId,
      CompanyMetaKeys.FINANCIAL_YEAR_START_MONTH,
    );
    const startMonth = Number(configuredStartMonth ?? 1);

    const month = date.getMonth() + 1;

    return month >= startMonth ? date.getFullYear() : date.getFullYear() - 1;
  }
}

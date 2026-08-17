import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';

import { LeaveLedger } from '../../database/models/leave-ledger.model';

import { LeaveTransactionType } from '../../common/constants/leave-transaction-type.constant';
import { LeaveType } from 'src/database/models/leave-type.model';
import { LeaveBalance } from 'src/database/models/leave-balance.model';
import { LeaveLedgerService } from './leave-ledger.service';
import { User } from 'src/database/models/user.model';
import { LeaveRequest } from 'src/database/models/leave-request.model';
import { CompanyMetaService } from '../company/company-meta.service';
import { ManualLeaveAdjustmentDto } from './dto/manual-leave-adjustment.dto';

@Injectable()
export class LeaveBalanceService {
  constructor(
    @InjectModel(LeaveType)
    private readonly leaveTypeModel: typeof LeaveType,
    @InjectModel(LeaveBalance)
    private readonly leaveBalanceModel: typeof LeaveBalance,
    private readonly leaveLedgerService: LeaveLedgerService,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(LeaveLedger)
    private readonly leaveLedgerModel: typeof LeaveLedger,
    private readonly companyMetaService: CompanyMetaService,
  ) {}

  async initializeUserBalances(
    companyId: string,
    userId: string,
    joiningDate: Date,
  ) {
    const today = new Date();
    const year = await this.companyMetaService.getFinancialYearFromDate(
      companyId,
      today,
    );
    const { startMonth } =
      await this.companyMetaService.getFinancialYear(companyId);

    const leaveTypes = await this.leaveTypeModel.findAll({
      where: {
        company_id: companyId,
        status: true,
      },
    });

    for (const leaveType of leaveTypes) {
      const entitlement = this.calculateInitialEntitlement(
        leaveType,
        joiningDate,
        year,
        startMonth,
        today,
      );

      await this.leaveBalanceModel.create({
        company_id: companyId,
        user_id: userId,
        leave_type_id: leaveType.id,

        year,

        opening_balance: 0,
        accrued: entitlement,

        total: entitlement,
        used: 0,
        remaining: entitlement,

        carried_forward: 0,
      });
    }
  }

  private calculateInitialEntitlement(
    leaveType: LeaveType,
    joiningDate: Date,
    leaveYear: number,
    financialYearStartMonth: number,
    asOfDate: Date,
  ): number {
    const annualDays = Number(leaveType.total_days_per_year);
    const entitlementStartDate = this.getEntitlementStartDate(
      leaveType,
      joiningDate,
      leaveYear,
      financialYearStartMonth,
    );

    if (asOfDate < entitlementStartDate) {
      return 0;
    }

    const startMonthOffset = this.getMonthOffset(
      entitlementStartDate,
      leaveYear,
      financialYearStartMonth,
    );
    const asOfMonthOffset = this.getMonthOffset(
      asOfDate,
      leaveYear,
      financialYearStartMonth,
    );

    switch (leaveType.accrual_type) {
      case 'monthly':
        return this.calculateMonthlyAccrued(
          annualDays,
          startMonthOffset,
          asOfMonthOffset,
        );

      case 'quarterly':
        return this.calculateQuarterlyAccrued(
          annualDays,
          entitlementStartDate,
          asOfDate,
          financialYearStartMonth,
        );

      case 'yearly':
        return this.calculateYearlyProrated(annualDays, startMonthOffset);

      case 'manual':
        return 0;

      default:
        return 0;
    }
  }

  private getEntitlementStartDate(
    leaveType: LeaveType,
    joiningDate: Date,
    leaveYear: number,
    financialYearStartMonth: number,
  ): Date {
    const yearStart = new Date(leaveYear, financialYearStartMonth - 1, 1);
    const effectiveFrom = leaveType.effective_from
      ? new Date(leaveType.effective_from)
      : yearStart;

    return new Date(
      Math.max(
        this.startOfDay(yearStart).getTime(),
        this.startOfDay(joiningDate).getTime(),
        this.startOfDay(effectiveFrom).getTime(),
      ),
    );
  }

  private getMonthOffset(
    date: Date,
    leaveYear: number,
    financialYearStartMonth: number,
  ): number {
    const yearStart = new Date(leaveYear, financialYearStartMonth - 1, 1);

    if (date <= yearStart) {
      return 0;
    }

    const rawOffset =
      (date.getFullYear() - leaveYear) * 12 +
      (date.getMonth() - (financialYearStartMonth - 1));

    return Math.min(Math.max(rawOffset, 0), 11);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getQuarterEndDate(date: Date, financialYearStartMonth: number): Date {
    const yearStart = new Date(
      date.getFullYear(),
      financialYearStartMonth - 1,
      1,
    );
    const monthOffset = this.getMonthOffset(
      date,
      date.getFullYear(),
      financialYearStartMonth,
    );
    const quarterIndex = Math.floor(monthOffset / 3);
    const quarterEndMonth =
      financialYearStartMonth - 1 + (quarterIndex + 1) * 3;
    return new Date(date.getFullYear(), quarterEndMonth, 0);
  }

  private calculateQuarterlyAccrued(
    annualDays: number,
    entitlementStartDate: Date,
    asOfDate: Date,
    financialYearStartMonth: number,
  ): number {
    const quarterDays = annualDays / 4;
    const eYear = entitlementStartDate.getFullYear();
    const aYear = asOfDate.getFullYear();

    const eMonthOffset = this.getMonthOffset(
      entitlementStartDate,
      eYear,
      financialYearStartMonth,
    );
    const aMonthOffset = this.getMonthOffset(
      asOfDate,
      aYear,
      financialYearStartMonth,
    );

    const startQuarter = Math.floor(eMonthOffset / 3);
    const asOfQuarter = Math.floor(aMonthOffset / 3);

    let total = 0;

    for (let q = startQuarter; q <= asOfQuarter; q++) {
      const qStartMonth = financialYearStartMonth - 1 + q * 3;
      const qStartDate = new Date(
        entitlementStartDate.getFullYear(),
        qStartMonth,
        1,
      );

      let effectiveStart: Date;
      if (q === startQuarter) {
        effectiveStart = entitlementStartDate;
      } else {
        effectiveStart = qStartDate;
      }

      const qEndDate = new Date(qStartDate.getFullYear(), qStartMonth + 3, 0);
      const daysInQuarter =
        (qEndDate.getTime() - qStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
      const daysRemaining =
        (qEndDate.getTime() - effectiveStart.getTime()) /
          (1000 * 60 * 60 * 24) +
        1;
      const ratio = daysRemaining / daysInQuarter;

      total += quarterDays * ratio;
    }

    return Number(total.toFixed(2));
  }

  private calculateMonthlyAccrued(
    annualDays: number,
    startMonthOffset: number,
    asOfMonthOffset: number,
  ): number {
    const monthlyDays = annualDays / 12;

    const accruedMonths = Math.max(0, asOfMonthOffset - startMonthOffset + 1);

    return Number((monthlyDays * accruedMonths).toFixed(2));
  }

  private calculateYearlyProrated(
    annualDays: number,
    startMonthOffset: number,
  ): number {
    const remainingMonths = 12 - startMonthOffset;

    const entitlement = annualDays * (remainingMonths / 12);

    return Number(entitlement.toFixed(2));
  }

  async getBalance(
    companyId: string,
    userId: string,
    leaveTypeId: string,
    year: number,
    transaction?: Transaction,
  ): Promise<LeaveBalance> {
    const balance = await this.leaveBalanceModel.findOne({
      where: {
        company_id: companyId,
        user_id: userId,
        leave_type_id: leaveTypeId,
        year,
      },
      transaction,
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    return balance;
  }

  private async recalculate(balance: LeaveBalance, transaction?: Transaction) {
    balance.total = Number(balance.opening_balance) + Number(balance.accrued);

    balance.remaining = Number(balance.total) - Number(balance.used);

    await balance.save({
      transaction,
    });

    return balance;
  }

  async credit(
    {
      companyId,
      userId,
      leaveTypeId,
      days,
      description,
      leaveRequestId,
      createdBy,
      accrualPeriod,
    }: {
      companyId: string;
      userId: string;
      leaveTypeId: string;
      days: number;
      description: string;
      leaveRequestId?: string;
      createdBy?: string | null;
      accrualPeriod?: string;
    },
    transaction?: Transaction,
  ) {
    const year = await this.companyMetaService.getFinancialYearFromDate(
      companyId,
      new Date(),
    );

    const balance = await this.getBalance(
      companyId,
      userId,
      leaveTypeId,
      year,
      transaction,
    );

    balance.accrued = Number(balance.accrued) + Number(days);

    await this.recalculate(balance, transaction);

    await this.leaveLedgerService.createCreditEntry(
      {
        company_id: companyId,
        user_id: userId,
        leave_type_id: leaveTypeId,
        leave_request_id: leaveRequestId,

        days,

        balance_after: Number(balance.remaining),

        description,
        accrual_period: accrualPeriod,
        created_by: createdBy ?? undefined,
      },
      transaction,
    );

    return balance;
  }

  async debit(
    {
      companyId,
      userId,
      leaveTypeId,
      days,
      description,
      leaveRequestId,
      createdBy,
      accrualPeriod,
    }: {
      companyId: string;
      userId: string;
      leaveTypeId: string;
      days: number;
      description: string;
      leaveRequestId?: string;
      createdBy?: string;
      accrualPeriod?: string;
    },
    transaction?: Transaction,
  ) {
    const year = await this.companyMetaService.getFinancialYearFromDate(
      companyId,
      new Date(),
    );

    const balance = await this.getBalance(
      companyId,
      userId,
      leaveTypeId,
      year,
      transaction,
    );

    if (Number(balance.remaining) < Number(days)) {
      throw new BadRequestException('Insufficient leave balance');
    }

    balance.used = Number(balance.used) + Number(days);

    await this.recalculate(balance, transaction);

    await this.leaveLedgerService.createDebitEntry(
      {
        company_id: companyId,
        user_id: userId,
        leave_type_id: leaveTypeId,
        leave_request_id: leaveRequestId,

        days,

        balance_after: Number(balance.remaining),

        description,
        accrual_period: accrualPeriod,
        created_by: createdBy,
      },
      transaction,
    );

    return balance;
  }

  async getUserBalances(companyId: string, userId: string) {
    return this.leaveBalanceModel.findAll({
      where: {
        company_id: companyId,
        user_id: userId,
      },
      include: [
        {
          model: LeaveType,
        },
      ],
      order: [['created_at', 'ASC']],
    });
  }

  async restoreUsedLeave(
    {
      companyId,
      userId,
      leaveTypeId,
      days,
      description,
      leaveRequestId,
      createdBy,
      accrualPeriod,
    }: {
      companyId: string;
      userId: string;
      leaveTypeId: string;
      days: number;
      description: string;
      leaveRequestId?: string;
      createdBy?: string;
      accrualPeriod?: string;
    },
    transaction?: Transaction,
  ) {
    const year = await this.companyMetaService.getFinancialYearFromDate(
      companyId,
      new Date(),
    );

    const balance = await this.getBalance(
      companyId,
      userId,
      leaveTypeId,
      year,
      transaction,
    );

    balance.used = Math.max(0, Number(balance.used) - Number(days));

    await this.recalculate(balance, transaction);

    await this.leaveLedgerService.createCreditEntry(
      {
        company_id: companyId,
        user_id: userId,
        leave_type_id: leaveTypeId,
        leave_request_id: leaveRequestId,
        days,
        balance_after: Number(balance.remaining),
        description,
        accrual_period: undefined,
        created_by: createdBy,
      },
      transaction,
    );

    return balance;
  }

  async manualAdjustment(
    companyId: string,
    dto: ManualLeaveAdjustmentDto,
    createdBy?: string | null,
  ) {
    const adjustmentDays = Number(dto.days);

    if (!Number.isFinite(adjustmentDays) || adjustmentDays === 0) {
      throw new BadRequestException('Adjustment days must be non-zero');
    }

    const [user, leaveType] = await Promise.all([
      this.userModel.findOne({
        where: {
          id: dto.user_id,
          company_id: companyId,
          status: true,
        },
      }),
      this.leaveTypeModel.findOne({
        where: {
          id: dto.leave_type_id,
          company_id: companyId,
          status: true,
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const effectiveDate = dto.effective_date
      ? new Date(dto.effective_date)
      : new Date();

    const year = await this.companyMetaService.getFinancialYearFromDate(
      companyId,
      effectiveDate,
    );

    const balance = await this.getBalance(
      companyId,
      dto.user_id,
      dto.leave_type_id,
      year,
    );

    if (
      adjustmentDays < 0 &&
      Number(balance.remaining) < Math.abs(adjustmentDays)
    ) {
      throw new BadRequestException('Insufficient leave balance');
    }

    balance.accrued = Number(
      (Number(balance.accrued) + adjustmentDays).toFixed(2),
    );

    await this.recalculate(balance);

    await this.leaveLedgerService.createAdjustmentEntry({
      company_id: companyId,
      user_id: dto.user_id,
      leave_type_id: dto.leave_type_id,
      days: adjustmentDays,
      balance_after: Number(balance.remaining),
      description: dto.description ?? 'Manual leave adjustment',
      accrual_period: `${year}`,
      created_by: createdBy ?? undefined,
    });

    return balance;
  }

  async getAllBalances(
    companyId: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const offset = (page - 1) * limit;

    const userWhere: any = {
      company_id: companyId,
    };

    if (userId) {
      userWhere.id = userId;
    }

    if (search) {
      userWhere.first_name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { rows, count } = await this.userModel.findAndCountAll({
      where: userWhere,
      include: [
        {
          model: LeaveBalance,
          required: false,
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [['first_name', 'ASC']],
    });

    const data = rows.map((user) => {
      const balances = user.leave_balances ?? [];

      const total = balances.reduce((sum, item) => sum + Number(item.total), 0);

      const used = balances.reduce((sum, item) => sum + Number(item.used), 0);

      const remaining = balances.reduce(
        (sum, item) => sum + Number(item.remaining),
        0,
      );

      return {
        user: user,
        total,
        used,
        remaining,
      };
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

  async getUserBalanceDetails(companyId: string, userId: string) {
    const user = await User.findOne({
      where: {
        id: userId,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balances = await this.leaveBalanceModel.findAll({
      where: {
        company_id: companyId,
        user_id: userId,
      },
      include: [
        {
          model: LeaveType,
        },
      ],
      order: [['created_at', 'ASC']],
    });

    const result = await Promise.all(
      balances.map(async (balance) => {
        const ledger = await this.leaveLedgerModel.findAll({
          where: {
            company_id: companyId,
            user_id: userId,
            leave_type_id: balance.leave_type_id,
          },
          include: [
            {
              model: LeaveRequest,
              required: false,
            },
          ],
          order: [['created_at', 'DESC']],
        });

        return {
          balance_id: balance.id,
          leave_type: balance.leave_type,
          year: balance.year,
          opening_balance: Number(balance.opening_balance),
          accrued: Number(balance.accrued),
          carried_forward: Number(balance.carried_forward),
          total: Number(balance.total),
          used: Number(balance.used),
          remaining: Number(balance.remaining),
          transactions: ledger.map((entry) => ({
            id: entry.id,
            transaction_type: entry.transaction_type,
            days: Number(entry.days),
            balance_after: Number(entry.balance_after),
            description: entry.description,
            created_at: entry.created_at,
            leave_request: entry.leave_request,
          })),
        };
      }),
    );

    return {
      user,
      balances: result,
    };
  }

  async syncBalances(
    companyId: string,
    createdBy?: string | null,
    asOfDate: Date = new Date(),
    accrualTypes?: string[],
  ) {
    const [currentYear, financialYear] = await Promise.all([
      this.companyMetaService.getFinancialYearFromDate(companyId, asOfDate),
      this.companyMetaService.getFinancialYear(companyId),
    ]);

    const leaveTypeWhere: any = {
      company_id: companyId,
      status: true,
    };

    if (accrualTypes?.length) {
      leaveTypeWhere.accrual_type = {
        [Op.in]: accrualTypes,
      };
    }

    const [users, leaveTypes, existingBalances] = await Promise.all([
      this.userModel.findAll({
        where: {
          company_id: companyId,
          status: true,
        },
        attributes: ['id', 'joining_date'],
      }),

      this.leaveTypeModel.findAll({
        where: leaveTypeWhere,
      }),

      this.leaveBalanceModel.findAll({
        where: {
          company_id: companyId,
          year: currentYear,
        },
      }),
    ]);

    const existingBalanceMap = new Map(
      existingBalances.map((item) => [
        `${item.user_id}_${item.leave_type_id}`,
        item,
      ]),
    );

    const records: any[] = [];
    const ledgerEntries: any[] = [];
    let adjusted = 0;
    let existingConsidered = 0;

    for (const user of users) {
      if (!user.joining_date) continue;

      for (const leaveType of leaveTypes) {
        const key = `${user.id}_${leaveType.id}`;
        const entitlement = this.calculateInitialEntitlement(
          leaveType,
          new Date(user.joining_date),
          currentYear,
          financialYear.startMonth,
          asOfDate,
        );
        const existingBalance = existingBalanceMap.get(key);

        if (existingBalance) {
          existingConsidered += 1;

          if (leaveType.accrual_type === 'manual') {
            continue;
          }

          const accrualPeriod = this.getAccrualPeriod(
            leaveType.accrual_type,
            asOfDate,
            currentYear,
            financialYear.startMonth,
          );

          if (leaveType.accrual_type === 'yearly') {
            const fullDays = Number(leaveType.total_days_per_year);
            if (Number(existingBalance.accrued) < fullDays) {
              existingBalance.accrued = fullDays;
              existingBalance.total =
                Number(existingBalance.opening_balance) + fullDays;
              existingBalance.remaining =
                existingBalance.total - Number(existingBalance.used);
              await existingBalance.save();
            } else {
              await this.recalculate(existingBalance);
            }
            continue;
          }

          const currentAccrued = Number(existingBalance.accrued);
          const adjustment = Number((entitlement - currentAccrued).toFixed(2));

          if (Math.abs(adjustment) < 0.01) {
            await this.recalculate(existingBalance);
            continue;
          }

          existingBalance.accrued = Number(
            (currentAccrued + adjustment).toFixed(2),
          );

          await this.recalculate(existingBalance);
          adjusted += 1;

          ledgerEntries.push({
            company_id: companyId,
            user_id: user.id,
            leave_type_id: leaveType.id,
            transaction_type:
              adjustment > 0
                ? LeaveTransactionType.CREDIT
                : LeaveTransactionType.ADJUSTMENT,
            days: adjustment,
            balance_after: Number(existingBalance.remaining),
            description: 'Leave accrual',
            accrual_period: accrualPeriod,
            created_by: createdBy ?? null,
          });

          continue;
        }

        const prevBalance = await this.leaveBalanceModel.findOne({
          where: {
            company_id: companyId,
            user_id: user.id,
            leave_type_id: leaveType.id,
            year: currentYear - 1,
          },
        });

        const prevUsed = prevBalance ? Number(prevBalance.used) : 0;

        records.push({
          company_id: companyId,
          user_id: user.id,
          leave_type_id: leaveType.id,

          year: currentYear,

          opening_balance: 0,
          accrued: entitlement,

          total: entitlement,
          used: prevUsed,
          remaining: Math.max(0, entitlement - prevUsed),

          carried_forward: 0,
        });

        if (entitlement !== 0) {
          ledgerEntries.push({
            company_id: companyId,
            user_id: user.id,
            leave_type_id: leaveType.id,
            transaction_type: LeaveTransactionType.CREDIT,
            days: entitlement,
            balance_after: Math.max(0, entitlement - prevUsed),
            description: 'Initial leave accrual',
            accrual_period: this.getAccrualPeriod(
              leaveType.accrual_type,
              asOfDate,
              currentYear,
              financialYear.startMonth,
            ),
            created_by: createdBy ?? null,
          });
        }
      }
    }

    if (records.length) {
      await this.leaveBalanceModel.bulkCreate(records);
    }

    if (ledgerEntries.length) {
      await this.leaveLedgerModel.bulkCreate(ledgerEntries);
    }

    return {
      year: currentYear,
      created: records.length,
      adjusted,
      skipped: existingConsidered - adjusted,
    };
  }

  private getAccrualPeriod(
    accrualType: string,
    asOfDate: Date,
    leaveYear: number,
    financialYearStartMonth: number,
  ): string {
    const monthOffset = this.getMonthOffset(
      asOfDate,
      leaveYear,
      financialYearStartMonth,
    );

    if (accrualType === 'monthly') {
      return `${asOfDate.getFullYear()}-${String(asOfDate.getMonth() + 1).padStart(2, '0')}`;
    }

    if (accrualType === 'quarterly') {
      return `${leaveYear}-Q${Math.floor(monthOffset / 3) + 1}`;
    }

    return `${leaveYear}`;
  }
}

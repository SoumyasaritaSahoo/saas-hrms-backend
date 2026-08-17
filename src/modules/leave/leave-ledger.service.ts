import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';

import { LeaveLedger } from '../../database/models/leave-ledger.model';

import { LeaveTransactionType } from '../../common/constants/leave-transaction-type.constant';
import { CreateLeaveLedgerDto } from './dto/create-leave-ledger.dto';
import { LeaveType } from 'src/database/models/leave-type.model';
import { User } from 'src/database/models/user.model';

@Injectable()
export class LeaveLedgerService {
  constructor(
    @InjectModel(LeaveLedger)
    private readonly leaveLedgerModel: typeof LeaveLedger,
  ) {}

  private async createEntry(
    payload: {
      company_id: string;
      user_id: string;
      leave_type_id: string;
      leave_request_id?: string;

      transaction_type: 'credit' | 'debit' | 'carry_forward' | 'adjustment';

      days: number;

      balance_after: number;

      description?: string;

      accrual_period?: string;

      created_by?: string;
    },
    transaction?: Transaction,
  ) {
    return this.leaveLedgerModel.create(
      {
        ...payload,
      },
      {
        transaction,
      },
    );
  }

  async createCreditEntry(
    dto: Omit<CreateLeaveLedgerDto, 'transaction_type'>,
    transaction?: Transaction,
  ): Promise<LeaveLedger> {
    return this.createEntry(
      {
        ...dto,
        transaction_type: LeaveTransactionType.CREDIT,
      },
      transaction,
    );
  }

  async createDebitEntry(
    dto: Omit<CreateLeaveLedgerDto, 'transaction_type'>,
    transaction?: Transaction,
  ): Promise<LeaveLedger> {
    return this.createEntry(
      {
        ...dto,
        transaction_type: LeaveTransactionType.DEBIT,
      },
      transaction,
    );
  }

  async createAdjustmentEntry(
    dto: Omit<CreateLeaveLedgerDto, 'transaction_type'>,
    transaction?: Transaction,
  ): Promise<LeaveLedger> {
    return this.createEntry(
      {
        ...dto,
        transaction_type: LeaveTransactionType.ADJUSTMENT,
      },
      transaction,
    );
  }

  async createCarryForwardEntry(
    dto: Omit<CreateLeaveLedgerDto, 'transaction_type'>,
    transaction?: Transaction,
  ): Promise<LeaveLedger> {
    return this.createEntry(
      {
        ...dto,
        transaction_type: LeaveTransactionType.CARRY_FORWARD,
      },
      transaction,
    );
  }

  async getUserLedger(companyId: string, userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.leaveLedgerModel.findAndCountAll({
      where: {
        company_id: companyId,
        user_id: userId,
      },
      include: [
        {
          model: LeaveType,
        },
        {
          model: User,
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
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

  async getUserLeaveTypeLedger(
    companyId: string,
    userId: string,
    leaveTypeId: string,
    page = 1,
    limit = 20,
  ) {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.leaveLedgerModel.findAndCountAll({
      where: {
        company_id: companyId,
        user_id: userId,
        leave_type_id: leaveTypeId,
      },
      order: [['created_at', 'DESC']],
      limit,
      offset,
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

  async getLeaveRequestLedger(leaveRequestId: string): Promise<LeaveLedger[]> {
    return this.leaveLedgerModel.findAll({
      where: {
        leave_request_id: leaveRequestId,
      },
      order: [['created_at', 'ASC']],
    });
  }
}

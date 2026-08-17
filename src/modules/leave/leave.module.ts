import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LeaveType } from '../../database/models/leave-type.model';
import { LeaveRequest } from '../../database/models/leave-request.model';
import { LeaveBalance } from '../../database/models/leave-balance.model';
import { User } from '../../database/models/user.model';
import { LeaveLedger } from '../../database/models/leave-ledger.model';
import { LeaveLedgerService } from './leave-ledger.service';
import { LeaveBalanceService } from './leave-balance.service';
import { CompanyMeta } from '../../database/models/company-meta.model';
import { CompanyMetaService } from '../company/company-meta.service';

// NOTE: trimmed from the source project. The source's leave.module.ts also
// wired LeaveTypeController/Service, LeaveRequestController/Service,
// LeaveValidationService, LeaveBalanceController, LeaveAccrualService,
// LeaveYearService, LeavePolicyDetailsController, HolidayCalendar/Holiday
// SequelizeModule.forFeature entries and MailModule/PermissionModule
// imports — none of that leave-request/accrual/validation/policy business
// logic is part of Employee management. Only LeaveBalanceService (called
// by UserService on employee create) and its own dependency
// LeaveLedgerService are in scope here, per the porting brief. Like the
// source, CompanyMetaService is re-provided directly here (rather than by
// importing CompanyModule) to avoid a circular module dependency, since
// CompanyModule already imports UserModule.
@Module({
  imports: [
    SequelizeModule.forFeature([
      LeaveType,
      LeaveRequest,
      LeaveBalance,
      LeaveLedger,
      User,
      CompanyMeta,
    ]),
  ],
  providers: [LeaveLedgerService, LeaveBalanceService, CompanyMetaService],
  exports: [LeaveLedgerService, LeaveBalanceService],
})
export class LeaveModule {}

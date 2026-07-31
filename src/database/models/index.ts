import { SaasUser } from './saas/saas-user.model';
import { SaasEmailVerification } from './saas/saas-email-verification.model';

import { Industry } from './industry.model';

import { Company } from './company.model';
import { CompanyMeta } from './company-meta.model';

import { LocationType } from './location-type.model';
import { Location } from './location.model';

import { Department } from './department.model';
import { Designation } from './designation.model';

import { User } from './user.model';
import { UserMeta } from './user-meta.model';

import { EmailVerification } from './email-verification.model';
import { UserSession } from './user-session.model';
import { UserCompanyLocation } from './user-company-location.model';

import { HolidayCalendar } from './holiday-calendar.model';
import { Holiday } from './holiday.model';

import { Role } from './role.model';
import { PermissionGroup } from './permission-group.model';
import { Permission } from './permission.model';
import { RolePermission } from './role-permission.model';
import { UserRole } from './user-role.model';

import { LeaveType } from './leave-type.model';
import { LeaveBalance } from './leave-balance.model';
import { LeaveRequest } from './leave-request.model';
import { LeaveLedger } from './leave-ledger.model';

import { AttendanceShift } from './attendance-shift.model';

import { AuditLog } from './audit-log.model';

import { UserAddress } from './user-address.model';
import { UserDocument } from './user-document.model';
import { UserBankAccount } from './user-bank-account.model';

// Trimmed from the source project's DATABASE_MODELS: this now carries every
// model touched by the Employee-management port (user/department/
// designation/location-type/location/role/permission/attendance-shift/
// audit/leave-balance chain, plus Holiday/HolidayCalendar pulled in only
// because LeaveRequest's model file imports them) in addition to the
// previously-ported auth/company/mail models. Still excluded: SaaS-admin
// role/permission models (saas-role, saas-permission, saas-role-permission,
// saas-user-role — the SaaS-platform-admin console is out of scope),
// UserHolidayCalendar, AttendanceRule/AttendanceLog/AttendanceRegularization
// and WebhookEvent (unrelated attendance/webhook business logic, not
// touched by anything ported here).
export const DATABASE_MODELS = [
  SaasUser,
  SaasEmailVerification,
  Industry,
  Company,
  CompanyMeta,
  LocationType,
  Location,
  Department,
  Designation,
  User,
  UserMeta,
  EmailVerification,
  UserSession,
  UserCompanyLocation,
  HolidayCalendar,
  Holiday,
  Role,
  PermissionGroup,
  Permission,
  RolePermission,
  UserRole,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  LeaveLedger,
  AttendanceShift,
  AuditLog,
  UserAddress,
  UserDocument,
  UserBankAccount,
];

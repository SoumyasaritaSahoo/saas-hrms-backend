import { SaasUser } from './saas/saas-user.model';
import { SaasEmailVerification } from './saas/saas-email-verification.model';

import { Industry } from './industry.model';

import { Company } from './company.model';
import { CompanyMeta } from './company-meta.model';

import { User } from './user.model';

import { EmailVerification } from './email-verification.model';
import { UserSession } from './user-session.model';

// Trimmed from the source project's DATABASE_MODELS: only the models
// actually used by the ported auth / user / company / mail modules are
// registered here. Models tied to excluded feature modules (department,
// designation, role, permission, location, leave, attendance, holiday,
// audit, saas-role, saas-permission, etc.) were dropped.
export const DATABASE_MODELS = [
  SaasUser,
  SaasEmailVerification,
  Industry,
  Company,
  CompanyMeta,
  User,
  EmailVerification,
  UserSession,
];

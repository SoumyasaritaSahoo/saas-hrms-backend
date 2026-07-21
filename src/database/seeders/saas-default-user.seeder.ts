import * as bcrypt from 'bcrypt';

import { SaasUser } from '../models/saas/saas-user.model';

// NOTE: simplified from the source project. The original seeder also
// created a "Super Admin" SaasRole, assigned it to the user, and granted
// it every SaasPermission — all dropped along with the saas-role /
// saas-permission modules (excluded from this auth-only port). This just
// creates the default SaaS admin user so `admin/login` has something to
// authenticate against.
export default async function seedDefaultSaasUser() {
  const ADMIN_FIRST_NAME = 'HRMS';
  const ADMIN_LAST_NAME = 'Admin';
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_PASSWORD = 'admin';

  const existingUser = await SaasUser.findOne({
    where: {
      email: ADMIN_EMAIL,
    },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await SaasUser.create({
      first_name: ADMIN_FIRST_NAME,
      last_name: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      status: true,
      is_deletable: false,
    });
  }

  console.log('✅ Default saas admin user seeded successfully');
}

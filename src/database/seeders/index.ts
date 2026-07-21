import { sequelize } from '..';

import seedIndustries from './industry.seeder';
import seedDefaultSaasUser from './saas-default-user.seeder';

// NOTE: simplified from the source project. Permission and saas-permission
// seeding were dropped along with those excluded feature modules.
async function runSeeders() {
  try {
    await sequelize.authenticate();

    console.log('✅ Database connected');

    await seedIndustries();

    await seedDefaultSaasUser();

    console.log('✅ All seeders executed successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed');
    console.error(error);

    process.exit(1);
  }
}

runSeeders();

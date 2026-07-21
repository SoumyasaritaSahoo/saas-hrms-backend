import { Industry } from '../models/industry.model';
import { INDUSTRY_LABELS } from '../../common/constants/industry.constants';

export default async function seedIndustries() {
  const industries = Object.keys(INDUSTRY_LABELS).map((key) => ({
    name: key,
  }));

  for (const industry of industries) {
    await Industry.findOrCreate({
      where: {
        name: industry.name,
      },
      defaults: {
        name: industry.name,
      },
    });
  }

  console.log('✅ Industries seeded successfully');
}

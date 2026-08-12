import { supabase } from '@/integrations/supabase/client';

const DEFAULT_NATIONALITIES = [
  { country_name: 'United States', country_code: 'US' },
  { country_name: 'United Kingdom', country_code: 'UK' },
  { country_name: 'Philippines', country_code: 'PH' },
  { country_name: 'India', country_code: 'IN' },
  { country_name: 'Egypt', country_code: 'EG' }
];

const DEFAULT_CURRENCIES = [
  { currency_code: 'USD', currency_name: 'US Dollar', symbol: '$' },
  { currency_code: 'EUR', currency_name: 'Euro', symbol: '€' },
  { currency_code: 'GBP', currency_name: 'British Pound', symbol: '£' },
];

const DEFAULT_FINDING_TYPES = [
  { finding_type_name: 'Safety', severity: 'High', description: 'Safety related finding' },
  { finding_type_name: 'Environmental', severity: 'Medium', description: 'Environmental impact' },
  { finding_type_name: 'Operational', severity: 'Low', description: 'General operational finding' },
];

export const seedSetupData = async (orgId: string, userId: string) => {
  try {
    // Check if nationalities are empty for this org
    const { data: natData } = await supabase
      .from('setup_nationalities')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!natData || natData.length === 0) {
      await supabase.from('setup_nationalities').insert(
        DEFAULT_NATIONALITIES.map(n => ({ ...n, org_id: orgId, user_id: userId }))
      );
    }

    // Check if currencies are empty
    const { data: currData } = await supabase
      .from('setup_currencies')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!currData || currData.length === 0) {
      await supabase.from('setup_currencies').insert(
        DEFAULT_CURRENCIES.map(c => ({ ...c, org_id: orgId, user_id: userId }))
      );
    }

    // Check if finding types are empty
    const { data: findingData } = await supabase
      .from('setup_finding_types')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!findingData || findingData.length === 0) {
      await supabase.from('setup_finding_types').insert(
        DEFAULT_FINDING_TYPES.map(f => ({ ...f, org_id: orgId, user_id: userId }))
      );
    }

    console.log('Setup data seeded successfully');
  } catch (error) {
    console.error('Error seeding setup data:', error);
  }
};

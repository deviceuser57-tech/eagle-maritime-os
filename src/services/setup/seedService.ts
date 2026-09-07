import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_OWNER_COMPANIES,
  DEFAULT_OPERATOR_COMPANIES,
  DEFAULT_TECHNICAL_MANAGERS,
  DEFAULT_ISM_MANAGERS,
  DEFAULT_CREW_RANKS,
  DEFAULT_NATIONALITIES,
  DEFAULT_CONTRACT_TYPES,
  DEFAULT_CURRENCIES,
  DEFAULT_AUDIT_TYPES,
  DEFAULT_FINDING_TYPES,
  DEFAULT_FINDING_STATUSES,
  DEFAULT_ROOT_CAUSES,
  DEFAULT_CLASSIFICATION_SOCIETIES,
  DEFAULT_FLAG_STATES,
  DEFAULT_STATUTORY_CERTIFICATES,
} from '@/constants/dropdownOptions';

export const seedSetupData = async (orgId: string, userId: string) => {
  try {
    // 1. Companies (Owners, Operators, Tech Managers, ISM Managers)
    const { data: compData } = await supabase
      .from('setup_companies')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!compData || compData.length === 0) {
      const companiesToInsert: any[] = [];

      DEFAULT_OWNER_COMPANIES.forEach(name => {
        companiesToInsert.push({ name, company_type: 'owner', is_owner: true, org_id: orgId, user_id: userId });
      });
      DEFAULT_OPERATOR_COMPANIES.forEach(name => {
        companiesToInsert.push({ name, company_type: 'operator', is_operator: true, org_id: orgId, user_id: userId });
      });
      DEFAULT_TECHNICAL_MANAGERS.forEach(name => {
        companiesToInsert.push({ name, company_type: 'technical', is_technical_manager: true, org_id: orgId, user_id: userId });
      });
      DEFAULT_ISM_MANAGERS.forEach(name => {
        companiesToInsert.push({ name, company_type: 'ism', is_ism_manager: true, org_id: orgId, user_id: userId });
      });

      await supabase.from('setup_companies').insert(companiesToInsert);
    }

    // 2. Crew Ranks
    const { data: rankData } = await supabase
      .from('setup_crew_ranks')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!rankData || rankData.length === 0) {
      await supabase.from('setup_crew_ranks').insert(
        DEFAULT_CREW_RANKS.map((rank_name, idx) => ({
          rank_name,
          rank_order: idx + 1,
          is_officer: idx < 8,
          department: idx < 4 ? 'Deck' : idx < 8 ? 'Engine' : 'Catering',
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 3. Nationalities
    const { data: natData } = await supabase
      .from('setup_nationalities')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!natData || natData.length === 0) {
      await supabase.from('setup_nationalities').insert(
        DEFAULT_NATIONALITIES.map(country_name => ({
          country_name,
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 4. Contract Types
    const { data: contractData } = await supabase
      .from('setup_contract_types')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!contractData || contractData.length === 0) {
      await supabase.from('setup_contract_types').insert(
        DEFAULT_CONTRACT_TYPES.map(contract_name => ({
          contract_name,
          duration_months: contract_name === 'Permanent' ? 12 : 6,
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 5. Currencies
    const { data: currData } = await supabase
      .from('setup_currencies')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!currData || currData.length === 0) {
      await supabase.from('setup_currencies').insert(
        DEFAULT_CURRENCIES.map(c => ({
          currency_code: c.code,
          currency_name: c.name,
          symbol: c.symbol,
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 6. Audit Types
    const { data: auditTypeData } = await supabase
      .from('setup_audit_types')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!auditTypeData || auditTypeData.length === 0) {
      await supabase.from('setup_audit_types').insert(
        DEFAULT_AUDIT_TYPES.map(audit_type_name => ({
          audit_type_name,
          frequency_months: 12,
          is_external: audit_type_name.includes('External'),
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 7. Finding Types
    const { data: findingData } = await supabase
      .from('setup_finding_types')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!findingData || findingData.length === 0) {
      await supabase.from('setup_finding_types').insert(
        DEFAULT_FINDING_TYPES.map(finding_type_name => ({
          finding_type_name,
          severity: finding_type_name.includes('Major') ? 'major' : finding_type_name.includes('Minor') ? 'minor' : 'critical',
          description: finding_type_name,
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 8. Finding Statuses
    const { data: statusData } = await supabase
      .from('setup_finding_statuses')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!statusData || statusData.length === 0) {
      await supabase.from('setup_finding_statuses').insert(
        DEFAULT_FINDING_STATUSES.map((status_name, idx) => ({
          status_name,
          status_order: idx + 1,
          is_closed: status_name === 'Closed',
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 9. Root Causes
    const { data: rootData } = await supabase
      .from('setup_root_causes')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!rootData || rootData.length === 0) {
      await supabase.from('setup_root_causes').insert(
        DEFAULT_ROOT_CAUSES.map(cause_name => ({
          cause_name,
          category: 'Human Factor',
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 10. Classification Societies
    const { data: classData } = await supabase
      .from('setup_classification_societies')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!classData || classData.length === 0) {
      await supabase.from('setup_classification_societies').insert(
        DEFAULT_CLASSIFICATION_SOCIETIES.map(society_name => {
          const abbrMatch = society_name.match(/\(([^)]+)\)/);
          return {
            society_name,
            abbreviation: abbrMatch ? abbrMatch[1] : society_name.split(' ')[0],
            org_id: orgId,
            user_id: userId,
          };
        })
      );
    }

    // 11. Flag States
    const { data: flagData } = await supabase
      .from('setup_flag_states')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!flagData || flagData.length === 0) {
      await supabase.from('setup_flag_states').insert(
        DEFAULT_FLAG_STATES.map(flag_name => ({
          flag_name,
          flag_code: flag_name.slice(0, 3).toUpperCase(),
          risk_level: 'standard',
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    // 12. Statutory Certificates
    const { data: certData } = await supabase
      .from('setup_certificate_types')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);

    if (!certData || certData.length === 0) {
      await supabase.from('setup_certificate_types').insert(
        DEFAULT_STATUTORY_CERTIFICATES.map(certificate_name => ({
          certificate_name,
          validity_years: 5,
          org_id: orgId,
          user_id: userId,
        }))
      );
    }

    console.log('Setup data seeded successfully');
  } catch (error) {
    console.error('Error seeding setup data:', error);
  }
};


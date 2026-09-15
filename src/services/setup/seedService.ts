import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_OWNER_COMPANIES, DEFAULT_OPERATOR_COMPANIES, DEFAULT_TECHNICAL_MANAGERS, DEFAULT_ISM_MANAGERS,
  DEFAULT_CREW_RANKS, DEFAULT_NATIONALITIES, DEFAULT_CONTRACT_TYPES, DEFAULT_CURRENCIES,
  DEFAULT_AUDIT_TYPES, DEFAULT_FINDING_TYPES, DEFAULT_FINDING_STATUSES, DEFAULT_ROOT_CAUSES,
  DEFAULT_CLASSIFICATION_SOCIETIES, DEFAULT_FLAG_STATES, DEFAULT_STATUTORY_CERTIFICATES,
} from '@/constants/dropdownOptions';

// These arrays are seed data for Setup masters. They are not UI dropdown fallbacks.
const VESSEL_TYPES = ['Bulk Carrier','Container Ship','Crude Oil Tanker','Product Tanker','Chemical Tanker','LNG Carrier','LPG Carrier','General Cargo','Passenger Ship','RoRo Ship','Vehicle Carrier','Offshore Supply Vessel','Tugboat','Fishing Vessel','Yacht'];
const PROPULSION_TYPES = ['Single Screw','Twin Screw','Diesel Electric','LNG Dual Fuel','Hybrid','Azimuth'];
const FUEL_TYPES = ['HFO','VLSFO','MGO','MDO','LNG','Methanol','Dual Fuel'];
const TRADING_AREAS = ['Worldwide / Unrestricted','Coastal','Short Sea','Inland Waterways','Restricted'];
const HULL_MATERIALS = ['Steel','Aluminum','Fiberglass','Composite'];
const HULL_COATINGS = ['Epoxy','Antifouling','Polyurethane','Vinyl'];
const VESSEL_STATUSES = ['Active','Inactive','Maintenance','Drydock','Laid Up'];
const OWNERSHIP_MODES = ['Owned','Chartered / Leased','Managed Only'];
const REGULARITIES = ['SOLAS','MARPOL','ISM Code','ISPS Code','Load Line Convention','COLREG'];
const REGULARITY_APPLICABILITY = ['Applied','Exempted','Not Required','Pending Review'];

async function seedSimple(orgId:string, table:string, names:string[]) {
  const { data } = await (supabase as any).from(table).select('id').eq('org_id',orgId).limit(1);
  if (!data?.length) {
    await (supabase as any).from(table).insert(names.map(name=>({name,org_id:orgId,is_active:true})));
  }
}

async function seedRegulations(orgId: string) {
  const { data } = await (supabase as any).from('regulations').select('id').eq('org_id', orgId).limit(1);
  if (data?.length) return;
  await (supabase as any).from('regulations').insert(REGULARITIES.map(name => ({
    code: name,
    title: name,
    convention: name,
    description: `Default ${name} regulatory master record`,
    is_global: false,
    org_id: orgId,
  })));
}

export const seedSetupData = async (orgId: string, userId: string) => {
  try {
    const { data: compData } = await supabase.from('setup_companies').select('id').eq('org_id', orgId).limit(1);
    if (!compData || compData.length === 0) {
      const companiesToInsert: any[] = [];
      DEFAULT_OWNER_COMPANIES.forEach(name => companiesToInsert.push({ name, company_type:'owner', is_owner:true, org_id:orgId, user_id:userId }));
      DEFAULT_OPERATOR_COMPANIES.forEach(name => companiesToInsert.push({ name, company_type:'operator', is_operator:true, org_id:orgId, user_id:userId }));
      DEFAULT_TECHNICAL_MANAGERS.forEach(name => companiesToInsert.push({ name, company_type:'technical', is_technical_manager:true, org_id:orgId, user_id:userId }));
      DEFAULT_ISM_MANAGERS.forEach(name => companiesToInsert.push({ name, company_type:'ism', is_ism_manager:true, org_id:orgId, user_id:userId }));
      await supabase.from('setup_companies').insert(companiesToInsert);
    }
    const { data: rankData } = await supabase.from('setup_crew_ranks').select('id').eq('org_id', orgId).limit(1);
    if (!rankData?.length) await supabase.from('setup_crew_ranks').insert(DEFAULT_CREW_RANKS.map((rank_name,idx)=>({rank_name,rank_order:idx+1,is_officer:idx<8,department:idx<4?'Deck':idx<8?'Engine':'Catering',org_id:orgId,user_id:userId})));
    const { data:natData }=await supabase.from('setup_nationalities').select('id').eq('org_id',orgId).limit(1);
    if(!natData?.length) await supabase.from('setup_nationalities').insert(DEFAULT_NATIONALITIES.map(country_name=>({country_name,org_id:orgId,user_id:userId})));
    const { data:contractData }=await supabase.from('setup_contract_types').select('id').eq('org_id',orgId).limit(1);
    if(!contractData?.length) await supabase.from('setup_contract_types').insert(DEFAULT_CONTRACT_TYPES.map(contract_name=>({contract_name,duration_months:contract_name==='Permanent'?12:6,org_id:orgId,user_id:userId})));
    const { data:currData }=await supabase.from('setup_currencies').select('id').eq('org_id',orgId).limit(1);
    if(!currData?.length) await supabase.from('setup_currencies').insert(DEFAULT_CURRENCIES.map(c=>({currency_code:c.code,currency_name:c.name,symbol:c.symbol,org_id:orgId,user_id:userId})));
    const { data:auditTypeData }=await supabase.from('setup_audit_types').select('id').eq('org_id',orgId).limit(1);
    if(!auditTypeData?.length) await supabase.from('setup_audit_types').insert(DEFAULT_AUDIT_TYPES.map(audit_type_name=>({audit_type_name,frequency_months:12,is_external:audit_type_name.includes('External'),org_id:orgId,user_id:userId})));
    const { data:findingData }=await supabase.from('setup_finding_types').select('id').eq('org_id',orgId).limit(1);
    if(!findingData?.length) await supabase.from('setup_finding_types').insert(DEFAULT_FINDING_TYPES.map(finding_type_name=>({finding_type_name,severity:finding_type_name.includes('Major')?'major':finding_type_name.includes('Minor')?'minor':'critical',description:finding_type_name,org_id:orgId,user_id:userId})));
    const { data:statusData }=await supabase.from('setup_finding_statuses').select('id').eq('org_id',orgId).limit(1);
    if(!statusData?.length) await supabase.from('setup_finding_statuses').insert(DEFAULT_FINDING_STATUSES.map((status_name,idx)=>({status_name,status_order:idx+1,is_closed:status_name==='Closed',org_id:orgId,user_id:userId})));
    const { data:rootData }=await supabase.from('setup_root_causes').select('id').eq('org_id',orgId).limit(1);
    if(!rootData?.length) await supabase.from('setup_root_causes').insert(DEFAULT_ROOT_CAUSES.map(cause_name=>({cause_name,category:'Human Factor',org_id:orgId,user_id:userId})));
    const { data:classData }=await supabase.from('setup_classification_societies').select('id').eq('org_id',orgId).limit(1);
    if(!classData?.length) await supabase.from('setup_classification_societies').insert(DEFAULT_CLASSIFICATION_SOCIETIES.map(society_name=>{const abbrMatch=society_name.match(/\(([^)]+)\)/);return{society_name,abbreviation:abbrMatch?abbrMatch[1]:society_name.split(' ')[0],org_id:orgId,user_id:userId};}));
    const { data:flagData }=await supabase.from('setup_flag_states').select('id').eq('org_id',orgId).limit(1);
    if(!flagData?.length) await supabase.from('setup_flag_states').insert(DEFAULT_FLAG_STATES.map(flag_name=>({flag_name,flag_code:flag_name.slice(0,3).toUpperCase(),risk_level:'standard',org_id:orgId,user_id:userId})));
    const { data:certData }=await supabase.from('setup_certificate_types').select('id').eq('org_id',orgId).limit(1);
    if(!certData?.length) await supabase.from('setup_certificate_types').insert(DEFAULT_STATUTORY_CERTIFICATES.map(certificate_name=>({certificate_name,certificate_category:'Statutory',validity_months:60,org_id:orgId,user_id:userId})));

    // Vessel-specific masters are stored in Setup. No UI fallback data is used for these.
    await seedSimple(orgId,'setup_vessel_types',VESSEL_TYPES);
    await seedSimple(orgId,'setup_propulsion_types',PROPULSION_TYPES);
    await seedSimple(orgId,'setup_fuel_types',FUEL_TYPES);
    await seedSimple(orgId,'setup_trading_areas',TRADING_AREAS);
    await seedSimple(orgId,'setup_hull_materials',HULL_MATERIALS);
    await seedSimple(orgId,'setup_vessel_status',VESSEL_STATUSES);
    await seedSimple(orgId,'setup_ownership_modes',OWNERSHIP_MODES);
    await seedRegulations(orgId);
    await seedSimple(orgId,'setup_regularity_applicability',REGULARITY_APPLICABILITY);
    const { data:coatings }=await (supabase as any).from('setup_hull_coatings').select('id').eq('org_id',orgId).limit(1);
    if(!coatings?.length) await (supabase as any).from('setup_hull_coatings').insert(HULL_COATINGS.map((coating_type)=>({coating_type,org_id:orgId,is_active:true,manufacturer:null})));

    console.log('Setup data seeded successfully');
  } catch (error) { console.error('Error seeding setup data:', error); }
};

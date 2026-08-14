// src/services/setup/metadataService.ts
import { supabase } from '../../integrations/supabase/client';
import type { Database } from '../../integrations/supabase/types';

// Types for Setup entities (partial, based on existing tables)
export type SetupCompany = Database['public']['Tables']['setup_companies']['Row'];
export type SetupCrewRank = Database['public']['Tables']['setup_crew_ranks']['Row'];
// Add other types as needed

/** Fetch all companies for the current organization */
export async function getSetupCompanies(orgId: string): Promise<SetupCompany[]> {
  const { data, error } = await supabase
    .from('setup_companies')
    .select('*')
    .eq('org_id', orgId);
  if (error) throw error;
  return data as SetupCompany[];
}

/** Fetch crew ranks for the current organization */
export async function getSetupCrewRanks(orgId: string): Promise<SetupCrewRank[]> {
  const { data, error } = await supabase
    .from('setup_crew_ranks')
    .select('*')
    .eq('org_id', orgId);
  if (error) throw error;
  return data as SetupCrewRank[];
}

// Additional CRUD functions can be added following the same pattern.

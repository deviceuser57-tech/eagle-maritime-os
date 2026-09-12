import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface VesselSetupItem {
  id: string;
  org_id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  authority?: string | null;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

function useSimpleSetup(table: string, key: string, orderField = 'sort_order') {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: [key, orgId],
    enabled: !!user?.id && !!orgId,
    queryFn: async () => {
      const builder = (supabase as any).from(table).select('*').eq('org_id', orgId).eq('is_active', true);
      const { data, error } = orderField
        ? await builder.order(orderField, { ascending: true }).order('name', { ascending: true })
        : await builder.order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as VesselSetupItem[];
    },
  });
  const add = useMutation({
    mutationFn: async (name: string) => {
      if (!orgId) throw new Error('No active organization');
      const { data, error } = await (supabase as any).from(table).insert({ org_id: orgId, name, is_active: true }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [key] }); toast({ title: 'Setup updated' }); },
    onError: (e: Error) => toast({ title: 'Setup error', description: e.message, variant: 'destructive' }),
  });
  return { items: query.data || [], isLoading: query.isLoading, error: query.error, addItem: add };
}

export const useSetupVesselStatus = () => useSimpleSetup('setup_vessel_status', 'setup_vessel_status');
export const useSetupOwnershipModes = () => useSimpleSetup('setup_ownership_modes', 'setup_ownership_modes');
// setup_regularities intentionally has no sort_order column in the migration.
export const useSetupRegularities = () => useSimpleSetup('setup_regularities', 'setup_regularities', '');
export const useSetupRegularityApplicability = () => useSimpleSetup('setup_regularity_applicability', 'setup_regularity_applicability');

export interface VesselFinancialBaseline {
  id: string;
  org_id: string;
  vessel_id: string;
  minimum_daily_hire_rate: number;
  currency_code: string | null;
  minimum_charter_period_days: number | null;
  crew_manning_daily_cost: number;
  accommodation_daily_cost: number;
  breakfast_daily_cost: number;
  lunch_daily_cost: number;
  dinner_daily_cost: number;
  snacks_daily_cost: number;
  fresh_water_daily_cost: number;
  lubricants_daily_cost: number;
  consumables_daily_cost: number;
  maintenance_daily_cost: number;
  repairs_daily_cost: number;
  spare_parts_daily_cost: number;
  insurance_daily_cost: number;
  technical_management_daily_cost: number;
  regulatory_certification_daily_cost: number;
  communications_daily_cost: number;
  waste_sewage_daily_cost: number;
  other_daily_operating_cost: number;
  notes: string | null;
}

export interface VesselEquipmentCost {
  id?: string;
  vessel_id: string;
  equipment_name: string;
  daily_cost: number;
  currency_code?: string | null;
  notes?: string | null;
  sort_order?: number;
}

export interface VesselDailyCost {
  id?: string;
  vessel_id: string;
  category: string;
  description?: string | null;
  daily_cost: number;
  currency_code?: string | null;
  sort_order?: number;
}

export interface VesselRegularity {
  id?: string;
  vessel_id: string;
  regularity_id: string;
  applicability_status_id: string;
  effective_from?: string | null;
  effective_to?: string | null;
  exemption_reference?: string | null;
  exemption_reason?: string | null;
  document_reference?: string | null;
  notes?: string | null;
  regularity?: VesselSetupItem;
  applicability?: VesselSetupItem;
}

export const emptyFinancialBaseline = (currency = 'USD'): Omit<VesselFinancialBaseline, 'id'|'org_id'|'vessel_id'> => ({
  minimum_daily_hire_rate: 0, currency_code: currency, minimum_charter_period_days: null,
  crew_manning_daily_cost: 0, accommodation_daily_cost: 0, breakfast_daily_cost: 0,
  lunch_daily_cost: 0, dinner_daily_cost: 0, snacks_daily_cost: 0, fresh_water_daily_cost: 0,
  lubricants_daily_cost: 0, consumables_daily_cost: 0, maintenance_daily_cost: 0,
  repairs_daily_cost: 0, spare_parts_daily_cost: 0, insurance_daily_cost: 0,
  technical_management_daily_cost: 0, regulatory_certification_daily_cost: 0,
  communications_daily_cost: 0, waste_sewage_daily_cost: 0, other_daily_operating_cost: 0, notes: null,
});

export function useVesselFinancials(vesselId?: string) {
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const qc = useQueryClient();
  const enabled = !!orgId && !!vesselId;
  const baseline = useQuery({
    queryKey: ['vessel-financial-baseline', vesselId], enabled,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('vessel_financial_baseline').select('*').eq('vessel_id', vesselId).maybeSingle();
      if (error) throw error; return data as VesselFinancialBaseline | null;
    },
  });
  const equipment = useQuery({
    queryKey: ['vessel-equipment-costs', vesselId], enabled,
    queryFn: async () => { const { data, error } = await (supabase as any).from('vessel_equipment_costs').select('*').eq('vessel_id', vesselId).order('sort_order').order('equipment_name'); if (error) throw error; return data || []; },
  });
  const daily = useQuery({
    queryKey: ['vessel-daily-costs', vesselId], enabled,
    queryFn: async () => { const { data, error } = await (supabase as any).from('vessel_financial_daily_costs').select('*').eq('vessel_id', vesselId).order('sort_order').order('category'); if (error) throw error; return data || []; },
  });
  const save = useMutation({
    mutationFn: async ({ baselineData, equipmentRows, dailyRows }: { baselineData: any; equipmentRows: any[]; dailyRows: any[] }) => {
      if (!orgId || !vesselId) throw new Error('Vessel context is missing');
      const { error: bErr } = await (supabase as any).from('vessel_financial_baseline').upsert({ ...baselineData, vessel_id: vesselId, org_id: orgId }, { onConflict: 'vessel_id' });
      if (bErr) throw bErr;
      const { error: eqDeleteError } = await (supabase as any).from('vessel_equipment_costs').delete().eq('vessel_id', vesselId);
      if (eqDeleteError) throw eqDeleteError;
      const { error: dailyDeleteError } = await (supabase as any).from('vessel_financial_daily_costs').delete().eq('vessel_id', vesselId);
      if (dailyDeleteError) throw dailyDeleteError;
      if (equipmentRows.length) { const { error } = await (supabase as any).from('vessel_equipment_costs').insert(equipmentRows.map((r, i) => ({ ...r, vessel_id: vesselId, org_id: orgId, sort_order: i }))); if (error) throw error; }
      if (dailyRows.length) { const { error } = await (supabase as any).from('vessel_financial_daily_costs').insert(dailyRows.map((r, i) => ({ ...r, vessel_id: vesselId, org_id: orgId, sort_order: i }))); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vessel-financial-baseline', vesselId] }); qc.invalidateQueries({ queryKey: ['vessel-equipment-costs', vesselId] }); qc.invalidateQueries({ queryKey: ['vessel-daily-costs', vesselId] }); toast({ title: 'Financial baseline saved' }); },
    onError: (e: Error) => toast({ title: 'Financial save failed', description: e.message, variant: 'destructive' }),
  });
  return { baseline: baseline.data, equipment: equipment.data || [], dailyCosts: daily.data || [], isLoading: baseline.isLoading || equipment.isLoading || daily.isLoading, save };
}

export function useVesselRegularities(vesselId?: string) {
  const { orgId } = useOrganization(); const { toast } = useToast(); const qc = useQueryClient();
  const query = useQuery({ queryKey: ['vessel-regularities', vesselId], enabled: !!orgId && !!vesselId, queryFn: async () => { const { data, error } = await (supabase as any).from('vessel_regularities').select('*, regularity:setup_regularities(*), applicability:setup_regularity_applicability(*)').eq('vessel_id', vesselId).order('created_at'); if (error) throw error; return (data || []) as VesselRegularity[]; } });
  const save = useMutation({ mutationFn: async (row: VesselRegularity) => { if (!orgId || !vesselId) throw new Error('Vessel context is missing'); const { id, regularity, applicability, ...payload } = row; const { data, error } = await (supabase as any).from('vessel_regularities').upsert({ ...payload, ...(id ? { id } : {}), org_id: orgId, vessel_id: vesselId }, { onConflict: 'vessel_id,regularity_id' }).select().single(); if (error) throw error; return data; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['vessel-regularities', vesselId] }); toast({ title: 'Regularity saved' }); }, onError: (e: Error) => toast({ title: 'Regularity save failed', description: e.message, variant: 'destructive' }) });
  const remove = useMutation({ mutationFn: async (id: string) => { const { error } = await (supabase as any).from('vessel_regularities').delete().eq('id', id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['vessel-regularities', vesselId] }) });
  return { records: query.data || [], isLoading: query.isLoading, save, remove };
}

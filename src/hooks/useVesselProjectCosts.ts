import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface VesselProjectCost {
  id?: string;
  org_id?: string;
  vessel_id: string;
  project_reference?: string | null;
  description: string;
  amount: number;
  currency_code: string;
  notes?: string | null;
  sort_order?: number;
}

export interface VesselProjectCostCalculation {
  vessel_id: string;
  project_days: number;
  daily_operating_cost: number;
  operating_cost_total: number;
  project_specific_costs: number;
  total_project_cost: number;
  currency_code: string;
}

export function useVesselProjectCosts(vesselId?: string, projectReference?: string | null) {
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const qc = useQueryClient();
  const enabled = !!orgId && !!vesselId;
  const key = ['vessel-project-costs', vesselId, projectReference ?? null];

  const query = useQuery({
    queryKey: key,
    enabled,
    queryFn: async () => {
      let request = (supabase as any)
        .from('vessel_project_costs')
        .select('*')
        .eq('vessel_id', vesselId)
        .eq('org_id', orgId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (projectReference) request = request.eq('project_reference', projectReference);
      const { data, error } = await request;
      if (error) throw error;
      return (data || []) as VesselProjectCost[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: VesselProjectCost) => {
      if (!orgId || !vesselId) throw new Error('Vessel context is missing');
      const payload = {
        ...(row.id ? { id: row.id } : {}),
        org_id: orgId,
        vessel_id: vesselId,
        project_reference: row.project_reference ?? null,
        description: row.description.trim(),
        amount: Number(row.amount) || 0,
        currency_code: row.currency_code || 'USD',
        notes: row.notes ?? null,
        sort_order: row.sort_order ?? 0,
      };
      const { data, error } = await (supabase as any)
        .from('vessel_project_costs')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as VesselProjectCost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vessel-project-costs', vesselId] });
      qc.invalidateQueries({ queryKey: ['vessel-project-cost-summary', vesselId] });
      toast({ title: 'Project cost saved' });
    },
    onError: (e: Error) => toast({ title: 'Project cost save failed', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('vessel_project_costs').delete().eq('id', id).eq('vessel_id', vesselId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vessel-project-costs', vesselId] });
      qc.invalidateQueries({ queryKey: ['vessel-project-cost-summary', vesselId] });
    },
    onError: (e: Error) => toast({ title: 'Project cost delete failed', description: e.message, variant: 'destructive' }),
  });

  const calculate = useMutation({
    mutationFn: async ({ projectDays, reference }: { projectDays: number; reference?: string | null }) => {
      if (!vesselId) throw new Error('Vessel context is missing');
      const { data, error } = await (supabase as any).rpc('calculate_vessel_project_cost', {
        p_vessel_id: vesselId,
        p_project_days: Math.max(0, Number(projectDays) || 0),
        p_project_reference: reference ?? projectReference ?? null,
      });
      if (error) throw error;
      return (data?.[0] || null) as VesselProjectCostCalculation | null;
    },
    onError: (e: Error) => toast({ title: 'Project cost calculation failed', description: e.message, variant: 'destructive' }),
  });

  return {
    costs: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    save,
    remove,
    calculate,
  };
}

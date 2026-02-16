import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { invokeService } from '@/lib/service-client';

export interface CIIRecord {
  id: string;
  vessel_id: string | null;
  year: number;
  cii_value: number;
  cii_rating: string;
  target_value: number | null;
  fuel_consumption: number | null;
  distance_travelled: number | null;
  cargo_carried: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vessels?: { name: string } | null;
}

export const useCIIRecords = () => {
  const [ciiRecords, setCIIRecords] = useState<CIIRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();

  const fetchCIIRecords = async () => {
    if (!user || !orgId) {
      setCIIRecords([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cii_records')
        .select('*, vessels(name)')
        .eq('org_id', orgId)
        .order('year', { ascending: false });

      if (error) throw error;
      setCIIRecords(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addCIIRecord = async (params: {
    vessel_id: string | null;
    year: number;
    fuel_consumption: number | null;
    distance_travelled: number | null;
    cargo_carried: number | null;
    fuel_type: string;
    target_value: number | null;
    notes: string | null;
  }) => {
    if (!user || !orgId) return { error: { message: 'Not authenticated or no active organization' } };

    try {
      const { data, error } = await invokeService<{ id: string }>(
        'rpc_log_cii_entry',
        {
          p_org_id: orgId,
          p_vessel_id: params.vessel_id,
          p_year: params.year,
          p_fuel_consumption: params.fuel_consumption,
          p_distance_travelled: params.distance_travelled,
          p_cargo_carried: params.cargo_carried,
          p_fuel_type: params.fuel_type,
          p_target_cii: params.target_value,
          p_notes: params.notes
        }
      );

      if (error) {
        toast({ title: 'Service Error', description: error.message, variant: 'destructive' });
        return { error };
      }

      fetchCIIRecords(); // Refresh to get calculated fields
      toast({ title: 'Success', description: 'CII record logged and rated by domain service.' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };
  const updateCIIRecord = async (id: string, updates: Partial<CIIRecord>) => {
    if (!orgId) return { error: { message: 'No active organization' } };

    try {
      const { data, error } = await supabase
        .from('cii_records')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      setCIIRecords(prev => prev.map(r => r.id === id ? data : r));
      toast({ title: 'Success', description: 'CII record updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteCIIRecord = async (id: string) => {
    if (!orgId) return { error: { message: 'No active organization' } };

    try {
      const { error } = await supabase
        .from('cii_records')
        .delete()
        .eq('id', id)
        .eq('org_id', orgId);

      if (error) throw error;
      setCIIRecords(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Success', description: 'CII record deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchCIIRecords();
  }, [user, orgId]);

  return { ciiRecords, loading, addCIIRecord, updateCIIRecord, deleteCIIRecord, refetch: fetchCIIRecords };
};

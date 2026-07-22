import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { voyageSchema, validate } from '@/lib/validations';

export interface Voyage {
  id: string;
  vessel_id: string | null;
  voyage_number: string | null;
  origin_port: string;
  destination_port: string;
  departure_date: string | null;
  arrival_date: string | null;
  eta: string | null;
  cargo_type: string | null;
  cargo_quantity: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useVoyages = () => {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();

  const fetchVoyages = async () => {
    if (!user || !orgId) {
      setVoyages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('voyages')
        .select('*')
        .eq('org_id', orgId)
        .order('departure_date', { ascending: false });

      if (error) throw error;
      setVoyages(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addVoyage = async (voyage: Omit<Voyage, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !orgId) return { error: new Error('Not authenticated or no active organization') };

    try {
      const { error: validationError } = validate(voyageSchema, voyage);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('voyages')
        .insert([{ ...voyage, user_id: user.id, org_id: orgId }])
        .select()
        .single();

      if (error) throw error;
      setVoyages(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'Voyage added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateVoyage = async (id: string, updates: Partial<Voyage>) => {
    try {
      const { data, error } = await supabase
        .from('voyages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setVoyages(prev => prev.map(v => v.id === id ? data : v));
      toast({ title: 'Success', description: 'Voyage updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteVoyage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('voyages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVoyages(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Success', description: 'Voyage deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, [user]);

  return { voyages, loading, addVoyage, updateVoyage, deleteVoyage, refetch: fetchVoyages };
};

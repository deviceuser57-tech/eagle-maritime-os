import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Vessel {
  id: string;
  name: string;
  imo_number: string | null;
  call_sign: string | null;
  mmsi_number: string | null;
  vessel_type: string | null;
  flag_state: string | null;
  gross_tonnage: number | null;
  deadweight: number | null;
  year_built: number | null;
  classification_society: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export const useVessels = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVessels = async () => {
    if (!user) {
      setVessels([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVessels(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addVessel = async (vessel: Omit<Vessel, 'id' | 'created_at' | 'updated_at'> & { user_id?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('vessels')
        .insert([{ ...vessel, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setVessels(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'Vessel added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateVessel = async (id: string, updates: Partial<Vessel>) => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setVessels(prev => prev.map(v => v.id === id ? data : v));
      toast({ title: 'Success', description: 'Vessel updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteVessel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vessels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVessels(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Success', description: 'Vessel deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchVessels();
  }, [user]);

  return { vessels, loading, addVessel, updateVessel, deleteVessel, refetch: fetchVessels };
};

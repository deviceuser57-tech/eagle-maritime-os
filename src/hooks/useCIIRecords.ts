import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ciiRecordSchema, validate } from '@/lib/validations';

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
  const { toast } = useToast();

  const fetchCIIRecords = async () => {
    if (!user) {
      setCIIRecords([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cii_records')
        .select('*, vessels(name)')
        .order('year', { ascending: false });

      if (error) throw error;
      setCIIRecords(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addCIIRecord = async (record: Omit<CIIRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error: validationError } = validate(ciiRecordSchema, record);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('cii_records')
        .insert([{ ...record, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCIIRecords(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'CII record added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateCIIRecord = async (id: string, updates: Partial<CIIRecord>) => {
    try {
      const { data, error } = await supabase
        .from('cii_records')
        .update(updates)
        .eq('id', id)
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
    try {
      const { error } = await supabase
        .from('cii_records')
        .delete()
        .eq('id', id);

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
  }, [user]);

  return { ciiRecords, loading, addCIIRecord, updateCIIRecord, deleteCIIRecord, refetch: fetchCIIRecords };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { auditorSchema, validate } from '@/lib/validations';

export interface Auditor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  certification_number: string | null;
  specialization: string | null;
  status: string;
  rating: number | null;
  audits_completed: number | null;
  created_at: string;
  updated_at: string;
}

export const useAuditors = () => {
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();

  const fetchAuditors = async () => {
    if (!user || !orgId) {
      setAuditors([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('auditors')
        .select('*')
        .eq('org_id', orgId)
        .order('name', { ascending: true });

      if (error) throw error;
      setAuditors(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addAuditor = async (auditor: Omit<Auditor, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !orgId) return { error: new Error('Not authenticated or no active organization') };

    try {
      const { error: validationError } = validate(auditorSchema, auditor);
      if (validationError) throw new Error(validationError.issues[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('auditors')
        .insert([{ ...auditor, user_id: user.id, org_id: orgId }])
        .select()
        .single();

      if (error) throw error;
      setAuditors(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'Auditor added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateAuditor = async (id: string, updates: Partial<Auditor>) => {
    try {
      const { data, error } = await supabase
        .from('auditors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAuditors(prev => prev.map(a => a.id === id ? data : a));
      toast({ title: 'Success', description: 'Auditor updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteAuditor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('auditors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAuditors(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Success', description: 'Auditor deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchAuditors();
  }, [user, orgId]);

  return { auditors, loading, addAuditor, updateAuditor, deleteAuditor, refetch: fetchAuditors };
};

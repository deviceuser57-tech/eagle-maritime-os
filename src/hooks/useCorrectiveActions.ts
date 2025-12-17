import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CorrectiveAction {
  id: string;
  finding_id: string | null;
  action_description: string;
  responsible_person: string | null;
  due_date: string | null;
  completed_date: string | null;
  status: string;
  evidence_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useCorrectiveActions = () => {
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCorrectiveActions = async () => {
    if (!user) {
      setCorrectiveActions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('corrective_actions')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setCorrectiveActions(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addCorrectiveAction = async (action: Omit<CorrectiveAction, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('corrective_actions')
        .insert([{ ...action, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCorrectiveActions(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'Corrective action added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateCorrectiveAction = async (id: string, updates: Partial<CorrectiveAction>) => {
    try {
      const { data, error } = await supabase
        .from('corrective_actions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCorrectiveActions(prev => prev.map(a => a.id === id ? data : a));
      toast({ title: 'Success', description: 'Corrective action updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteCorrectiveAction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('corrective_actions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCorrectiveActions(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Success', description: 'Corrective action deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchCorrectiveActions();
  }, [user]);

  return { correctiveActions, loading, addCorrectiveAction, updateCorrectiveAction, deleteCorrectiveAction, refetch: fetchCorrectiveActions };
};

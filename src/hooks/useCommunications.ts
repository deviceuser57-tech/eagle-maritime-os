import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Communication {
  id: string;
  vessel_id: string | null;
  subject: string;
  message: string;
  sender_name: string | null;
  recipient_name: string | null;
  priority: string | null;
  status: string;
  sent_at: string;
  read_at: string | null;
  created_at: string;
}

export const useCommunications = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCommunications = async () => {
    if (!user) {
      setCommunications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addCommunication = async (communication: Omit<Communication, 'id' | 'created_at' | 'sent_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('communications')
        .insert([{ ...communication, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCommunications(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'Message sent successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateCommunication = async (id: string, updates: Partial<Communication>) => {
    try {
      const { data, error } = await supabase
        .from('communications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCommunications(prev => prev.map(c => c.id === id ? data : c));
      toast({ title: 'Success', description: 'Message updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteCommunication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('communications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCommunications(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Success', description: 'Message deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const markAsRead = async (id: string) => {
    return updateCommunication(id, { status: 'read', read_at: new Date().toISOString() });
  };

  useEffect(() => {
    fetchCommunications();
  }, [user]);

  return { communications, loading, addCommunication, updateCommunication, deleteCommunication, markAsRead, refetch: fetchCommunications };
};

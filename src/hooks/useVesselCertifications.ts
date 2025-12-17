import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VesselCertification {
  id: string;
  vessel_id: string | null;
  certificate_name: string;
  certificate_type: string;
  issuing_authority: string | null;
  issue_date: string | null;
  expiry_date: string;
  status: string;
  document_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useVesselCertifications = () => {
  const [certifications, setCertifications] = useState<VesselCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCertifications = async () => {
    if (!user) {
      setCertifications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vessel_certifications')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      setCertifications(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addCertification = async (certification: Omit<VesselCertification, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('vessel_certifications')
        .insert([{ ...certification, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCertifications(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'Certification added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateCertification = async (id: string, updates: Partial<VesselCertification>) => {
    try {
      const { data, error } = await supabase
        .from('vessel_certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCertifications(prev => prev.map(c => c.id === id ? data : c));
      toast({ title: 'Success', description: 'Certification updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteCertification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vessel_certifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCertifications(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Success', description: 'Certification deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [user]);

  return { certifications, loading, addCertification, updateCertification, deleteCertification, refetch: fetchCertifications };
};

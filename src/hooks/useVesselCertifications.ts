import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { vesselCertificationSchema, validate } from '@/lib/validations';

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
  const { orgId } = useOrganization();
  const { toast } = useToast();

  const fetchCertifications = async () => {
    if (!user || !orgId) {
      setCertifications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vessel_certifications')
        .select('*')
        .eq('org_id', orgId)
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
    if (!user || !orgId) return { error: new Error('Not authenticated or no active organization') };

    try {
      const { error: validationError } = validate(vesselCertificationSchema, certification);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('vessel_certifications')
        .insert([{ ...certification, user_id: user.id, org_id: orgId }])
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
  }, [user, orgId]);

  return { certifications, loading, addCertification, updateCertification, deleteCertification, refetch: fetchCertifications };
};

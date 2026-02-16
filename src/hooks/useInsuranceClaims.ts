import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { insuranceClaimSchema, validate } from '@/lib/validations';

export interface InsuranceClaim {
  id: string;
  vessel_id: string | null;
  claim_number: string | null;
  claim_type: string;
  policy_number: string | null;
  insurer_name: string | null;
  incident_date: string | null;
  submitted_date: string | null;
  resolved_date: string | null;
  claim_amount: number | null;
  approved_amount: number | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useInsuranceClaims = () => {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();

  const fetchClaims = async () => {
    if (!user || !orgId) {
      setClaims([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('insurance_claims')
        .select('*')
        .eq('user_id', orgId)
        .order('submitted_date', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addClaim = async (claim: Omit<InsuranceClaim, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !orgId) return { error: new Error('Not authenticated or no active organization') };

    try {
      const { error: validationError } = validate(insuranceClaimSchema, claim);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('insurance_claims')
        .insert([{ ...claim, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setClaims(prev => [data, ...prev]);
      toast({ title: 'Success', description: 'Claim added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateClaim = async (id: string, updates: Partial<InsuranceClaim>) => {
    try {
      const { data, error } = await supabase
        .from('insurance_claims')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setClaims(prev => prev.map(c => c.id === id ? data : c));
      toast({ title: 'Success', description: 'Claim updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteClaim = async (id: string) => {
    try {
      const { error } = await supabase
        .from('insurance_claims')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setClaims(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Success', description: 'Claim deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user, orgId]);

  return { claims, loading, addClaim, updateClaim, deleteClaim, refetch: fetchClaims };
};

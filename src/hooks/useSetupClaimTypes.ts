import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface SetupClaimType {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSetupClaimTypes = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: claimTypes = [], isLoading, error } = useQuery({
    queryKey: ['setup_claim_types', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_claim_types')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as SetupClaimType[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addClaimType = useMutation({
    mutationFn: async (claimType: Pick<SetupClaimType, 'name' | 'description'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { data, error } = await supabase
        .from('setup_claim_types')
        .insert({ ...claimType, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_claim_types'] });
      toast({ title: 'Success', description: 'Claim type added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateClaimType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SetupClaimType> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_claim_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_claim_types'] });
      toast({ title: 'Success', description: 'Claim type updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteClaimType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_claim_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_claim_types'] });
      toast({ title: 'Success', description: 'Claim type deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { claimTypes, isLoading, error, addClaimType, updateClaimType, deleteClaimType };
};

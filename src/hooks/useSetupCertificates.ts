import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CertificateType {
  id: string;
  user_id: string;
  certificate_category: 'statutory' | 'class' | 'crew' | 'other';
  certificate_name: string;
  issuing_authority: string | null;
  validity_months: number | null;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export const useCertificateTypes = (category?: CertificateType['certificate_category']) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: certificateTypes = [], isLoading, error } = useQuery({
    queryKey: ['setup_certificate_types', user?.id, category],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('setup_certificate_types')
        .select('*')
        .eq('user_id', user.id)
        .order('certificate_name', { ascending: true });

      if (category) {
        query = query.eq('certificate_category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CertificateType[];
    },
    enabled: !!user?.id,
  });

  const addCertificateType = useMutation({
    mutationFn: async (cert: Omit<CertificateType, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('setup_certificate_types')
        .insert({ ...cert, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_certificate_types'] });
      toast({ title: 'Success', description: 'Certificate type added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateCertificateType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CertificateType> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_certificate_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_certificate_types'] });
      toast({ title: 'Success', description: 'Certificate type updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCertificateType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_certificate_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_certificate_types'] });
      toast({ title: 'Success', description: 'Certificate type deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { certificateTypes, isLoading, error, addCertificateType, updateCertificateType, deleteCertificateType };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { auditSchema, validate } from '@/lib/validations';

type Audit = Tables<'audits'>;
type AuditInsert = TablesInsert<'audits'>;
type AuditUpdate = TablesUpdate<'audits'>;

export const useAudits = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const queryClient = useQueryClient();

  const { data: audits = [], isLoading, error } = useQuery({
    queryKey: ['audits', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('audits')
        .select('*, vessels(name)')
        .eq('user_id', orgId)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data as (Audit & { vessels: { name: string } | null })[];
    },
    enabled: !!user && !!orgId,
  });

  const createAudit = useMutation({
    mutationFn: async (newAudit: Omit<AuditInsert, 'user_id' | 'org_id'>) => {
      if (!orgId) throw new Error('No active organization');
      const { error: validationError } = validate(auditSchema, newAudit);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');

      const { data, error } = await supabase
        .from('audits')
        .insert({ ...newAudit, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create audit: ' + error.message);
    },
  });

  const updateAudit = useMutation({
    mutationFn: async ({ id, ...updates }: AuditUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('audits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update audit: ' + error.message);
    },
  });

  const deleteAudit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('audits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete audit: ' + error.message);
    },
  });

  return {
    audits,
    isLoading,
    error,
    createAudit,
    updateAudit,
    deleteAudit,
  };
};

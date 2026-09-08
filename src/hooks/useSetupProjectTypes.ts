import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface SetupProjectType {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSetupProjectTypes = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projectTypes = [], isLoading, error } = useQuery({
    queryKey: ['setup_project_types', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_project_types')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as SetupProjectType[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addProjectType = useMutation({
    mutationFn: async (projectType: Pick<SetupProjectType, 'name' | 'description'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { data, error } = await supabase
        .from('setup_project_types')
        .insert({ ...projectType, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_project_types'] });
      toast({ title: 'Success', description: 'Project type added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateProjectType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SetupProjectType> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_project_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_project_types'] });
      toast({ title: 'Success', description: 'Project type updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProjectType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_project_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_project_types'] });
      toast({ title: 'Success', description: 'Project type deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { projectTypes, isLoading, error, addProjectType, updateProjectType, deleteProjectType };
};

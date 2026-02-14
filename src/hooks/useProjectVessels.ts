import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProjectVessel {
  id: string;
  project_id: string;
  vessel_id: string;
  planned_audit_date: string | null;
  audit_type: string | null;
  notes: string | null;
  created_at: string;
  vessels?: { name: string } | null;
}

export const useProjectVessels = (projectId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projectVessels = [], isLoading } = useQuery({
    queryKey: ['project_vessels', projectId || 'all', user?.id],
    queryFn: async () => {
      let query = supabase
        .from('project_vessels')
        .select('*, vessels(name)');
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProjectVessel[];
    },
    enabled: !!user,
  });

  const addVesselToProject = useMutation({
    mutationFn: async (pv: { project_id: string; vessel_id: string; planned_audit_date?: string; audit_type?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('project_vessels')
        .insert(pv as any)
        .select('*, vessels(name)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_vessels'] });
      toast.success('Vessel assigned to project');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  const removeVesselFromProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('project_vessels').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_vessels'] });
      toast.success('Vessel removed from project');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  return { projectVessels, isLoading, addVesselToProject, removeVesselFromProject };
};

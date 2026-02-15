import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { incidentSchema, validate } from '@/lib/validations';

type Incident = Tables<'incidents'>;
type IncidentInsert = TablesInsert<'incidents'>;
type IncidentUpdate = TablesUpdate<'incidents'>;

export const useIncidents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: incidents = [], isLoading, error } = useQuery({
    queryKey: ['incidents', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*, vessels(name)')
        .order('incident_date', { ascending: false });
      
      if (error) throw error;
      return data as (Incident & { vessels: { name: string } | null })[];
    },
    enabled: !!user,
  });

  const createIncident = useMutation({
    mutationFn: async (newIncident: Omit<IncidentInsert, 'user_id'>) => {
      const { error: validationError } = validate(incidentSchema, newIncident);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');

      const { data, error } = await supabase
        .from('incidents')
        .insert({ ...newIncident, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident reported successfully');
    },
    onError: (error) => {
      toast.error('Failed to report incident: ' + error.message);
    },
  });

  const updateIncident = useMutation({
    mutationFn: async ({ id, ...updates }: IncidentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update incident: ' + error.message);
    },
  });

  const deleteIncident = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete incident: ' + error.message);
    },
  });

  return {
    incidents,
    isLoading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
  };
};

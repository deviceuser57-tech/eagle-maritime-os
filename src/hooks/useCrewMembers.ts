import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { crewMemberSchema, validate } from '@/lib/validations';

type CrewMember = Tables<'crew_members'>;
type CrewMemberInsert = TablesInsert<'crew_members'>;
type CrewMemberUpdate = TablesUpdate<'crew_members'>;

export const useCrewMembers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: crewMembers = [], isLoading, error } = useQuery({
    queryKey: ['crew_members', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*, vessels(name)')
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      return data as (CrewMember & { vessels: { name: string } | null })[];
    },
    enabled: !!user,
  });

  const createCrewMember = useMutation({
    mutationFn: async (newMember: Omit<CrewMemberInsert, 'user_id'>) => {
      const { error: validationError } = validate(crewMemberSchema, newMember);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');

      const { data, error } = await supabase
        .from('crew_members')
        .insert({ ...newMember, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_members'] });
      toast.success('Crew member added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add crew member: ' + error.message);
    },
  });

  const updateCrewMember = useMutation({
    mutationFn: async ({ id, ...updates }: CrewMemberUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('crew_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_members'] });
      toast.success('Crew member updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update crew member: ' + error.message);
    },
  });

  const deleteCrewMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crew_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_members'] });
      toast.success('Crew member removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove crew member: ' + error.message);
    },
  });

  return {
    crewMembers,
    isLoading,
    error,
    createCrewMember,
    updateCrewMember,
    deleteCrewMember,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { classificationSocietySchema, flagStateSchema, validate } from '@/lib/validations';

// Types for classification tables
export interface ClassificationSociety {
  id: string;
  user_id: string;
  org_id?: string | null;
  society_name: string;
  abbreviation: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlagState {
  id: string;
  user_id: string;
  org_id?: string | null;
  flag_name: string;
  flag_code: string | null;
  risk_level: 'low' | 'standard' | 'high';
  created_at: string;
  updated_at: string;
}

// Hook for Classification Societies
export const useClassificationSocieties = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: societies = [], isLoading, error } = useQuery({
    queryKey: ['setup_classification_societies', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_classification_societies')
        .select('*')
        .eq('org_id', orgId)
        .order('society_name', { ascending: true });
      if (error) throw error;
      return data as ClassificationSociety[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addSociety = useMutation({
    mutationFn: async (society: Omit<ClassificationSociety, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(classificationSocietySchema, society);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_classification_societies')
        .insert({ ...society, user_id: user.id, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_classification_societies'] });
      toast({ title: 'Success', description: 'Classification society added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateSociety = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClassificationSociety> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_classification_societies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_classification_societies'] });
      toast({ title: 'Success', description: 'Classification society updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSociety = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_classification_societies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_classification_societies'] });
      toast({ title: 'Success', description: 'Classification society deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { societies, isLoading, error, addSociety, updateSociety, deleteSociety };
};

// Hook for Flag States
export const useFlagStates = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flagStates = [], isLoading, error } = useQuery({
    queryKey: ['setup_flag_states', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_flag_states')
        .select('*')
        .eq('org_id', orgId)
        .order('flag_name', { ascending: true });
      if (error) throw error;
      return data as FlagState[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addFlagState = useMutation({
    mutationFn: async (flagState: Omit<FlagState, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(flagStateSchema, flagState);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_flag_states')
        .insert({ ...flagState, user_id: user.id, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_flag_states'] });
      toast({ title: 'Success', description: 'Flag state added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateFlagState = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FlagState> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_flag_states')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_flag_states'] });
      toast({ title: 'Success', description: 'Flag state updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFlagState = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_flag_states').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_flag_states'] });
      toast({ title: 'Success', description: 'Flag state deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { flagStates, isLoading, error, addFlagState, updateFlagState, deleteFlagState };
};

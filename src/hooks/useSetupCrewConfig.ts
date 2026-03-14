import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { crewRankSchema, nationalitySchema, contractTypeSchema, currencySchema, validate } from '@/lib/validations';

// Types for crew configuration tables
export interface CrewRank {
  id: string;
  user_id: string;
  rank_name: string;
  department: string | null;
  rank_order: number;
  is_officer: boolean;
  created_at: string;
  updated_at: string;
}

export interface Nationality {
  id: string;
  user_id: string;
  country_name: string;
  country_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractType {
  id: string;
  user_id: string;
  contract_name: string;
  duration_months: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  id: string;
  user_id: string;
  currency_code: string;
  currency_name: string;
  symbol: string | null;
  created_at: string;
  updated_at: string;
}

// Hook for Crew Ranks
export const useCrewRanks = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ranks = [], isLoading, error } = useQuery({
    queryKey: ['setup_crew_ranks', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_crew_ranks')
        .select('*')
        .eq('org_id', orgId)
        .order('rank_order', { ascending: true });
      if (error) throw error;
      return data as CrewRank[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addRank = useMutation({
    mutationFn: async (rank: Omit<CrewRank, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(crewRankSchema, rank);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_crew_ranks')
        .insert({ ...rank, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_crew_ranks'] });
      toast({ title: 'Success', description: 'Crew rank added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRank = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CrewRank> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_crew_ranks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_crew_ranks'] });
      toast({ title: 'Success', description: 'Crew rank updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRank = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_crew_ranks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_crew_ranks'] });
      toast({ title: 'Success', description: 'Crew rank deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { ranks, isLoading, error, addRank, updateRank, deleteRank };
};

// Hook for Nationalities
export const useNationalities = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nationalities = [], isLoading, error } = useQuery({
    queryKey: ['setup_nationalities', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_nationalities')
        .select('*')
        .eq('user_id', orgId)
        .order('country_name', { ascending: true });
      if (error) throw error;
      return data as Nationality[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addNationality = useMutation({
    mutationFn: async (nationality: Omit<Nationality, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(nationalitySchema, nationality);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_nationalities')
        .insert({ ...nationality, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_nationalities'] });
      toast({ title: 'Success', description: 'Nationality added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateNationality = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Nationality> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_nationalities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_nationalities'] });
      toast({ title: 'Success', description: 'Nationality updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteNationality = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_nationalities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_nationalities'] });
      toast({ title: 'Success', description: 'Nationality deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { nationalities, isLoading, error, addNationality, updateNationality, deleteNationality };
};

// Hook for Contract Types
export const useContractTypes = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contractTypes = [], isLoading, error } = useQuery({
    queryKey: ['setup_contract_types', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_contract_types')
        .select('*')
        .eq('user_id', orgId)
        .order('contract_name', { ascending: true });
      if (error) throw error;
      return data as ContractType[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addContractType = useMutation({
    mutationFn: async (contractType: Omit<ContractType, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(contractTypeSchema, contractType);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error = null } = await supabase
        .from('setup_contract_types')
        .insert({ ...contractType, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_contract_types'] });
      toast({ title: 'Success', description: 'Contract type added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateContractType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContractType> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_contract_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_contract_types'] });
      toast({ title: 'Success', description: 'Contract type updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteContractType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_contract_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_contract_types'] });
      toast({ title: 'Success', description: 'Contract type deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { contractTypes, isLoading, error, addContractType, updateContractType, deleteContractType };
};

// Hook for Currencies
export const useCurrencies = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currencies = [], isLoading, error } = useQuery({
    queryKey: ['setup_currencies', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_currencies')
        .select('*')
        .eq('user_id', orgId)
        .order('currency_code', { ascending: true });
      if (error) throw error;
      return data as Currency[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addCurrency = useMutation({
    mutationFn: async (currency: Omit<Currency, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(currencySchema, currency);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_currencies')
        .insert({ ...currency, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_currencies'] });
      toast({ title: 'Success', description: 'Currency added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateCurrency = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Currency> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_currencies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_currencies'] });
      toast({ title: 'Success', description: 'Currency updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCurrency = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_currencies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_currencies'] });
      toast({ title: 'Success', description: 'Currency deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { currencies, isLoading, error, addCurrency, updateCurrency, deleteCurrency };
};

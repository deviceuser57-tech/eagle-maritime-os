import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { companySchema, validate } from '@/lib/validations';

export interface SetupCompany {
  id: string;
  user_id: string;
  org_id?: string;
  company_type: 'owner' | 'operator' | 'technical' | 'ism' | 'doc';
  name: string;
  contact_person: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyInsert = Omit<SetupCompany, 'id' | 'created_at' | 'updated_at'>;
export type CompanyUpdate = Partial<CompanyInsert> & { id: string };

export const useSetupCompanies = (companyType?: SetupCompany['company_type']) => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['setup_companies', orgId, companyType],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from('setup_companies')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (companyType) {
        query = query.eq('company_type', companyType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SetupCompany[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addCompany = useMutation({
    mutationFn: async (company: Omit<CompanyInsert, 'user_id' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(companySchema, company);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');

      const { data, error } = await supabase
        .from('setup_companies')
        .insert({ ...company, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_companies'] });
      toast({ title: 'Success', description: 'Company added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, ...updates }: CompanyUpdate) => {
      const { error: validationError } = validate(companySchema.partial(), updates);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_companies'] });
      toast({ title: 'Success', description: 'Company updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('setup_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_companies'] });
      toast({ title: 'Success', description: 'Company deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    companies,
    isLoading,
    error,
    addCompany,
    updateCompany,
    deleteCompany,
  };
};

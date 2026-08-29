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
  is_owner: boolean;
  is_operator: boolean;
  is_technical_manager: boolean;
  is_ism_manager: boolean;
  is_doc_issuer: boolean;
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

type CompanyRole = SetupCompany['company_type'];

const roleColumn: Record<CompanyRole, keyof Pick<SetupCompany, 'is_owner' | 'is_operator' | 'is_technical_manager' | 'is_ism_manager' | 'is_doc_issuer'>> = {
  owner: 'is_owner',
  operator: 'is_operator',
  technical: 'is_technical_manager',
  ism: 'is_ism_manager',
  doc: 'is_doc_issuer',
};

export const useSetupCompanies = (companyType?: CompanyRole) => {
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
        // Role filtering is now based on independent role flags, not the legacy
        // single-value company_type. This allows one company to hold multiple roles.
        query = query.eq(roleColumn[companyType], true);
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
      if (validationError) throw new Error(validationError.issues[0]?.message || 'Invalid input');

      const role = company.company_type;
      const roleFlag = roleColumn[role];
      const roleFlags = {
        is_owner: false,
        is_operator: false,
        is_technical_manager: false,
        is_ism_manager: false,
        is_doc_issuer: false,
      };
      roleFlags[roleFlag] = true;

      // Reuse an existing company record in this organization instead of creating
      // a second row when the same company is assigned another role.
      const { data: existing, error: lookupError } = await supabase
        .from('setup_companies')
        .select('*')
        .eq('org_id', orgId)
        .ilike('name', company.name.trim())
        .limit(1)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing) {
        const { data, error } = await supabase
          .from('setup_companies')
          .update({
            ...company,
            [roleFlag]: true,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('setup_companies')
        .insert({
          ...company,
          ...roleFlags,
          user_id: user.id,
          org_id: orgId,
        })
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
      if (validationError) throw new Error(validationError.issues[0]?.message || 'Invalid input');
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

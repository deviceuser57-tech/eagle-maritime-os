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
  company_type?: string | null;
  is_owner?: boolean | null;
  is_operator?: boolean | null;
  is_technical_manager?: boolean | null;
  is_ism_manager?: boolean | null;
  is_doc_issuer?: boolean | null;
  is_insurer?: boolean | null;
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

export type CompanyRole = 'owner' | 'operator' | 'technical' | 'ism' | 'doc' | 'insurer';
export type RoleFlag = 'is_owner' | 'is_operator' | 'is_technical_manager' | 'is_ism_manager' | 'is_doc_issuer' | 'is_insurer';

export const roleColumn: Record<CompanyRole, RoleFlag> = {
  owner: 'is_owner',
  operator: 'is_operator',
  technical: 'is_technical_manager',
  ism: 'is_ism_manager',
  doc: 'is_doc_issuer',
  insurer: 'is_insurer',
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

      const { data, error } = await supabase
        .from('setup_companies')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data || []) as SetupCompany[];
      if (!companyType) return rows;

      const flag = roleColumn[companyType];
      // Filter by the specific role flag. Legacy fallback if neither is set but legacy type matches.
      return rows.filter(company => Boolean(company[flag]) || company.company_type === companyType);
    },
    enabled: !!user?.id && !!orgId,
  });

  const addCompany = useMutation({
    mutationFn: async (company: Omit<CompanyInsert, 'user_id' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(companySchema, company);
      if (validationError) throw new Error(validationError.issues[0]?.message || 'Invalid input');

      const legacyCompanyType = company.company_type || (
        company.is_owner ? 'owner' :
        company.is_operator ? 'operator' :
        company.is_technical_manager ? 'technical' :
        company.is_ism_manager ? 'ism' :
        company.is_doc_issuer ? 'doc' :
        'owner'
      );

      // Check if company already exists by name
      const { data: existing, error: lookupError } = await supabase
        .from('setup_companies')
        .select('*')
        .eq('org_id', orgId)
        .ilike('name', company.name.trim())
        .limit(1)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing) {
        // Update existing company with new roles or details
        const { data, error } = await supabase
          .from('setup_companies')
          .update({
            ...company,
            name: company.name.trim(),
            company_type: legacyCompanyType,
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      // Insert new company
      const { data, error } = await supabase
        .from('setup_companies')
        .insert({
          ...company,
          name: company.name.trim(),
          company_type: legacyCompanyType,
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
      toast({ title: 'Success', description: 'Company saved successfully' });
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

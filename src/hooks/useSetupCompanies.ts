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
  is_owner?: boolean;
  is_operator?: boolean;
  is_technical_manager?: boolean;
  is_ism_manager?: boolean;
  is_doc_issuer?: boolean;
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
type RoleFlag = 'is_owner' | 'is_operator' | 'is_technical_manager' | 'is_ism_manager' | 'is_doc_issuer';

const roleColumn: Record<CompanyRole, RoleFlag> = {
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

      const { data, error } = await supabase
        .from('setup_companies')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data || []) as SetupCompany[];
      if (!companyType) return rows;

      // Prefer the new independent role flags. During the migration window,
      // fall back to the legacy company_type so the UI remains compatible with
      // databases that have not applied the new migration yet.
      const flag = roleColumn[companyType];
      return rows.filter(company => Boolean(company[flag]) || company.company_type === companyType);
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

      // Reuse an existing master record in this organization when the same
      // company name is entered for another role.
      const { data: existing, error: lookupError } = await supabase
        .from('setup_companies')
        .select('*')
        .eq('org_id', orgId)
        .ilike('name', company.name.trim())
        .limit(1)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing) {
        // The role flag is applied when the multi-role migration is available.
        // If the database is still on the legacy schema, retain the existing
        // record and do not fail the application because of the new field.
        const { data: roleUpdated, error: roleUpdateError } = await supabase
          .from('setup_companies')
          .update({ [roleFlag]: true })
          .eq('id', existing.id)
          .select()
          .single();

        if (!roleUpdateError) return roleUpdated;

        const { data, error } = await supabase
          .from('setup_companies')
          .update(company)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('setup_companies')
        .insert({ ...company, user_id: user.id, org_id: orgId })
        .select()
        .single();

      if (error) throw error;

      // Apply the additional role after creation. This second write is
      // intentionally best-effort so old databases remain functional until
      // the migration is applied.
      const { data: roleUpdated, error: roleUpdateError } = await supabase
        .from('setup_companies')
        .update({ [roleFlag]: true })
        .eq('id', data.id)
        .select()
        .single();

      return roleUpdateError ? data : roleUpdated;
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

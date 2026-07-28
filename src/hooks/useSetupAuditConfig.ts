import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { auditTypeSchema, findingTypeSchema, findingStatusSchema, rootCauseSchema, validate } from '@/lib/validations';

// Types for audit configuration tables
export interface AuditType {
  id: string;
  user_id: string;
  audit_type_name: string;
  description: string | null;
  frequency_months: number | null;
  is_external: boolean;
  created_at: string;
  updated_at: string;
}

export interface FindingType {
  id: string;
  user_id: string;
  finding_type_name: string;
  severity: 'minor' | 'major' | 'critical';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FindingStatus {
  id: string;
  user_id: string;
  status_name: string;
  status_order: number;
  is_closed: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface RootCause {
  id: string;
  user_id: string;
  cause_name: string;
  category: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Hook for Audit Types
export const useAuditTypes = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auditTypes = [], isLoading, error } = useQuery({
    queryKey: ['setup_audit_types', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_audit_types')
        .select('*')
        .eq('org_id', orgId)
        .order('audit_type_name', { ascending: true });
      if (error) throw error;
      return data as AuditType[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addAuditType = useMutation({
    mutationFn: async (auditType: Omit<AuditType, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(auditTypeSchema, auditType);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_audit_types')
        .insert({ ...auditType, user_id: user.id, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_audit_types'] });
      toast({ title: 'Success', description: 'Audit type added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateAuditType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AuditType> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_audit_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_audit_types'] });
      toast({ title: 'Success', description: 'Audit type updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAuditType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_audit_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_audit_types'] });
      toast({ title: 'Success', description: 'Audit type deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { auditTypes, isLoading, error, addAuditType, updateAuditType, deleteAuditType };
};

// Hook for Finding Types
export const useFindingTypes = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: findingTypes = [], isLoading, error } = useQuery({
    queryKey: ['setup_finding_types', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_finding_types')
        .select('*')
        .eq('org_id', orgId)
        .order('finding_type_name', { ascending: true });
      if (error) throw error;
      return data as FindingType[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addFindingType = useMutation({
    mutationFn: async (findingType: Omit<FindingType, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(findingTypeSchema, findingType);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_finding_types')
        .insert({ ...findingType, user_id: user.id, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_finding_types'] });
      toast({ title: 'Success', description: 'Finding type added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateFindingType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FindingType> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_finding_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_finding_types'] });
      toast({ title: 'Success', description: 'Finding type updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFindingType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_finding_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_finding_types'] });
      toast({ title: 'Success', description: 'Finding type deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { findingTypes, isLoading, error, addFindingType, updateFindingType, deleteFindingType };
};

// Hook for Finding Statuses
export const useFindingStatuses = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: findingStatuses = [], isLoading, error } = useQuery({
    queryKey: ['setup_finding_statuses', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_finding_statuses')
        .select('*')
        .eq('org_id', orgId)
        .order('status_order', { ascending: true });
      if (error) throw error;
      return data as FindingStatus[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addFindingStatus = useMutation({
    mutationFn: async (status: Omit<FindingStatus, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(findingStatusSchema, status);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_finding_statuses')
        .insert({ ...status, user_id: user.id, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_finding_statuses'] });
      toast({ title: 'Success', description: 'Finding status added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateFindingStatus = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FindingStatus> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_finding_statuses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_finding_statuses'] });
      toast({ title: 'Success', description: 'Finding status updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFindingStatus = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_finding_statuses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_finding_statuses'] });
      toast({ title: 'Success', description: 'Finding status deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { findingStatuses, isLoading, error, addFindingStatus, updateFindingStatus, deleteFindingStatus };
};

// Hook for Root Causes
export const useRootCauses = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rootCauses = [], isLoading, error } = useQuery({
    queryKey: ['setup_root_causes', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('setup_root_causes')
        .select('*')
        .eq('org_id', orgId)
        .order('cause_name', { ascending: true });
      if (error) throw error;
      return data as RootCause[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addRootCause = useMutation({
    mutationFn: async (cause: Omit<RootCause, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'org_id'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { error: validationError } = validate(rootCauseSchema, cause);
      if (validationError) throw new Error(validationError.errors[0]?.message || 'Invalid input');
      const { data, error } = await supabase
        .from('setup_root_causes')
        .insert({ ...cause, user_id: user.id, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_root_causes'] });
      toast({ title: 'Success', description: 'Root cause added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRootCause = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RootCause> & { id: string }) => {
      const { data, error } = await supabase
        .from('setup_root_causes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_root_causes'] });
      toast({ title: 'Success', description: 'Root cause updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRootCause = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('setup_root_causes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup_root_causes'] });
      toast({ title: 'Success', description: 'Root cause deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { rootCauses, isLoading, error, addRootCause, updateRootCause, deleteRootCause };
};

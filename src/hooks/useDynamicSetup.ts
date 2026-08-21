import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

export interface DynamicEntityField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
}

export interface DynamicSetupEntity {
  id: string;
  org_id: string;
  table_name: string;
  title: string;
  description: string | null;
  schema: DynamicEntityField[];
  created_at: string;
  updated_at: string;
}

export interface DynamicSetupRecord {
  id: string;
  entity_id: string;
  org_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useDynamicSetupEntities = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entities = [], isLoading, error } = useQuery({
    queryKey: ['dynamic_setup_entities', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('dynamic_setup_entities')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DynamicSetupEntity[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addEntity = useMutation({
    mutationFn: async (entity: Omit<DynamicSetupEntity, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id || !orgId) throw new Error('User not authenticated or no active organization');
      const { data, error } = await supabase
        .from('dynamic_setup_entities')
        .insert({ ...entity, org_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic_setup_entities'] });
      toast({ title: 'Success', description: 'Dynamic table created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { entities, isLoading, error, addEntity };
};

export const useDynamicSetupRecords = (entityId: string | null) => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ['dynamic_setup_records', orgId, entityId],
    queryFn: async () => {
      if (!orgId || !entityId) return [];
      const { data, error } = await supabase
        .from('dynamic_setup_records')
        .select('*')
        .eq('org_id', orgId)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DynamicSetupRecord[];
    },
    enabled: !!user?.id && !!orgId && !!entityId,
  });

  const addRecord = useMutation({
    mutationFn: async (recordData: Record<string, any>) => {
      if (!user?.id || !orgId || !entityId) throw new Error('Missing required context');
      const { data, error } = await supabase
        .from('dynamic_setup_records')
        .insert({
          entity_id: entityId,
          org_id: orgId,
          data: recordData,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic_setup_records', orgId, entityId] });
      toast({ title: 'Success', description: 'Record added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const { data: updated, error } = await supabase
        .from('dynamic_setup_records')
        .update({ data })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic_setup_records', orgId, entityId] });
      toast({ title: 'Success', description: 'Record updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dynamic_setup_records')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic_setup_records', orgId, entityId] });
      toast({ title: 'Success', description: 'Record deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const bulkAddRecords = useMutation({
    mutationFn: async (recordsData: Record<string, any>[]) => {
      if (!user?.id || !orgId || !entityId) throw new Error('Missing required context');
      
      const insertData = recordsData.map((data) => ({
        entity_id: entityId,
        org_id: orgId,
        data,
      }));

      const { data, error } = await supabase
        .from('dynamic_setup_records')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dynamic_setup_records', orgId, entityId] });
      toast({ title: 'Bulk Import Success', description: `Successfully imported ${data.length} records.` });
    },
    onError: (error: Error) => {
      toast({ title: 'Bulk Import Error', description: error.message, variant: 'destructive' });
    },
  });

  return { records, isLoading, error, addRecord, updateRecord, deleteRecord, bulkAddRecords };
};

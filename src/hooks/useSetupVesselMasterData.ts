import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

// ─── Generic factory that creates a typed hook for any simple setup table ───
function makeSetupHook<T extends { id: string; org_id: string; name: string; is_active: boolean }>(
  tableName: string,
  queryKey: string,
  orderField: string = 'name'
) {
  return () => {
    const { user } = useAuth();
    const { orgId } = useOrganization();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: items = [], isLoading, error } = useQuery({
      queryKey: [queryKey, orgId],
      queryFn: async () => {
        if (!orgId) return [];
        const { data, error } = await (supabase as any)
          .from(tableName)
          .select('*')
          .eq('org_id', orgId)
          .eq('is_active', true)
          .order(orderField, { ascending: true });
        if (error) throw error;
        return data as T[];
      },
      enabled: !!user?.id && !!orgId,
    });

    const addItem = useMutation({
      mutationFn: async (payload: Omit<T, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
        if (!orgId) throw new Error('No active organization');
        const { data, error } = await (supabase as any)
          .from(tableName)
          .insert({ ...payload, org_id: orgId })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        toast({ title: 'Success', description: 'Record added successfully' });
      },
      onError: (error: Error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });

    const updateItem = useMutation({
      mutationFn: async ({ id, ...updates }: Partial<T> & { id: string }) => {
        const { data, error } = await (supabase as any)
          .from(tableName)
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        toast({ title: 'Success', description: 'Record updated successfully' });
      },
      onError: (error: Error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });

    const deleteItem = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await (supabase as any).from(tableName).delete().eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        toast({ title: 'Success', description: 'Record deleted successfully' });
      },
      onError: (error: Error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });

    return { items, isLoading, error, addItem, updateItem, deleteItem };
  };
}

// ─── Type definitions ─────────────────────────────────────────────────────

export interface SetupVesselType { id: string; org_id: string; name: string; abbreviation: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupHullMaterial { id: string; org_id: string; name: string; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupHullCoating { id: string; org_id: string; coating_type: string; name: string; manufacturer: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupPropulsionType { id: string; org_id: string; name: string; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupFuelType { id: string; org_id: string; name: string; abbreviation: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupTradingArea { id: string; org_id: string; name: string; description: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupEngineMaker { id: string; org_id: string; maker_name: string; name: string; country: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupEngineModel { id: string; org_id: string; model_name: string; name: string; maker_id: string | null; engine_type: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupShipyard { id: string; org_id: string; yard_name: string; name: string; country: string | null; city: string | null; dock_type: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupPort { id: string; org_id: string; port_name: string; name: string; country: string | null; un_locode: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupMaintenanceTaskType { id: string; org_id: string; value: string; name: string; label: string; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupEquipmentCategory { id: string; org_id: string; name: string; parent_category: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupVesselLocation { id: string; org_id: string; value: string; name: string; label_en: string; label_ar: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupSeverityLevel { id: string; org_id: string; name: string; order_index: number; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupRiskCategory { id: string; org_id: string; name: string; description: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupRegulationCategory { id: string; org_id: string; name: string; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupSurveyType { id: string; org_id: string; name: string; description: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupSurveyor { id: string; org_id: string; name: string; company: string | null; license_number: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupAuditSpecialization { id: string; org_id: string; name: string; is_active: boolean; created_at: string; updated_at: string; }
export interface SetupCargoType { id: string; org_id: string; name: string; hazard_class: string | null; is_active: boolean; created_at: string; updated_at: string; }

// ─── Generated hooks ───────────────────────────────────────────────────────

export const useSetupVesselTypes       = makeSetupHook<SetupVesselType>('setup_vessel_types', 'setup_vessel_types');
export const useSetupHullMaterials     = makeSetupHook<SetupHullMaterial>('setup_hull_materials', 'setup_hull_materials');
export const useSetupPropulsionTypes   = makeSetupHook<SetupPropulsionType>('setup_propulsion_types', 'setup_propulsion_types');
export const useSetupFuelTypes         = makeSetupHook<SetupFuelType>('setup_fuel_types', 'setup_fuel_types');
export const useSetupTradingAreas      = makeSetupHook<SetupTradingArea>('setup_trading_areas', 'setup_trading_areas');
export const useSetupEngineMakers      = makeSetupHook<SetupEngineMaker>('setup_engine_makers', 'setup_engine_makers', 'maker_name');
export const useSetupEngineModels      = makeSetupHook<SetupEngineModel>('setup_engine_models', 'setup_engine_models', 'model_name');
export const useSetupSeverityLevels    = makeSetupHook<SetupSeverityLevel>('setup_severity_levels', 'setup_severity_levels', 'order_index');
export const useSetupRiskCategories    = makeSetupHook<SetupRiskCategory>('setup_risk_categories', 'setup_risk_categories');
export const useSetupRegulationCategories = makeSetupHook<SetupRegulationCategory>('setup_regulation_categories', 'setup_regulation_categories');
export const useSetupSurveyTypes       = makeSetupHook<SetupSurveyType>('setup_survey_types', 'setup_survey_types');
export const useSetupSurveyors         = makeSetupHook<SetupSurveyor>('setup_surveyors', 'setup_surveyors');
export const useSetupAuditSpecializations = makeSetupHook<SetupAuditSpecialization>('setup_audit_specializations', 'setup_audit_specializations');
export const useSetupCargoTypes        = makeSetupHook<SetupCargoType>('setup_cargo_types', 'setup_cargo_types');

// ─── Hull Coatings – ordered by coating_type ──────────────────────────────
export const useSetupHullCoatings = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hullCoatings = [], isLoading, error } = useQuery({
    queryKey: ['setup_hull_coatings', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await (supabase as any)
        .from('setup_hull_coatings')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('coating_type', { ascending: true });
      if (error) throw error;
      return data as SetupHullCoating[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addHullCoating = useMutation({
    mutationFn: async (payload: Pick<SetupHullCoating, 'coating_type' | 'manufacturer'>) => {
      if (!orgId) throw new Error('No active organization');
      const { data, error } = await (supabase as any)
        .from('setup_hull_coatings')
        .insert({ ...payload, org_id: orgId })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_hull_coatings'] }); toast({ title: 'Success', description: 'Hull coating added' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  const deleteHullCoating = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('setup_hull_coatings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_hull_coatings'] }); toast({ title: 'Success', description: 'Hull coating deleted' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  return { hullCoatings, isLoading, error, addHullCoating, deleteHullCoating };
};

// ─── Shipyards – ordered by yard_name ─────────────────────────────────────
export const useSetupShipyards = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shipyards = [], isLoading, error } = useQuery({
    queryKey: ['setup_shipyards', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await (supabase as any)
        .from('setup_shipyards')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('yard_name', { ascending: true });
      if (error) throw error;
      return data as SetupShipyard[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addShipyard = useMutation({
    mutationFn: async (payload: Pick<SetupShipyard, 'yard_name' | 'country' | 'city' | 'dock_type'>) => {
      if (!orgId) throw new Error('No active organization');
      const { data, error } = await (supabase as any)
        .from('setup_shipyards')
        .insert({ ...payload, org_id: orgId })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_shipyards'] }); toast({ title: 'Success', description: 'Shipyard added' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  const deleteShipyard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('setup_shipyards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_shipyards'] }); toast({ title: 'Success', description: 'Shipyard deleted' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  return { shipyards, isLoading, error, addShipyard, deleteShipyard };
};

// ─── Ports – ordered by port_name ─────────────────────────────────────────
export const useSetupPorts = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ports = [], isLoading, error } = useQuery({
    queryKey: ['setup_ports', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await (supabase as any)
        .from('setup_ports')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('port_name', { ascending: true });
      if (error) throw error;
      return data as SetupPort[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addPort = useMutation({
    mutationFn: async (payload: Pick<SetupPort, 'port_name' | 'country' | 'un_locode'>) => {
      if (!orgId) throw new Error('No active organization');
      const { data, error } = await (supabase as any)
        .from('setup_ports')
        .insert({ ...payload, org_id: orgId })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_ports'] }); toast({ title: 'Success', description: 'Port added' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  const deletePort = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('setup_ports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_ports'] }); toast({ title: 'Success', description: 'Port deleted' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  return { ports, isLoading, error, addPort, deletePort };
};

// ─── Maintenance Task Types & Locations ───────────────────────────────────
export const useSetupMaintenanceTaskTypes = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: taskTypes = [], isLoading, error } = useQuery({
    queryKey: ['setup_maintenance_task_types', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await (supabase as any)
        .from('setup_maintenance_task_types')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('label', { ascending: true });
      if (error) throw error;
      return data as SetupMaintenanceTaskType[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addTaskType = useMutation({
    mutationFn: async (payload: Pick<SetupMaintenanceTaskType, 'value' | 'label'>) => {
      if (!orgId) throw new Error('No active organization');
      const { data, error } = await (supabase as any)
        .from('setup_maintenance_task_types')
        .insert({ ...payload, org_id: orgId })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_maintenance_task_types'] }); toast({ title: 'Success', description: 'Task type added' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  const deleteTaskType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('setup_maintenance_task_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_maintenance_task_types'] }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  return { taskTypes, isLoading, error, addTaskType, deleteTaskType };
};

export const useSetupEquipmentCategories = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: equipmentCategories = [], isLoading, error } = useQuery({
    queryKey: ['setup_equipment_categories', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await (supabase as any)
        .from('setup_equipment_categories')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return data as SetupEquipmentCategory[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addEquipmentCategory = useMutation({
    mutationFn: async (payload: Pick<SetupEquipmentCategory, 'name' | 'parent_category'>) => {
      if (!orgId) throw new Error('No active organization');
      const { data, error } = await (supabase as any)
        .from('setup_equipment_categories')
        .insert({ ...payload, org_id: orgId })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_equipment_categories'] }); toast({ title: 'Success', description: 'Category added' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  const deleteEquipmentCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('setup_equipment_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_equipment_categories'] }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  return { equipmentCategories, isLoading, error, addEquipmentCategory, deleteEquipmentCategory };
};

export const useSetupVesselLocations = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vesselLocations = [], isLoading, error } = useQuery({
    queryKey: ['setup_vessel_locations', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await (supabase as any)
        .from('setup_vessel_locations')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('label_en', { ascending: true });
      if (error) throw error;
      return data as SetupVesselLocation[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const addVesselLocation = useMutation({
    mutationFn: async (payload: Pick<SetupVesselLocation, 'value' | 'label_en' | 'label_ar'>) => {
      if (!orgId) throw new Error('No active organization');
      const { data, error } = await (supabase as any)
        .from('setup_vessel_locations')
        .insert({ ...payload, org_id: orgId })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_vessel_locations'] }); toast({ title: 'Success', description: 'Location added' }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  const deleteVesselLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('setup_vessel_locations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['setup_vessel_locations'] }); },
    onError: (e: Error) => { toast({ title: 'Error', description: e.message, variant: 'destructive' }); },
  });

  return { vesselLocations, isLoading, error, addVesselLocation, deleteVesselLocation };
};

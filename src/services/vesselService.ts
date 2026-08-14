import { supabase } from '@/services/supabaseClient';
import { Vessel } from '@/hooks/useVessels';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { vesselSchema, validate } from '@/lib/validations';

/**
 * Service layer for vessel CRUD operations.
 * This abstracts Supabase client usage away from UI components and hooks.
 */
export const fetchVessels = async (orgId: string) => {
  const { data, error } = await supabase
    .from('vessels')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Vessel[];
};

export const addVessel = async (
  orgId: string,
  vessel: Omit<Vessel, 'id' | 'created_at' | 'updated_at' | 'org_id'>,
) => {
  const { data: validated, error: validationError } = validate(vesselSchema, vessel);
  if (validationError) {
    toast({
      title: 'Validation Error',
      description: validationError.errors[0]?.message || 'Invalid input',
      variant: 'destructive',
    });
    throw validationError;
  }
  const { data, error } = await supabase
    .from('vessels')
    .insert([{ ...validated, org_id: orgId }] as any)
    .select()
    .single();
  if (error) throw error;
  toast({ title: 'Success', description: 'Vessel added successfully' });
  return data as Vessel;
};

export const updateVessel = async (
  orgId: string,
  id: string,
  updates: Partial<Vessel>,
) => {
  const { data, error } = await supabase
    .from('vessels')
    .update(updates as any)
    .eq('id', id)
    .eq('org_id', orgId)
    .select()
    .single();
  if (error) throw error;
  toast({ title: 'Success', description: 'Vessel updated successfully' });
  return data as Vessel;
};

export const deleteVessel = async (orgId: string, id: string) => {
  const { error } = await supabase
    .from('vessels')
    .delete()
    .eq('id', id)
    .eq('org_id', orgId);
  if (error) throw error;
  toast({ title: 'Success', description: 'Vessel deleted successfully' });
};

export const uploadVesselAsset = async (
  orgId: string,
  file: File,
  vesselId?: string,
): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${vesselId || 'new'}/${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;
  const filePath = `${orgId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from('vessel-assets')
    .upload(filePath, file);
  if (uploadError) throw uploadError;
  return filePath;
};

export const getVesselAssetUrl = (path: string) => {
  if (!path) return '';
  const { data } = supabase.storage.from('vessel-assets').getPublicUrl(path);
  return data.publicUrl;
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { vesselSchema, validate } from '@/lib/validations';

export interface Vessel {
  id: string; name: string; imo_number: string | null; call_sign: string | null; mmsi_number: string | null; vessel_type: string | null; flag_state: string | null; gross_tonnage: number | null; deadweight: number | null; year_built: number | null; classification_society: string | null; status: string | null;
  official_number: string | null; port_of_registry: string | null; net_tonnage: number | null; length_overall: number | null; beam: number | null; depth: number | null; draft: number | null; engine_make: string | null; engine_model: string | null; engine_power: number | null; propulsion_type: string | null; max_speed: number | null; service_speed: number | null; fuel_consumption: number | null; fuel_type: string | null; lifeboats: number | null; liferafts: number | null; owner_company_id: string | null; operator_company_id: string | null; technical_manager_id: string | null; ism_manager_id: string | null; class_number: string | null; keel_laid_date: string | null; delivery_date: string | null; last_drydock_date: string | null; next_drydock_date: string | null; previous_yard: string | null; remaining_tasks: string | null; vessel_photos: string[] | null; vessel_brochure: string | null; painting_details: string | null; navigation_equipment: string | null; accommodations_pax: string | null; trading_area: string | null; hull_material: string | null; hull_coating: string | null; cargo_capacity: number | null; passenger_capacity: number | null; crew_capacity: number | null; insurance_value: number | null; purchase_price: number | null; currency: string | null; notes: string | null;
  ownership_mode_id?: string | null; vessel_status_id?: string | null; vessel_type_id?: string | null; propulsion_type_id?: string | null; fuel_type_id?: string | null; trading_area_id?: string | null; hull_material_id?: string | null; hull_coating_id?: string | null; port_of_registry_id?: string | null; operational_notes?: string | null; operational_status?: string | null; cabin_count?: number | null; additional_unmapped_specifications?: string | null;
  created_at: string; updated_at: string; org_id: string;
}

type VesselCreate = Partial<Omit<Vessel, 'id' | 'created_at' | 'updated_at' | 'org_id'>> & Pick<Vessel, 'name'>;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const toBase64 = (value: string) => btoa(unescape(encodeURIComponent(value)));

async function resumableStorageUpload(file: File, filePath: string, contentType: string, accessToken: string, projectRef: string) {
  const endpoint = `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;
  const chunkSize = 6 * 1024 * 1024;
  const metadata = [
    `bucketName ${toBase64('vessel-assets')}`,
    `objectName ${toBase64(filePath)}`,
    `contentType ${toBase64(contentType)}`,
    `cacheControl ${toBase64('3600')}`,
  ].join(',');

  const create = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Tus-Resumable': '1.0.0',
      'Upload-Length': String(file.size),
      'Upload-Metadata': metadata,
    },
  });
  if (!create.ok) throw new Error(`Resumable upload initialization failed (HTTP ${create.status})`);
  const location = create.headers.get('Location');
  if (!location) throw new Error('Resumable upload did not return an upload URL');

  let offset = 0;
  while (offset < file.size) {
    const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size));
    let response: Response | null = null;
    let lastError: unknown = null;
    for (const delay of [0, 2000, 5000, 10000]) {
      if (delay) await sleep(delay);
      try {
        response = await fetch(location, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Tus-Resumable': '1.0.0',
            'Upload-Offset': String(offset),
            'Content-Type': 'application/offset+octet-stream',
          },
          body: chunk,
        });
        if (response.ok) break;
        lastError = new Error(`Chunk upload failed (HTTP ${response.status})`);
      } catch (error) {
        lastError = error;
        response = null;
      }
    }
    if (!response?.ok) throw lastError instanceof Error ? lastError : new Error('Resumable upload failed');
    const nextOffset = Number(response.headers.get('Upload-Offset'));
    if (!Number.isFinite(nextOffset) || nextOffset <= offset) throw new Error('Storage returned an invalid upload offset');
    offset = nextOffset;
  }
}

export const useVessels = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { orgId } = useOrganization();
  const { toast } = useToast();

  const fetchVessels = async () => {
    if (!user || !orgId) { setVessels([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('vessels').select('*').eq('org_id', orgId).order('created_at', { ascending: false });
      if (error) throw error;
      setVessels((data as unknown as Vessel[]) || []);
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const addVessel = async (vessel: VesselCreate) => {
    if (!user || !orgId) return { error: new Error('Not authenticated or no active organization') };
    const { error: validationError } = validate(vesselSchema, vessel);
    if (validationError) { toast({ title: 'Validation Error', description: validationError.issues[0]?.message || 'Invalid input', variant: 'destructive' }); return { error: validationError }; }
    try {
      const { data, error } = await supabase.from('vessels').insert([{ ...vessel, org_id: orgId }] as any).select().single();
      if (error) throw error;
      setVessels(prev => [data as unknown as Vessel, ...prev]);
      toast({ title: 'Success', description: 'Vessel added successfully' });
      return { data, error: null };
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return { error }; }
  };

  const updateVessel = async (id: string, updates: Partial<Vessel>) => {
    if (!orgId) return { error: new Error('No active organization') };
    try {
      const { data, error } = await supabase.from('vessels').update(updates as any).eq('id', id).eq('org_id', orgId).select().single();
      if (error) throw error;
      setVessels(prev => prev.map(v => v.id === id ? (data as unknown as Vessel) : v));
      toast({ title: 'Success', description: 'Vessel updated successfully' });
      return { data, error: null };
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return { error }; }
  };

  const deleteVessel = async (id: string) => {
    if (!orgId) return { error: new Error('No active organization') };
    try {
      const { error } = await supabase.from('vessels').delete().eq('id', id).eq('org_id', orgId);
      if (error) throw error;
      setVessels(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Success', description: 'Vessel deleted successfully' });
      return { error: null };
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return { error }; }
  };

  const uploadVesselAsset = async (file: File, vesselId?: string): Promise<string | null> => {
    if (!user || !orgId) return null;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${vesselId || 'new'}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${orgId}/${fileName}`;
    const contentType = file.type || (fileExt === 'pdf' ? 'application/pdf' : 'application/octet-stream');
    const resumableThreshold = 6 * 1024 * 1024;

    try {
      if (file.size > resumableThreshold) {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error('Your login session has expired. Please sign in again and retry the upload.');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
        await resumableStorageUpload(file, filePath, contentType, accessToken, projectRef);
        return filePath;
      }

      const { error: uploadError } = await supabase.storage.from('vessel-assets').upload(filePath, file, {
        cacheControl: '3600',
        contentType,
        upsert: false,
      });
      if (uploadError) {
        const details = (uploadError as any).statusCode ? ` [HTTP ${(uploadError as any).statusCode}]` : '';
        throw new Error(`${uploadError.message || 'Storage upload failed'}${details}`);
      }
      return filePath;
    } catch (error: any) {
      console.error('Vessel asset upload failed', error);
      const message = error?.message || String(error) || 'Storage upload failed';
      toast({ title: 'Upload Failed', description: message, variant: 'destructive' });
      return null;
    }
  };

  const getVesselAssetUrl = (path: string) => {
    if (!path) return '';
    try { const { data } = supabase.storage.from('vessel-assets').getPublicUrl(path); return data.publicUrl; }
    catch (error: any) { console.error('Error generating public URL:', error); return ''; }
  };

  useEffect(() => { fetchVessels(); }, [user, orgId]);
  return { vessels, loading, addVessel, updateVessel, deleteVessel, uploadVesselAsset, getVesselAssetUrl, refetch: fetchVessels };
};

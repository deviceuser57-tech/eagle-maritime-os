import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CustomRegulation {
  id: string;
  user_id: string;
  code: string;
  title: string;
  description: string | null;
  category: string;
  version: string | null;
  link: string | null;
  file_url: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegulationVessel {
  id: string;
  regulation_id: string;
  vessel_id: string;
  compliance_status: string;
  notes: string | null;
  created_at: string;
}

export const useCustomRegulations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: regulations = [], isLoading } = useQuery({
    queryKey: ['custom_regulations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_regulations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CustomRegulation[];
    },
    enabled: !!user,
  });

  const { data: regulationVessels = [] } = useQuery({
    queryKey: ['regulation_vessels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regulation_vessels')
        .select('*, vessels(name)');
      if (error) throw error;
      return data as (RegulationVessel & { vessels: { name: string } | null })[];
    },
    enabled: !!user,
  });

  const createRegulation = useMutation({
    mutationFn: async (reg: Omit<CustomRegulation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('custom_regulations')
        .insert({ ...reg, user_id: user?.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_regulations'] });
      toast.success('Regulation added successfully');
    },
    onError: (e) => toast.error('Failed to add regulation: ' + e.message),
  });

  const deleteRegulation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_regulations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_regulations'] });
      queryClient.invalidateQueries({ queryKey: ['regulation_vessels'] });
      toast.success('Regulation deleted');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  const assignVessel = useMutation({
    mutationFn: async ({ regulation_id, vessel_id, compliance_status = 'pending' }: { regulation_id: string; vessel_id: string; compliance_status?: string }) => {
      const { data, error } = await supabase
        .from('regulation_vessels')
        .insert({ regulation_id, vessel_id, compliance_status } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulation_vessels'] });
      toast.success('Vessel assigned');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  const removeVesselAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('regulation_vessels').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulation_vessels'] });
      toast.success('Vessel removed from regulation');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });

  const uploadFile = async (file: File): Promise<{ url: string; name: string } | null> => {
    if (!user) return null;
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('regulations').upload(path, file);
    if (error) { toast.error('Upload failed: ' + error.message); return null; }
    const { data, error: signedError } = await supabase.storage
      .from('regulations')
      .createSignedUrl(path, 3600);
    if (signedError || !data) { toast.error('Failed to generate secure URL'); return null; }
    return { url: data.signedUrl, name: file.name };
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('regulations')
      .createSignedUrl(path, 3600);
    if (error || !data) return null;
    return data.signedUrl;
  };

  return {
    regulations,
    regulationVessels,
    isLoading,
    createRegulation,
    deleteRegulation,
    assignVessel,
    removeVesselAssignment,
    uploadFile,
    getSignedUrl,
  };
};

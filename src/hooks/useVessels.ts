import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { vesselSchema, validate } from '@/lib/validations';

export interface Vessel {
  id: string;
  name: string;
  imo_number: string | null;
  call_sign: string | null;
  mmsi_number: string | null;
  vessel_type: string | null;
  flag_state: string | null;
  gross_tonnage: number | null;
  deadweight: number | null;
  year_built: number | null;
  classification_society: string | null;
  status: string | null;
  // Extended fields
  official_number: string | null;
  port_of_registry: string | null;
  net_tonnage: number | null;
  length_overall: number | null;
  beam: number | null;
  depth: number | null;
  draft: number | null;
  engine_make: string | null;
  engine_model: string | null;
  engine_power: number | null;
  propulsion_type: string | null;
  max_speed: number | null;
  service_speed: number | null;
  fuel_consumption: number | null;
  fuel_type: string | null;
  lifeboats: number | null;
  liferafts: number | null;
  owner_company_id: string | null;
  operator_company_id: string | null;
  technical_manager_id: string | null;
  ism_manager_id: string | null;
  class_number: string | null;
  keel_laid_date: string | null;
  delivery_date: string | null;
  last_drydock_date: string | null;
  next_drydock_date: string | null;
  previous_dd_yard: string | null;
  dd_remaining_tasks: string | null;
  vessel_photos: string[] | null;
  vessel_brochure: string | null;
  painting_details: string | null;
  navigation_equipment: string | null;
  accommodations_pax: string | null;
  trading_area: string | null;
  hull_material: string | null;
  hull_coating: string | null;
  cargo_capacity: number | null;
  passenger_capacity: number | null;
  crew_capacity: number | null;
  insurance_value: number | null;
  purchase_price: number | null;
  currency: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useVessels = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVessels = async () => {
    if (!user) {
      setVessels([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVessels((data as unknown as Vessel[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addVessel = async (vessel: Omit<Vessel, 'id' | 'created_at' | 'updated_at'> & { user_id?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data: validated, error: validationError } = validate(vesselSchema, vessel);
    if (validationError) {
      toast({ title: 'Validation Error', description: validationError.errors[0]?.message || 'Invalid input', variant: 'destructive' });
      return { error: validationError };
    }

    try {
      const { data, error } = await supabase
        .from('vessels')
        .insert([{ ...validated, user_id: user.id }] as any)
        .select()
        .single();

      if (error) throw error;
      setVessels(prev => [data as unknown as Vessel, ...prev]);
      toast({ title: 'Success', description: 'Vessel added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateVessel = async (id: string, updates: Partial<Vessel>) => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setVessels(prev => prev.map(v => v.id === id ? (data as unknown as Vessel) : v));
      toast({ title: 'Success', description: 'Vessel updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteVessel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vessels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVessels(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Success', description: 'Vessel deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchVessels();
  }, [user]);

  return { vessels, loading, addVessel, updateVessel, deleteVessel, refetch: fetchVessels };
};

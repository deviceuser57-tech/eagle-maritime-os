import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { maintenanceTaskSchema, validate } from '@/lib/validations';

export interface MaintenanceTask {
  id: string;
  vessel_id: string | null;
  title: string;
  description: string | null;
  task_type: string;
  priority: string;
  status: string;
  due_date: string;
  completed_date: string | null;
  assigned_to: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  cost_estimate: number | null;
  actual_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vessels?: { name: string } | null;
}

export const useMaintenanceTasks = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*, vessels(name)')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
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

  const addTask = async (task: Omit<MaintenanceTask, 'id' | 'created_at' | 'updated_at' | 'vessels'> & { user_id?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error: validationError } = validate(maintenanceTaskSchema, task);
    if (validationError) {
      toast({ title: 'Validation Error', description: validationError.errors[0]?.message || 'Invalid input', variant: 'destructive' });
      return { error: validationError };
    }

    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert([{ ...task, user_id: user.id }])
        .select('*, vessels(name)')
        .single();

      if (error) throw error;
      setTasks(prev => [...prev, data].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
      toast({ title: 'Success', description: 'Maintenance task created successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    try {
      const { vessels, ...cleanUpdates } = updates as any;
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update(cleanUpdates)
        .eq('id', id)
        .select('*, vessels(name)')
        .single();

      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === id ? data : t));
      toast({ title: 'Success', description: 'Task updated successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Success', description: 'Task deleted successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return { tasks, loading, addTask, updateTask, deleteTask, refetch: fetchTasks };
};

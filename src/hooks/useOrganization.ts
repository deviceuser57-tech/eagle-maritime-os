import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_id?: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  role_id?: string;
  role?: string; // Derived from role_id join if needed
  email?: string; // Derived from user metadata if possible or specific query
  joined_at: string;
}

export const useOrganization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchOrganization() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Get the user's organization(s)
        // We currently assume a user belongs to one organization primarily for this view
        const { data: orgIds, error: memberError } = await supabase
          .from('organization_members')
          .select('org_id')
          .eq('user_id', user.id)
          .limit(1);

        if (memberError) throw memberError;

        if (!orgIds || orgIds.length === 0) {
          // User has no organization
          setOrganization(null);
          setLoading(false);
          return;
        }

        const orgId = orgIds[0].org_id;

        // 2. Get Organization Details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (orgError) throw orgError;
        setOrganization(orgData);

        // 3. Get Organization Members
        // Note: We need a way to get user emails. Usually this is in a public profile table or via edge function.
        // For now, we'll fetch the member records.
        const { data: membersData, error: membersError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('org_id', orgId);

        if (membersError) throw membersError;

        // Transform members to include some user info if possible (mocking email for now as we can't join auth.users directly easily from client)
        // In a real app, you'd fetch profiles from a public profiles table.
        // Let's see if we can fetch profiles.

        setMembers(membersData.map(m => ({
          ...m,
          joined_at: m.created_at,
          // We'll leave email undefined for now, or fetch from profiles if table exists
        })));

      } catch (err: any) {
        console.error('Error fetching organization:', err);
        setError(err);
        toast({
          title: 'Error loading organization',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, [user, toast]);

  const createOrganization = async (name: string, slug: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{ name, slug }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{ org_id: data.id, user_id: user.id }]);

      if (memberError) throw memberError;

      setOrganization(data);
      toast({ title: 'Organization created successfully' });
      return data;
    } catch (e: any) {
      toast({ title: 'Failed to create organization', description: e.message, variant: 'destructive' });
      throw e;
    }
  }

  return {
    organization,
    members,
    loading,
    error,
    createOrganization
  };
};

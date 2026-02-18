import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  role?: string;
  email?: string;
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
        const { data: orgIds, error: memberError } = await supabase
          .from('organization_members')
          .select('org_id')
          .eq('user_id', user.id)
          .limit(1);

        if (memberError) throw memberError;

        if (!orgIds || orgIds.length === 0) {
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
        const { data: membersData, error: membersError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('org_id', orgId);

        if (membersError) throw membersError;

        // Transform members
        setMembers(membersData.map(m => ({
          ...m,
          joined_at: m.created_at,
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
      // Use RPC function for atomic creation (defined in ENABLE_ORG_CREATION.sql)
      const { data, error } = await supabase.rpc('create_new_organization', {
        org_name: name,
        org_slug: slug
      });

      if (error) throw error;

      // Fetch the new org details
      const { data: newOrg, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;

      setOrganization(newOrg);

      // Refresh to ensure all data contexts are updated
      window.location.reload();

      toast({ title: 'Organization created successfully' });
      return newOrg;
    } catch (e: any) {
      console.error('Create Org Error:', e);
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

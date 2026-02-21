import { useEffect, useState, useCallback } from 'react';
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

export interface OrganizationInvitation {
  id: string;
  org_id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

export const useOrganization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrganization = useCallback(async () => {
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

      // 4. Get Organization Invitations
      // Check if table exists first (soft fail if migration not run)
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('org_id', orgId);

      // We don't throw heavily here because the table might not exist in older setups
      if (invitationsError) {
        if (invitationsError.code !== '42P01') { // undefined_table
          console.error('Error fetching invitations:', invitationsError);
        }
        setInvitations([]);
      } else {
        setInvitations(invitationsData || []);
      }

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
  }, [user, toast]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

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

  const inviteMember = async (email: string, role: string = 'member') => {
    if (!user || !organization) return;

    try {
      const { error } = await supabase
        .from('organization_invitations')
        .insert({
          org_id: organization.id,
          email,
          role,
          invited_by: user.id
        });

      if (error) throw error;

      toast({ title: 'Invitation sent', description: `Invited ${email}` });
      fetchOrganization(); // Refresh list
    } catch (e: any) {
      console.error('Invite Error:', e);
      if (e.code === '23505') { // Unique violation
        toast({ title: 'Already invited', description: 'This user has already been invited.', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to invite', description: e.message, variant: 'destructive' });
      }
      throw e;
    }
  };

  const revokeInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Invitation revoked' });
      fetchOrganization(); // Refresh list
    } catch (e: any) {
      console.error('Revoke Error:', e);
      toast({ title: 'Failed to revoke', description: e.message, variant: 'destructive' });
      throw e;
    }
  };

  return {
    orgId: organization?.id,
    organization,
    members,
    invitations,
    loading,
    error,
    createOrganization,
    inviteMember,
    revokeInvitation,
    fetchOrganization
  };

};

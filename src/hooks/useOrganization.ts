import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  userRole?: string;
}

export interface OrganizationMember {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  email?: string;
}

export interface OrganizationInvitation {
  id: string;
  org_id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
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
  const [orgId, setOrgId] = useState<string | null>(null);

  const fetchOrganizationData = useCallback(async () => {
    if (!user) {
      setOrganization(null);
      setMembers([]);
      setInvitations([]);
      setOrgId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. Get the organization the user belongs to
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('org_id, role, organizations(*)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (membership && membership.organizations) {
        const org = {
          ...(membership.organizations as any),
          userRole: membership.role
        };
        setOrganization(org);
        setOrgId(org.id);

        // 2. Fetch all members of this org
        const { data: allMembers, error: membersError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('org_id', org.id);

        if (membersError) throw membersError;
        setMembers(allMembers || []);

        // 3. Fetch pending invitations
        const { data: allInvites, error: invitesError } = await supabase
          .from('organization_invitations')
          .select('*')
          .eq('org_id', org.id)
          .eq('status', 'pending');

        if (invitesError) throw invitesError;
        setInvitations(allInvites || []);
      } else {
        setOrganization(null);
        setOrgId(null);
      }
    } catch (error: any) {
      console.error('Error fetching organization data:', error);
      toast({
        title: 'Organization Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchOrganizationData();
  }, [fetchOrganizationData]);

  const createOrganization = async (name: string, slug: string) => {
    if (!user) return;
    try {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name, slug }])
        .select()
        .single();

      if (orgError) throw orgError;

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          org_id: org.id,
          user_id: user.id,
          role: 'Super Admin'
        }]);

      if (memberError) throw memberError;

      toast({ title: 'Success', description: 'Organization created successfully' });
      fetchOrganizationData();
      return org;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return;
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Organization updated' });
      fetchOrganizationData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteOrganization = async () => {
    if (!organization) return;
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Organization deleted' });
      setOrganization(null);
      setOrgId(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const inviteMember = async (email: string, role: string = 'Member') => {
    if (!organization || !user) return;
    try {
      const { error: error } = await supabase
        .from('organization_invitations')
        .insert([{
          org_id: organization.id,
          email,
          role,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (error) throw error;
      toast({ title: 'Success', description: `Invitation sent to ${email}` });
      fetchOrganizationData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const revokeInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Invitation revoked' });
      fetchOrganizationData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const removeMember = async (userId: string) => {
    if (!organization) return;
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('org_id', organization.id)
        .eq('user_id', userId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Member removed' });
      fetchOrganizationData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const updateMemberRole = async (userId: string, role: string) => {
    if (!organization) return;
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('org_id', organization.id)
        .eq('user_id', userId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Role updated' });
      fetchOrganizationData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return {
    organization,
    members,
    invitations,
    loading,
    orgId,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteMember,
    revokeInvitation,
    removeMember,
    updateMemberRole,
    refetch: fetchOrganizationData
  };
};

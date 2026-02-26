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
  role_id: string;
  role?: string;
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
        .select('org_id, role:org_roles(name), organizations(*)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (membership && membership.organizations) {
        const org = {
          ...(membership.organizations as any),
          userRole: (membership as any).role?.name || 'Member'
        };
        setOrganization(org);
        setOrgId(org.id);

        // 2. Fetch all members of this org
        const { data: allMembers, error: membersError } = await supabase
          .from('organization_members')
          .select('*, role:org_roles(name)')
          .eq('org_id', org.id);

        if (membersError) throw membersError;
        const formattedMembers = (allMembers || []).map(m => ({
          ...m,
          role: (m as any).role?.name || 'Member'
        }));
        setMembers(formattedMembers);

        // 3. Fetch pending invitations - handle potential missing table gracefully
        const { data: allInvites, error: invitesError } = await supabase
          .from('organization_invitations')
          .select('*')
          .eq('org_id', org.id)
          .eq('status', 'pending');

        if (invitesError) {
          console.warn('Invitations Fetch Error (Non-critical):', invitesError.message);
          setInvitations([]);
        } else {
          setInvitations(allInvites || []);
        }
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

      // Create default roles for the new organization
      const { data: adminRole, error: roleError } = await supabase
        .from('org_roles')
        .insert([
          { org_id: org.id, name: 'Super Admin', permissions: ['*'] },
          { org_id: org.id, name: 'Admin', permissions: ['vessels.*', 'members.*'] },
          { org_id: org.id, name: 'Member', permissions: ['vessels.view'] }
        ])
        .select()
        .eq('name', 'Super Admin')
        .single();

      if (roleError) throw roleError;

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          org_id: org.id,
          user_id: user.id,
          role_id: adminRole.id
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

  const updateMemberRole = async (userId: string, roleName: string) => {
    if (!organization) return;
    try {
      // Get the role ID for this org
      const { data: roles, error: roleError } = await supabase
        .from('org_roles')
        .select('id')
        .eq('org_id', organization.id)
        .eq('name', roleName)
        .single();

      if (roleError) throw roleError;

      const { error } = await supabase
        .from('organization_members')
        .update({ role_id: roles.id })
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

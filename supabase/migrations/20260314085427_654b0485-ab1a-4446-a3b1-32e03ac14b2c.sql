
-- =====================================================
-- SECURITY HARDENING: Fix critical RLS vulnerabilities
-- =====================================================

-- 1. Fix organization_members: Replace dangerous public INSERT policy
DROP POLICY IF EXISTS "Service role can insert memberships" ON public.organization_members;

-- Only allow membership creation via SECURITY DEFINER functions (like create_new_organization)
-- No direct INSERT policy for regular users

-- 2. Enable RLS on org_roles and add proper policies
ALTER TABLE public.org_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their org roles"
  ON public.org_roles FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can manage org roles"
  ON public.org_roles FOR ALL TO authenticated
  USING (public.fn_is_org_admin(org_id))
  WITH CHECK (public.fn_is_org_admin(org_id));

-- 3. Fix invitation policies: ensure only admins can create/delete invitations
DROP POLICY IF EXISTS "Org members can create invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Org members can revoke invitations" ON public.organization_invitations;

-- Add role validation trigger for invitations
CREATE OR REPLACE FUNCTION public.validate_invitation_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    inviter_role TEXT;
BEGIN
    SELECT r.name INTO inviter_role
    FROM public.organization_members om
    JOIN public.org_roles r ON om.role_id = r.id
    WHERE om.user_id = auth.uid() AND om.org_id = NEW.org_id;
    
    IF inviter_role NOT IN ('Super Admin', 'Admin') 
       AND NEW.role IN ('Super Admin', 'Admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to invite with role: %', NEW.role;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_invitation_role_trigger ON public.organization_invitations;
CREATE TRIGGER validate_invitation_role_trigger
  BEFORE INSERT OR UPDATE ON public.organization_invitations
  FOR EACH ROW EXECUTE FUNCTION public.validate_invitation_role();

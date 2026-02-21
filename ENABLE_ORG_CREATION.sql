-- =====================================================
-- ENABLE ORGANIZATION CREATION SUPPORT
-- =====================================================

-- 1. Ensure basic roles exist (idempotent insert)
INSERT INTO public.org_roles (name, permissions)
SELECT 'Super Admin', '{"all": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.org_roles WHERE name = 'Super Admin');

INSERT INTO public.org_roles (name, permissions)
SELECT 'Admin', '{"manage_members": true, "manage_settings": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.org_roles WHERE name = 'Admin');

INSERT INTO public.org_roles (name, permissions)
SELECT 'Member', '{"view_only": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.org_roles WHERE name = 'Member');

-- 2. Create helper function to create Organization + Admin Membership atomically
-- This bypasses RLS issues where a user cannot select the organization until they are a member

-- DROP OLD VERSIONS TO PREVENT OVERLOADING CONFLICTS
DROP FUNCTION IF EXISTS public.create_new_organization(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_new_organization(TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.create_new_organization(org_name TEXT, org_slug TEXT, p_user_id UUID DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_org_id UUID;
  admin_role_id UUID;
  v_user_id UUID;
BEGIN
  -- Determine which user to use (passed parameter or auth.uid())
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID not found. Must be authenticated or provide p_user_id.';
  END IF;

  -- 1. Insert Org with Free Plan (Starter)
  INSERT INTO public.organizations (name, slug, plan_id)
  VALUES (
    org_name, 
    org_slug,
    (SELECT id FROM public.subscription_plans WHERE name = 'Starter' LIMIT 1)
  )
  RETURNING id INTO new_org_id;

  -- 2. Ensure roles exist for this SPECIFIC organization
  -- This aligns with the per-tenant role architecture seen in other migrations
  INSERT INTO public.org_roles (org_id, name, permissions)
  VALUES 
    (new_org_id, 'Super Admin', '{"all": true}'::jsonb),
    (new_org_id, 'Admin', '{"manage_members": true, "manage_settings": true}'::jsonb),
    (new_org_id, 'Member', '{"view_only": true}'::jsonb)
  RETURNING id INTO admin_role_id; -- This will return the last inserted ID (Member), so we select Super Admin below

  -- Get the Super Admin role ID for the newly created org
  SELECT id INTO admin_role_id FROM public.org_roles WHERE org_id = new_org_id AND name = 'Super Admin';

  -- 3. Insert Membership (Admin) for the target user
  INSERT INTO public.organization_members (org_id, user_id, role_id)
  VALUES (
    new_org_id, 
    v_user_id, 
    admin_role_id
  );

  RETURN new_org_id;
END;
$$;


-- 3. Grant execution permission
GRANT EXECUTE ON FUNCTION public.create_new_organization(TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_new_organization(TEXT, TEXT, UUID) TO service_role;


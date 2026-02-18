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
CREATE OR REPLACE FUNCTION public.create_new_organization(org_name TEXT, org_slug TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  admin_role_id UUID;
BEGIN
  -- Get Admin Role ID
  SELECT id INTO admin_role_id FROM public.org_roles WHERE name = 'Super Admin' LIMIT 1;

  -- 1. Insert Org with Free Plan (Starter)
  INSERT INTO public.organizations (name, slug, plan_id)
  VALUES (
    org_name, 
    org_slug,
    (SELECT id FROM public.subscription_plans WHERE name = 'Starter' LIMIT 1)
  )
  RETURNING id INTO new_org_id;

  -- 2. Insert Membership (Admin) for the current user
  INSERT INTO public.organization_members (org_id, user_id, role_id)
  VALUES (
    new_org_id, 
    auth.uid(), 
    admin_role_id
  );

  RETURN new_org_id;
END;
$$;

-- 3. Grant execution permission
GRANT EXECUTE ON FUNCTION public.create_new_organization(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_new_organization(TEXT, TEXT) TO service_role;

-- Fix organization creation RPC: remove multi-row RETURNING INTO that causes
-- "query returned more than one row" when inserting default roles.
CREATE OR REPLACE FUNCTION public.create_new_organization(
  org_name text,
  org_slug text,
  p_user_id uuid DEFAULT NULL::uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
DECLARE
  new_org_id UUID;
  admin_role_id UUID;
  v_user_id UUID;
BEGIN
  -- Determine which user to use (passed parameter or auth.uid())
  -- SECURE: Only allow p_user_id to be different from auth.uid() if service_role is used
  IF p_user_id IS NOT NULL AND p_user_id != auth.uid() AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Cannot create organization for another user.';
  END IF;

  v_user_id := COALESCE(p_user_id, auth.uid());

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID not found. Must be authenticated.';
  END IF;

  -- 1) Insert organization with Starter plan
  INSERT INTO public.organizations (name, slug, plan_id)
  VALUES (
    org_name,
    org_slug,
    (SELECT id FROM public.subscription_plans WHERE name = 'Starter' LIMIT 1)
  )
  RETURNING id INTO new_org_id;

  -- 2) Insert default roles (no RETURNING INTO from multi-row insert)
  INSERT INTO public.org_roles (org_id, name, permissions)
  VALUES
    (new_org_id, 'Super Admin', '{"all": true}'::jsonb),
    (new_org_id, 'Admin', '{"manage_members": true, "manage_settings": true}'::jsonb),
    (new_org_id, 'Member', '{"view_only": true}'::jsonb);

  -- 3) Fetch Super Admin role id for the new org
  SELECT id
  INTO admin_role_id
  FROM public.org_roles
  WHERE org_id = new_org_id
    AND name = 'Super Admin'
  LIMIT 1;

  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Failed to provision default Super Admin role.';
  END IF;

  -- 4) Insert creator membership with Super Admin role
  INSERT INTO public.organization_members (org_id, user_id, role_id)
  VALUES (new_org_id, v_user_id, admin_role_id);

  RETURN new_org_id;
END;
$function$;
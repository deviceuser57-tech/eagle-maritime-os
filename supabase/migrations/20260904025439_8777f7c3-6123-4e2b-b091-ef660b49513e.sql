CREATE OR REPLACE FUNCTION public.rpc_preview_invitation(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public','auth','pg_temp'
AS $$
DECLARE v_inv RECORD; v_email text; v_org_name text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT * INTO v_inv FROM public.organization_invitations WHERE token = p_token;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Invitation not found'); END IF;
  IF lower(v_inv.email) <> lower(v_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This invitation was issued to a different email address');
  END IF;
  IF v_inv.status <> 'pending' THEN RETURN jsonb_build_object('success', false, 'error', 'Invitation already ' || v_inv.status); END IF;
  IF v_inv.expires_at < now() THEN RETURN jsonb_build_object('success', false, 'error', 'Invitation expired'); END IF;

  SELECT name INTO v_org_name FROM public.organizations WHERE id = v_inv.org_id;
  RETURN jsonb_build_object('success', true, 'org_id', v_inv.org_id, 'org_name', v_org_name, 'role', v_inv.role, 'email', v_inv.email);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_accept_invitation(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','auth','pg_temp'
AS $$
DECLARE v_inv RECORD; v_email text; v_role_id uuid;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT * INTO v_inv FROM public.organization_invitations WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Invitation not found'); END IF;
  IF lower(v_inv.email) <> lower(v_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This invitation was issued to a different email address');
  END IF;
  IF v_inv.status <> 'pending' THEN RETURN jsonb_build_object('success', false, 'error', 'Invitation already ' || v_inv.status); END IF;
  IF v_inv.expires_at < now() THEN RETURN jsonb_build_object('success', false, 'error', 'Invitation expired'); END IF;

  SELECT id INTO v_role_id FROM public.org_roles
   WHERE org_id = v_inv.org_id AND name = COALESCE(v_inv.role, 'Member') LIMIT 1;
  IF v_role_id IS NULL THEN
    SELECT id INTO v_role_id FROM public.org_roles WHERE org_id = v_inv.org_id AND name = 'Member' LIMIT 1;
  END IF;

  INSERT INTO public.organization_members (org_id, user_id, role_id)
  VALUES (v_inv.org_id, auth.uid(), v_role_id)
  ON CONFLICT (org_id, user_id) DO UPDATE SET role_id = EXCLUDED.role_id;

  UPDATE public.organization_invitations SET status = 'accepted' WHERE id = v_inv.id;

  RETURN jsonb_build_object('success', true, 'org_id', v_inv.org_id, 'role', COALESCE(v_inv.role, 'Member'));
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_preview_invitation(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_accept_invitation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_preview_invitation(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_accept_invitation(uuid) TO authenticated, service_role;
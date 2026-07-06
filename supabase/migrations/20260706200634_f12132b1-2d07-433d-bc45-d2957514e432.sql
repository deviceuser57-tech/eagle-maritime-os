
-- 1) organization_members
DROP POLICY IF EXISTS "Users can add themselves to new organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Service role can insert memberships" ON public.organization_members;

-- 2) external_credentials
DROP POLICY IF EXISTS "Org members can manage external creds" ON public.external_credentials;
DROP POLICY IF EXISTS "Org-scoped access" ON public.external_credentials;

-- 3) webhook_endpoints
DROP POLICY IF EXISTS "Org-scoped access" ON public.webhook_endpoints;

-- 4) Consolidate duplicate policies
DROP POLICY IF EXISTS "Users can view their own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can create their own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can update their own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can delete their own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can view their own CII records" ON public.cii_records;
DROP POLICY IF EXISTS "Users can create their own CII records" ON public.cii_records;
DROP POLICY IF EXISTS "Users can update their own CII records" ON public.cii_records;
DROP POLICY IF EXISTS "Users can delete their own CII records" ON public.cii_records;
DROP POLICY IF EXISTS "Users can view their own crew members" ON public.crew_members;
DROP POLICY IF EXISTS "Users can create their own crew members" ON public.crew_members;
DROP POLICY IF EXISTS "Users can update their own crew members" ON public.crew_members;
DROP POLICY IF EXISTS "Users can delete their own crew members" ON public.crew_members;
DROP POLICY IF EXISTS "Users can view their own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can create their own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can update their own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can delete their own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Org Isolation" ON public.vessels;
DROP POLICY IF EXISTS "Users can view org vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can create org vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can update org vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can delete org vessels" ON public.vessels;

-- 5) vessel-assets storage
DROP POLICY IF EXISTS "Anyone can view vessel assets" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update vessel assets" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload vessel assets" ON storage.objects;

-- 6) SECURITY DEFINER RPCs cross-tenant guards
CREATE OR REPLACE FUNCTION public.rpc_calculate_vessel_compliance(p_vessel_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','auth','pg_temp'
AS $function$
DECLARE
    v_vessel RECORD; v_l1 NUMERIC; v_l2 NUMERIC; v_l3 NUMERIC; v_total NUMERIC; v_breach BOOLEAN := false;
BEGIN
    SELECT id, org_id INTO v_vessel FROM public.vessels WHERE id = p_vessel_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Vessel not found'); END IF;
    IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = auth.uid() AND org_id = v_vessel.org_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;
    SELECT CASE WHEN COUNT(*) = 0 THEN 100 ELSE ROUND((COUNT(*) FILTER (WHERE status = 'valid')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) END
    INTO v_l1 FROM public.vessel_certifications WHERE vessel_id = p_vessel_id;
    v_l2 := public.fn_get_regulatory_coverage(p_vessel_id);
    v_l3 := GREATEST(0, 100 - public.fn_get_finding_deductions(p_vessel_id));
    SELECT EXISTS (
        SELECT 1 FROM public.vessel_certifications vc
        JOIN public.setup_certificate_types ct ON vc.certificate_type = ct.certificate_name
        WHERE vc.vessel_id = p_vessel_id AND vc.status != 'valid' AND ct.is_mandatory = true
    ) INTO v_breach;
    v_total := (v_l1 * 0.30) + (v_l2 * 0.40) + (v_l3 * 0.30);
    IF v_breach THEN v_total := LEAST(v_total, 40); END IF;
    INSERT INTO public.vessel_compliance_scores (vessel_id, org_id, total_score, has_statutory_breach, last_calculated_at)
    VALUES (v_vessel.id, v_vessel.org_id, v_total, v_breach, now())
    ON CONFLICT (vessel_id) DO UPDATE SET total_score = v_total, has_statutory_breach = v_breach, last_calculated_at = now();
    RETURN jsonb_build_object('success', true, 'total_score', ROUND(v_total, 2), 'has_breach', v_breach);
END;
$function$;

CREATE OR REPLACE FUNCTION public.rpc_get_ai_vessel_insights(p_vessel_id uuid)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','auth','pg_temp'
AS $function$
DECLARE v_score RECORD; v_org_id UUID;
BEGIN
    SELECT org_id INTO v_org_id FROM public.vessels WHERE id = p_vessel_id;
    IF v_org_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Vessel not found'); END IF;
    IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = auth.uid() AND org_id = v_org_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;
    SELECT * INTO v_score FROM public.vessel_compliance_scores WHERE vessel_id = p_vessel_id;
    RETURN jsonb_build_object(
        'status', CASE WHEN v_score.total_score >= 80 THEN 'Exceptional' WHEN v_score.total_score >= 60 THEN 'Monitor' ELSE 'Critical' END,
        'recommendation', CASE WHEN v_score.has_statutory_breach THEN 'Immediate Certificate Renewal' ELSE 'Ongoing Maintenance' END
    );
END;
$function$;

-- 7) Strong credential encryption using a private random master key
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;

CREATE TABLE IF NOT EXISTS private.encryption_keys (
    key_name text PRIMARY KEY,
    key_value text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON private.encryption_keys FROM PUBLIC, anon, authenticated;

INSERT INTO private.encryption_keys (key_name, key_value)
SELECT 'credential_master', encode(gen_random_bytes(32), 'hex')
WHERE NOT EXISTS (SELECT 1 FROM private.encryption_keys WHERE key_name = 'credential_master');

CREATE OR REPLACE FUNCTION private.get_credential_key(p_org_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = private, pg_temp
AS $$
    SELECT key_value || '|' || p_org_id::text
    FROM private.encryption_keys
    WHERE key_name = 'credential_master'
    LIMIT 1;
$$;
REVOKE ALL ON FUNCTION private.get_credential_key(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.fn_encrypt_credential()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private, pg_temp
AS $$
DECLARE v_key text;
BEGIN
    v_key := private.get_credential_key(NEW.org_id);
    IF v_key IS NULL OR length(v_key) < 32 THEN
        RAISE EXCEPTION 'Encryption master key is not configured';
    END IF;
    NEW.encrypted_value := public.pgp_sym_encrypt(convert_from(NEW.encrypted_value, 'utf8'), v_key);
    RETURN NEW;
END;
$$;

-- 8) GraphQL hiding + execute-grant hardening
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('COMMENT ON TABLE public.%I IS %L', r.tablename, '@graphql({"visible": false})');
    END LOOP;
END $$;

REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.fn_is_org_member(uuid) FROM authenticated, PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.fn_is_org_admin(uuid) FROM authenticated, PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_auth_user_org_ids() FROM authenticated, PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_org_ids() FROM authenticated, PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_org_ids() FROM authenticated, PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.fn_get_regulatory_coverage(uuid) FROM authenticated, PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.fn_get_finding_deductions(uuid) FROM authenticated, PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_safe_execute(text, jsonb) FROM authenticated, PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_new_organization(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_vessel_compliance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_ai_vessel_insights(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_snapshot_compliance_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_fleet_compliance_index(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_log_cii_entry(uuid, uuid, integer, numeric, numeric, numeric, text, numeric, text) TO authenticated;

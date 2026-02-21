-- =====================================================
-- SECURITY HARDENING: FIXING IDENTIFIED VULNERABILITIES
-- (Defensive Version: Checks for existence to prevent 42P01 / 42883)
-- =====================================================

-- 1. STRENGTHEN CREDENTIAL STORAGE (Issue 1)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'external_credentials') THEN
        DROP POLICY IF EXISTS "Org members can manage external creds" ON public.external_credentials;
        CREATE POLICY "Admins can manage external creds" ON public.external_credentials
            FOR ALL TO authenticated
            USING (
                org_id IN (
                    SELECT om.org_id FROM public.organization_members om
                    JOIN public.org_roles r ON om.role_id = r.id
                    WHERE om.user_id = auth.uid() AND r.name IN ('Super Admin', 'Admin')
                )
            );
    END IF;
END $$;

-- 2. HARDEN WEBHOOK SECRET EXPOSURE (Issue 3)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webhook_endpoints') THEN
        DROP POLICY IF EXISTS "Org members can manage webhooks" ON public.webhook_endpoints;
        CREATE POLICY "Org members can see webhooks without secrets" ON public.webhook_endpoints
            FOR SELECT TO authenticated
            USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));
    END IF;
END $$;

-- 3. ENABLE RLS ON PUBLIC SCHEMA (Issue 4)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 4. HARDEN SECURITY DEFINER FUNCTIONS (Issue 5 & 10)

-- 4.1. Harden rpc_calculate_vessel_compliance
CREATE OR REPLACE FUNCTION public.rpc_calculate_vessel_compliance(p_vessel_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_vessel RECORD;
    v_l1_admin NUMERIC;
    v_l2_coverage NUMERIC;
    v_l3_findings NUMERIC;
    v_l4_risk NUMERIC;
    v_total_score NUMERIC;
    v_has_stat_breach BOOLEAN := false;
BEGIN
    -- AUTH & ORG VALIDATION
    SELECT id, org_id INTO v_vessel FROM public.vessels WHERE id = p_vessel_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Vessel not found'); END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE user_id = auth.uid() AND org_id = v_vessel.org_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You do not belong to this vessel''s organization');
    END IF;

    -- L1: Admin Readiness
    SELECT 
        CASE WHEN COUNT(*) = 0 THEN 100 
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'valid')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) 
        END INTO v_l1_admin
    FROM public.vessel_certifications WHERE vessel_id = p_vessel_id;

    -- L2: Coverage
    v_l2_coverage := public.fn_get_regulatory_coverage(p_vessel_id);

    -- L3: Findings
    v_l3_findings := GREATEST(0, 100 - public.fn_get_finding_deductions(p_vessel_id));

    -- L4: Risk
    SELECT 
        CASE cii_rating 
            WHEN 'A' THEN 100 WHEN 'B' THEN 100 WHEN 'C' THEN 100 
            WHEN 'D' THEN 90 WHEN 'E' THEN 80 ELSE 100 
        END INTO v_l4_risk
    FROM public.cii_records 
    WHERE vessel_id = p_vessel_id 
    ORDER BY year DESC LIMIT 1;
    v_l4_risk := COALESCE(v_l4_risk, 100);

    -- Statutory Breach Check
    SELECT EXISTS (
        SELECT 1 FROM public.vessel_certifications vc
        JOIN public.setup_certificate_types ct ON vc.certificate_type = ct.certificate_name
        WHERE vc.vessel_id = p_vessel_id AND vc.status != 'valid' AND ct.is_mandatory = true
    ) OR EXISTS (
        SELECT 1 FROM public.audit_findings af
        JOIN public.audits a ON af.audit_id = a.id
        WHERE a.vessel_id = p_vessel_id AND af.severity IN ('critical', 'major') AND af.status != 'closed'
    ) INTO v_has_stat_breach;

    -- Weighting Engine
    v_total_score := (v_l1_admin * 0.20) + (v_l2_coverage * 0.35) + (v_l3_findings * 0.30) + (v_l4_risk * 0.15);

    -- Kill-Switch
    IF v_has_stat_breach THEN
        v_total_score := LEAST(v_total_score, 40);
    END IF;

    -- Persist
    INSERT INTO public.vessel_compliance_scores (
        vessel_id, org_id, admin_score, coverage_score, findings_score, risk_score, total_score, has_statutory_breach
    )
    VALUES (
        v_vessel.id, v_vessel.org_id, v_l1_admin, v_l2_coverage, v_l3_findings, v_l4_risk, v_total_score, v_has_stat_breach
    )
    ON CONFLICT (vessel_id) DO UPDATE SET
        admin_score = EXCLUDED.admin_score,
        coverage_score = EXCLUDED.coverage_score,
        findings_score = EXCLUDED.findings_score,
        risk_score = EXCLUDED.risk_score,
        total_score = EXCLUDED.total_score,
        has_statutory_breach = EXCLUDED.has_statutory_breach,
        last_calculated_at = now();

    RETURN jsonb_build_object(
        'success', true,
        'total_score', ROUND(v_total_score, 2),
        'has_breach', v_has_stat_breach
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4.2. Harden rpc_get_fleet_compliance_index
CREATE OR REPLACE FUNCTION public.rpc_get_fleet_compliance_index(p_org_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_gt NUMERIC;
    v_fleet_score NUMERIC;
    v_vessel_count INTEGER;
    v_at_risk_count INTEGER;
BEGIN
    -- ORG VALIDATION
    IF NOT EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE user_id = auth.uid() AND org_id = p_org_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    SELECT SUM(v.gross_tonnage) INTO v_total_gt
    FROM public.vessels v
    JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
    WHERE vcs.org_id = p_org_id AND v.gross_tonnage > 0;

    IF v_total_gt IS NULL OR v_total_gt = 0 THEN
        SELECT AVG(total_score), COUNT(*) INTO v_fleet_score, v_vessel_count
        FROM public.vessel_compliance_scores
        WHERE org_id = p_org_id;
    ELSE
        SELECT 
            SUM(vcs.total_score * v.gross_tonnage) / v_total_gt,
            COUNT(vcs.vessel_id)
        INTO v_fleet_score, v_vessel_count
        FROM public.vessel_compliance_scores vcs
        JOIN public.vessels v ON vcs.vessel_id = v.id
        WHERE vcs.org_id = p_org_id;
    END IF;

    SELECT COUNT(*) INTO v_at_risk_count
    FROM public.vessel_compliance_scores
    WHERE org_id = p_org_id AND (total_score < 60 OR has_statutory_breach = true);

    RETURN jsonb_build_object(
        'success', true,
        'fleet_compliance_index', ROUND(v_fleet_score, 2),
        'vessel_count', v_vessel_count,
        'at_risk_count', v_at_risk_count,
        'is_weighted', (COALESCE(v_total_gt, 0) > 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4.3. Harden rpc_log_cii_entry
CREATE OR REPLACE FUNCTION public.rpc_log_cii_entry(
    p_org_id UUID,
    p_vessel_id UUID,
    p_year INTEGER,
    p_fuel_consumption NUMERIC,
    p_distance_travelled NUMERIC,
    p_cargo_carried NUMERIC,
    p_fuel_type TEXT,
    p_target_cii NUMERIC,
    p_notes TEXT DEFAULT NULL
) 
RETURNS JSONB AS $$
DECLARE
    v_attained_cii NUMERIC;
    v_rating TEXT;
    v_new_id UUID;
BEGIN
    -- ORG VALIDATION
    IF NOT EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE user_id = auth.uid() AND org_id = p_org_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Calculate metrics
    v_attained_cii := public.fn_calculate_attained_cii(
        p_fuel_consumption, 
        p_distance_travelled, 
        p_cargo_carried, 
        p_fuel_type
    );
    
    v_rating := public.fn_calculate_cii_rating(v_attained_cii, p_target_cii);

    INSERT INTO public.cii_records (
        org_id, user_id, vessel_id, year, cii_value, cii_rating, 
        target_value, fuel_consumption, distance_travelled, cargo_carried, notes
    )
    VALUES (
        p_org_id, auth.uid(), p_vessel_id, p_year, v_attained_cii, v_rating,
        p_target_cii, p_fuel_consumption, p_distance_travelled, p_cargo_carried, p_notes
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_new_id,
        'attained_cii', v_attained_cii,
        'rating', v_rating
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Internal database error during CII calculation');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. CREATE MISSING STORAGE BUCKETS (Issue 9)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crew-photos', 'crew-photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('vessel-assets', 'vessel-assets', true)
ON CONFLICT (id) DO NOTHING;


-- Policies for crew-photos
DO $$
BEGIN
    DROP POLICY IF EXISTS "Org members can upload crew photos" ON storage.objects;
    CREATE POLICY "Org members can upload crew photos" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'crew-photos');

    DROP POLICY IF EXISTS "Org members can view crew photos" ON storage.objects;
    CREATE POLICY "Org members can view crew photos" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'crew-photos');

    -- Policies for vessel-assets
    DROP POLICY IF EXISTS "Anyone can view vessel assets" ON storage.objects;
    CREATE POLICY "Anyone can view vessel assets" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'vessel-assets');

    DROP POLICY IF EXISTS "Org members can upload vessel assets" ON storage.objects;
    CREATE POLICY "Org members can upload vessel assets" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'vessel-assets');

    DROP POLICY IF EXISTS "Org members can update vessel assets" ON storage.objects;
    CREATE POLICY "Org members can update vessel assets" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'vessel-assets');
END $$;


-- 6. CORRECTIVE ACTION FOR "SEARCH PATH MUTABLE" (Issue 10)
-- Update existing functions to have a fixed search path
-- Note: ALTER FUNCTION does not support IF EXISTS in many Postgres versions, 
-- so we use a DO block for maximum compatibility.
DO $$
BEGIN
    -- update_updated_at_column
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
    END IF;
    
    -- handle_new_user
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
    END IF;
    
    -- fn_calculate_attained_cii (specific signature check)
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'fn_calculate_attained_cii') THEN
        ALTER FUNCTION public.fn_calculate_attained_cii(NUMERIC, NUMERIC, NUMERIC, TEXT) SET search_path = public;
    END IF;

    -- fn_calculate_cii_rating
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'fn_calculate_cii_rating') THEN
        ALTER FUNCTION public.fn_calculate_cii_rating(NUMERIC, NUMERIC) SET search_path = public;
    END IF;

    -- fn_get_finding_deductions
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'fn_get_finding_deductions') THEN
        ALTER FUNCTION public.fn_get_finding_deductions(UUID) SET search_path = public;
    END IF;

    -- fn_get_regulatory_coverage
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'fn_get_regulatory_coverage') THEN
        ALTER FUNCTION public.fn_get_regulatory_coverage(UUID) SET search_path = public;
    END IF;

    -- rpc_snapshot_compliance_history
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'rpc_snapshot_compliance_history') THEN
        ALTER FUNCTION public.rpc_snapshot_compliance_history() SET search_path = public;
    END IF;
END $$;

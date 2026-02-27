-- =====================================================
-- MULTITENANCY RECOVERY: ENSURE ALL TABLES HAVE ORG_ID
-- Addresses "column table.org_id does not exist" errors
-- =====================================================

DO $$
DECLARE
    table_name_var TEXT;
    target_tables TEXT[] := ARRAY[
        'vessels', 'audit_findings', 'auditors', 'audits', 'communications', 
        'corrective_actions', 'crew_members', 'custom_regulations', 
        'incidents', 'insurance_claims', 'maintenance_tasks', 
        'projects', 'project_vessels', 'reports', 'setup_audit_types', 
        'setup_certificate_types', 'setup_classification_societies', 
        'setup_companies', 'setup_contract_types', 'setup_crew_ranks', 
        'setup_currencies', 'setup_finding_statuses', 'setup_finding_types', 
        'setup_flag_states', 'setup_nationalities', 'setup_root_causes', 
        'vessel_certifications', 'voyages', 'regulation_vessels', 'cii_records',
        'vessel_compliance_history', 'vessel_compliance_scores', 'vessel_compliance_deductions',
        'external_credentials', 'webhook_endpoints'
    ];
BEGIN
    FOR table_name_var IN SELECT UNNEST(target_tables) LOOP
        -- 1. Add org_id column if it doesn't exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name_var) THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = table_name_var 
                AND column_name = 'org_id'
            ) THEN
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN org_id UUID REFERENCES public.organizations(id)', table_name_var);
                RAISE NOTICE 'Added org_id to %', table_name_var;
            END IF;

            -- 2. Backfill org_id from user_id if column exists and org_id is null
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = table_name_var 
                AND column_name = 'user_id'
            ) THEN
                EXECUTE format('
                    UPDATE public.%I t
                    SET org_id = (
                        SELECT org_id 
                        FROM public.organization_members 
                        WHERE user_id = t.user_id 
                        LIMIT 1
                    )
                    WHERE org_id IS NULL', table_name_var);
            END IF;

            -- 3. Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name_var);
            
            -- 4. Create/Update Org-scoped policy
            EXECUTE format('
                DROP POLICY IF EXISTS "Org-scoped access" ON public.%I;
                CREATE POLICY "Org-scoped access" ON public.%I
                FOR ALL TO authenticated
                USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
                WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))', 
                table_name_var, table_name_var);
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- HARDENED SYSTEM FUNCTIONS (AI & COMPLIANCE)
-- =====================================================

-- 1. Helper: Finding Deductions
CREATE OR REPLACE FUNCTION public.fn_get_finding_deductions(p_vessel_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_deduction NUMERIC := 0;
    v_finding RECORD;
BEGIN
    FOR v_finding IN 
        SELECT af.severity, af.status, ca.due_date, ca.completed_date
        FROM public.audit_findings af
        JOIN public.audits a ON af.audit_id = a.id
        LEFT JOIN public.corrective_actions ca ON ca.finding_id = af.id
        WHERE a.vessel_id = p_vessel_id AND af.status != 'closed'
    LOOP
        v_deduction := v_deduction + CASE v_finding.severity
            WHEN 'critical' THEN 40
            WHEN 'major' THEN 25
            WHEN 'minor' THEN 10
            ELSE 5 
        END;
        IF v_finding.due_date < CURRENT_DATE AND v_finding.completed_date IS NULL THEN
            v_deduction := v_deduction + 15;
        END IF;
    END LOOP;
    RETURN LEAST(80, v_deduction);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Main RPC: Multi-tenant Compliance Kernel
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
    SELECT id, org_id INTO v_vessel FROM public.vessels WHERE id = p_vessel_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Vessel unreachable.'); END IF;

    IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = auth.uid() AND org_id = v_vessel.org_id) THEN
         RETURN jsonb_build_object('success', false, 'error', 'Cross-tenant access denied.');
    END IF;

    -- Scoring logic
    SELECT CASE WHEN COUNT(*) = 0 THEN 100 ELSE ROUND((COUNT(*) FILTER (WHERE status = 'valid')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) END INTO v_l1_admin
    FROM public.vessel_certifications WHERE vessel_id = p_vessel_id;

    v_l2_coverage := public.fn_get_regulatory_coverage(p_vessel_id);
    v_l3_findings := GREATEST(0, 100 - public.fn_get_finding_deductions(p_vessel_id));

    SELECT CASE cii_rating WHEN 'A' THEN 100 WHEN 'B' THEN 100 WHEN 'C' THEN 100 WHEN 'D' THEN 90 WHEN 'E' THEN 80 ELSE 100 END INTO v_l4_risk
    FROM public.cii_records WHERE vessel_id = p_vessel_id ORDER BY year DESC LIMIT 1;
    v_l4_risk := COALESCE(v_l4_risk, 100);

    -- Breach detection
    SELECT EXISTS (
        SELECT 1 FROM public.vessel_certifications vc
        JOIN public.setup_certificate_types ct ON vc.certificate_type = ct.certificate_name
        WHERE vc.vessel_id = p_vessel_id AND vc.status != 'valid' AND ct.is_mandatory = true
    ) OR EXISTS (
        SELECT 1 FROM public.audit_findings af
        JOIN public.audits a ON af.audit_id = a.id
        WHERE a.vessel_id = p_vessel_id AND af.severity IN ('critical', 'major') AND af.status != 'closed'
    ) INTO v_has_stat_breach;

    v_total_score := (v_l1_admin * 0.20) + (v_l2_coverage * 0.35) + (v_l3_findings * 0.30) + (v_l4_risk * 0.15);
    IF v_has_stat_breach THEN v_total_score := LEAST(v_total_score, 40); END IF;

    INSERT INTO public.vessel_compliance_scores (vessel_id, org_id, total_score, has_statutory_breach)
    VALUES (v_vessel.id, v_vessel.org_id, v_total_score, v_has_stat_breach)
    ON CONFLICT (vessel_id) DO UPDATE SET total_score = EXCLUDED.total_score, has_statutory_breach = EXCLUDED.has_statutory_breach, last_calculated_at = now();

    RETURN jsonb_build_object('success', true, 'total_score', ROUND(v_total_score, 2));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

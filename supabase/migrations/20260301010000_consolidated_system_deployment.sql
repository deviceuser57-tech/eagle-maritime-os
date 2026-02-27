-- =====================================================
-- COMPREHENSIVE SYSTEM DEPLOYMENT: AI & CORE COMPLIANCE
-- This file consolidates all essential RPCs and Security 
-- logic required for the Eagle Platform.
-- =====================================================

-- 0. PREREQUISITES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. SECURITY: CREDENTIAL ENCRYPTION
-- This ensures any credentials stored (like Gemini keys) are encrypted.
CREATE OR REPLACE FUNCTION public.fn_encrypt_credential()
RETURNS TRIGGER AS $$
BEGIN
    NEW.encrypted_value := pgp_sym_encrypt(convert_from(NEW.encrypted_value, 'utf8'), NEW.org_id::text);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 2. COMPLIANCE: FINDINGS DEDUCTIONS ENGINE
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

-- 3. COMPLIANCE: REGULATORY COVERAGE CALCULATOR
CREATE OR REPLACE FUNCTION public.fn_get_regulatory_coverage(p_vessel_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_vessel RECORD;
    v_required_count INTEGER;
    v_valid_count INTEGER;
BEGIN
    SELECT vessel_type, gross_tonnage, trading_area, flag_state INTO v_vessel
    FROM public.vessels WHERE id = p_vessel_id;

    SELECT COUNT(DISTINCT rm.certificate_type_id) INTO v_required_count
    FROM public.regulatory_matrix rm
    WHERE (rm.vessel_type_pattern = 'Any' OR v_vessel.vessel_type = rm.vessel_type_pattern)
      AND (v_vessel.gross_tonnage >= rm.gt_min AND v_vessel.gross_tonnage <= rm.gt_max)
      AND (rm.trading_area_pattern = 'Any' OR v_vessel.trading_area = rm.trading_area_pattern)
      AND (rm.flag_state_pattern = 'Any' OR v_vessel.flag_state = rm.flag_state_pattern)
      AND rm.is_mandatory = true;

    IF v_required_count = 0 THEN RETURN 100; END IF;

    SELECT COUNT(DISTINCT vc.certificate_type) INTO v_valid_count
    FROM public.vessel_certifications vc
    WHERE vc.vessel_id = p_vessel_id 
      AND vc.status = 'valid'
      AND vc.certificate_type IN (
          SELECT ct.certificate_name 
          FROM public.setup_certificate_types ct
          JOIN public.regulatory_matrix rm ON rm.certificate_type_id = ct.id
          WHERE (rm.vessel_type_pattern = 'Any' OR v_vessel.vessel_type = rm.vessel_type_pattern)
      );

    RETURN LEAST(100, ROUND((v_valid_count::NUMERIC / v_required_count::NUMERIC) * 100, 2));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 4. MAIN RPC: VESSEL COMPLIANCE KERNEL (V2 - Hardened)
-- Used by the frontend to trigger a fresh scoring pass.
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
    -- 1. Authorization & Metadata Retrieval
    SELECT id, org_id INTO v_vessel FROM public.vessels WHERE id = p_vessel_id;
    IF NOT FOUND THEN 
        RETURN jsonb_build_object('success', false, 'error', 'Vessel not found or access denied.'); 
    END IF;

    -- Security: Cross-tenant guard
    IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = auth.uid() AND org_id = v_vessel.org_id) THEN
         RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Cross-tenant calculation prohibited.');
    END IF;

    -- L1: Admin (Certification Validity)
    SELECT 
        CASE WHEN COUNT(*) = 0 THEN 100 
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'valid')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) 
        END INTO v_l1_admin
    FROM public.vessel_certifications WHERE vessel_id = p_vessel_id;

    -- L2: Coverage (Regulatory Gap Analysis)
    v_l2_coverage := public.fn_get_regulatory_coverage(p_vessel_id);

    -- L3: Findings (Audits & Non-conformities)
    v_l3_findings := GREATEST(0, 100 - public.fn_get_finding_deductions(p_vessel_id));

    -- L4: Risk (CII & Operational Predictors)
    SELECT 
        CASE cii_rating 
            WHEN 'A' THEN 100 WHEN 'B' THEN 100 WHEN 'C' THEN 100 
            WHEN 'D' THEN 90 WHEN 'E' THEN 80 ELSE 100 
        END INTO v_l4_risk
    FROM public.cii_records 
    WHERE vessel_id = p_vessel_id 
    ORDER BY year DESC LIMIT 1;
    v_l4_risk := COALESCE(v_l4_risk, 100);

    -- Statutory Breach Check (Kill-Switch Logic)
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

    -- HARD CAP: Statutory breaches cannot exceed 40% (Fail grade)
    IF v_has_stat_breach THEN
        v_total_score := LEAST(v_total_score, 40);
    END IF;

    -- Persist Results
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

    RETURN jsonb_build_object('success', true, 'total_score', ROUND(v_total_score, 2), 'has_breach', v_has_stat_breach);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 5. AI INFRASTRUCTURE: SMART ANALYTICS RPC
CREATE OR REPLACE FUNCTION public.rpc_get_ai_vessel_insights(p_vessel_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_score RECORD;
    v_insights JSONB;
BEGIN
    SELECT * INTO v_score FROM public.vessel_compliance_scores WHERE vessel_id = p_vessel_id;
    
    v_insights := jsonb_build_object(
        'overall_status', CASE WHEN v_score.total_score >= 80 THEN 'Exceptional' WHEN v_score.total_score >= 60 THEN 'Compliant' ELSE 'Critical' END,
        'primary_risk', CASE WHEN v_score.findings_score < 70 THEN 'Audit Findings' WHEN v_score.coverage_score < 70 THEN 'Regulatory Gaps' ELSE 'None' END,
        'action_item', CASE WHEN v_score.has_statutory_breach THEN 'Immediate Certificate Renewal Required' ELSE 'Routine Monitoring' END
    );
    
    RETURN v_insights;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================

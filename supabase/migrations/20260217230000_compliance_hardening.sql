-- =====================================================
-- COMPLIANCE ENGINE: PRODUCTION HARDENING & GOVERNANCE
-- =====================================================

-- 1. Enhance Regulatory Matrix with Governance Fields
ALTER TABLE public.regulatory_matrix 
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS effective_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- 2. Add Severity Weights to Findings Setup
ALTER TABLE public.setup_finding_types 
ADD COLUMN IF NOT EXISTS default_deduction NUMERIC DEFAULT 10;

-- Update defaults
UPDATE public.setup_finding_types SET default_deduction = 40 WHERE severity = 'critical';
UPDATE public.setup_finding_types SET default_deduction = 25 WHERE severity = 'major';
UPDATE public.setup_finding_types SET default_deduction = 10 WHERE severity = 'minor';

-- 3. Refine Scoring Kernel for Strict Normalization (0-100)
CREATE OR REPLACE FUNCTION public.fn_get_finding_deductions(p_vessel_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_deduction NUMERIC := 0;
    v_finding RECORD;
BEGIN
    FOR v_finding IN 
        SELECT af.severity, af.status, ca.due_date, ca.completed_date, sft.default_deduction
        FROM public.audit_findings af
        JOIN public.audits a ON af.audit_id = a.id
        LEFT JOIN public.setup_finding_types sft ON af.severity = sft.severity -- Assuming severity matches
        LEFT JOIN public.corrective_actions ca ON ca.finding_id = af.id
        WHERE a.vessel_id = p_vessel_id AND af.status != 'closed'
    LOOP
        -- Severity Deductions (using DB weights)
        v_deduction := v_deduction + COALESCE(v_finding.default_deduction, 5);

        -- Overdue Corrective Action Deduction
        IF v_finding.due_date < CURRENT_DATE AND v_finding.completed_date IS NULL THEN
            v_deduction := v_deduction + 15;
        END IF;
    END LOOP;

    -- Pillar B: Deduction Cap (Strictly enforced at 100 for normalization)
    RETURN LEAST(100, v_deduction);
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Update Main Calculation for Strict 100 cap on Risk
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
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Vessel not found'); END IF;

    -- L1: Admin
    SELECT 
        CASE WHEN COUNT(*) = 0 THEN 100 
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'valid')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) 
        END INTO v_l1_admin
    FROM public.vessel_certifications WHERE vessel_id = p_vessel_id;

    -- L2: Coverage
    v_l2_coverage := public.fn_get_regulatory_coverage(p_vessel_id);

    -- L3: Findings (Enforce Floor 0)
    v_l3_findings := GREATEST(0, 100 - public.fn_get_finding_deductions(p_vessel_id));

    -- L4: Risk (Cap at 100)
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
        'total_score', v_total_score,
        'has_breach', v_has_stat_breach
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

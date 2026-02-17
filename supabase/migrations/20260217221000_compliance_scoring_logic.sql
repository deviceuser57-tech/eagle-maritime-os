-- =====================================================
-- COMPLIANCE ENGINE: THE SCORING KERNEL
-- =====================================================

-- 1. Helper: Get Finding Deductions (Layer 3)
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
        -- Severity Deductions
        v_deduction := v_deduction + CASE v_finding.severity
            WHEN 'critical' THEN 40
            WHEN 'major' THEN 25
            WHEN 'minor' THEN 10
            ELSE 5 -- observations
        END;

        -- Overdue Corrective Action Deduction
        IF v_finding.due_date < CURRENT_DATE AND v_finding.completed_date IS NULL THEN
            v_deduction := v_deduction + 15;
        END IF;
    END LOOP;

    -- Pillar B: Scoring Bounds (Cap at 60 points deduction unless critical)
    -- This prevents a vessel from having a negative score easily.
    IF v_deduction > 80 THEN v_deduction := 80; END IF;
    
    RETURN v_deduction;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Helper: Get Regulatory Coverage (Layer 2)
CREATE OR REPLACE FUNCTION public.fn_get_regulatory_coverage(p_vessel_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_vessel RECORD;
    v_required_count INTEGER;
    v_valid_count INTEGER;
BEGIN
    -- Get vessel specs
    SELECT vessel_type, gross_tonnage, trading_area, flag_state INTO v_vessel
    FROM public.vessels WHERE id = p_vessel_id;

    -- Count mandatory certificates required by matrix
    SELECT COUNT(DISTINCT rm.certificate_type_id) INTO v_required_count
    FROM public.regulatory_matrix rm
    WHERE (rm.vessel_type_pattern = 'Any' OR v_vessel.vessel_type = rm.vessel_type_pattern)
      AND (v_vessel.gross_tonnage >= rm.gt_min AND v_vessel.gross_tonnage <= rm.gt_max)
      AND (rm.trading_area_pattern = 'Any' OR v_vessel.trading_area = rm.trading_area_pattern)
      AND (rm.flag_state_pattern = 'Any' OR v_vessel.flag_state = rm.flag_state_pattern)
      AND rm.is_mandatory = true;

    IF v_required_count = 0 THEN RETURN 100; END IF;

    -- Count how many of those mandatory certs are valid
    SELECT COUNT(DISTINCT vc.certificate_type) INTO v_valid_count
    FROM public.vessel_certifications vc
    WHERE vc.vessel_id = p_vessel_id 
      AND vc.status = 'valid'
      AND vc.certificate_type IN (
          SELECT ct.certificate_name -- Assuming certificate_type in vc matches name in ct
          FROM public.setup_certificate_types ct
          JOIN public.regulatory_matrix rm ON rm.certificate_type_id = ct.id
          WHERE (rm.vessel_type_pattern = 'Any' OR v_vessel.vessel_type = rm.vessel_type_pattern)
            AND (v_vessel.gross_tonnage >= rm.gt_min AND v_vessel.gross_tonnage <= rm.gt_max)
      );

    RETURN LEAST(100, ROUND((v_valid_count::NUMERIC / v_required_count::NUMERIC) * 100, 2));
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. MAIN RPC: Calculate Vessel Compliance Score
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
    -- Get vessel
    SELECT id, org_id INTO v_vessel FROM public.vessels WHERE id = p_vessel_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Vessel not found'); END IF;

    -- Layer 1: Admin Readiness (Basic Validity)
    SELECT 
        CASE WHEN COUNT(*) = 0 THEN 100 
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'valid')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) 
        END INTO v_l1_admin
    FROM public.vessel_certifications WHERE vessel_id = p_vessel_id;

    -- Layer 2: Regulatory Coverage
    v_l2_coverage := public.fn_get_regulatory_coverage(p_vessel_id);

    -- Layer 3: Findings Severity
    v_l3_findings := 100 - public.fn_get_finding_deductions(p_vessel_id);

    -- Layer 4: Operational Risk (Simplified for MVP)
    -- CII Rating Impact: A(+10), E(-20)
    SELECT 
        CASE cii_rating 
            WHEN 'A' THEN 110 WHEN 'B' THEN 105 WHEN 'C' THEN 100 
            WHEN 'D' THEN 90 WHEN 'E' THEN 80 ELSE 100 
        END INTO v_l4_risk
    FROM public.cii_records 
    WHERE vessel_id = p_vessel_id 
    ORDER BY year DESC LIMIT 1;
    v_l4_risk := COALESCE(v_l4_risk, 100);

    -- Pillar B: Governance (Statutory Breach Check)
    -- Check for expired mandatory certs or major findings
    SELECT EXISTS (
        SELECT 1 FROM public.vessel_certifications vc
        JOIN public.setup_certificate_types ct ON vc.certificate_type = ct.certificate_name
        WHERE vc.vessel_id = p_vessel_id AND vc.status != 'valid' AND ct.is_mandatory = true
    ) OR EXISTS (
        SELECT 1 FROM public.audit_findings af
        JOIN public.audits a ON af.audit_id = a.id
        WHERE a.vessel_id = p_vessel_id AND af.severity IN ('critical', 'major') AND af.status != 'closed'
    ) INTO v_has_stat_breach;

    -- Pillar C: Weighting Engine (20% L1, 35% L2, 30% L3, 15% L4)
    v_total_score := (v_l1_admin * 0.20) + (v_l2_coverage * 0.35) + (v_l3_findings * 0.30) + (v_l4_risk * 0.15);

    -- Normalization Floor
    IF v_has_stat_breach THEN
        v_total_score := LEAST(v_total_score, 40); -- Hard cap for serious breaches
    END IF;

    -- Final persistence
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
        'layers', jsonb_build_object(
            'admin', v_l1_admin,
            'coverage', v_l2_coverage,
            'findings', v_l3_findings,
            'risk', v_l4_risk
        ),
        'has_breach', v_has_stat_breach
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

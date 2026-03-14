
-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.fn_get_finding_deductions(p_vessel_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE v_deduction NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(CASE severity 
        WHEN 'critical' THEN 40 WHEN 'major' THEN 25 WHEN 'minor' THEN 10 ELSE 5 END), 0) INTO v_deduction
    FROM public.audit_findings af
    JOIN public.audits a ON af.audit_id = a.id
    WHERE a.vessel_id = p_vessel_id AND af.status != 'closed';
    RETURN LEAST(80, v_deduction);
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_get_regulatory_coverage(p_vessel_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_vessel RECORD; v_required INTEGER; v_valid INTEGER;
BEGIN
    SELECT vessel_type, gross_tonnage, trading_area INTO v_vessel FROM public.vessels WHERE id = p_vessel_id;
    SELECT COUNT(*) INTO v_required FROM public.regulatory_matrix rm
    WHERE (rm.vessel_type_pattern = 'Any' OR v_vessel.vessel_type = rm.vessel_type_pattern)
      AND (v_vessel.gross_tonnage >= rm.gt_min AND v_vessel.gross_tonnage <= rm.gt_max)
      AND rm.is_mandatory = true;
    IF v_required = 0 THEN RETURN 100; END IF;
    SELECT COUNT(*) INTO v_valid FROM public.vessel_certifications
    WHERE vessel_id = p_vessel_id AND status = 'valid';
    RETURN LEAST(100, ROUND((v_valid::NUMERIC / v_required::NUMERIC) * 100, 2));
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_calculate_vessel_compliance(p_vessel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_vessel RECORD; v_l1 NUMERIC; v_l2 NUMERIC; v_l3 NUMERIC; v_total NUMERIC; v_breach BOOLEAN := false;
BEGIN
    SELECT id, org_id INTO v_vessel FROM public.vessels WHERE id = p_vessel_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Vessel not found'); END IF;
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
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_ai_vessel_insights(p_vessel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE v_score RECORD;
BEGIN
    SELECT * INTO v_score FROM public.vessel_compliance_scores WHERE vessel_id = p_vessel_id;
    RETURN jsonb_build_object(
        'status', CASE WHEN v_score.total_score >= 80 THEN 'Exceptional' WHEN v_score.total_score >= 60 THEN 'Monitor' ELSE 'Critical' END,
        'recommendation', CASE WHEN v_score.has_statutory_breach THEN 'Immediate Certificate Renewal' ELSE 'Ongoing Maintenance' END
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_invitation_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE inviter_role TEXT;
BEGIN
    SELECT r.name INTO inviter_role
    FROM public.organization_members om
    JOIN public.org_roles r ON om.role_id = r.id
    WHERE om.user_id = auth.uid() AND om.org_id = NEW.org_id;
    IF inviter_role NOT IN ('Super Admin', 'Admin') AND NEW.role IN ('Super Admin', 'Admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to invite with role: %', NEW.role;
    END IF;
    RETURN NEW;
END;
$$;

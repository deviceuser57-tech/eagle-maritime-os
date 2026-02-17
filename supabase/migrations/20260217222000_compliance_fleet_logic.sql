-- =====================================================
-- COMPLIANCE ENGINE: FLEET AGGREGATION
-- =====================================================

-- 1. RPC: Calculate Fleet Compliance Index (Tonnage-Weighted)
CREATE OR REPLACE FUNCTION public.rpc_get_fleet_compliance_index(p_org_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_gt NUMERIC;
    v_weighted_score_sum NUMERIC;
    v_fleet_score NUMERIC;
    v_vessel_count INTEGER;
    v_at_risk_count INTEGER;
BEGIN
    -- Calculate total GT for vessels with a calculated score
    SELECT SUM(v.gross_tonnage) INTO v_total_gt
    FROM public.vessels v
    JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
    WHERE vcs.org_id = p_org_id AND v.gross_tonnage > 0;

    IF v_total_gt IS NULL OR v_total_gt = 0 THEN
        -- Fallback to simple average if GT is missing
        SELECT AVG(total_score), COUNT(*) INTO v_fleet_score, v_vessel_count
        FROM public.vessel_compliance_scores
        WHERE org_id = p_org_id;
    ELSE
        -- Pillar D: Tonnage-Weighted Aggregation
        SELECT 
            SUM(vcs.total_score * v.gross_tonnage) / v_total_gt,
            COUNT(vcs.vessel_id)
        INTO v_fleet_score, v_vessel_count
        FROM public.vessel_compliance_scores vcs
        JOIN public.vessels v ON vcs.vessel_id = v.id
        WHERE vcs.org_id = p_org_id;
    END IF;

    -- Stats for the dashboard
    SELECT COUNT(*) INTO v_at_risk_count
    FROM public.vessel_compliance_scores
    WHERE org_id = p_org_id AND (total_score < 60 OR has_statutory_breach = true);

    RETURN jsonb_build_object(
        'success', true,
        'fleet_compliance_index', ROUND(v_fleet_score, 2),
        'vessel_count', v_vessel_count,
        'at_risk_count', v_at_risk_count,
        'is_weighted', (v_total_gt > 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to update history daily (can be called by a cron)
CREATE OR REPLACE FUNCTION public.rpc_snapshot_compliance_history()
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.vessel_compliance_history (vessel_id, org_id, total_score, recorded_date)
    SELECT vessel_id, org_id, total_score, CURRENT_DATE
    FROM public.vessel_compliance_scores
    ON CONFLICT (vessel_id, recorded_date) DO UPDATE SET
        total_score = EXCLUDED.total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

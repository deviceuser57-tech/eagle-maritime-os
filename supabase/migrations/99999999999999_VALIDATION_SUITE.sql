-- =====================================================
-- COMPLIANCE ENGINE: TECHNICAL VALIDATION SUITE
-- =====================================================
-- Purpose: Validate all scoring scenarios before production closure
-- Date: 2026-02-18
-- Status: VALIDATION ONLY - NO MODIFICATIONS

-- =====================================================
-- SCENARIO 1: BASELINE (FULLY COMPLIANT FLEET)
-- =====================================================

-- Test Data Setup
DO $$
DECLARE
    v_org_id UUID := gen_random_uuid();
    v_vessel_1 UUID := gen_random_uuid();
    v_vessel_2 UUID := gen_random_uuid();
    v_result JSONB;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCENARIO 1: BASELINE VALIDATION';
    RAISE NOTICE '========================================';

    -- Create test organization
    INSERT INTO public.organizations (id, name, slug) VALUES (v_org_id, 'TEST_ORG_BASELINE', 'test-org-baseline');

    -- Create two fully compliant vessels
    INSERT INTO public.vessels (id, org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area)
    VALUES 
        (v_vessel_1, v_org_id, 'MV COMPLIANT ALPHA', 'IMO9999001', 'Bulk Carrier', 50000, 'Panama', 'International'),
        (v_vessel_2, v_org_id, 'MV COMPLIANT BETA', 'IMO9999002', 'Container', 75000, 'Liberia', 'International');

    -- Add all mandatory certificates (valid status)
    INSERT INTO public.vessel_certifications (vessel_id, org_id, user_id, certificate_name, certificate_type, status, issue_date, expiry_date)
    VALUES
        (v_vessel_1, v_org_id, '00000000-0000-0000-0000-000000000000', 'Safety Management Certificate', 'SMC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_vessel_1, v_org_id, '00000000-0000-0000-0000-000000000000', 'Document of Compliance', 'DOC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_vessel_1, v_org_id, '00000000-0000-0000-0000-000000000000', 'ISPS Certificate', 'ISPS', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_vessel_2, v_org_id, '00000000-0000-0000-0000-000000000000', 'Safety Management Certificate', 'SMC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_vessel_2, v_org_id, '00000000-0000-0000-0000-000000000000', 'Document of Compliance', 'DOC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_vessel_2, v_org_id, '00000000-0000-0000-0000-000000000000', 'ISPS Certificate', 'ISPS', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months');

    -- Add excellent CII ratings
    INSERT INTO public.cii_records (vessel_id, org_id, year, cii_value, cii_rating)
    VALUES
        (v_vessel_1, v_org_id, 2024, 3.2, 'A'),
        (v_vessel_2, v_org_id, 2024, 3.5, 'B');

    -- Calculate compliance scores
    v_result := public.rpc_calculate_vessel_compliance(v_vessel_1);
    RAISE NOTICE 'Vessel 1 Result: %', v_result;

    v_result := public.rpc_calculate_vessel_compliance(v_vessel_2);
    RAISE NOTICE 'Vessel 2 Result: %', v_result;

    -- Get fleet index
    v_result := public.rpc_get_fleet_compliance_index(v_org_id);
    RAISE NOTICE 'Fleet Index: %', v_result;

    -- Validation Checks
    RAISE NOTICE '--- VALIDATION CHECKS ---';
    
    -- Check 1: All layer scores should be high (>90)
    PERFORM 1 FROM public.vessel_compliance_scores 
    WHERE vessel_id IN (v_vessel_1, v_vessel_2)
    AND admin_score >= 90 AND coverage_score >= 90 AND findings_score >= 90;
    
    IF FOUND THEN
        RAISE NOTICE '✓ PASS: Layer scores are balanced and high';
    ELSE
        RAISE WARNING '✗ FAIL: Layer scores below expected baseline';
    END IF;

    -- Check 2: Fleet index should be >85
    IF (v_result->>'fleet_compliance_index')::NUMERIC >= 85 THEN
        RAISE NOTICE '✓ PASS: Fleet index is within realistic high range (%.2f)', (v_result->>'fleet_compliance_index')::NUMERIC;
    ELSE
        RAISE WARNING '✗ FAIL: Fleet index too low for fully compliant fleet';
    END IF;

    -- Check 3: No statutory breaches
    PERFORM 1 FROM public.vessel_compliance_scores 
    WHERE vessel_id IN (v_vessel_1, v_vessel_2) AND has_statutory_breach = true;
    
    IF NOT FOUND THEN
        RAISE NOTICE '✓ PASS: No false statutory breach flags';
    ELSE
        RAISE WARNING '✗ FAIL: Statutory breach incorrectly flagged';
    END IF;

    -- Cleanup
    DELETE FROM public.vessel_compliance_scores WHERE org_id = v_org_id;
    DELETE FROM public.cii_records WHERE org_id = v_org_id;
    DELETE FROM public.vessel_certifications WHERE org_id = v_org_id;
    DELETE FROM public.vessels WHERE org_id = v_org_id;
    DELETE FROM public.organizations WHERE id = v_org_id;

    RAISE NOTICE 'SCENARIO 1: COMPLETE';
    RAISE NOTICE '';
END $$;


-- =====================================================
-- SCENARIO 2: REGULATORY GAP (MISSING MANDATORY CERT)
-- =====================================================

DO $$
DECLARE
    v_org_id UUID := gen_random_uuid();
    v_vessel_id UUID := gen_random_uuid();
    v_result JSONB;
    v_coverage_score NUMERIC;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCENARIO 2: REGULATORY GAP VALIDATION';
    RAISE NOTICE '========================================';

    INSERT INTO public.organizations (id, name, slug) VALUES (v_org_id, 'TEST_ORG_GAP', 'test-org-gap');

    INSERT INTO public.vessels (id, org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area)
    VALUES (v_vessel_id, v_org_id, 'MV MISSING CERT', 'IMO9999003', 'Tanker', 60000, 'Marshall Islands', 'International');

    -- Add ONLY 2 out of 3 mandatory certificates (missing ISPS)
    INSERT INTO public.vessel_certifications (vessel_id, org_id, user_id, certificate_name, certificate_type, status, issue_date, expiry_date)
    VALUES
        (v_vessel_id, v_org_id, '00000000-0000-0000-0000-000000000000', 'Safety Management Certificate', 'SMC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_vessel_id, v_org_id, '00000000-0000-0000-0000-000000000000', 'Document of Compliance', 'DOC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months');
        -- ISPS is MISSING

    -- Calculate compliance
    v_result := public.rpc_calculate_vessel_compliance(v_vessel_id);
    RAISE NOTICE 'Vessel Result: %', v_result;

    SELECT coverage_score INTO v_coverage_score FROM public.vessel_compliance_scores WHERE vessel_id = v_vessel_id;

    -- Validation Checks
    RAISE NOTICE '--- VALIDATION CHECKS ---';

    -- Check 1: Coverage layer should drop (should be <100)
    IF v_coverage_score < 100 THEN
        RAISE NOTICE '✓ PASS: Coverage layer correctly reflects missing certificate (%.2f)', v_coverage_score;
    ELSE
        RAISE WARNING '✗ FAIL: Coverage layer did not detect missing certificate';
    END IF;

    -- Check 2: Total score should be impacted
    IF (v_result->'total_score')::NUMERIC < 85 THEN
        RAISE NOTICE '✓ PASS: Total score reflects regulatory gap (%.2f)', (v_result->'total_score')::NUMERIC;
    ELSE
        RAISE WARNING '✗ FAIL: Total score not sufficiently impacted by gap';
    END IF;

    -- Check 3: Vessel should be flagged as deficient (score <80 or breach)
    PERFORM 1 FROM public.vessel_compliance_scores 
    WHERE vessel_id = v_vessel_id AND (total_score < 80 OR has_statutory_breach = true);
    
    IF FOUND THEN
        RAISE NOTICE '✓ PASS: Vessel flagged with regulatory deficiency';
    ELSE
        RAISE WARNING '✗ FAIL: Vessel not flagged despite missing mandatory certificate';
    END IF;

    -- Cleanup
    DELETE FROM public.vessel_compliance_scores WHERE org_id = v_org_id;
    DELETE FROM public.vessel_certifications WHERE org_id = v_org_id;
    DELETE FROM public.vessels WHERE org_id = v_org_id;
    DELETE FROM public.organizations WHERE id = v_org_id;

    RAISE NOTICE 'SCENARIO 2: COMPLETE';
    RAISE NOTICE '';
END $$;


-- =====================================================
-- SCENARIO 3: MAJOR NC / STATUTORY BREACH
-- =====================================================

DO $$
DECLARE
    v_org_id UUID := gen_random_uuid();
    v_vessel_id UUID := gen_random_uuid();
    v_audit_id UUID := gen_random_uuid();
    v_finding_id UUID := gen_random_uuid();
    v_result JSONB;
    v_total_score NUMERIC;
    v_has_breach BOOLEAN;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCENARIO 3: MAJOR NC KILL-SWITCH';
    RAISE NOTICE '========================================';

    INSERT INTO public.organizations (id, name, slug) VALUES (v_org_id, 'TEST_ORG_BREACH', 'test-org-breach');

    INSERT INTO public.vessels (id, org_id, name, imo_number, vessel_type, gross_tonnage)
    VALUES (v_vessel_id, v_org_id, 'MV STATUTORY BREACH', 'IMO9999004', 'General Cargo', 45000);

    -- Add valid certificates
    INSERT INTO public.vessel_certifications (vessel_id, org_id, user_id, certificate_name, certificate_type, status, issue_date, expiry_date)
    VALUES
        (v_vessel_id, v_org_id, '00000000-0000-0000-0000-000000000000', 'Safety Management Certificate', 'SMC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_vessel_id, v_org_id, '00000000-0000-0000-0000-000000000000', 'Document of Compliance', 'DOC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months');

    -- Create audit with MAJOR finding
    INSERT INTO public.audits (id, org_id, vessel_id, audit_type, status, audit_date)
    VALUES (v_audit_id, v_org_id, v_vessel_id, 'External', 'completed', CURRENT_DATE - INTERVAL '1 month');

    INSERT INTO public.audit_findings (id, org_id, audit_id, finding_description, severity, status)
    VALUES (v_finding_id, v_org_id, v_audit_id, 'Critical safety system failure - statutory breach', 'major', 'open');

    -- Calculate compliance
    v_result := public.rpc_calculate_vessel_compliance(v_vessel_id);
    RAISE NOTICE 'Vessel Result: %', v_result;

    SELECT total_score, has_statutory_breach INTO v_total_score, v_has_breach 
    FROM public.vessel_compliance_scores WHERE vessel_id = v_vessel_id;

    -- Validation Checks
    RAISE NOTICE '--- VALIDATION CHECKS ---';

    -- Check 1: Kill-switch should activate
    IF v_has_breach = true THEN
        RAISE NOTICE '✓ PASS: Kill-switch activated for major NC';
    ELSE
        RAISE WARNING '✗ FAIL: Kill-switch did not activate for major NC';
    END IF;

    -- Check 2: Total score should be capped at 40%
    IF v_total_score <= 40 THEN
        RAISE NOTICE '✓ PASS: Total score capped at 40%% (actual: %.2f)', v_total_score;
    ELSE
        RAISE WARNING '✗ FAIL: Total score not capped (%.2f > 40)', v_total_score;
    END IF;

    -- Check 3: Vessel should appear in risk dashboard
    PERFORM 1 FROM public.vessel_compliance_scores 
    WHERE vessel_id = v_vessel_id AND (total_score < 60 OR has_statutory_breach = true);
    
    IF FOUND THEN
        RAISE NOTICE '✓ PASS: Vessel appears in risk dashboard';
    ELSE
        RAISE WARNING '✗ FAIL: Vessel not flagged for risk dashboard';
    END IF;

    -- Cleanup
    DELETE FROM public.vessel_compliance_scores WHERE org_id = v_org_id;
    DELETE FROM public.audit_findings WHERE org_id = v_org_id;
    DELETE FROM public.audits WHERE org_id = v_org_id;
    DELETE FROM public.vessel_certifications WHERE org_id = v_org_id;
    DELETE FROM public.vessels WHERE org_id = v_org_id;
    DELETE FROM public.organizations WHERE id = v_org_id;

    RAISE NOTICE 'SCENARIO 3: COMPLETE';
    RAISE NOTICE '';
END $$;


-- =====================================================
-- SCENARIO 4: EXPIRY PROXIMITY
-- =====================================================

DO $$
DECLARE
    v_org_id UUID := gen_random_uuid();
    v_vessel_id UUID := gen_random_uuid();
    v_result JSONB;
    v_admin_score NUMERIC;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCENARIO 4: EXPIRY PROXIMITY';
    RAISE NOTICE '========================================';

    INSERT INTO public.organizations (id, name, slug) VALUES (v_org_id, 'TEST_ORG_EXPIRY', 'test-org-expiry');

    INSERT INTO public.vessels (id, org_id, name, imo_number, vessel_type, gross_tonnage)
    VALUES (v_vessel_id, v_org_id, 'MV NEAR EXPIRY', 'IMO9999005', 'Ro-Ro', 35000);

    -- Add certificates with one expiring soon
    INSERT INTO public.vessel_certifications (vessel_id, org_id, user_id, certificate_name, certificate_type, status, issue_date, expiry_date)
    VALUES
        (v_vessel_id, v_org_id, '00000000-0000-0000-0000-000000000000', 'Safety Management Certificate', 'SMC', 'valid', CURRENT_DATE - INTERVAL '4 years', CURRENT_DATE + INTERVAL '15 days'), -- EXPIRING SOON
        (v_vessel_id, v_org_id, '00000000-0000-0000-0000-000000000000', 'Document of Compliance', 'DOC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_vessel_id, v_org_id, '00000000-0000-0000-0000-000000000000', 'ISPS Certificate', 'ISPS', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months');

    -- Calculate compliance
    v_result := public.rpc_calculate_vessel_compliance(v_vessel_id);
    RAISE NOTICE 'Vessel Result: %', v_result;

    SELECT admin_score INTO v_admin_score FROM public.vessel_compliance_scores WHERE vessel_id = v_vessel_id;

    -- Validation Checks
    RAISE NOTICE '--- VALIDATION CHECKS ---';

    -- Check 1: Admin readiness should still be 100 (cert is still valid)
    IF v_admin_score = 100 THEN
        RAISE NOTICE '✓ PASS: Admin score remains 100 for valid-but-expiring cert (%.2f)', v_admin_score;
    ELSE
        RAISE NOTICE 'ℹ INFO: Admin score is %.2f (may reflect expiry proximity logic)', v_admin_score;
    END IF;

    -- Check 2: System should show warnings (manual check required)
    RAISE NOTICE 'ℹ MANUAL CHECK: Verify UI shows expiry warnings for certificates expiring within 30 days';

    -- Check 3: Score degradation should be gradual
    IF (v_result->'total_score')::NUMERIC >= 80 THEN
        RAISE NOTICE '✓ PASS: Score degradation is gradual (%.2f)', (v_result->'total_score')::NUMERIC;
    ELSE
        RAISE WARNING '✗ FAIL: Score degraded too aggressively for near-expiry cert';
    END IF;

    -- Cleanup
    DELETE FROM public.vessel_compliance_scores WHERE org_id = v_org_id;
    DELETE FROM public.vessel_certifications WHERE org_id = v_org_id;
    DELETE FROM public.vessels WHERE org_id = v_org_id;
    DELETE FROM public.organizations WHERE id = v_org_id;

    RAISE NOTICE 'SCENARIO 4: COMPLETE';
    RAISE NOTICE '';
END $$;


-- =====================================================
-- SCENARIO 5: FLEET WEIGHTING BY TONNAGE
-- =====================================================

DO $$
DECLARE
    v_org_id UUID := gen_random_uuid();
    v_large_vessel UUID := gen_random_uuid();
    v_small_vessel UUID := gen_random_uuid();
    v_result JSONB;
    v_fleet_index NUMERIC;
    v_large_score NUMERIC;
    v_small_score NUMERIC;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCENARIO 5: FLEET TONNAGE WEIGHTING';
    RAISE NOTICE '========================================';

    INSERT INTO public.organizations (id, name, slug) VALUES (v_org_id, 'TEST_ORG_WEIGHTING', 'test-org-weighting');

    -- Large vessel with LOW score
    INSERT INTO public.vessels (id, org_id, name, imo_number, vessel_type, gross_tonnage)
    VALUES (v_large_vessel, v_org_id, 'MV LARGE LOW SCORE', 'IMO9999006', 'VLCC', 150000);

    -- Small vessel with HIGH score
    INSERT INTO public.vessels (id, org_id, name, imo_number, vessel_type, gross_tonnage)
    VALUES (v_small_vessel, v_org_id, 'MV SMALL HIGH SCORE', 'IMO9999007', 'Tug', 500);

    -- Large vessel: minimal certs, poor compliance
    INSERT INTO public.vessel_certifications (vessel_id, org_id, user_id, certificate_name, certificate_type, status, issue_date, expiry_date)
    VALUES
        (v_large_vessel, v_org_id, '00000000-0000-0000-0000-000000000000', 'Safety Management Certificate', 'SMC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months');

    -- Small vessel: all certs, excellent compliance
    INSERT INTO public.vessel_certifications (vessel_id, org_id, user_id, certificate_name, certificate_type, status, issue_date, expiry_date)
    VALUES
        (v_small_vessel, v_org_id, '00000000-0000-0000-0000-000000000000', 'Safety Management Certificate', 'SMC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_small_vessel, v_org_id, '00000000-0000-0000-0000-000000000000', 'Document of Compliance', 'DOC', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'),
        (v_small_vessel, v_org_id, '00000000-0000-0000-0000-000000000000', 'ISPS Certificate', 'ISPS', 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months');

    -- Calculate individual scores
    PERFORM public.rpc_calculate_vessel_compliance(v_large_vessel);
    PERFORM public.rpc_calculate_vessel_compliance(v_small_vessel);

    SELECT total_score INTO v_large_score FROM public.vessel_compliance_scores WHERE vessel_id = v_large_vessel;
    SELECT total_score INTO v_small_score FROM public.vessel_compliance_scores WHERE vessel_id = v_small_vessel;

    RAISE NOTICE 'Large Vessel (150,000 GT) Score: %.2f', v_large_score;
    RAISE NOTICE 'Small Vessel (500 GT) Score: %.2f', v_small_score;

    -- Get fleet index
    v_result := public.rpc_get_fleet_compliance_index(v_org_id);
    v_fleet_index := (v_result->>'fleet_compliance_index')::NUMERIC;
    RAISE NOTICE 'Fleet Index (Weighted): %.2f', v_fleet_index;

    -- Validation Checks
    RAISE NOTICE '--- VALIDATION CHECKS ---';

    -- Check 1: Fleet index should be weighted by GT
    IF (v_result->>'is_weighted')::BOOLEAN = true THEN
        RAISE NOTICE '✓ PASS: Fleet index is tonnage-weighted';
    ELSE
        RAISE WARNING '✗ FAIL: Fleet index not using tonnage weighting';
    END IF;

    -- Check 2: Large vessel should dominate the fleet index
    -- Fleet index should be closer to large vessel score than small vessel score
    IF ABS(v_fleet_index - v_large_score) < ABS(v_fleet_index - v_small_score) THEN
        RAISE NOTICE '✓ PASS: Large vessel has dominant impact on fleet index';
    ELSE
        RAISE WARNING '✗ FAIL: Fleet weighting not correctly favoring large vessel';
    END IF;

    -- Check 3: Verify mathematical correctness
    DECLARE
        v_expected_index NUMERIC;
    BEGIN
        v_expected_index := (v_large_score * 150000 + v_small_score * 500) / 150500;
        IF ABS(v_fleet_index - v_expected_index) < 0.1 THEN
            RAISE NOTICE '✓ PASS: Fleet index mathematically correct (%.2f ≈ %.2f)', v_fleet_index, v_expected_index;
        ELSE
            RAISE WARNING '✗ FAIL: Fleet index calculation mismatch (%.2f vs %.2f)', v_fleet_index, v_expected_index;
        END IF;
    END;

    -- Cleanup
    DELETE FROM public.vessel_compliance_scores WHERE org_id = v_org_id;
    DELETE FROM public.vessel_certifications WHERE org_id = v_org_id;
    DELETE FROM public.vessels WHERE org_id = v_org_id;
    DELETE FROM public.organizations WHERE id = v_org_id;

    RAISE NOTICE 'SCENARIO 5: COMPLETE';
    RAISE NOTICE '';
END $$;


-- =====================================================
-- FINAL VALIDATION SUMMARY
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPLIANCE ENGINE VALIDATION COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All 5 validation scenarios have been executed.';
    RAISE NOTICE 'Review the output above for PASS/FAIL status.';
    RAISE NOTICE '';
    RAISE NOTICE 'Expected Results:';
    RAISE NOTICE '  ✓ Scenario 1: All checks PASS (baseline compliance)';
    RAISE NOTICE '  ✓ Scenario 2: All checks PASS (regulatory gap detection)';
    RAISE NOTICE '  ✓ Scenario 3: All checks PASS (kill-switch activation)';
    RAISE NOTICE '  ✓ Scenario 4: All checks PASS (expiry proximity handling)';
    RAISE NOTICE '  ✓ Scenario 5: All checks PASS (tonnage weighting)';
    RAISE NOTICE '';
    RAISE NOTICE 'If all scenarios PASS, the Compliance Engine is VALIDATED for production.';
    RAISE NOTICE '';
END $$;

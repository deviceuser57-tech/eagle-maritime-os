-- =====================================================
-- ENTERPRISE HARDENING: EXTENDED AUDIT & GOVERNANCE
-- =====================================================

-- 1. Attach Audit Triggers to Remaining Critical Tables
DO $$
DECLARE
    t text;
    tables_to_audit text[] := ARRAY[
        'vessel_certifications',
        'incidents',
        'corrective_actions',
        'crew_members',
        'organizations',
        'audits',
        'audit_findings',
        'regulations',
        'organization_members',
        'org_roles'
    ];
BEGIN
    FOREACH t IN ARRAY tables_to_audit LOOP
        -- Drop if exists to avoid errors on re-run
        EXECUTE format('DROP TRIGGER IF EXISTS audit_%I_trigger ON public.%I', t, t);
        -- Attach trigger
        EXECUTE format('CREATE TRIGGER audit_%I_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_change_trigger()', t, t);
    END LOOP;
END $$;

-- 2. RPC: Verify Audit Log Integrity
-- Returns a report on the cryptographic validity of the audit chain
CREATE OR REPLACE FUNCTION public.rpc_verify_audit_integrity(
    p_org_id UUID
)
RETURNS TABLE (
    is_valid BOOLEAN,
    last_verified_id BIGINT,
    integrity_score NUMERIC,
    error_message TEXT
) AS $$
DECLARE
    v_record RECORD;
    v_prev_hash TEXT := 'START';
    v_calc_hash TEXT;
    v_valid_count INT := 0;
    v_total_count INT := 0;
BEGIN
    FOR v_record IN 
        SELECT * FROM public.activity_logs 
        WHERE org_id = p_org_id 
        ORDER BY id ASC 
    LOOP
        v_total_count := v_total_count + 1;
        
        -- Check prev_hash matches expected
        IF v_record.prev_hash != v_prev_hash THEN
            RETURN QUERY SELECT false, v_record.id, (v_valid_count::numeric / v_total_count::numeric * 100), 'Broken chain at ID ' || v_record.id;
            RETURN;
        END IF;

        -- Re-calculate curr_hash
        v_calc_hash := encode(digest(
            COALESCE(v_record.prev_hash, '') || 
            COALESCE(v_record.user_id::text, '') || 
            COALESCE(v_record.target_id::text, '') || 
            COALESCE(v_record.action, '') || 
            COALESCE(v_record.new_data::text, ''), 
        'sha256'), 'hex');

        IF v_record.curr_hash != v_calc_hash THEN
            RETURN QUERY SELECT false, v_record.id, (v_valid_count::numeric / v_total_count::numeric * 100), 'Hash mismatch at ID ' || v_record.id;
            RETURN;
        END IF;

        v_prev_hash := v_record.curr_hash;
        v_valid_count := v_valid_count + 1;
    END LOOP;

    IF v_total_count = 0 THEN
        RETURN QUERY SELECT true, NULL::bigint, 100.0, 'No logs to verify';
    ELSE
        RETURN QUERY SELECT true, v_record.id, 100.0, 'Chain fully verified';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 3. Standardize Enterprise Roles
-- Ensure these exist even if they were manually created/deleted
INSERT INTO public.org_roles (name, permissions)
VALUES 
    ('Fleet Director', '{"vessels": ["read", "write", "delete"], "compliance": ["read", "verify"], "audit": ["read", "verify"]}'::jsonb),
    ('Vessel Manager', '{"vessels": ["read", "write"], "compliance": ["read", "write"], "audit": ["read"]}'::jsonb),
    ('External Auditor', '{"vessels": ["read"], "compliance": ["read"], "audit": ["read"]}'::jsonb)
ON CONFLICT DO NOTHING;

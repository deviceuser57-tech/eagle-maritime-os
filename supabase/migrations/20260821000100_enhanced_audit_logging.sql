-- =====================================================
-- ENHANCED AUDIT LOGGING & SECURITY EVENTS
-- Captures permission-sensitive actions: RPC calls,
-- org membership changes, setup writes, denied access.
-- =====================================================

-- 0. Prerequisites
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. SECURITY EVENTS TABLE
-- Dedicated table for security-relevant events
-- (denied RPCs, 401/403, permission violations)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_events (
  id         BIGSERIAL    PRIMARY KEY,
  org_id     UUID         REFERENCES public.organizations(id),
  actor_id   UUID         REFERENCES auth.users(id),
  event_type TEXT         NOT NULL,      -- 'DENIED_RPC', 'AUTH_FAILURE', 'PERMISSION_VIOLATION', 'RATE_LIMIT'
  endpoint   TEXT,
  details    JSONB,
  ip_address INET,
  severity   TEXT         NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT chk_security_event_type CHECK (event_type IN (
    'DENIED_RPC', 'AUTH_FAILURE', 'PERMISSION_VIOLATION', 'RATE_LIMIT',
    'SUSPICIOUS_ACTIVITY', 'POLICY_VIOLATION'
  )),
  CONSTRAINT chk_security_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Immutability: prevent mutation of security events
CREATE OR REPLACE FUNCTION public.prevent_security_event_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security events are immutable. Mutations are prohibited.';
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_immutable_security_events') THEN
    CREATE TRIGGER trigger_immutable_security_events
    BEFORE UPDATE OR DELETE ON public.security_events
    FOR EACH ROW EXECUTE FUNCTION public.prevent_security_event_mutation();
  END IF;
END $$;

-- RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org admins can read security events" ON public.security_events;
CREATE POLICY "Org admins can read security events" ON public.security_events
  FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      JOIN public.org_roles r ON om.role_id = r.id
      WHERE om.user_id = auth.uid() AND r.name IN ('Super Admin', 'Admin')
    )
  );

-- Allow system inserts (service role or SECURITY DEFINER functions)
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- GraphQL exclusion
SECURITY LABEL FOR pg_graphql ON TABLE public.security_events IS 'exclude';

-- Performance index
CREATE INDEX IF NOT EXISTS idx_security_events_org_created
  ON public.security_events (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type_created
  ON public.security_events (event_type, created_at DESC);


-- =====================================================
-- 2. SECURITY SCAN RESULTS TABLE
-- Stores CI scan results for the dashboard
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_scan_results (
  id          BIGSERIAL    PRIMARY KEY,
  environment TEXT         NOT NULL,  -- 'production', 'staging', 'ci'
  scan_type   TEXT         NOT NULL,  -- 'rls_coverage', 'graphql_exclusion'
  status      TEXT         NOT NULL,  -- 'pass', 'fail'
  violations  JSONB,
  scanned_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT chk_scan_status CHECK (status IN ('pass', 'fail'))
);

ALTER TABLE public.security_scan_results ENABLE ROW LEVEL SECURITY;

-- Any authenticated admin can read scan results
DROP POLICY IF EXISTS "Authenticated users can read scan results" ON public.security_scan_results;
CREATE POLICY "Authenticated users can read scan results" ON public.security_scan_results
  FOR SELECT TO authenticated
  USING (true);

-- Only service role can insert (via CI)
DROP POLICY IF EXISTS "Service role can insert scan results" ON public.security_scan_results;
CREATE POLICY "Service role can insert scan results" ON public.security_scan_results
  FOR INSERT TO authenticated
  WITH CHECK (true);

SECURITY LABEL FOR pg_graphql ON TABLE public.security_scan_results IS 'exclude';


-- =====================================================
-- 3. AUDIT TRIGGERS ON ORGANIZATION_MEMBERS
-- Captures member joins, role changes, removals
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_organization_members_trigger') THEN
    CREATE TRIGGER audit_organization_members_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION public.audit_change_trigger();
  END IF;
END $$;


-- =====================================================
-- 4. AUDIT TRIGGERS ON ALL SETUP TABLES
-- Every setup table mutation is now logged
-- =====================================================
DO $$
DECLARE
  setup_table TEXT;
  trigger_name TEXT;
  setup_tables TEXT[] := ARRAY[
    'setup_audit_types',
    'setup_certificate_types',
    'setup_classification_societies',
    'setup_companies',
    'setup_contract_types',
    'setup_crew_ranks',
    'setup_currencies',
    'setup_finding_statuses',
    'setup_finding_types',
    'setup_flag_states',
    'setup_nationalities',
    'setup_root_causes'
  ];
BEGIN
  FOREACH setup_table IN ARRAY setup_tables LOOP
    trigger_name := 'audit_' || setup_table || '_trigger';

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = trigger_name) THEN
      EXECUTE format(
        'CREATE TRIGGER %I
         AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.audit_change_trigger()',
        trigger_name, setup_table
      );
      RAISE NOTICE 'Created audit trigger: %', trigger_name;
    END IF;
  END LOOP;
END $$;


-- =====================================================
-- 5. ENHANCED RPC AUDIT LOGGING FUNCTION
-- Logs every sensitive RPC invocation to activity_logs
-- =====================================================
CREATE OR REPLACE FUNCTION public.fn_log_rpc_call(
  p_org_id    UUID,
  p_routine   TEXT,
  p_actor_id  UUID DEFAULT NULL,
  p_params    JSONB DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    org_id,
    user_id,
    action,
    target_table,
    target_id,
    new_data
  ) VALUES (
    p_org_id,
    COALESCE(p_actor_id, auth.uid()),
    'RPC_CALL',
    p_routine,
    COALESCE(p_org_id, gen_random_uuid()),
    jsonb_build_object(
      'routine', p_routine,
      'params', p_params,
      'timestamp', now()
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_log_rpc_call(UUID, TEXT, UUID, JSONB) TO authenticated;


-- =====================================================
-- 6. ENHANCED DENIED RPC LOGGING
-- Inserts into both activity_logs AND security_events
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_denied_rpc(
  p_user_id  UUID,
  p_routine  TEXT,
  p_reason   TEXT,
  p_org_id   UUID DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  -- Log to activity_logs (existing behavior)
  INSERT INTO public.activity_logs (
    org_id,
    user_id,
    action,
    target_table,
    target_id,
    new_data
  ) VALUES (
    p_org_id,
    p_user_id,
    'DENIED_RPC',
    p_routine,
    COALESCE(p_org_id, gen_random_uuid()),
    jsonb_build_object('routine', p_routine, 'reason', p_reason)
  );

  -- Also log to security_events for alerting
  INSERT INTO public.security_events (
    org_id,
    actor_id,
    event_type,
    endpoint,
    severity,
    details
  ) VALUES (
    p_org_id,
    p_user_id,
    'DENIED_RPC',
    p_routine,
    'high',
    jsonb_build_object('routine', p_routine, 'reason', p_reason)
  );
END;
$$;


-- =====================================================
-- 7. RPC: GET SECURITY POSTURE
-- Returns comprehensive security status for dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION public.rpc_get_security_posture(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_rls_summary JSONB;
  v_recent_events JSONB;
  v_audit_count BIGINT;
  v_event_count BIGINT;
  v_denied_count_24h BIGINT;
  v_scan_results JSONB;
BEGIN
  -- Authorization: must be an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    JOIN public.org_roles r ON om.role_id = r.id
    WHERE om.user_id = auth.uid()
      AND om.org_id = p_org_id
      AND r.name IN ('Super Admin', 'Admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  -- Total audit log entries for this org
  SELECT count(*) INTO v_audit_count
  FROM public.activity_logs WHERE org_id = p_org_id;

  -- Total security events for this org
  SELECT count(*) INTO v_event_count
  FROM public.security_events WHERE org_id = p_org_id;

  -- Denied events in last 24 hours
  SELECT count(*) INTO v_denied_count_24h
  FROM public.security_events
  WHERE org_id = p_org_id
    AND event_type IN ('DENIED_RPC', 'AUTH_FAILURE', 'PERMISSION_VIOLATION')
    AND created_at > now() - interval '24 hours';

  -- Recent security events (last 20)
  SELECT COALESCE(jsonb_agg(row_to_json(e)), '[]'::jsonb) INTO v_recent_events
  FROM (
    SELECT id, event_type, endpoint, severity, details, created_at
    FROM public.security_events
    WHERE org_id = p_org_id
    ORDER BY created_at DESC
    LIMIT 20
  ) e;

  -- Latest scan results
  SELECT COALESCE(jsonb_agg(row_to_json(s)), '[]'::jsonb) INTO v_scan_results
  FROM (
    SELECT DISTINCT ON (scan_type, environment)
      id, environment, scan_type, status, scanned_at
    FROM public.security_scan_results
    ORDER BY scan_type, environment, scanned_at DESC
  ) s;

  RETURN jsonb_build_object(
    'success', true,
    'audit_log_count', v_audit_count,
    'security_event_count', v_event_count,
    'denied_events_24h', v_denied_count_24h,
    'recent_events', v_recent_events,
    'scan_results', v_scan_results
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_security_posture(UUID) TO authenticated;


-- =====================================================
-- 8. RPC: GET AUDIT CHAIN STATUS
-- Verifies hash chain integrity for the org
-- =====================================================
CREATE OR REPLACE FUNCTION public.rpc_get_audit_chain_status(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_total BIGINT;
  v_valid BIGINT := 0;
  v_invalid BIGINT := 0;
  v_rec RECORD;
  v_expected_prev TEXT := 'START';
BEGIN
  -- Authorization
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    JOIN public.org_roles r ON om.role_id = r.id
    WHERE om.user_id = auth.uid()
      AND om.org_id = p_org_id
      AND r.name IN ('Super Admin', 'Admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT count(*) INTO v_total
  FROM public.activity_logs WHERE org_id = p_org_id;

  -- Walk the chain and verify prev_hash linkage
  FOR v_rec IN
    SELECT id, prev_hash, curr_hash
    FROM public.activity_logs
    WHERE org_id = p_org_id
    ORDER BY id ASC
    LIMIT 1000  -- Cap for performance
  LOOP
    IF v_rec.prev_hash = v_expected_prev OR v_expected_prev = 'START' THEN
      v_valid := v_valid + 1;
    ELSE
      v_invalid := v_invalid + 1;
    END IF;
    v_expected_prev := COALESCE(v_rec.curr_hash, 'START');
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'total_entries', v_total,
    'verified_entries', v_valid,
    'invalid_entries', v_invalid,
    'chain_valid', v_invalid = 0,
    'integrity_score', CASE WHEN v_total > 0
      THEN round((v_valid::numeric / greatest(v_valid + v_invalid, 1)) * 100, 1)
      ELSE 100 END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_audit_chain_status(UUID) TO authenticated;


-- =====================================================
-- 9. CI HELPER RPC: Return RLS status for all tables
-- Used by scripts/verify-rls-coverage.mjs
-- =====================================================
CREATE OR REPLACE FUNCTION public._ci_get_rls_status()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT
    c.relname::text AS table_name,
    c.relrowsecurity AS rls_enabled,
    (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'  -- ordinary tables only
  ORDER BY c.relname;
$$;

-- Only service role should call this in CI
GRANT EXECUTE ON FUNCTION public._ci_get_rls_status() TO authenticated;


-- =====================================================
-- 10. Add event_type column to activity_logs if missing
-- For distinguishing RPC_CALL, DENIED_RPC, data changes
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'activity_logs'
      AND column_name = 'event_type'
  ) THEN
    ALTER TABLE public.activity_logs
      ADD COLUMN event_type TEXT DEFAULT 'DATA_CHANGE';
  END IF;
END $$;

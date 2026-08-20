
-- 1) Block GraphQL endpoint for anon/authenticated (app uses PostgREST only)
REVOKE USAGE ON SCHEMA graphql_public FROM anon, authenticated, PUBLIC;
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql_public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated, PUBLIC;

-- 2) SECURITY DEFINER hardening: default-deny, then re-grant only the app-facing RPCs
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef AND p.prokind = 'f'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END $$;

-- RLS helper predicates (must be callable by the policy evaluator)
GRANT EXECUTE ON FUNCTION public.fn_is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_is_org_admin(uuid) TO authenticated;

-- App-facing RPCs, each performing its own org-membership authorization check
GRANT EXECUTE ON FUNCTION public.create_new_organization(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_vessel_compliance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_fleet_compliance_index(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_log_cii_entry(uuid, uuid, integer, numeric, numeric, numeric, text, numeric, text) TO authenticated;

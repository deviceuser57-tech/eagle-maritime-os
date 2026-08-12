-- 1) Remove GraphQL endpoint access entirely for anon/authenticated
REVOKE ALL ON SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL ON SCHEMA graphql_public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql_public FROM anon, authenticated, PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA graphql REVOKE ALL ON FUNCTIONS FROM anon, authenticated, PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA graphql_public REVOKE ALL ON FUNCTIONS FROM anon, authenticated, PUBLIC;

-- 2) Revoke SECURITY DEFINER routines that no client code calls
REVOKE ALL ON FUNCTION public.rpc_snapshot_compliance_history(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rpc_get_ai_vessel_insights(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_snapshot_compliance_history(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_ai_vessel_insights(uuid) TO service_role;

-- 3) Keep anon locked out of the remaining definer routines
REVOKE ALL ON FUNCTION public.fn_is_org_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_is_org_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_new_organization(text, text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_calculate_vessel_compliance(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_get_fleet_compliance_index(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_log_cii_entry(uuid, uuid, integer, numeric, numeric, numeric, text, numeric, text) FROM PUBLIC, anon;

-- Ensure the app's own paths keep working (RLS policies + client RPCs)
GRANT EXECUTE ON FUNCTION public.fn_is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_is_org_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_new_organization(text, text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_vessel_compliance(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_fleet_compliance_index(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_log_cii_entry(uuid, uuid, integer, numeric, numeric, numeric, text, numeric, text) TO authenticated, service_role;
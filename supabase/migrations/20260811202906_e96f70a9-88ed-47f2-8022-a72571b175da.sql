-- 1. Disable GraphQL discovery for anon/authenticated (app uses PostgREST only)
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated;
REVOKE USAGE ON SCHEMA graphql_public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql_public FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated;

-- 2. Internal-only SECURITY DEFINER functions: never callable directly
REVOKE ALL ON FUNCTION public.auto_add_user_to_test_org() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_encrypt_credential() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_invitation_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_auth_user_org_ids() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_my_org_ids() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_org_ids() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_get_finding_deductions(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_get_regulatory_coverage(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rpc_safe_execute(text, jsonb) FROM PUBLIC, anon, authenticated;

-- 3. App-facing RPCs: signed-in only (each enforces org membership internally)
REVOKE ALL ON FUNCTION public.fn_is_org_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_is_org_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_new_organization(text, text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_calculate_vessel_compliance(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_get_ai_vessel_insights(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_get_fleet_compliance_index(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_log_cii_entry(uuid, uuid, integer, numeric, numeric, numeric, text, numeric, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_snapshot_compliance_history(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.fn_is_org_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_new_organization(text, text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_vessel_compliance(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_ai_vessel_insights(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_fleet_compliance_index(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_log_cii_entry(uuid, uuid, integer, numeric, numeric, numeric, text, numeric, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_snapshot_compliance_history(uuid) TO authenticated, service_role;
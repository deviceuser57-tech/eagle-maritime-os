-- ==============================================================================
-- Migration: Regrant EXECUTE to authenticated for app-facing helper/RPC functions
-- Description: The previous security-hardening migration revoked EXECUTE from PUBLIC/anon 
--              on all functions but failed to re-grant it to authenticated for functions 
--              called directly by the app or via RLS policies.
-- ==============================================================================

-- 1. Organization & Auth Helper Functions
GRANT EXECUTE ON FUNCTION public.fn_is_org_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_auth_user_org_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_org_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_org_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_new_organization(text, text, uuid) TO authenticated, service_role;

-- 2. Compliance & Analytics RPCs
GRANT EXECUTE ON FUNCTION public.fn_get_regulatory_coverage(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_get_finding_deductions(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_vessel_compliance(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_fleet_compliance_index(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_get_ai_vessel_insights(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_snapshot_compliance_history(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_log_cii_entry(uuid, uuid, integer, numeric, numeric, numeric, text, numeric, text) TO authenticated, service_role;

-- 3. Utility RPCs
GRANT EXECUTE ON FUNCTION public.rpc_safe_execute(text, jsonb) TO authenticated, service_role;

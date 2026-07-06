
-- Restore EXECUTE grants on app-facing helper and RPC functions to authenticated + service_role.
-- Fixes "permission denied for function fn_is_org_admin" and related errors.

DO $$
DECLARE
    fn text;
    fns text[] := ARRAY[
        'fn_is_org_admin(uuid)',
        'fn_is_org_member(uuid)',
        'get_auth_user_org_ids()',
        'get_my_org_ids()',
        'get_user_org_ids()',
        'fn_get_regulatory_coverage(uuid)',
        'fn_get_finding_deductions(uuid)',
        'create_new_organization(text, text, uuid)',
        'rpc_calculate_vessel_compliance(uuid)',
        'rpc_get_fleet_compliance_index(uuid)',
        'rpc_get_ai_vessel_insights(uuid)',
        'rpc_snapshot_compliance_history(uuid)',
        'rpc_log_cii_entry(uuid, uuid, integer, numeric, numeric, numeric, text, numeric, text)',
        'rpc_safe_execute(text, jsonb)'
    ];
BEGIN
    FOREACH fn IN ARRAY fns LOOP
        BEGIN
            EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', fn);
            EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipping missing function: %', fn;
        END;
    END LOOP;
END $$;

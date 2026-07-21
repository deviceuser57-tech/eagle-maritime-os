
DROP POLICY IF EXISTS "Org members can manage ERP configs" ON public.erp_configurations;
DROP POLICY IF EXISTS "Org-scoped access" ON public.erp_configurations;
CREATE POLICY "Admins can manage ERP configs" ON public.erp_configurations
  FOR ALL TO authenticated
  USING (public.fn_is_org_admin(org_id))
  WITH CHECK (public.fn_is_org_admin(org_id));

DROP POLICY IF EXISTS "Org members can view webhooks" ON public.webhook_endpoints;

REVOKE EXECUTE ON FUNCTION public.auto_add_user_to_test_org() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_encrypt_credential() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_invitation_role() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_auth_user_org_ids() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_org_ids() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_org_ids() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rpc_safe_execute(text, jsonb) FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_get_finding_deductions(uuid) FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_get_regulatory_coverage(uuid) FROM authenticated, PUBLIC;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.oid::regclass::text AS tbl
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m','f')
  LOOP
    EXECUTE format('COMMENT ON TABLE %s IS %L', r.tbl, '@graphql({"totalCount": {"enabled": false}, "exclude": true})');
  END LOOP;
END $$;

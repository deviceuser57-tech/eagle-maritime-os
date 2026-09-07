DROP POLICY IF EXISTS "Signed-in users can append audit events" ON public.enterprise_audit_log;
DROP POLICY IF EXISTS "Signed-in users can append activity logs" ON public.activity_logs;

CREATE POLICY "Members can append audit events for their org"
ON public.enterprise_audit_log FOR INSERT TO authenticated
WITH CHECK (
  (actor_id IS NULL OR actor_id = auth.uid())
  AND org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can append activity logs for their org"
ON public.activity_logs FOR INSERT TO authenticated
WITH CHECK (
  (actor_id IS NULL OR actor_id = auth.uid())
  AND org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
);
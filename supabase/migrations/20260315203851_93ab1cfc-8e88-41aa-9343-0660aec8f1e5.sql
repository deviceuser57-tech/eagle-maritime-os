-- Security lint cleanup related to organization creation hardening

-- 1) Remove permissive role creation policy; org roles are now provisioned via SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "Users can create default roles for new orgs" ON public.org_roles;

-- 2) Replace always-true organizations INSERT policy with explicit authenticated check.
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3) Add explicit deny policy for extraction_logs (RLS enabled with no policy).
-- Service role can still write/read; authenticated clients get no direct access.
DROP POLICY IF EXISTS "No direct client access to extraction logs" ON public.extraction_logs;
CREATE POLICY "No direct client access to extraction logs"
ON public.extraction_logs
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);
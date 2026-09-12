-- Restrict security scan results to org admins only
DROP POLICY IF EXISTS "Signed-in users can read scan results" ON public.security_scan_results;

CREATE POLICY "Org admins can read scan results"
ON public.security_scan_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.org_roles r ON om.role_id = r.id
    WHERE om.user_id = auth.uid()
      AND r.name IN ('Super Admin', 'Admin')
  )
);
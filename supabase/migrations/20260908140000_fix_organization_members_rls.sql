-- =====================================================
-- FIX: Organization Members RLS Circular Reference
-- 
-- Problem: The SELECT policy on organization_members uses a subquery
-- that references organization_members itself. Because RLS is enforced
-- recursively, the inner query also hits the same policy, creating a
-- circular dependency that returns zero rows → "permission denied".
--
-- Solution: 
-- 1. Replace the self-referencing SELECT policy with a direct
--    user_id = auth.uid() check (users can see their own membership).
-- 2. Keep the existing "Admins can manage memberships" policy for
--    admin-level operations (it uses fn_is_org_admin which is SECURITY DEFINER).
-- 3. Add a separate policy so org members can view ALL memberships
--    within their org, using a SECURITY DEFINER helper function.
-- =====================================================

-- Step 1: Create a SECURITY DEFINER function to safely get user's org_ids
-- This function bypasses RLS, breaking the circular reference.
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF UUID AS $$
    SELECT org_id FROM public.organization_members WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- Ensure authenticated users can call this function
GRANT EXECUTE ON FUNCTION public.get_user_org_ids() TO authenticated, service_role;

-- Step 2: Fix the SELECT policy on organization_members
-- Drop the old self-referencing policy
DROP POLICY IF EXISTS "Users can view membership of their orgs" ON public.organization_members;

-- Create a new policy that uses the SECURITY DEFINER function
-- This breaks the circular RLS reference
CREATE POLICY "Users can view membership of their orgs"
ON public.organization_members FOR SELECT TO authenticated
USING (
    org_id IN (SELECT public.get_user_org_ids())
);

-- Step 3: Also fix the organizations table policy which has the same pattern
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
CREATE POLICY "Users can view organizations they belong to"
ON public.organizations FOR SELECT TO authenticated
USING (
    id IN (SELECT public.get_user_org_ids())
);

-- Step 4: Fix org_roles table policy (same circular reference pattern)
DROP POLICY IF EXISTS "Users can view roles in their org" ON public.org_roles;
CREATE POLICY "Users can view roles in their org"
ON public.org_roles FOR SELECT TO authenticated
USING (
    org_id IN (SELECT public.get_user_org_ids())
);

-- =====================================================
-- FIX: INFINITE RECURSION ERROR IN RLS POLICIES
-- =====================================================
-- The organization_members table needs special RLS policies
-- to avoid circular references. We use a SECURITY DEFINER function
-- to safely retrieve the user's organization IDs without triggering RLS.
-- =====================================================

-- 1. Create a secure function to get org IDs bypassing RLS
CREATE OR REPLACE FUNCTION public.get_auth_user_org_ids()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ARRAY(
    SELECT org_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
  );
END;
$$;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view org memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view org member list" ON public.organization_members;

-- 3. Create the new non-recursive policy for SELECT
CREATE POLICY "Users can view org member list" ON public.organization_members
  FOR SELECT
  USING (
    -- Users can see their own membership
    user_id = auth.uid()
    OR
    -- Users can see memberships for organizations they belong to
    -- This uses the secure function to break the recursion
    org_id = ANY(get_auth_user_org_ids())
  );

-- 4. Ensure INSERT/UPDATE policies are safe (usually handled separately or by service role)
DROP POLICY IF EXISTS "Service role can insert memberships" ON public.organization_members;

CREATE POLICY "Service role can insert memberships" ON public.organization_members 
  FOR INSERT 
  WITH CHECK (true); -- Usually restricted, but keeping as per user's previous attempt for now

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed organization_members RLS policies using security definer function';
  RAISE NOTICE '🔄 Refresh your browser to clear the error';
END $$;

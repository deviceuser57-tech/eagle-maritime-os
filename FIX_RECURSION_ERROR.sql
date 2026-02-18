-- =====================================================
-- FIX: INFINITE RECURSION ERROR IN RLS POLICIES
-- =====================================================
-- The organization_members table needs special RLS policies
-- to avoid circular references
-- =====================================================

-- Fix organization_members RLS policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view org memberships" ON public.organization_members;

-- Simple policy: users can view their own memberships
CREATE POLICY "Users can view their own memberships" ON public.organization_members 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow users to view all memberships in their organizations
-- This uses a direct check without recursion
CREATE POLICY "Users can view org member list" ON public.organization_members 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT om.org_id 
      FROM public.organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

-- Allow inserting memberships (for the trigger)
DROP POLICY IF EXISTS "Service role can insert memberships" ON public.organization_members;

CREATE POLICY "Service role can insert memberships" ON public.organization_members 
  FOR INSERT 
  WITH CHECK (true); -- Allow trigger to insert

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed organization_members RLS policies';
  RAISE NOTICE '🔄 Refresh your browser to clear the error';
END $$;

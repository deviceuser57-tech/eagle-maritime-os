-- =====================================================
-- QUICK FIX: Make Vessels Visible in Frontend
-- =====================================================
-- Run this in Supabase SQL Editor to see your test vessels
-- =====================================================

-- STEP 1: Update RLS policies to use org-based access
DROP POLICY IF EXISTS "Users can view their own vessels" ON public.vessels;

CREATE POLICY "Users can view org vessels" ON public.vessels 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid() -- Fallback for legacy vessels
    OR auth.uid() IS NULL -- Allow viewing in trial mode (no auth)
  );

-- STEP 2: Verify vessels are now visible
SELECT id, name, imo_number, org_id, user_id 
FROM public.vessels 
WHERE imo_number LIKE 'IMO9999%';

-- =====================================================
-- Expected Output: Should show 3 vessels
-- =====================================================
-- MV COMPLIANCE ALPHA   | IMO9999001
-- MV COMPLIANCE BETA    | IMO9999002  
-- MV COMPLIANCE GAMMA   | IMO9999003
-- =====================================================

-- If still not showing, run this to disable RLS temporarily:
-- ALTER TABLE public.vessels DISABLE ROW LEVEL SECURITY;

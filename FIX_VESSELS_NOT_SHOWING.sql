-- =====================================================
-- FIX: VESSELS NOT SHOWING IN FRONTEND
-- =====================================================
-- Issue: Vessels exist in database but RLS policies filter by user_id
-- Solution: Update RLS policies to use org-based access OR add user_id
-- =====================================================

-- OPTION 1: Update RLS Policies (Recommended for multi-tenant setup)
-- This allows users to see vessels from their organization

DROP POLICY IF EXISTS "Users can view their own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can create their own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can update their own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can delete their own vessels" ON public.vessels;

-- New org-based policies
CREATE POLICY "Users can view org vessels" ON public.vessels 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid() -- Fallback for legacy vessels with user_id
  );

CREATE POLICY "Users can create org vessels" ON public.vessels 
  FOR INSERT 
  WITH CHECK (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can update org vessels" ON public.vessels 
  FOR UPDATE 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can delete org vessels" ON public.vessels 
  FOR DELETE 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- =====================================================
-- OPTION 2: Temporarily disable RLS for testing (NOT RECOMMENDED FOR PRODUCTION)
-- =====================================================
-- Uncomment these lines ONLY for local testing/development

-- ALTER TABLE public.vessels DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.vessel_certifications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.vessel_compliance_scores DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPTION 3: Add a dummy user and assign vessels to them
-- =====================================================
-- This is useful if you're in trial mode without authentication

-- First, check if you have any users in auth.users
-- If not, you can assign vessels to a dummy user_id

-- UPDATE public.vessels 
-- SET user_id = '00000000-0000-0000-0000-000000000000'
-- WHERE imo_number LIKE 'IMO9999%';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check vessels in database
SELECT id, name, imo_number, org_id, user_id 
FROM public.vessels 
WHERE imo_number LIKE 'IMO9999%';

-- Check if you're a member of the organization
SELECT om.*, o.name as org_name
FROM public.organization_members om
JOIN public.organizations o ON om.org_id = o.id
WHERE om.user_id = auth.uid();

-- If no results, you need to add yourself to the organization:
-- INSERT INTO public.organization_members (org_id, user_id)
-- VALUES ('38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', auth.uid());

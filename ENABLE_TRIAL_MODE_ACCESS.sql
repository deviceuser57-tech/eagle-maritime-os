-- =====================================================
-- FINAL FIX: MAKE ALL TEST DATA VISIBLE IN FRONTEND
-- =====================================================
-- This updates ALL RLS policies to work in trial mode
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- 1. FIX VESSELS TABLE RLS
DROP POLICY IF EXISTS "Users can view their own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can create their own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can update their own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can delete their own vessels" ON public.vessels;

CREATE POLICY "Users can view org vessels" ON public.vessels 
  FOR SELECT 
  USING (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR auth.uid() IS NULL -- TRIAL MODE: Allow viewing without authentication
  );

CREATE POLICY "Users can create org vessels" ON public.vessels 
  FOR INSERT 
  WITH CHECK (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR auth.uid() IS NULL
  );

CREATE POLICY "Users can update org vessels" ON public.vessels 
  FOR UPDATE 
  USING (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR auth.uid() IS NULL
  );

CREATE POLICY "Users can delete org vessels" ON public.vessels 
  FOR DELETE 
  USING (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR auth.uid() IS NULL
  );

-- 2. FIX VESSEL CERTIFICATIONS RLS
DROP POLICY IF EXISTS "Users can view their own certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can create their own certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can update their own certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can delete their own certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can view org certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can create org certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can update org certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can delete org certifications" ON public.vessel_certifications;

CREATE POLICY "Users can view org certifications" ON public.vessel_certifications 
  FOR SELECT 
  USING (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR auth.uid() IS NULL -- TRIAL MODE
  );

CREATE POLICY "Users can create org certifications" ON public.vessel_certifications 
  FOR INSERT 
  WITH CHECK (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR auth.uid() IS NULL
  );

CREATE POLICY "Users can update org certifications" ON public.vessel_certifications 
  FOR UPDATE 
  USING (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR auth.uid() IS NULL
  );

CREATE POLICY "Users can delete org certifications" ON public.vessel_certifications 
  FOR DELETE 
  USING (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR auth.uid() IS NULL
  );

-- 3. FIX COMPLIANCE SCORES RLS
DROP POLICY IF EXISTS "Users can view org compliance scores" ON public.vessel_compliance_scores;

CREATE POLICY "Users can view org compliance scores" ON public.vessel_compliance_scores 
  FOR SELECT 
  USING (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR auth.uid() IS NULL -- TRIAL MODE
  );

-- 4. FIX COMPLIANCE HISTORY RLS
DROP POLICY IF EXISTS "Users can view org compliance history" ON public.vessel_compliance_history;

CREATE POLICY "Users can view org compliance history" ON public.vessel_compliance_history 
  FOR SELECT 
  USING (
    org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR auth.uid() IS NULL -- TRIAL MODE
  );

-- 5. FIX ORGANIZATIONS RLS
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;

CREATE POLICY "Users can view organizations" ON public.organizations 
  FOR SELECT 
  USING (
    id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
    OR auth.uid() IS NULL -- TRIAL MODE: Allow viewing all orgs
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check vessels
SELECT 
  'VESSELS' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE imo_number LIKE 'IMO9999%') as test_vessels
FROM public.vessels;

-- Check certificates
SELECT 
  'CERTIFICATES' as table_name,
  COUNT(*) as total_count
FROM public.vessel_certifications vc
JOIN public.vessels v ON vc.vessel_id = v.id
WHERE v.imo_number LIKE 'IMO9999%';

-- Check compliance scores
SELECT 
  'COMPLIANCE_SCORES' as table_name,
  COUNT(*) as total_count
FROM public.vessel_compliance_scores vcs
JOIN public.vessels v ON vcs.vessel_id = v.id
WHERE v.imo_number LIKE 'IMO9999%';

-- List test vessels with details
SELECT 
  v.name,
  v.imo_number,
  v.vessel_type,
  v.gross_tonnage,
  COUNT(vc.id) as certificates,
  vcs.total_score as compliance_score
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
LEFT JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
WHERE v.imo_number LIKE 'IMO9999%'
GROUP BY v.id, v.name, v.imo_number, v.vessel_type, v.gross_tonnage, vcs.total_score
ORDER BY v.name;

-- =====================================================
-- EXPECTED OUTPUT
-- =====================================================
-- VESSELS: 3 test vessels
-- CERTIFICATES: 9 certificates
-- COMPLIANCE_SCORES: 3 scores
--
-- Vessel List:
-- MV COMPLIANCE ALPHA   | IMO9999001 | Bulk Carrier | 50000  | 3 certs | 87.50
-- MV COMPLIANCE BETA    | IMO9999002 | Container    | 75000  | 3 certs | 87.50
-- MV COMPLIANCE GAMMA   | IMO9999003 | Tanker       | 60000  | 3 certs | 87.50
-- =====================================================

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for trial mode access';
  RAISE NOTICE '🔄 Refresh your frontend (Ctrl+Shift+R) to see vessels';
END $$;

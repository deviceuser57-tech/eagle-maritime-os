-- =====================================================
-- ADD TEST USER TO ORGANIZATION
-- =====================================================
-- This script adds your authenticated user to the test organization
-- so you can see the test vessels after logging in
-- =====================================================

-- STEP 1: Check your current user ID
-- Run this after logging in to get your user_id
SELECT auth.uid() as your_user_id;

-- STEP 2: Add yourself to the test organization
-- Replace <your-user-id> with the UUID from Step 1
INSERT INTO public.organization_members (org_id, user_id)
VALUES (
  '38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', -- Test organization
  auth.uid() -- Your current user ID
)
ON CONFLICT (org_id, user_id) DO NOTHING;

-- STEP 3: Verify membership
SELECT 
  om.id,
  om.org_id,
  om.user_id,
  o.name as organization_name,
  om.created_at
FROM public.organization_members om
JOIN public.organizations o ON om.org_id = o.id
WHERE om.user_id = auth.uid();

-- STEP 4: Verify you can now see vessels
SELECT 
  v.id,
  v.name,
  v.imo_number,
  v.vessel_type,
  v.gross_tonnage,
  COUNT(vc.id) as certificates
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
WHERE v.imo_number LIKE 'IMO9999%'
GROUP BY v.id, v.name, v.imo_number, v.vessel_type, v.gross_tonnage
ORDER BY v.name;

-- =====================================================
-- EXPECTED RESULTS AFTER ADDING YOURSELF:
-- =====================================================
-- Step 3: Should show 1 membership record
-- Step 4: Should show 3 vessels (ALPHA, BETA, GAMMA)
-- =====================================================

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Login to your app (create account if needed)
-- 2. Run Step 1 to get your user_id
-- 3. Run Step 2 to add yourself to organization
-- 4. Refresh frontend
-- 5. Go to Vessels page - you should now see 3 vessels!
-- =====================================================

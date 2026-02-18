-- =====================================================
-- STEP 2: CREATE TEST DATA (CORRECTED)
-- =====================================================
-- Run this SQL in Supabase SQL Editor
-- This creates test organization, vessels, and certificates

-- 1. Create organization and get the ID
INSERT INTO public.organizations (name, slug, plan_id) 
VALUES (
  'Eagle Maritime Demo', 
  'eagle-demo',
  (SELECT id FROM public.subscription_plans WHERE name = 'Professional' LIMIT 1)
) 
RETURNING id;

-- ⚠️ COPY THE UUID RETURNED ABOVE AND PASTE IT IN THE NEXT SECTION
-- Example: If you got 38a8adcb-ebce-45d0-aab8-f2f2478d7bfa, use that below

-- =====================================================
-- 2. CREATE VESSELS (Replace the UUID below)
-- =====================================================

INSERT INTO public.vessels (org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area) VALUES 
  ('38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', 'MV COMPLIANCE ALPHA', 'IMO9999001', 'Bulk Carrier', 50000, 'Panama', 'International'),
  ('38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', 'MV COMPLIANCE BETA', 'IMO9999002', 'Container', 75000, 'Liberia', 'International'),
  ('38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', 'MV COMPLIANCE GAMMA', 'IMO9999003', 'Tanker', 60000, 'Marshall Islands', 'International');

-- =====================================================
-- 3. ADD CERTIFICATES
-- =====================================================

INSERT INTO public.vessel_certifications (vessel_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT 
  v.id, 
  v.org_id, 
  cert.name, 
  cert.type, 
  'valid', 
  CURRENT_DATE - INTERVAL '6 months', 
  CURRENT_DATE + INTERVAL '18 months'
FROM public.vessels v
CROSS JOIN (VALUES 
  ('Safety Management Certificate', 'SMC'),
  ('Document of Compliance', 'DOC'),
  ('ISPS Certificate', 'ISPS')
) AS cert(name, type)
WHERE v.imo_number IN ('IMO9999001', 'IMO9999002', 'IMO9999003');

-- =====================================================
-- 4. CALCULATE COMPLIANCE SCORES
-- =====================================================

DO $$ 
DECLARE 
  v_vessel RECORD; 
BEGIN
  FOR v_vessel IN 
    SELECT id FROM public.vessels 
    WHERE imo_number LIKE 'IMO9999%' 
  LOOP
    PERFORM public.rpc_calculate_vessel_compliance(v_vessel.id);
  END LOOP;
END $$;

-- =====================================================
-- 5. VERIFY SETUP
-- =====================================================

SELECT 
  v.name,
  v.imo_number,
  COUNT(vc.id) as certificates,
  vcs.total_score as compliance_score,
  vcs.has_statutory_breach as has_breach
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
LEFT JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
WHERE v.imo_number LIKE 'IMO9999%'
GROUP BY v.id, v.name, v.imo_number, vcs.total_score, vcs.has_statutory_breach
ORDER BY v.name;

-- =====================================================
-- EXPECTED OUTPUT:
-- =====================================================
-- name                    | imo_number  | certificates | compliance_score | has_breach
-- ------------------------|-------------|--------------|------------------|------------
-- MV COMPLIANCE ALPHA     | IMO9999001  | 3            | 87.50            | false
-- MV COMPLIANCE BETA      | IMO9999002  | 3            | 87.50            | false
-- MV COMPLIANCE GAMMA     | IMO9999003  | 3            | 87.50            | false

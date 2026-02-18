-- =====================================================
-- OPTION 1: Apply this migration first to add org_id column
-- =====================================================
-- Copy and run: supabase/migrations/20260218000000_expand_vessel_certifications.sql
-- Then come back and run the test data SQL below

-- =====================================================
-- OPTION 2: Use this SQL if you don't want to apply the migration yet
-- (Works with current table structure using user_id)
-- =====================================================

-- Get a dummy user_id (we're in trial mode, so we'll use a placeholder)
-- First, let's create test data without org_id

-- CREATE 3 VESSELS
INSERT INTO public.vessels (org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area) VALUES 
  ('38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', 'MV COMPLIANCE ALPHA', 'IMO9999001', 'Bulk Carrier', 50000, 'Panama', 'International'),
  ('38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', 'MV COMPLIANCE BETA', 'IMO9999002', 'Container', 75000, 'Liberia', 'International'),
  ('38a8adcb-ebce-45d0-aab8-f2f2478d7bfa', 'MV COMPLIANCE GAMMA', 'IMO9999003', 'Tanker', 60000, 'Marshall Islands', 'International');

-- ADD 9 CERTIFICATES (using user_id instead of org_id for now)
-- We'll use a dummy UUID for user_id since we're in trial mode
INSERT INTO public.vessel_certifications (vessel_id, user_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT 
  v.id, 
  '00000000-0000-0000-0000-000000000000'::uuid, -- Dummy user_id
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

-- CALCULATE COMPLIANCE
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

-- VERIFY
SELECT 
  v.name,
  v.imo_number,
  COUNT(vc.id) as certs,
  vcs.total_score
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
LEFT JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
WHERE v.imo_number LIKE 'IMO9999%'
GROUP BY v.id, v.name, v.imo_number, vcs.total_score
ORDER BY v.name;

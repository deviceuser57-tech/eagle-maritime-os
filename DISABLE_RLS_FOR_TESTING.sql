-- =====================================================
-- NUCLEAR OPTION: DISABLE RLS FOR TESTING
-- =====================================================
-- This completely disables RLS on all tables
-- Use ONLY for local testing/development
-- =====================================================

-- Disable RLS on all relevant tables
ALTER TABLE public.vessels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cii_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings DISABLE ROW LEVEL SECURITY;

-- Verify vessels exist
SELECT 
  v.id,
  v.name,
  v.imo_number,
  v.vessel_type,
  v.gross_tonnage,
  v.org_id,
  v.user_id,
  COUNT(vc.id) as cert_count,
  vcs.total_score
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
LEFT JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
WHERE v.imo_number LIKE 'IMO9999%'
GROUP BY v.id, v.name, v.imo_number, v.vessel_type, v.gross_tonnage, v.org_id, v.user_id, vcs.total_score
ORDER BY v.name;

-- Expected: 3 vessels with certificates and scores

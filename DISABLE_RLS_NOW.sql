-- =====================================================
-- تعطيل RLS مؤقتاً لرؤية السفن
-- TEMPORARILY DISABLE RLS TO SEE VESSELS
-- =====================================================
-- هذا للاختبار فقط - ليس للإنتاج
-- For testing only - NOT for production
-- =====================================================

-- تعطيل RLS على جميع الجداول
-- Disable RLS on all tables
ALTER TABLE public.vessels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cii_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings DISABLE ROW LEVEL SECURITY;

-- التحقق من السفن
-- Verify vessels
SELECT 
  v.id,
  v.name as "اسم السفينة / Vessel Name",
  v.imo_number as "رقم IMO",
  v.vessel_type as "نوع السفينة / Type",
  v.gross_tonnage as "الحمولة / Tonnage",
  COUNT(vc.id) as "الشهادات / Certificates",
  vcs.total_score as "درجة الامتثال / Compliance Score"
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
LEFT JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
WHERE v.imo_number LIKE 'IMO9999%'
GROUP BY v.id, v.name, v.imo_number, v.vessel_type, v.gross_tonnage, vcs.total_score
ORDER BY v.name;

-- =====================================================
-- النتيجة المتوقعة / EXPECTED RESULT:
-- =====================================================
-- 3 سفن / 3 vessels:
-- MV COMPLIANCE ALPHA   | IMO9999001 | Bulk Carrier | 50000  | 3 | 87.50
-- MV COMPLIANCE BETA    | IMO9999002 | Container    | 75000  | 3 | 87.50
-- MV COMPLIANCE GAMMA   | IMO9999003 | Tanker       | 60000  | 3 | 87.50
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ تم تعطيل RLS - يمكنك الآن رؤية السفن';
  RAISE NOTICE '✅ RLS disabled - You can now see vessels';
  RAISE NOTICE '🔄 قم بتحديث المتصفح (Ctrl+Shift+R)';
  RAISE NOTICE '🔄 Refresh browser (Ctrl+Shift+R)';
END $$;

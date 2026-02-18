-- =====================================================
-- RE-ENABLE RLS WITH PROPER POLICIES
-- =====================================================
-- This re-enables RLS and sets up proper org-based policies
-- =====================================================

-- Re-enable RLS on all tables
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cii_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;

-- Set up proper policies for vessels
DROP POLICY IF EXISTS "Users can view org vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can create org vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can update org vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can delete org vessels" ON public.vessels;

CREATE POLICY "Users can view org vessels" ON public.vessels 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
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

-- Set up proper policies for vessel_certifications
DROP POLICY IF EXISTS "Users can view org certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can create org certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can update org certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can delete org certifications" ON public.vessel_certifications;

CREATE POLICY "Users can view org certifications" ON public.vessel_certifications 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create org certifications" ON public.vessel_certifications 
  FOR INSERT 
  WITH CHECK (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can update org certifications" ON public.vessel_certifications 
  FOR UPDATE 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can delete org certifications" ON public.vessel_certifications 
  FOR DELETE 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Set up proper policies for compliance scores
DROP POLICY IF EXISTS "Users can view org compliance scores" ON public.vessel_compliance_scores;

CREATE POLICY "Users can view org compliance scores" ON public.vessel_compliance_scores 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Set up proper policies for compliance history
DROP POLICY IF EXISTS "Users can view org compliance history" ON public.vessel_compliance_history;

CREATE POLICY "Users can view org compliance history" ON public.vessel_compliance_history 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Set up proper policies for organizations
DROP POLICY IF EXISTS "Users can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;

CREATE POLICY "Users can view organizations they belong to" ON public.organizations 
  FOR SELECT 
  USING (
    id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ RLS re-enabled with org-based policies';
  RAISE NOTICE '📝 To see vessels, you need to be a member of the organization';
  RAISE NOTICE '📝 Test vessels are in org: 38a8adcb-ebce-45d0-aab8-f2f2478d7bfa';
END $$;


-- Enable RLS on tables that have it disabled but have policies
ALTER TABLE public.vessel_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;

-- Ensure vessels has proper org-scoped policies (they may already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessels' AND policyname = 'Users can view org vessels') THEN
    EXECUTE 'CREATE POLICY "Users can view org vessels" ON public.vessels FOR SELECT USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessels' AND policyname = 'Users can create org vessels') THEN
    EXECUTE 'CREATE POLICY "Users can create org vessels" ON public.vessels FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessels' AND policyname = 'Users can update org vessels') THEN
    EXECUTE 'CREATE POLICY "Users can update org vessels" ON public.vessels FOR UPDATE USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessels' AND policyname = 'Users can delete org vessels') THEN
    EXECUTE 'CREATE POLICY "Users can delete org vessels" ON public.vessels FOR DELETE USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid())';
  END IF;
END $$;

-- Ensure vessel_certifications has proper policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessel_certifications' AND policyname = 'Users can view org certifications') THEN
    EXECUTE 'CREATE POLICY "Users can view org certifications" ON public.vessel_certifications FOR SELECT USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessel_certifications' AND policyname = 'Users can create org certifications') THEN
    EXECUTE 'CREATE POLICY "Users can create org certifications" ON public.vessel_certifications FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessel_certifications' AND policyname = 'Users can update org certifications') THEN
    EXECUTE 'CREATE POLICY "Users can update org certifications" ON public.vessel_certifications FOR UPDATE USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessel_certifications' AND policyname = 'Users can delete org certifications') THEN
    EXECUTE 'CREATE POLICY "Users can delete org certifications" ON public.vessel_certifications FOR DELETE USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()) OR user_id = auth.uid())';
  END IF;
END $$;

-- Ensure vessel_compliance_scores has proper policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessel_compliance_scores' AND policyname = 'Users can view org compliance scores') THEN
    EXECUTE 'CREATE POLICY "Users can view org compliance scores" ON public.vessel_compliance_scores FOR SELECT USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))';
  END IF;
END $$;

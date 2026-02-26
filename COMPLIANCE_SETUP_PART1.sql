-- =====================================================
-- COMPLIANCE ENGINE - CONSOLIDATED SETUP SCRIPT
-- =====================================================
-- This script combines all compliance engine migrations
-- for easy one-time execution in Supabase SQL Editor
--
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run" or press Ctrl+Enter
-- 4. Wait for completion (~30 seconds)
-- =====================================================

-- Check if migrations already applied
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vessel_compliance_scores') THEN
    RAISE NOTICE 'WARNING: Compliance tables already exist. Skipping creation.';
  ELSE
    RAISE NOTICE 'Starting compliance engine setup...';
  END IF;
END $$;

-- =====================================================
-- MIGRATION 1: REGULATORY INTELLIGENCE
-- =====================================================

-- Setup: Certificate Types Configuration
CREATE TABLE IF NOT EXISTS public.setup_certificate_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  typical_validity_months INTEGER,
  issuing_authority_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.setup_certificate_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certificate types" ON public.setup_certificate_types FOR SELECT USING (true);
CREATE POLICY "Service role can manage certificate types" ON public.setup_certificate_types FOR ALL USING (auth.role() = 'service_role');

-- Setup: Regulatory Matrix
CREATE TABLE IF NOT EXISTS public.regulatory_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_type_id UUID REFERENCES public.setup_certificate_types(id) ON DELETE CASCADE,
  vessel_type_pattern TEXT NOT NULL,
  gt_min INTEGER DEFAULT 0,
  gt_max INTEGER DEFAULT 999999,
  trading_area_pattern TEXT DEFAULT 'Any',
  flag_state_pattern TEXT DEFAULT 'Any',
  is_mandatory BOOLEAN DEFAULT true,
  regulation_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.regulatory_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view regulatory matrix" ON public.regulatory_matrix FOR SELECT USING (true);
CREATE POLICY "Service role can manage regulatory matrix" ON public.regulatory_matrix FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_regulatory_matrix_vessel_type ON public.regulatory_matrix(vessel_type_pattern);
CREATE INDEX IF NOT EXISTS idx_regulatory_matrix_mandatory ON public.regulatory_matrix(is_mandatory);

-- =====================================================
-- MIGRATION 2: COMPLIANCE ENGINE CORE
-- =====================================================

-- Vessel Compliance Scores (Main Table)
CREATE TABLE IF NOT EXISTS public.vessel_compliance_scores (
  vessel_id UUID NOT NULL PRIMARY KEY REFERENCES public.vessels(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  admin_score NUMERIC(5,2) DEFAULT 0,
  coverage_score NUMERIC(5,2) DEFAULT 0,
  findings_score NUMERIC(5,2) DEFAULT 0,
  risk_score NUMERIC(5,2) DEFAULT 0,
  total_score NUMERIC(5,2) DEFAULT 0,
  has_statutory_breach BOOLEAN DEFAULT false,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vessel_compliance_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org compliance scores" ON public.vessel_compliance_scores 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_vessel_compliance_scores_org ON public.vessel_compliance_scores(org_id);
CREATE INDEX IF NOT EXISTS idx_vessel_compliance_scores_total ON public.vessel_compliance_scores(total_score);
CREATE INDEX IF NOT EXISTS idx_vessel_compliance_scores_breach ON public.vessel_compliance_scores(has_statutory_breach);

-- Vessel Compliance History (Trend Tracking)
CREATE TABLE IF NOT EXISTS public.vessel_compliance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  total_score NUMERIC(5,2) NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vessel_id, recorded_date)
);

ALTER TABLE public.vessel_compliance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org compliance history" ON public.vessel_compliance_history 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_vessel_compliance_history_vessel ON public.vessel_compliance_history(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_compliance_history_date ON public.vessel_compliance_history(recorded_date);

RAISE NOTICE 'Compliance engine core tables created successfully';

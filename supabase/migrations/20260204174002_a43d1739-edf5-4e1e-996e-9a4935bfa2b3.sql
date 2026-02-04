-- =====================================================
-- SETUP CONFIGURATION TABLES FOR MARITIME MANAGEMENT
-- =====================================================

-- 1. Setup Companies (Owner, Operator, Technical Manager, ISM Manager, DOC Company)
CREATE TABLE public.setup_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('owner', 'operator', 'technical', 'ism', 'doc')),
  name TEXT NOT NULL,
  contact_person TEXT,
  title TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Setup Crew Ranks
CREATE TABLE public.setup_crew_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rank_name TEXT NOT NULL,
  department TEXT,
  rank_order INTEGER DEFAULT 0,
  is_officer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Setup Nationalities
CREATE TABLE public.setup_nationalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  country_name TEXT NOT NULL,
  country_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Setup Contract Types
CREATE TABLE public.setup_contract_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contract_name TEXT NOT NULL,
  duration_months INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Setup Currencies
CREATE TABLE public.setup_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  currency_code TEXT NOT NULL,
  currency_name TEXT NOT NULL,
  symbol TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Setup Audit Types
CREATE TABLE public.setup_audit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  audit_type_name TEXT NOT NULL,
  description TEXT,
  frequency_months INTEGER,
  is_external BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Setup Finding Types
CREATE TABLE public.setup_finding_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  finding_type_name TEXT NOT NULL,
  severity TEXT DEFAULT 'minor' CHECK (severity IN ('minor', 'major', 'critical')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Setup Finding Statuses
CREATE TABLE public.setup_finding_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status_name TEXT NOT NULL,
  status_order INTEGER DEFAULT 0,
  is_closed BOOLEAN DEFAULT false,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Setup Root Causes
CREATE TABLE public.setup_root_causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cause_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Setup Classification Societies
CREATE TABLE public.setup_classification_societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  society_name TEXT NOT NULL,
  abbreviation TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Setup Flag States
CREATE TABLE public.setup_flag_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flag_name TEXT NOT NULL,
  flag_code TEXT,
  risk_level TEXT DEFAULT 'standard' CHECK (risk_level IN ('low', 'standard', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Setup Certificate Types
CREATE TABLE public.setup_certificate_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  certificate_category TEXT NOT NULL CHECK (certificate_category IN ('statutory', 'class', 'crew', 'other')),
  certificate_name TEXT NOT NULL,
  issuing_authority TEXT,
  validity_months INTEGER,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE public.setup_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_crew_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_nationalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_contract_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_audit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_finding_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_finding_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_root_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_classification_societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_flag_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_certificate_types ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR SETUP_COMPANIES
-- =====================================================

CREATE POLICY "Users can view own companies" ON public.setup_companies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own companies" ON public.setup_companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" ON public.setup_companies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies" ON public.setup_companies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_CREW_RANKS
-- =====================================================

CREATE POLICY "Users can view own crew ranks" ON public.setup_crew_ranks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own crew ranks" ON public.setup_crew_ranks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crew ranks" ON public.setup_crew_ranks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crew ranks" ON public.setup_crew_ranks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_NATIONALITIES
-- =====================================================

CREATE POLICY "Users can view own nationalities" ON public.setup_nationalities
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own nationalities" ON public.setup_nationalities
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nationalities" ON public.setup_nationalities
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nationalities" ON public.setup_nationalities
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_CONTRACT_TYPES
-- =====================================================

CREATE POLICY "Users can view own contract types" ON public.setup_contract_types
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contract types" ON public.setup_contract_types
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contract types" ON public.setup_contract_types
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contract types" ON public.setup_contract_types
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_CURRENCIES
-- =====================================================

CREATE POLICY "Users can view own currencies" ON public.setup_currencies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own currencies" ON public.setup_currencies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own currencies" ON public.setup_currencies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own currencies" ON public.setup_currencies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_AUDIT_TYPES
-- =====================================================

CREATE POLICY "Users can view own audit types" ON public.setup_audit_types
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own audit types" ON public.setup_audit_types
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audit types" ON public.setup_audit_types
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own audit types" ON public.setup_audit_types
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_FINDING_TYPES
-- =====================================================

CREATE POLICY "Users can view own finding types" ON public.setup_finding_types
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own finding types" ON public.setup_finding_types
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own finding types" ON public.setup_finding_types
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own finding types" ON public.setup_finding_types
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_FINDING_STATUSES
-- =====================================================

CREATE POLICY "Users can view own finding statuses" ON public.setup_finding_statuses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own finding statuses" ON public.setup_finding_statuses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own finding statuses" ON public.setup_finding_statuses
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own finding statuses" ON public.setup_finding_statuses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_ROOT_CAUSES
-- =====================================================

CREATE POLICY "Users can view own root causes" ON public.setup_root_causes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own root causes" ON public.setup_root_causes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own root causes" ON public.setup_root_causes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own root causes" ON public.setup_root_causes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_CLASSIFICATION_SOCIETIES
-- =====================================================

CREATE POLICY "Users can view own classification societies" ON public.setup_classification_societies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own classification societies" ON public.setup_classification_societies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own classification societies" ON public.setup_classification_societies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own classification societies" ON public.setup_classification_societies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_FLAG_STATES
-- =====================================================

CREATE POLICY "Users can view own flag states" ON public.setup_flag_states
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own flag states" ON public.setup_flag_states
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flag states" ON public.setup_flag_states
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flag states" ON public.setup_flag_states
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR SETUP_CERTIFICATE_TYPES
-- =====================================================

CREATE POLICY "Users can view own certificate types" ON public.setup_certificate_types
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own certificate types" ON public.setup_certificate_types
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certificate types" ON public.setup_certificate_types
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own certificate types" ON public.setup_certificate_types
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- UPDATE TRIGGERS FOR ALL TABLES
-- =====================================================

CREATE TRIGGER update_setup_companies_updated_at
  BEFORE UPDATE ON public.setup_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_crew_ranks_updated_at
  BEFORE UPDATE ON public.setup_crew_ranks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_nationalities_updated_at
  BEFORE UPDATE ON public.setup_nationalities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_contract_types_updated_at
  BEFORE UPDATE ON public.setup_contract_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_currencies_updated_at
  BEFORE UPDATE ON public.setup_currencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_audit_types_updated_at
  BEFORE UPDATE ON public.setup_audit_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_finding_types_updated_at
  BEFORE UPDATE ON public.setup_finding_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_finding_statuses_updated_at
  BEFORE UPDATE ON public.setup_finding_statuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_root_causes_updated_at
  BEFORE UPDATE ON public.setup_root_causes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_classification_societies_updated_at
  BEFORE UPDATE ON public.setup_classification_societies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_flag_states_updated_at
  BEFORE UPDATE ON public.setup_flag_states
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_certificate_types_updated_at
  BEFORE UPDATE ON public.setup_certificate_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
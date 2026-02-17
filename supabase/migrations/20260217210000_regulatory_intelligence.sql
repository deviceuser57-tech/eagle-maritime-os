-- =====================================================
-- REGULATORY INTELLIGENCE LAYER
-- =====================================================

-- 1. Regulation Master Table
CREATE TABLE public.regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,           -- e.g. SOLAS II-1/3-10
  title TEXT NOT NULL,
  convention TEXT NOT NULL,     -- SOLAS, MARPOL, STCW, IACS, Flag State, etc.
  issuing_body TEXT,
  description TEXT,
  effective_date DATE,
  is_global BOOLEAN DEFAULT true,
  org_id UUID REFERENCES public.organizations(id), -- Null for global regs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Link Regulations to Certificate Types
CREATE TABLE public.certificate_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_type_id UUID NOT NULL REFERENCES public.setup_certificate_types(id) ON DELETE CASCADE,
  regulation_id UUID NOT NULL REFERENCES public.regulations(id) ON DELETE CASCADE,
  mandatory BOOLEAN DEFAULT true,
  notes TEXT,
  org_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(certificate_type_id, regulation_id)
);

-- 3. Link Regulations to Audit Types
CREATE TABLE public.audit_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type_id UUID NOT NULL REFERENCES public.setup_audit_types(id) ON DELETE CASCADE,
  regulation_id UUID NOT NULL REFERENCES public.regulations(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(audit_type_id, regulation_id)
);

-- 4. Link Regulations to Vessel Attributes
CREATE TABLE public.vessel_regulation_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  regulation_id UUID NOT NULL REFERENCES public.regulations(id) ON DELETE CASCADE,
  relevance_type TEXT, -- e.g. 'Structural', 'Operational', 'Safety'
  org_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vessel_id, regulation_id)
);

-- Enable RLS
ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_regulation_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Regulations: Global ones visible to all, org-specific ones visible to org members
CREATE POLICY "View regulations" ON public.regulations
  FOR SELECT TO authenticated
  USING (is_global = true OR org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Manage regulations" ON public.regulations
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- Link tables: Org-scoped access
CREATE POLICY "Org-scoped access certificate_regulations" ON public.certificate_regulations
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org-scoped access audit_regulations" ON public.audit_regulations
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org-scoped access vessel_regulation_tags" ON public.vessel_regulation_tags
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- Update Triggers
CREATE TRIGGER update_regulations_updated_at BEFORE UPDATE ON public.regulations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificate_regulations_updated_at BEFORE UPDATE ON public.certificate_regulations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audit_regulations_updated_at BEFORE UPDATE ON public.audit_regulations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vessel_regulation_tags_updated_at BEFORE UPDATE ON public.vessel_regulation_tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

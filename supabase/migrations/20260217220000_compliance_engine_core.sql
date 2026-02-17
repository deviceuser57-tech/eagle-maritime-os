-- =====================================================
-- COMPLIANCE ENGINE: CORE SCORING INFRASTRUCTURE
-- =====================================================

-- 1. Regulatory Lookup Matrix (The Attribution Engine)
CREATE TABLE public.regulatory_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_type_id UUID NOT NULL REFERENCES public.setup_certificate_types(id) ON DELETE CASCADE,
    vessel_type_pattern TEXT DEFAULT 'Any', -- e.g. 'Tanker', 'Bulk Carrier'
    gt_min NUMERIC DEFAULT 0,
    gt_max NUMERIC DEFAULT 999999999,
    trading_area_pattern TEXT DEFAULT 'Any', -- e.g. 'International', 'Coastal'
    flag_state_pattern TEXT DEFAULT 'Any',
    is_mandatory BOOLEAN DEFAULT true,
    org_id UUID REFERENCES public.organizations(id), -- Null for global defaults
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Vessel Compliance Scores (Current State)
CREATE TABLE public.vessel_compliance_scores (
    vessel_id UUID PRIMARY KEY REFERENCES public.vessels(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    admin_score NUMERIC DEFAULT 100,      -- L1: Basic validity
    coverage_score NUMERIC DEFAULT 100,   -- L2: Regulatory mapping
    findings_score NUMERIC DEFAULT 100,   -- L3: Audit health
    risk_score NUMERIC DEFAULT 100,       -- L4: Operational/Predictive
    total_score NUMERIC DEFAULT 100,
    has_statutory_breach BOOLEAN DEFAULT false,
    last_calculated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Compliance History (Trend Snapshots)
CREATE TABLE public.vessel_compliance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    total_score NUMERIC NOT NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(vessel_id, recorded_date)
);

-- 4. Multi-tenant RLS Policies
ALTER TABLE public.regulatory_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_compliance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View regulatory_matrix" ON public.regulatory_matrix
    FOR SELECT TO authenticated
    USING (org_id IS NULL OR org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org access vessel_compliance_scores" ON public.vessel_compliance_scores
    FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
    WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org access vessel_compliance_history" ON public.vessel_compliance_history
    FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
    WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- 5. Triggers for updated_at
CREATE TRIGGER update_regulatory_matrix_updated_at BEFORE UPDATE ON public.regulatory_matrix FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vessel_compliance_scores_updated_at BEFORE UPDATE ON public.vessel_compliance_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Indices for Performance (Fleet Aggregation)
CREATE INDEX idx_compliance_scores_org ON public.vessel_compliance_scores(org_id);
CREATE INDEX idx_compliance_history_vessel_date ON public.vessel_compliance_history(vessel_id, recorded_date);

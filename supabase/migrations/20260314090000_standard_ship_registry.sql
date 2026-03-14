-- =====================================================
-- STANDARD SHIP REGISTRY (IMO / GISIS STANDARDS)
-- =====================================================

BEGIN;

-- 1. Enhance public.vessels
ALTER TABLE public.vessels 
  ADD COLUMN IF NOT EXISTS official_number TEXT,
  ADD COLUMN IF NOT EXISTS port_of_registry TEXT,
  ADD COLUMN IF NOT EXISTS keel_laying_date DATE,
  ADD COLUMN IF NOT EXISTS date_of_registry DATE;

-- Ensure imo_number is unique and clean it up (imo_number in existing table is TEXT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'vessels_imo_number_key'
    ) THEN
        ALTER TABLE public.vessels ADD CONSTRAINT vessels_imo_number_key UNIQUE (imo_number);
    END IF;
END $$;

-- 2. Create public.vessel_specs
CREATE TABLE IF NOT EXISTS public.vessel_specs (
    vessel_id UUID PRIMARY KEY REFERENCES public.vessels(id) ON DELETE CASCADE,
    gross_tonnage NUMERIC(15, 2),
    net_tonnage NUMERIC(15, 2),
    deadweight_tons NUMERIC(15, 2),
    length_overall_m NUMERIC(10, 2),
    beam_m NUMERIC(10, 2),
    moulded_depth_m NUMERIC(10, 2),
    max_draught_m NUMERIC(10, 2),
    hull_material TEXT,
    ice_class TEXT,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create public.ship_companies
CREATE TABLE IF NOT EXISTS public.ship_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_imo_id INTEGER UNIQUE, -- 7-digit unique company ID
    name TEXT NOT NULL,
    address_line_1 TEXT,
    country_code CHAR(2),
    company_type TEXT, -- e.g., 'Owner', 'Technical Manager'
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create public.ownership_history
CREATE TABLE IF NOT EXISTS public.ownership_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.ship_companies(id) ON DELETE CASCADE,
    ownership_start_date DATE NOT NULL,
    ownership_end_date DATE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create public.construction
CREATE TABLE IF NOT EXISTS public.construction (
    vessel_id UUID PRIMARY KEY REFERENCES public.vessels(id) ON DELETE CASCADE,
    builder_name TEXT,
    yard_number TEXT,
    build_year INTEGER,
    engine_manufacturer TEXT,
    engine_model TEXT,
    total_power_kw INTEGER,
    propulsion_type TEXT,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create public.drydock_events
CREATE TABLE IF NOT EXISTS public.drydock_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'Scheduled', 'Emergency', 'Intermediate', 'Special Survey'
    status TEXT NOT NULL DEFAULT 'Planned', -- 'Planned', 'In-Progress', 'Completed', 'Postponed'
    start_date DATE,
    end_date DATE,
    shipyard_name TEXT,
    shipyard_country_code CHAR(2),
    scope_description TEXT,
    total_cost_usd NUMERIC(15, 2),
    estimated_budget_usd NUMERIC(15, 2),
    superintendent_in_charge TEXT,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create public.technical_conditions
CREATE TABLE IF NOT EXISTS public.technical_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Open', -- 'Open', 'Deferred', 'Resolved'
    condition_title TEXT NOT NULL,
    detailed_description TEXT,
    source_survey TEXT NOT NULL, -- 'Class', 'Flag', 'Internal', 'Insurance'
    date_issued DATE NOT NULL,
    due_date DATE,
    resolved_date DATE,
    related_dd_event_id UUID REFERENCES public.drydock_events(id) ON DELETE SET NULL,
    estimated_repair_cost_usd NUMERIC(15, 2),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Create public.drydock_scope_items
CREATE TABLE IF NOT EXISTS public.drydock_scope_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.drydock_events(id) ON DELETE CASCADE,
    category TEXT, -- 'Hull & Painting', 'Propulsion', 'Valves & Sea Chests', etc.
    job_title TEXT NOT NULL,
    estimated_duration_days INTEGER,
    is_critical_path BOOLEAN DEFAULT FALSE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Enable RLS and create Org-scoped policies
DO $$
DECLARE
    table_name_var TEXT;
    target_tables TEXT[] := ARRAY[
        'vessel_specs', 'ship_companies', 'ownership_history', 
        'construction', 'drydock_events', 'technical_conditions', 
        'drydock_scope_items'
    ];
BEGIN
    FOR table_name_var IN SELECT UNNEST(target_tables) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name_var);
        
        EXECUTE format('
            DROP POLICY IF EXISTS "Org-scoped access" ON public.%I;
            CREATE POLICY "Org-scoped access" ON public.%I
            FOR ALL TO authenticated
            USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
            WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))', 
            table_name_var, table_name_var);
    END LOOP;
END $$;

-- 10. Vessel Readiness Report View
CREATE OR REPLACE VIEW public.vw_vessel_readiness_report AS
SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    v.imo_number,
    v.org_id,
    
    -- Drydock Summary
    dd.next_dd_start_date,
    (dd.next_dd_start_date - CURRENT_DATE) AS days_to_dd,
    COALESCE(dd.estimated_budget_usd, 0) AS planned_dd_budget,
    
    -- Condition Summary & Costs
    COUNT(tc.id) AS total_open_conditions,
    COALESCE(SUM(CASE WHEN tc.due_date < CURRENT_DATE THEN 1 ELSE 0 END), 0) AS overdue_count,
    COALESCE(SUM(tc.estimated_repair_cost_usd), 0) AS open_conditions_total_cost,
    
    -- Total Budgetary Forecast (DD + Conditions)
    (COALESCE(dd.estimated_budget_usd, 0) + COALESCE(SUM(tc.estimated_repair_cost_usd), 0)) AS total_forecast_liability,

    -- Readiness & Financial Status
    CASE 
        WHEN SUM(CASE WHEN tc.due_date < CURRENT_DATE THEN 1 ELSE 0 END) > 0 THEN 'CRITICAL: OVERDUE'
        WHEN (dd.next_dd_start_date - CURRENT_DATE) < 30 THEN 'URGENT: DD IMMINENT'
        ELSE 'OPERATIONAL'
    END AS readiness_status,

    -- Detailed Overdue List (Postgres STRING_AGG)
    STRING_AGG(
        CASE 
            WHEN tc.due_date < CURRENT_DATE 
            THEN '[OVERDUE] ' || tc.condition_title || ' (Due: ' || tc.due_date::text || ')'
            ELSE NULL 
        END, 
        '; '
    ) AS overdue_conditions_detail

FROM public.vessels v
LEFT JOIN (
    -- Subquery for the absolute next planned Drydock window
    SELECT 
        vessel_id, 
        MIN(start_date) AS next_dd_start_date,
        (SELECT estimated_budget_usd FROM public.drydock_events de2 WHERE de2.vessel_id = de1.vessel_id AND de2.start_date = MIN(de1.start_date) AND de2.status = 'Planned' LIMIT 1) as estimated_budget_usd
    FROM public.drydock_events de1
    WHERE status = 'Planned' AND start_date >= CURRENT_DATE
    GROUP BY vessel_id
) dd ON v.id = dd.vessel_id
LEFT JOIN public.technical_conditions tc 
    ON v.id = tc.vessel_id 
    AND tc.status = 'Open'
WHERE v.status = 'active'
GROUP BY v.id, v.name, v.imo_number, v.org_id, dd.next_dd_start_date, dd.estimated_budget_usd;

-- 11. Triggers for updated_at
DO $$
DECLARE
    t_name TEXT;
    target_tables TEXT[] := ARRAY[
        'vessel_specs', 'ship_companies', 'ownership_history', 
        'construction', 'drydock_events', 'technical_conditions', 
        'drydock_scope_items'
    ];
BEGIN
    FOR t_name IN SELECT UNNEST(target_tables) LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', 
            t_name, t_name, t_name, t_name);
    END LOOP;
END $$;

COMMIT;

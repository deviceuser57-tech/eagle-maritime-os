-- ============================================================
-- Vessel Management Upgrade
-- Extends the existing Vessel/Setup architecture without replacing
-- existing vessels or duplicating existing master-data entities.
-- ============================================================

-- ---------- New Vessel Setup masters ----------
CREATE TABLE IF NOT EXISTS public.setup_vessel_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE TABLE IF NOT EXISTS public.setup_ownership_modes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE TABLE IF NOT EXISTS public.setup_regularities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  authority text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE TABLE IF NOT EXISTS public.setup_regularity_applicability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

-- ---------- Extend existing vessels table ----------
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS ownership_mode_id uuid REFERENCES public.setup_ownership_modes(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS vessel_status_id uuid REFERENCES public.setup_vessel_status(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS vessel_type_id uuid REFERENCES public.setup_vessel_types(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS propulsion_type_id uuid REFERENCES public.setup_propulsion_types(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS fuel_type_id uuid REFERENCES public.setup_fuel_types(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS trading_area_id uuid REFERENCES public.setup_trading_areas(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS hull_material_id uuid REFERENCES public.setup_hull_materials(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS hull_coating_id uuid REFERENCES public.setup_hull_coatings(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS port_of_registry_id uuid REFERENCES public.setup_ports(id) ON DELETE SET NULL;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS operational_notes text;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS operational_status text;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS cabin_count integer;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS additional_unmapped_specifications text;

-- ---------- Vessel regularity child collection ----------
CREATE TABLE IF NOT EXISTS public.vessel_regularities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id uuid NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  regularity_id uuid NOT NULL REFERENCES public.setup_regularities(id) ON DELETE RESTRICT,
  applicability_status_id uuid NOT NULL REFERENCES public.setup_regularity_applicability(id) ON DELETE RESTRICT,
  effective_from date,
  effective_to date,
  exemption_reference text,
  exemption_reason text,
  document_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vessel_id, regularity_id)
);

-- ---------- Vessel financial baseline ----------
CREATE TABLE IF NOT EXISTS public.vessel_financial_baseline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id uuid NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  minimum_daily_hire_rate numeric(18,2) NOT NULL DEFAULT 0 CHECK (minimum_daily_hire_rate >= 0),
  currency_code text,
  minimum_charter_period_days integer CHECK (minimum_charter_period_days IS NULL OR minimum_charter_period_days > 0),
  crew_manning_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (crew_manning_daily_cost >= 0),
  accommodation_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (accommodation_daily_cost >= 0),
  breakfast_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (breakfast_daily_cost >= 0),
  lunch_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (lunch_daily_cost >= 0),
  dinner_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (dinner_daily_cost >= 0),
  snacks_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (snacks_daily_cost >= 0),
  fresh_water_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (fresh_water_daily_cost >= 0),
  lubricants_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (lubricants_daily_cost >= 0),
  consumables_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (consumables_daily_cost >= 0),
  maintenance_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (maintenance_daily_cost >= 0),
  repairs_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (repairs_daily_cost >= 0),
  spare_parts_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (spare_parts_daily_cost >= 0),
  insurance_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (insurance_daily_cost >= 0),
  technical_management_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (technical_management_daily_cost >= 0),
  regulatory_certification_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (regulatory_certification_daily_cost >= 0),
  communications_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (communications_daily_cost >= 0),
  waste_sewage_daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (waste_sewage_daily_cost >= 0),
  other_daily_operating_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (other_daily_operating_cost >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vessel_id)
);

CREATE TABLE IF NOT EXISTS public.vessel_equipment_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id uuid NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  equipment_name text NOT NULL,
  daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (daily_cost >= 0),
  currency_code text,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vessel_financial_daily_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id uuid NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  daily_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (daily_cost >= 0),
  currency_code text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Derived total: transparent, queryable calculation ----------
CREATE OR REPLACE VIEW public.vessel_daily_cost_summary AS
SELECT
  v.id AS vessel_id,
  v.org_id,
  COALESCE(f.minimum_daily_hire_rate, 0) AS minimum_daily_hire_rate,
  COALESCE(f.crew_manning_daily_cost, 0)
  + COALESCE(f.accommodation_daily_cost, 0)
  + COALESCE(f.breakfast_daily_cost, 0)
  + COALESCE(f.lunch_daily_cost, 0)
  + COALESCE(f.dinner_daily_cost, 0)
  + COALESCE(f.snacks_daily_cost, 0)
  + COALESCE(f.fresh_water_daily_cost, 0)
  + COALESCE(f.lubricants_daily_cost, 0)
  + COALESCE(f.consumables_daily_cost, 0)
  + COALESCE(f.maintenance_daily_cost, 0)
  + COALESCE(f.repairs_daily_cost, 0)
  + COALESCE(f.spare_parts_daily_cost, 0)
  + COALESCE(f.insurance_daily_cost, 0)
  + COALESCE(f.technical_management_daily_cost, 0)
  + COALESCE(f.regulatory_certification_daily_cost, 0)
  + COALESCE(f.communications_daily_cost, 0)
  + COALESCE(f.waste_sewage_daily_cost, 0)
  + COALESCE(f.other_daily_operating_cost, 0)
  + COALESCE((SELECT SUM(e.daily_cost) FROM public.vessel_equipment_costs e WHERE e.vessel_id = v.id), 0)
  + COALESCE((SELECT SUM(c.daily_cost) FROM public.vessel_financial_daily_costs c WHERE c.vessel_id = v.id), 0)
  AS total_daily_vessel_operating_cost
FROM public.vessels v
LEFT JOIN public.vessel_financial_baseline f ON f.vessel_id = v.id;

-- ---------- Indexes ----------
CREATE INDEX IF NOT EXISTS idx_vessels_ownership_mode ON public.vessels(ownership_mode_id);
CREATE INDEX IF NOT EXISTS idx_vessels_status_setup ON public.vessels(vessel_status_id);
CREATE INDEX IF NOT EXISTS idx_vessels_type_setup ON public.vessels(vessel_type_id);
CREATE INDEX IF NOT EXISTS idx_vessels_port_registry ON public.vessels(port_of_registry_id);
CREATE INDEX IF NOT EXISTS idx_vessel_regularities_vessel ON public.vessel_regularities(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_regularities_regularity ON public.vessel_regularities(regularity_id);
CREATE INDEX IF NOT EXISTS idx_vessel_financial_baseline_vessel ON public.vessel_financial_baseline(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_equipment_costs_vessel ON public.vessel_equipment_costs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_daily_costs_vessel ON public.vessel_financial_daily_costs(vessel_id);

-- ---------- RLS ----------
ALTER TABLE public.setup_vessel_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_ownership_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_regularities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_regularity_applicability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_regularities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_financial_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_equipment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_financial_daily_costs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'setup_vessel_status','setup_ownership_modes','setup_regularities',
    'setup_regularity_applicability','vessel_regularities',
    'vessel_financial_baseline','vessel_equipment_costs','vessel_financial_daily_costs'
  ] LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('CREATE POLICY org_select ON public.%I FOR SELECT TO authenticated USING (org_id = (auth.jwt() ->> ''org_id'')::uuid)', t);
    EXECUTE format('CREATE POLICY org_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> ''org_id'')::uuid)', t);
    EXECUTE format('CREATE POLICY org_update ON public.%I FOR UPDATE TO authenticated USING (org_id = (auth.jwt() ->> ''org_id'')::uuid) WITH CHECK (org_id = (auth.jwt() ->> ''org_id'')::uuid)', t);
    EXECUTE format('CREATE POLICY org_delete ON public.%I FOR DELETE TO authenticated USING (org_id = (auth.jwt() ->> ''org_id'')::uuid)', t);
  END LOOP;
END $$;

COMMENT ON TABLE public.setup_vessel_status IS 'Configurable vessel operational status master.';
COMMENT ON TABLE public.setup_ownership_modes IS 'Configurable vessel ownership/employment mode: Owned, Chartered/Leased, Managed Only.';
COMMENT ON TABLE public.setup_regularities IS 'Configurable regulatory/regularity master for vessels.';
COMMENT ON TABLE public.setup_regularity_applicability IS 'Configurable applicability statuses for vessel regularities.';
COMMENT ON TABLE public.vessel_regularities IS 'Vessel-to-regularity applicability records with effective/exemption/document metadata.';
COMMENT ON TABLE public.vessel_financial_baseline IS 'Vessel baseline daily operating cost inputs.';
COMMENT ON TABLE public.vessel_equipment_costs IS 'Dynamic equipment daily cost components.';
COMMENT ON TABLE public.vessel_financial_daily_costs IS 'Dynamic additional recurring daily operating cost components.';

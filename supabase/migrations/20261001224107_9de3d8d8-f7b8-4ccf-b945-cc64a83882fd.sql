
-- 1. Driver columns on baseline
ALTER TABLE public.vessel_financial_baseline
  ADD COLUMN IF NOT EXISTS contracted_crew_count integer,
  ADD COLUMN IF NOT EXISTS crew_cost_per_person_daily numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accommodation_cost_per_person_daily numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS breakfast_cost_per_person_daily numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lunch_cost_per_person_daily numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dinner_cost_per_person_daily numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS snacks_cost_per_person_daily numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fresh_water_daily_quantity numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fresh_water_unit_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lubricants_daily_quantity numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lubricants_unit_cost numeric NOT NULL DEFAULT 0;

-- 2. Tenant RLS via get_user_org_ids() on baseline child tables
DO $$ DECLARE t text; p record; BEGIN
  FOREACH t IN ARRAY ARRAY['vessel_financial_baseline','vessel_equipment_costs','vessel_financial_daily_costs','vessel_project_costs'] LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('CREATE POLICY org_member_select ON public.%I FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids()))', t);
    EXECUTE format('CREATE POLICY org_member_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT public.get_user_org_ids()))', t);
    EXECUTE format('CREATE POLICY org_member_update ON public.%I FOR UPDATE TO authenticated USING (org_id IN (SELECT public.get_user_org_ids())) WITH CHECK (org_id IN (SELECT public.get_user_org_ids()))', t);
    EXECUTE format('CREATE POLICY org_member_delete ON public.%I FOR DELETE TO authenticated USING (org_id IN (SELECT public.get_user_org_ids()))', t);
  END LOOP;
END $$;

-- 3. Assignment table
CREATE TABLE IF NOT EXISTS public.vessel_project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  project_reference text NOT NULL,
  vessel_id uuid NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  project_days integer NOT NULL DEFAULT 0 CHECK (project_days >= 0),
  daily_hire_rate numeric NOT NULL DEFAULT 0 CHECK (daily_hire_rate >= 0),
  minimum_charter_period_days integer NOT NULL DEFAULT 0 CHECK (minimum_charter_period_days >= 0),
  currency_code text NOT NULL DEFAULT 'USD',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, project_reference, vessel_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vessel_project_assignments TO authenticated;
GRANT ALL ON public.vessel_project_assignments TO service_role;
ALTER TABLE public.vessel_project_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_member_select ON public.vessel_project_assignments FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY org_member_insert ON public.vessel_project_assignments FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY org_member_update ON public.vessel_project_assignments FOR UPDATE TO authenticated USING (org_id IN (SELECT public.get_user_org_ids())) WITH CHECK (org_id IN (SELECT public.get_user_org_ids()));
CREATE POLICY org_member_delete ON public.vessel_project_assignments FOR DELETE TO authenticated USING (org_id IN (SELECT public.get_user_org_ids()));
CREATE TRIGGER trg_vpa_updated_at BEFORE UPDATE ON public.vessel_project_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.vessel_project_costs ADD COLUMN IF NOT EXISTS assignment_id uuid REFERENCES public.vessel_project_assignments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_vpc_assignment ON public.vessel_project_costs(assignment_id);

-- 4. Daily summary: driver-based, excludes insurance & hire; owned flag
DROP FUNCTION IF EXISTS public.calculate_vessel_project_cost(uuid, integer, text);
DROP VIEW IF EXISTS public.vessel_daily_cost_summary CASCADE;
CREATE VIEW public.vessel_daily_cost_summary WITH (security_invoker = true) AS
SELECT v.id AS vessel_id, v.org_id, v.name AS vessel_name,
  som.name AS ownership_mode,
  (lower(coalesce(som.name,'')) LIKE '%own%') AS is_owned,
  (lower(coalesce(som.name,'')) LIKE '%charter%' OR lower(coalesce(som.name,'')) LIKE '%lease%') AS is_chartered,
  coalesce(f.currency_code,'USD') AS currency_code,
  ( coalesce(f.contracted_crew_count,0) * ( coalesce(f.crew_cost_per_person_daily,0)+coalesce(f.accommodation_cost_per_person_daily,0)+coalesce(f.breakfast_cost_per_person_daily,0)+coalesce(f.lunch_cost_per_person_daily,0)+coalesce(f.dinner_cost_per_person_daily,0)+coalesce(f.snacks_cost_per_person_daily,0))
    + coalesce(f.fresh_water_daily_quantity,0)*coalesce(f.fresh_water_unit_cost,0)
    + coalesce(f.lubricants_daily_quantity,0)*coalesce(f.lubricants_unit_cost,0)
    + coalesce(f.consumables_daily_cost,0)+coalesce(f.maintenance_daily_cost,0)+coalesce(f.repairs_daily_cost,0)+coalesce(f.spare_parts_daily_cost,0)
    + coalesce(f.technical_management_daily_cost,0)+coalesce(f.regulatory_certification_daily_cost,0)+coalesce(f.communications_daily_cost,0)+coalesce(f.waste_sewage_daily_cost,0)+coalesce(f.other_daily_operating_cost,0)
    + coalesce((SELECT sum(e.daily_cost) FROM public.vessel_equipment_costs e WHERE e.vessel_id=v.id),0)
    + coalesce((SELECT sum(c.daily_cost) FROM public.vessel_financial_daily_costs c WHERE c.vessel_id=v.id),0)
  )::numeric(14,2) AS total_daily_vessel_operating_cost
FROM public.vessels v
LEFT JOIN public.vessel_financial_baseline f ON f.vessel_id=v.id
LEFT JOIN public.setup_ownership_modes som ON som.id=v.ownership_mode_id;
GRANT SELECT ON public.vessel_daily_cost_summary TO authenticated;

-- 5. Assignment summary
CREATE VIEW public.vessel_project_assignment_summary WITH (security_invoker = true) AS
SELECT a.id AS assignment_id, a.org_id, a.project_id, a.project_reference, a.vessel_id, d.vessel_name,
  d.ownership_mode, d.is_owned, d.is_chartered, a.project_days,
  CASE WHEN d.is_chartered THEN greatest(a.project_days, a.minimum_charter_period_days) ELSE a.project_days END AS billable_days,
  CASE WHEN d.is_owned THEN d.total_daily_vessel_operating_cost ELSE 0 END::numeric(14,2) AS daily_vessel_operating_cost,
  CASE WHEN d.is_chartered THEN a.daily_hire_rate ELSE 0 END::numeric(14,2) AS daily_hire_rate,
  a.minimum_charter_period_days,
  (CASE WHEN d.is_owned THEN d.total_daily_vessel_operating_cost*a.project_days ELSE 0 END)::numeric(14,2) AS vessel_operating_cost_total,
  (CASE WHEN d.is_chartered THEN a.daily_hire_rate*greatest(a.project_days,a.minimum_charter_period_days) ELSE 0 END)::numeric(14,2) AS hire_cost_total,
  coalesce((SELECT sum(c.amount) FROM public.vessel_project_costs c WHERE c.assignment_id=a.id),0)::numeric(14,2) AS project_specific_costs,
  ( CASE WHEN d.is_owned THEN d.total_daily_vessel_operating_cost*a.project_days ELSE 0 END
  + CASE WHEN d.is_chartered THEN a.daily_hire_rate*greatest(a.project_days,a.minimum_charter_period_days) ELSE 0 END
  + coalesce((SELECT sum(c.amount) FROM public.vessel_project_costs c WHERE c.assignment_id=a.id),0))::numeric(14,2) AS total_vessel_project_cost,
  a.currency_code
FROM public.vessel_project_assignments a JOIN public.vessel_daily_cost_summary d ON d.vessel_id=a.vessel_id;
GRANT SELECT ON public.vessel_project_assignment_summary TO authenticated;

CREATE VIEW public.project_cost_summary WITH (security_invoker = true) AS
SELECT org_id, project_reference, count(*) AS vessel_count,
  sum(vessel_operating_cost_total)::numeric(14,2) AS owned_operating_cost_total,
  sum(hire_cost_total)::numeric(14,2) AS charter_hire_total,
  sum(project_specific_costs)::numeric(14,2) AS project_specific_costs_total,
  sum(total_vessel_project_cost)::numeric(14,2) AS total_project_cost
FROM public.vessel_project_assignment_summary GROUP BY org_id, project_reference;
GRANT SELECT ON public.project_cost_summary TO authenticated;

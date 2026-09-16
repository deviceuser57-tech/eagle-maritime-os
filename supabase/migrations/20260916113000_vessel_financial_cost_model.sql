-- Vessel financial cost model correction
-- Driver-based daily operating cost + project-level charter cost.
-- Existing daily cost columns are retained for backward compatibility.

ALTER TABLE public.vessel_financial_baseline
  ADD COLUMN IF NOT EXISTS contracted_crew_count integer CHECK (contracted_crew_count IS NULL OR contracted_crew_count >= 0),
  ADD COLUMN IF NOT EXISTS crew_cost_per_person_daily numeric(18,2) NOT NULL DEFAULT 0 CHECK (crew_cost_per_person_daily >= 0),
  ADD COLUMN IF NOT EXISTS accommodation_cost_per_person_daily numeric(18,2) NOT NULL DEFAULT 0 CHECK (accommodation_cost_per_person_daily >= 0),
  ADD COLUMN IF NOT EXISTS breakfast_cost_per_person_daily numeric(18,2) NOT NULL DEFAULT 0 CHECK (breakfast_cost_per_person_daily >= 0),
  ADD COLUMN IF NOT EXISTS lunch_cost_per_person_daily numeric(18,2) NOT NULL DEFAULT 0 CHECK (lunch_cost_per_person_daily >= 0),
  ADD COLUMN IF NOT EXISTS dinner_cost_per_person_daily numeric(18,2) NOT NULL DEFAULT 0 CHECK (dinner_cost_per_person_daily >= 0),
  ADD COLUMN IF NOT EXISTS snacks_cost_per_person_daily numeric(18,2) NOT NULL DEFAULT 0 CHECK (snacks_cost_per_person_daily >= 0),
  ADD COLUMN IF NOT EXISTS fresh_water_daily_quantity numeric(18,3) NOT NULL DEFAULT 0 CHECK (fresh_water_daily_quantity >= 0),
  ADD COLUMN IF NOT EXISTS fresh_water_unit_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (fresh_water_unit_cost >= 0),
  ADD COLUMN IF NOT EXISTS lubricants_daily_quantity numeric(18,3) NOT NULL DEFAULT 0 CHECK (lubricants_daily_quantity >= 0),
  ADD COLUMN IF NOT EXISTS lubricants_unit_cost numeric(18,2) NOT NULL DEFAULT 0 CHECK (lubricants_unit_cost >= 0);

CREATE OR REPLACE FUNCTION public.calculate_vessel_financial_baseline()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  crew numeric := COALESCE(NEW.contracted_crew_count, 0);
BEGIN
  NEW.crew_manning_daily_cost := crew * COALESCE(NEW.crew_cost_per_person_daily, 0);
  NEW.accommodation_daily_cost := crew * COALESCE(NEW.accommodation_cost_per_person_daily, 0);
  NEW.breakfast_daily_cost := crew * COALESCE(NEW.breakfast_cost_per_person_daily, 0);
  NEW.lunch_daily_cost := crew * COALESCE(NEW.lunch_cost_per_person_daily, 0);
  NEW.dinner_daily_cost := crew * COALESCE(NEW.dinner_cost_per_person_daily, 0);
  NEW.snacks_daily_cost := crew * COALESCE(NEW.snacks_cost_per_person_daily, 0);
  NEW.fresh_water_daily_cost := COALESCE(NEW.fresh_water_daily_quantity, 0) * COALESCE(NEW.fresh_water_unit_cost, 0);
  NEW.lubricants_daily_cost := COALESCE(NEW.lubricants_daily_quantity, 0) * COALESCE(NEW.lubricants_unit_cost, 0);
  -- Insurance is project-specific and is intentionally NOT part of vessel dry daily cost.
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_calculate_vessel_financial_baseline ON public.vessel_financial_baseline;
CREATE TRIGGER trg_calculate_vessel_financial_baseline
BEFORE INSERT OR UPDATE ON public.vessel_financial_baseline
FOR EACH ROW
EXECUTE FUNCTION public.calculate_vessel_financial_baseline();

CREATE OR REPLACE VIEW public.vessel_daily_cost_summary AS
SELECT
  v.id AS vessel_id,
  v.org_id,
  COALESCE(f.minimum_daily_hire_rate, 0) AS minimum_daily_hire_rate,
  COALESCE(f.minimum_charter_period_days, 0) AS minimum_charter_period_days,
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

COMMENT ON COLUMN public.vessel_financial_baseline.contracted_crew_count IS 'Number of crew members contracted for the vessel cost model.';
COMMENT ON COLUMN public.vessel_financial_baseline.crew_cost_per_person_daily IS 'Daily crew cost per contracted crew member.';
COMMENT ON COLUMN public.vessel_financial_baseline.accommodation_cost_per_person_daily IS 'Daily accommodation cost per contracted crew member.';
COMMENT ON COLUMN public.vessel_financial_baseline.fresh_water_daily_quantity IS 'Daily fresh-water consumption quantity, normally tonnes/day.';
COMMENT ON COLUMN public.vessel_financial_baseline.fresh_water_unit_cost IS 'Cost per unit of fresh water.';
COMMENT ON COLUMN public.vessel_financial_baseline.lubricants_daily_quantity IS 'Daily lubricant consumption quantity.';
COMMENT ON COLUMN public.vessel_financial_baseline.lubricants_unit_cost IS 'Cost per lubricant unit.';
COMMENT ON COLUMN public.vessel_financial_baseline.insurance_daily_cost IS 'Legacy/manual daily insurance component; project-specific insurance should be calculated in project costing.';

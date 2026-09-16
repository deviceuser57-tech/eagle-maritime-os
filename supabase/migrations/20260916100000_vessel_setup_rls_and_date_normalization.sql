-- Vessel Management runtime fixes
-- 1) Use organization membership for vessel-specific Setup masters instead of relying on a JWT org_id claim.
-- 2) Normalize blank vessel date strings to NULL before PostgreSQL date casting.

DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'setup_vessel_types',
    'setup_hull_materials',
    'setup_hull_coatings',
    'setup_propulsion_types',
    'setup_fuel_types',
    'setup_trading_areas',
    'setup_engine_makers',
    'setup_engine_models',
    'setup_shipyards',
    'setup_vessel_status',
    'setup_ownership_modes',
    'setup_regularity_applicability'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      FOR p IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY org_member_select ON public.%I FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids()))',
        t
      );
      EXECUTE format(
        'CREATE POLICY org_member_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT public.get_user_org_ids()))',
        t
      );
      EXECUTE format(
        'CREATE POLICY org_member_update ON public.%I FOR UPDATE TO authenticated USING (org_id IN (SELECT public.get_user_org_ids())) WITH CHECK (org_id IN (SELECT public.get_user_org_ids()))',
        t
      );
      EXECUTE format(
        'CREATE POLICY org_member_delete ON public.%I FOR DELETE TO authenticated USING (org_id IN (SELECT public.get_user_org_ids()))',
        t
      );
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.normalize_vessel_blank_dates()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.keel_laid_date IS NOT NULL AND btrim(NEW.keel_laid_date::text) = '' THEN
    NEW.keel_laid_date := NULL;
  END IF;
  IF NEW.delivery_date IS NOT NULL AND btrim(NEW.delivery_date::text) = '' THEN
    NEW.delivery_date := NULL;
  END IF;
  IF NEW.last_drydock_date IS NOT NULL AND btrim(NEW.last_drydock_date::text) = '' THEN
    NEW.last_drydock_date := NULL;
  END IF;
  IF NEW.next_drydock_date IS NOT NULL AND btrim(NEW.next_drydock_date::text) = '' THEN
    NEW.next_drydock_date := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_vessel_blank_dates ON public.vessels;
CREATE TRIGGER trg_normalize_vessel_blank_dates
BEFORE INSERT OR UPDATE ON public.vessels
FOR EACH ROW
EXECUTE FUNCTION public.normalize_vessel_blank_dates();

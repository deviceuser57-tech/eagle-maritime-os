-- Vessel Management runtime fix
-- Use organization membership for vessel-specific Setup masters instead of relying on a JWT org_id claim.
-- Blank vessel date normalization is handled in src/hooks/useVessels.ts before the Supabase write.

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

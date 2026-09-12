-- ============================================================
-- Vessel Management correction pass
-- 1) Use the existing Regulatory Intelligence `regulations` master
--    instead of introducing a duplicate setup_regularities master.
-- 2) Align new Vessel tables with the repository's established
--    organization_members based RLS model.
-- ============================================================

-- ---------- Migrate any temporary setup_regularities data ----------
-- This table was introduced by the previous Vessel upgrade migration.
-- Preserve any seeded/entered values by copying them into the existing
-- regulation master before removing the duplicate table.
INSERT INTO public.regulations (code, title, convention, description, is_global, org_id)
SELECT
  sr.name,
  sr.name,
  sr.name,
  sr.description,
  false,
  sr.org_id
FROM public.setup_regularities sr
WHERE NOT EXISTS (
  SELECT 1
  FROM public.regulations r
  WHERE r.org_id = sr.org_id
    AND (r.code = sr.name OR r.title = sr.name)
);

-- ---------- Re-point vessel regularities to the existing regulation master ----------
ALTER TABLE public.vessel_regularities
  DROP CONSTRAINT IF EXISTS vessel_regularities_regularity_id_fkey;

ALTER TABLE public.vessel_regularities
  ADD CONSTRAINT vessel_regularities_regularity_id_fkey
  FOREIGN KEY (regularity_id)
  REFERENCES public.regulations(id)
  ON DELETE RESTRICT;

-- ---------- Remove the duplicate Vessel-specific Regularity master ----------
DROP TABLE IF EXISTS public.setup_regularities;

-- ---------- Correct RLS for new Vessel tables ----------
-- The application's established tenant isolation is based on
-- organization_members(user_id, org_id), not a custom org_id JWT claim.
DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'setup_vessel_status',
    'setup_ownership_modes',
    'setup_regularity_applicability',
    'vessel_regularities',
    'vessel_financial_baseline',
    'vessel_equipment_costs',
    'vessel_financial_daily_costs'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
      END LOOP;
      EXECUTE format(
        'CREATE POLICY "Org-scoped access" ON public.%I FOR ALL TO authenticated USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())) WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))',
        t
      );
    END IF;
  END LOOP;
END $$;

COMMENT ON TABLE public.vessel_regularities IS 'Vessel-to-existing Regulatory Intelligence regulation records with applicability and effective/exemption/document metadata.';

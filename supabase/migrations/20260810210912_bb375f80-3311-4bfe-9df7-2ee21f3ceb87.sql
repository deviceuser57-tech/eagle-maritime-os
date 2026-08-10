DO $$
DECLARE t text; p text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'setup_audit_types','setup_certificate_types','setup_classification_societies',
    'setup_companies','setup_contract_types','setup_crew_ranks','setup_currencies',
    'setup_finding_statuses','setup_finding_types','setup_flag_states',
    'setup_nationalities','setup_root_causes'
  ] LOOP
    FOR p IN
      SELECT policyname FROM pg_policies
      WHERE schemaname='public' AND tablename=t AND policyname <> 'Org-scoped access'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
    END LOOP;
  END LOOP;
END $$;

ALTER TABLE public.setup_finding_types
  ADD COLUMN IF NOT EXISTS default_deduction numeric NOT NULL DEFAULT 10;
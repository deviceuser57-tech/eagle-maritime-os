-- =====================================================
-- COMPANY MASTER REGISTRY: MULTI-ROLE MODEL
-- One setup_companies row may represent one company with
-- any combination of Owner / Operator / Technical Manager /
-- ISM Manager / DOC Issuer roles.
-- =====================================================

ALTER TABLE public.setup_companies
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_operator BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_technical_manager BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_ism_manager BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_doc_issuer BOOLEAN NOT NULL DEFAULT false;

-- Backfill role flags from the legacy single-role company_type.
UPDATE public.setup_companies
SET
  is_owner = is_owner OR company_type = 'owner',
  is_operator = is_operator OR company_type = 'operator',
  is_technical_manager = is_technical_manager OR company_type = 'technical',
  is_ism_manager = is_ism_manager OR company_type = 'ism',
  is_doc_issuer = is_doc_issuer OR company_type = 'doc';

-- Consolidate exact company duplicates inside the same organization.
-- Only vessel foreign keys are remapped because they are the confirmed
-- database consumers of setup_companies.id in the current schema.
DO $$
DECLARE
  dup RECORD;
  keep_id UUID;
  duplicate_ids UUID[];
BEGIN
  FOR dup IN
    SELECT org_id, lower(trim(name)) AS company_key
    FROM public.setup_companies
    WHERE org_id IS NOT NULL
    GROUP BY org_id, lower(trim(name))
    HAVING COUNT(*) > 1
  LOOP
    SELECT id INTO keep_id
    FROM public.setup_companies
    WHERE org_id = dup.org_id
      AND lower(trim(name)) = dup.company_key
    ORDER BY created_at ASC, id ASC
    LIMIT 1;

    SELECT array_agg(id) INTO duplicate_ids
    FROM public.setup_companies
    WHERE org_id = dup.org_id
      AND lower(trim(name)) = dup.company_key
      AND id <> keep_id;

    UPDATE public.setup_companies c
    SET
      is_owner = c.is_owner OR EXISTS (SELECT 1 FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.is_owner),
      is_operator = c.is_operator OR EXISTS (SELECT 1 FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.is_operator),
      is_technical_manager = c.is_technical_manager OR EXISTS (SELECT 1 FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.is_technical_manager),
      is_ism_manager = c.is_ism_manager OR EXISTS (SELECT 1 FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.is_ism_manager),
      is_doc_issuer = c.is_doc_issuer OR EXISTS (SELECT 1 FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.is_doc_issuer),
      contact_person = COALESCE(c.contact_person, (SELECT x.contact_person FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.contact_person IS NOT NULL LIMIT 1)),
      title = COALESCE(c.title, (SELECT x.title FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.title IS NOT NULL LIMIT 1)),
      phone = COALESCE(c.phone, (SELECT x.phone FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.phone IS NOT NULL LIMIT 1)),
      email = COALESCE(c.email, (SELECT x.email FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.email IS NOT NULL LIMIT 1)),
      address = COALESCE(c.address, (SELECT x.address FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.address IS NOT NULL LIMIT 1)),
      remarks = COALESCE(c.remarks, (SELECT x.remarks FROM public.setup_companies x WHERE x.id = ANY(duplicate_ids) AND x.remarks IS NOT NULL LIMIT 1))
    WHERE c.id = keep_id;

    UPDATE public.vessels SET owner_company_id = keep_id WHERE owner_company_id = ANY(duplicate_ids);
    UPDATE public.vessels SET operator_company_id = keep_id WHERE operator_company_id = ANY(duplicate_ids);
    UPDATE public.vessels SET technical_manager_id = keep_id WHERE technical_manager_id = ANY(duplicate_ids);
    UPDATE public.vessels SET ism_manager_id = keep_id WHERE ism_manager_id = ANY(duplicate_ids);

    DELETE FROM public.setup_companies WHERE id = ANY(duplicate_ids);
  END LOOP;
END $$;

-- Prevent future duplicate master records within an organization.
CREATE UNIQUE INDEX IF NOT EXISTS setup_companies_org_name_unique
  ON public.setup_companies (org_id, lower(trim(name)))
  WHERE org_id IS NOT NULL;

COMMENT ON COLUMN public.setup_companies.company_type IS
  'Legacy primary role retained for backward compatibility. Use role flags for multi-role company membership.';
COMMENT ON COLUMN public.setup_companies.is_owner IS 'Company can be assigned as vessel Owner.';
COMMENT ON COLUMN public.setup_companies.is_operator IS 'Company can be assigned as vessel Operator.';
COMMENT ON COLUMN public.setup_companies.is_technical_manager IS 'Company can be assigned as vessel Technical Manager.';
COMMENT ON COLUMN public.setup_companies.is_ism_manager IS 'Company can be assigned as vessel ISM Manager.';
COMMENT ON COLUMN public.setup_companies.is_doc_issuer IS 'Company can be assigned as DOC Issuer.';

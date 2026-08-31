-- ============================================================
-- Migration: 20260831000000_master_data_architecture.sql
-- Purpose:   Create new Setup tables and add insurer role to companies
-- ============================================================

-- 1. setup_incident_types
CREATE TABLE IF NOT EXISTS public.setup_incident_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);
ALTER TABLE public.setup_incident_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view incident types in their org" ON public.setup_incident_types FOR SELECT TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can insert incident types in their org" ON public.setup_incident_types FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can update incident types in their org" ON public.setup_incident_types FOR UPDATE TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can delete incident types in their org" ON public.setup_incident_types FOR DELETE TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- 2. setup_project_types
CREATE TABLE IF NOT EXISTS public.setup_project_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);
ALTER TABLE public.setup_project_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view project types in their org" ON public.setup_project_types FOR SELECT TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can insert project types in their org" ON public.setup_project_types FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can update project types in their org" ON public.setup_project_types FOR UPDATE TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can delete project types in their org" ON public.setup_project_types FOR DELETE TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- 3. setup_claim_types
CREATE TABLE IF NOT EXISTS public.setup_claim_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);
ALTER TABLE public.setup_claim_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view claim types in their org" ON public.setup_claim_types FOR SELECT TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can insert claim types in their org" ON public.setup_claim_types FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can update claim types in their org" ON public.setup_claim_types FOR UPDATE TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "Users can delete claim types in their org" ON public.setup_claim_types FOR DELETE TO authenticated USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- 4. setup_companies (Add insurer role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='setup_companies' AND column_name='is_insurer'
  ) THEN
    ALTER TABLE public.setup_companies ADD COLUMN is_insurer boolean DEFAULT false;
  END IF;
END $$;

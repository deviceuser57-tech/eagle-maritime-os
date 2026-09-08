-- ============================================================
-- Migration: 20260904000000_vessel_master_data_tables.sql
-- Purpose:   Create all remaining setup tables identified in the
--            comprehensive hardcoded-dropdown audit.
--            Covers: VesselManagement, Maintenance, Incidents,
--                    RulesRegulations, Operations, Certificates,
--                    Auditors, and shared Ports table.
-- ============================================================

-- ─────────────────────────────────────────────────
-- 1. setup_vessel_types
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_vessel_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  abbreviation text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_vessel_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_vessel_types"  ON public.setup_vessel_types FOR SELECT    TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_vessel_types"  ON public.setup_vessel_types FOR INSERT    TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_vessel_types"  ON public.setup_vessel_types FOR UPDATE    TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_vessel_types"  ON public.setup_vessel_types FOR DELETE    TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Seed default vessel types (org-agnostic rows are inserted per org at onboarding, so we only create the structure)

-- ─────────────────────────────────────────────────
-- 2. setup_hull_materials
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_hull_materials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_hull_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_hull_materials" ON public.setup_hull_materials FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_hull_materials" ON public.setup_hull_materials FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_hull_materials" ON public.setup_hull_materials FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_hull_materials" ON public.setup_hull_materials FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 3. setup_hull_coatings
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_hull_coatings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  coating_type text NOT NULL,
  manufacturer text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, coating_type)
);
ALTER TABLE public.setup_hull_coatings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_hull_coatings" ON public.setup_hull_coatings FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_hull_coatings" ON public.setup_hull_coatings FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_hull_coatings" ON public.setup_hull_coatings FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_hull_coatings" ON public.setup_hull_coatings FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 4. setup_propulsion_types
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_propulsion_types (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_propulsion_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_propulsion" ON public.setup_propulsion_types FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_propulsion" ON public.setup_propulsion_types FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_propulsion" ON public.setup_propulsion_types FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_propulsion" ON public.setup_propulsion_types FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 5. setup_fuel_types
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_fuel_types (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name         text NOT NULL,
  abbreviation text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_fuel_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_fuel_types" ON public.setup_fuel_types FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_fuel_types" ON public.setup_fuel_types FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_fuel_types" ON public.setup_fuel_types FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_fuel_types" ON public.setup_fuel_types FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 6. setup_trading_areas
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_trading_areas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_trading_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_trading_areas" ON public.setup_trading_areas FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_trading_areas" ON public.setup_trading_areas FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_trading_areas" ON public.setup_trading_areas FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_trading_areas" ON public.setup_trading_areas FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 7. setup_engine_makers
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_engine_makers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  maker_name  text NOT NULL,
  country     text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, maker_name)
);
ALTER TABLE public.setup_engine_makers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_engine_makers" ON public.setup_engine_makers FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_engine_makers" ON public.setup_engine_makers FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_engine_makers" ON public.setup_engine_makers FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_engine_makers" ON public.setup_engine_makers FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 8. setup_engine_models
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_engine_models (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  model_name  text NOT NULL,
  maker_id    uuid REFERENCES public.setup_engine_makers(id) ON DELETE SET NULL,
  engine_type text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, model_name)
);
ALTER TABLE public.setup_engine_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_engine_models" ON public.setup_engine_models FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_engine_models" ON public.setup_engine_models FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_engine_models" ON public.setup_engine_models FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_engine_models" ON public.setup_engine_models FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 9. setup_shipyards
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_shipyards (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  yard_name  text NOT NULL,
  country    text,
  city       text,
  dock_type  text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, yard_name)
);
ALTER TABLE public.setup_shipyards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_shipyards" ON public.setup_shipyards FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_shipyards" ON public.setup_shipyards FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_shipyards" ON public.setup_shipyards FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_shipyards" ON public.setup_shipyards FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 10. setup_ports  (shared: Operations, Certificates, AuditPlan, etc.)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_ports (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  port_name  text NOT NULL,
  country    text,
  un_locode  text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, port_name)
);
ALTER TABLE public.setup_ports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_ports" ON public.setup_ports FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_ports" ON public.setup_ports FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_ports" ON public.setup_ports FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_ports" ON public.setup_ports FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 11. setup_maintenance_task_types
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_maintenance_task_types (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  value      text NOT NULL,
  label      text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, value)
);
ALTER TABLE public.setup_maintenance_task_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_maint_task_types" ON public.setup_maintenance_task_types FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_maint_task_types" ON public.setup_maintenance_task_types FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_maint_task_types" ON public.setup_maintenance_task_types FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_maint_task_types" ON public.setup_maintenance_task_types FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 12. setup_equipment_categories
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_equipment_categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  parent_category text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_equipment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_equip_cats" ON public.setup_equipment_categories FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_equip_cats" ON public.setup_equipment_categories FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_equip_cats" ON public.setup_equipment_categories FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_equip_cats" ON public.setup_equipment_categories FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 13. setup_vessel_locations  (Maintenance screen)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_vessel_locations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  value      text NOT NULL,
  label_en   text NOT NULL,
  label_ar   text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, value)
);
ALTER TABLE public.setup_vessel_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_vessel_locs" ON public.setup_vessel_locations FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_vessel_locs" ON public.setup_vessel_locations FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_vessel_locs" ON public.setup_vessel_locations FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_vessel_locs" ON public.setup_vessel_locations FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 14. setup_severity_levels  (Incidents)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_severity_levels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_severity_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_severity" ON public.setup_severity_levels FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_severity" ON public.setup_severity_levels FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_severity" ON public.setup_severity_levels FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_severity" ON public.setup_severity_levels FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 15. setup_risk_categories  (Incidents / HSQE)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_risk_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_risk_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_risk_cats" ON public.setup_risk_categories FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_risk_cats" ON public.setup_risk_categories FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_risk_cats" ON public.setup_risk_categories FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_risk_cats" ON public.setup_risk_categories FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 16. setup_regulation_categories  (RulesRegulations)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_regulation_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_regulation_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_reg_cats" ON public.setup_regulation_categories FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_reg_cats" ON public.setup_regulation_categories FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_reg_cats" ON public.setup_regulation_categories FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_reg_cats" ON public.setup_regulation_categories FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 17. setup_survey_types  (Certificates)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_survey_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_survey_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_survey_types" ON public.setup_survey_types FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_survey_types" ON public.setup_survey_types FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_survey_types" ON public.setup_survey_types FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_survey_types" ON public.setup_survey_types FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 18. setup_surveyors  (Certificates)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_surveyors (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name           text NOT NULL,
  company        text,
  license_number text,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_surveyors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_surveyors" ON public.setup_surveyors FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_surveyors" ON public.setup_surveyors FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_surveyors" ON public.setup_surveyors FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_surveyors" ON public.setup_surveyors FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 19. setup_audit_specializations  (AuditorManagement)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_audit_specializations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_audit_specializations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_audit_specs" ON public.setup_audit_specializations FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_audit_specs" ON public.setup_audit_specializations FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_audit_specs" ON public.setup_audit_specializations FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_audit_specs" ON public.setup_audit_specializations FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- 20. setup_cargo_types  (Operations - future use)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setup_cargo_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  hazard_class text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
ALTER TABLE public.setup_cargo_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select_cargo_types" ON public.setup_cargo_types FOR SELECT TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_insert_cargo_types" ON public.setup_cargo_types FOR INSERT TO authenticated WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_update_cargo_types" ON public.setup_cargo_types FOR UPDATE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_delete_cargo_types" ON public.setup_cargo_types FOR DELETE TO authenticated USING  (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- ─────────────────────────────────────────────────
-- Comments
-- ─────────────────────────────────────────────────
COMMENT ON TABLE public.setup_vessel_types           IS 'Master list of vessel type categories per organization.';
COMMENT ON TABLE public.setup_hull_materials         IS 'Hull construction material options per organization.';
COMMENT ON TABLE public.setup_hull_coatings          IS 'Anti-fouling and protective coating types per organization.';
COMMENT ON TABLE public.setup_propulsion_types       IS 'Engine/propulsion configuration types per organization.';
COMMENT ON TABLE public.setup_fuel_types             IS 'Bunker and fuel type options per organization.';
COMMENT ON TABLE public.setup_trading_areas          IS 'Vessel trading area / operational zone categories.';
COMMENT ON TABLE public.setup_engine_makers          IS 'Engine manufacturer registry per organization.';
COMMENT ON TABLE public.setup_engine_models          IS 'Engine model registry, linked to maker.';
COMMENT ON TABLE public.setup_shipyards              IS 'Shipyard / drydock facility registry per organization.';
COMMENT ON TABLE public.setup_ports                  IS 'Port registry used across Operations, Certificates, and Audits.';
COMMENT ON TABLE public.setup_maintenance_task_types IS 'Maintenance work order type classifications.';
COMMENT ON TABLE public.setup_equipment_categories   IS 'Equipment system categories for maintenance tasks.';
COMMENT ON TABLE public.setup_vessel_locations       IS 'On-board location zones for maintenance tasks (bilingual).';
COMMENT ON TABLE public.setup_severity_levels        IS 'Incident severity scale per organization.';
COMMENT ON TABLE public.setup_risk_categories        IS 'HSQE risk category taxonomy per organization.';
COMMENT ON TABLE public.setup_regulation_categories  IS 'Regulatory framework category tags.';
COMMENT ON TABLE public.setup_survey_types           IS 'Statutory and class survey type options for certificates.';
COMMENT ON TABLE public.setup_surveyors              IS 'Surveyor registry for vessel certificate management.';
COMMENT ON TABLE public.setup_audit_specializations  IS 'Auditor specialization / qualification areas.';
COMMENT ON TABLE public.setup_cargo_types            IS 'Cargo classification list for voyage planning.';

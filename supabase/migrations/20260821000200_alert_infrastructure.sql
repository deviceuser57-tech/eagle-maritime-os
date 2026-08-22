-- ============================================================
-- Migration: 20260821000200_alert_infrastructure.sql
-- Purpose:   Security alert rules, triggered alerts, and
--            security_scan_results table used by the CI pipeline
--            and the Security Posture Dashboard.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. security_scan_results
--    Written by CI pipeline jobs; read by dashboard.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.security_scan_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL DEFAULT 'ci',          -- 'ci' | 'staging' | 'production'
  scan_type   text NOT NULL,                        -- 'rls_coverage' | 'graphql_exclusion'
  status      text NOT NULL CHECK (status IN ('pass','fail','warn')),
  detail      jsonb,
  scanned_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_scan_results ENABLE ROW LEVEL SECURITY;

-- Service-role writes (CI); authenticated users can read
CREATE POLICY "Service role can insert scan results"
  ON public.security_scan_results
  FOR INSERT TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read scan results"
  ON public.security_scan_results
  FOR SELECT TO authenticated
  USING (true);

-- ─────────────────────────────────────────────
-- 2. alert_rules
--    Admin-configurable conditions that drive alerts.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_name     text NOT NULL,
  description   text,
  condition_sql text,                -- optional: SQL expression evaluated server-side
  severity      text NOT NULL DEFAULT 'warn' CHECK (severity IN ('info','warn','critical')),
  is_active     boolean NOT NULL DEFAULT true,
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org-scoped access on alert_rules"
  ON public.alert_rules
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 3. triggered_alerts
--    Records every time a rule fires.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.triggered_alerts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_id       uuid REFERENCES public.alert_rules(id) ON DELETE SET NULL,
  rule_name     text NOT NULL,
  severity      text NOT NULL DEFAULT 'warn',
  message       text,
  detail        jsonb,
  acknowledged  boolean NOT NULL DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz,
  triggered_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.triggered_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org-scoped access on triggered_alerts"
  ON public.triggered_alerts
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 4. Indexes for performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scan_results_scanned_at   ON public.security_scan_results (scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_results_scan_type    ON public.security_scan_results (scan_type);
CREATE INDEX IF NOT EXISTS idx_alert_rules_org_active    ON public.alert_rules (org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_triggered_alerts_org      ON public.triggered_alerts (org_id, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_triggered_alerts_unacked  ON public.triggered_alerts (org_id, acknowledged) WHERE acknowledged = false;

-- ─────────────────────────────────────────────
-- 5. updated_at trigger for alert_rules
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_alert_rules_updated_at ON public.alert_rules;
CREATE TRIGGER trg_alert_rules_updated_at
  BEFORE UPDATE ON public.alert_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

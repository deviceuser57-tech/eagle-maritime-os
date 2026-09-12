-- Vessel project costing: project-specific costs are kept separate from the
-- reusable daily vessel operating baseline and are included in total project cost.

CREATE TABLE IF NOT EXISTS public.vessel_project_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id uuid NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  project_reference text,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency_code text NOT NULL DEFAULT 'USD',
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vessel_project_costs_org_vessel
  ON public.vessel_project_costs(org_id, vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_project_costs_project_reference
  ON public.vessel_project_costs(org_id, project_reference);

ALTER TABLE public.vessel_project_costs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vessel_project_costs_org_access ON public.vessel_project_costs;
CREATE POLICY vessel_project_costs_org_access
  ON public.vessel_project_costs
  FOR ALL
  USING (org_id = public.get_user_org_id())
  WITH CHECK (org_id = public.get_user_org_id());

CREATE OR REPLACE VIEW public.vessel_project_cost_summary AS
SELECT
  v.id AS vessel_id,
  v.org_id,
  COALESCE(dc.total_daily_operating_cost, 0)::numeric(14,2) AS daily_operating_cost,
  COALESCE(SUM(pc.amount), 0)::numeric(14,2) AS project_specific_costs,
  COALESCE(SUM(pc.amount), 0)::numeric(14,2) AS project_specific_costs_total,
  COUNT(pc.id)::integer AS project_cost_line_count,
  COALESCE(dc.currency_code, MAX(pc.currency_code), 'USD') AS currency_code
FROM public.vessels v
LEFT JOIN public.vessel_daily_cost_summary dc ON dc.vessel_id = v.id
LEFT JOIN public.vessel_project_costs pc ON pc.vessel_id = v.id AND pc.org_id = v.org_id
GROUP BY v.id, v.org_id, dc.total_daily_operating_cost, dc.currency_code;

CREATE OR REPLACE FUNCTION public.calculate_vessel_project_cost(
  p_vessel_id uuid,
  p_project_days integer,
  p_project_reference text DEFAULT NULL
)
RETURNS TABLE (
  vessel_id uuid,
  project_days integer,
  daily_operating_cost numeric,
  operating_cost_total numeric,
  project_specific_costs numeric,
  total_project_cost numeric,
  currency_code text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.id,
    GREATEST(COALESCE(p_project_days, 0), 0),
    COALESCE(dc.total_daily_operating_cost, 0)::numeric(14,2),
    (COALESCE(dc.total_daily_operating_cost, 0) * GREATEST(COALESCE(p_project_days, 0), 0))::numeric(14,2),
    COALESCE((
      SELECT SUM(pc.amount)
      FROM public.vessel_project_costs pc
      WHERE pc.vessel_id = v.id
        AND pc.org_id = v.org_id
        AND (p_project_reference IS NULL OR pc.project_reference = p_project_reference)
    ), 0)::numeric(14,2),
    (
      COALESCE(dc.total_daily_operating_cost, 0) * GREATEST(COALESCE(p_project_days, 0), 0)
      + COALESCE((
          SELECT SUM(pc.amount)
          FROM public.vessel_project_costs pc
          WHERE pc.vessel_id = v.id
            AND pc.org_id = v.org_id
            AND (p_project_reference IS NULL OR pc.project_reference = p_project_reference)
        ), 0)
    )::numeric(14,2),
    COALESCE(dc.currency_code, (
      SELECT pc.currency_code
      FROM public.vessel_project_costs pc
      WHERE pc.vessel_id = v.id AND pc.org_id = v.org_id
      ORDER BY pc.created_at DESC
      LIMIT 1
    ), 'USD')
  FROM public.vessels v
  LEFT JOIN public.vessel_daily_cost_summary dc ON dc.vessel_id = v.id
  WHERE v.id = p_vessel_id;
$$;

COMMENT ON TABLE public.vessel_project_costs IS
  'Project-specific vessel costs. Combined with the complete daily operating cost model to calculate total project cost.';
COMMENT ON FUNCTION public.calculate_vessel_project_cost(uuid, integer, text) IS
  'Total project cost = complete daily vessel operating cost × project days + project-specific costs.';

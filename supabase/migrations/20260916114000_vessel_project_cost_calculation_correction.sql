-- Correct project cost calculation:
-- daily dry operating cost is always charged for project/billable days.
-- charter/lease hire is added only for Chartered/Leased vessels.
-- minimum charter period affects billable days for charter/lease only.
-- project-specific costs remain separate.

DROP POLICY IF EXISTS vessel_project_costs_org_access ON public.vessel_project_costs;
DROP POLICY IF EXISTS org_member_select ON public.vessel_project_costs;
DROP POLICY IF EXISTS org_member_insert ON public.vessel_project_costs;
DROP POLICY IF EXISTS org_member_update ON public.vessel_project_costs;
DROP POLICY IF EXISTS org_member_delete ON public.vessel_project_costs;

CREATE POLICY org_member_select
  ON public.vessel_project_costs FOR SELECT TO authenticated
  USING (org_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY org_member_insert
  ON public.vessel_project_costs FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY org_member_update
  ON public.vessel_project_costs FOR UPDATE TO authenticated
  USING (org_id IN (SELECT public.get_user_org_ids()))
  WITH CHECK (org_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY org_member_delete
  ON public.vessel_project_costs FOR DELETE TO authenticated
  USING (org_id IN (SELECT public.get_user_org_ids()));

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
    billable.billable_days::integer,
    COALESCE(dc.total_daily_vessel_operating_cost, 0)::numeric(14,2),
    (COALESCE(dc.total_daily_vessel_operating_cost, 0) * billable.billable_days)::numeric(14,2),
    COALESCE((
      SELECT SUM(pc.amount)
      FROM public.vessel_project_costs pc
      WHERE pc.vessel_id = v.id
        AND pc.org_id = v.org_id
        AND (p_project_reference IS NULL OR pc.project_reference = p_project_reference)
    ), 0)::numeric(14,2),
    (
      COALESCE(dc.total_daily_vessel_operating_cost, 0) * billable.billable_days
      + CASE WHEN billable.is_chartered
          THEN COALESCE(f.minimum_daily_hire_rate, 0) * billable.billable_days
          ELSE 0
        END
      + COALESCE((
          SELECT SUM(pc.amount)
          FROM public.vessel_project_costs pc
          WHERE pc.vessel_id = v.id
            AND pc.org_id = v.org_id
            AND (p_project_reference IS NULL OR pc.project_reference = p_project_reference)
        ), 0)
    )::numeric(14,2),
    COALESCE(f.currency_code, (
      SELECT pc.currency_code
      FROM public.vessel_project_costs pc
      WHERE pc.vessel_id = v.id AND pc.org_id = v.org_id
      ORDER BY pc.created_at DESC
      LIMIT 1
    ), 'USD')
  FROM public.vessels v
  LEFT JOIN public.vessel_daily_cost_summary dc ON dc.vessel_id = v.id
  LEFT JOIN public.vessel_financial_baseline f ON f.vessel_id = v.id
  CROSS JOIN LATERAL (
    SELECT
      (
        lower(COALESCE((SELECT som.name FROM public.setup_ownership_modes som WHERE som.id = v.ownership_mode_id), ''))
        LIKE '%charter%'
        OR lower(COALESCE((SELECT som.name FROM public.setup_ownership_modes som WHERE som.id = v.ownership_mode_id), ''))
        LIKE '%lease%'
      ) AS is_chartered,
      GREATEST(
        GREATEST(COALESCE(p_project_days, 0), 0),
        CASE
          WHEN lower(COALESCE((SELECT som.name FROM public.setup_ownership_modes som WHERE som.id = v.ownership_mode_id), '')) LIKE '%charter%'
            OR lower(COALESCE((SELECT som.name FROM public.setup_ownership_modes som WHERE som.id = v.ownership_mode_id), '')) LIKE '%lease%'
          THEN COALESCE(f.minimum_charter_period_days, 0)
          ELSE 0
        END
      ) AS billable_days
  ) billable
  WHERE v.id = p_vessel_id;
$$;

COMMENT ON FUNCTION public.calculate_vessel_project_cost(uuid, integer, text) IS
  'Project cost = dry daily operating cost x billable days + charter/lease hire x billable days when applicable + project-specific costs. Minimum charter period affects billable days only for Chartered/Leased vessels.';

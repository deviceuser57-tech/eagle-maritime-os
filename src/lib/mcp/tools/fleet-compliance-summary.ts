import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, resolveOrgId, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "fleet_compliance_summary",
  title: "Fleet compliance summary",
  description: "Summarize fleet compliance: vessel count, certificates expired or expiring within 90 days, and open incidents.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const orgId = await resolveOrgId(supabase, ctx.getUserId());

    const { data: vessels, error: vesselError } = await supabase
      .from("vessels")
      .select("id, name, status")
      .eq("org_id", orgId);
    if (vesselError) return errorResult(vesselError.message);
    const fleet = (vessels ?? []) as { id: string; name: string; status: string | null }[];

    const today = new Date().toISOString().slice(0, 10);
    const soon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

    let expired = 0;
    let expiringSoon = 0;
    if (fleet.length > 0) {
      const { data: certs, error: certError } = await supabase
        .from("vessel_certifications")
        .select("expiry_date")
        .in("vessel_id", fleet.map((v) => v.id))
        .lte("expiry_date", soon);
      if (certError) return errorResult(certError.message);
      for (const c of (certs ?? []) as { expiry_date: string }[]) {
        if (c.expiry_date < today) expired += 1;
        else expiringSoon += 1;
      }
    }

    const { data: incidents, error: incidentError } = await supabase
      .from("incidents")
      .select("severity, investigation_status")
      .eq("org_id", orgId);
    if (incidentError) return errorResult(incidentError.message);
    const rows = (incidents ?? []) as { severity: string | null; investigation_status: string | null }[];

    return jsonResult({
      vessels: {
        total: fleet.length,
        active: fleet.filter((v) => (v.status ?? "").toLowerCase() === "active").length,
      },
      certificates: { expired, expiring_within_90_days: expiringSoon },
      incidents: {
        total: rows.length,
        open: rows.filter((i) => (i.investigation_status ?? "open").toLowerCase() !== "closed").length,
        high_or_critical: rows.filter((i) => ["high", "critical"].includes((i.severity ?? "").toLowerCase())).length,
      },
    });
  },
});

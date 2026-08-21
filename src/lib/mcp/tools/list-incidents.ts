import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, resolveOrgId, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_incidents",
  title: "List incidents",
  description: "List reported safety, pollution and near-miss incidents for the organization's fleet.",
  inputSchema: {
    vessel_id: z.string().uuid().optional().describe("Restrict to a single vessel."),
    severity: z.enum(["low", "medium", "high", "critical"]).optional().describe("Filter by severity."),
    since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Only incidents on or after this date (YYYY-MM-DD)."),
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ vessel_id, severity, since, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const orgId = await resolveOrgId(supabase, ctx.getUserId());

    let query = supabase
      .from("incidents")
      .select("id, title, incident_type, severity, incident_date, location, investigation_status, vessel_id, vessels(name)")
      .eq("org_id", orgId)
      .order("incident_date", { ascending: false })
      .limit(limit ?? 25);
    if (vessel_id) query = query.eq("vessel_id", vessel_id);
    if (severity) query = query.eq("severity", severity);
    if (since) query = query.gte("incident_date", since);

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, incidents: data ?? [] });
  },
});

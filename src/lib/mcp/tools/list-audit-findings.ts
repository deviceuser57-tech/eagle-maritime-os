import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, resolveOrgId, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_audit_findings",
  title: "List audit findings",
  description: "List audit findings (non-conformities, observations) raised across the organization's audits.",
  inputSchema: {
    vessel_id: z.string().uuid().optional().describe("Restrict to findings from audits on this vessel."),
    status: z.string().trim().min(1).optional().describe("Filter by finding status, e.g. open or closed."),
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ vessel_id, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const orgId = await resolveOrgId(supabase, ctx.getUserId());

    let query = (supabase
      .from("audit_findings")
      .select("*, audits!inner(org_id, vessel_id, audit_type, audit_date)") as any)
      .eq("audits.org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (vessel_id) query = query.eq("audits.vessel_id", vessel_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, findings: data ?? [] });
  },
});

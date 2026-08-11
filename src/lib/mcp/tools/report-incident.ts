import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, resolveOrgId, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "report_incident",
  title: "Report an incident",
  description: "Create a new incident record (safety, pollution, near-miss) for a vessel in the organization.",
  inputSchema: {
    title: z.string().trim().min(3).max(200).describe("Short incident title."),
    incident_type: z.string().trim().min(2).max(100).describe("Incident type, e.g. Near Miss, Injury, Pollution."),
    incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date of the incident (YYYY-MM-DD)."),
    severity: z.enum(["low", "medium", "high", "critical"]).default("low"),
    vessel_id: z.string().uuid().optional().describe("Vessel involved."),
    location: z.string().trim().max(200).optional().describe("Position or port where it happened."),
    description: z.string().trim().max(4000).optional().describe("What happened."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const orgId = await resolveOrgId(supabase, userId);

    if (input.vessel_id) {
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("id")
        .eq("org_id", orgId)
        .eq("id", input.vessel_id)
        .maybeSingle();
      if (vesselError) return errorResult(vesselError.message);
      if (!vessel) return errorResult("Vessel not found in your organization.");
    }

    const { data, error } = await supabase
      .from("incidents")
      .insert({
        org_id: orgId,
        user_id: userId,
        title: input.title,
        incident_type: input.incident_type,
        incident_date: input.incident_date,
        severity: input.severity,
        vessel_id: input.vessel_id ?? null,
        location: input.location ?? null,
        description: input.description ?? null,
        investigation_status: "open",
      })
      .select("id, title, incident_type, severity, incident_date, investigation_status")
      .single();
    if (error) return errorResult(error.message);
    return jsonResult({ created: data });
  },
});

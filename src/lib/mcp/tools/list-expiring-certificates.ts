import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, resolveOrgId, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_expiring_certificates",
  title: "List expiring certificates",
  description: "List statutory and class certificates in the fleet that expire within a given number of days.",
  inputSchema: {
    within_days: z.number().int().min(1).max(365).default(90).describe("Look-ahead window in days."),
    vessel_id: z.string().uuid().optional().describe("Restrict to a single vessel."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ within_days, vessel_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const orgId = await resolveOrgId(supabase, ctx.getUserId());

    const { data: vessels, error: vesselError } = await supabase
      .from("vessels")
      .select("id, name, imo_number")
      .eq("org_id", orgId);
    if (vesselError) return errorResult(vesselError.message);
    const fleet = (vessels ?? []) as { id: string; name: string; imo_number: string | null }[];
    const ids = fleet.filter((v) => !vessel_id || v.id === vessel_id).map((v) => v.id);
    if (ids.length === 0) return jsonResult({ count: 0, certificates: [] });

    const cutoff = new Date(Date.now() + (within_days ?? 90) * 86400000).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("vessel_certifications")
      .select("id, vessel_id, certificate_name, certificate_type, issuing_authority, expiry_date, status")
      .in("vessel_id", ids)
      .lte("expiry_date", cutoff)
      .order("expiry_date", { ascending: true })
      .limit(limit ?? 50);
    if (error) return errorResult(error.message);

    const byId = new Map(fleet.map((v) => [v.id, v]));
    const today = new Date().toISOString().slice(0, 10);
    const certificates = (data ?? []).map((c) => {
      const row = c as { vessel_id: string | null; expiry_date: string };
      const vessel = row.vessel_id ? byId.get(row.vessel_id) : undefined;
      return {
        ...c,
        vessel_name: vessel?.name ?? null,
        imo_number: vessel?.imo_number ?? null,
        expired: row.expiry_date < today,
      };
    });
    return jsonResult({ count: certificates.length, within_days: within_days ?? 90, certificates });
  },
});

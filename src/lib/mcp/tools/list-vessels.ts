import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, resolveOrgId, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_vessels",
  title: "List vessels",
  description: "List vessels in the signed-in user's organization fleet, optionally filtered by name or IMO number.",
  inputSchema: {
    search: z.string().trim().min(1).optional().describe("Filter by vessel name or IMO number."),
    limit: z.number().int().min(1).max(100).default(25).describe("Maximum vessels to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const orgId = await resolveOrgId(supabase, ctx.getUserId());
    let query = supabase
      .from("vessels")
      .select("id, name, imo_number, call_sign, vessel_type, flag_state, classification_society, gross_tonnage, deadweight, year_built, status")
      .eq("org_id", orgId)
      .order("name", { ascending: true })
      .limit(limit ?? 25);
    if (search) query = query.or(`name.ilike.%${search}%,imo_number.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ count: data?.length ?? 0, vessels: data ?? [] });
  },
});

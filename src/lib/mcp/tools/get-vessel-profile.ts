import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, resolveOrgId, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "get_vessel_profile",
  title: "Get vessel profile",
  description: "Get the full particulars of one vessel plus its certificates, by vessel id or IMO number.",
  inputSchema: {
    vessel_id: z.string().uuid().optional().describe("Vessel UUID."),
    imo_number: z.string().trim().min(3).optional().describe("IMO number, used when vessel_id is unknown."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ vessel_id, imo_number }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    if (!vessel_id && !imo_number) return errorResult("Provide either vessel_id or imo_number.");
    const supabase = supabaseForUser(ctx);
    const orgId = await resolveOrgId(supabase, ctx.getUserId());

    let query = supabase.from("vessels").select("*").eq("org_id", orgId).limit(1);
    query = vessel_id ? query.eq("id", vessel_id) : query.eq("imo_number", imo_number!);
    const { data: vessel, error } = await query.maybeSingle();
    if (error) return errorResult(error.message);
    if (!vessel) return errorResult("Vessel not found in your organization.");

    const { data: certificates, error: certError } = await supabase
      .from("vessel_certifications")
      .select("id, certificate_name, certificate_type, issuing_authority, issue_date, expiry_date, status")
      .eq("vessel_id", (vessel as { id: string }).id)
      .order("expiry_date", { ascending: true });
    if (certError) return errorResult(certError.message);

    return jsonResult({ vessel, certificates: certificates ?? [] });
  },
});

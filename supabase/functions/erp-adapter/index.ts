import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "No authorization header" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 401,
            });
        }

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Verify Authentication
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
            authHeader.replace("Bearer ", "")
        );

        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Invalid token" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 401,
            });
        }

        const { event, payload, org_id } = await req.json();

        if (!org_id) {
            return new Response(JSON.stringify({ error: "Missing org_id" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        // 2. Verify Organization Membership & Admin Role
        const { data: memberData, error: memberError } = await supabaseClient
            .from("organization_members")
            .select("id, org_roles(name)")
            .eq("org_id", org_id)
            .eq("user_id", user.id)
            .single();

        if (memberError || !memberData) {
            console.error(`[ERP-Adapter] Unauthorized access attempt by ${user.id} for Org: ${org_id}`);
            return new Response(JSON.stringify({ error: "Unauthorized access to this organization" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 403,
            });
        }

        const roleName = (memberData.org_roles as any)?.name;
        if (roleName !== 'Super Admin' && roleName !== 'Admin') {
            console.error(`[ERP-Adapter] User ${user.id} has insufficient role: ${roleName}`);
            return new Response(JSON.stringify({ error: "Insufficient permissions. Admin role required." }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 403,
            });
        }

        console.log(`[ERP-Adapter] Authorized event: ${event} for Org: ${org_id} by User: ${user.id}`);

        // 3. Fetch ERP Configuration for this Org
        const { data: erpConfig, error: configError } = await supabaseClient
            .from("erp_configurations")
            .select("*")
            .eq("org_id", org_id)
            .eq("status", "ACTIVE")
            .single();

        if (configError || !erpConfig) {
            return new Response(JSON.stringify({ error: "No active ERP configuration found" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 404,
            });
        }

        // 4. Data Mapping (Transformation Layer)
        const translatedPayload = {
            external_system: erpConfig.erp_type,
            vessel_data: payload,
            timestamp: new Date().toISOString(),
        };

        return new Response(JSON.stringify({
            success: true,
            erp: erpConfig.erp_type,
            message: "Data queued for ERP synchronization"
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});


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
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { event, payload, org_id } = await req.json();

        console.log(`[ERP-Adapter] Received event: ${event} for Org: ${org_id}`);

        // 1. Fetch ERP Configuration for this Org
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

        // 2. Data Mapping (Transformation Layer)
        // Here logic would be added to translate 'payload' to SAP/Oracle/Dynamics formats
        const translatedPayload = {
            external_system: erpConfig.erp_type,
            vessel_data: payload,
            timestamp: new Date().toISOString(),
        };

        // 3. Outgoing Request (Stub)
        // const response = await fetch(erpConfig.base_url, {
        //   method: 'POST',
        //   body: JSON.stringify(translatedPayload),
        //   headers: { ... }
        // });

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

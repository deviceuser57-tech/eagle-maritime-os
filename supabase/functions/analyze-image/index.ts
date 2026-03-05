import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

console.log("Analyze-Image Edge Function Initializing...");

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing backend configuration");
    }

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "AI service not configured. LOVABLE_API_KEY is missing." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Verify Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const body = await req.json().catch(() => ({}));
    const { fileUrl, contentType, prompt: customPrompt, org_id } = body;

    if (!org_id) {
      return new Response(JSON.stringify({ error: "Missing organization context (org_id)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "Missing fileUrl" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Verify Organization Membership
    const { data: member } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('org_id', org_id)
      .maybeSingle();

    if (!member) {
      return new Response(JSON.stringify({ error: "Unauthorized for this organization" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    console.log(`Analyzing vessel document for ${user.email} in org ${org_id}`);

    // Fetch the file and convert to base64 for vision model
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Could not fetch document: ${fileResponse.statusText}`);
    }

    const blob = await fileResponse.blob();
    const buffer = await blob.arrayBuffer();
    const base64Data = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    const mimeType = contentType || blob.type || "application/pdf";

    const systemPrompt = `You are a specialized Maritime Intelligence Agent. Extract vessel technical specifications from the provided maritime document (brochure, registry, or photo).

CRITICAL: Extract the Vessel Name with 100% accuracy. It is often in the document header, main title, or Registry/Class sections.

Rules:
1. If a value is missing or illegible, return null. Do NOT guess.
2. For the 'name', do not include prefixes like "MV" or "MT" if they are clearly separate titles.
3. Keep units attached to numerical values (e.g., "52000", "229", "15").
4. Focus on Merchant Vessel standards.
${customPrompt ? `\nAdditional Instructions: ${customPrompt}` : ""}`;

    // Use Lovable AI Gateway with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Data}` }
              },
              {
                type: "text",
                text: "Extract all vessel technical specifications from this document. Return structured data using the extract_vessel_specs tool."
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_vessel_specs",
              description: "Extract vessel technical specifications from a maritime document",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Vessel name" },
                  imo_number: { type: "string", description: "IMO number" },
                  vessel_type: { type: "string", description: "Vessel type (e.g. Bulk Carrier, Container Ship)" },
                  flag_state: { type: "string", description: "Flag state / country of registration" },
                  port_of_registry: { type: "string", description: "Port of registry" },
                  call_sign: { type: "string", description: "Radio call sign" },
                  mmsi_number: { type: "string", description: "MMSI number" },
                  official_number: { type: "string", description: "Official number" },
                  gross_tonnage: { type: "string", description: "Gross tonnage" },
                  net_tonnage: { type: "string", description: "Net tonnage" },
                  deadweight: { type: "string", description: "Deadweight tonnage" },
                  year_built: { type: "string", description: "Year built" },
                  classification_society: { type: "string", description: "Classification society" },
                  class_number: { type: "string", description: "Class number" },
                  length_overall: { type: "string", description: "Length overall in meters" },
                  beam: { type: "string", description: "Beam/width in meters" },
                  depth: { type: "string", description: "Depth in meters" },
                  draft: { type: "string", description: "Draft in meters" },
                  engine_make: { type: "string", description: "Engine manufacturer" },
                  engine_model: { type: "string", description: "Engine model" },
                  engine_power: { type: "string", description: "Engine power" },
                  propulsion_type: { type: "string", description: "Propulsion type" },
                  max_speed: { type: "string", description: "Maximum speed" },
                  service_speed: { type: "string", description: "Service speed" },
                  fuel_consumption: { type: "string", description: "Fuel consumption" },
                  fuel_type: { type: "string", description: "Fuel type" },
                  cargo_capacity: { type: "string", description: "Cargo capacity" },
                  passenger_capacity: { type: "string", description: "Passenger capacity" },
                  crew_capacity: { type: "string", description: "Crew capacity" },
                  hull_material: { type: "string", description: "Hull material" }
                },
                required: ["name"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_vessel_specs" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ success: false, error: "AI rate limit exceeded. Please try again in a moment." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ success: false, error: "AI credits exhausted. Please add funds." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402
        });
      }
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiResult = await aiResponse.json();
    console.log("AI response received");

    // Extract structured data from tool call
    let data: Record<string, any> = {};
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        data = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool call arguments:", e);
        throw new Error("AI returned invalid structured data");
      }
    } else {
      // Fallback: try to parse content as JSON
      const content = aiResult.choices?.[0]?.message?.content || "";
      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) data = JSON.parse(match[0]);
        else throw new Error("No structured data in response");
      } catch {
        throw new Error("Could not extract vessel specifications from document");
      }
    }

    // Clean null string values
    Object.keys(data).forEach(key => {
      if (data[key] === "null" || data[key] === "N/A" || data[key] === "") {
        data[key] = null;
      }
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error(`Edge Function Error: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

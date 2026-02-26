// Modern Supabase Edge Function using Deno.serve
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Analyze-Image (Deno.serve) Initializing...");

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify Configuration
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Edge Function configuration error (Supabase)");
    }

    if (!geminiKey) {
      console.error("Missing Gemini API Key");
      return new Response(
        JSON.stringify({ success: false, error: "AI Registry Configuration Missing: GEMINI_API_KEY" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. Verify Authentication
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
      console.error("Missing org_id in request body");
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

    // 3. Initialize Supabase Client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Get User from Auth Header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("User verification failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // 5. Verify Organization Membership
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('org_id', org_id)
      .maybeSingle();

    if (memberError || !member) {
      console.warn(`Unauthorized access attempt by ${user.id} for org ${org_id}`);
      return new Response(JSON.stringify({ error: "You do not have permission to perform AI extraction for this organization" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    console.log(`Analyzing Vessel Document for ${user.email} in Org: ${org_id}`);

    // 6. Invoke AI Analysis
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Fetch the file content
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Cloud Storage unreachable: ${fileResponse.statusText}`);
    }

    const blob = await fileResponse.blob();
    const buffer = await blob.arrayBuffer();
    const base64Data = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

    const systemPrompt = `
      You are a Maritime Specifications Expert. Extract vessel technical data from the provided document.
      Return a FLAT JSON object with strings for all values. 
      Keys MUST be: 
      - name, imo_number, vessel_type, flag_state, port_of_registry, call_sign, mmsi_number, official_number,
      - gross_tonnage, net_tonnage, deadweight, year_built, classification_society, class_number,
      - length_overall, beam, depth, draft, engine_make, engine_model, engine_power,
      - propulsion_type, max_speed, service_speed, fuel_consumption, fuel_type,
      - cargo_capacity, passenger_capacity, crew_capacity, hull_material
      
      Rules:
      1. If a value is missing, return null for that key.
      2. Keep units with the values (e.g., "52000 GT", "229 m").
      3. Focus on accuracy. Return ONLY valid JSON.
    `;

    console.log("Invoking Gemini 1.5 Flash Technical Analysis...");
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: contentType || blob.type || "application/pdf"
        }
      },
      systemPrompt + (customPrompt ? `\n\nAdditional Instructions: ${customPrompt}` : "")
    ]);

    const responseText = result.response.text();
    console.log("Analysis Complete");

    // Robust JSON parsing
    let data;
    try {
      const cleanedText = responseText.replace(/```json|```/g, "").trim();
      data = JSON.parse(cleanedText);
    } catch (e) {
      console.warn("JSON Parse failed, attempting fallback extraction", e);
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        data = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid intelligence format returned by AI Registry: " + responseText.substring(0, 50));
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error(`Edge Function Runtime Error: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

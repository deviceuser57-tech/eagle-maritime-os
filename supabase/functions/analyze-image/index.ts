// Modern Supabase Edge Function using Deno.serve
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

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
    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const body = await req.json();
    const { fileUrl, contentType, prompt: customPrompt } = body;

    console.log(`Analyzing Vessel Document: ${fileUrl}`);

    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error("Missing Gemini API Key");
      return new Response(
        JSON.stringify({ success: false, error: "AI Registry Configuration Missing: GEMINI_API_KEY" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 } // Return 200 to show custom error in frontend
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Fetch the file content
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch document: ${fileResponse.statusText}`);
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
        throw new Error("Invalid intelligence format returned by Gemini: " + responseText.substring(0, 100));
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

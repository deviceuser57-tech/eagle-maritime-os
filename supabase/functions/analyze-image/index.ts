// Modern Supabase Edge Function standard using Deno.serve
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, contentType, prompt: customPrompt } = await req.json()

    if (!fileUrl) {
      throw new Error('No file URL provided')
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      console.error('CRITICAL: AI Service configuration missing (API Key)')
      throw new Error('AI Service configuration missing (API Key). Please configure GEMINI_API_KEY in Supabase project settings.')
    }

    console.log(`Analyzing document: ${fileUrl}`)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    })

    // Fetch the file
    console.log('Fetching source document...')
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file from storage: ${fileResponse.statusText}`)
    }

    const blob = await fileResponse.blob()
    const buffer = await blob.arrayBuffer()
    const base64Data = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))

    const systemPrompt = `
      You are a specialized maritime technical analyst. 
      Analyze the provided vessel brochure/document and extract ALL technical specifications.
      
      Return a FLAT JSON object using EXACTLY these keys (use null if not found):
      - name, imo_number, vessel_type, flag_state, port_of_registry, call_sign, mmsi_number, official_number,
      - gross_tonnage, net_tonnage, deadweight, year_built, classification_society, class_number,
      - length_overall, beam, depth, draft, engine_make, engine_model, engine_power,
      - propulsion_type, max_speed, service_speed, fuel_consumption, fuel_type,
      - cargo_capacity, passenger_capacity, crew_capacity, hull_material
      
      IMPORTANT: 
      1. For numeric values, return just the number as a string or number.
      2. If you find units, normalize them.
      3. Use 'null' for unknown values.
      4. DO NOT wrap the JSON in markdown code blocks.
    `

    console.log('Invoking Gemini Registry...')
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: contentType || blob.type || "application/pdf"
        }
      },
      customPrompt || systemPrompt
    ])

    const responseText = result.response.text()
    console.log('Gemini extraction complete')

    // Attempt to parse the JSON with fallbacks for markdown/conversational filler
    let extractedData;
    let jsonString = responseText;

    try {
      extractedData = JSON.parse(jsonString);
    } catch (e) {
      try {
        jsonString = responseText.replace(/```json|```/g, "").trim();
        extractedData = JSON.parse(jsonString);
      } catch (e2) {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) {
          extractedData = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Function Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
      console.error('API Key missing in environment')
      throw new Error('AI Service configuration missing (API Key)')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    })

    // Fetch the file
    console.log(`Fetching file from: ${fileUrl}`)
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) throw new Error(`Failed to fetch file: ${fileResponse.statusText}`)

    const blob = await fileResponse.blob()
    const buffer = await blob.arrayBuffer()
    const base64Data = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))

    const systemPrompt = `
      You are a specialized maritime technical analyst. 
      Analyze the provided vessel brochure/document and extract ALL technical specifications.
      
      Return a FLAT JSON object using EXACTLY these keys (use null if not found):
      - name (Vessel Name)
      - imo_number (7-digit IMO number)
      - vessel_type (e.g., Bulk Carrier, Container, Tanker)
      - flag_state (Country of Registry)
      - port_of_registry (City)
      - call_sign
      - mmsi_number
      - official_number
      - gross_tonnage (numeric)
      - net_tonnage (numeric)
      - deadweight (numeric)
      - year_built (YYYY)
      - classification_society (e.g., DNV, ABS, LRS)
      - length_overall (numeric, meters)
      - beam (numeric, meters)
      - depth (numeric, meters)
      - draft (numeric, meters)
      - engine_make
      - engine_model
      - engine_power (numeric, kW)
      - propulsion_type
      - max_speed (numeric, knots)
      - service_speed (numeric, knots)
      - fuel_consumption (numeric, t/day)
      - fuel_type
      - cargo_capacity (numeric)
      - passenger_capacity (numeric)
      - crew_capacity (numeric)
      - hull_material
      
      IMPORTANT: 
      1. For numeric values, return just the number (no units).
      2. If you find units, normalize them (e.g., kW, meters, MT).
      3. Use 'null' for unknown values.
      4. DO NOT wrap the JSON in markdown code blocks.
    `

    console.log('Sending request to Gemini...')
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
    console.log('Gemini Response Received')

    // Attempt to parse the JSON with multiple fallbacks
    let extractedData;
    let jsonString = responseText;

    try {
      // First attempt: direct parse
      extractedData = JSON.parse(jsonString);
    } catch (e) {
      // Second attempt: clean markdown blocks
      try {
        jsonString = responseText.replace(/```json|```/g, "").trim();
        extractedData = JSON.parse(jsonString);
      } catch (e2) {
        // Third attempt: extract everything between the first '{' and the last '}'
        try {
          const match = responseText.match(/\{[\s\S]*\}/);
          if (match) {
            extractedData = JSON.parse(match[0]);
          } else {
            throw new Error("No JSON structure found");
          }
        } catch (e3) {
          console.error('All JSON parsing attempts failed:', responseText);
          throw new Error('AI returned an invalid data format');
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

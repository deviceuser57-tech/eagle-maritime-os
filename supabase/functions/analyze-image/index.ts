import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
            throw new Error('AI Service configuration missing (API Key)')
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        // Fetch the file
        const response = await fetch(fileUrl)
        const blob = await response.blob()
        const buffer = await blob.arrayBuffer()
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))

        const prompt = customPrompt || `
      Extract the technical specifications from this vessel brochure/document.
      Return the data in a flat JSON object with the following keys where applicable:
      name, imo_number, vessel_type, flag_state, port_of_registry, call_sign, mmsi_number, 
      official_number, gross_tonnage, net_tonnage, deadweight, year_built, 
      classification_society, class_number, length_overall, beam, depth, draft, 
      engine_make, engine_model, engine_power, propulsion_type, max_speed, 
      service_speed, fuel_consumption, fuel_type, cargo_capacity, passenger_capacity, 
      crew_capacity, hull_material.
      
      Values should be strings or numbers as appropriate.
      Return ONLY the JSON object, no markdown, no explanation.
    `

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64,
                    mimeType: contentType || blob.type || "application/pdf"
                }
            },
            prompt
        ])

        const text = result.response.text()
        // Clean potential markdown code blocks
        const jsonString = text.replace(/```json|```/g, "").trim()
        const extractedData = JSON.parse(jsonString)

        return new Response(
            JSON.stringify({ success: true, data: extractedData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Extraction Error:', error.message)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})

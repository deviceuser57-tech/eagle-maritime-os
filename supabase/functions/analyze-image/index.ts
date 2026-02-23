import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Analyze-Image Function Initializing...");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, contentType, prompt: customPrompt } = await req.json()
    console.log(`Processing file: ${fileUrl}`);

    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('Missing API Key (GEMINI_API_KEY or LOVABLE_API_KEY)');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) throw new Error(`Fetch failed: ${fileResponse.statusText}`);

    const blob = await fileResponse.blob();
    const buffer = await blob.arrayBuffer();
    const base64Data = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

    const systemPrompt = `
      Extract vessel technical specifications from the provided brochure/document.
      Return a flat JSON object with standard maritime keys (imo_number, gross_tonnage, length_overall, beam, engine_model, etc.).
      Values should be strings. Return ONLY pure JSON.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: contentType || blob.type || "application/pdf"
        }
      },
      customPrompt || systemPrompt
    ]);

    const responseText = result.response.text();
    console.log("Gemini Output received");

    // Robust JSON parsing
    let data;
    try {
      data = JSON.parse(responseText.replace(/```json|```/g, "").trim());
    } catch (e) {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
      else throw new Error("Invalid AI response format");
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error(`Error: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

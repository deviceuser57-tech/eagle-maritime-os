import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

console.log("Analyze-Image Edge Function v2 Initializing...");

// Comprehensive extraction scaffold with human-readable labels for better AI mapping
const VESSEL_EXTRACTION_SCAFFOLD = {
  // Identity
  name: { label: "Vessel Name", type: "string" },
  imo_number: { label: "IMO Number (7 digits)", type: "string" },
  call_sign: { label: "Call Sign / Radio Call Sign", type: "string" },
  mmsi_number: { label: "MMSI Number", type: "string" },
  official_number: { label: "Official / Registry Number", type: "string" },
  vessel_type: { label: "Vessel Type (e.g. Bulk Carrier, Tanker, Container Ship)", type: "string" },
  flag_state: { label: "Flag State / Registry Country", type: "string" },
  port_of_registry: { label: "Port of Registry / Home Port", type: "string" },
  classification_society: { label: "Classification Society (e.g. DNV, Lloyd's, BV, ABS)", type: "string" },
  class_number: { label: "Class Number / Class ID", type: "string" },
  status: { label: "Vessel Status", type: "string" },

  // Tonnage & Dimensions
  gross_tonnage: { label: "Gross Tonnage (GT) — numeric only, no units", type: "number" },
  net_tonnage: { label: "Net Tonnage (NT) — numeric only", type: "number" },
  deadweight: { label: "Deadweight Tonnage (DWT) — numeric only", type: "number" },
  length_overall: { label: "Length Overall (LOA) in meters — numeric only", type: "number" },
  beam: { label: "Beam / Breadth in meters — numeric only", type: "number" },
  depth: { label: "Depth / Moulded Depth in meters — numeric only", type: "number" },
  draft: { label: "Draft / Draught in meters — numeric only", type: "number" },
  cargo_capacity: { label: "Cargo Capacity (cubic meters or tons) — numeric only", type: "number" },

  // Construction
  year_built: { label: "Year Built — 4-digit year", type: "number" },
  hull_material: { label: "Hull Material (Steel, Aluminum, etc.)", type: "string" },
  hull_coating: { label: "Hull Coating / Anti-fouling System", type: "string" },
  keel_laid_date: { label: "Keel Laid Date (YYYY-MM-DD)", type: "string" },
  delivery_date: { label: "Delivery Date (YYYY-MM-DD)", type: "string" },

  // Machinery
  engine_make: { label: "Main Engine Manufacturer (e.g. MAN, Wärtsilä)", type: "string" },
  engine_model: { label: "Main Engine Model", type: "string" },
  engine_power: { label: "Main Engine Power in kW — numeric only", type: "number" },
  propulsion_type: { label: "Propulsion Type (Single Screw, Twin Screw, etc.)", type: "string" },
  max_speed: { label: "Maximum Speed in knots — numeric only", type: "number" },
  service_speed: { label: "Service / Cruising Speed in knots — numeric only", type: "number" },
  fuel_consumption: { label: "Fuel Consumption in tonnes/day — numeric only", type: "number" },
  fuel_type: { label: "Fuel Type (HFO, VLSFO, MGO, LNG, etc.)", type: "string" },

  // Safety & Capacity
  lifeboats: { label: "Number of Lifeboats — numeric only", type: "number" },
  liferafts: { label: "Number of Life Rafts — numeric only", type: "number" },
  crew_capacity: { label: "Crew Capacity — numeric only", type: "number" },
  passenger_capacity: { label: "Passenger Capacity — numeric only", type: "number" },

  // Operations
  trading_area: { label: "Trading Area (Worldwide, Coastal, etc.)", type: "string" },
  navigation_equipment: { label: "Navigation Equipment (ECDIS, Radar, GPS details)", type: "string" },
  accommodations_pax: { label: "Accommodation Details / Cabin Info", type: "string" },
  painting_details: { label: "Painting / Coating System Details", type: "string" },

  // Financial
  purchase_price: { label: "Purchase Price — numeric only", type: "number" },
  insurance_value: { label: "Insurance Value — numeric only", type: "number" },
  currency: { label: "Currency Code (USD, EUR, etc.)", type: "string" },
};

function stripUnits(value: any, type: string): any {
  if (value === null || value === undefined) return null;

  if (type === "number") {
    if (typeof value === "number") return value;
    const str = String(value)
      .replace(/,/g, '')
      .replace(/\s*(GT|DWT|NT|kW|HP|BHP|m|meters|metres|knots|kn|kt|tons|tonnes|t\/d|t\/day|cbm|cu\.?m|sq\.?m|USD|EUR|GBP|SGD|MW)\.?\s*/gi, '')
      .trim();
    const parsed = parseFloat(str);
    return isNaN(parsed) ? null : parsed;
  }

  if (type === "string") {
    const str = String(value).trim();
    return str === "" || str.toLowerCase() === "n/a" || str.toLowerCase() === "null" || str === "-" ? null : str;
  }

  return value;
}

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
    const { fileUrl, contentType, org_id } = body;

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
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('org_id', org_id)
      .maybeSingle();

    if (memberError || !member) {
      return new Response(JSON.stringify({ error: "Organization access denied" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    console.log(`Analyzing vessel document for ${user.email} in org ${org_id}`);

    // Fetch the file and convert to base64
    let buffer: ArrayBuffer;
    let mimeType = contentType || "application/pdf";
    
    // Check if it's a Supabase Storage URL
    const storageMatch = fileUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (storageMatch) {
      const bucket = storageMatch[1];
      const path = decodeURIComponent(storageMatch[2]);
      console.log(`Downloading from storage bucket '${bucket}', path '${path}'`);
      
      const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(path);
      if (downloadError || !fileData) {
        throw new Error(`Could not fetch document from storage: ${downloadError?.message || 'Unknown error'}`);
      }
      
      buffer = await fileData.arrayBuffer();
      mimeType = contentType || fileData.type || "application/pdf";
    } else {
      console.log(`Fetching from external URL: ${fileUrl}`);
      // Fallback for localhost URLs when running locally
      let fetchUrl = fileUrl;
      const localMatch = fileUrl.match(/^http:\/\/(localhost|127\.0\.0\.1):(\d+)(.*)$/);
      if (localMatch && supabaseUrl) {
         const urlObj = new URL(fileUrl);
         fetchUrl = `${supabaseUrl}${urlObj.pathname}${urlObj.search}`;
         console.log(`Rewrote local URL to: ${fetchUrl}`);
      }
      
      const fileResponse = await fetch(fetchUrl);
      if (!fileResponse.ok) {
        throw new Error(`Could not fetch document: ${fileResponse.statusText}`);
      }
      const blob = await fileResponse.blob();
      buffer = await blob.arrayBuffer();
      mimeType = contentType || blob.type || "application/pdf";
    }

    const uint8Array = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binary);

    // Build field description for the prompt
    const fieldDescriptions = Object.entries(VESSEL_EXTRACTION_SCAFFOLD)
      .map(([key, meta]) => `  "${key}": ${meta.label} (${meta.type})`)
      .join("\n");

    const systemPrompt = `You are a world-class Maritime Document Intelligence Agent. Your mission is to extract vessel technical specifications from any maritime document — including brochures, data sheets, registry certificates, classification reports, photos of nameplates, and specification tables.

EXTRACTION TARGET FIELDS:
${fieldDescriptions}

CRITICAL RULES:
1. Return ONLY a flat JSON object with the exact keys listed above.
2. For "number" type fields: return ONLY the raw numeric value. Strip ALL units (GT, DWT, m, kW, knots, etc.). Example: "52,450 GT" → 52450, "229.5 m" → 229.5
3. For "string" type fields: return clean text values.
4. If a value is not found or illegible, return null for that key.
5. DO NOT add keys that aren't in the list above.
6. DO NOT wrap the JSON in markdown code blocks.
7. Be aggressive in finding data — look in headers, footers, tables, sidebars, captions, watermarks.
8. For vessel names, check the document title, header, and any prominent text.
9. Map common abbreviations: LOA=length_overall, B=beam, D=depth, T=draft, MCR=engine_power, DWT=deadweight, GT=gross_tonnage, NT=net_tonnage
10. If the document shows engine info like "MAN B&W 6S60MC-C", split into engine_make="MAN B&W" and engine_model="6S60MC-C"
11. For IMO numbers, extract only the 7-digit numeric part (no "IMO" prefix).`;

    const userPrompt = `Extract ALL vessel technical specifications from this document. Be thorough — check every section, table, and annotation. Return structured JSON mapped to the target fields.`;

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
              { type: "text", text: userPrompt }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ success: false, error: "AI rate limit exceeded. Please try again in a moment." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ success: false, error: "AI credits exhausted." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402
        });
      }
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";
    let rawData: Record<string, any> = {};

    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        rawData = JSON.parse(match[0]);
      } else {
        throw new Error("No JSON in response");
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Could not extract vessel specifications from document");
    }

    // Post-process: clean values using scaffold type info
    const cleanedData: Record<string, any> = {};
    let fieldsExtracted = 0;

    for (const [key, meta] of Object.entries(VESSEL_EXTRACTION_SCAFFOLD)) {
      if (key in rawData) {
        const cleaned = stripUnits(rawData[key], meta.type);
        if (cleaned !== null) {
          cleanedData[key] = cleaned;
          fieldsExtracted++;
        }
      }
    }

    // Special post-processing for IMO number
    if (cleanedData.imo_number) {
      const imoMatch = String(cleanedData.imo_number).match(/(\d{7})/);
      cleanedData.imo_number = imoMatch ? imoMatch[1] : null;
    }

    console.log(`Extraction complete: ${fieldsExtracted} fields populated`);

    return new Response(
      JSON.stringify({ success: true, data: cleanedData, fields_extracted: fieldsExtracted }),
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

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

console.log("Analyze-Image Edge Function v3 — Smart Extraction");

// ---------------------------------------------------------------------------
// Field definitions with rich context for AI tool-calling
// ---------------------------------------------------------------------------
const VESSEL_FIELDS = {
  // Identity
  name: { description: "Vessel name as displayed prominently on the document", type: "string" },
  imo_number: { description: "IMO number — exactly 7 digits, no prefix", type: "string" },
  call_sign: { description: "Radio call sign", type: "string" },
  mmsi_number: { description: "MMSI number — 9 digits", type: "string" },
  official_number: { description: "Official or registry number", type: "string" },
  vessel_type: { description: "Vessel type: Bulk Carrier, Oil Tanker, Container Ship, General Cargo, Chemical Tanker, LNG Carrier, LPG Carrier, Ro-Ro, Car Carrier, Passenger, Cruise, Offshore, Tug, Barge, etc.", type: "string" },
  flag_state: { description: "Flag state / country of registry", type: "string" },
  port_of_registry: { description: "Port of registry / home port", type: "string" },
  classification_society: { description: "Classification society: DNV, Lloyd's Register (LR), Bureau Veritas (BV), ABS, ClassNK, RINA, CCS, KR, IRS", type: "string" },
  class_number: { description: "Classification society class number or ID", type: "string" },
  status: { description: "Vessel operational status: active, laid-up, under-construction, scrapped", type: "string" },

  // Tonnage & Dimensions
  gross_tonnage: { description: "Gross Tonnage (GT) — numeric value only", type: "number" },
  net_tonnage: { description: "Net Tonnage (NT) — numeric value only", type: "number" },
  deadweight: { description: "Deadweight tonnage (DWT) — numeric value only", type: "number" },
  length_overall: { description: "Length Overall (LOA) in meters — numeric only", type: "number" },
  beam: { description: "Beam / Breadth in meters — numeric only", type: "number" },
  depth: { description: "Depth / Moulded Depth in meters — numeric only", type: "number" },
  draft: { description: "Maximum Draft / Draught in meters — numeric only", type: "number" },
  cargo_capacity: { description: "Cargo capacity in cubic meters or metric tons — numeric only", type: "number" },

  // Construction
  year_built: { description: "Year of construction — 4-digit year", type: "number" },
  hull_material: { description: "Hull material: Steel, Aluminum, FRP, etc.", type: "string" },
  hull_coating: { description: "Hull coating / anti-fouling system details", type: "string" },
  keel_laid_date: { description: "Keel laid date in YYYY-MM-DD format", type: "string" },
  delivery_date: { description: "Vessel delivery date in YYYY-MM-DD format", type: "string" },

  // Machinery
  engine_make: { description: "Main engine manufacturer: MAN, MAN B&W, Wärtsilä, Mitsubishi, Caterpillar, Yanmar, etc.", type: "string" },
  engine_model: { description: "Main engine model designation (e.g., 6S60MC-C, 12V46F)", type: "string" },
  engine_power: { description: "Main engine power output in kW — numeric only", type: "number" },
  propulsion_type: { description: "Propulsion type: Single Screw, Twin Screw, Azimuth, Diesel-Electric, etc.", type: "string" },
  max_speed: { description: "Maximum speed in knots — numeric only", type: "number" },
  service_speed: { description: "Service / cruising speed in knots — numeric only", type: "number" },
  fuel_consumption: { description: "Daily fuel consumption in metric tonnes/day — numeric only", type: "number" },
  fuel_type: { description: "Primary fuel type: HFO, VLSFO, MGO, MDO, LNG, Methanol, etc.", type: "string" },

  // Safety & Capacity
  lifeboats: { description: "Number of lifeboats — numeric only", type: "number" },
  liferafts: { description: "Number of life rafts — numeric only", type: "number" },
  crew_capacity: { description: "Maximum crew capacity — numeric only", type: "number" },
  passenger_capacity: { description: "Passenger capacity — numeric only, 0 if cargo-only vessel", type: "number" },

  // Operations
  trading_area: { description: "Trading area: Worldwide / Unrestricted, Coastal, Short Sea, Inland, etc.", type: "string" },
  navigation_equipment: { description: "Navigation equipment summary (ECDIS, Radar, GPS, AIS details)", type: "string" },
  accommodations_pax: { description: "Accommodation / cabin details", type: "string" },
  painting_details: { description: "Painting / coating system details", type: "string" },

  // Financial
  purchase_price: { description: "Purchase price — numeric value only", type: "number" },
  insurance_value: { description: "Insurance value — numeric value only", type: "number" },
  currency: { description: "Currency code: USD, EUR, GBP, SGD, NOK, JPY", type: "string" },
} as const;

// Build tool-calling schema from field definitions
function buildToolSchema() {
  const properties: Record<string, any> = {};
  for (const [key, meta] of Object.entries(VESSEL_FIELDS)) {
    properties[key] = {
      type: meta.type === "number" ? "number" : "string",
      description: meta.description,
    };
    // Allow null for optional fields
    if (meta.type === "number") {
      properties[key] = { oneOf: [{ type: "number" }, { type: "null" }], description: meta.description };
    } else {
      properties[key] = { oneOf: [{ type: "string" }, { type: "null" }], description: meta.description };
    }
  }
  return {
    type: "object",
    properties,
    required: Object.keys(VESSEL_FIELDS),
    additionalProperties: false,
  };
}

// ---------------------------------------------------------------------------
// Intelligent post-processing: inference, cross-validation, normalization
// ---------------------------------------------------------------------------
function smartPostProcess(data: Record<string, any>): { cleaned: Record<string, any>; inferred: string[] } {
  const cleaned: Record<string, any> = {};
  const inferred: string[] = [];

  for (const [key, meta] of Object.entries(VESSEL_FIELDS)) {
    let value = data[key];
    if (value === null || value === undefined) continue;

    if (meta.type === "number") {
      if (typeof value === "string") {
        value = value.replace(/,/g, '').replace(/\s*(GT|DWT|NT|kW|HP|BHP|m|meters|metres|knots|kn|kt|tons|tonnes|t\/d|t\/day|cbm|cu\.?m|sq\.?m|USD|EUR|GBP|SGD|MW)\.?\s*/gi, '').trim();
        const parsed = parseFloat(value);
        value = isNaN(parsed) ? null : parsed;
      }
      if (typeof value === "number") cleaned[key] = value;
    } else {
      const str = String(value).trim();
      if (str && str.toLowerCase() !== "n/a" && str !== "-" && str.toLowerCase() !== "null" && str.toLowerCase() !== "unknown") {
        cleaned[key] = str;
      }
    }
  }

  // --- IMO normalization ---
  if (cleaned.imo_number) {
    const imoMatch = String(cleaned.imo_number).match(/(\d{7})/);
    cleaned.imo_number = imoMatch ? imoMatch[1] : null;
    if (!cleaned.imo_number) delete cleaned.imo_number;
  }

  // --- MMSI normalization ---
  if (cleaned.mmsi_number) {
    const mmsiMatch = String(cleaned.mmsi_number).match(/(\d{9})/);
    cleaned.mmsi_number = mmsiMatch ? mmsiMatch[1] : null;
    if (!cleaned.mmsi_number) delete cleaned.mmsi_number;
  }

  // --- Intelligent inference: engine power HP→kW ---
  if (cleaned.engine_power && data._raw_engine_power_unit) {
    const unit = String(data._raw_engine_power_unit).toUpperCase();
    if (unit.includes('HP') || unit.includes('BHP')) {
      cleaned.engine_power = Math.round(cleaned.engine_power * 0.7457);
      inferred.push("Converted engine power from HP to kW");
    }
  }

  // --- Infer vessel status ---
  if (!cleaned.status) {
    if (cleaned.year_built && cleaned.year_built > new Date().getFullYear()) {
      cleaned.status = "under-construction";
      inferred.push("Inferred status as under-construction from future build year");
    } else {
      cleaned.status = "active";
    }
  }

  // --- Infer hull material ---
  if (!cleaned.hull_material && cleaned.gross_tonnage && cleaned.gross_tonnage > 500) {
    cleaned.hull_material = "Steel";
    inferred.push("Inferred hull material as Steel for vessel >500 GT");
  }

  // --- Cross-validate GT vs DWT ---
  if (cleaned.gross_tonnage && cleaned.deadweight) {
    const ratio = cleaned.deadweight / cleaned.gross_tonnage;
    if (ratio < 0.3 || ratio > 3.5) {
      inferred.push(`Warning: GT/DWT ratio (${ratio.toFixed(2)}) is unusual — please verify`);
    }
  }

  // --- Cross-validate dimensions ---
  if (cleaned.length_overall && cleaned.beam) {
    const lbRatio = cleaned.length_overall / cleaned.beam;
    if (lbRatio < 3 || lbRatio > 12) {
      inferred.push(`Warning: L/B ratio (${lbRatio.toFixed(1)}) is unusual — please verify`);
    }
  }

  // --- Normalize classification society abbreviations ---
  if (cleaned.classification_society) {
    const cs = cleaned.classification_society.toUpperCase();
    const csMap: Record<string, string> = {
      "DNV GL": "DNV", "DET NORSKE VERITAS": "DNV", "DNVGL": "DNV",
      "LLOYD'S": "Lloyd's Register", "LLOYDS": "Lloyd's Register", "LR": "Lloyd's Register",
      "BUREAU VERITAS": "Bureau Veritas", "BV": "Bureau Veritas",
      "AMERICAN BUREAU": "ABS", "AMERICAN BUREAU OF SHIPPING": "ABS",
      "NIPPON KAIJI KYOKAI": "ClassNK", "NK": "ClassNK", "NKK": "ClassNK",
      "REGISTRO ITALIANO": "RINA",
      "CHINA CLASSIFICATION": "CCS", "CHINA CLASSIFICATION SOCIETY": "CCS",
      "KOREAN REGISTER": "KR",
      "INDIAN REGISTER": "IRS",
    };
    for (const [pattern, normalized] of Object.entries(csMap)) {
      if (cs.includes(pattern)) {
        cleaned.classification_society = normalized;
        break;
      }
    }
  }

  // --- Normalize flag state names ---
  if (cleaned.flag_state) {
    const flagNorm: Record<string, string> = {
      "REPUBLIC OF PANAMA": "Panama", "REPUBLIC OF LIBERIA": "Liberia",
      "REPUBLIC OF MARSHALL ISLANDS": "Marshall Islands", "REPUBLIC OF THE MARSHALL ISLANDS": "Marshall Islands",
      "RMI": "Marshall Islands", "HONG KONG, CHINA": "Hong Kong",
      "HONG KONG SAR": "Hong Kong", "REPUBLIC OF SINGAPORE": "Singapore",
      "COMMONWEALTH OF THE BAHAMAS": "Bahamas", "ISLE OF MAN": "Isle of Man",
      "KINGDOM OF NORWAY": "Norway", "NIS": "Norway (NIS)",
    };
    const upper = cleaned.flag_state.toUpperCase();
    for (const [pattern, normalized] of Object.entries(flagNorm)) {
      if (upper.includes(pattern)) {
        cleaned.flag_state = normalized;
        break;
      }
    }
  }

  // --- Infer trading area for large vessels ---
  if (!cleaned.trading_area && cleaned.gross_tonnage && cleaned.gross_tonnage > 3000) {
    cleaned.trading_area = "Worldwide / Unrestricted";
    inferred.push("Inferred worldwide trading area for vessel >3000 GT");
  }

  // Remove null values
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === null || cleaned[key] === undefined) delete cleaned[key];
  }

  return { cleaned, inferred };
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
        JSON.stringify({ success: false, error: "AI service not configured." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }

    const body = await req.json().catch(() => ({}));
    const { fileUrl, contentType, org_id, storageBucket, storagePath } = body;

    if (!org_id) {
      return new Response(JSON.stringify({ error: "Missing organization context (org_id)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    if (!fileUrl && !storagePath) {
      return new Response(JSON.stringify({ error: "Missing fileUrl or storagePath" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }

    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('org_id', org_id)
      .maybeSingle();

    if (memberError || !member) {
      return new Response(JSON.stringify({ error: "Organization access denied" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403,
      });
    }

    console.log(`Smart extraction for ${user.email} in org ${org_id}`);

    // -----------------------------------------------------------------------
    // Download document
    // -----------------------------------------------------------------------
    let buffer: ArrayBuffer;
    let mimeType = contentType || "application/pdf";

    if (storageBucket && storagePath) {
      console.log(`Storage download: ${storageBucket}/${storagePath}`);
      const { data: fileData, error: dlErr } = await supabase.storage.from(storageBucket).download(storagePath);
      if (dlErr || !fileData) throw new Error(`Could not fetch document from storage: ${dlErr?.message || 'Unknown'}`);
      buffer = await fileData.arrayBuffer();
      mimeType = contentType || fileData.type || "application/pdf";
    } else {
      const storageMatch = fileUrl.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?.*)?$/);
      if (storageMatch) {
        const bucket = storageMatch[1];
        const path = decodeURIComponent(storageMatch[2]);
        console.log(`Storage download (parsed URL): ${bucket}/${path}`);
        const { data: fileData, error: dlErr } = await supabase.storage.from(bucket).download(path);
        if (dlErr || !fileData) throw new Error(`Could not fetch document from storage: ${dlErr?.message || 'Unknown'}`);
        buffer = await fileData.arrayBuffer();
        mimeType = contentType || fileData.type || "application/pdf";
      } else {
        console.log(`External URL fetch: ${fileUrl}`);
        const resp = await fetch(fileUrl);
        if (!resp.ok) throw new Error(`Could not fetch document: ${resp.statusText}`);
        const blob = await resp.blob();
        buffer = await blob.arrayBuffer();
        mimeType = contentType || blob.type || "application/pdf";
      }
    }

    // Convert to base64
    const uint8 = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < uint8.byteLength; i++) binary += String.fromCharCode(uint8[i]);
    const base64Data = btoa(binary);

    // -----------------------------------------------------------------------
    // AI call with tool-calling for structured extraction
    // -----------------------------------------------------------------------
    const systemPrompt = `You are an elite Maritime Document Intelligence specialist. You extract vessel technical specifications from ANY maritime document — brochures, data sheets, certificates, classification reports, builder specification sheets, photos of nameplates, and specification tables.

EXPERTISE:
- You understand maritime abbreviations: LOA, LBP, B/Bm, D/Dm, T/Td, DWT, GT, NT, MCR, NCR, CSR, EEDI, EEXI, CII
- You can read tabular data, annotations, watermarks, headers, footers, sidebars
- You recognize vessel classification notation (e.g., ✠1A1, +100A1, NS*, etc.)
- You understand engine designations (MAN B&W 6S60MC-C → make="MAN B&W", model="6S60MC-C")
- You can infer vessel type from cargo holds, tank descriptions, or general arrangement drawings

EXTRACTION STRATEGY:
1. First scan the entire document for the vessel name and IMO number
2. Look for specification tables — they contain most technical data
3. Check document headers, footers, and margins for additional data
4. Look at general arrangement drawings for dimensions
5. Check machinery sections for engine and propulsion data
6. Examine safety equipment sections for lifeboats and life rafts
7. If a value appears in multiple places with different precision, use the most precise one
8. For numeric fields, return ONLY the numeric value — strip all units
9. If you see "approx." or "~", still return the number
10. For dates, normalize to YYYY-MM-DD format when possible

IMPORTANT: Call the extract_vessel_data function with ALL the data you can find. Set null for any field you cannot find or are uncertain about.`;

    const toolSchema = buildToolSchema();

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
              { type: "text", text: "Extract ALL vessel technical specifications from this document. Be thorough — examine every section, table, annotation, and drawing. Use the extract_vessel_data tool to return your findings." }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_vessel_data",
            description: "Submit extracted vessel technical specifications from the maritime document",
            parameters: toolSchema,
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_vessel_data" } },
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

    // Extract from tool call response
    let rawData: Record<string, any> = {};
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        rawData = typeof toolCall.function.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
      } catch (e) {
        console.error("Failed to parse tool call arguments:", e);
      }
    }

    // Fallback: try parsing from content if tool call not present
    if (Object.keys(rawData).length === 0) {
      const content = aiResult.choices?.[0]?.message?.content || "";
      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) rawData = JSON.parse(match[0]);
      } catch (e) {
        console.error("Fallback JSON parse failed:", e);
        throw new Error("Could not extract vessel specifications from document");
      }
    }

    // -----------------------------------------------------------------------
    // Smart post-processing
    // -----------------------------------------------------------------------
    const { cleaned, inferred } = smartPostProcess(rawData);
    const fieldsExtracted = Object.keys(cleaned).length;

    console.log(`Smart extraction complete: ${fieldsExtracted} fields, ${inferred.length} inferences`);
    if (inferred.length > 0) console.log("Inferences:", inferred.join("; "));

    return new Response(
      JSON.stringify({
        success: true,
        data: cleaned,
        fields_extracted: fieldsExtracted,
        inferences: inferred,
      }),
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

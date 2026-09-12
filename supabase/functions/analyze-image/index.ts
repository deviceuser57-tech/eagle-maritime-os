import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VESSEL_FIELDS = {
  name: { type: "string", description: "Vessel name" },
  imo_number: { type: "string", description: "IMO number, exactly 7 digits" },
  call_sign: { type: "string", description: "Radio call sign" },
  mmsi_number: { type: "string", description: "MMSI number, exactly 9 digits" },
  official_number: { type: "string", description: "Official or registry number" },
  vessel_type: { type: "string", description: "Vessel type" },
  flag_state: { type: "string", description: "Flag state / country of registry" },
  port_of_registry: { type: "string", description: "Port of registry" },
  classification_society: { type: "string", description: "Classification society" },
  class_number: { type: "string", description: "Class notation / class number" },
  status: { type: "string", description: "Documented vessel status; do not invent" },
  gross_tonnage: { type: "number", description: "Gross tonnage (GT), numeric only" },
  net_tonnage: { type: "number", description: "Net tonnage (NT), numeric only" },
  deadweight: { type: "number", description: "Deadweight (DWT), numeric only" },
  length_overall: { type: "number", description: "Length overall (LOA), metres" },
  beam: { type: "number", description: "Beam / breadth, metres" },
  depth: { type: "number", description: "Moulded depth, metres" },
  draft: { type: "number", description: "Draft / draught, metres" },
  cargo_capacity: { type: "number", description: "Cargo capacity; retain unit in unmapped specs" },
  year_built: { type: "number", description: "Construction year" },
  hull_material: { type: "string", description: "Hull material" },
  hull_coating: { type: "string", description: "Hull coating / antifouling" },
  keel_laid_date: { type: "string", description: "Keel laid date, preferably YYYY-MM-DD" },
  delivery_date: { type: "string", description: "Delivery date, preferably YYYY-MM-DD" },
  engine_make: { type: "string", description: "Main engine manufacturer" },
  engine_model: { type: "string", description: "Main engine model" },
  engine_power: { type: "number", description: "Main engine power in kW; retain original unit/value in unmapped specs if conversion is needed" },
  propulsion_type: { type: "string", description: "Propulsion type" },
  max_speed: { type: "number", description: "Maximum speed in knots" },
  service_speed: { type: "number", description: "Service speed in knots" },
  fuel_consumption: { type: "number", description: "Daily fuel consumption; retain unit in unmapped specs" },
  fuel_type: { type: "string", description: "Primary fuel type" },
  lifeboats: { type: "number", description: "Number of lifeboats" },
  liferafts: { type: "number", description: "Number of life rafts" },
  crew_capacity: { type: "number", description: "Crew capacity" },
  passenger_capacity: { type: "number", description: "Passenger capacity" },
  trading_area: { type: "string", description: "Trading area" },
  navigation_equipment: { type: "string", description: "Navigation and GMDSS equipment summary" },
  accommodations_pax: { type: "string", description: "Accommodation / cabin information" },
  painting_details: { type: "string", description: "Painting/coating information" },
  purchase_price: { type: "number", description: "Purchase price" },
  insurance_value: { type: "number", description: "Insurance value" },
  currency: { type: "string", description: "Currency code" },
  notes: { type: "string", description: "General document notes and observations that do not belong in another structured field" },
  additional_unmapped_specifications: { type: "string", description: "MUST contain every useful specification that has no dedicated field. Preserve original value, unit, terminology and document section/source when possible. Do not discard anchors, chains, winches, deck dimensions/strength, tank capacities, generators, thrusters, cranes, pumps, FiFi, fire-fighting systems, class notation details, accommodation details, electrical data, capacities, or other technical data." },
} as const;

function buildToolSchema() {
  const properties: Record<string, any> = {};
  for (const [key, meta] of Object.entries(VESSEL_FIELDS)) {
    properties[key] = {
      oneOf: [{ type: meta.type }, { type: "null" }],
      description: meta.description,
    };
  }
  return { type: "object", properties, required: Object.keys(VESSEL_FIELDS), additionalProperties: false };
}

function smartPostProcess(data: Record<string, any>) {
  const cleaned: Record<string, any> = {};
  const inferred: string[] = [];
  for (const [key, meta] of Object.entries(VESSEL_FIELDS)) {
    let value = data[key];
    if (value === null || value === undefined) continue;
    if (meta.type === "number") {
      if (typeof value === "string") {
        const parsed = parseFloat(value.replace(/,/g, "").replace(/\s*(GT|DWT|NT|kW|HP|BHP|m|meters|metres|knots|kn|kt|tons|tonnes|t\/d|t\/day|cbm|cu\.?m|MW)\.?\s*/gi, "").trim());
        value = Number.isFinite(parsed) ? parsed : null;
      }
      if (typeof value === "number" && Number.isFinite(value)) cleaned[key] = value;
    } else {
      const text = String(value).trim();
      if (text && !/^(n\/a|null|unknown|-)$/.test(text.toLowerCase())) cleaned[key] = text;
    }
  }
  if (cleaned.imo_number) cleaned.imo_number = String(cleaned.imo_number).match(/\d{7}/)?.[0];
  if (cleaned.mmsi_number) cleaned.mmsi_number = String(cleaned.mmsi_number).match(/\d{9}/)?.[0];
  if (cleaned.classification_society) {
    const cs = String(cleaned.classification_society).toUpperCase();
    const map: Record<string, string> = { "DNV GL": "DNV", "DET NORSKE VERITAS": "DNV", DNVGL: "DNV", "LLOYD'S": "Lloyd's Register", LLOYDS: "Lloyd's Register", LR: "Lloyd's Register", "BUREAU VERITAS": "Bureau Veritas", BV: "Bureau Veritas", "AMERICAN BUREAU OF SHIPPING": "ABS", "NIPPON KAIJI KYOKAI": "ClassNK", NK: "ClassNK", NKK: "ClassNK", "REGISTRO ITALIANO": "RINA", "CHINA CLASSIFICATION SOCIETY": "CCS", "KOREAN REGISTER": "KR", "INDIAN REGISTER": "IRS" };
    for (const [pattern, normalized] of Object.entries(map)) if (cs.includes(pattern)) { cleaned.classification_society = normalized; break; }
  }
  if (!cleaned.hull_material && cleaned.gross_tonnage && cleaned.gross_tonnage > 500) { cleaned.hull_material = "Steel"; inferred.push("Hull material inferred as Steel for vessel >500 GT"); }
  if (cleaned.gross_tonnage && cleaned.deadweight) {
    const ratio = cleaned.deadweight / cleaned.gross_tonnage;
    if (ratio < 0.3 || ratio > 3.5) inferred.push(`Warning: GT/DWT ratio (${ratio.toFixed(2)}) is unusual — verify source document`);
  }
  return { cleaned, inferred };
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array) {
  const typeBytes = new TextEncoder().encode(type);
  const out = new Uint8Array(12 + data.length);
  new DataView(out.buffer).setUint32(0, data.length);
  out.set(typeBytes, 4);
  out.set(data, 8);
  const crcInput = new Uint8Array(typeBytes.length + data.length);
  crcInput.set(typeBytes); crcInput.set(data, typeBytes.length);
  new DataView(out.buffer).setUint32(8 + data.length, crc32(crcInput));
  return out;
}

async function rawImageToPng(data: Uint8ClampedArray, width: number, height: number, channels: 1 | 3 | 4) {
  const colorType = channels === 1 ? 0 : channels === 3 ? 2 : 6;
  const stride = width * channels;
  const scanlines = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    scanlines[y * (stride + 1)] = 0;
    scanlines.set(data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  const compressed = new Uint8Array(await new Response(new Blob([scanlines]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer());
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width); view.setUint32(4, height); ihdr[8] = 8; ihdr[9] = colorType;
  const signature = new Uint8Array([137,80,78,71,13,10,26,10]);
  const chunks = [pngChunk("IHDR", ihdr), pngChunk("IDAT", compressed), pngChunk("IEND", new Uint8Array())];
  const total = signature.length + chunks.reduce((n, c) => n + c.length, 0);
  const png = new Uint8Array(total); png.set(signature); let offset = signature.length;
  for (const chunk of chunks) { png.set(chunk, offset); offset += chunk.length; }
  return png;
}

async function extractPdfImages(pdf: any, supabase: any, bucket: string, orgId: string, sourcePath: string) {
  const extracted: Array<{ url: string; page: number; width: number; height: number; source: string }> = [];
  const maxImages = 24;
  const maxPixels = 16_777_216;
  const safeName = sourcePath.split("/").pop()?.replace(/[^a-zA-Z0-9._-]/g, "_") || "document";
  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 60) && extracted.length < maxImages; pageNumber++) {
    try {
      const { extractImages } = await import("npm:unpdf");
      const images = await extractImages(pdf, pageNumber);
      for (const image of images) {
        if (extracted.length >= maxImages || image.width * image.height > maxPixels) continue;
        if (![1, 3, 4].includes(image.channels)) continue;
        const png = await rawImageToPng(image.data, image.width, image.height, image.channels);
        const path = `${orgId}/pdf-extracted/${Date.now()}_${safeName}/page-${pageNumber}-${extracted.length + 1}.png`;
        const { error } = await supabase.storage.from(bucket).upload(path, png, { contentType: "image/png", upsert: false });
        if (error) { console.error("PDF image upload failed", error); continue; }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        extracted.push({ url: data.publicUrl, page: pageNumber, width: image.width, height: image.height, source: `PDF page ${pageNumber}` });
      }
    } catch (error) { console.error(`PDF image extraction failed on page ${pageNumber}`, error); }
  }
  return extracted;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!supabaseUrl || !supabaseKey) throw new Error("Missing backend configuration");
    if (!lovableApiKey) return new Response(JSON.stringify({ success: false, error: "AI service not configured." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const body = await req.json().catch(() => ({}));
    const { fileUrl, contentType, org_id, storageBucket, storagePath } = body;
    if (!org_id || (!storagePath && !fileUrl)) return new Response(JSON.stringify({ error: "Missing organization context or storage file" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: member, error: memberError } = await supabase.from("organization_members").select("id").eq("user_id", user.id).eq("org_id", org_id).maybeSingle();
    if (memberError || !member) return new Response(JSON.stringify({ error: "Organization access denied" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const expectedPrefix = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/`;
    let bucket = storageBucket as string | undefined;
    let path = storagePath as string | undefined;
    if (!bucket || !path) {
      if (typeof fileUrl !== "string" || !fileUrl.startsWith(expectedPrefix)) throw new Error("Only files uploaded to project storage can be analyzed");
      const match = fileUrl.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?.*)?$/);
      if (!match) throw new Error("Invalid storage URL");
      bucket = match[1]; path = decodeURIComponent(match[2]);
    }
    if (!new Set(["vessel-assets", "regulations", "crew-photos"]).has(bucket)) throw new Error("Bucket not allowed");
    const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(path);
    if (downloadError || !fileData) throw new Error(`Could not fetch document: ${downloadError?.message || "Unknown"}`);
    const buffer = await fileData.arrayBuffer();
    if (buffer.byteLength > 20 * 1024 * 1024) return new Response(JSON.stringify({ error: "Document exceeds 20MB size limit" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const mimeType = contentType || fileData.type || "application/pdf";

    let pdfText = "";
    let extractedMedia: Array<{ url: string; page: number; width: number; height: number; source: string }> = [];
    if (mimeType.includes("pdf") || mimeType === "application/pdf") {
      try {
        const { getDocumentProxy, extractText } = await import("npm:unpdf");
        const pdf = await getDocumentProxy(new Uint8Array(buffer), { maxImageSize: 16_777_216 });
        const { totalPages, text } = await extractText(pdf, { mergePages: true });
        pdfText = text || "";
        extractedMedia = await extractPdfImages(pdf, supabase, bucket, org_id, path);
        console.log(`PDF processed: ${totalPages} pages, ${pdfText.length} text chars, ${extractedMedia.length} embedded images`);
      } catch (pdfError) { console.error("PDF processing failed; continuing with vision", pdfError); }
    }

    const uint8 = new Uint8Array(buffer);
    let binary = ""; for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
    const base64Data = btoa(binary);
    const systemPrompt = `You are an elite maritime document intelligence specialist. Extract every vessel specification available in the document. Never invent missing values. Use the dedicated structured fields when a value has a clear match. Everything else MUST be preserved in additional_unmapped_specifications with the original value and unit and, when possible, the document section/source. Include all technical details such as deck data, capacities, tank capacities, anchors, chains, winches, cranes, thrusters, generators, pumps, fire-fighting/FiFi, electrical systems, accommodation details, class notation, dimensions, machinery, navigation/GMDSS and other specification-table values. notes is for general observations; additional_unmapped_specifications is the lossless catch-all. If a numeric value is converted to a normalized unit, preserve the original value/unit in additional_unmapped_specifications. Do not use assumptions to fill fields.`;
    const userText = `Extract ALL vessel technical specifications from this document and call extract_vessel_data. Review every page, table, drawing annotation, header, footer and specification section. ${pdfText ? `Raw PDF text is included below for exact matching:\n---\n${pdfText}\n---` : ""}`;
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-pro", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: [{ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }, { type: "text", text: userText }] }], tools: [{ type: "function", function: { name: "extract_vessel_data", description: "Return complete vessel specifications", parameters: buildToolSchema() } }], tool_choice: { type: "function", function: { name: "extract_vessel_data" } } }),
    });
    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ success: false, error: "AI rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ success: false, error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      console.error("AI Gateway error", aiResponse.status, await aiResponse.text()); throw new Error("AI analysis failed");
    }
    const aiResult = await aiResponse.json();
    let rawData: Record<string, any> = {};
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) rawData = typeof toolCall.function.arguments === "string" ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;
    if (!Object.keys(rawData).length) {
      const content = aiResult.choices?.[0]?.message?.content || "";
      const match = content.match(/\{[\s\S]*\}/); if (match) rawData = JSON.parse(match[0]);
    }
    const { cleaned, inferred } = smartPostProcess(rawData);
    if (extractedMedia.length) cleaned.notes = [cleaned.notes, `Embedded PDF images extracted to Vessel Media: ${extractedMedia.length} image(s).`].filter(Boolean).join("\n");
    return new Response(JSON.stringify({ success: true, data: cleaned, fields_extracted: Object.keys(cleaned).length, inferences: inferred, extracted_media: extractedMedia }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error(`Edge Function Error: ${error.message}`);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

import http from "node:http";

const PORT = Number(process.env.PORT || 8787);
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "qwen/qwen3.6-27b";

function readBody(req, limit = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Request too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(new Error("Invalid JSON request body")); }
    });
    req.on("error", reject);
  });
}

function send(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

function normalizeMeshId(id) {
  const value = String(id || "").trim();
  if (!value) return "";
  const match = value.match(/^(.*?)(\d+)$/);
  if (!match) return value;
  const prefix = match[1];
  const number = Number(match[2]);
  return prefix.toLowerCase() === "upload-mesh-"
    ? `upload-mesh-${String(number).padStart(3, "0")}`
    : value;
}

function numberArray(value) {
  if (Array.isArray(value)) return value.slice(0, 3).map((n) => Number(Number(n || 0).toFixed(2)));
  if (value && typeof value === "object") return ["x", "y", "z"].map((k) => Number(Number(value[k] || 0).toFixed(2)));
  return [0, 0, 0];
}

function createCompactMeshes(meshes) {
  return meshes.map((mesh, index) => {
    const c = numberArray(mesh?.center);
    const d = numberArray(mesh?.dimensions ?? mesh?.size);
    return {
      id: normalizeMeshId(mesh?.meshId ?? mesh?.id ?? mesh?.uuid ?? `upload-mesh-${String(index + 1).padStart(3, "0")}`),
      c,
      d,
      v: Number(Math.max(0, d[0]) * Math.max(0, d[1]) * Math.max(0, d[2])).toFixed(3)
    };
  });
}

// Keep the AI request comfortably below the 8k TPM budget while retaining the largest,
// most useful pieces of the model. The complete mesh list is still used after analysis.
function selectAnalysisMeshes(meshes, limit = 56) {
  if (meshes.length <= limit) return meshes;
  return [...meshes]
    .sort((a, b) => Number(b.v) - Number(a.v))
    .slice(0, limit)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function buildPrompt(meshes, fileName) {
  const validIds = meshes.map((mesh) => mesh.id);
  return `You are an expert product teardown engineer. Analyze the rendered uploaded 3D object and create an informative SEMANTIC component breakdown.

OBJECT FILE: ${fileName || "uploaded model"}

COMPONENT COUNT IS IMPORTANT: target 7-9 meaningful visible components for a complex product; never return fewer than 6 unless the uploaded object genuinely has fewer than 6 distinguishable physical parts. Split a product at meaningful visual/function boundaries (for example housing, outer shell, ring, barrel, mount, control module, screen, cap, guard, interface), but NEVER create a component merely to increase the count.

This is NOT a raw mesh listing. Group fragmented geometry into the nearest real part. Absorb screws, tiny trim and ambiguous fragments into a meaningful parent assembly.

STRICT RULES:
- Component names must be specific real-world names based on visible form/function.
- Never use placeholders or raw mesh names: Object_*, Mesh*, Part*, Component*, Spatial Assembly*, Detected Component*, Assembly 1, Unnamed, Geometry are forbidden.
- Every meshId must come from VALID_IDS and may belong to only one component.
- Do not invent hidden internals, brand-specific specifications or exact dimensions not visible in the model.
- If uncertain, use a useful descriptive name such as "Rear Control Cluster" or "Outer Lens Retaining Ring" rather than a vague label.
- Keep text concise but specific: one technically useful sentence/phrase per field.
- Return only valid JSON.

For EACH component provide useful information: location/appearance, function, engineering role, importance, likely material with reason, manufacturing process/tolerance, engineering trade-off, exactly 2 technical insights, exactly 2 inspection points, 1-2 interfaces, 1-2 design principles, and confidence.

VALID_IDS: ${JSON.stringify(validIds)}

Return exactly this JSON shape:
{"objectName":"string","objectCategory":"string","objectType":"string","objectSummary":"string","complexity":"Low|Moderate|High|Very High","primarySystems":["string"],"analysisNotes":["string"],"engineeringDisciplines":["string"],"components":[{"id":"component-1","name":"specific physical component","category":"string","meshIds":["existing id"],"description":"location and visible form","function":"specific function","engineeringRole":"Structural|Optical|Electrical|Thermal|Interface|User Interface|Protective|Support","importance":"Low|Medium|High|Critical","connectedTo":["component-2"],"material":{"name":"string","category":"Metal|Polymer|Ceramic|Composite|Semiconductor|Fluid|Elastomer|Glass","confidence":"Verified|Typical|Estimated|Model-dependent|Unknown"},"materialReason":"why likely","manufacturing":{"process":"string","tolerance":"Typical|High|Very High"},"manufacturingReason":"why plausible","engineeringReason":"main trade-off","classificationReason":"why grouped","insights":["specific observation","specific observation"],"inspectionPoints":["specific check","specific check"],"interfaces":["specific interface"],"designPrinciples":["relevant principle"],"confidence":"Verified|Typical|Estimated|Model-dependent|Unknown","confidenceReason":"evidence basis"}],"didYouKnow":["short engineering fact"],"suggestedQuestions":["useful question"]}

MESH DATA (id, c=center, d=dimensions; use only for grouping, never as display names):
${JSON.stringify(meshes.map(({ id, c, d }) => ({ id, c, d })))} `;
}
function extractJson(text) {
  if (!text || typeof text !== "string") throw new Error("Groq returned an empty response");
  const cleaned = text.trim().replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last <= first) throw new Error("Groq did not return JSON");
  try { return JSON.parse(cleaned.slice(first, last + 1)); }
  catch (error) {
    console.error("INVALID AI CONTENT:", text);
    throw new Error(`Groq returned invalid JSON: ${error.message}`);
  }
}

async function callGroq(prompt, images, maxCompletion = 2200) {
  const content = [{ type: "text", text: prompt }];
  if (Array.isArray(images) && typeof images[0] === "string" && images[0]) {
    content.push({ type: "image_url", image_url: { url: images[0] } });
  }
  console.log("Calling Groq...", { meshesInPrompt: (prompt.match(/upload-mesh-/g) || []).length, image: content.length > 1, maxCompletion });
  const requestBody = {
    model: GROQ_MODEL,
    reasoning_effort: "none",
    messages: [
      { role: "system", content: "You are a precise engineering model analysis service. Return only valid JSON. Never output reasoning or thinking tags. Follow the requested schema exactly." },
      { role: "user", content }
    ],
    response_format: { type: "json_object" },
    temperature: 0,
    max_completion_tokens: maxCompletion
  };
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify(requestBody)
  });
  console.log("Groq response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq error:", errorText);
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }
  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Groq response contained no analysis");
  console.log("Groq responded successfully");
  return extractJson(raw);
}

function list(value, max) {
  return Array.isArray(value) ? value.slice(0, max).map((item) => String(item).trim()).filter(Boolean) : [];
}
function confidence(value) { return new Set(["Verified","Typical","Estimated","Model-dependent","Unknown"]).has(String(value)) ? String(value) : "Estimated"; }
function importance(value) { return new Set(["Low","Medium","High","Critical"]).has(String(value)) ? String(value) : "Medium"; }
function materialType(value) { return new Set(["Metal","Polymer","Ceramic","Composite","Semiconductor","Fluid","Elastomer","Glass"]).has(String(value)) ? String(value) : "Composite"; }
function tolerance(value) { return new Set(["Typical","High","Very High"]).has(String(value)) ? String(value) : "Typical"; }
function engineeringRole(value) { return new Set(["Structural","Optical","Electrical","Thermal","Interface","User Interface","Protective","Support"]).has(String(value)) ? String(value) : "Support"; }
function badName(name) { return /^(object|mesh|part|component|unnamed|spatial assembly|detected component)([ _-]|\d|$)/i.test(String(name).trim()); }

function distanceSq(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

function attachRemainingMeshes(components, compactMeshes) {
  const byId = new Map(compactMeshes.map((mesh) => [mesh.id, mesh]));
  const used = new Set(components.flatMap((component) => component.meshIds));
  const centers = components.map((component) => {
    const points = component.meshIds.map((id) => byId.get(id)?.c).filter(Boolean);
    if (!points.length) return [0, 0, 0];
    return [0, 1, 2].map((axis) => points.reduce((sum, point) => sum + point[axis], 0) / points.length);
  });
  for (const mesh of compactMeshes) {
    if (used.has(mesh.id)) continue;
    let nearest = 0;
    let best = Infinity;
    centers.forEach((center, index) => {
      const score = distanceSq(mesh.c, center);
      if (score < best) { best = score; nearest = index; }
    });
    components[nearest].meshIds.push(mesh.id);
    used.add(mesh.id);
    const count = components[nearest].meshIds.length;
    centers[nearest] = centers[nearest].map((value, axis) => (value * (count - 1) + mesh.c[axis]) / count);
  }
}

function cleanAnalysis(result, compactMeshes) {
  if (!result || typeof result !== "object" || !Array.isArray(result.components)) throw new Error("AI response contains no components");
  const idMap = new Map(compactMeshes.map((mesh) => [normalizeMeshId(mesh.id), mesh.id]));
  const usedMeshIds = new Set();
  const components = result.components
    .slice(0, 10)
    .map((component, index) => {
      const meshIds = list(component?.meshIds, 100).map(normalizeMeshId).map((id) => idMap.get(id)).filter(Boolean).filter((id) => !usedMeshIds.has(id) && (usedMeshIds.add(id), true));
      return {
        id: String(component?.id || `component-${index + 1}`),
        name: String(component?.name || "").trim(),
        category: String(component?.category || "Engineering Assembly"), meshIds,
        description: String(component?.description || "Visible assembly identified from the uploaded 3D model."),
        function: String(component?.function || "Primary function inferred from visible geometry and object context."),
        engineeringRole: engineeringRole(component?.engineeringRole), importance: importance(component?.importance), connectedTo: list(component?.connectedTo, 8),
        material: { name: String(component?.material?.name || "Model-dependent material"), category: materialType(component?.material?.category), confidence: confidence(component?.material?.confidence) },
        materialReason: String(component?.materialReason || "Material estimate is based on visible geometry and typical engineering practice."),
        manufacturing: { process: String(component?.manufacturing?.process || "Model-dependent"), tolerance: tolerance(component?.manufacturing?.tolerance) },
        manufacturingReason: String(component?.manufacturingReason || "Process is estimated from visible geometry and likely production practice."),
        engineeringReason: String(component?.engineeringReason || "The design balances performance, stiffness, packaging and integration."),
        classificationReason: String(component?.classificationReason || "Meshes were grouped by visible continuity, proximity and shared function."),
        insights: list(component?.insights, 2), inspectionPoints: list(component?.inspectionPoints, 2), interfaces: list(component?.interfaces, 2), designPrinciples: list(component?.designPrinciples, 2),
        confidence: confidence(component?.confidence), confidenceReason: String(component?.confidenceReason || "Estimated from the rendered model and mesh geometry.")
      };
    })
    .filter((component) => component.meshIds.length > 0 && component.name && !badName(component.name));

  if (!components.length) throw new Error("No semantic AI components matched valid mesh IDs");

  // Critical: every raw mesh is absorbed into a real semantic assembly. This prevents the viewer
  // from creating Object_XX / Detected Component / Unmapped uploaded geometry callouts.
  attachRemainingMeshes(components, compactMeshes);

  const componentIds = new Set(components.map((component) => component.id));
  components.forEach((component) => { component.connectedTo = component.connectedTo.filter((id) => componentIds.has(id) && id !== component.id); });

  return {
    objectName: String(result.objectName || "Uploaded Object"), objectCategory: String(result.objectCategory || "General Object"), objectType: String(result.objectType || result.objectCategory || "Uploaded 3D Assembly"),
    objectSummary: String(result.objectSummary || "Engineering-oriented analysis generated from the uploaded 3D model."),
    complexity: ["Low","Moderate","High","Very High"].includes(String(result.complexity)) ? String(result.complexity) : "Moderate",
    primarySystems: list(result.primarySystems, 6), analysisNotes: list(result.analysisNotes, 5),
    engineeringDisciplines: list(result.engineeringDisciplines, 5).length ? list(result.engineeringDisciplines, 5) : ["Mechanical Engineering"],
    components, didYouKnow: list(result.didYouKnow, 3), suggestedQuestions: list(result.suggestedQuestions, 4)
  };
}

async function analyze(payload) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
  const images = Array.isArray(payload?.images) ? payload.images.slice(0, 1) : [];
  const meshes = Array.isArray(payload?.meshes) ? payload.meshes : [];
  if (!meshes.length) throw new Error("No mesh metadata received");

  const compactMeshes = createCompactMeshes(meshes);
  const analysisMeshes = selectAnalysisMeshes(compactMeshes, 42);
  console.log("Analysis request received", { images: images.length, meshes: compactMeshes.length, meshesSentToAI: analysisMeshes.length });

  let rawAnalysis;
  try {
    rawAnalysis = await callGroq(buildPrompt(analysisMeshes, payload?.fileName), images, 3000);
  } catch (error) {
    const message = String(error?.message || error);
    if (!/413|Request too large|rate_limit_exceeded/i.test(message)) throw error;
    const retryMeshes = selectAnalysisMeshes(compactMeshes, 30);
    console.warn("Groq request exceeded budget; retrying with fewer meshes and no image.");
    rawAnalysis = await callGroq(buildPrompt(retryMeshes, payload?.fileName), [], 2400);
  }

  const analysis = cleanAnalysis(rawAnalysis, compactMeshes);
  console.log("Components returned:", analysis.components.length, "All meshes mapped:", analysis.components.reduce((sum, component) => sum + component.meshIds.length, 0), "/", compactMeshes.length);
  return analysis;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" }); res.end(); return; }
  if (req.method === "GET" && req.url === "/") return send(res, 200, { status: "ok", provider: "groq", model: GROQ_MODEL });
  if (req.method === "POST" && ["/api/analyze-model","/api/analyze-upload","/api/analyze"].includes(req.url)) {
    try { return send(res, 200, await analyze(await readBody(req))); }
    catch (error) { console.error("ANALYSIS ERROR:", error); return send(res, 500, { error: error instanceof Error ? error.message : "Analysis failed" }); }
  }
  return send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Upload analysis server listening on http://localhost:${PORT}`);
  console.log("AI provider mode: groq");
  console.log("Groq configured:", Boolean(GROQ_API_KEY));
  console.log("Groq model:", GROQ_MODEL);
});

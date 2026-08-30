# OBJECT // BREAKDOWN

**Engineering made discoverable.**

An interactive 3D platform for exploring how physical products are built — component by component, material by material, decision by decision. Upload any GLB/GLTF model and get an AI-generated engineering breakdown; or explore a set of curated objects (mechanical watch, camera, drone, jet turbine, and more) with hand-structured data.

**[Live demo →](https://object-breakdown.vercel.app/)**

---

## What it does

Most 3D viewers show you geometry. OBJECT//BREAKDOWN tries to show you *engineering* — why a part exists, what it's likely made of, how it interfaces with its neighbors, and how it could fail.

- Explode and reassemble models interactively, at progressive levels of depth
- Inspect individual components with engineering-oriented panels (material, manufacturing process, failure modes, design reasoning)
- Switch between Solid, X-Ray, Wireframe, Stress, and Thermal visualization modes
- Upload your own model and get it analyzed automatically — no manual tagging required

## How the analysis works

Raw 3D assets are usually a mess of fragments: `Object_12`, `Mesh_4`, `Part_17`. None of that means anything to a human. The core problem this project solves is turning that fragment soup into components a person would actually recognize — *"Lens Mount Assembly,"* not *"Mesh_4."*

```
GLB / GLTF upload
      ↓
Mesh & geometry extraction (Three.js)
      ↓
Geometry compacted into token-efficient metadata
      ↓
Groq API → Qwen (qwen/qwen3.6-27b)
      ↓
Semantic grouping into real-world assemblies
      ↓
Mesh-ID validation (rejects ungrounded / placeholder components)
      ↓
Interactive 3D workspace
```

The API key never touches the frontend — uploads go through a server-side route (`/api/analyze-model`) that calls Groq, so the deployed app works without visitors needing their own key.

**Design constraint worth calling out:** the model is explicitly instructed to reject generic outputs (`Object_34`, `Spatial Assembly 4`, `Detected Component`) and to ground every claimed component in real mesh IDs from the uploaded file. Getting an LLM to say "I don't have enough evidence to name this part" instead of hallucinating a plausible-sounding one was the hardest part of this pipeline — not the 3D rendering.

## Engineering data per component

Each identified component can carry:

| Category | Examples |
|---|---|
| Physical | description, location, likely material + reasoning |
| Manufacturing | likely process, manufacturing considerations |
| Engineering | function, role, importance, design principles |
| Risk | failure modes, inspection points, interfaces with other components |
| Trust | confidence level + reasoning (`Verified` / `Typical` / `Estimated` / `Model-dependent` / `Unknown`) |

That last row matters: AI-generated engineering claims are treated as *exploratory*, not authoritative. Every claim is labeled with how much to trust it, and the README below spells out exactly what the system can't know (proprietary processes, exact tolerances, real-world failure statistics).

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Three.js, Tailwind CSS, Lucide React |
| Backend | Node.js, server-side API routes |
| AI | Groq API, Qwen (`qwen/qwen3.6-27b`) |
| Deployment | Vercel |

## Project structure

```
object-breakdown/
├── api/
│   └── analyze-model.mjs        # server-side Groq call
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── landing/
│   │   └── workspace/
│   ├── data/
│   │   ├── objects/              # curated preloaded objects
│   │   ├── uploadAnalysis.ts
│   │   └── objectRegistry.ts
│   ├── types/
│   │   └── objectData.ts
│   └── App.tsx
├── server.mjs
└── vercel.json
```

## Running locally

```bash
git clone https://github.com/anshbhatt944-debug/object-breakdown.git
cd object-breakdown
npm install
```

Create a `.env` in the project root (and make sure it's in `.gitignore`):

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.6-27b
PORT=8787
```

Then run the API server and frontend in two terminals:

```bash
npm run server   # http://localhost:8787
npm run dev      # Vite dev server
```

For production, add `GROQ_API_KEY` under Vercel → Project → Settings → Environment Variables.

## Production considerations

The deployed demo uses a shared API key so anyone can try the upload-analysis feature without signing up for anything. That comes with real limits:

- **8,000 tokens per request** and **200,000 tokens per day** on the shared key — large or high-mesh-count uploads may get truncated or rejected once the daily budget is hit
- The key is scoped and rate-limited at the account level, but there's currently no per-IP throttling in `/api/analyze-model` itself, so heavy or repeated use by a few visitors can exhaust the daily limit for everyone else
- If you want guaranteed, unmetered analysis (e.g. for testing many models back-to-back), run the project locally with your own `GROQ_API_KEY` — see [Running locally](#running-locally)

## Preloaded vs. uploaded objects

- **Preloaded objects** (watch, camera, drone, smartphone, pen, keyboard, car engine, electric motor, jet turbine) use hand-structured engineering data, so they're predictable, polished, and good for demoing the workspace itself.
- **Uploaded objects** are analyzed live through the Groq pipeline above — same workspace, dynamically generated data.

## Limitations

AI analysis is an interpretation of visual and geometric evidence, not verified engineering fact. It can't determine exact material grades, hidden internal components, proprietary manufacturing details, real tolerances, or production costs. For anything that actually matters, verify against manufacturer documentation, drawings, datasheets, or professional review — this tool is for exploration and learning, not sign-off.

## Roadmap

- More accurate mesh-to-component mapping on difficult/low-poly models
- Automatic bill-of-materials generation
- Component-level AI conversations (ask a part follow-up questions)
- Section views and CAD-style measurement tools
- Guided learning mode / quizzes built on top of the engineering data

---

*Built as an exploration of what happens when you combine interactive 3D, structured engineering data, and constrained AI reasoning — somewhere between a CAD viewer, a product teardown, and a learning tool.*

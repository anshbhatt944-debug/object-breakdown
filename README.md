# OBJECT//BREAKDOWN

> Engineering made discoverable.

OBJECT//BREAKDOWN is an interactive 3D engineering exploration platform built to help users understand how physical products are constructed, how their components interact, and why those components are designed the way they are.

The application combines **interactive 3D visualization, structured engineering data, and AI-powered analysis**.

**Live Demo:** https://object-breakdown.vercel.app/

## Features

### Interactive 3D Engineering Workspace

- Interactive Three.js 3D models
- Progressive exploded views
- Component selection and annotations
- Reassembly and explode controls
- Component inspection
- Engineering-focused information panels
- Solid, X-Ray, Wireframe, Stress, and Thermal visualization modes
- Multiple analysis depth levels

### Preloaded Engineering Objects

The project includes manually prepared objects with structured engineering data.

Examples include:

- Mechanical Watch
- Camera
- Drone
- Smartphone
- Ballpoint Pen
- Mechanical Keyboard
- Car Engine
- Electric Motor
- Jet Turbine

These objects use curated application data for their component breakdowns and engineering information.

## AI-Powered Uploaded Model Analysis

A core feature of OBJECT//BREAKDOWN is the ability to upload a user's own **GLB or GLTF** model and have it analyzed automatically.

The upload workflow is:

```text
GLB / GLTF Upload
        ↓
Three.js Model Loading
        ↓
Mesh & Geometry Extraction
        ↓
Compact Geometry Metadata
        ↓
Rendered Model Reference
        ↓
Groq API
        ↓
Qwen qwen3.6-27b
        ↓
Semantic Component Analysis
        ↓
Engineering Information
        ↓
Interactive 3D Workspace
```

The AI is not intended to simply list every mesh in a 3D file.

3D assets often contain fragmented geometry or implementation-level names such as:

```text
Object_12
Mesh_4
Part_17
Node_8
```

These do not necessarily correspond to meaningful physical components.

Instead, the analysis attempts to group related geometry into recognizable real-world assemblies.

For example, a camera may be interpreted as:

```text
Camera Body Chassis
Lens Assembly
Lens Mount
Focus Ring
Optical Viewfinder
Control Interface
Battery Assembly
```

The exact result depends on the geometry and visual evidence available in the uploaded asset.

## Groq AI Integration

Uploaded-model analysis is powered by the **Groq API** using:

```text
qwen/qwen3.6-27b
```

The API key is handled server-side.

The intended architecture is:

```text
Browser
   ↓
/api/analyze-model
   ↓
Server-side API
   ↓
GROQ_API_KEY
   ↓
Groq
```

This allows the deployed application to perform AI analysis without exposing the Groq API key to frontend code.

## Semantic Component Analysis

The AI analysis prioritizes meaningful physical components rather than raw mesh fragments.

The system is designed to:

- Identify the uploaded object
- Identify meaningful physical assemblies
- Group fragmented meshes
- Assign real mesh IDs
- Avoid generic placeholder component names
- Provide engineering-oriented information

Generic names such as the following are intentionally rejected:

```text
Object_34
Mesh_12
Part_7
Component_3
Spatial Assembly 4
Detected Component
Unnamed Geometry
Uploaded Geometry
```

The target is generally **6–8 meaningful components** for sufficiently complex models, while simpler objects may contain fewer.

## Engineering Information

Each semantic component can contain information including:

- Physical description and location
- Primary function
- Engineering role
- Importance
- Likely material
- Material reasoning
- Manufacturing process
- Manufacturing considerations
- Technical observations
- Engineering insights
- Inspection points
- Interfaces with other components
- Design principles
- Failure modes
- Confidence level
- Confidence reasoning

The goal is to provide useful engineering context rather than generic AI descriptions.

For example:

```text
Component:
Lens Mount Assembly

Function:
Provides the mechanical interface between the lens system and camera body.

Material:
Likely aluminum alloy or engineered polymer.

Manufacturing:
Likely precision machining or molding depending on construction.

Engineering reasoning:
Maintains mechanical alignment between the optical assembly and the camera body.

Inspection:
Check mounting surfaces, alignment and interface wear.

Failure mode:
Impact or excessive wear can introduce optical misalignment.
```

## Progressive Exploded Views

The application is designed around progressive discovery.

The intended interaction is:

```text
Assembled Object
      ↓
Slightly Exploded
      ↓
More Components Separate
      ↓
Internal Structure Becomes Visible
      ↓
Detailed Engineering Breakdown
```

Preloaded objects can begin slightly exploded to communicate that the model is interactive.

Uploaded models are analyzed dynamically from the uploaded asset.

## Component Relationships

Components can also store relationships with other components so the object can be understood as a system rather than a collection of isolated parts.

Example:

```text
Battery
   ↓
Power System
   ↓
Main Electronics
```

or:

```text
Lens Mount
   ↓
Camera Body
```

These relationships are used to provide additional engineering context.

## Analysis Depth

The workspace supports different levels of analysis:

| Level | Purpose |
|---|---|
| Quick | High-level understanding |
| Detailed | Components, materials and mechanisms |
| Engineering | Manufacturing, materials and design reasoning |
| Expert | Deeper technical exploration |

## Visualization Modes

The workspace provides several visualization modes:

### Solid
Normal solid-model visualization.

### X-Ray
Used to inspect internal structure through transparency.

### Wireframe
Used to inspect the underlying mesh structure.

### Stress
An engineering visualization mode for stress-oriented exploration.

### Thermal
An engineering visualization mode for thermal-oriented exploration.

These visualization modes are intended for exploration and presentation. They are not automatically equivalent to validated engineering simulations.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Three.js
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Server-side API routes

### AI

- Groq API
- Qwen `qwen/qwen3.6-27b`

### Deployment

- GitHub
- Vercel

## Project Structure

```text
object-breakdown/
│
├── api/
│   └── analyze-model.mjs
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── landing/
│   │   └── workspace/
│   │
│   ├── data/
│   │   ├── objects/
│   │   ├── uploadAnalysis.ts
│   │   ├── objectRegistry.ts
│   │   └── ...
│   │
│   ├── types/
│   │   └── objectData.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── server.mjs
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json
└── README.md
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/object-breakdown.git
cd object-breakdown
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the Groq API

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.6-27b
PORT=8787
```

Do not commit `.env` to GitHub.

Your `.gitignore` should include:

```gitignore
.env
```

### 4. Start the local server

```bash
npm run server
```

The local API server runs on:

```text
http://localhost:8787
```

### 5. Start the frontend

Open another terminal:

```bash
npm run dev
```

Vite will provide the local development URL.

## Vercel Deployment

The project supports deployment through Vercel.

For production deployment, add the Groq API key through:

```text
Vercel
→ Project
→ Settings
→ Environment Variables
```

Add:

```text
GROQ_API_KEY
```

and set its value to your Groq API key.

The deployed API endpoint is:

```text
/api/analyze-model
```

The API key should remain server-side and should never be included directly in frontend JavaScript.

This allows visitors to use the deployed application without entering their own Groq API key.

## API Flow

The frontend sends uploaded-model information to:

```text
POST /api/analyze-model
```

The request can include:

- Filename
- Mesh count
- Mesh IDs
- Mesh positions
- Mesh dimensions
- Triangle counts
- Material names
- Rendered model information when available

The backend then:

```text
Request
   ↓
Mesh processing
   ↓
Metadata reduction
   ↓
Groq analysis
   ↓
AI JSON response
   ↓
Validation
   ↓
Normalized component data
   ↓
Interactive workspace
```

## AI Token Efficiency

3D models can contain a large number of meshes.

Sending every raw mesh and a very large prompt directly to the AI can exceed API token limits.

The project therefore uses compact geometry metadata and controlled analysis output to balance:

- Geometry coverage
- Semantic accuracy
- Component count
- Engineering information
- API token usage

The analysis pipeline also validates returned mesh IDs and rejects meaningless components.

## Preloaded Objects vs Uploaded Objects

### Preloaded Objects

Preloaded objects use manually structured engineering data.

They are intended to provide predictable and polished demonstrations of the application's 3D and engineering capabilities.

### Uploaded Objects

Uploaded models are analyzed dynamically.

The system extracts the model's geometry and sends the relevant information to the AI analysis backend.

This allows the same workspace to support both curated objects and user-provided models.

## Engineering Philosophy

The core idea behind OBJECT//BREAKDOWN is:

> **A 3D model should teach you something.**

The intended experience is:

```text
Explore the model
       ↓
Separate its components
       ↓
Understand what each part does
       ↓
Understand material choices
       ↓
Understand how components interact
       ↓
Understand manufacturing considerations
       ↓
Explore failure modes
       ↓
Understand the engineering reasoning
```

The project is designed to sit somewhere between an interactive CAD viewer, a product teardown, and an engineering learning tool.

## Development Principles

### Preserve

- Existing preloaded object behavior
- Progressive exploded views
- Solid rendering
- Component annotations
- Interactive inspection
- Existing visualization modes
- Structured engineering data

### Improve

- Semantic component identification
- Engineering information quality
- Mesh-to-component mapping
- Material reasoning
- Manufacturing reasoning
- AI analysis reliability
- API efficiency

### Avoid

- Raw mesh names as user-facing components
- Arbitrary `Object_*` components
- `Spatial Assembly` placeholders
- Random mesh assignments
- Unsupported hidden components
- Exposing API keys
- Treating AI inference as verified engineering data

## AI Analysis Limitations

AI analysis is an engineering-oriented interpretation of available visual and geometric evidence.

It may not be able to determine:

- Exact material grades
- Hidden internal components
- Proprietary manufacturing processes
- Exact tolerances
- Exact production costs
- Manufacturer-specific design decisions
- Validated structural performance
- Real-world failure statistics

The application therefore uses confidence labels such as:

```text
Verified
Typical
Estimated
Model-dependent
Unknown
```

AI-generated information should be treated as educational and exploratory analysis rather than authoritative engineering documentation.

For real engineering decisions, verify important conclusions using appropriate drawings, manufacturer documentation, material datasheets, measurements, calculations, simulations, and professional review.

## Current Feature Set

- Interactive 3D product exploration
- Progressive exploded views
- Component annotations
- Component inspection
- Preloaded engineering objects
- GLB / GLTF upload
- Groq-powered AI analysis
- Semantic component grouping
- Engineering information generation
- Materials analysis
- Manufacturing analysis
- Failure-mode information
- Engineering reasoning
- Component relationships
- Multiple analysis depths
- Multiple visualization modes
- Light and dark themes
- Vercel deployment support

## Future Directions

Potential future improvements include:

- Better semantic grouping for difficult models
- More accurate mesh-to-component mapping
- Additional engineering reference data
- More preloaded objects
- Improved CAD measurement tools
- Better section views
- Manufacturing cost analysis
- Assembly instructions
- Engineering comparison tools
- Component-level AI conversations
- Automatic bill-of-materials generation
- More advanced failure and physics visualizations
- Educational quizzes and guided learning

## Disclaimer

OBJECT//BREAKDOWN is an educational and exploratory engineering project.

AI-generated analysis can contain assumptions or inaccuracies, especially when an uploaded model provides limited visual or geometric evidence.

The application should not be treated as a substitute for manufacturer documentation, engineering drawings, professional analysis, physical inspection, or validated simulation.

> **Engineering made discoverable.**

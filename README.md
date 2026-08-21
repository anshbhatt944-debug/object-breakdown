# OBJECT//BREAKDOWN

> **Explore what's inside. Understand how it works.**

An interactive 3D engineering platform that lets users explore the internal components, materials, mechanisms, and design principles behind everyday objects.

Instead of just showing an object from the outside, **OBJECT//BREAKDOWN** allows users to inspect it through interactive 3D models, exploded views, component annotations, and detailed engineering information.

**🔗 Live demo:** [object-breakdown.vercel.app](https://object-breakdown.vercel.app/)

---

## 🧠 About this project

I'm a 2nd-year CS student learning React, TypeScript, and 3D web development. This project was built with **heavy AI assistance** — I directed the architecture, feature set, UI design, and data structure through iterative prompting, and used AI tools to help generate and scaffold the React Three Fiber / Three.js implementation, which is well beyond what I could hand-write unaided at this stage.

I'm sharing it as a learning artifact and a product-design exercise, not as a claim of hand-written engineering depth. I'm still working through the codebase to understand and extend the 3D rendering logic myself — the parts I can currently explain and modify confidently are the UI/UX layer, the component data structure, and the depth-tier content system. I'm happy to walk through exactly what I built vs. what AI generated if asked.

---

## 🚀 Overview

OBJECT//BREAKDOWN is designed to make engineering and product design more visual and interactive.

Users can explore objects such as:

- 📱 Smartphone
- ⌚ Mechanical Watch
- 🖊️ Ballpoint Pen
- ⌨️ Keyboard Components

Each object can be explored through an interactive 3D environment where users can understand:

- What components an object contains
- How those components fit together
- What each component does
- Materials used in the design
- How mechanisms operate
- Manufacturing and engineering considerations

---

## ✨ Features

### Interactive 3D Models
Rotate, zoom, and inspect objects directly in the browser.

### Exploded Views
Separate components to reveal the internal structure and assembly of an object.

### Component Annotations
Interactive technical labels identify individual components and connect them to their corresponding parts.

### Detailed Component Information
Click on a component to explore information such as:

- Role and function
- How it works
- Materials
- Manufacturing
- Engineering principles
- Specifications
- Failure considerations

### Multiple Learning Depths

| Mode            | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| **Quick**       | A fast overview of the object and its major components         |
| **Detailed**    | Explore components, materials, and mechanisms                  |
| **Engineering** | Deeper analysis of materials, manufacturing, and performance   |
| **Expert**      | Advanced engineering concepts, analysis, and design trade-offs |

### Interactive Exploration
The application includes tools for:

- Exploding and reassembling objects
- Selecting components
- Isolating parts
- Focusing the camera
- Inspecting assemblies
- Exploring component hierarchies

### Light & Dark Mode
A complete light and dark interface designed for comfortable exploration in different environments.

---

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **Three.js**
- **React Three Fiber**
- **React Three Drei**
- **Tailwind CSS**
- **Lucide Icons**

---

## 📂 Project Structure

```
object-breakdown/
│
├── public/                 # Static assets and 3D models
├── src/
│   ├── components/         # UI and application components
│   ├── data/               # Object and component information
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── ...
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🎯 What I'm learning next

- Understanding the Three.js/React Three Fiber scene graph well enough to add a new object end-to-end myself
- Cleaning up raw/auto-generated mesh names (e.g. `Cylinder026_scratch_0`) into proper labeled components across all objects
- Writing my own exploded-view and camera-focus logic from scratch on a smaller scene, to build real understanding of what this project currently automates for me

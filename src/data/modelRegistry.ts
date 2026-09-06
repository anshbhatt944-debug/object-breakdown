import { ComponentNode } from '../types/objectData';

export interface ModelMeshMapping {
  componentId: string;
  displayName: string;
  category: string;
  explodeVector: [number, number, number];
  explodeStart?: number;
  explodeEnd?: number;
  color?: string;
  assemblyDepth?: number;
  revealThreshold?: number;
  /** Optional aliases for one logical component mapped to several render meshes. */
  sourceMeshNames?: string[];
}

export interface ModelAssetConfig {
  objectId: string;
  displayName: string;
  type: 'gltf' | 'gltf-composite' | 'procedural';
  modelPath?: string;
  subModels?: {
    id: string;
    modelPath: string;
    initialOffset: [number, number, number];
    initialScale: number;
    initialRotation?: [number, number, number];
  }[];
  targetMaxDimension?: number;
  initialRotation?: [number, number, number];
  initialOffset?: [number, number, number];
  defaultCameraDistance?: number;
  /** Optional peak time for a native explode animation before its authored reassembly segment. */
  nativeExplodePeakTime?: number;
  meshMappings?: Record<string, ModelMeshMapping>;
  // Fallback / procedural component nodes if GLB not loaded or for procedural models
  rootComponents?: ComponentNode[];
}

export const MODEL_ASSETS: Record<string, ModelAssetConfig> = {
  // ==========================================
  // 1. SMARTPHONE (Real iPhone 14 Pro GLB)
  // ==========================================
  'smartphone': {
    objectId: 'smartphone',
    displayName: 'Smartphone',
    type: 'gltf',
    modelPath: '/models/smartphone/iphone_14_pro.glb',
    targetMaxDimension: 4.8,
    initialRotation: [0, 0, 0],
    initialOffset: [0, 0, 0],
    defaultCameraDistance: 5.4,
    meshMappings: {
      'defaultMaterial': {
        componentId: 'iphone-frame',
        displayName: 'Smartphone Exterior / Structural Frame',
        category: 'Structural Enclosure',
        explodeVector: [0, 0, 0],
      },
    },
  },

  // ==========================================
  // 2. BALLPOINT PEN (Real Lamy Logo GLB)
  // ==========================================
  'ballpoint-pen': {
    objectId: 'ballpoint-pen',
    displayName: 'Ballpoint Pen (Lamy Logo)',
    type: 'gltf',
    modelPath: '/models/ballpoint-pen/lamy_logo.glb',
    targetMaxDimension: 5.6,
    initialRotation: [0, 0, Math.PI / 2],
    initialOffset: [0, 0, 0],
    defaultCameraDistance: 7.2,
    meshMappings: {
      'Object_5': {
        componentId: 'pen-clip-actuator',
        displayName: 'Spring-Steel Pocket Clip & Push Plunger',
        category: 'Attachment & Kinematics',
        explodeVector: [0, 3.6, 0],
        explodeStart: 0.02,
        explodeEnd: 0.55,
        color: '#94a3b8',
        assemblyDepth: 0,
        revealThreshold: 0.00,
      },
      'Object_4': {
        componentId: 'pen-barrel',
        displayName: 'Brushed Stainless Steel Outer Barrel',
        category: 'Structural Enclosure',
        explodeVector: [0, 2.4, 0],
        explodeStart: 0.16,
        explodeEnd: 0.72,
        color: '#cbd5e1',
        assemblyDepth: 0,
        revealThreshold: 0.00,
      },
      'Object_6': {
        componentId: 'pen-grip-tip',
        displayName: 'Ergonomic Ribbed Grip & Precision Writing Tip',
        category: 'Ergonomics & Fluidics',
        explodeVector: [0, -2.8, 0],
        explodeStart: 0.22,
        explodeEnd: 0.78,
        color: '#1e293b',
        assemblyDepth: 0,
        revealThreshold: 0.00,
      },
    },
  },

  // ==========================================
  // 3. KEYBOARD (Real Blank Keycap + Mechanical Switch GLB)
  // ==========================================
  'mechanical-keyboard': {
    objectId: 'mechanical-keyboard',
    displayName: 'Mechanical Switch & Sculpted Keycap',
    type: 'gltf-composite',
    targetMaxDimension: 4.2,
    initialRotation: [0, 0, 0],
    initialOffset: [0, 0, 0],
    defaultCameraDistance: 6.5,
    subModels: [
      {
        id: 'keycap',
        modelPath: '/models/keyboard/blankkeycap.glb',
        initialOffset: [0, 1.4, 0],
        initialScale: 0.16, // Normalize keycap to switch size
        initialRotation: [0, 0, 0],
      },
      {
        id: 'switch',
        modelPath: '/models/keyboard/mechanical_switch.glb',
        initialOffset: [0, -0.6, 0],
        initialScale: 4.8, // Normalize switch to keycap mount
        initialRotation: [0, 0, 0],
      },
    ],
    meshMappings: {
      'Object_2': {
        componentId: 'pbt-keycap',
        displayName: 'Sculpted OEM Profile Keycap',
        category: 'Ergonomics',
        explodeVector: [0, 3.6, 0],
        color: '#f43f5e',
      },
      'Top_Housing__0': {
        componentId: 'switch-top-housing',
        displayName: 'Polycarbonate Upper Switch Housing',
        category: 'Housing Enclosure',
        explodeVector: [0, 1.8, 0],
        color: '#38bdf8',
      },
      'Stem__0': {
        componentId: 'switch-stem',
        displayName: 'POM Self-Lubricating Cross Stem Slider',
        category: 'Kinematics',
        explodeVector: [0, 0.9, 0],
        color: '#ef4444',
      },
      'Bottom_Housing__0': {
        componentId: 'switch-bottom-housing',
        displayName: 'Nylon Base Housing & Terminal Pins',
        category: 'Structural Base',
        explodeVector: [0, -1.2, 0],
        color: '#1e293b',
      },
    },
  },

  // ==========================================
  // 4. MECHANICAL WRISTWATCH (Real Watch Mechanism GLB)
  // ==========================================
  'wristwatch': {
    objectId: 'wristwatch',
    displayName: 'Mechanical Watch Movement Calibre',
    type: 'gltf',
    modelPath: '/models/watch/mechanical_watch_mechanism.glb',
    targetMaxDimension: 4.8,
    initialRotation: [0, 0, 0],
    initialOffset: [0, 0, 0],
    defaultCameraDistance: 6.8,
    meshMappings: {
      // 1. Hands & Chapter Indicators (Forward in stepped layers, 0-20% teardown)
      'Circle_tiktok_0': { componentId: 'watch-hands', displayName: 'Sweep Seconds Hand & Counterweight', category: 'Indication', explodeVector: [0, 0, 1.90], assemblyDepth: 0, revealThreshold: 0.00, sourceMeshNames: ['Circle_tiktok_0', 'Circle.tiktok_0'] },
      'Circle001_tiktok_0': { componentId: 'watch-minute-hand', displayName: 'Faceted Minute Hand', category: 'Indication', explodeVector: [0, 0, 1.65], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Circle001_tiktok_0', 'Circle.001_tiktok_0'] },
      'Circle002_tiktok_0': { componentId: 'watch-hour-hand', displayName: 'Hour Hand & Dial Chapter', category: 'Indication', explodeVector: [0, 0, 1.40], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Circle002_tiktok_0', 'Circle.002_tiktok_0'] },
      'Cube003_tiktok_0': { componentId: 'watch-indices', displayName: 'Applied Luminescent Hour Markers', category: 'Indication', explodeVector: [0, 0, 1.15], assemblyDepth: 1, revealThreshold: 0.35, sourceMeshNames: ['Cube003_tiktok_0', 'Cube.003_tiktok_0'] },

      // 2. Bezel & Dial Rim
      'Cylinder028_Material003_0': { componentId: 'watch-dial-bezel', displayName: 'Dial Mounting Rim & Chapter Ring', category: 'Structural', explodeVector: [0, 0, 0.90], assemblyDepth: 0, revealThreshold: 0.00, sourceMeshNames: ['Cylinder028_Material003_0', 'Cylinder.028_Material.003_0'] },

      // 3. Bridges & Top Plate Structure (20-45% teardown)
      'Cube015_scratch_0': { componentId: 'watch-barrel-bridge', displayName: 'Mainspring Barrel Bridge', category: 'Structural', explodeVector: [0, 0, 0.65], assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames: ['Cube015_scratch_0', 'Cube.015_scratch_0'] },
      'Cube017_scratch_0': { componentId: 'watch-gear-bridge', displayName: 'Wheel Train Bridge (Côtes de Genève)', category: 'Structural', explodeVector: [0, 0, 0.60], assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames: ['Cube017_scratch_0', 'Cube.017_scratch_0'] },
      'Cube018_scratch_0': { componentId: 'watch-balance-cock', displayName: 'Balance Cock & Regulating Index', category: 'Regulator Support', explodeVector: [0, 0, 0.55], assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames: ['Cube018_scratch_0', 'Cube.018_scratch_0'] },
      'Cube023_scratch_0': { componentId: 'watch-escapement-bridge', displayName: 'Escapement Pallet Bridge', category: 'Structural', explodeVector: [0, 0, 0.50], assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames: ['Cube023_scratch_0', 'Cube.023_scratch_0'] },
      'Cube022_scratch_0': { componentId: 'watch-winding-bridge', displayName: 'Keyless Setting Mechanism Intermediate Bridge', category: 'Winding & Setting', explodeVector: [-0.45, 0.70, 0.45], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cube022_scratch_0', 'Cube.022_scratch_0'] },
      'Cube021_scratch_0': { componentId: 'watch-crown-wheel-bridge', displayName: 'Crown Wheel Retaining Plate', category: 'Winding & Setting', explodeVector: [-0.55, 0.65, 0.45], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cube021_scratch_0', 'Cube.021_scratch_0'] },

      // 4. Power & Energy Storage Kinematics (45-70% teardown)
      'Cube024_gear_metalic_0': { componentId: 'watch-click-pawl', displayName: 'Mainspring Ratchet Click Spring & Pawl', category: 'Energy Storage', explodeVector: [-0.60, 0.50, 0.30], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cube024_gear_metalic_0', 'Cube.024_gear metalic_0', 'Cube.024_gear_metalic_0'] },
      'Cylinder026_scratch_0': { componentId: 'watch-barrel-arbor-hub', displayName: 'Mainspring Barrel Arbor Hub & Ratchet Core', category: 'Energy Storage', explodeVector: [-0.65, 0.45, 0.35], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder026_scratch_0', 'Cylinder.026_scratch_0'] },
      'Spur_Gear001_gear_metalic_0': { componentId: 'watch-ratchet-wheel', displayName: 'Mainspring Ratchet Winding Wheel', category: 'Energy Storage', explodeVector: [-0.65, 0.45, 0.22], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Spur_Gear001_gear_metalic_0', 'Spur Gear.001_gear metalic_0', 'Spur Gear.001_gear_metalic_0'] },
      'Spur_Gear_gear_metalic_0': { componentId: 'watch-crown-wheel', displayName: 'Crown Intermediate Transmission Wheel', category: 'Winding & Setting', explodeVector: [-0.55, 0.60, 0.25], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Spur_Gear_gear_metalic_0', 'Spur Gear_gear metalic_0', 'Spur Gear_gear_metalic_0'] },

      // 5. Going Train Kinematics (45-70% teardown)
      'Spur_Gear005_gear_metalic_0': { componentId: 'watch-center-wheel', displayName: 'Center Wheel (Hour Drive)', category: 'Kinematics', explodeVector: [0.65, 0.55, 0.20], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Spur_Gear005_gear_metalic_0', 'Spur Gear.005_gear metalic_0', 'Spur Gear.005_gear_metalic_0'] },
      'Spur_Gear003_gear_metalic_0': { componentId: 'watch-third-wheel', displayName: 'Third Intermediate Wheel', category: 'Kinematics', explodeVector: [0.55, 0.40, 0.16], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Spur_Gear003_gear_metalic_0', 'Spur Gear.003_gear metalic_0', 'Spur Gear.003_gear_metalic_0'] },
      'Spur_Gear002_gear_metalic_0': { componentId: 'watch-fourth-wheel', displayName: 'Fourth Wheel (Seconds Drive)', category: 'Kinematics', explodeVector: [0.45, 0.30, 0.12], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Spur_Gear002_gear_metalic_0', 'Spur Gear.002_gear metalic_0', 'Spur Gear.002_gear_metalic_0'] },
      'Cylinder014_inside_metalblack_0': { componentId: 'watch-center-arbor-bushing', displayName: 'Center Wheel Friction Arbor Bushing Collar', category: 'Going Train', explodeVector: [0.65, 0.55, 0.45], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder014_inside_metalblack_0', 'Cylinder.014_inside metal.black_0', 'Cylinder014_inside_metal_black_0'] },

      // 6. Escapement Mechanism (65-100% fine micro-mechanics)
      'escape_wheel_0001_escape_wheel001_0': { componentId: 'watch-escape-wheel', displayName: 'Swiss Lever Escape Wheel (15 Teeth)', category: 'Escapement', explodeVector: [-0.45, -0.55, 0.18], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['escape_wheel_0001_escape_wheel001_0', 'escape wheel_0.001_escape_wheel.001_0', 'escape_wheel_0.001_escape_wheel.001_0'] },
      'escapement_0001_escapement002_0': { componentId: 'watch-pallet-fork', displayName: 'Hardened Steel Pallet Fork & Horns', category: 'Escapement', explodeVector: [-0.55, -0.68, 0.25], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['escapement_0001_escapement002_0', 'escapement_0.001_escapement.002_0'] },
      'Pallets_0001_ruby003_0': { componentId: 'watch-ruby-pallets', displayName: 'Synthetic Corundum Ruby Pallet Stones', category: 'Tribology & Escapement', explodeVector: [-0.58, -0.72, 0.32], assemblyDepth: 3, revealThreshold: 0.68, sourceMeshNames: ['Pallets_0001_ruby003_0', 'Pallets_0.001_ruby.003_0'] },
      'Pin1_0_material_0': { componentId: 'watch-escapement-banking-pin-entry', displayName: 'Escapement Banking Limit Pin (Entry)', category: 'Escapement', explodeVector: [-0.60, -0.65, 0.35], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Pin1_0_material_0', 'Pin1_0'] },
      'Pin1_0001_material002_0': { componentId: 'watch-escapement-banking-pin-exit', displayName: 'Escapement Banking Limit Pin (Exit)', category: 'Escapement', explodeVector: [-0.50, -0.72, 0.35], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Pin1_0001_material002_0', 'Pin1_0.001_material.002_0'] },

      // 7. Harmonic Regulating Organ (Oscillating core at 6 o\'clock)
      'Balance_Wheel_0001_balance_wheel001_0': { componentId: 'watch-balance-wheel', displayName: 'Glucydur Balance Wheel (4 Hz / 28,800 A/h)', category: 'Harmonic Oscillator', explodeVector: [0, -0.85, 0.26], assemblyDepth: 0, revealThreshold: 0.00, sourceMeshNames: ['Balance_Wheel_0001_balance_wheel001_0', 'Balance Wheel_0.001_balance_wheel.001_0'] },
      '0': { componentId: 'watch-hairspring', displayName: 'Nivarox Multi-Spiral Hairspring', category: 'Harmonic Oscillator', explodeVector: [0, -0.85, 0.38], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['0'] },
      'Balance_Axle_0001_axle002_0': { componentId: 'watch-balance-staff', displayName: 'Polished Hardened Steel Balance Staff', category: 'Harmonic Oscillator', explodeVector: [0, -0.85, 0.18], assemblyDepth: 3, revealThreshold: 0.68, sourceMeshNames: ['Balance_Axle_0001_axle002_0', 'Balance Axle_0.001_axle.002_0'] },
      'Impulse_Pin_0001_ruby003_0': { componentId: 'watch-impulse-ruby', displayName: 'Ruby Roller Impulse Pin', category: 'Tribology & Escapement', explodeVector: [0, -0.85, 0.46], assemblyDepth: 3, revealThreshold: 0.70, sourceMeshNames: ['Impulse_Pin_0001_ruby003_0', 'Impulse Pin_0.001_ruby.003_0'] },
      'Pin2_0001_material002_0': { componentId: 'watch-balance-cock-dowel-pin', displayName: 'Balance Cock Locating Steady Pin', category: 'Regulator Support', explodeVector: [0.25, -0.75, 0.40], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Pin2_0001_material002_0', 'Pin2_0.001_material.002_0'] },
      'fixations_0001_fixtures002_0': { componentId: 'watch-regulator-index-assembly', displayName: 'Balance Regulator Index & Stud Assembly', category: 'Harmonic Oscillator', explodeVector: [0.05, -0.85, 0.50], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['fixations_0001_fixtures002_0', 'fixations_0.001_fixtures.002_0'] },

      // 8. Synthetic Ruby Pivot & Endstone Jewels (Tribology Matrix)
      'Cylinder021_plastc_pink_0': { componentId: 'watch-center-upper-jewel', displayName: 'Center Wheel Upper Synthetic Ruby Olive Jewel', category: 'Tribology & Bearings', explodeVector: [0.65, 0.55, 0.35], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Cylinder021_plastc_pink_0', 'Cylinder.021_plastc pink_0', 'Cylinder021_plastc_pink'] },
      'Cylinder019_plastc_pink_0': { componentId: 'watch-third-upper-jewel', displayName: 'Third Wheel Upper Synthetic Ruby Olive Jewel', category: 'Tribology & Bearings', explodeVector: [0.55, 0.40, 0.32], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Cylinder019_plastc_pink_0', 'Cylinder.019_plastc pink_0', 'Cylinder019_plastc_pink'] },
      'Cylinder025_plastc_pink_0': { componentId: 'watch-third-lower-jewel', displayName: 'Third Wheel Lower Synthetic Ruby Olive Jewel', category: 'Tribology & Bearings', explodeVector: [0.55, 0.40, -0.15], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Cylinder025_plastc_pink_0', 'Cylinder.025_plastc pink_0', 'Cylinder025_plastc_pink'] },
      'Cylinder017_plastc_pink_0': { componentId: 'watch-fourth-lower-jewel', displayName: 'Fourth Wheel Lower Synthetic Ruby Olive Jewel', category: 'Tribology & Bearings', explodeVector: [0.45, 0.30, -0.15], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Cylinder017_plastc_pink_0', 'Cylinder.017_plastc pink_0', 'Cylinder017_plastc_pink'] },
      'Cylinder016_plastc_pink_0': { componentId: 'watch-escape-lower-jewel', displayName: 'Escape Wheel Lower Synthetic Ruby Olive Jewel', category: 'Tribology & Bearings', explodeVector: [-0.45, -0.55, -0.15], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Cylinder016_plastc_pink_0', 'Cylinder.016_plastc pink_0', 'Cylinder016_plastc_pink'] },
      'Cylinder015_plastc_pink_0': { componentId: 'watch-pallet-lower-jewel', displayName: 'Pallet Staff Lower Synthetic Ruby Olive Jewel', category: 'Tribology & Bearings', explodeVector: [-0.55, -0.68, -0.15], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Cylinder015_plastc_pink_0', 'Cylinder.015_plastc pink_0', 'Cylinder015_plastc_pink'] },
      'Cylinder012_plastc_pink_0': { componentId: 'watch-pallet-upper-jewel', displayName: 'Pallet Staff Upper Synthetic Ruby Olive Jewel', category: 'Tribology & Bearings', explodeVector: [-0.55, -0.68, 0.35], assemblyDepth: 3, revealThreshold: 0.65, sourceMeshNames: ['Cylinder012_plastc_pink_0', 'Cylinder.012_plastc pink_0', 'Cylinder012_plastc_pink'] },
      'Cylinder014_plastc_pink001_0': { componentId: 'watch-balance-lower-endstone', displayName: 'Balance Lower Incabloc Cap Endstone Jewel', category: 'Tribology & Shock Protection', explodeVector: [0, -0.85, -0.25], assemblyDepth: 3, revealThreshold: 0.68, sourceMeshNames: ['Cylinder014_plastc_pink001_0', 'Cylinder.014_plastc pink.001_0', 'Cylinder014_plastc_pink_001_0'] },
      'Cylinder013_plastc_pink_0': { componentId: 'watch-balance-cock-shock-jewel', displayName: 'Balance Cock Incabloc Shock Absorber Jewel', category: 'Tribology & Shock Protection', explodeVector: [0, -0.85, 0.62], assemblyDepth: 3, revealThreshold: 0.68, sourceMeshNames: ['Cylinder013_plastc_pink_0', 'Cylinder.013_plastc pink_0', 'Cylinder013_plastc_pink'] },

      // 9. Blued Carbon Steel Movement Fasteners & Screws
      'Cylinder024_inside_metalblack_0': { componentId: 'watch-barrel-bridge-screw-1', displayName: 'Mainspring Barrel Bridge Fastener 1', category: 'Fastening & Hardware', explodeVector: [-0.20, 0.20, 0.85], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder024_inside_metalblack_0', 'Cylinder.024_inside metal.black_0'] },
      'Cylinder023_inside_metalblack_0': { componentId: 'watch-barrel-bridge-screw-2', displayName: 'Mainspring Barrel Bridge Fastener 2', category: 'Fastening & Hardware', explodeVector: [-0.35, 0.05, 0.85], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder023_inside_metalblack_0', 'Cylinder.023_inside metal.black_0'] },
      'Cylinder022_inside_metalblack_0': { componentId: 'watch-train-bridge-screw-1', displayName: 'Wheel Train Bridge Fastener 1', category: 'Fastening & Hardware', explodeVector: [0.35, 0.35, 0.80], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder022_inside_metalblack_0', 'Cylinder.022_inside metal.black_0'] },
      'Cylinder020_inside_metalblack_0': { componentId: 'watch-train-bridge-screw-2', displayName: 'Wheel Train Bridge Fastener 2', category: 'Fastening & Hardware', explodeVector: [0.55, 0.20, 0.80], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder020_inside_metalblack_0', 'Cylinder.020_inside metal.black_0'] },
      'Cylinder011_inside_metalblack_0': { componentId: 'watch-balance-cock-screw', displayName: 'Balance Cock Retaining Screw', category: 'Fastening & Hardware', explodeVector: [0.30, -0.70, 0.85], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder011_inside_metalblack_0', 'Cylinder.011_inside metal.black_0'] },
      'Cylinder010_inside_metalblack_0': { componentId: 'watch-pallet-bridge-screw', displayName: 'Pallet Bridge Retaining Screw', category: 'Fastening & Hardware', explodeVector: [-0.40, -0.60, 0.75], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder010_inside_metalblack_0', 'Cylinder.010_inside metal.black_0'] },
      'Cylinder009_inside_metalblack_0': { componentId: 'watch-ratchet-screw', displayName: 'Ratchet Wheel Core Fastener', category: 'Fastening & Hardware', explodeVector: [-0.65, 0.45, 0.55], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder009_inside_metalblack_0', 'Cylinder.009_inside metal.black_0'] },
      'Cylinder008_inside_metalblack001_0': { componentId: 'watch-crown-wheel-screw', displayName: 'Crown Wheel Reverse-Thread Fastener', category: 'Fastening & Hardware', explodeVector: [-0.55, 0.60, 0.55], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder008_inside_metalblack001_0', 'Cylinder.008_inside metal.black.001_0'] },
      'Cylinder007_inside_metalblack_0': { componentId: 'watch-winding-bridge-screw-1', displayName: 'Winding Works Bridge Fastener 1', category: 'Fastening & Hardware', explodeVector: [-0.40, 0.75, 0.65], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder007_inside_metalblack_0', 'Cylinder.007_inside metal.black_0'] },
      'Cylinder006_inside_metalblack_0': { componentId: 'watch-winding-bridge-screw-2', displayName: 'Winding Works Bridge Fastener 2', category: 'Fastening & Hardware', explodeVector: [-0.50, 0.85, 0.65], assemblyDepth: 2, revealThreshold: 0.45, sourceMeshNames: ['Cylinder006_inside_metalblack_0', 'Cylinder.006_inside metal.black_0'] },
      'Cylinder005_inside_metalblack_0': { componentId: 'watch-casing-clamp-screw-1', displayName: 'Movement Casing Clamp Screw 1', category: 'Fastening & Hardware', explodeVector: [-0.85, 0.00, 0.55], assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames: ['Cylinder005_inside_metalblack_0', 'Cylinder.005_inside metal.black_0'] },
      'Cylinder004_inside_metalblack_0': { componentId: 'watch-casing-clamp-screw-2', displayName: 'Movement Casing Clamp Screw 2', category: 'Fastening & Hardware', explodeVector: [0.85, 0.00, 0.55], assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames: ['Cylinder004_inside_metalblack_0', 'Cylinder.004_inside metal.black_0'] },

      // 10. Movement Base & Casing Structure (Backward, 0-20% teardown)
      'Cylinder001_black_watch_0': { componentId: 'watch-mainplate', displayName: 'Circular Grained Movement Mainplate', category: 'Chassis Base', explodeVector: [0, 0, -0.65], assemblyDepth: 0, revealThreshold: 0.00, sourceMeshNames: ['Cylinder001_black_watch_0', 'Cylinder.001_black_watch_0'] },
      'Cylinder028_Material004_0': { componentId: 'watch-base-ring', displayName: 'Movement Retaining Casing Ring', category: 'Chassis Base', explodeVector: [0, 0, -1.05], assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames: ['Cylinder028_Material004_0', 'Cylinder.028_Material.004_0'] },
    },
  },

  // ==========================================
  // 5. ELECTRIC MOTOR (BLDC)
  // ==========================================
  'electric-motor': {
    objectId: 'electric-motor',
    displayName: 'Brushless DC Outrunner Motor',
    type: 'gltf',
    modelPath: '/models/brushless_motor.glb',
    targetMaxDimension: 4.8,
    initialRotation: [0, 0, 0],
    initialOffset: [0, 0, 0],
    defaultCameraDistance: 7.2,
    meshMappings: {
      'rotor-assembly': {
        componentId: 'rotor-assembly',
        displayName: 'Outer CNC Aluminum Rotor Bell',
        category: 'Rotating Assembly',
        explodeVector: [0, 0.95, 0],
        explodeStart: 0.05,
        explodeEnd: 0.58,
        color: '#0ea5e9',
        assemblyDepth: 0,
        revealThreshold: 0.00,
        sourceMeshNames: ['Object_26'],
      },
      'neodymium-magnets': {
        componentId: 'neodymium-magnets',
        displayName: 'N52 Neodymium Permanent Magnets (14 Poles)',
        category: 'Magnetic Circuit',
        explodeVector: [0, 1.25, 0],
        explodeStart: 0.10,
        explodeEnd: 0.64,
        color: '#38bdf8',
        assemblyDepth: 1,
        revealThreshold: 0.25,
        sourceMeshNames: ['Object_23'],
      },
      'motor-shaft': {
        componentId: 'motor-shaft',
        displayName: 'Precision Ground SUS420J2 Drive Shaft',
        category: 'Kinematics & Powertrain',
        explodeVector: [0, 1.55, 0],
        explodeStart: 0.16,
        explodeEnd: 0.70,
        color: '#94a3b8',
        assemblyDepth: 0,
        revealThreshold: 0.00,
        sourceMeshNames: ['Object_20'],
      },
      'ball-bearings': {
        componentId: 'ball-bearings',
        displayName: 'Front ABEC-7 Deep Groove Ball Bearing Assembly',
        category: 'Tribology',
        explodeVector: [0, 0.55, 0],
        explodeStart: 0.20,
        explodeEnd: 0.72,
        color: '#cbd5e1',
        assemblyDepth: 2,
        revealThreshold: 0.48,
        sourceMeshNames: ['Object_12', 'Object_15', 'Object_16', 'Object_18'],
      },
      'rear-bearing': {
        componentId: 'rear-bearing',
        displayName: 'Rear ABEC-7 Deep Groove Ball Bearing Assembly',
        category: 'Tribology',
        explodeVector: [0, -0.80, 0],
        explodeStart: 0.20,
        explodeEnd: 0.74,
        color: '#cbd5e1',
        assemblyDepth: 2,
        revealThreshold: 0.48,
        sourceMeshNames: ['Object_4', 'Object_7', 'Object_8', 'Object_10'],
      },
      'retaining-clip': {
        componentId: 'retaining-clip',
        displayName: 'Shaft Circlip & End Retaining Screw',
        category: 'Mechanical Fastener',
        explodeVector: [0, -1.15, 0],
        explodeStart: 0.04,
        explodeEnd: 0.54,
        color: '#64748b',
        assemblyDepth: 3,
        revealThreshold: 0.68,
        sourceMeshNames: ['Object_28'],
      },
      'stator-core': {
        componentId: 'stator-core',
        displayName: '0.20mm Silicon Steel Stator Armature Lamination Stack',
        category: 'Electromagnetic Circuit',
        explodeVector: [0, 0.05, 0],
        explodeStart: 0.26,
        explodeEnd: 0.78,
        color: '#f59e0b',
        assemblyDepth: 0,
        revealThreshold: 0.00,
        sourceMeshNames: ['Object_58', 'Object_59'],
      },
      'copper-windings': {
        componentId: 'copper-windings',
        displayName: '3-Phase Copper Coil Windings (12 Slots)',
        category: 'Electromagnetic Circuit',
        explodeVector: [0, 0.25, 0],
        explodeStart: 0.30,
        explodeEnd: 0.82,
        color: '#d97706',
        assemblyDepth: 1,
        revealThreshold: 0.25,
        sourceMeshNames: ['Object_56'],
      },
      'stator-hub': {
        componentId: 'stator-hub',
        displayName: 'Central Aluminum Stator Core Carrier Hub',
        category: 'Structural Core',
        explodeVector: [0, -0.20, 0],
        explodeStart: 0.28,
        explodeEnd: 0.80,
        color: '#475569',
        assemblyDepth: 3,
        revealThreshold: 0.65,
        sourceMeshNames: ['Object_54'],
      },
      'base-flange': {
        componentId: 'base-flange',
        displayName: 'CNC 6061-T6 Aluminum Base Mounting Flange',
        category: 'Structural Chassis',
        explodeVector: [0, -0.55, 0],
        explodeStart: 0.24,
        explodeEnd: 0.78,
        color: '#334155',
        assemblyDepth: 0,
        revealThreshold: 0.00,
        sourceMeshNames: ['Object_30', 'Object_31'],
      },
      'phase-wires': {
        componentId: 'phase-wires',
        displayName: '3-Phase High-Flex Silicone Lead Wires',
        category: 'Electrical Power',
        explodeVector: [0, -0.45, 0.95],
        explodeStart: 0.34,
        explodeEnd: 0.86,
        color: '#ef4444',
        assemblyDepth: 3,
        revealThreshold: 0.72,
        sourceMeshNames: ['Object_47', 'Object_49', 'Object_51'],
      },
      'bullet-terminals': {
        componentId: 'bullet-terminals',
        displayName: '3.5mm Gold-Plated Bullet Terminals & Strain Relief',
        category: 'Interconnect',
        explodeVector: [0, -0.45, 1.55],
        explodeStart: 0.38,
        explodeEnd: 0.92,
        color: '#eab308',
        assemblyDepth: 3,
        revealThreshold: 0.75,
        sourceMeshNames: ['Object_33', 'Object_36', 'Object_37', 'Object_40', 'Object_41', 'Object_44', 'Object_45'],
      },
    },
  },

  // ==========================================
  // 6. CAR ENGINE / TURBOCHARGER
  // ==========================================
  'car-engine': {
    objectId: 'car-engine',
    displayName: 'Twin-Scroll Turbocharger',
    type: 'gltf',
    modelPath: '/models/turbocharger.glb',
    targetMaxDimension: 5.2,
    initialRotation: [0, 0, 0],
    initialOffset: [0, 0, 0],
    defaultCameraDistance: 7.8,
    meshMappings: {
      'turbo-compressor-housing': {
        componentId: 'turbo-compressor-housing',
        displayName: 'Cast A356 Aluminum Twin-Volute Compressor Housing',
        category: 'Air Induction Enclosure',
        explodeVector: [0, 0, -2.8],
        explodeStart: 0.05,
        explodeEnd: 0.60,
        color: '#94a3b8',
        assemblyDepth: 0,
        revealThreshold: 0.00,
        sourceMeshNames: ['BezierCircle.002_Material.001_0', 'BezierCircle.002_Material_0'],
      },
      'turbo-compressor-inlet': {
        componentId: 'turbo-compressor-inlet',
        displayName: 'Cold Air Induction Bellmouth Inlet Snout',
        category: 'Fluid Induction',
        explodeVector: [0, 0, -4.6],
        explodeStart: 0.02,
        explodeEnd: 0.52,
        color: '#64748b',
        assemblyDepth: 1,
        revealThreshold: 0.25,
        sourceMeshNames: ['Cylinder.024_Material.001_0'],
      },
      'turbo-chra-core': {
        componentId: 'turbo-chra-core',
        displayName: 'Center Housing Rotating Assembly (CHRA) & Shaft Core',
        category: 'Core Rotordynamics',
        explodeVector: [0, 0, 0],
        explodeStart: 0.20,
        explodeEnd: 0.70,
        color: '#38bdf8',
        assemblyDepth: 0,
        revealThreshold: 0.00,
        sourceMeshNames: ['Cylinder_Material.001_0'],
      },
      'turbo-heat-shield': {
        componentId: 'turbo-heat-shield',
        displayName: 'Inconel Thermal Isolation Heat Shield & Seal Backplate',
        category: 'Thermal Protection',
        explodeVector: [0, 0, 1.2],
        explodeStart: 0.22,
        explodeEnd: 0.74,
        color: '#f59e0b',
        assemblyDepth: 2,
        revealThreshold: 0.48,
        sourceMeshNames: ['Cube_Material.001_0'],
      },
      'turbo-turbine-housing': {
        componentId: 'turbo-turbine-housing',
        displayName: 'Ni-Resist D-5S High-Nickel Twin-Scroll Turbine Housing',
        category: 'Exhaust Gas Expansion',
        explodeVector: [0, 0, 2.9],
        explodeStart: 0.10,
        explodeEnd: 0.65,
        color: '#475569',
        assemblyDepth: 0,
        revealThreshold: 0.00,
        sourceMeshNames: ['BezierCircle.003_Material_0'],
      },
      'turbo-exhaust-flange': {
        componentId: 'turbo-exhaust-flange',
        displayName: 'T3/T4 Divided Twin-Scroll Exhaust Manifold Inlet Flange',
        category: 'Exhaust Interface',
        explodeVector: [-1.9, -1.9, 2.6],
        explodeStart: 0.15,
        explodeEnd: 0.70,
        color: '#334155',
        assemblyDepth: 1,
        revealThreshold: 0.28,
        sourceMeshNames: ['Cube.002_Material_0'],
      },
      'turbo-exhaust-outlet': {
        componentId: 'turbo-exhaust-outlet',
        displayName: 'High-Flow Exhaust Downpipe Discharge Outlet Port',
        category: 'Exhaust Discharge',
        explodeVector: [0, 0, 4.6],
        explodeStart: 0.05,
        explodeEnd: 0.55,
        color: '#64748b',
        assemblyDepth: 1,
        revealThreshold: 0.30,
        sourceMeshNames: ['Cylinder.007_Material.001_0'],
      },
      'turbo-wastegate-actuator': {
        componentId: 'turbo-wastegate-actuator',
        displayName: 'Pneumatic Boost Wastegate Canister Actuator & Bracket',
        category: 'Pneumatic Boost Control',
        explodeVector: [2.9, 1.2, -0.6],
        explodeStart: 0.18,
        explodeEnd: 0.72,
        color: '#0ea5e9',
        assemblyDepth: 2,
        revealThreshold: 0.48,
        sourceMeshNames: ['Cylinder.002_Material.001_0', 'Cube.001_Material.001_0'],
      },
      'turbo-wastegate-linkage': {
        componentId: 'turbo-wastegate-linkage',
        displayName: 'Wastegate Pushrod Linkage, Bellcrank & Pivot Flapper Arm',
        category: 'Kinematics & Linkage',
        explodeVector: [2.5, 0.4, 0.8],
        explodeStart: 0.24,
        explodeEnd: 0.78,
        color: '#0284c7',
        assemblyDepth: 3,
        revealThreshold: 0.68,
        sourceMeshNames: ['Cylinder.005_Material.001_0', 'Cylinder.005_Material_0', 'Cylinder.004_Material.001_0', 'Cylinder.003_Material_0'],
      },
      'turbo-oil-ports': {
        componentId: 'turbo-oil-ports',
        displayName: 'Hydrodynamic Pressurized Oil Feed & Gravitational Drain Flange',
        category: 'Lubrication & Tribology',
        explodeVector: [0, 2.4, 0],
        explodeStart: 0.28,
        explodeEnd: 0.82,
        color: '#10b981',
        assemblyDepth: 3,
        revealThreshold: 0.70,
        sourceMeshNames: ['Cylinder.006_Material.001_0', 'Cylinder.008__0'],
      },
    },
  },

  // ==========================================
  // 7. JET TURBINE
  // ==========================================
  'jet-turbine': {
    objectId: 'jet-turbine',
    displayName: 'High-Bypass Turbofan Jet Engine',
    type: 'procedural',
    targetMaxDimension: 6.0,
    defaultCameraDistance: 9.5,
  },

  // ==========================================
  // 8. QUADCOPTER DRONE (Animated GLB)
  // ==========================================
  'drone': {
    objectId: 'drone',
    displayName: 'Quadcopter Drone',
    type: 'gltf',
    modelPath: '/models/drone/animated_drone.glb',
    // The supplied asset is skinned. Its native assembled geometry is roughly
    // 25.3 units wide, so normalize it to a presentation-sized 7.8-unit model.
    targetMaxDimension: 13.0,
    initialRotation: [0, 0, 0],
    initialOffset: [0, 0, 0],
    defaultCameraDistance: 10.2,
    nativeExplodePeakTime: 2.0,
    // Every render mesh is intentionally assigned to a meaningful assembly.
    // Raw Object_### names never reach the UI.
    meshMappings: {
      'top-structure': { componentId:'drone-top-structure', displayName:'Top Electronics Cover & Plates', category:'Structural / Avionics', explodeVector:[0,2.5,0.3], explodeStart:0.02, explodeEnd:0.42, assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames:['Object_96','Object_99','Object_102'] },
      'top-board': { componentId:'drone-top-board', displayName:'Top Control Board', category:'Electronics', explodeVector:[0,3.2,0.9], explodeStart:0.08, explodeEnd:0.48, assemblyDepth: 2, revealThreshold: 0.48, sourceMeshNames:['Object_105','Object_108','Object_111','Object_114','Object_117'] },
      'flight-electronics': { componentId:'drone-flight-electronics', displayName:'Flight Electronics Stack', category:'Avionics', explodeVector:[0,1.1,3.1], explodeStart:0.12, explodeEnd:0.52, assemblyDepth: 2, revealThreshold: 0.50, sourceMeshNames:['Object_120'] },
      'receiver': { componentId:'drone-receiver', displayName:'Receiver & Input Module', category:'Communications', explodeVector:[-3.0,1.0,2.0], explodeStart:0.16, explodeEnd:0.58, assemblyDepth: 2, revealThreshold: 0.52, sourceMeshNames:['Object_123','Object_126'] },
      'battery': { componentId:'drone-battery', displayName:'Rechargeable Battery Pack & Connector', category:'Power System', explodeVector:[0,-3.8,0.6], explodeStart:0.18, explodeEnd:0.62, assemblyDepth: 1, revealThreshold: 0.30, sourceMeshNames:['Object_129','Object_132'] },
      'bottom-frame': { componentId:'drone-bottom-frame', displayName:'Central Bottom Frame & Standoffs', category:'Structural Chassis', explodeVector:[0,-0.8,-3.4], explodeStart:0.22, explodeEnd:0.66, assemblyDepth: 0, revealThreshold: 0.00, sourceMeshNames:['Object_135','Object_138','Object_141','Object_144','Object_147','Object_150','Object_153','Object_156'] },
      'lower-body': { componentId:'drone-lower-body', displayName:'Lower Body Shell & Ventilation', category:'Structural Enclosure', explodeVector:[0,-2.6,-0.4], explodeStart:0.26, explodeEnd:0.68, assemblyDepth: 1, revealThreshold: 0.25, sourceMeshNames:['Object_159','Object_162'] },
      'upper-body': { componentId:'drone-upper-body', displayName:'Upper Body Shell', category:'Structural Enclosure', explodeVector:[0,3.4,-0.3], explodeStart:0.30, explodeEnd:0.72, assemblyDepth: 0, revealThreshold: 0.00, sourceMeshNames:['Object_165'] },
      'camera-base': { componentId:'drone-camera-base', displayName:'Camera Mount & Base', category:'Payload Mount', explodeVector:[0,-2.3,2.8], explodeStart:0.34, explodeEnd:0.76, assemblyDepth: 1, revealThreshold: 0.35, sourceMeshNames:['Object_168','Object_171','Object_174','Object_177','Object_180'] },
      'camera': { componentId:'drone-camera', displayName:'Camera Assembly & Retaining Screws', category:'Imaging Payload', explodeVector:[0,-4.0,3.8], explodeStart:0.38, explodeEnd:0.80, assemblyDepth: 2, revealThreshold: 0.55, sourceMeshNames:['Object_183','Object_186','Object_189','Object_192'] },
      'landing-gear': { componentId:'drone-landing-gear', displayName:'Landing Gear Set', category:'Landing Structure', explodeVector:[0,-4.3,-1.8], explodeStart:0.42, explodeEnd:0.84, assemblyDepth: 1, revealThreshold: 0.32, sourceMeshNames:['Object_195','Object_198','Object_201','Object_204'] },
      'propellers': { componentId:'drone-propeller-group', displayName:'Propeller Set (4 Rotors)', category:'Propulsion', explodeVector:[0,4.5,0], explodeStart:0.46, explodeEnd:0.86, assemblyDepth: 0, revealThreshold: 0.00, sourceMeshNames:['Object_207','Object_216','Object_225','Object_234'] },
      'motors': { componentId:'drone-motor-group', displayName:'Brushless Motor Assemblies (4)', category:'Propulsion', explodeVector:[0,2.7,0], explodeStart:0.50, explodeEnd:0.90, assemblyDepth: 0, revealThreshold: 0.00, sourceMeshNames:['Object_213','Object_222','Object_231','Object_240'] },
      'prop-fasteners': { componentId:'drone-prop-fasteners', displayName:'Propeller Bolts, Nuts & Caps', category:'Mechanical Fastening', explodeVector:[0,5.8,0], explodeStart:0.54, explodeEnd:0.94, assemblyDepth: 3, revealThreshold: 0.68, sourceMeshNames:['Object_210','Object_219','Object_228','Object_237','Object_243','Object_246','Object_249','Object_252','Object_255','Object_258','Object_261','Object_264'] },
      'motor-mounts': { componentId:'drone-motor-mounts', displayName:'Motor Mounts & Fasteners', category:'Structural Interface', explodeVector:[0,1.3,-2.9], explodeStart:0.58, explodeEnd:0.98, assemblyDepth: 3, revealThreshold: 0.72, sourceMeshNames:['Object_267','Object_270','Object_273','Object_276','Object_279','Object_282','Object_285','Object_288','Object_291','Object_294','Object_297','Object_300','Object_303','Object_306','Object_309','Object_312','Object_315','Object_318','Object_321','Object_324'] },
    },
  },

};

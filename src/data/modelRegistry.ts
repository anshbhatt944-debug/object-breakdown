import { ComponentNode } from '../types/objectData';

export interface ModelMeshMapping {
  componentId: string;
  displayName: string;
  category: string;
  explodeVector: [number, number, number];
  explodeStart?: number;
  explodeEnd?: number;
  color?: string;
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
      },
      'Object_4': {
        componentId: 'pen-barrel',
        displayName: 'Brushed Stainless Steel Outer Barrel',
        category: 'Structural Enclosure',
        explodeVector: [0, 2.4, 0],
        explodeStart: 0.16,
        explodeEnd: 0.72,
        color: '#cbd5e1',
      },
      'Object_6': {
        componentId: 'pen-grip-tip',
        displayName: 'Ergonomic Ribbed Grip & Precision Writing Tip',
        category: 'Ergonomics & Fluidics',
        explodeVector: [0, -2.8, 0],
        explodeStart: 0.22,
        explodeEnd: 0.78,
        color: '#1e293b',
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
      // Hands & Chapter Indicators
      'Circle_tiktok_0': { componentId: 'watch-hands', displayName: 'Sweep Seconds Hand & Counterweight', category: 'Indication', explodeVector: [0, 0, 4.2] },
      'Circle001_tiktok_0': { componentId: 'watch-minute-hand', displayName: 'Faceted Minute Hand', category: 'Indication', explodeVector: [0, 0, 3.8] },
      'Circle002_tiktok_0': { componentId: 'watch-hour-hand', displayName: 'Hour Hand & Dial Chapter', category: 'Indication', explodeVector: [0, 0, 3.4] },
      'Cube003_tiktok_0': { componentId: 'watch-indices', displayName: 'Applied Luminescent Hour Markers', category: 'Indication', explodeVector: [0, 0, 3.2] },

      // Bridges & Top Plate Structure
      'Cube015_scratch_0': { componentId: 'watch-barrel-bridge', displayName: 'Mainspring Barrel Bridge', category: 'Structural', explodeVector: [0, 0, 2.4] },
      'Cube017_scratch_0': { componentId: 'watch-gear-bridge', displayName: 'Wheel Train Bridge (Côtes de Genève)', category: 'Structural', explodeVector: [0, 0, 2.2] },
      'Cube018_scratch_0': { componentId: 'watch-balance-cock', displayName: 'Balance Cock & Regulating Index', category: 'Regulator Support', explodeVector: [0, 0, 2.0] },
      'Cube023_scratch_0': { componentId: 'watch-escapement-bridge', displayName: 'Escapement Pallet Bridge', category: 'Structural', explodeVector: [0, 0, 1.8] },
      'Cube024_gear_metalic_0': { componentId: 'watch-winding-bridge', displayName: 'Keyless Winding Works Bridge', category: 'Winding Mechanism', explodeVector: [0, 0, 1.6] },

      // Stepped Wheel Train
      'Spur_Gear005_gear_metalic_0': { componentId: 'watch-center-wheel', displayName: 'Center Wheel (Hour Drive)', category: 'Kinematics', explodeVector: [1.8, 1.5, 0.4] },
      'Spur_Gear003_gear_metalic_0': { componentId: 'watch-third-wheel', displayName: 'Third Intermediate Wheel', category: 'Kinematics', explodeVector: [1.5, 1.2, 0.3] },
      'Spur_Gear002_gear_metalic_0': { componentId: 'watch-fourth-wheel', displayName: 'Fourth Wheel (Seconds Drive)', category: 'Kinematics', explodeVector: [1.2, 0.9, 0.2] },
      'Spur_Gear001_gear_metalic_0': { componentId: 'watch-ratchet-wheel', displayName: 'Mainspring Ratchet Winding Wheel', category: 'Energy Storage', explodeVector: [-1.8, 1.2, 0.4] },
      'Spur_Gear_gear_metalic_0': { componentId: 'watch-crown-wheel', displayName: 'Crown Intermediate Transmission Wheel', category: 'Winding', explodeVector: [-1.5, 1.6, 0.5] },

      // Escapement & Regulating Organ
      'escape_wheel_0001_escape_wheel001_0': { componentId: 'watch-escape-wheel', displayName: 'Swiss Lever Escape Wheel (15 Teeth)', category: 'Escapement', explodeVector: [-1.2, -1.5, 0.4] },
      'escapement_0001_escapement002_0': { componentId: 'watch-pallet-fork', displayName: 'Hardened Steel Pallet Fork & Horns', category: 'Escapement', explodeVector: [-1.5, -1.8, 0.6] },
      'Pallets_0001_ruby003_0': { componentId: 'watch-ruby-pallets', displayName: 'Synthetic Corundum Ruby Pallet Stones', category: 'Tribology & Escapement', explodeVector: [-1.6, -1.9, 0.8] },
      'Balance_Wheel_0001_balance_wheel001_0': { componentId: 'watch-balance-wheel', displayName: 'Glucydur Balance Wheel (4 Hz / 28,800 A/h)', category: 'Harmonic Oscillator', explodeVector: [0, -2.4, 0.6] },
      '0': { componentId: 'watch-hairspring', displayName: 'Nivarox Multi-Spiral Hairspring', category: 'Oscillator Spring', explodeVector: [0, -2.4, 0.9] },
      'Balance_Axle_0001_axle002_0': { componentId: 'watch-balance-staff', displayName: 'Polished Hardened Steel Balance Staff', category: 'Oscillator Axle', explodeVector: [0, -2.4, 0.4] },
      'Impulse_Pin_0001_ruby003_0': { componentId: 'watch-impulse-ruby', displayName: 'Ruby Roller Impulse Pin', category: 'Tribology', explodeVector: [0, -2.4, 1.1] },

      // Mainplate Base Chassis
      'Cylinder001_black_watch_0': { componentId: 'watch-mainplate', displayName: 'Circular Grained Movement Mainplate', category: 'Chassis Base', explodeVector: [0, 0, -2.2] },
      'Cylinder028_Material004_0': { componentId: 'watch-base-ring', displayName: 'Movement Retaining Casing Ring', category: 'Chassis Base', explodeVector: [0, 0, -2.5] },
      'Cylinder028_Material003_0': { componentId: 'watch-dial-bezel', displayName: 'Dial Mounting Rim & Chapter Ring', category: 'Structural', explodeVector: [0, 0, -2.0] },
    },
  },

  // ==========================================
  // 5. ELECTRIC MOTOR (BLDC)
  // ==========================================
  'electric-motor': {
    objectId: 'electric-motor',
    displayName: 'Brushless DC Outrunner Motor',
    type: 'procedural',
    targetMaxDimension: 4.5,
    defaultCameraDistance: 6.8,
  },

  // ==========================================
  // 6. CAR ENGINE
  // ==========================================
  'car-engine': {
    objectId: 'car-engine',
    displayName: 'Turbocharged Inline-4 Engine',
    type: 'procedural',
    targetMaxDimension: 5.5,
    defaultCameraDistance: 8.5,
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
};

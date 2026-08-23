import { ComponentNode } from '../types/objectData';

export interface ModelMeshMapping {
  componentId: string;
  displayName: string;
  category: string;
  explodeVector: [number, number, number];
  explodeStart?: number;
  explodeEnd?: number;
  color?: string;
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
      'top-structure': { componentId:'drone-top-structure', displayName:'Top Electronics Cover & Plates', category:'Structural / Avionics', explodeVector:[0,2.5,0.3], explodeStart:0.02, explodeEnd:0.42, sourceMeshNames:['Object_96','Object_99','Object_102'] },
      'top-board': { componentId:'drone-top-board', displayName:'Top Control Board', category:'Electronics', explodeVector:[0,3.2,0.9], explodeStart:0.08, explodeEnd:0.48, sourceMeshNames:['Object_105','Object_108','Object_111','Object_114','Object_117'] },
      'flight-electronics': { componentId:'drone-flight-electronics', displayName:'Flight Electronics Stack', category:'Avionics', explodeVector:[0,1.1,3.1], explodeStart:0.12, explodeEnd:0.52, sourceMeshNames:['Object_120'] },
      'receiver': { componentId:'drone-receiver', displayName:'Receiver & Input Module', category:'Communications', explodeVector:[-3.0,1.0,2.0], explodeStart:0.16, explodeEnd:0.58, sourceMeshNames:['Object_123','Object_126'] },
      'battery': { componentId:'drone-battery', displayName:'Rechargeable Battery Pack & Connector', category:'Power System', explodeVector:[0,-3.8,0.6], explodeStart:0.18, explodeEnd:0.62, sourceMeshNames:['Object_129','Object_132'] },
      'bottom-frame': { componentId:'drone-bottom-frame', displayName:'Central Bottom Frame & Standoffs', category:'Structural Chassis', explodeVector:[0,-0.8,-3.4], explodeStart:0.22, explodeEnd:0.66, sourceMeshNames:['Object_135','Object_138','Object_141','Object_144','Object_147','Object_150','Object_153','Object_156'] },
      'lower-body': { componentId:'drone-lower-body', displayName:'Lower Body Shell & Ventilation', category:'Structural Enclosure', explodeVector:[0,-2.6,-0.4], explodeStart:0.26, explodeEnd:0.68, sourceMeshNames:['Object_159','Object_162'] },
      'upper-body': { componentId:'drone-upper-body', displayName:'Upper Body Shell', category:'Structural Enclosure', explodeVector:[0,3.4,-0.3], explodeStart:0.30, explodeEnd:0.72, sourceMeshNames:['Object_165'] },
      'camera-base': { componentId:'drone-camera-base', displayName:'Camera Mount & Base', category:'Payload Mount', explodeVector:[0,-2.3,2.8], explodeStart:0.34, explodeEnd:0.76, sourceMeshNames:['Object_168','Object_171','Object_174','Object_177','Object_180'] },
      'camera': { componentId:'drone-camera', displayName:'Camera Assembly & Retaining Screws', category:'Imaging Payload', explodeVector:[0,-4.0,3.8], explodeStart:0.38, explodeEnd:0.80, sourceMeshNames:['Object_183','Object_186','Object_189','Object_192'] },
      'landing-gear': { componentId:'drone-landing-gear', displayName:'Landing Gear Set', category:'Landing Structure', explodeVector:[0,-4.3,-1.8], explodeStart:0.42, explodeEnd:0.84, sourceMeshNames:['Object_195','Object_198','Object_201','Object_204'] },
      'propellers': { componentId:'drone-propeller-group', displayName:'Propeller Set (4 Rotors)', category:'Propulsion', explodeVector:[0,4.5,0], explodeStart:0.46, explodeEnd:0.86, sourceMeshNames:['Object_207','Object_216','Object_225','Object_234'] },
      'motors': { componentId:'drone-motor-group', displayName:'Brushless Motor Assemblies (4)', category:'Propulsion', explodeVector:[0,2.7,0], explodeStart:0.50, explodeEnd:0.90, sourceMeshNames:['Object_213','Object_222','Object_231','Object_240'] },
      'prop-fasteners': { componentId:'drone-prop-fasteners', displayName:'Propeller Bolts, Nuts & Caps', category:'Mechanical Fastening', explodeVector:[0,5.8,0], explodeStart:0.54, explodeEnd:0.94, sourceMeshNames:['Object_210','Object_219','Object_228','Object_237','Object_243','Object_246','Object_249','Object_252','Object_255','Object_258','Object_261','Object_264'] },
      'motor-mounts': { componentId:'drone-motor-mounts', displayName:'Motor Mounts & Fasteners', category:'Structural Interface', explodeVector:[0,1.3,-2.9], explodeStart:0.58, explodeEnd:0.98, sourceMeshNames:['Object_267','Object_270','Object_273','Object_276','Object_279','Object_282','Object_285','Object_288','Object_291','Object_294','Object_297','Object_300','Object_303','Object_306','Object_309','Object_312','Object_315','Object_318','Object_321','Object_324'] },
    },
  },

};

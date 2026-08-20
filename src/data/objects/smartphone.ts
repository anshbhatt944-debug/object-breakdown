import { ObjectBreakdownData } from '../../types/objectData';
import { iphone14ProReferenceComponents } from '../smartphoneReference';

export const smartphoneData: ObjectBreakdownData = {
  id: 'smartphone',
  name: 'Smartphone',
  category: 'Consumer Electronics / Microelectronics',
  subtitle: 'A16 Bionic • Super Retina XDR OLED • Pro Camera System • LiDAR • MagSafe',
  heroTagline: 'A tightly packed stack of compute, energy storage, optics, RF, haptics and precision enclosure engineering.',
  thumbnail: 'phone',
  complexityScore: {
    overall: 9.4,
    mechanical: 7.8,
    electrical: 9.8,
    material: 8.9,
    manufacturing: 9.6,
    assembly: 9.5,
  },
  stats: {
    componentCount: 17,
    materialCount: 8,
    manufacturingStages: 8,
    movingParts: 4,
    approxCostUsd: 'Not disclosed in Apple specifications',
    productionVolume: 'Not disclosed in this reference set',
  },
  summary:
    'The iPhone 14 Pro is a 147.5 × 71.5 × 7.85 mm, 206 g smartphone that combines a 6.1-inch 2556 × 1179 Super Retina XDR OLED display, A16 Bionic compute, a three-camera Pro system, TrueDepth Face ID hardware, LiDAR, a lithium-ion battery, Taptic Engine, wireless charging/NFC hardware, RF antennas and a stainless-steel/glass enclosure. The supplied 3D asset is an exterior model, so the internal labels in this viewer are a technical reference map rather than a claim that those internals are separate meshes in the GLB.',
  engineeringDisciplines: [
    'Semiconductor & Computer Architecture',
    'OLED Display Engineering & Optoelectronics',
    'Electrochemical Energy Storage',
    'RF / Antenna Engineering',
    'Precision Micro-Optics & Image Stabilization',
    'MEMS / Sensor Engineering',
    'Acoustics & Haptics',
    'Precision Enclosure & Adhesive Engineering',
  ],
  rootComponents: iphone14ProReferenceComponents,
  materials: [
    {
      name: 'Stainless Steel', percentage: 18, color: '#94a3b8', category: 'Structural Metal', usedIn: ['Perimeter frame'],
      properties: [{ key: 'Primary role', value: 'Structural enclosure and interface datum' }, { key: 'Exact alloy', value: 'Not specified here' }],
      advantages: ['High stiffness', 'Durable exterior surface', 'Good structural support'], disadvantages: ['Higher density than aluminum', 'Can influence RF design'], alternatives: ['Aluminum alloy', 'Titanium alloy'], selectionRationale: 'Apple uses a stainless-steel design on the iPhone 14 Pro.'
    },
    {
      name: 'Glass / Ceramic Shield', percentage: 20, color: '#38bdf8', category: 'Optical Enclosure', usedIn: ['Front cover', 'Rear glass'],
      properties: [{ key: 'Front', value: 'Ceramic Shield' }, { key: 'Rear', value: 'Textured matt glass' }],
      advantages: ['Optical transparency', 'RF transparency', 'Rigid surface'], disadvantages: ['Brittle under concentrated impact'], alternatives: ['Sapphire', 'Aluminosilicate glass'], selectionRationale: 'Balances optical performance, enclosure stiffness and wireless/RF requirements.'
    },
    {
      name: 'Silicon Semiconductors', percentage: 3, color: '#10b981', category: 'Microelectronics', usedIn: ['A16 Bionic', 'Camera sensors', 'LiDAR', 'MEMS/sensors'],
      properties: [{ key: 'A16 CPU', value: '6 cores' }, { key: 'A16 GPU', value: '5 cores' }, { key: 'Neural Engine', value: '16 cores' }],
      advantages: ['Extremely high compute density'], disadvantages: ['Heat generation and sensitivity to interconnect/process defects'], alternatives: ['Different semiconductor process nodes/architectures'], selectionRationale: 'Silicon enables dense digital computation and sensing electronics.'
    },
    {
      name: 'Lithium-Ion Cell', percentage: 35, color: '#64748b', category: 'Energy Storage', usedIn: ['Battery pack'],
      properties: [{ key: 'Nominal voltage', value: '3.87 V' }, { key: 'Energy', value: '12.38 Wh (iFixit)' }],
      advantages: ['High volumetric energy density'], disadvantages: ['Thermal runaway risk if severely damaged'], alternatives: ['Future solid-state chemistries'], selectionRationale: 'High energy density is essential in a thin portable device.'
    },
    {
      name: 'Copper / Conductive Metals', percentage: 10, color: '#f59e0b', category: 'Electrical / RF', usedIn: ['Charging coil', 'Conductors', 'RF structures'],
      properties: [{ key: 'Role', value: 'Low-resistance electrical and electromagnetic conduction' }],
      advantages: ['High electrical conductivity'], disadvantages: ['Mass and corrosion/oxidation considerations'], alternatives: ['Aluminum and plated alloys in selected applications'], selectionRationale: 'Conductive metals are required for power transfer, signal routing and RF structures.'
    },
    {
      name: 'Engineering Polymers', percentage: 8, color: '#a78bfa', category: 'Insulation / Structural', usedIn: ['Connectors', 'Sensor mounts', 'Acoustic structures'],
      properties: [{ key: 'Role', value: 'Electrical isolation and precision molded features' }],
      advantages: ['Low mass', 'Electrical insulation', 'Complex moldability'], disadvantages: ['Thermal limits and creep'], alternatives: ['Ceramics or metal in selected locations'], selectionRationale: 'Polymers provide low-mass electrical isolation and complex miniature geometry.'
    },
  ],
  howItWorks: [
    { step: 1, title: 'Battery → Power Management → Logic Board', description: 'The lithium-ion battery feeds the power-management system, which creates the regulated supply rails required by the processor, memory, display, sensors and RF circuitry.', activeComponentIds: ['iphone-battery', 'iphone-logic-board'], forcesDescription: 'Electrical power flow; exact rail voltages are implementation-specific.' },
    { step: 2, title: 'A16 Bionic Computation', description: 'A16 Bionic combines a 6-core CPU, 5-core GPU and 16-core Neural Engine to execute general compute, graphics and machine-learning workloads.', activeComponentIds: ['iphone-logic-board'], forcesDescription: 'High-density electrical switching produces heat that must be removed through the internal thermal path.' },
    { step: 3, title: 'Display + Touch Interaction', description: 'The OLED display produces light while the touch system detects user interaction. ProMotion allows adaptive refresh rates up to 120Hz.', activeComponentIds: ['iphone-display-assembly', 'iphone-ceramic-shield'], forcesDescription: 'Optical/electrical interaction with a mechanically protected display stack.' },
    { step: 4, title: 'Imaging + Computational Photography', description: 'The three rear cameras provide different optical fields of view while the A16 Bionic processes sensor data for HDR, Night mode, stabilization and computational imaging.', activeComponentIds: ['iphone-rear-cameras', 'iphone-lidar', 'iphone-logic-board'], forcesDescription: 'Precision optical alignment and sensor timing are critical.' },
    { step: 5, title: 'Face ID + Depth Sensing', description: 'The TrueDepth system provides the sensing required for Face ID while the LiDAR scanner adds rear depth sensing for AR and imaging features.', activeComponentIds: ['iphone-truedepth', 'iphone-lidar'], forcesDescription: 'Optical paths and sensor calibration must remain aligned.' },
    { step: 6, title: 'Wireless Power + RF Communication', description: 'The wireless charging/NFC region transfers power or communicates at short range while the distributed antenna system handles cellular, Wi-Fi, Bluetooth and UWB radio links.', activeComponentIds: ['iphone-wireless-coil', 'iphone-antenna-system'], forcesDescription: 'Electromagnetic coupling and RF impedance depend strongly on geometry and nearby materials.' },
    { step: 7, title: 'Haptics + Acoustics', description: 'The Taptic Engine creates controlled vibration while miniature speakers and microphones provide audio input/output.', activeComponentIds: ['iphone-taptic-engine', 'iphone-top-speaker', 'iphone-bottom-speaker', 'iphone-microphones'], forcesDescription: 'Mechanical vibration and acoustic pressure are coupled to the enclosure.' },
  ],
  engineeringEquations: [
    {
      id: 'iphone-power', title: 'Electrical Power', discipline: 'Electrical', latex: 'P = V \cdot I', explanation: 'Relates battery/rail voltage and current to instantaneous electrical power. Real phone power is distributed across many regulated rails.', variables: [
        { symbol: 'P', name: 'Electrical Power', unit: 'W' }, { symbol: 'V', name: 'Voltage', unit: 'V' }, { symbol: 'I', name: 'Current', unit: 'A' }
      ],
    },
    {
      id: 'iphone-lens', title: 'Thin Lens Relationship', discipline: 'Materials', latex: '\\frac{1}{f}=\\frac{1}{u}+\\frac{1}{v}', explanation: 'A simplified optical relation showing why focal length and sensor/lens geometry matter in a compact camera module.', variables: [
        { symbol: 'f', name: 'Focal Length', unit: 'mm' }, { symbol: 'u', name: 'Object Distance', unit: 'mm' }, { symbol: 'v', name: 'Image Distance', unit: 'mm' }
      ],
    },
  ],
  manufacturingTimeline: [
    { stepNumber: 1, stageName: 'Semiconductor Fabrication', description: 'A16 Bionic and sensor silicon are fabricated and packaged through semiconductor manufacturing processes.', machinery: 'Semiconductor wafer fabrication and packaging equipment', tolerance: 'Microscale / process-specific', materialReq: 'Silicon and semiconductor package materials', qualityChecks: ['Electrical test', 'Package inspection'], commonDefects: ['Yield loss', 'Interconnect defects'] },
    { stepNumber: 2, stageName: 'Display Manufacturing', description: 'OLED display stack and cover materials are fabricated, laminated and calibrated.', machinery: 'OLED deposition and precision lamination equipment', tolerance: 'Display alignment model-dependent', materialReq: 'OLED stack + Ceramic Shield', qualityChecks: ['Pixel inspection', 'Touch test', 'Optical calibration'], commonDefects: ['Dead pixels', 'Optical contamination'] },
    { stepNumber: 3, stageName: 'Camera Module Assembly', description: 'Lens, sensor and stabilization elements are aligned and calibrated.', machinery: 'Precision optical alignment equipment', tolerance: 'Optical alignment critical', materialReq: 'Optics + image sensors + actuators', qualityChecks: ['Focus', 'OIS', 'Image quality'], commonDefects: ['Decentering', 'Contamination'] },
    { stepNumber: 4, stageName: 'Battery Cell Formation', description: 'Cells are assembled, filled, sealed and electrically formed before phone integration.', machinery: 'Automated cell formation and aging equipment', tolerance: 'Cell-specific', materialReq: 'Lithium-ion electrodes and electrolyte', qualityChecks: ['Capacity', 'Leak test', 'Electrical safety'], commonDefects: ['Swelling', 'Internal short'] },
    { stepNumber: 5, stageName: 'Logic Board Assembly', description: 'PCB, packages, connectors and power/RF components are assembled and tested.', machinery: 'SMT placement and inspection equipment', tolerance: 'Board-level precision', materialReq: 'HDI PCB + electronic packages', qualityChecks: ['AOI', 'Electrical test', 'RF test'], commonDefects: ['Solder defects', 'Connector damage'] },
    { stepNumber: 6, stageName: 'Enclosure Assembly', description: 'Display, frame, rear glass and internal modules are bonded and aligned.', machinery: 'Precision adhesive and fixture systems', tolerance: 'Model-dependent', materialReq: 'Stainless steel + glass + adhesives', qualityChecks: ['Alignment', 'Seal inspection'], commonDefects: ['Adhesive voids', 'Misalignment'] },
  ],
  relationships: [
    { sourceId: 'iphone-battery', targetId: 'iphone-logic-board', interactionType: 'conducts', description: 'Battery power enters the logic board through a dedicated flex/connector interface.' },
    { sourceId: 'iphone-logic-board', targetId: 'iphone-display-assembly', interactionType: 'conducts', description: 'The logic board drives display and touch electronics.' },
    { sourceId: 'iphone-rear-cameras', targetId: 'iphone-logic-board', interactionType: 'conducts', description: 'Camera modules send sensor data to the main processing system.' },
    { sourceId: 'iphone-truedepth', targetId: 'iphone-logic-board', interactionType: 'conducts', description: 'TrueDepth sensors communicate with the processing and security subsystems.' },
    { sourceId: 'iphone-wireless-coil', targetId: 'iphone-logic-board', interactionType: 'conducts', description: 'Charging/NFC electronics interface with the main power and communications system.' },
    { sourceId: 'iphone-taptic-engine', targetId: 'iphone-frame', interactionType: 'transfers', description: 'The actuator transfers reaction forces into the chassis to create haptic feedback.' },
  ],
  whatIfParameters: [
    {
      id: 'display-refresh', label: 'Display Refresh Rate', component: 'Super Retina XDR display', min: 1, max: 120, defaultValue: 120, unit: 'Hz',
      impactMetrics: [{ name: 'Relative Display Update Rate', calculate: (val) => ({ changePercent: Math.round(((val - 60) / 60) * 100), valueStr: `${val.toFixed(0)} Hz`, status: val > 100 ? 'optimal' : val < 30 ? 'warning' : 'optimal', explanation: val > 100 ? 'High refresh improves motion smoothness but increases display workload.' : 'Lower refresh reduces update activity and can reduce power demand.' }) }],
    },
  ],
  didYouKnow: [
    'Apple specifies a 6.1-inch Super Retina XDR OLED display at 2556 × 1179 pixels and 460 ppi, with ProMotion up to 120Hz.',
    'A16 Bionic uses a 6-core CPU, 5-core GPU and 16-core Neural Engine.',
    'The Pro camera system combines a 48MP Main camera with 12MP Ultra Wide and 12MP 3× Telephoto cameras.',
    'The iPhone 14 Pro includes a LiDAR scanner and TrueDepth camera system for depth-aware sensing.',
    'Apple rates the iPhone 14 Pro IP68 under IEC 60529, with a stated maximum depth of 6 metres for up to 30 minutes.',
    'iFixit lists the iPhone 14 Pro battery at 12.38 Wh and 3.87 V nominal.',
  ],
  engineersChoice: [
    { title: 'Why combine glass, stainless steel and distributed RF structures?', rationale: 'The enclosure must simultaneously satisfy stiffness, optical protection, wireless transparency, antenna performance and premium surface requirements. No single material optimizes all of those properties.' },
    { title: 'Why use multiple cameras instead of one huge zoom lens?', rationale: 'Multiple short optical paths fit the thickness constraint while covering wide, standard and telephoto fields of view.' },
  ],
  redesignInsights: {
    simplify: { title: 'Single Camera + Aluminum Enclosure', partReduction: 'Fewer optical and structural interfaces', description: 'A simpler phone could reduce module count and manufacturing complexity.', tradeoffs: 'Lower imaging flexibility and different RF/thermal/structural behavior.' },
    makeItBetter: { title: 'More Modular Internal Architecture', upgrade: 'Increase replaceable module boundaries and standardized connectors.', performanceGain: 'Potentially improved repairability and service turnaround.', description: 'A modular architecture could make individual subsystems easier to replace.', tradeoffs: 'More connectors, brackets and volume can increase mass and package thickness.' },
    cheaperVersion: { title: 'Aluminum Frame + Simpler Camera Stack', costReduction: 'Potentially lower structural and imaging BOM complexity.', changes: 'Use a simpler enclosure and fewer optical modules.', tradeoffs: 'Lower premium feel, imaging flexibility and possibly reduced structural/RF performance.' },
  },
  aiSuggestedQuestions: [
    'Where is the A16 Bionic located on the logic board and what does each major subsystem do?',
    'How does the iPhone 14 Pro fit a 48MP main camera, 3× telephoto and LiDAR into the rear camera island?',
    'How does the Taptic Engine create such precise haptic feedback?',
    'How does MagSafe transfer power through the rear glass?',
    'What exactly is inside the TrueDepth system that enables Face ID?',
    'Why is the battery such a large fraction of the phone’s internal volume?',
    'How do the phone antennas work around a metal frame and dense electronics?',
  ],
};

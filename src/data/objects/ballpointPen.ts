import { ObjectBreakdownData } from '../../types/objectData';

const penInternalComponents = [
  {
    id: 'supplemental-ink-cartridge', name: 'Ink Cartridge / Reservoir', cadId: 'PART-PEN-04', category: 'Fluidics', meshKey: 'pen-cartridge', explodeVector: [-0.35, 0, 0] as [number, number, number], defaultColor: '#64748b',
    material: { name: 'Oil-Based Ballpoint Ink / Polymer Tube', grade: 'Model-dependent internal assembly', type: 'Polymer' as const, density: 'Model-dependent' },
    function: 'Stores and meters high-viscosity ink to the writing tip.', manufacturing: { process: 'Tube extrusion and reservoir filling', machinery: 'Automated filling line', tolerance: 'Model-dependent', defectRisks: ['Air entrapment', 'Reservoir leakage'] }, dimensions: { formatted: 'Internal cartridge assembly' }, mechanicalRole: { motion: 'Static reservoir; feeds ink during writing' }, connectedTo: ['supplemental-writing-tip'], failureModes: [], engineeringReason: 'Central fluid reservoir used to supply the ball-and-socket writing interface.', dataConfidence: 'Model-dependent' as const,
  },
  {
    id: 'supplemental-return-spring', name: 'Compression Return Spring', cadId: 'PART-PEN-05', category: 'Kinematics', meshKey: 'pen-spring', explodeVector: [0.9, 0, 0] as [number, number, number], defaultColor: '#d4d4d8',
    material: { name: 'High-Carbon Spring Steel', grade: 'ASTM A228', type: 'Metal' as const, density: '7.85 g/cm³' },
    function: 'Returns the click mechanism and writing tip to the retracted position.', manufacturing: { process: 'Cold coiling and stress relief', machinery: 'Spring coiling machine', tolerance: 'Wire and free-length controlled', defectRisks: ['Permanent set', 'Fatigue fracture'] }, dimensions: { formatted: 'Internal helical spring' }, mechanicalRole: { forces: 'Restoring force for click mechanism', motion: 'Axial compression and extension' }, connectedTo: ['supplemental-click-cam', 'supplemental-ink-cartridge'], failureModes: [], engineeringReason: 'Stores elastic energy for repeatable retraction and tactile actuation.', dataConfidence: 'Model-dependent' as const,
  },
  {
    id: 'supplemental-click-cam', name: 'Rotary Click Cam', cadId: 'PART-PEN-06', category: 'Kinematics', meshKey: 'pen-cam', explodeVector: [1.35, 0.25, 0] as [number, number, number], defaultColor: '#f59e0b',
    material: { name: 'Polyoxymethylene (POM)', grade: 'Acetal engineering polymer', type: 'Polymer' as const, density: '1.41 g/cm³' },
    function: 'Indexes between stable extended and retracted states.', manufacturing: { process: 'Precision injection molding', machinery: 'Micro injection molding press', tolerance: 'Profile-dependent', defectRisks: ['Flash', 'Tooth wear'] }, dimensions: { formatted: 'Internal bistable cam' }, mechanicalRole: { motion: 'Axial actuation converted to indexed rotation' }, connectedTo: ['pen-clip-actuator', 'supplemental-return-spring'], failureModes: [], engineeringReason: 'Creates the bistable latching behavior of a retractable ballpoint mechanism.', dataConfidence: 'Model-dependent' as const,
  },
  {
    id: 'supplemental-writing-tip', name: 'Precision Writing Tip', cadId: 'PART-PEN-07', category: 'Fluidics', meshKey: 'pen-tip', explodeVector: [-1.0, -0.25, 0] as [number, number, number], defaultColor: '#b45309',
    material: { name: 'Free-Cutting Brass', grade: 'CuZn39Pb3', type: 'Metal' as const, density: '8.47 g/cm³' },
    function: 'Houses the rolling ball and meters ink onto the writing surface.', manufacturing: { process: 'Swiss-type micro machining', machinery: 'CNC turning center', tolerance: 'Micron-scale ball seat', defectRisks: ['Socket burr', 'Ink leakage'] }, dimensions: { formatted: 'Precision micro-orifice assembly' }, mechanicalRole: { motion: 'Supports rolling ball and ink transfer' }, connectedTo: ['supplemental-tungsten-ball', 'supplemental-ink-cartridge'], failureModes: [], engineeringReason: 'The ball seat geometry controls line consistency and prevents excessive ink flow.', dataConfidence: 'Model-dependent' as const,
  },
  {
    id: 'supplemental-tungsten-ball', name: 'Tungsten Carbide Ball', cadId: 'PART-PEN-08', category: 'Tribology', meshKey: 'pen-ball', explodeVector: [-1.35, -0.4, 0] as [number, number, number], defaultColor: '#a1a1aa',
    material: { name: 'Tungsten Carbide', grade: 'WC-6Co', type: 'Ceramic' as const, density: '14.9 g/cm³' },
    function: 'Rolls between paper and the ink reservoir to transfer a controlled ink film.', manufacturing: { process: 'Powder metallurgy and precision lapping', machinery: 'Centerless grinding and lapping', tolerance: 'Sub-micron sphericity', defectRisks: ['Chipping', 'Out-of-roundness'] }, dimensions: { formatted: 'Sub-millimetre rolling ball' }, mechanicalRole: { motion: 'Rolling contact at writing interface' }, connectedTo: ['supplemental-writing-tip'], failureModes: [], engineeringReason: 'High hardness and wear resistance preserve a consistent rolling contact surface.', dataConfidence: 'Model-dependent' as const,
  },
];

export const ballpointPenData: ObjectBreakdownData = {
  id: 'ballpoint-pen',
  name: 'Ballpoint Pen',
  category: 'Mechanical / Fluidics',
  subtitle: 'Retractable Precision Fluid Dispenser',
  heroTagline: 'Micro-scale fluid mechanics meets mass-produced precision mechanisms.',
  thumbnail: 'pen',
  complexityScore: {
    overall: 4.2,
    mechanical: 5.5,
    electrical: 0.0,
    material: 6.2,
    manufacturing: 6.8,
    assembly: 5.0,
  },
  stats: {
    componentCount: 12,
    materialCount: 5,
    manufacturingStages: 7,
    movingParts: 4,
    approxCostUsd: '$0.35 - $1.50',
    productionVolume: '100M+ units/year',
  },
  summary:
    'A ballpoint pen is a deceptively simple writing instrument that relies on precision micro-machining and fluid mechanics. It dispenses high-viscosity, oil-based ink via a tungsten carbide sphere rolling inside a brass or steel socket with micron-level tolerances, actuated by a bistable cam-and-spring click mechanism.',
  engineeringDisciplines: [
    'Fluid Mechanics (Capillary Action & Non-Newtonian Flow)',
    'Tribology & Wear (Micro-Rolling Contact)',
    'Kinematics (Bistable Cam-Follower Mechanism)',
    'Precision Swiss Screw Machining & Micro-Molding',
  ],
  rootComponents: [
    {
      id: 'pen-clip-actuator',
      name: 'Spring-Steel Pocket Clip & Push Plunger',
      cadId: 'PART-PEN-01',
      category: 'Attachment & Kinematics',
      meshKey: 'pen-clip',
      explodeVector: [0, 3.2, 0],
      defaultColor: '#94a3b8',
      material: {
        name: 'Tempered Spring Steel & Polished Chrome',
        grade: 'AISI 1075 / Cr-Plated',
        type: 'Metal',
        density: '7.85 g/cm³',
        tensileStrength: '850 MPa',
        elasticModulus: '210 GPa',
      },
      function: 'Top button plunger for click actuation with integrated cantilever pocket clip.',
      manufacturing: {
        process: 'Progressive Stamping, Forming & Mirror Chrome Plating',
        machinery: 'High-Speed Multi-Slide Stamping Press',
        tolerance: '±0.04 mm',
        defectRisks: ['Plating micro-cracking', 'Spring relaxation'],
      },
      dimensions: {
        formatted: '38 mm × 4.5 mm (Plunger Ø 6.2 mm)',
      },
      mechanicalRole: {
        forces: 'Actuation stroke force: 3.5 - 5.0 N',
        motion: '3.2 mm linear stroke',
      },
      connectedTo: ['pen-barrel'],
      failureModes: [
        {
          mode: 'Clip permanent bending',
          cause: 'Excessive displacement beyond yield point (>5 mm displacement).',
          mitigation: 'Stress-relief heat treatment and deflection limit stop.',
          severity: 'Low',
        },
      ],
      engineeringReason: 'Spring steel allows repeated deflection over 50,000 insertions without losing clamping tension.',
      dataConfidence: 'Verified',
    },
    {
      id: 'pen-barrel',
      name: 'Brushed Stainless Steel Outer Barrel',
      cadId: 'PART-PEN-02',
      category: 'Structural Enclosure',
      meshKey: 'pen-barrel',
      explodeVector: [0, 0, 0],
      defaultColor: '#cbd5e1',
      material: {
        name: 'Brushed Stainless Steel 304',
        grade: 'AISI 304 (1.4301)',
        type: 'Metal',
        density: '8.00 g/cm³',
        tensileStrength: '520 MPa',
        elasticModulus: '193 GPa',
      },
      function: 'Forms the main structural chassis, protecting internal ink cartridge and mechanism.',
      manufacturing: {
        process: 'Deep Drawing from Stainless Steel Strip + Longitudinal Satin Brushing',
        machinery: 'Multi-Stage Transfer Press + Automated Centerless Polishing Lathe',
        tolerance: '±0.025 mm',
        defectRisks: ['Wall thickness runout', 'Drawing scratch marks'],
      },
      dimensions: {
        formatted: 'L 92 mm × Ø 8.8 mm (Wall 0.45 mm)',
      },
      mechanicalRole: {
        forces: 'Resists writing bending moments up to 25 N·m',
        motion: 'Static chassis ground',
      },
      connectedTo: ['pen-clip-actuator', 'pen-grip-tip'],
      failureModes: [
        {
          mode: 'Thread galling',
          cause: 'Metal-on-metal friction during cartridge replacement.',
          mitigation: 'Rolled threads with dry PTFE solid lubricant coating.',
          severity: 'Low',
        },
      ],
      engineeringReason: 'Austenitic stainless steel provides excellent corrosion resistance against sweat and high cosmetic durability.',
      dataConfidence: 'Verified',
    },
    {
      id: 'pen-grip-tip',
      name: 'Ergonomic Ribbed Grip & Writing Tip',
      cadId: 'PART-PEN-03',
      category: 'Ergonomics & Fluidics',
      meshKey: 'pen-grip',
      explodeVector: [0, -3.2, 0],
      defaultColor: '#1e293b',
      material: {
        name: 'Textured Matte ABS & Leaded Brass Tip',
        grade: 'Terluran GP-22 & CuZn39Pb3',
        type: 'Composite',
        density: '1.05 g/cm³ / 8.47 g/cm³',
      },
      function: 'Features ribbed non-slip finger grip profile and houses the micro-metering tungsten carbide ball tip.',
      manufacturing: {
        process: 'Precision Injection Molding + Swiss Screw Multi-Spindle CNC Boring',
        machinery: 'Mikron Rotary Transfer Lathe',
        tolerance: '±0.002 mm at ball socket',
        defectRisks: ['Parting line flash', 'Capillary burr'],
      },
      dimensions: {
        formatted: 'L 46 mm × Ø 8.8 mm (Tip aperture Ø 0.70 mm)',
      },
      mechanicalRole: {
        forces: 'Grip friction μ = 0.75 against human skin; writing contact 1.5 N',
        motion: 'Tungsten micro-sphere rolling up to 3,000 RPM',
      },
      connectedTo: ['pen-barrel'],
      failureModes: [
        {
          mode: 'Ink skipping / dry tip',
          cause: 'Micro-burrs or dried ink solvent evaporation at meniscus.',
          mitigation: 'Precision cold-crimping of socket lip over ball equator.',
          severity: 'High',
        },
      ],
      engineeringReason: 'The ribbed grip improves writing comfort and control while the precision-machined tip maintains controlled ink delivery and reliable ball rotation.',
      dataConfidence: 'Verified',
      children: penInternalComponents,
    },
  ],
  materials: [
    {
      name: 'ABS Copolymer (Acrylonitrile Butadiene Styrene)',
      percentage: 42,
      color: '#3b82f6',
      category: 'Engineering Polymer',
      usedIn: ['Main Upper Barrel', 'Grip Core', 'Button Dome'],
      properties: [
        { key: 'Tensile Strength', value: '45 MPa' },
        { key: 'Flexural Modulus', value: '2.3 GPa' },
        { key: 'Density', value: '1.05 g/cm³' },
        { key: 'Heat Deflection Temp', value: '88 °C @ 1.8 MPa' },
      ],
      advantages: ['Excellent cosmetic finish', 'Low mold shrinkage (0.4-0.7%)', 'High impact toughness from polybutadiene phase'],
      disadvantages: ['Poor UV weatherability without additives', 'Susceptible to acetone cracking'],
      alternatives: ['Polycarbonate (PC) for premium clarity', 'Recycled PET for eco-designs'],
      selectionRationale: 'Strikes the optimal balance between high production yield, low cost ($2.20/kg), and structural rigidity for thin-walled parts.',
    },
    {
      name: 'Free-Cutting Leaded Brass (CuZn39Pb3)',
      percentage: 22,
      color: '#eab308',
      category: 'Copper Alloy',
      usedIn: ['Writing Tip', 'Connector Bushing'],
      properties: [
        { key: 'Machinability Index', value: '100% (Standard Benchmark)' },
        { key: 'Tensile Strength', value: '440 MPa' },
        { key: 'Density', value: '8.47 g/cm³' },
        { key: 'Corrosion Resistance', value: 'Excellent against glycol solvents' },
      ],
      advantages: ['Discontinuous chip formation during high-speed CNC boring', 'Low tool wear', 'Easy crimpability without cracking'],
      disadvantages: ['Contains 2-3% lead (RoHS compliance limits)', 'Heavier than aluminum'],
      alternatives: ['Nickel silver (CuNiZn)', 'Lead-free bismuth brass (Eco-Brass)'],
      selectionRationale: 'Essential for drilling 0.15 mm capillary ink channels at cycle times under 1 second without breaking micro-drill bits.',
    },
    {
      name: 'Tungsten Carbide (WC-6Co)',
      percentage: 6,
      color: '#64748b',
      category: 'Cermet / Ultra-Hard Ceramic',
      usedIn: ['Rotating Micro-Sphere'],
      properties: [
        { key: 'Hardness', value: '1600 HV (91 HRA)' },
        { key: 'Elastic Modulus', value: '620 GPa' },
        { key: 'Compressive Strength', value: '5500 MPa' },
        { key: 'Density', value: '14.9 g/cm³' },
      ],
      advantages: ['Virtually zero wear over 2,000+ meters of writing', 'Can be lapped to 0.0002 mm sphericity', 'Immune to acidic dyes'],
      disadvantages: ['Extremely brittle under point impact', 'High manufacturing tooling cost'],
      alternatives: ['Silicon Nitride (Si3N4) Ceramic', 'AISI 440C Stainless Steel'],
      selectionRationale: 'Maintains perfect spherical geometry under 150 MPa contact pressure against abrasive silica particles in paper.',
    },
    {
      name: 'Polyoxymethylene (POM / Acetal Delrin)',
      percentage: 14,
      color: '#cbd5e1',
      category: 'Self-Lubricating Polymer',
      usedIn: ['Rotary Cam', 'Ratchet Follower'],
      properties: [
        { key: 'Coefficient of Friction', value: '0.15 against POM' },
        { key: 'Yield Strength', value: '68 MPa' },
        { key: 'Rockwell Hardness', value: 'M85' },
        { key: 'Fatigue Endurance', value: '35 MPa @ 10^7 cycles' },
      ],
      advantages: ['High dimensional stability in moist air', 'Self-lubricating dry mechanism', 'Crisp acoustic snap sound'],
      disadvantages: ['High mold shrinkage (1.8 - 2.2%)', 'Cannot be solvent glued'],
      alternatives: ['Nylon 6,6 (Polyamide)', 'PTFE filled Polycarbonate'],
      selectionRationale: 'Enables high-repetition click actuation without grease lubricants, which would otherwise attract dust and jam.',
    },
    {
      name: 'High-Carbon Spring Steel (ASTM A228)',
      percentage: 16,
      color: '#94a3b8',
      category: 'Cold-Drawn Steel',
      usedIn: ['Compression Return Spring', 'Pocket Clip'],
      properties: [
        { key: 'Tensile Strength', value: '1850 MPa' },
        { key: 'Shear Modulus (G)', value: '79.3 GPa' },
        { key: 'Density', value: '7.85 g/cm³' },
      ],
      advantages: ['High elastic energy storage per unit mass', 'Infinite fatigue life when stress is kept <45% of UTS'],
      disadvantages: ['Requires protective zinc/nickel plating to prevent rusting'],
      alternatives: ['302 Stainless Steel wire (no plating required)'],
      selectionRationale: 'Delivers dependable 2.2 N return stroke force over 100,000 compression cycles without settling.',
    },
  ],
  howItWorks: [
    {
      step: 1,
      title: 'User Applies Axial Thumb Force',
      description: 'The user presses the plunger button with ~4 N of downward thumb force. This compresses the return spring and pushes the rotary cam down the internal barrel guide tracks.',
      activeComponentIds: ['thrust-plunger', 'rotary-cam', 'return-spring'],
      forcesDescription: 'F_input = 4.2 N downward; Spring resists with F_spring = k · x = 150 N/m · 0.0035 m = 0.52 N',
    },
    {
      step: 2,
      title: 'Cam Clears Guide Ribs & Indexes 45°',
      description: 'As the cam reaches the bottom of the longitudinal ribs, the inclined tooth ramps force the cam to rotate 45 degrees into alignment with the deep latching pocket.',
      activeComponentIds: ['rotary-cam', 'outer-housing'],
      forcesDescription: 'Inclined plane converts axial force into rotational torque: T = F · r · tan(θ - φ) ≈ 0.08 N·m',
    },
    {
      step: 3,
      title: 'Mechanism Latches in Extended State',
      description: 'The user releases thumb pressure. The spring pushes the cam upward by 0.8 mm until its teeth seat firmly into the locking pocket, locking the ink tip 3.5 mm outside the barrel.',
      activeComponentIds: ['rotary-cam', 'brass-socket', 'return-spring'],
      forcesDescription: 'Normal reaction force on latch shelf: N = F_spring = 2.2 N holding the cartridge rigid against writing pressure.',
    },
    {
      step: 4,
      title: 'Writing Contact & Ink Shear-Thinning',
      description: 'As the tungsten carbide ball rolls against paper, friction rotates the sphere. The micro-roughness of the ball pulls ink from the capillary reservoir through the 0.005 mm clearance gap.',
      activeComponentIds: ['tungsten-ball', 'brass-socket', 'ink-reservoir'],
      forcesDescription: 'Dynamic shear rate: γ_dot = v_write / gap = 0.15 m/s / 5×10^-6 m = 30,000 s^-1. Ink viscosity drops by 98% under shear.',
    },
    {
      step: 5,
      title: 'Retraction Sequence',
      description: 'A second button press drives the cam past the latch shelf. The helical ramps rotate the cam another 45°, aligning it with the deep return slot, allowing the spring to pull the tip back safely.',
      activeComponentIds: ['thrust-plunger', 'rotary-cam', 'return-spring'],
      forcesDescription: 'Spring energy releases: U = 0.5 · k · (x2^2 - x1^2) = 5.2 mJ, accelerating the cartridge to retracted home position in 18 ms.',
    },
  ],
  engineeringEquations: [
    {
      id: 'eq-spring-force',
      title: "Hooke's Law for Compression Spring",
      discipline: 'Mechanical',
      latex: 'F = k \\cdot \\Delta x = \\frac{G \\cdot d^4}{8 \\cdot D^3 \\cdot n} \\cdot \\Delta x',
      explanation: 'Calculates the restorative force generated by the helical wire coil based on wire diameter (d), mean coil diameter (D), active coil count (n), and shear modulus (G).',
      variables: [
        { symbol: 'F', name: 'Spring Force', unit: 'N', objectValue: '2.25 N' },
        { symbol: 'k', name: 'Spring Stiffness Rate', unit: 'N/m', objectValue: '150 N/m' },
        { symbol: 'Δx', name: 'Deflection Displacement', unit: 'm', objectValue: '0.015 m (15 mm)' },
        { symbol: 'G', name: 'Shear Modulus (Steel)', unit: 'GPa', objectValue: '79.3 GPa' },
        { symbol: 'd', name: 'Wire Diameter', unit: 'mm', objectValue: '0.38 mm' },
        { symbol: 'D', name: 'Mean Coil Diameter', unit: 'mm', objectValue: '3.72 mm' },
        { symbol: 'n', name: 'Active Coils', unit: '-', objectValue: '14' },
      ],
      interactiveCalculator: {
        calculate: (inputs) => {
          const { k, dx } = inputs;
          const force = k * (dx / 1000);
          const energy = 0.5 * k * Math.pow(dx / 1000, 2) * 1000;
          return {
            result: force,
            unit: 'N',
            formatted: `${force.toFixed(2)} N (${(force * 101.97).toFixed(1)} g-force)`,
            interpretation: force > 4.5 ? 'Warning: Stiff spring will make click button feel uncomfortably hard.' : 'Optimal: Ergonomic tactile feedback with reliable cartridge return.',
          };
        },
        inputs: [
          { key: 'k', label: 'Spring Rate (k)', min: 50, max: 400, step: 10, default: 150, unit: 'N/m' },
          { key: 'dx', label: 'Compression Stroke (Δx)', min: 5, max: 20, step: 1, default: 15, unit: 'mm' },
        ],
      },
    },
    {
      id: 'eq-poiseuille-flow',
      title: 'Hagen-Poiseuille Capillary Ink Flow',
      discipline: 'Fluid Mechanics',
      latex: 'Q = \\frac{\\pi \\cdot \\Delta P \\cdot r^4}{8 \\cdot \\mu \\cdot L}',
      explanation: 'Determines the volumetric flow rate (Q) of ink through the tip capillary. Notice that flow rate is proportional to the radius to the 4th power (r⁴), making micro-machining tolerances hyper-critical.',
      variables: [
        { symbol: 'Q', name: 'Volumetric Ink Flow Rate', unit: 'mm³/s', objectValue: '0.042 mm³/s' },
        { symbol: 'ΔP', name: 'Capillary Pressure Gradient', unit: 'Pa', objectValue: '1,850 Pa' },
        { symbol: 'r', name: 'Capillary Channel Radius', unit: 'mm', objectValue: '0.125 mm' },
        { symbol: 'μ', name: 'Dynamic Ink Viscosity (Sheared)', unit: 'Pa·s', objectValue: '0.045 Pa·s' },
        { symbol: 'L', name: 'Channel Length', unit: 'mm', objectValue: '6.5 mm' },
      ],
      interactiveCalculator: {
        calculate: (inputs) => {
          const { radiusUm, viscosityMpaS } = inputs;
          const r = radiusUm * 1e-6;
          const mu = viscosityMpaS * 1e-3;
          const dP = 2000; // Pa
          const L = 0.0065; // m
          const Q_m3s = (Math.PI * dP * Math.pow(r, 4)) / (8 * mu * L);
          const Q_mm3s = Q_m3s * 1e9;
          return {
            result: Q_mm3s,
            unit: 'mm³/s',
            formatted: `${Q_mm3s.toFixed(4)} mm³/s`,
            interpretation: Q_mm3s < 0.01 ? 'Ink starvation: Pen will skip during fast writing.' : Q_mm3s > 0.12 ? 'Excessive flow: Pen will bleed through paper and leave ink blobs.' : 'Perfect metering: Crisp line width without blotting.',
          };
        },
        inputs: [
          { key: 'radiusUm', label: 'Capillary Radius (r)', min: 60, max: 200, step: 5, default: 125, unit: 'μm' },
          { key: 'viscosityMpaS', label: 'Sheared Ink Viscosity (μ)', min: 10, max: 150, step: 5, default: 45, unit: 'mPa·s' },
        ],
      },
    },
    {
      id: 'eq-contact-stress',
      title: 'Hertzian Contact Stress on Micro-Ball',
      discipline: 'Mechanical',
      latex: '\\sigma_{max} = \\frac{1}{\\pi} \\left( \\frac{6 \\cdot F \\cdot E^{*2}}{R^2} \\right)^{1/3}',
      explanation: 'Calculates the peak compressive contact stress beneath the 0.7mm tungsten carbide ball when pressing onto a flat surface with writing force F.',
      variables: [
        { symbol: 'σ_max', name: 'Peak Hertzian Stress', unit: 'MPa', objectValue: '185 MPa' },
        { symbol: 'F', name: 'Hand Writing Force', unit: 'N', objectValue: '1.5 N' },
        { symbol: 'R', name: 'Sphere Radius', unit: 'mm', objectValue: '0.35 mm' },
        { symbol: 'E*', name: 'Equivalent Elastic Modulus', unit: 'GPa', objectValue: '14.5 GPa (Paper)' },
      ],
    },
  ],
  manufacturingTimeline: [
    {
      stepNumber: 1,
      stageName: 'Raw Material Preparation',
      description: 'Virgin ABS polymer pellets dried at 80°C for 4 hours to eliminate hydrolytic degradation; CuZn39Pb3 brass drawn into precision precision-straightened wire coils.',
      machinery: 'Dehumidifying Resin Dryer & Wire Straightening Draw Bench',
      tolerance: 'Moisture content < 0.02%',
      materialReq: 'ABS resin MFI 19 / Brass Rod Ø 2.5 mm',
      qualityChecks: ['Melt flow index verification', 'Spectrometric brass alloy assay'],
      commonDefects: ['Moisture splay on molded surfaces', 'Lead segregation in brass'],
    },
    {
      stepNumber: 2,
      stageName: 'Micro-Machining of Brass Tip',
      description: 'Swiss rotary transfer machines perform 12 simultaneous micro-machining operations: boring ink capillary, creating 5 radial oil channels, and profile turning the outer cone.',
      machinery: 'Mikron Multistar CX-24 High-Speed Rotary Transfer CNC',
      tolerance: '±0.002 mm (2 microns)',
      materialReq: 'Leaded Brass',
      qualityChecks: ['100% Optical vision inspection of ball seat depth', 'Air-decay leak test'],
      commonDefects: ['Micro-burrs blocking capillary', 'Eccentric hole runout'],
    },
    {
      stepNumber: 3,
      stageName: 'Tungsten Carbide Ball Lapping & Insertion',
      description: 'Sintered micro-balls are lapped with sub-micron diamond compound, washed in ultrasonic bath, seated into the brass pocket, and the socket lip is cold-crimped at 45° with calibrated roller swagers.',
      machinery: 'Automated Micro-Ball Feeding & Multi-Roller Crimping Machine',
      tolerance: 'Ball clearance: 3.5 ± 0.5 μm',
      materialReq: 'WC-6Co Micro-Balls + Brass Tips',
      qualityChecks: ['Free-rotation torque test under vacuum', 'Microscope crimp rim width'],
      commonDefects: ['Loose ball fallout', 'Pinched ball locked in socket'],
    },
    {
      stepNumber: 4,
      stageName: 'Extrusion & Ink Filling',
      description: 'Polypropylene tube is extruded and cut to length. Ink is metered by positive-displacement syringe pumps, followed by injection of the translucent follower gel seal.',
      machinery: 'Continuous Twin-Screw Extruder + Automated Centrifugal Filling Carousel',
      tolerance: 'Ink volume: 0.60 ± 0.02 mL',
      materialReq: 'PP Tube + Thixotropic Gel Ink + Polybutene Follower',
      qualityChecks: ['Gravimetric scale weight check', 'X-ray bubble detection'],
      commonDefects: ['Air bubbles in ink stream', 'Follower grease bypass'],
    },
    {
      stepNumber: 5,
      stageName: 'High-Speed Centrifugation (De-aeration)',
      description: 'Filled cartridges are loaded into high-G centrifuges spinning at 3,500 RPM for 90 seconds to force ink to the tip and eliminate micro-bubbles.',
      machinery: 'Industrial Batch Centrifuge',
      tolerance: 'Acceleration: 1,800 G',
      materialReq: 'Filled Cartridges',
      qualityChecks: ['Zero gap meniscus test'],
      commonDefects: ['Ink tube burst under hoop stress'],
    },
    {
      stepNumber: 6,
      stageName: 'Injection Molding of Barrel & Cam Mechanism',
      description: 'ABS barrel and POM cam gears are molded in 64-cavity precision steel molds with robotic sprue pickers.',
      machinery: 'Engel All-Electric 150-ton Injection Molding System',
      tolerance: '±0.03 mm',
      materialReq: 'ABS + POM Delrin 500P',
      qualityChecks: ['CMM Coordinate Measurement of cam ramp angles', 'Color delta-E < 0.5'],
      commonDefects: ['Short shot', 'Sink marks on thick bosses'],
    },
    {
      stepNumber: 7,
      stageName: 'Automated High-Speed Assembly & Writing Test',
      description: 'Rotary assembly indexing table feeds spring, cartridge, cam, plunger, and barrel. A robotic writing tester scribes a 100 mm spiral on coated paper to verify immediate ink laydown.',
      machinery: 'Rotary Dial Assembly Machine (120 parts/minute) + Automated Optical Scribe Tester',
      tolerance: 'Assembly cycle: 0.50 s/pen',
      materialReq: 'All finished subcomponents',
      qualityChecks: ['Optical line density scan', 'Click endurance cycle count (5 test cycles)'],
      commonDefects: ['Cam misalignment during press-fit', 'Spring jamming'],
    },
  ],
  relationships: [
    { sourceId: 'thrust-plunger', targetId: 'rotary-cam', interactionType: 'pushes', description: 'Transfers linear downward thumb force to the cam driving teeth.' },
    { sourceId: 'rotary-cam', targetId: 'outer-housing', interactionType: 'locks', description: 'Indexes 45° and drops into the internal locking groove of the barrel.' },
    { sourceId: 'rotary-cam', targetId: 'ink-cartridge-assembly', interactionType: 'pushes', description: 'Translates cartridge forward 3.5 mm against return spring resistance.' },
    { sourceId: 'return-spring', targetId: 'ink-cartridge-assembly', interactionType: 'pushes', description: 'Maintains constant upward restorative force (2.2 N) to keep mechanism loaded.' },
    { sourceId: 'ink-reservoir', targetId: 'brass-socket', interactionType: 'transfers', description: 'Feeds high-viscosity ink through 5 micro-channels via capillary pressure.' },
    { sourceId: 'brass-socket', targetId: 'tungsten-ball', interactionType: 'supports', description: 'Crimped lip retains the micro-ball while permitting omnidirectional rotation.' },
    { sourceId: 'tungsten-ball', targetId: 'ink-reservoir', interactionType: 'transfers', description: 'Pulls a thin hydrodynamic film of ink onto the paper substrate during rolling.' },
  ],
  whatIfParameters: [
    {
      id: 'param-spring-stiffness',
      label: 'Spring Stiffness (k)',
      component: 'Return Spring',
      min: 50,
      max: 350,
      defaultValue: 150,
      unit: 'N/m',
      impactMetrics: [
        {
          name: 'Required Thumb Click Force',
          calculate: (val) => {
            const pct = Math.round(((val - 150) / 150) * 100);
            return {
              changePercent: pct,
              valueStr: `${(val * 0.015 + 1.2).toFixed(1)} N`,
              status: val > 260 ? 'critical' : val < 80 ? 'warning' : 'optimal',
              explanation: val > 260 ? 'Button feels excessively stiff and tires user thumb.' : val < 80 ? 'Spring is too weak; pen may fail to retract when pointed down.' : 'Optimal ergonomic click tactile feel.',
            };
          },
        },
        {
          name: 'Cartridge Retract Speed',
          calculate: (val) => {
            const pct = Math.round(((Math.sqrt(val) - Math.sqrt(150)) / Math.sqrt(150)) * 100);
            return {
              changePercent: pct,
              valueStr: `${(18 / Math.sqrt(val / 150)).toFixed(0)} ms`,
              status: 'optimal',
              explanation: 'Higher stiffness increases restorative snap speed.',
            };
          },
        },
        {
          name: 'Cam Tooth Shear Stress',
          calculate: (val) => {
            const pct = Math.round(((val - 150) / 150) * 85);
            return {
              changePercent: pct,
              valueStr: `${(12.5 * (val / 150)).toFixed(1)} MPa`,
              status: val > 300 ? 'warning' : 'optimal',
              explanation: val > 300 ? 'Approaching POM fatigue limit; cam teeth may strip after 5,000 cycles.' : 'Stress well within Delrin fatigue safe zone (35 MPa).',
            };
          },
        },
      ],
    },
    {
      id: 'param-ball-clearance',
      label: 'Ball Socket Radial Clearance',
      component: 'Writing Tip',
      min: 1.5,
      max: 9.0,
      defaultValue: 3.5,
      unit: 'μm',
      impactMetrics: [
        {
          name: 'Ink Flow Laydown Rate',
          calculate: (val) => {
            const pct = Math.round((Math.pow(val / 3.5, 3) - 1) * 100);
            return {
              changePercent: pct,
              valueStr: `${(0.042 * Math.pow(val / 3.5, 3)).toFixed(3)} mm³/s`,
              status: val > 6.0 ? 'critical' : val < 2.2 ? 'warning' : 'optimal',
              explanation: val > 6.0 ? 'Severe ink leakage and blotting on paper!' : val < 2.2 ? 'Insufficient ink film thickness; pen skips during fast handwriting.' : 'Crisp, razor-sharp 0.35 mm line width.',
            };
          },
        },
        {
          name: 'Rolling Friction Resistance',
          calculate: (val) => {
            const pct = Math.round(((3.5 - val) / 3.5) * 120);
            return {
              changePercent: pct,
              valueStr: `μ = ${(0.04 * (3.5 / val)).toFixed(3)}`,
              status: val < 2.0 ? 'critical' : 'optimal',
              explanation: val < 2.0 ? 'Ball binding in socket causes scratchy paper dragging feel.' : 'Smooth effortless glide across paper fibers.',
            };
          },
        },
      ],
    },
    {
      id: 'param-barrel-wall',
      label: 'Barrel Wall Thickness',
      component: 'Outer Housing',
      min: 0.5,
      max: 1.8,
      defaultValue: 0.9,
      unit: 'mm',
      impactMetrics: [
        {
          name: 'Pen Total Mass',
          calculate: (val) => {
            const pct = Math.round(((val - 0.9) / 0.9) * 55);
            return {
              changePercent: pct,
              valueStr: `${(7.5 + (val - 0.9) * 4.2).toFixed(1)} g`,
              status: 'optimal',
              explanation: 'Heavier body conveys perceived premium feel, but increases resin cost.',
            };
          },
        },
        {
          name: 'Molding Cycle Time',
          calculate: (val) => {
            const pct = Math.round((Math.pow(val / 0.9, 2) - 1) * 100);
            return {
              changePercent: pct,
              valueStr: `${(12.5 * Math.pow(val / 0.9, 2)).toFixed(1)} s`,
              status: val > 1.4 ? 'warning' : 'optimal',
              explanation: 'Cooling time scales quadratically with wall thickness (t²), increasing production costs.',
            };
          },
        },
      ],
    },
  ],
  didYouKnow: [
    'The tungsten carbide sphere inside a fine-point ballpoint pen is manufactured with a sphericity tolerance of ±0.0002 mm (200 nanometers) — comparable to gyroscopes used in space guidance systems.',
    'During standard cursive handwriting, the micro-ball spins at up to 3,000 RPM, experiencing centrifugal forces over 250 Gs on its outer equator.',
    'A single standard Bic ballpoint cartridge contains enough ink to draw a continuous line over 2 to 3 kilometers (1.2 to 1.8 miles) long.',
    'NASA and Soviet cosmonauts initially used pressurized Fisher Space Pens because standard ballpoints rely on gravity and atmospheric pressure to maintain ink flow without vapor lock.',
  ],
  engineersChoice: [
    {
      title: 'Why Leaded Brass for the Tip instead of Stainless Steel?',
      rationale: 'While stainless steel is harder, leaded brass (CuZn39Pb3) allows micro-drilling of Ø0.15mm ink channels in under 0.8 seconds per part without breaking micro-carbide drill bits, reducing tip manufacturing costs by over 70%.',
    },
    {
      title: 'Why Thixotropic Non-Newtonian Ink?',
      rationale: 'Newtonian ink would either drip out of the tip under gravity (if low viscosity) or fail to flow during writing (if high viscosity). Thixotropic ink remains semi-solid at rest (20,000 cP) and liquefies to 50 cP instantly under the high shear rate of the rotating ball.',
    },
    {
      title: 'Why Bistable Cam Ratchet over a Linear Toggle?',
      rationale: 'The 45° rotary indexing cam distributes mechanical wear over 8 separate perimeter ratchet teeth rather than a single pivot point, allowing 100,000+ clicks without mechanism failure.',
    },
  ],
  redesignInsights: {
    simplify: {
      title: 'DFMA Direct-Cap Minimalist Redesign',
      partReduction: '12 parts → 4 parts (66% reduction)',
      description: 'Eliminate the entire 7-piece click mechanism (spring, cam, plunger, ratchet) in favor of a 1-piece snap-on cap with molded breathing vent hole.',
      tradeoffs: 'Removes one-handed click actuation convenience, but slashes unit cost from $0.45 to $0.12 and doubles assembly line throughput.',
    },
    makeItBetter: {
      title: 'Aerospace Grade 5 Titanium + Pressurized Nitrogen Cartridge',
      upgrade: 'CNC machined Ti-6Al-4V chassis with Fisher-style hermetically sealed gas cartridge.',
      performanceGain: 'Writes underwater, in zero gravity, over grease/oil, and across temperatures from -35°C to +120°C.',
      description: 'Replaces plastic barrel with micro-knurled Grade 5 titanium and loads a sliding synthetic rubber piston backed by 3.5 bar nitrogen gas.',
    },
    cheaperVersion: {
      title: 'Ultra-Low Cost Mass Injection Single-Body Pen',
      costReduction: 'Estimated -58% manufacturing cost',
      changes: 'Use single-shot polystyrene hex barrel (like Bic Cristal), eliminate overmolded rubber grip, and use low-cost drawn steel ball.',
      tradeoffs: 'Higher writing friction, less comfortable ergonomics during long writing sessions, non-retractable tip requires protective cap.',
    },
  },
  aiSuggestedQuestions: [
    'Why is tungsten carbide used for the micro-ball instead of hardened stainless steel?',
    'How does the ink know when to flow and why doesn’t it leak when the pen is upside down?',
    'What causes the click mechanism to make that crisp acoustic snap sound?',
    'How are 5 micron-scale ink grooves machined inside a 2mm brass tip without breaking tools?',
    'What engineering formula calculates the required return spring force?',
  ],
};
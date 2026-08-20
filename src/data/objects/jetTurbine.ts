import { ObjectBreakdownData } from '../../types/objectData';

export const jetTurbineData: ObjectBreakdownData = {
  id: 'jet-turbine',
  name: 'High-Bypass Turbofan Engine',
  category: 'Aerospace / Propulsion',
  subtitle: 'High-Bypass Dual-Spool Commercial Jet Turbine',
  heroTagline: 'Single-crystal superalloys, Mach 1.5 fan tips, and thermodynamic Brayton thrust.',
  thumbnail: 'turbine',
  complexityScore: {
    overall: 9.9,
    mechanical: 9.9,
    electrical: 8.8,
    material: 9.9,
    manufacturing: 9.9,
    assembly: 9.9,
  },
  stats: {
    componentCount: 220,
    materialCount: 16,
    manufacturingStages: 28,
    movingParts: 95,
    approxCostUsd: '$12M - $28M',
    productionVolume: '800 - 1,500 units/year',
  },
  summary:
    'A high-bypass commercial turbofan engine produces over 70,000 lbf (310 kN) of thrust with extreme fuel efficiency. Operating at turbine inlet temperatures exceeding 1,600°C (300°C hotter than the melting point of the metal itself), it relies on single-crystal CMSX-4 nickel superalloys, laser-drilled film cooling holes, hollow titanium fan blades, and thermodynamic Brayton gas expansion.',
  engineeringDisciplines: [
    'Aerothermodynamics & Gas Dynamics (Brayton Cycle)',
    'Single-Crystal Metallurgy & High-Temperature Creep Physics',
    'Rotordynamics & High-Energy Fan Blade Containment',
    'Combustion Fluid Dynamics & Laser Film Cooling',
  ],
  rootComponents: [
    {
      id: 'fan-module',
      name: 'Wide-Chord Titanium Fan Blade Module',
      cadId: 'SUB-JET-01',
      category: 'Aerodynamics & Bypass Propulsion',
      meshKey: 'jet-fan',
      explodeVector: [0, 0, 3.8],
      defaultColor: '#38bdf8',
      material: {
        name: 'Superplastically Formed Diffusion Bonded Titanium (Ti-6Al-4V)',
        grade: 'SPF/DB Hollow Ti-6Al-4V',
        type: 'Metal',
        density: '4.43 g/cm³',
        tensileStrength: '950 MPa',
      },
      function: 'Gulps 1.2 metric tons of air per second, generating ~85% of total engine takeoff thrust via bypass flow.',
      manufacturing: {
        process: 'Superplastic Forming and Diffusion Bonding (SPF/DB) of 3 Titanium Sheets with Internal Honeycomb Web Structure',
        machinery: 'High-Temperature SPF Press (900°C Argon Gas Expansion)',
        tolerance: 'Airfoil aerodynamic profile ±0.03 mm',
        defectRisks: ['Internal honeycomb bond void', 'Bird-strike leading edge delamination'],
      },
      dimensions: {
        length: 'Fan Diameter: Ø 2.85 m (112 inches)',
        formatted: 'Ø 2,850 mm (22 Wide-chord hollow blades)',
      },
      mechanicalRole: {
        forces: 'Centrifugal blade pull: ~90 metric tons (equivalent to hanging a Boeing 737 from each blade root!)',
        motion: 'Spins at 2,800 RPM (Blade tips exceed Mach 1.4 at takeoff)',
      },
      connectedTo: ['lp-shaft', 'engine-nacelle'],
      failureModes: [
        {
          mode: 'Fan blade off (FBO) catastrophic release',
          cause: 'Large bird ingestion (e.g. 4 kg Canada goose) at 250 knots.',
          mitigation: 'Kevlar-wrapped composite fan containment casing that absorbs 150 kilojoules of kinetic energy.',
          severity: 'Critical',
        },
      ],
      engineeringReason:
        'Hollow core reduces rotational inertia by 40% compared to solid titanium, allowing rapid engine spool-up during aborted landings (go-arounds).',
      dataConfidence: 'Verified',
    },
    {
      id: 'high-pressure-compressor',
      name: '10-Stage Axial High-Pressure Compressor (HPC)',
      cadId: 'SUB-JET-02',
      category: 'Fluid Compression',
      meshKey: 'jet-compressor',
      explodeVector: [0, 0, 1.5],
      defaultColor: '#94a3b8',
      material: {
        name: 'Titanium (Stages 1-6) & Inconel 718 (Stages 7-10)',
        grade: 'Ti-6246 / Inconel 718',
        type: 'Metal',
        density: '4.6 g/cm³ (Ti) / 8.2 g/cm³ (Inconel)',
      },
      function: 'Squeezes core air by an overall pressure ratio of 45:1, heating air to 650°C before entering the combustion chamber.',
      manufacturing: {
        process: 'Blisk (Bladed Disk) 5-Axis Adaptive CNC Milling from Solid Forged Billet and Linear Friction Welding',
        machinery: 'Starrag 5-Axis Blisk Machining Center',
        tolerance: 'Blade tip clearance: 0.25 ± 0.05 mm',
        defectRisks: ['Compressor stall / aerodynamic surge under crosswind'],
      },
      dimensions: { formatted: '10 rotor stages spinning at 14,500 RPM' },
      mechanicalRole: { forces: 'Axial aerodynamic pressure thrust: ~120 kN' },
      connectedTo: ['combustion-chamber', 'hp-shaft'],
      failureModes: [{ mode: 'Compressor surge / reverse airflow backfire', cause: 'Foreign object damage or severe inlet distortion', mitigation: 'Full-Authority Digital Engine Control (FADEC) active bleed valves', severity: 'High' }],
      engineeringReason: 'Integrally bladed disks (Blisks) eliminate mechanical dovetail root friction and save over 120 kg of rotor mass.',
      dataConfidence: 'Verified',
    },
    {
      id: 'combustion-chamber',
      name: 'Annular Low-Emissions Combustor',
      cadId: 'SUB-JET-03',
      category: 'Thermodynamics & Combustion',
      meshKey: 'jet-combustor',
      explodeVector: [0, 0, -0.5],
      defaultColor: '#f59e0b',
      material: {
        name: 'Hastelloy X with Yttria-Stabilized Zirconia (YSZ) Ceramic Thermal Barrier Coating (TBC)',
        grade: 'Hastelloy X + 7YSZ Ceramic (0.25mm plasma sprayed)',
        type: 'Composite',
        density: '8.22 g/cm³',
      },
      function: 'Mixes atomized Jet-A1 kerosene with compressed air, continuously burning at 2,000°C to generate high-velocity gas expansion.',
      manufacturing: {
        process: 'Laser Powder Bed Fusion (3D Printing) of Swirl Fuel Injectors + Plasma Arc Spraying of Ceramic TBC',
        machinery: 'EOS M400-4 Laser Metal 3D Printer + Sulzer Metco Plasma Spray Booth',
        tolerance: 'Laser drilled cooling holes: Ø 0.40 ± 0.02 mm at 30° compound angle',
        defectRisks: ['Ceramic TBC spallation from thermal cycling'],
      },
      dimensions: { formatted: 'Annular ring with 18 lean-burn fuel nozzles' },
      mechanicalRole: { forces: 'Combustion energy release rate: ~85 Megawatts (enough to power a city of 70,000 people!)' },
      connectedTo: ['high-pressure-compressor', 'high-pressure-turbine'],
      failureModes: [{ mode: 'Combustor liner burn-through', cause: 'Clogged fuel injector nozzle creating localized flame hot streak', mitigation: 'Laser effusion cooling holes creating protective boundary layer air cushion', severity: 'Critical' }],
      engineeringReason: 'Ceramic thermal barrier coating insulates base metal by 150°C, preventing the nickel liner from melting.',
      dataConfidence: 'Verified',
    },
    {
      id: 'high-pressure-turbine',
      name: 'Single-Crystal High-Pressure Turbine (HPT)',
      cadId: 'SUB-JET-04',
      category: 'Extreme Thermodynamics & Creep',
      meshKey: 'jet-turbine',
      explodeVector: [0, 0, -2.5],
      defaultColor: '#f43f5e',
      material: {
        name: 'Single-Crystal 2nd Generation Nickel Superalloy (CMSX-4)',
        grade: 'CMSX-4 (64% Ni, 9% Co, 6.5% Cr, 6% W, 3% Re, 5.6% Al)',
        type: 'Metal',
        density: '8.70 g/cm³',
        tensileStrength: '1050 MPa @ 1000°C',
      },
      function: 'Extracts 45,000 horsepower from 1,600°C gas stream to spin the high-pressure compressor at 15,000 RPM.',
      manufacturing: {
        process: 'Directional Solidification in Vacuum Investment Casting with Helical Crystal Selector to eliminate all grain boundaries, followed by Femtosecond Laser Micro-Drilling of 400+ cooling holes per blade',
        machinery: 'PCC Vacuum Directional Casting Furnace + Trumpf 5-Axis Laser Micro-Drill',
        tolerance: 'Single-crystal crystal orientation [001] within 6°',
        defectRisks: ['Spurious grain nucleation causing premature creep rupture'],
      },
      dimensions: { formatted: 'Rotor Ø 780 mm (72 Single-crystal blades)' },
      mechanicalRole: {
        forces: 'Centrifugal blade pull: 12 metric tons per blade; Operates in gas 300°C above its own alloy melting point!',
        motion: 'Spins at 14,800 RPM',
      },
      connectedTo: ['combustion-chamber', 'hp-shaft'],
      failureModes: [
        {
          mode: 'High-temperature creep elongation / tip rub',
          cause: 'Continuous operation at max takeoff power without adequate turbine blade cooling air.',
          mitigation: 'Internal serpentine cooling channels providing continuous bleed-air film cushion.',
          severity: 'Critical',
        },
      ],
      engineeringReason:
        'Grain boundaries are the weak pathways where metals slide apart under high-temperature creep. Growing each turbine blade as one continuous single metallic crystal eliminates grain boundaries entirely.',
      dataConfidence: 'Verified',
    },
  ],
  materials: [
    {
      name: 'CMSX-4 Single-Crystal Nickel Superalloy',
      percentage: 22,
      color: '#f43f5e',
      category: 'Single-Crystal Superalloy',
      usedIn: ['High-Pressure Turbine Blades & Vanes'],
      properties: [
        { key: 'Melting Point', value: '1,330 °C' },
        { key: 'Max Gas Operating Temp', value: '1,650 °C (with active cooling)' },
        { key: 'Rhenium Content', value: '3.0 wt% Re' },
      ],
      advantages: ['Zero grain boundaries', 'Extreme resistance to high-temperature creep and oxidation'],
      disadvantages: ['Rhenium is one of the rarest elements in Earth’s crust ($4,000/kg)', 'Requires 80-hour vacuum heat treatment cycles'],
      alternatives: ['Inconel 718 (limited to 650°C)', 'Ceramic Matrix Composites (CMC SiC/SiC)'],
      selectionRationale: 'The only class of materials capable of surviving centrifugal loads at temperatures hotter than molten lava.',
    },
  ],
  howItWorks: [
    {
      step: 1,
      title: 'Air Intake & High-Bypass Split',
      description: 'The 2.85-meter titanium fan gulps air. 88% bypasses around the core to generate clean, quiet thrust; 12% enters the core compressor.',
      activeComponentIds: ['fan-module'],
      forcesDescription: 'Bypass ratio: 11:1; Mass airflow: 1,250 kg/second at takeoff.',
    },
    {
      step: 2,
      title: 'Multi-Stage Axial Compression',
      description: 'Air is squeezed by 45 atmospheres of pressure, heating it to 650°C as it enters the annular combustor.',
      activeComponentIds: ['high-pressure-compressor'],
      forcesDescription: 'Compression ratio: 45:1; HPC exit pressure: 4.5 MPa.',
    },
    {
      step: 3,
      title: 'Continuous High-Pressure Combustion',
      description: 'Fuel injectors spray atomized kerosene. Combustion expands the gas to 1,600°C, accelerating flow through turbine nozzle guide vanes.',
      activeComponentIds: ['combustion-chamber'],
      forcesDescription: 'Chemical energy conversion: 85 Megawatts continuous thermal release.',
    },
    {
      step: 4,
      title: 'Turbine Expansion & Thrust Exhaust',
      description: 'High-pressure turbine extracts energy to drive the compressor, and the remaining exhaust gas expands through the converging nozzle at 450 m/s.',
      activeComponentIds: ['high-pressure-turbine'],
      forcesDescription: 'Total takeoff thrust: F_thrust = 310 kN (70,000 lbf).',
    },
  ],
  engineeringEquations: [
    {
      id: 'eq-thrust-equation',
      title: 'Turbojet / Turbofan Net Thrust Equation',
      discipline: 'Fluid Mechanics',
      latex: 'F_{net} = \\dot{m}_{air} (v_{exhaust} - v_{flight}) + (P_{exit} - P_0) A_{exit}',
      explanation: 'Calculates the net forward propulsive thrust force (F_net) generated by accelerating mass airflow through the engine bypass duct and core exhaust nozzle.',
      variables: [
        { symbol: 'F_net', name: 'Net Propulsive Thrust', unit: 'kN', objectValue: '310 kN (70,000 lbf)' },
        { symbol: 'm_dot', name: 'Mass Airflow Rate', unit: 'kg/s', objectValue: '1,250 kg/s' },
        { symbol: 'v_exhaust', name: 'Average Jet Exhaust Velocity', unit: 'm/s', objectValue: '340 m/s' },
        { symbol: 'v_flight', name: 'Aircraft Flight Speed', unit: 'm/s', objectValue: '250 m/s (Mach 0.82)' },
      ],
      interactiveCalculator: {
        calculate: (inputs) => {
          const { massFlowKgS, bypassRatio, exhaustVelMS } = inputs;
          const coreFraction = 1 / (1 + bypassRatio);
          const bypassFraction = bypassRatio / (1 + bypassRatio);
          const vFlight = 250; // m/s (Cruise Mach 0.82)
          const coreThrust = massFlowKgS * coreFraction * (exhaustVelMS * 1.3 - vFlight);
          const fanThrust = massFlowKgS * bypassFraction * (exhaustVelMS * 0.85 - vFlight);
          const totalThrustKn = (coreThrust + fanThrust) / 1000;
          return {
            result: totalThrustKn,
            unit: 'kN',
            formatted: `${totalThrustKn.toFixed(1)} kN (${(totalThrustKn * 224.8).toFixed(0)} lbf)`,
            interpretation: totalThrustKn > 350 ? 'Maximum Takeoff Power rating (Sea level TOGA).' : 'Nominal high-altitude cruise thrust rating.',
          };
        },
        inputs: [
          { key: 'massFlowKgS', label: 'Mass Airflow', min: 800, max: 1800, step: 50, default: 1250, unit: 'kg/s' },
          { key: 'bypassRatio', label: 'Bypass Ratio (BPR)', min: 5, max: 15, step: 0.5, default: 11, unit: ':1' },
          { key: 'exhaustVelMS', label: 'Average Exhaust Velocity', min: 280, max: 480, step: 10, default: 360, unit: 'm/s' },
        ],
      },
    },
  ],
  manufacturingTimeline: [
    {
      stepNumber: 1,
      stageName: 'Single-Crystal Turbine Casting',
      description: 'CMSX-4 alloy melted in vacuum induction furnace and poured into ceramic molds with spiral grain selectors withdrawn at 5 mm/min from 1,550°C thermal gradient.',
      machinery: 'PCC Vacuum Directional Solidification Furnace',
      tolerance: 'Crystal orientation deviation < 6°',
      materialReq: 'CMSX-4 Ingot',
      qualityChecks: ['X-ray Laue back-reflection crystallography scan'],
      commonDefects: ['Freckle grain defects from density segregation'],
    },
  ],
  relationships: [
    { sourceId: 'high-pressure-turbine', targetId: 'high-pressure-compressor', interactionType: 'rotates', description: 'Transfers 45,000 HP through the high-pressure concentric drive shaft.' },
    { sourceId: 'fan-module', targetId: 'high-pressure-compressor', interactionType: 'transfers', description: 'Feeds 12% of compressed bypass air into the high-pressure core inlet.' },
  ],
  whatIfParameters: [
    {
      id: 'param-bypass-ratio',
      label: 'Turbofan Bypass Ratio (BPR)',
      component: 'Fan Module',
      min: 6,
      max: 16,
      defaultValue: 11,
      unit: ':1 BPR',
      impactMetrics: [
        {
          name: 'Specific Fuel Consumption (SFC)',
          calculate: (val) => {
            const pct = Math.round(((11 - val) / 11) * 35);
            return {
              changePercent: -pct,
              valueStr: `${(0.52 * Math.sqrt(11 / val)).toFixed(3)} lb/(lbf·hr)`,
              status: val > 13 ? 'optimal' : 'warning',
              explanation: val > 13 ? 'Ultra-high bypass ratio cuts fuel burn by 12%, but requires massive 3.2m engine nacelle.' : 'Higher fuel consumption at lower BPR.',
            };
          },
        },
      ],
    },
  ],
  didYouKnow: [
    'The gas temperature inside the high-pressure turbine (1,600°C) is hotter than the melting point of the metal itself. The blades survive only because a thin film of cooler air is pumped through hundreds of laser-drilled micro-holes, insulating the blade like an invisible thermal spacesuit.',
    'A single wide-chord fan blade pulls with over 90 metric tons of centrifugal force at takeoff—equivalent to hanging a fully loaded Boeing 737 from its root.',
    'Modern turbofan engines are so reliable that they are certified for ETOPS-330 (Extended-range Twin-engine Operational Performance Standards), allowing flights up to 5.5 hours away from the nearest emergency landing runway on a single engine.',
  ],
  engineersChoice: [
    {
      title: 'Why Single-Crystal Casting instead of Forging for Turbine Blades?',
      rationale: 'Under high centrifugal stress at 1,000°C+, conventional metals fail due to "grain boundary sliding" where microscopic crystal boundaries creep and pull apart. Growing each turbine blade as a single, continuous metallic crystal with zero boundaries prevents creep deformation.',
    },
  ],
  redesignInsights: {
    simplify: {
      title: 'Geared Turbofan (GTF) Planetary Reduction Architecture',
      partReduction: 'Decouples fan speed from low-pressure turbine with a 3:1 planetary reduction gearbox.',
      description: 'Allows the fan to spin at slower, quieter speeds (2,000 RPM) while the turbine spins at maximum aerodynamic efficiency (10,000 RPM).',
      tradeoffs: 'Adds high-torque planetary gearbox requiring 30 kW oil cooling heat exchanger.',
    },
    makeItBetter: {
      title: 'Ceramic Matrix Composite (CMC) Silicon-Carbide Turbine Shrouds',
      upgrade: 'Replaces nickel superalloy vanes with SiC/SiC ceramic matrix composites.',
      performanceGain: 'Operates at 1,300°C without requiring cooling bleed air, saving 2% fuel burn and cutting weight by 66%.',
      description: 'Woven silicon-carbide fibers embedded in silicon-carbide ceramic matrix.',
    },
    cheaperVersion: {
      title: 'Solid Titanium Blades with Polyimide Acoustic Liners',
      costReduction: 'Estimated -35% fan module manufacturing cost',
      changes: 'Use solid milled titanium blades instead of superplastically formed hollow diffusion-bonded blades.',
      tradeoffs: 'Increases engine weight by 450 kg, worsening aircraft payload capacity.',
    },
  },
  aiSuggestedQuestions: [
    'How do jet turbine blades survive inside 1,600°C gas without melting?',
    'What is a single-crystal superalloy and how is it grown in a vacuum furnace?',
    'Why do modern commercial airliners use ultra-high bypass ratios instead of pure turbojets?',
    'What happens when a commercial jet engine ingests a large bird at 250 knots?',
    'How does the FADEC computer manage fuel flow and surge bleed valves in real time?',
  ],
};

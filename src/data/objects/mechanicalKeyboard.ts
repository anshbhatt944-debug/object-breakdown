import { ObjectBreakdownData } from '../../types/objectData';

export const mechanicalKeyboardData: ObjectBreakdownData = {
  id: 'mechanical-keyboard',
  name: 'Mechanical Keyboard (Custom Switch)',
  category: 'Electromechanical',
  subtitle: 'Linear / Tactile Mechanical Switch & Acoustic Gasket Board',
  heroTagline:
    'Micro-contact physics, progressive spring kinetics, acoustic Helmholtz cavity resonance, and gasket vibration isolation.',
  thumbnail: 'keyboard',
  complexityScore: {
    overall: 8.4,
    mechanical: 8.8,
    electrical: 7.9,
    material: 8.5,
    manufacturing: 8.7,
    assembly: 8.3,
  },
  stats: {
    componentCount: 52,
    materialCount: 8,
    manufacturingStages: 10,
    movingParts: 8,
    approxCostUsd: '$65 - $320 (Custom Gasket Class)',
    productionVolume: '180M+ switches / 12M keyboards/year',
  },
  summary:
    'A high-performance mechanical keyboard utilizes discrete electromechanical keyswitches mounted on an acoustically isolated gasket plate and high-speed microcontroller matrix. Each switch features a self-lubricating polyoxymethylene (POM) stem gliding inside an optical polycarbonate upper housing and high-crystallinity Polyamide 66 base. Keystroke resistance is governed by a 24K gold-plated progressive music wire spring, while electrical signal closure is achieved via stamped CuSn6 phosphor bronze contact leaves with micro-welded pure gold crosspoint rivets. Vibrational energy from keystroke impacts is absorbed by multi-layer Poron XRD foam gaskets and an FR4 flex-cut PCB with Kailh hot-swap sockets, eliminating harsh case acoustics and delivering the signature acoustic "thock" sound profile.',
  engineeringDisciplines: [
    'Electromechanical Contact Mechanics & Micro-Asperity Holm Debounce Physics',
    'Polymer Tribology & Self-Lubricating POM/Polyamide Dissimilar Material Pairing',
    'Rotational & Axial Spring Dynamics (Wahl Stress Correction & Progressive Pitch)',
    'Acoustic Wave Propagation & Helmholtz Cavity Resonant Frequency Damping',
    'High-Speed Microcontroller Matrix Multiplexing & Optical Anti-Ghosting NKRO',
    'Sub-Millimeter Progressive Stamping & Gold-Inlay Precision Micro-Welding',
  ],
  rootComponents: [
    // -------------------------------------------------------------
    // SUBASSEMBLY 1: KEYCAP & ERGONOMIC TOUCHPOINT
    // -------------------------------------------------------------
    {
      id: 'keycap-subassembly',
      name: 'Keycap & Ergonomic Touchpoint Subassembly',
      cadId: 'SUB-KEY-01',
      category: 'Ergonomics & Kinematics',
      meshKey: 'key-stem',
      explodeVector: [0, 4.2, 0],
      defaultColor: '#1e293b',
      material: {
        name: 'Double-Shot Polybutylene Terephthalate (PBT)',
        grade: 'PBT-GF15 (Sabic Valox 357)',
        type: 'Polymer',
        density: '1.34 g/cm³',
        tensileStrength: '85 MPa',
        elasticModulus: '3.2 GPa',
        hardness: 'Rockwell R118',
        wearResistance: 'Superior (Taber abrasion loss < 12 mg/1k cycles)',
      },
      function:
        'Interfaces directly with the typist fingertip, translating finger strike momentum into 4.0 mm axial linear travel with zero rotational binding or off-axis wobble.',
      manufacturing: {
        process: 'Two-Color Double-Shot Injection Molding with Mirror Polished Tooling',
        machinery: 'Sumitomo SE-EV 100-Ton All-Electric Precision Injection Molding Press',
        tolerance: 'Cruciform Stem Mount Tolerance: 4.00 +0.02 / -0.00 mm',
        defectRisks: [
          'Legend color bleed through parting line',
          'Differential volumetric shrinkage warp along spacebar axis',
          'Sink marks above cruciform stem ribs',
        ],
        cycleTime: '18.4 seconds per 1U keycap pair',
      },
      dimensions: {
        length: '18.2 mm',
        diameter: '18.2 mm',
        thickness: '1.5 mm wall thickness',
        weight: '1.42 grams',
        formatted: '18.2 × 18.2 × 11.5 mm (1.5 mm double-shot structural wall)',
      },
      mechanicalRole: {
        forces: 'Finger strike dynamic impact: 0.45 N to 2.8 N (Peak bottom-out load: ~3.5 N)',
        contactPressure: 'Peak fingertip contact pressure: 0.18 MPa',
        motion: '4.0 mm pure vertical axial displacement with < 0.25° off-axis tilt',
      },
      connectedTo: ['switch-module'],
      failureModes: [
        {
          mode: 'Keycap stem cruciform cracking / splitting',
          cause: 'Excessive interference fit with oversized aftermarket switch stem cruciform (> 4.08 mm).',
          mitigation: 'Incorporate 0.5° molded relief chamfers and FEA-optimized cruciform gussets.',
          severity: 'Medium',
        },
        {
          mode: 'Surface glossing / finger lipid shine wear',
          cause: 'Abrasive finger friction over 50M keystrokes (common on ABS plastic).',
          mitigation: 'Formulate high-crystallinity PBT with micro-textured EDM mold surface (VDI 27 / Ra 1.8 µm).',
          severity: 'Low',
        },
      ],
      engineeringReason:
        'PBT possesses superior chemical resistance to skin oils (sebum, fatty acids) compared to ABS, preserving its matte micro-texture over hundreds of millions of actuation cycles while adding structural mass that lowers the acoustic resonant frequency.',
      dataConfidence: 'Verified',
      technicalNotes: [
        'OEM profile keycaps feature sculpted spherical row angles (R1 through R4) ranging from 1° to 12° forward rake to minimize finger metacarpophalangeal joint strain.',
        'Wall thickness of 1.50 mm (vs 0.85 mm on cheap keyboards) increases mass by 65%, shifting the acoustic bottom-out resonance from 1.2 kHz down to 420 Hz for a deep "thock" timbre.',
      ],
      designPrinciples: [
        'Maintain uniform wall thickness around cruciform ribs to prevent cooling shrinkage voids.',
        'Use dissimilar colored resin core molded during Shot 1 that physically interlocks through the outer shell during Shot 2.',
      ],
      interfaces: [
        'Cherry MX cruciform cross-mount (+)',
        'Fingertip ergonomic spherical dish',
      ],
      inspectionPoints: [
        'Optical coordinate measuring machine (CMM) scan of cruciform cross width (4.00 ± 0.015 mm)',
        'Spectrophotometer CIELAB color delta E < 0.5 across keycap sets',
      ],
      children: [
        {
          id: 'pbt-keycap',
          name: 'Double-Shot PBT Keycap (OEM Profile)',
          cadId: 'PART-KEY-01A',
          category: 'Ergonomics',
          meshKey: 'keycap-top',
          explodeVector: [0, 4.2, 0],
          defaultColor: '#1e293b',
          material: {
            name: 'PBT Thermoplastic Resin',
            grade: 'Sabic Valox 357 PBT-GF15',
            type: 'Polymer',
            density: '1.34 g/cm³',
            tensileStrength: '85 MPa',
            hardness: 'Rockwell R118',
          },
          function:
            'Receives typist kinetic strike and couples directly into the switch stem cruciform post.',
          manufacturing: {
            process: 'Two-Color Double-Shot Injection Molding',
            machinery: 'Engel 2K Duo All-Electric 120-Ton Press',
            tolerance: '±0.02 mm',
            defectRisks: ['Legend misalignment', 'Sink marks'],
          },
          dimensions: { formatted: '18.2 × 18.2 × 11.5 mm (1.5 mm wall thickness)' },
          mechanicalRole: { forces: 'Dynamic finger strike impact 0.5 - 2.8 N' },
          connectedTo: ['switch-stem'],
          failureModes: [
            {
              mode: 'Cruciform cross mount cracking',
              cause: 'Extreme keycap puller torsion or off-axis switch pull',
              mitigation: 'Chamfered internal lead-in draft angle',
              severity: 'Low',
            },
          ],
          engineeringReason:
            'Double-shot molding bonds the legend permanently through the keycap wall, guaranteeing the letter can never wear off even after 100 million keystrokes.',
          dataConfidence: 'Verified',
        },
      ],
    },

    // -------------------------------------------------------------
    // SUBASSEMBLY 2: MX PRECISION ELECTROMECHANICAL SWITCH MODULE
    // -------------------------------------------------------------
    {
      id: 'switch-module',
      name: 'MX Precision Electromechanical Switch Assembly',
      cadId: 'SUB-KEY-02',
      category: 'Kinematics & Electrical Contacts',
      meshKey: 'switch-stem-cross',
      explodeVector: [0, 1.8, 0],
      defaultColor: '#ef4444',
      material: {
        name: 'Dissimilar Polymer Tribology Blend (POM, PC, Nylon PA66)',
        grade: 'Delrin 500P + Makrolon 2805 + Zytel 101L',
        type: 'Polymer',
        density: '1.42 g/cm³ (POM) / 1.20 g/cm³ (PC) / 1.14 g/cm³ (PA66)',
        tensileStrength: '72 MPa (POM) / 82 MPa (PA66)',
        wearResistance: 'Dynamic sliding friction coefficient µ = 0.08 with Krytox GPL 205g0',
      },
      function:
        'Translates downward key depression into precision electrical contact closure at 2.0 mm travel while regulating return force and acoustics.',
      manufacturing: {
        process: 'Automated 180 PPM Rotary Indexing Assembly & Micro-Volume Lubricant Jetting',
        machinery: 'Mikron High-Speed Automated Switch Assembly Line',
        tolerance: 'Pre-Travel Actuation Point: 2.00 ± 0.15 mm; Total Stroke: 4.00 ± 0.20 mm',
        defectRisks: [
          'Contact leaf spring de-temper during automated riveting',
          'Uneven lubricant dispensing (< 3 µL variance)',
          'Top housing snap-latch tab stress whitening',
        ],
        cycleTime: '0.33 seconds per assembled switch',
      },
      dimensions: {
        length: '15.6 mm',
        diameter: '15.6 mm',
        thickness: '18.5 mm total height with pins',
        weight: '2.15 grams',
        formatted: '15.6 × 15.6 × 18.5 mm (Standard MX Footprint)',
      },
      mechanicalRole: {
        forces: 'Actuation force: 45 cN (Linear) / 55 cN (Tactile bump); Bottom-out force: 62 cN',
        motion: '4.0 mm guided linear stroke along dual housing side rails',
      },
      connectedTo: ['keycap-subassembly', 'plate-gasket-assembly', 'pcb-matrix-assembly'],
      failureModes: [
        {
          mode: 'Key chatter / erratic double-triggering',
          cause: 'Microscopic oxide film or contact leaf bounce exceeding firmware debounce duration.',
          mitigation: 'Pure gold crosspoint inlay contacts (0.05 mm thick) + 5ms digital debounce timer.',
          severity: 'High',
        },
        {
          mode: 'Keystroke scratchiness / stick-slip binding',
          cause: 'Micro-scratches on slider rails or unlubricated crystalline polymer contact.',
          mitigation: 'Precision-milled mirror mold cores (Ra 0.05 µm) + factory automated Krytox 205g0 lubing.',
          severity: 'Medium',
        },
      ],
      engineeringReason:
        'Combining a POM stem with a Nylon base housing and Polycarbonate top housing utilizes dissimilar polymer pairing: identical polymers sliding against each other exhibit stick-slip friction and micro-galling, whereas POM against Nylon yields an ultra-low dynamic friction coefficient (µ = 0.08).',
      dataConfidence: 'Verified',
      children: [
        {
          id: 'switch-top-housing',
          name: 'Polycarbonate Optical Upper Switch Housing',
          cadId: 'PART-SW-TOP-02A',
          category: 'Housing Enclosure',
          meshKey: 'switch-stem-cross',
          explodeVector: [0, 2.6, 0],
          defaultColor: '#38bdf8',
          material: {
            name: 'Optical-Grade Polycarbonate (PC)',
            grade: 'Bayer Makrolon 2805',
            type: 'Polymer',
            density: '1.20 g/cm³',
            tensileStrength: '70 MPa',
            elasticModulus: '2.4 GPa',
            hardness: 'Rockwell M70',
          },
          function:
            'Encloses internal switch mechanism, guides stem slider upper rails, retains 4 perimeter snap tabs, and features an optical lens tunnel for SMD LED backlight transmission.',
          manufacturing: {
            process: 'High-Precision Micro-Injection Molding with Optical Mirror Polish',
            machinery: 'Fanuc Roboshot S-100iA Electric Injection Press',
            tolerance: 'Stem Guide Rail Width: 4.05 ± 0.012 mm',
            defectRisks: ['Internal stress birefringence', 'Flash along mold parting line'],
          },
          dimensions: { formatted: '15.6 × 15.6 × 8.5 mm (1.2 mm wall thickness)' },
          mechanicalRole: { forces: 'Stem top-out rebound impact: 0.35 N' },
          connectedTo: ['switch-stem', 'switch-bottom-housing'],
          failureModes: [
            {
              mode: 'Retention snap tab fracture',
              cause: 'Opening switch housing with rigid metal switch opener tool',
              mitigation: 'Optimize PC impact modifier blend for 12% elongation at break',
              severity: 'Medium',
            },
          ],
          engineeringReason:
            'Polycarbonate provides high optical clarity for RGB LED transmission, exceptional dimensional rigidity, and a sharp, clean sound profile on stem upstroke return.',
          dataConfidence: 'Verified',
        },
        {
          id: 'switch-stem',
          name: 'POM Self-Lubricating Cross Stem Slider',
          cadId: 'PART-SW-STEM-02B',
          category: 'Kinematics',
          meshKey: 'switch-stem-cross',
          explodeVector: [0, 1.5, 0],
          defaultColor: '#ef4444',
          material: {
            name: 'Polyoxymethylene (POM / Acetal Copolymer)',
            grade: 'Celanese Hostaform C9021 with PTFE 5%',
            type: 'Polymer',
            density: '1.42 g/cm³',
            tensileStrength: '68 MPa',
            elasticModulus: '2.8 GPa',
            wearResistance: 'Friction coefficient µ = 0.08 against Polyamide',
          },
          function:
            'Glides axially down housing guide rails, holds MX cross mount for keycap, depresses helical spring with center cylindrical pole, and deflects electrical leaf contact with engineered cam ramp legs.',
          manufacturing: {
            process: 'Multi-Cavity Micro Injection Molding with Sub-Gate Tooling',
            machinery: 'Sumitomo SE50EV-A All-Electric Micro Molding Cell',
            tolerance: 'Rail Guide Clearance: 0.035 ± 0.008 mm',
            defectRisks: ['Slider rail mold parting flash', 'Ejector pin indentation on cam leg'],
          },
          dimensions: { formatted: '13.5 × 11.0 × 6.8 mm (Cross Mount 4.00 mm)' },
          mechanicalRole: {
            forces: 'Bottom-out deceleration shock: 180 m/s²; Cam contact wipe: 0.15 N normal force',
            motion: '4.0 mm pure linear stroke (2.0 mm pre-travel to actuation)',
          },
          connectedTo: ['switch-spring', 'switch-contact-leaf', 'switch-top-housing'],
          failureModes: [
            {
              mode: 'Tactile bump roughness / scratchiness',
              cause: 'Micro-burrs on cam legs dragging across phosphor bronze leaf',
              mitigation: 'High-speed dry ice blast deburring + Krytox 205g0 thin-film lubrication',
              severity: 'Medium',
            },
          ],
          engineeringReason:
            'POM exhibits self-lubricating surface tribology and high stiffness. When the stem center pole strikes the bottom housing floor, its hardness governs the fundamental acoustic frequency of the keystroke.',
          dataConfidence: 'Verified',
        },
        {
          id: 'switch-spring',
          name: '24K Gold-Plated Progressive Helical Spring',
          cadId: 'PART-SW-SPRG-02C',
          category: 'Kinematics & Energy Storage',
          meshKey: 'key-spring',
          explodeVector: [0, 0.8, 0],
          defaultColor: '#fbbf24',
          material: {
            name: 'High-Carbon Stainless Music Spring Wire with 24K Gold Flash',
            grade: 'SUS304-WPB / JIS G4314 + 0.05 µm Au Electroplate',
            type: 'Metal',
            density: '7.85 g/cm³',
            tensileStrength: '2,150 MPa',
            elasticModulus: '198 GPa',
          },
          function:
            'Provides restoring elastic force curve for key return (35 cN initial preload, 45 cN actuation, 62 cN bottom-out) and cushions finger deceleration.',
          manufacturing: {
            process: 'CNC High-Speed Coil Winding + 380°C Stress-Relief Annealing + Barrel Gold Plating',
            machinery: 'Wafios FMU 1.7 Multi-Axis CNC Spring Coiling Center',
            tolerance: 'Spring Force Variance: ±1.5 cN; Free Length: 15.00 ± 0.10 mm',
            defectRisks: ['Spring ping acoustic harmonic resonance', 'Coil pitch asymmetry'],
          },
          dimensions: { formatted: 'OD Ø 3.90 mm × Free Length 15.0 mm (Wire Ø 0.22 mm, 12 Coils)' },
          mechanicalRole: {
            forces: 'Elastic preload: 0.34 N; Actuation: 0.44 N; Bottom-out: 0.61 N; Spring rate k = 27.5 N/m',
            motion: 'Pure axial compression along switch center guide post',
          },
          connectedTo: ['switch-stem', 'switch-bottom-housing'],
          failureModes: [
            {
              mode: 'Spring ping / acoustic ringing',
              cause: 'High-frequency longitudinal standing waves excited by rapid stem release.',
              mitigation: 'Donut-dip lubrication of spring ends with Krytox GPL 105 high-viscosity oil.',
              severity: 'Low',
            },
          ],
          engineeringReason:
            '24K gold flash electroplating prevents micro-fretting corrosion, eliminates steel oxidation, and reduces dynamic friction against the POM stem post.',
          dataConfidence: 'Verified',
        },
        {
          id: 'switch-contact-leaf',
          name: 'Phosphor Bronze Gold-Crosspoint Contact Leaf',
          cadId: 'PART-SW-LEAF-02D',
          category: 'Electrical Contacts',
          meshKey: 'key-leaf',
          explodeVector: [1.8, -0.2, 0],
          defaultColor: '#d97706',
          material: {
            name: 'Deoxidized Phosphor Bronze with Pure Gold Crosspoint Rivets',
            grade: 'CuSn6 (C5191 / CW452K) + 99.99% Au Micro-Inlay',
            type: 'Metal',
            density: '8.80 g/cm³',
            tensileStrength: '620 MPa',
            elasticModulus: '115 GPa',
            electricalConductivity: '13% IACS (7.5 × 10⁶ S/m)',
          },
          function:
            'Acts as electrical switch contact: movable leaf is deflected by stem cam ramp until its micro-welded gold prism crosses the static leaf, completing the matrix circuit.',
          manufacturing: {
            process: 'High-Speed Progressive Stamping, Automated Micro-Forming & Gold Crosspoint Rivet Laser Welding',
            machinery: 'Yamada TDP-30 High-Speed Progressive Stamping Press (800 strokes/min)',
            tolerance: 'Contact Separation Gap: 0.42 ± 0.025 mm; Contact Force: 0.15 ± 0.02 N',
            defectRisks: [
              'Contact bounce duration > 3.0 ms causing key chatter',
              'Loss of elastic temper during forming bends',
            ],
          },
          dimensions: { formatted: '11.5 × 4.8 × 0.15 mm Stamped Leaf with Dual Prismatic Rivets' },
          mechanicalRole: {
            forces: 'Contact wiping normal force: 0.15 N (Self-cleaning wiping action over 0.2 mm stroke)',
          },
          connectedTo: ['switch-stem', 'switch-bottom-housing', 'pcb-matrix-assembly'],
          failureModes: [
            {
              mode: 'Contact chatter / bounce double-triggering',
              cause: 'Fretting wear or mechanical resonance of thin leaf blade.',
              mitigation: 'Prismatic crosspoint contact geometry + firmware digital debounce filter.',
              severity: 'High',
            },
          ],
          engineeringReason:
            'Crosspoint geometry concentrates the contact force onto a microscopic 90° intersection of two cylindrical gold prisms, generating immense localized contact pressure that cuts through airborne dust and silicone contamination for 100M+ reliable actuations.',
          dataConfidence: 'Verified',
        },
        {
          id: 'switch-bottom-housing',
          name: 'Nylon PA66 Acoustic Base Housing & Terminal Pins',
          cadId: 'PART-SW-BASE-02E',
          category: 'Structural Base',
          meshKey: 'switch-stem-cross',
          explodeVector: [0, -0.2, 0],
          defaultColor: '#0f172a',
          material: {
            name: 'Polyamide 66 (Nylon PA66) with PTFE & Acoustic Mineral Filler',
            grade: 'DuPont Zytel 101L / PA66-GF10',
            type: 'Polymer',
            density: '1.14 g/cm³',
            tensileStrength: '82 MPa',
            elasticModulus: '3.0 GPa',
            hardness: 'Rockwell R120',
          },
          function:
            'Forms structural chassis of the switch, seats gold-plated spring in central well, holds contact leaf via heat-staking, locks into switch plate, and inserts 5 PCB mounting pins into circuit board.',
          manufacturing: {
            process: 'Precision Multi-Cavity Micro Injection Molding with Automated In-Mold Pin Heat-Staking',
            machinery: 'Nissei NEX80-9E All-Electric Injection Molding Machine',
            tolerance: 'Plate Snap Cutout Width: 14.00 ± 0.025 mm; PCB Pin Pitch: ±0.03 mm',
            defectRisks: ['Terminal pin bending during packaging', 'Center well shrinkage eccentricity'],
          },
          dimensions: { formatted: '15.6 × 15.6 × 10.0 mm Base with 5-Pin PCB Mount Posts' },
          mechanicalRole: {
            forces: 'Withstands bottom-out stem shock pulse of ~2.5 N with high acoustic damping',
          },
          connectedTo: ['switch-spring', 'switch-contact-leaf', 'switch-plate', 'pcb-matrix-assembly'],
          failureModes: [
            {
              mode: 'Terminal pin bending / buckling',
              cause: 'Misaligned insertion into hot-swap socket on PCB.',
              mitigation: 'Form pins from high-temper C5191 phosphor bronze with reinforced root fillets.',
              severity: 'Medium',
            },
          ],
          engineeringReason:
            'Polyamide PA66 has high internal loss factor (damping coefficient tan δ = 0.04), absorbing high-frequency impact vibrations when the stem bottoms out and producing a signature low-pitched acoustic "thock" instead of a sharp high-pitched clack.',
          dataConfidence: 'Verified',
        },
      ],
    },

    // -------------------------------------------------------------
    // SUBASSEMBLY 3: ACOUSTIC ISOLATION & FLEX-PLATE ASSEMBLY
    // -------------------------------------------------------------
    {
      id: 'plate-gasket-assembly',
      name: 'Flex-Cut Mounting Plate & Poron Gasket Assembly',
      cadId: 'SUB-KEY-03',
      category: 'Structural & Acoustic Damping',
      meshKey: 'key-plate',
      explodeVector: [0, -1.2, 0],
      defaultColor: '#334155',
      material: {
        name: 'CNC Polycarbonate / FR4 Flex Plate + Poron XRD Polyurethane Gasket',
        grade: 'Optical Polycarbonate (1.5mm) + Rogers Poron XRD Foam (3.0mm)',
        type: 'Composite',
        density: '1.20 g/cm³ (Plate) / 0.24 g/cm³ (Poron)',
        elasticModulus: '2.4 GPa (Plate) / 0.08 MPa (Poron Foam)',
      },
      function:
        'Mechanically retains 82 individual switch modules in precise 19.05 mm grid spacing while isolating the typing deck from the rigid keyboard chassis via soft elastomeric perimeter gaskets.',
      manufacturing: {
        process: 'High-Precision CNC Router Milling with Diamond Cutters + Laser Kiss-Cut Foam Lamination',
        machinery: 'Datron M8Cube High-Speed CNC Machining Center (60,000 RPM spindle)',
        tolerance: 'Switch Cutout Windows: 14.00 ± 0.025 mm; Gasket Compression Clearance: 1.2 mm',
        defectRisks: ['Stress crazing around flex cuts', 'Foam adhesive peeling under thermal cycling'],
        cycleTime: '3.2 minutes per 75% keyboard plate',
      },
      dimensions: {
        length: '314.0 mm',
        diameter: '130.0 mm',
        thickness: '1.50 mm plate thickness',
        weight: '68.0 grams',
        formatted: '314.0 × 130.0 × 1.50 mm with Leaf-Spring Flex Relief Tabs',
      },
      mechanicalRole: {
        forces: 'Dynamic typing flex deflection: 1.2 to 1.8 mm under heavy keystroke loads',
        motion: 'Floating vertical compliance; suppresses acoustic transmission to aluminum case',
      },
      connectedTo: ['switch-module', 'pcb-matrix-assembly'],
      failureModes: [
        {
          mode: 'Gasket permanent compression set',
          cause: 'Poor quality EVA/silicone foam losing resilience after 1 year of continuous typing.',
          mitigation: 'Specify authentic Rogers Poron XRD microcellular foam (< 2% compression set).',
          severity: 'Low',
        },
      ],
      engineeringReason:
        'Gasket mounting decouples the typing plate from the metal case enclosure, converting rigid point-load stress concentrations into distributed shear deformation and absorbing high-frequency acoustic resonances.',
      dataConfidence: 'Verified',
      children: [
        {
          id: 'switch-plate',
          name: 'CNC Polycarbonate Flex-Cut Mounting Plate',
          cadId: 'PART-PLT-03A',
          category: 'Structural',
          meshKey: 'key-plate',
          explodeVector: [0, -1.2, 0],
          defaultColor: '#334155',
          material: {
            name: 'Polycarbonate Optical Sheet',
            grade: 'Lexan 9034 (1.5 mm)',
            type: 'Polymer',
            density: '1.20 g/cm³',
            tensileStrength: '65 MPa',
          },
          function: 'Locks switch perimeter tabs securely at 14.0 mm square openings with leaf-spring relief cuts.',
          manufacturing: {
            process: 'Multi-Axis CNC Routing with Solid Carbide Downcut Endmills',
            machinery: 'Datron Neo High-Speed CNC',
            tolerance: 'Switch Cutout: 14.00 ± 0.025 mm',
            defectRisks: ['Chipped flex-cut web'],
          },
          dimensions: { formatted: '314.0 × 130.0 × 1.50 mm (75% Form Factor)' },
          mechanicalRole: { forces: 'Plate bending flexure: 1.4 mm max deflection' },
          connectedTo: ['switch-bottom-housing', 'switch-gasket'],
          failureModes: [
            {
              mode: 'Switch loose fit / plate wobble',
              cause: 'Cutout dimension exceeding 14.08 mm',
              mitigation: 'Laser micrometer inspection during CNC routing',
              severity: 'Medium',
            },
          ],
          engineeringReason:
            'Polycarbonate flex cuts soften finger impact deceleration at bottom-out, significantly reducing typist RSI finger fatigue during extended typing sessions.',
          dataConfidence: 'Verified',
        },
        {
          id: 'switch-gasket',
          name: 'Rogers Poron XRD Acoustic Gasket Dampeners',
          cadId: 'PART-GSK-03B',
          category: 'Acoustic Damping',
          meshKey: 'key-gasket',
          explodeVector: [0, -1.2, 0],
          defaultColor: '#18181b',
          material: {
            name: 'Microcellular Open-Cell Polyurethane Foam',
            grade: 'Rogers Poron XRD-15250 (3.0 mm)',
            type: 'Elastomer',
            density: '0.24 g/cm³',
            hardness: 'Shore 00 48',
          },
          function: 'Suspends plate tabs along perimeter of CNC aluminum case to isolate mechanical vibrations.',
          manufacturing: {
            process: 'Rotary Die Cutting & 3M 9448A Adhesive Pre-Lamination',
            machinery: 'Rotary Die Converter',
            tolerance: '±0.10 mm strip thickness',
            defectRisks: ['Adhesive misalignment'],
          },
          dimensions: { formatted: '12 Strips: 18.0 × 4.5 × 3.0 mm (Compressed to 1.8 mm)' },
          mechanicalRole: { forces: 'Absorbs 85% of keystroke shock kinetic energy' },
          connectedTo: ['switch-plate'],
          failureModes: [
            {
              mode: 'Uneven board stiffness across perimeter',
              cause: 'Non-uniform gasket spacing',
              mitigation: 'FEA modal placement of gasket tabs at vibration nodes',
              severity: 'Low',
            },
          ],
          engineeringReason:
            'Open-cell Poron foam has high hysteresis damping, dissipating kinetic energy as microscopic heat rather than acoustic soundwaves.',
          dataConfidence: 'Verified',
        },
      ],
    },

    // -------------------------------------------------------------
    // SUBASSEMBLY 4: ELECTRONICS MATRIX & HOT-SWAP SUBSTRATE
    // -------------------------------------------------------------
    {
      id: 'pcb-matrix-assembly',
      name: '4-Layer FR4 PCB Matrix & Kailh Hot-Swap Subassembly',
      cadId: 'SUB-KEY-04',
      category: 'Electronics & Firmware',
      meshKey: 'key-pcb',
      explodeVector: [0, -2.6, 0],
      defaultColor: '#065f46',
      material: {
        name: 'High-Tg FR4 Glass Epoxy Laminate + 2oz Oxygen-Free Copper',
        grade: 'Shengyi S1000-2 (Tg = 170°C, ENIG Gold Finish)',
        type: 'Composite',
        density: '1.85 g/cm³',
        electricalConductivity: '5.8 × 10⁷ S/m (Copper Traces)',
      },
      function:
        'Scans the 8×16 key electrical switch matrix at 1,000 Hz / 8,000 Hz polling rate, executes anti-ghosting matrix diodes, houses Kailh hot-swap sockets, and powers per-key RGB backlighting.',
      manufacturing: {
        process: 'Photolithography, Multi-Layer Lamination, Laser Micro-Drilling, ENIG Gold Plating & SMT Pick-and-Place',
        machinery: 'Yamaha YRM20 High-Speed Chip Mounter + Heller 8-Zone Nitrogen Reflow Oven',
        tolerance: 'Impedance Control: 90 Ω ± 10% (USB 2.0 Differential Pair); Trace Width: 0.12 mm',
        defectRisks: [
          'Solder bridges on 0.5 mm pitch microcontroller pins',
          'Torn hot-swap solder pads from misaligned switch pin insertion',
        ],
        cycleTime: '45 seconds per panel assembly',
      },
      dimensions: {
        length: '315.0 mm',
        diameter: '125.0 mm',
        thickness: '1.60 mm (Optional 1.2 mm flex-cut)',
        weight: '115.0 grams',
        formatted: '315.0 × 125.0 × 1.60 mm (4-Layer 2oz Copper ENIG)',
      },
      mechanicalRole: {
        forces: 'Hot-swap socket insertion retention force: 12 N; Extraction force: 8 N',
      },
      connectedTo: ['switch-module', 'plate-gasket-assembly'],
      failureModes: [
        {
          mode: 'Hot-swap socket ripped off PCB pad',
          cause: 'User forcing a switch with bent pins into hot-swap socket, tearing surface mount copper pad.',
          mitigation: 'Reinforce socket pads with through-hole plated via stitching + backplate solder fillet.',
          severity: 'High',
        },
        {
          mode: 'Electrostatic Discharge (ESD) MCU latch-up',
          cause: 'Typist static discharge (up to 8 kV) through aluminum case.',
          mitigation: 'Incorporate USBLC6-2SC6 ultra-low capacitance TVS diode array on USB lines.',
          severity: 'Critical',
        },
      ],
      engineeringReason:
        'Individual 1N4148 fast-switching diodes in series with every single switch prevent phantom sneak-path currents across matrix intersections, guaranteeing Full N-Key Rollover (NKRO) where all 82 keys can be pressed simultaneously with zero missed or ghosted inputs.',
      dataConfidence: 'Verified',
      children: [
        {
          id: 'pcb-assembly',
          name: '4-Layer FR4 Keyboard PCB Substrate',
          cadId: 'PART-PCB-04A',
          category: 'Electronics',
          meshKey: 'key-pcb',
          explodeVector: [0, -2.6, 0],
          defaultColor: '#065f46',
          material: {
            name: 'High-Tg FR4 Glass Epoxy',
            grade: 'Shengyi S1000-2 (Tg = 170°C)',
            type: 'Composite',
            density: '1.85 g/cm³',
          },
          function: 'Routes matrix scan row/column signals and houses ARM Cortex-M4 microcontroller.',
          manufacturing: {
            process: 'Automated Multi-Layer PCB Fabrication & ENIG Electroless Nickel Immersion Gold Plating',
            machinery: 'Orbotech Laser Direct Imaging + Schmoll CNC PCB Drilling System',
            tolerance: 'Trace/Space: 4/4 mil (0.10 mm)',
            defectRisks: ['Inner layer micro-voids'],
          },
          dimensions: { formatted: '315.0 × 125.0 × 1.60 mm (4-Layer Stackup)' },
          mechanicalRole: { forces: 'Withstands repeated hot-swap push loads' },
          connectedTo: ['hotswap-socket', 'switch-rgb-led'],
          failureModes: [
            {
              mode: 'Copper trace fatigue crack',
              cause: 'Extreme continuous plate flexure on non-flex-cut PCB',
              mitigation: 'Curved snake traces around switch cutouts',
              severity: 'Medium',
            },
          ],
          engineeringReason:
            '4-layer PCB architecture provides dedicated continuous ground and power planes, minimizing electrical noise, reducing USB crosstalk, and lowering signal jitter.',
          dataConfidence: 'Verified',
        },
        {
          id: 'hotswap-socket',
          name: 'Kailh CPG151101S01 Hot-Swap Leaf Socket & Diode',
          cadId: 'PART-SKT-04B',
          category: 'Interconnect',
          meshKey: 'key-socket',
          explodeVector: [0, -2.6, 0],
          defaultColor: '#1e293b',
          material: {
            name: 'Beryllium Copper Contact Leaves with PA6T Polymer Shell',
            grade: 'CuBe2 (C17200) + PA6T High-Temp Nylon',
            type: 'Metal',
            density: '8.25 g/cm³',
            electricalConductivity: '22% IACS',
          },
          function: 'Allows tool-free insertion and replacement of mechanical switches for up to 100 swap cycles.',
          manufacturing: {
            process: 'SMT Pick & Place with High-Temperature Lead-Free Reflow Soldering (Peak 255°C)',
            machinery: 'Fuji NXT III SMT Modular Placement Machine',
            tolerance: 'Placement Accuracy: ±0.03 mm',
            defectRisks: ['Cold solder joint on high-mass ground pin'],
          },
          dimensions: { formatted: '8.5 × 4.2 × 2.8 mm SMT Socket rated for 12V 10mA' },
          mechanicalRole: { forces: 'Normal pin retention clamping force: ~4.5 N' },
          connectedTo: ['pcb-assembly', 'switch-bottom-housing'],
          failureModes: [
            {
              mode: 'Contact leaf loosening after repeated swaps',
              cause: 'Plastic deformation of socket leaf from oversized switch pins',
              mitigation: 'High-yield beryllium copper alloy with superior fatigue endurance',
              severity: 'Medium',
            },
          ],
          engineeringReason:
            'Beryllium copper contacts provide high elastic deflection and stress relaxation resistance, maintaining tight electrical contact clamping force even after thermal reflow cycles.',
          dataConfidence: 'Verified',
        },
        {
          id: 'switch-rgb-led',
          name: 'SMD 3528 / SK6812 Per-Key Addressable RGB LED',
          cadId: 'PART-LED-04C',
          category: 'Optoelectronics',
          meshKey: 'key-led',
          explodeVector: [0, -2.5, 0],
          defaultColor: '#38bdf8',
          material: {
            name: 'InGaN / AlGaInP Semiconductor with Optical Silicone Encapsulation',
            grade: 'SMD 3528 Reverse-Mount Package',
            type: 'Semiconductor',
            density: '2.4 g/cm³',
          },
          function: 'Projects dynamic 16.8M color illumination up through the switch housing optical light tunnel.',
          manufacturing: {
            process: 'Automated High-Speed SMT Placement and Optical AOI',
            machinery: 'Yamaha YRM20 Chip Shooter',
            tolerance: '±0.025 mm placement',
            defectRisks: ['Thermal discoloration of silicone lens'],
          },
          dimensions: { formatted: '3.5 × 2.8 × 1.4 mm Reverse-Mount LED' },
          mechanicalRole: { forces: 'Mounted flush with PCB surface to prevent switch interference' },
          connectedTo: ['pcb-assembly'],
          failureModes: [
            {
              mode: 'LED driver latch-up',
              cause: 'Voltage spike during hot-plug USB connection',
              mitigation: 'Decoupling capacitor (0.1 µF ceramic) adjacent to every LED package',
              severity: 'Low',
            },
          ],
          engineeringReason:
            'Reverse-mount positioning directs light upwards through the switch base without protruding above the PCB, preventing keycap interference on Cherry profile keycaps.',
          dataConfidence: 'Verified',
        },
      ],
    },
  ],

  // -------------------------------------------------------------
  // MATERIALS ANALYSIS (8 COMPREHENSIVE MATERIALS)
  // -------------------------------------------------------------
  materials: [
    {
      name: 'Polybutylene Terephthalate (PBT)',
      percentage: 36,
      color: '#3b82f6',
      category: 'Semi-Crystalline Thermoplastic',
      usedIn: ['Keycaps', 'Stabilizer Stems'],
      properties: [
        { key: 'Melting Point', value: '223 °C' },
        { key: 'Flexural Modulus', value: '2.8 GPa' },
        { key: 'Density', value: '1.34 g/cm³' },
        { key: 'Rockwell Hardness', value: 'R118' },
        { key: 'Solvent Resistance', value: 'Immune to skin lipids, alcohols, and household cleansers' },
        { key: 'Water Absorption (24h)', value: '0.08% (negligible dimensional change)' },
      ],
      advantages: [
        'Resists surface abrasive wear and eliminates oily finger shine over 100M+ keystrokes',
        'High density provides deep acoustic sound dampening',
        'Superior dimensional stability and UV colorfastness',
      ],
      disadvantages: [
        'Higher volumetric shrinkage rate (1.5 - 2.0%) requires complex cooling mold tooling',
        'Brittle under severe shear force compared to ABS',
      ],
      alternatives: ['Acrylonitrile Butadiene Styrene (ABS - easier to mold, but shines rapidly)', 'POM (excessive shrinkage for keycaps)'],
      selectionRationale:
        'PBT is the gold standard for premium mechanical keyboard keycaps because it preserves its tactile micro-textured matte finish without developing oily shine patches from human skin lipids.',
    },
    {
      name: 'POM / Delrin (Polyoxymethylene)',
      percentage: 20,
      color: '#ef4444',
      category: 'Self-Lubricating Acetal Resin',
      usedIn: ['Switch Stem Slider', 'Stabilizer Sliders'],
      properties: [
        { key: 'Dynamic Friction Coefficient', value: 'µ = 0.08 (lubricated against Polyamide)' },
        { key: 'Yield Strength', value: '70 MPa' },
        { key: 'Elastic Modulus', value: '2.9 GPa' },
        { key: 'Tensile Elongation', value: '35%' },
        { key: 'Notched Izod Impact', value: '6.5 kJ/m²' },
      ],
      advantages: [
        'Natural crystalline lubricity yields glass-smooth keystroke travel with zero stick-slip jerkiness',
        'Exceptional dimensional repeatability and creep resistance',
        'High stiffness provides crisp bottom-out feedback',
      ],
      disadvantages: [
        'Cannot be solvent-welded or bonded with common adhesives; requires mechanical snap retention',
        'Sensitive to strong UV radiation if unpigmented',
      ],
      alternatives: ['UHMWPE (ultra-low friction but softer, prone to off-axis stem deformation)', 'Polycarbonate (harsh scratchy friction against PC housings)'],
      selectionRationale:
        'POM is the premier engineering material for mechanical switch stems because its dissimilar molecular structure against nylon housing rails eliminates galling and maintains ultra-low kinetic friction.',
    },
    {
      name: 'Optical-Grade Polycarbonate (PC)',
      percentage: 16,
      color: '#38bdf8',
      category: 'Amorphous Engineering Thermoplastic',
      usedIn: ['Upper Switch Housing', 'Flex-Cut Switch Mounting Plate'],
      properties: [
        { key: 'Refractive Index', value: 'n = 1.586 (Optical Clarity 89%)' },
        { key: 'Tensile Strength', value: '72 MPa' },
        { key: 'Flexural Modulus', value: '2.4 GPa' },
        { key: 'Glass Transition Temp (Tg)', value: '148 °C' },
        { key: 'Dielectric Strength', value: '30 kV/mm' },
      ],
      advantages: [
        'Crystal-clear optical transparency allows brilliant RGB backlight pass-through',
        'High impact toughness prevents housing snap tabs from shearing during disassembly',
        'Crisp, bright acoustic frequency on switch return upstroke',
      ],
      disadvantages: [
        'Susceptible to chemical stress cracking if exposed to harsh petroleum solvents or aerosol lubricants',
      ],
      alternatives: ['Nylon PA66 (opaque, deeper acoustics)', 'Acrylic / PMMA (more brittle, prone to cracking)'],
      selectionRationale:
        'Optical polycarbonate maximizes backlight transmission from PCB LEDs to keycap legends while maintaining the tight dimensional tolerances required for switch rail alignment.',
    },
    {
      name: 'Polyamide 66 (Nylon PA66)',
      percentage: 14,
      color: '#0f172a',
      category: 'Acoustic Damping Engineering Resin',
      usedIn: ['Switch Bottom Housing Base'],
      properties: [
        { key: 'Acoustic Loss Factor (tan δ)', value: '0.042 (High vibrational dissipation)' },
        { key: 'Tensile Strength', value: '82 MPa' },
        { key: 'Melting Point', value: '260 °C' },
        { key: 'Rockwell Hardness', value: 'R120' },
      ],
      advantages: [
        'High internal material damping absorbs impact shocks, producing a deep acoustic "thock"',
        'Withstands 260°C peak temperatures during automated wave/reflow terminal pin soldering',
        'Excellent wear resistance against sliding POM stem wings',
      ],
      disadvantages: [
        'Hygroscopic (absorbs 2.5% atmospheric moisture at equilibrium), requiring tight molding moisture controls',
      ],
      alternatives: ['Polycarbonate (louder, clackier sound profile)', 'PBT (stiffer, less acoustic dampening)'],
      selectionRationale:
        'Nylon PA66 provides unmatched acoustic dampening for the switch base housing, absorbing bottom-out impact energy and preventing high-frequency case reverb.',
    },
    {
      name: 'Phosphor Bronze CuSn6 (C5191) + 24K Gold',
      percentage: 5,
      color: '#d97706',
      category: 'High-Fatigue Electrical Spring Alloy',
      usedIn: ['Switch Contact Leaves', 'Hot-Swap Socket Grips'],
      properties: [
        { key: 'Yield Strength', value: '550 MPa' },
        { key: 'Electrical Conductivity', value: '13% IACS' },
        { key: 'Fatigue Endurance Limit', value: '240 MPa @ 10⁸ cycles' },
        { key: 'Contact Resistance (Gold Crosspoint)', value: '< 15 mΩ' },
      ],
      advantages: [
        'Maintains spring temper and constant contact wiping force over 100M+ actuation cycles',
        'Pure gold inlay eliminates oxidation and contact chatter',
        'Superior solderability to PCB substrate',
      ],
      disadvantages: [
        'Higher raw material cost than brass or beryllium copper',
      ],
      alternatives: ['Cartridge Brass (tarnishes, loses spring temper)', 'Beryllium Copper (expensive, toxicity risks during smelting)'],
      selectionRationale:
        'CuSn6 combines high elastic modulus with exceptional fatigue life, preventing contact bounce degradation even after years of rapid competitive gaming.',
    },
    {
      name: 'SUS304-WPB Spring Steel (Gold Electroplated)',
      percentage: 4,
      color: '#fbbf24',
      category: 'Cold-Drawn Austenitic Spring Wire',
      usedIn: ['Switch Helical Compression Spring'],
      properties: [
        { key: 'Tensile Strength (Rm)', value: '2,150 MPa' },
        { key: 'Torsional Shear Modulus (G)', value: '73 GPa' },
        { key: 'Gold Plating Thickness', value: '0.05 µm (24K Gold Flash)' },
      ],
      advantages: [
        'Precise linear force response with zero permanent plastic set under continuous compression',
        'Gold plating eliminates micro-fretting corrosion and dynamic friction against stem post',
      ],
      disadvantages: ['Requires multi-stage stress relief heat treatment to prevent spring sag'],
      alternatives: ['Carbon Piano Wire ASTM A228 (higher tensile strength, but rusts easily)'],
      selectionRationale:
        'SUS304-WPB provides lifelong corrosion resistance and repeatable spring rate k = 27.5 N/m across millions of key depressions.',
    },
    {
      name: 'High-Tg FR4 Glass Epoxy Composite',
      percentage: 3,
      color: '#065f46',
      category: 'Woven Fiberglass Reinforced Epoxy Substrate',
      usedIn: ['Keyboard Matrix PCB'],
      properties: [
        { key: 'Glass Transition Temp (Tg)', value: '170 °C' },
        { key: 'Dielectric Constant (Dk @ 1 GHz)', value: '4.4' },
        { key: 'Copper Weight', value: '2 oz/ft² (70 µm thickness)' },
      ],
      advantages: [
        'Withstands thermal stresses of multi-pass lead-free reflow soldering',
        'Heavy 2oz copper traces minimize matrix voltage drop across 82 keys',
      ],
      disadvantages: ['Rigid substrate transmits vibrations unless flex-cut slots are machined'],
      alternatives: ['Polyimide Flexible FPC (ultra-flexible, but lacks mechanical mounting stiffness)'],
      selectionRationale:
        'High-Tg FR4 guarantees flat dimensional stability and prevents board warping under hot-swap socket insertion forces.',
    },
    {
      name: 'Rogers Poron XRD Polyurethane Foam',
      percentage: 2,
      color: '#18181b',
      category: 'Microcellular Open-Cell Elastomer',
      usedIn: ['Plate Gasket Dampening Strips', 'Case Base Acoustic Foam'],
      properties: [
        { key: 'Compression Set (ASTM D3574)', value: '< 2.0% @ 70°C' },
        { key: 'Impact Energy Absorption', value: 'Up to 90% at peak strain rate' },
        { key: 'Density', value: '0.24 g/cm³' },
      ],
      advantages: [
        'Absorbs high-energy shock waves instantly, isolating plate vibrations from the keyboard enclosure',
        'Maintains springback resilience for over 10 years without crumbling into dust',
      ],
      disadvantages: ['Significantly higher cost than generic EVA or neoprene packaging foams'],
      alternatives: ['EVA Foam (stiff, compresses permanently over time)', 'Silicone rubber (dense, bounces vibration back)'],
      selectionRationale:
        'Poron XRD is the industry leader in acoustic impact energy absorption, eliminating hollow metallic case ping and tuning keyboard acoustics into a clean, low-frequency sound profile.',
    },
  ],

  // -------------------------------------------------------------
  // HOW IT WORKS: 6 RICH KINEMATIC PHASES
  // -------------------------------------------------------------
  howItWorks: [
    {
      step: 1,
      title: 'Downward Keystroke Pre-Travel (0.00 to 1.80 mm)',
      description:
        'The typist applies finger pressure to the PBT keycap. The POM stem begins sliding axially down the high-precision housing rails. The progressive SUS304 helical spring compresses from its initial seating preload of 35 cN (0.34 N) up to 43 cN. No electrical contact occurs during this smooth linear pre-travel phase.',
      activeComponentIds: ['keycap-subassembly', 'switch-module'],
      forcesDescription:
        'Preload force F_0 = 35 cN; Spring compression follows Hooke’s Law: F(x) = F_0 + k · x = 0.34 N + (27.5 N/m · 0.0018 m) = 0.39 N.',
    },
    {
      step: 2,
      title: 'Stem Cam Ramp & Tactile Peak Force (1.80 to 2.00 mm)',
      description:
        'As travel approaches 1.90 mm, the angled wedge cam leg on the POM stem contacts the flexible blade of the phosphor bronze leaf. The mechanical interference generates a tactile resistance crest (55 cN for tactile switches) before dropping sharply, signaling to the typist’s fingertips that actuation is imminent.',
      activeComponentIds: ['switch-module'],
      forcesDescription:
        'Tactile force drop-off: ΔF_tactile = 12 cN over 0.25 mm displacement, creating a sharp tactile tactile snap ratio of 22%.',
    },
    {
      step: 3,
      title: 'Gold Crosspoint Contact Wipe & Circuit Actuation (2.00 mm)',
      description:
        'At precisely 2.00 mm stroke, the stem cam leg deflects the phosphor bronze movable leaf blade by 0.45 mm into direct contact with the static leaf. The cylindrical gold crosspoint prisms mate at 90°, sliding across each other with 0.15 N of normal force. This self-cleaning wiping action cuts through surface micro-particles and establishes sub-20 mΩ electrical continuity.',
      activeComponentIds: ['switch-module', 'pcb-matrix-assembly'],
      forcesDescription:
        'Actuation threshold: Travel = 2.00 ± 0.15 mm; Actuation force = 45 cN (Linear) / 50 cN (Tactile); Contact Wipe = 0.15 N normal force.',
    },
    {
      step: 4,
      title: 'Contact Bounce & Digital Firmware Debouncing (0.8 to 2.5 ms)',
      description:
        'Under microscopic inspection, the elastic collision between the gold prisms causes mechanical chatter, bouncing open and closed 2 to 5 times over ~1.2 milliseconds. The onboard ARM Cortex-M4 microcontroller detects the initial active-low state change and starts a 5 ms asymmetric digital debounce timer to prevent phantom double-typing before passing the HID keycode packet over USB.',
      activeComponentIds: ['switch-module', 'pcb-matrix-assembly'],
      forcesDescription:
        'Contact bounce duration: t_bounce = 1.2 ms; Microcontroller scan cycle: 1,000 Hz polling rate (1.0 ms USB latency) or 8,000 Hz (0.125 ms latency).',
    },
    {
      step: 5,
      title: 'Full Bottom-Out Impact & Helmholtz Acoustic Resonance (4.00 mm)',
      description:
        'At 4.00 mm total travel stroke, the center cylindrical pole of the POM stem strikes the nylon floor of the bottom housing. Peak keystroke force reaches 62 cN to 2.5 N. The kinetic impact shockwave travels through the switch base into the polycarbonate flex plate, where Poron foam gaskets absorb 85% of high-frequency vibrational shear, leaving a deep Helmholtz acoustic "thock" sound wave inside the keycap cavity.',
      activeComponentIds: ['keycap-subassembly', 'switch-module', 'plate-gasket-assembly'],
      forcesDescription:
        'Bottom-out impact: F_bottom = 0.62 N (Nominal) up to 2.8 N (Heavy strike); Deceleration shock: a = 180 m/s²; Gasket deflection: 1.2 mm.',
    },
    {
      step: 6,
      title: 'Elastic Spring Recoil, Switch Hysteresis & Return Stroke',
      description:
        'As finger pressure is released, the compressed gold-plated spring expels its stored elastic energy, propelling the POM stem upwards. At approximately 1.85 mm on the return stroke (0.15 mm hysteresis gap), the contact leaves separate, breaking the circuit. The stem wings hit the polycarbonate upper housing floor with a clean acoustic upstroke return sound.',
      activeComponentIds: ['keycap-subassembly', 'switch-module'],
      forcesDescription:
        'Return spring restorative force: F_return = 35 cN; Switch mechanical hysteresis: Δx_hysteresis = 0.15 mm to prevent oscillatory re-triggering.',
    },
  ],

  // -------------------------------------------------------------
  // ENGINEERING EQUATIONS (4 INTERACTIVE SCIENTIFIC CALCULATORS)
  // -------------------------------------------------------------
  engineeringEquations: [
    {
      id: 'eq-switch-force-displacement',
      title: 'Switch Force-Displacement Profile & Tactile Ratio',
      discipline: 'Mechanical',
      latex: 'F(x) = F_0 + k \\cdot x + \\Delta F_{\\text{tactile}} \\cdot \\exp\\left(-\\frac{(x - x_t)^2}{2 \\sigma^2}\\right)',
      explanation:
        'Models the continuous keystroke resistance force F(x) as a function of key stroke travel displacement x. It couples linear helical spring stiffness k with the non-linear Gaussian geometric cam curve of the tactile stem leg, defining the tactile peak and tactility index.',
      variables: [
        { symbol: 'F(x)', name: 'Instantaneous Keystroke Force', unit: 'cN', objectValue: '45 cN (Actuation)' },
        { symbol: 'F_0', name: 'Spring Preload Force', unit: 'cN', objectValue: '35 cN' },
        { symbol: 'k', name: 'Spring Stiffness Rate', unit: 'cN/mm', objectValue: '6.75 cN/mm (27.5 N/m)' },
        { symbol: 'x', name: 'Key Travel Displacement', unit: 'mm', objectValue: '2.00 mm (Actuation Point)' },
        { symbol: 'ΔF_tactile', name: 'Tactile Bump Peak Amplitude', unit: 'cN', objectValue: '12 cN' },
      ],
      interactiveCalculator: {
        calculate: (inputs) => {
          const { preloadCn, bottomCn, strokeMm, tactileBumpCn } = inputs;
          const kRate = (bottomCn - preloadCn) / strokeMm; // cN/mm
          const actuationPointMm = strokeMm * 0.5;
          const actuationForceCn = preloadCn + kRate * actuationPointMm + (tactileBumpCn > 0 ? tactileBumpCn * 0.6 : 0);
          const tactilityIndex = tactileBumpCn > 0 ? ((tactileBumpCn / (preloadCn + kRate * actuationPointMm)) * 100) : 0;
          return {
            result: Number(actuationForceCn.toFixed(1)),
            unit: 'cN',
            formatted: `${actuationForceCn.toFixed(1)} cN (Spring Rate: ${kRate.toFixed(2)} cN/mm)`,
            interpretation:
              tactileBumpCn > 15
                ? `High-tactility switch (Tactility Index ${tactilityIndex.toFixed(0)}%): Sharp mechanical feedback, highly satisfying typing tactile snap.`
                : tactileBumpCn > 0
                ? `Subtle tactile switch (Tactility Index ${tactilityIndex.toFixed(0)}%): Smooth all-round switch for mixed typing and gaming.`
                : 'Pure linear switch: Constant smooth acceleration with zero tactile bump interruption, preferred for competitive esports.',
          };
        },
        inputs: [
          { key: 'preloadCn', label: 'Spring Preload Force', min: 25, max: 55, step: 5, default: 35, unit: 'cN' },
          { key: 'bottomCn', label: 'Bottom-Out Force', min: 45, max: 95, step: 5, default: 62, unit: 'cN' },
          { key: 'strokeMm', label: 'Total Travel Stroke', min: 3.2, max: 4.5, step: 0.1, default: 4.0, unit: 'mm' },
          { key: 'tactileBumpCn', label: 'Tactile Cam Bump Amplitude', min: 0, max: 25, step: 2, default: 12, unit: 'cN' },
        ],
      },
    },
    {
      id: 'eq-spring-wahl-stress',
      title: 'Helical Spring Wahl Shear Stress & Fatigue Safety Factor',
      discipline: 'Mechanical',
      latex: '\\tau_{\\max} = K_w \\frac{8 F D}{\\pi d^3}, \\quad K_w = \\frac{4C - 1}{4C - 4} + \\frac{0.615}{C}',
      explanation:
        'Calculates the maximum torsional shear stress (τ_max) in the coiled music spring wire under bottom-out load using the Wahl curvature stress correction factor K_w. Ensures the wire operates safely below the torsional fatigue endurance limit over 100 million keystrokes.',
      variables: [
        { symbol: 'τ_max', name: 'Peak Torsional Shear Stress', unit: 'MPa', objectValue: '685 MPa' },
        { symbol: 'K_w', name: 'Wahl Curvature Factor', unit: 'dimensionless', objectValue: '1.085' },
        { symbol: 'F', name: 'Peak Bottom-Out Spring Force', unit: 'N', objectValue: '0.62 N' },
        { symbol: 'D', name: 'Mean Coil Diameter', unit: 'mm', objectValue: '3.68 mm' },
        { symbol: 'd', name: 'Wire Diameter', unit: 'mm', objectValue: '0.22 mm' },
        { symbol: 'C', name: 'Spring Index (D/d)', unit: 'dimensionless', objectValue: '16.7' },
      ],
      interactiveCalculator: {
        calculate: (inputs) => {
          const { bottomForceCn, meanCoilDiamMm, wireDiamMm } = inputs;
          const F_newtons = (bottomForceCn / 100) * 0.981;
          const D = meanCoilDiamMm;
          const d = wireDiamMm;
          const C = D / d;
          const Kw = (4 * C - 1) / (4 * C - 4) + 0.615 / C;
          const tauMaxMpa = (Kw * (8 * F_newtons * (D / 1000))) / (Math.PI * Math.pow(d / 1000, 3)) / 1e6;
          const allowableTorsionalMpa = 950; // SUS304-WPB spring wire endurance limit
          const fos = allowableTorsionalMpa / tauMaxMpa;
          return {
            result: Number(tauMaxMpa.toFixed(1)),
            unit: 'MPa',
            formatted: `τ_max = ${tauMaxMpa.toFixed(0)} MPa (Factor of Safety: ${fos.toFixed(2)})`,
            interpretation:
              fos < 1.15
                ? 'High stress: Potential risk of plastic permanent set and spring height sag over 50M cycles.'
                : fos > 1.40
                ? 'Optimal spring endurance: Exceptional infinite fatigue life (> 150 million keystroke cycles).'
                : 'Standard industrial safety factor for electromechanical switches.',
          };
        },
        inputs: [
          { key: 'bottomForceCn', label: 'Bottom-Out Force', min: 45, max: 95, step: 5, default: 62, unit: 'cN' },
          { key: 'meanCoilDiamMm', label: 'Mean Coil Diameter', min: 3.2, max: 4.2, step: 0.1, default: 3.68, unit: 'mm' },
          { key: 'wireDiamMm', label: 'Wire Diameter', min: 0.18, max: 0.28, step: 0.02, default: 0.22, unit: 'mm' },
        ],
      },
    },
    {
      id: 'eq-contact-resistance',
      title: 'Hertzian Contact Resistance & Gold Micro-Asperity Wipe (Holm Equation)',
      discipline: 'Electrical',
      latex: 'R_c = \\frac{\\rho_1 + \\rho_2}{4} \\sqrt{\\frac{\\pi H}{F_n}} + \\frac{\\sigma_f}{A_c}',
      explanation:
        'Calculates electrical contact constriction resistance R_c across the gold crosspoint rivets using Holm’s contact physics. It accounts for material resistivity ρ, micro-hardness H of the gold inlay, normal wiping force F_n, and tunnel film resistance.',
      variables: [
        { symbol: 'R_c', name: 'Electrical Constriction Resistance', unit: 'mΩ', objectValue: '12.4 mΩ' },
        { symbol: 'F_n', name: 'Normal Contact Wiping Force', unit: 'N', objectValue: '0.15 N' },
        { symbol: 'H', name: 'Meyer Hardness of Gold Layer', unit: 'MPa', objectValue: '450 MPa' },
        { symbol: 'ρ', name: 'Gold Resistivity', unit: 'nΩ·m', objectValue: '24.4 nΩ·m' },
      ],
      interactiveCalculator: {
        calculate: (inputs) => {
          const { wipeForceGf, goldThicknessUm, contactCyclesM } = inputs;
          const Fn = (wipeForceGf * 0.00981); // Newtons
          const H = 450e6; // Pa
          const rho = 24.4e-9; // Ohm*m
          // Constriction radius a = sqrt(Fn / (pi * H))
          const a = Math.sqrt(Fn / (Math.PI * H));
          const R_constriction = (rho / (2 * a)) * 1000; // mOhm
          const degradationFactor = 1 + (contactCyclesM / 100) * 0.8;
          const totalRc = R_constriction * degradationFactor;
          return {
            result: Number(totalRc.toFixed(2)),
            unit: 'mΩ',
            formatted: `R_c = ${totalRc.toFixed(2)} mΩ (Gold Inlay ${goldThicknessUm} µm)`,
            interpretation:
              totalRc < 25
                ? 'Flawless signal continuity: Zero contact chatter, instantaneous digital gate triggering.'
                : totalRc < 50
                ? 'Acceptable contact resistance: Well within typical microcontroller 3.3V logic threshold.'
                : 'High contact resistance: Risk of key chatter or missed keystrokes; cleaning or replacement advised.',
          };
        },
        inputs: [
          { key: 'wipeForceGf', label: 'Contact Normal Force', min: 8, max: 25, step: 1, default: 15, unit: 'gf' },
          { key: 'goldThicknessUm', label: 'Gold Inlay Thickness', min: 0.02, max: 0.20, step: 0.02, default: 0.05, unit: 'µm' },
          { key: 'contactCyclesM', label: 'Actuation Cycle Count', min: 1, max: 100, step: 5, default: 10, unit: 'M cycles' },
        ],
      },
    },
    {
      id: 'eq-helmholtz-resonance',
      title: 'Helmholtz Cavity Acoustic Resonance & Keyboard "Thock" Frequency',
      discipline: 'Materials',
      latex: 'f_0 = \\frac{c}{2\\pi} \\sqrt{\\frac{A_0}{V_{\\text{cavity}} \\left(L + 0.6 \\cdot r\\right)}}',
      explanation:
        'Calculates the fundamental acoustic resonant frequency f_0 of the keycap inner airspace and plate cavity acting as a Helmholtz resonator. Heavy, thick keycaps and gasket damping lower f_0 into the desirable deep acoustic "thock" range (< 400 Hz), while thin plastics produce high-frequency "clack" (> 750 Hz).',
      variables: [
        { symbol: 'f_0', name: 'Resonant Acoustic Frequency', unit: 'Hz', objectValue: '385 Hz ("Thock")' },
        { symbol: 'c', name: 'Speed of Sound in Air', unit: 'm/s', objectValue: '343 m/s' },
        { symbol: 'V_cavity', name: 'Keycap Inner Airspace Volume', unit: 'mm³', objectValue: '1,450 mm³' },
        { symbol: 'A_0', name: 'Acoustic Escape Aperture Area', unit: 'mm²', objectValue: '18 mm²' },
      ],
      interactiveCalculator: {
        calculate: (inputs) => {
          const { wallThicknessMm, cavityVolumeMm3, gasketDampingPct } = inputs;
          const c = 343; // m/s
          // Mass scaling from wall thickness lowers effective cavity resonance
          const massFactor = 1.5 / wallThicknessMm;
          const V_m3 = (cavityVolumeMm3 * 1e-9);
          const A_m2 = (22 * 1e-6);
          const L_eff = (4.0 * 1e-3);
          const rawFreq = (c / (2 * Math.PI)) * Math.sqrt(A_m2 / (V_m3 * L_eff)) * massFactor;
          const dampedFreq = rawFreq * (1 - (gasketDampingPct / 100) * 0.35);
          return {
            result: Number(dampedFreq.toFixed(0)),
            unit: 'Hz',
            formatted: `${dampedFreq.toFixed(0)} Hz Acoustic Peak`,
            interpretation:
              dampedFreq < 420
                ? 'Deep "Thock" acoustic profile: Thick 1.5mm PBT keycap + Poron gasket absorbs high frequencies for a premium muted bass signature.'
                : dampedFreq < 650
                ? 'Crisp "Pop" acoustic profile: Balanced medium frequency response with clear tactile snap feedback.'
                : 'High-pitched "Clack" acoustic profile: Thin keycap walls and rigid tray mount transmit sharp high-frequency case ping.',
          };
        },
        inputs: [
          { key: 'wallThicknessMm', label: 'Keycap Wall Thickness', min: 0.8, max: 1.8, step: 0.1, default: 1.5, unit: 'mm' },
          { key: 'cavityVolumeMm3', label: 'Keycap Cavity Volume', min: 900, max: 2200, step: 100, default: 1450, unit: 'mm³' },
          { key: 'gasketDampingPct', label: 'Poron Gasket Acoustic Damping', min: 10, max: 95, step: 5, default: 85, unit: '%' },
        ],
      },
    },
  ],

  // -------------------------------------------------------------
  // MANUFACTURING TIMELINE (6 REALISTIC INDUSTRIAL STAGES)
  // -------------------------------------------------------------
  manufacturingTimeline: [
    {
      stepNumber: 1,
      stageName: 'Double-Shot PBT Keycap Precision Tooling & Molding',
      description:
        'Shot 1 injects contrasting colored PBT resin to mold the intricate keycap legend core with internal locking ribs. The core plate rotates 180° on an all-electric rotary indexing table, where Shot 2 overmolds the 1.5 mm thick textured outer PBT shell at 245°C.',
      machinery: 'Sumitomo SE-EV 100-Ton All-Electric 2K Multi-Shot Injection Molding Press',
      tolerance: 'Cruciform Stem Mount: 4.00 +0.02 / -0.00 mm; Legend Edge Definition: ±0.015 mm',
      materialReq: 'High-Crystallinity PBT Thermoplastic Pellets (Sabic Valox 357)',
      qualityChecks: [
        'Automated 12-Megapixel Telecentric Vision Inspection for legend bleeding and voids',
        'Cruciform cross retention pull force dyno check (Target: 8.5 ± 1.0 N)',
      ],
      commonDefects: ['Legend line bleeding', 'Volumetric shrinkage warp on wider keycaps (> 2U)'],
    },
    {
      stepNumber: 2,
      stageName: 'High-Speed Progressive Stamping of Phosphor Bronze Contacts',
      description:
        'A continuous strip of 0.15 mm deoxidized CuSn6 phosphor bronze is fed into a 30-ton progressive die. Twelve consecutive die stations execute piercing, forming, cantilever coining, and in-line automated micro-riveting of pure gold crosspoint contact prisms.',
      machinery: 'Yamada TDP-30 Ultra-High-Speed Progressive Stamping Press (800 strokes/min)',
      tolerance: 'Contact Separation Gap: 0.42 ± 0.025 mm; Contact Wipe Blade Angle: ±0.20°',
      materialReq: 'Wieland B14 CuSn6 Phosphor Bronze Strip + 99.99% Pure Au Inlay Wire',
      qualityChecks: [
        'High-speed optical laser displacement scanning of contact blade separation gap',
        'Micro-hardness and gold rivet weld shear pull test (> 15 N)',
      ],
      commonDefects: ['Burr height exceeding 0.015 mm', 'Spring temper relaxation during coining'],
    },
    {
      stepNumber: 3,
      stageName: 'CNC Spring Coiling & In-Line Stress-Relief Annealing',
      description:
        'Ultra-high tensile SUS304-WPB spring wire (Ø 0.22 mm) is drawn into a multi-axis CNC coiler. Two servo curling pins wind 12 active coils with progressive pitch spacing and closed ground ends. Coiled springs drop into a continuous nitrogen-purged 380°C conveyor furnace for 20 minutes to relieve residual cold-working shear stresses.',
      machinery: 'Wafios FMU 1.7 CNC Multi-Axis Spring Coiling Machine + Conveyor Annealing Oven',
      tolerance: 'Free Length: 15.00 ± 0.10 mm; Spring Rate Tolerance: ±1.5%',
      materialReq: 'Suzuki Garphyttan SUS304-WPB Spring Steel Wire (Rm = 2,150 MPa)',
      qualityChecks: [
        '100% automated load dyno sorting at 2.0 mm and 4.0 mm compressed deflection',
        'Barrel electroplating thickness verification (X-ray fluorescence Au > 0.05 µm)',
      ],
      commonDefects: ['Pitch non-uniformity', 'Residual coil tilt causing off-axis spring ping'],
    },
    {
      stepNumber: 4,
      stageName: 'Automated 180 PPM Switch Assembly & Micro-Volume Lubrication',
      description:
        'A high-speed 24-station rotary dial assembly machine loads the nylon bottom housing, inserts terminal pins with heat-staking, dispenses exactly 5 ± 0.5 µL of Krytox GPL 205g0 lubricant onto slider rails and spring seats, seats the gold spring, mounts the POM stem, and ultrasonically snaps the polycarbonate top housing.',
      machinery: 'Mikron PolyFeed High-Speed Automated Switch Assembly Line (180 switches/min)',
      tolerance: 'Actuation Stroke: 2.00 ± 0.15 mm; Total Travel: 4.00 ± 0.20 mm',
      materialReq: 'POM Stems, PC Tops, Nylon Bases, Gold Springs, Contact Leaves, Krytox Grease',
      qualityChecks: [
        '100% Automated Force-Displacement Dyno Testing: records full 4.0 mm stroke force curve',
        'Contact resistance verification (R < 20 mΩ @ 5V 10mA)',
        'Debounce duration check (Chatter duration < 2.5 ms)',
      ],
      commonDefects: ['Pin bending during feeder track escapement', 'Lubricant migration onto gold crosspoint face'],
    },
    {
      stepNumber: 5,
      stageName: 'High-Speed SMT PCB Assembly & Kailh Hot-Swap Reflow',
      description:
        'The 4-layer FR4 PCB panel receives solder paste via laser-cut 120 µm stainless stencils. High-speed pick-and-place mounters place reverse-mount Kailh hot-swap sockets, 1N4148 diodes, SMD 3528 RGB LEDs, and ARM Cortex-M4 microcontrollers before passing through an 8-zone nitrogen reflow oven.',
      machinery: 'Yamaha YRM20 SMT Placement Machine + Heller 1809 MK5 Reflow Oven',
      tolerance: 'SMT Placement Offset: < ±0.03 mm; Hot-Swap Solder Fillet Coverage: > 95%',
      materialReq: 'Shengyi S1000-2 High-Tg FR4 Panels, Kailh Hot-Swap Sockets, Sn96.5Ag3.0Cu0.5 Paste',
      qualityChecks: [
        '3D Automated Optical Inspection (AOI) checking 100% of solder joint volumes',
        'In-Circuit Test (ICT) bed-of-nails matrix continuity and diode polarity check',
      ],
      commonDefects: ['Solder bridging on fine-pitch MCU pins', 'Insufficient solder fillet on hot-swap pads'],
    },
    {
      stepNumber: 6,
      stageName: 'Gasket Mounting, Final Assembly & Acoustic Spectrum QC',
      description:
        'CNC-milled polycarbonate flex plates are laminated with Poron XRD gasket tabs and snap-fitted with 82 tested switches. The assembly is mated with the hot-swap PCB, sandwiched with Poron switch pads, and secured inside a CNC 6063 anodized aluminum enclosure. A robotic keystroke simulator tests all keys while an FFT acoustic microphone analyzes decibel levels and resonant frequencies.',
      machinery: 'Automated 6-Axis Keystroke Testing Robot + Bruel & Kjaer Acoustic FFT Chamber',
      tolerance: 'Typing Flex Deck Deflection: 1.4 ± 0.2 mm; Acoustic Peak Frequency: 380 ± 40 Hz',
      materialReq: 'CNC Anodized Aluminum Enclosures, Poron Gaskets, Custom Keycap Sets',
      qualityChecks: [
        '100% NKRO Matrix Verification: 82-key simultaneous rollover test',
        'Acoustic spectrum analysis: Rejects boards exhibiting metallic ping or resonance > 55 dB',
        'USB 2.0 Signal Integrity Eye-Diagram compliance test',
      ],
      commonDefects: ['Misaligned gasket tab creating localized plate stiffness', 'Keycap height variance > 0.3 mm'],
    },
  ],

  // -------------------------------------------------------------
  // CROSS-COMPONENT RELATIONSHIPS (SYSTEM INTERACTION MAP)
  // -------------------------------------------------------------
  relationships: [
    {
      sourceId: 'keycap-subassembly',
      targetId: 'switch-module',
      interactionType: 'pushes',
      description: 'Transfers finger strike kinetic energy directly down into the POM cross stem.',
    },
    {
      sourceId: 'switch-stem',
      targetId: 'switch-spring',
      interactionType: 'pushes',
      description: 'Compresses helical spring to store restoring kinetic energy for key return.',
    },
    {
      sourceId: 'switch-stem',
      targetId: 'switch-contact-leaf',
      interactionType: 'pushes',
      description: 'Cam ramp leg deflects phosphor bronze leaf by 0.45 mm to close gold crosspoints.',
    },
    {
      sourceId: 'switch-contact-leaf',
      targetId: 'pcb-matrix-assembly',
      interactionType: 'conducts',
      description: 'Transmits sub-millisecond electrical contact closure signal into matrix row/column scan lines.',
    },
    {
      sourceId: 'switch-bottom-housing',
      targetId: 'switch-plate',
      interactionType: 'locks',
      description: 'Perimeter snap clips lock the switch firmly into the 14.0 mm plate square window.',
    },
    {
      sourceId: 'switch-plate',
      targetId: 'switch-gasket',
      interactionType: 'supports',
      description: 'Translates typing impact shear forces onto perimeter Poron elastomer dampener tabs.',
    },
    {
      sourceId: 'switch-gasket',
      targetId: 'keycap-subassembly',
      interactionType: 'dampens',
      description: 'Absorbs high-frequency acoustic shockwaves to create a clean, low-frequency "thock" timbre.',
    },
    {
      sourceId: 'hotswap-socket',
      targetId: 'switch-bottom-housing',
      interactionType: 'couples',
      description: 'Spring-loaded beryllium copper leaves clamp switch terminal pins without soldering.',
    },
  ],

  // -------------------------------------------------------------
  // WHAT-IF SIMULATOR PARAMETERS (4 INTERACTIVE SLIDERS)
  // -------------------------------------------------------------
  whatIfParameters: [
    {
      id: 'param-spring-bottomout',
      label: 'Spring Bottom-Out Weight',
      component: 'Switch Spring',
      min: 35,
      max: 95,
      defaultValue: 62,
      unit: 'cN',
      impactMetrics: [
        {
          name: 'Typist Finger Fatigue Index',
          calculate: (val) => {
            const pct = Math.round(((val - 62) / 62) * 100);
            return {
              changePercent: pct,
              valueStr: `${(val * 0.00981).toFixed(2)} N Peak Force`,
              status: val > 75 ? 'critical' : val < 45 ? 'warning' : 'optimal',
              explanation:
                val > 75
                  ? 'Heavy spring (> 75 cN) prevents accidental keypresses but increases finger flexor tendon fatigue during 8-hour typing sessions.'
                  : val < 45
                  ? 'Ultra-light gaming spring (< 45 cN): Hair-trigger actuation, but risks accidental mispresses from merely resting fingertips.'
                  : 'Balanced ergonomic weight: Ideal balance of tactile resistance, typo prevention, and muscle comfort.',
            };
          },
        },
      ],
    },
    {
      id: 'param-lubricant-viscosity',
      label: 'Switch Rail Lubricant Volume & Viscosity',
      component: 'Switch Stem & Rails',
      min: 0,
      max: 12,
      defaultValue: 5,
      unit: 'µL',
      impactMetrics: [
        {
          name: 'Dynamic Sliding Friction Coefficient (µ)',
          calculate: (val) => {
            const friction = Math.max(0.06, 0.16 - (val / 12) * 0.09);
            const pct = Math.round(((friction - 0.08) / 0.08) * 100);
            return {
              changePercent: -pct,
              valueStr: `µ = ${friction.toFixed(2)}`,
              status: val > 9 ? 'warning' : val < 2 ? 'warning' : 'optimal',
              explanation:
                val > 9
                  ? 'Over-lubed ("mushy"): Excess grease creates hydraulic damping resistance, sluggish stem return, and muffled switch travel.'
                  : val < 2
                  ? 'Dry / unlubricated: Microscopic stick-slip friction creates audible scratchiness and plastic-on-plastic wear.'
                  : 'Factory optimal: Thin Krytox 205g0 film eliminates scratchiness while preserving crisp snappy return kinetics.',
            };
          },
        },
      ],
    },
    {
      id: 'param-plate-stiffness',
      label: 'Switch Plate Elastic Modulus',
      component: 'Mounting Plate',
      min: 2,
      max: 110,
      defaultValue: 2.4,
      unit: 'GPa',
      impactMetrics: [
        {
          name: 'Typing Bottom-Out Shock Deceleration',
          calculate: (val) => {
            const shockG = Math.round(12 + (val / 110) * 45);
            const pct = Math.round(((val - 2.4) / 2.4) * 100);
            return {
              changePercent: pct,
              valueStr: `${shockG} G Deceleration Shock`,
              status: val > 70 ? 'critical' : val < 5 ? 'optimal' : 'optimal',
              explanation:
                val > 70
                  ? 'Rigid Brass / Steel Plate (110 GPa): Zero plate flex; finger strike abruptly bottoms out, transmitting harsh vibration into joints.'
                  : val < 5
                  ? 'Flexible Polycarbonate / POM Plate (2.4 GPa): Cushioned trampoline bounce, absorbs shock and lowers acoustic resonance.'
                  : 'Medium FR4 / Aluminum Plate: Balanced stiffness with predictable tactile firmness.',
            };
          },
        },
      ],
    },
    {
      id: 'param-polling-rate',
      label: 'Matrix USB Polling Rate',
      component: 'Microcontroller Matrix',
      min: 125,
      max: 8000,
      defaultValue: 1000,
      unit: 'Hz',
      impactMetrics: [
        {
          name: 'Input Signal Latency',
          calculate: (val) => {
            const latencyMs = 1000 / val;
            const pct = Math.round(((1.0 - latencyMs) / 1.0) * 100);
            return {
              changePercent: pct,
              valueStr: `${latencyMs.toFixed(3)} ms Latency`,
              status: val >= 8000 ? 'optimal' : val >= 1000 ? 'optimal' : 'warning',
              explanation:
                val >= 8000
                  ? 'Ultra-High 8,000 Hz: 0.125 ms theoretical latency for competitive esports, but increases host PC USB interrupt CPU load.'
                  : val >= 1000
                  ? 'Standard 1,000 Hz: 1.0 ms response time, ideal balance with near-zero CPU overhead.'
                  : 'Legacy 125 Hz: 8.0 ms latency, perceptible lag in high-framerate competitive gaming.',
            };
          },
        },
      ],
    },
  ],

  // -------------------------------------------------------------
  // DID YOU KNOW: 5 FASCINATING FACTS
  // -------------------------------------------------------------
  didYouKnow: [
    'A competitive esports gamer can trigger mechanical switches at over 15 keystrokes per second, generating over 120,000 individual switch actuations in a single 3-hour tournament match without a single missed electrical registration.',
    'Mechanical switch contacts use gold crosspoint rivets because pure gold never forms insulating oxide films (unlike silver which forms silver sulfide and copper which forms copper oxide), allowing flawless signal transmission with currents as low as 10 microamperes.',
    'The enthusiast "tape mod" (applying painter\'s tape beneath the PCB) acts as an acoustic low-pass band filter: it reflects high-frequency vibrations back into the PCB substrate while allowing low-frequency bass waves to pass, deepening the acoustic typing signature.',
    'Full N-Key Rollover (NKRO) is made possible by placing an individual 1N4148 fast-switching diode in series with every single keyswitch on the PCB, preventing electrical "ghosting" sneak currents across matrix intersections.',
    'Wide modifier keys like the Spacebar (6.25U / 118 mm wide) require specialized steel wire stabilizers with twin POM dummy stems to prevent rotational lever racking and binding when pressed off-center.',
  ],

  // -------------------------------------------------------------
  // ENGINEERS CHOICE & TECHNICAL RATIOS
  // -------------------------------------------------------------
  engineersChoice: [
    {
      title: 'Why Pure Gold-Crosspoint Contacts over Silver or Pure Copper?',
      rationale:
        'Silver oxidizes into silver sulfide and copper develops non-conductive copper oxide films when exposed to atmospheric sulfur and humidity. In low-voltage 3.3V digital logic circuits, contact current (~5 mA) is insufficient to "frit" or electrically burn through oxide layers, causing catastrophic key chatter and double-typing. Gold is chemically inert at standard atmospheric conditions, ensuring 100 million cycle longevity with sub-20 mΩ contact resistance.',
    },
    {
      title: 'Why Dissimilar Polymer Pairing (POM Stem vs Nylon Base Housing)?',
      rationale:
        'When identical polymers slide against one another (e.g. POM on POM or PC on PC), microscopic surface asperities experience molecular cohesion, stick-slip friction, and micro-galling. Pairing a semi-crystalline polyoxymethylene (POM) slider against an amorphous polyamide 66 (Nylon) rail creates an ideal tribological pair with mismatched crystalline structures, resulting in an ultra-low dynamic friction coefficient of µ = 0.08.',
    },
    {
      title: 'Why Gasket-Mounted Plates over Traditional Rigid Screw Tray Mounts?',
      rationale:
        'Traditional tray-mount cases screw the metal plate directly into structural standoffs in the case floor, creating rigid localized stress hotspots around the center keys (G and H keys feel rock hard while edge keys feel soft). Gasket mounting suspends the entire typing deck on soft perimeter Poron foam tabs, equalizing deflection across all 82 keys while acoustically decoupling the plate from the aluminum case enclosure.',
    },
    {
      title: 'Why South-Facing Switches over North-Facing Switch Orientation?',
      rationale:
        'North-facing switches position the LED at the top of the switch housing, but on Cherry-profile sculpted keycaps (specifically Row 3), the thick 1.5mm keycap inner wall physically strikes the top housing before reaching bottom-out, creating a harsh premature collision. South-facing switches rotate the switch 180°, placing the LED at the bottom and eliminating physical interference with thick PBT keycaps.',
    },
  ],

  // -------------------------------------------------------------
  // REDESIGN INSIGHTS
  // -------------------------------------------------------------
  redesignInsights: {
    simplify: {
      title: 'Hall Effect Magnetic Switch (Contactless Analog)',
      partReduction: 'Completely eliminates physical leaf contacts, gold rivets, and solder terminal pins.',
      description:
        'Embeds a permanent neodymium magnet inside the moving POM stem and an analog Hall effect magnetic sensor on the PCB surface. As the stem descends, the sensor measures magnetic flux density with 0.01 mm precision, enabling adjustable rapid trigger reset points from 0.1 mm to 4.0 mm.',
      tradeoffs:
        'Higher continuous standby power consumption for the magnetic sensor array and requires temperature-compensated ADC calibration firmware, but raises switch lifespan beyond 150 million keystrokes.',
    },
    makeItBetter: {
      title: 'Dual-Stage Progressive Gasket Carbon Fiber Plate with Solid Brass Sub-Weight',
      upgrade: 'Replaces standard plate with woven 3K twill carbon fiber suspended on tuned Poron XRD gaskets and an integrated 450-gram acoustic brass counterweight.',
      performanceGain: 'Cuts chassis harmonic vibration decay time by 78% while delivering deep, resonance-free acoustic profile and uniform flex compliance.',
      description:
        'High-density solid brass counterweight shifts the assembly center of gravity downward, anchoring the keyboard firmly against high-energy gaming keystrokes.',
      tradeoffs: 'Adds $65 in CNC manufacturing and material cost; increases overall keyboard weight to 1.85 kg.',
    },
    cheaperVersion: {
      title: 'Membrane Scissor-Switch Array with Conductive Carbon Pills',
      costReduction: 'Estimated -85% manufacturing and component assembly cost',
      changes:
        'Replaces individual discrete electromechanical switches and hot-swap sockets with a 3-layer screen-printed polyester membrane sheet and molded silicone rubber dome mat.',
      tradeoffs:
        'Mushy bottom-out tactile feedback, switch lifespan drops from 100M cycles down to 5M cycles, key chatter over time, and non-repairable if a single key circuit fails.',
    },
  },

  // -------------------------------------------------------------
  // AI SUGGESTED QUESTIONS
  // -------------------------------------------------------------
  aiSuggestedQuestions: [
    'How do gold crosspoint rivets eliminate key chatter and contact bounce?',
    'What causes the satisfying acoustic "thock" sound versus a high-pitched "clack"?',
    'Why do high-end custom keyboards use gasket mounts instead of rigid screw-in plates?',
    'What is the tribological benefit of pairing a POM stem with a Nylon base housing?',
    'How does Full N-Key Rollover (NKRO) use diodes to prevent matrix key ghosting?',
  ],
};

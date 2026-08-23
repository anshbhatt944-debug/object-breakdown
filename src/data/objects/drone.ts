import { ObjectBreakdownData, ComponentNode, FailureMode, ConfidenceLevel } from '../../types/objectData';

type ComponentArgs = {
  id: string; name: string; category: string; meshKey: string;
  explodeVector: [number, number, number]; color: string;
  materialName: string; materialType: ComponentNode['material']['type']; density: string;
  function: string; connectedTo: string[];
  grade?: string; tensileStrength?: string; elasticModulus?: string; thermalConductivity?: string; electricalConductivity?: string;
  dimensions?: string; weight?: string; motion?: string; forces?: string;
  manufacturing?: string; machinery?: string; tolerance?: string; risks?: string[];
  failureModes?: FailureMode[]; reason?: string; confidence?: ConfidenceLevel;
  notes?: string[]; principles?: string[]; interfaces?: string[]; inspection?: string[]; evidence?: string;
};

const component = (a: ComponentArgs): ComponentNode => ({
  id: a.id,
  name: a.name,
  cadId: `DRN-${a.id.toUpperCase()}`,
  category: a.category,
  meshKey: a.meshKey,
  explodeVector: a.explodeVector,
  defaultColor: a.color,
  sourceMeshName: a.meshKey,
  material: {
    name: a.materialName,
    grade: a.grade || 'Typical reference configuration — exact model specification unknown',
    type: a.materialType,
    density: a.density,
    tensileStrength: a.tensileStrength,
    elasticModulus: a.elasticModulus,
    thermalConductivity: a.thermalConductivity,
    electricalConductivity: a.electricalConductivity,
  },
  function: a.function,
  manufacturing: {
    process: a.manufacturing || 'Application-specific UAV component manufacture and final assembly',
    machinery: a.machinery || 'CNC machining, injection molding and automated PCB assembly',
    tolerance: a.tolerance || 'Model-dependent',
    defectRisks: a.risks || ['Assembly misalignment', 'Vibration loosening', 'Electrical connection failure'],
  },
  dimensions: { formatted: a.dimensions || 'Exact dimensions are not encoded in the supplied GLB', weight: a.weight },
  mechanicalRole: { forces: a.forces, motion: a.motion || 'Static relative to airframe' },
  connectedTo: a.connectedTo,
  failureModes: a.failureModes || [{
    mode: 'Functional degradation',
    cause: 'Impact, vibration, wear, contamination or electrical overload',
    mitigation: 'Inspection, balancing, secure fastening and operation within design limits',
    severity: 'High',
  }],
  engineeringReason: a.reason || 'Grouped from the supplied animated GLB into a logical engineering assembly so the viewer teaches function instead of exposing raw mesh names.',
  dataConfidence: a.confidence || 'Typical',
  technicalNotes: a.notes,
  designPrinciples: a.principles,
  interfaces: a.interfaces,
  inspectionPoints: a.inspection,
  evidence: a.evidence,
  confidenceReason: 'The supplied GLB defines geometry and assembly hierarchy, but not an exact manufacturer, datasheet or certified operating specification. Numerical values below are therefore typical engineering reference values for a consumer/prosumer quadcopter class, not claimed exact values for this specific asset.',
});

const referenceMassKg = 1.35;
const referenceBatteryWh = 76.96; // 4S, 14.8 V nominal, 5.2 Ah
const referenceHoverPowerW = 230;

export const droneData: ObjectBreakdownData = {
  id: 'drone',
  name: 'Quadcopter Drone',
  category: 'Aerospace & Robotics',
  subtitle: 'Four-Rotor Unmanned Aerial Vehicle',
  heroTagline: 'A flight-control computer continuously converts sensor data and pilot intent into four independent thrust commands, balancing aerodynamics, power electronics and lightweight structures in real time.',
  thumbnail: 'drone',
  complexityScore: { overall: 9.2, mechanical: 8.4, electrical: 9.3, material: 8.1, manufacturing: 8.5, assembly: 8.9 },
  stats: { componentCount: 15, materialCount: 7, manufacturingStages: 10, movingParts: 16, approxCostUsd: '$300–$2,000 reference class', productionVolume: 'Consumer / prosumer UAV production' },
  summary: 'A conventional quadcopter generates lift with four fixed-pitch propellers. The flight controller measures angular motion and attitude, compares them with the commanded state, and changes individual motor thrust through electronic speed controllers. Alternating clockwise and counter-clockwise rotors cancel net reaction torque in hover; controlled torque imbalance produces yaw.',
  engineeringDisciplines: ['Flight Dynamics & Control', 'Rotor Aerodynamics', 'Electric Propulsion', 'Embedded Electronics', 'Power Systems', 'Lightweight Structures', 'Computer Vision'],

  rootComponents: [
    component({
      id:'drone-top-structure', name:'Top Electronics Cover & Plates', category:'Structural / Avionics', meshKey:'Object_96 + Object_99 + Object_102', explodeVector:[0,2.5,0.3], color:'#64748b',
      materialName:'Engineering polymer / composite panels', materialType:'Composite', density:'~1.3–1.9 g/cm³', grade:'Glass-filled polymer or thin composite laminate', tensileStrength:'~70–250 MPa depending on material',
      function:'Protects the upper electronics volume while providing removable mounting and service access for the avionics stack.', connectedTo:['drone-top-board','drone-upper-body'], dimensions:'Thin cover assembly; exact thickness not encoded',
      manufacturing:'Injection molding or composite lay-up followed by trimming and drilling', machinery:'Injection mold press / CNC trimming fixture', tolerance:'Typical cover fit ±0.2–0.5 mm',
      notes:['The source model represents this as several plates rather than one monolithic cover.','Low mass above the centre of gravity reduces inertia and improves attitude response.'],
      principles:['Use ribs and curvature to raise bending stiffness without a large mass penalty.','Make service panels removable without disturbing the primary structural load path.'],
      inspection:['Check for cracks around fastener bosses and latch points.','Verify that vents and cable exits are not blocked.'],
      reason:'The enclosure is deliberately non-load-bearing where possible: primary loads should remain in the chassis while the shell focuses on protection, aerodynamics and service access.'
    }),
    component({
      id:'drone-top-board', name:'Top Control Board', category:'Electronics', meshKey:'Object_105–Object_117', explodeVector:[0,3.2,0.9], color:'#10b981',
      materialName:'FR-4 PCB with semiconductor and passive components', materialType:'Composite', density:'~1.85–1.95 g/cm³', grade:'FR-4 glass-fibre / epoxy laminate', electricalConductivity:'Copper traces ~5.8×10⁷ S/m',
      function:'Provides interconnection, auxiliary power routing and board-level control or sensing functions for the upper avionics assembly.', connectedTo:['drone-flight-electronics','drone-top-structure'], dimensions:'Typical board class: ~50–100 mm; exact footprint model-dependent',
      manufacturing:'Multilayer PCB fabrication, reflow soldering and conformal-coating where required', machinery:'SMT pick-and-place + reflow oven + AOI', tolerance:'Fine-pitch SMT placement typically <±0.1 mm',
      notes:['FR-4 is the standard glass-fibre/epoxy laminate used for rigid PCBs.','High-current propulsion paths should be physically separated from sensitive sensor and RF paths.'],
      interfaces:['Power input / regulation','Flight-controller data buses','Auxiliary sensors or payload electronics'],
      inspection:['Inspect solder joints, connector retention and PCB standoff holes.','Look for heat discoloration near power regulators.'],
      failureModes:[{mode:'Intermittent electrical connection',cause:'Vibration fatigue, cracked solder joints or loose connectors',mitigation:'Strain relief, locking connectors, vibration isolation and post-assembly inspection',severity:'High'}]
    }),
    component({
      id:'drone-flight-electronics', name:'Flight Electronics Stack', category:'Avionics', meshKey:'Object_120', explodeVector:[0,1.1,3.1], color:'#22c55e',
      materialName:'FR-4 PCB, MEMS inertial sensors and semiconductor packages', materialType:'Semiconductor', density:'~1.9 g/cm³ substrate', grade:'Embedded flight-control electronics',
      function:'Measures vehicle motion, estimates attitude and executes the control loop that converts desired roll, pitch, yaw and collective thrust into individual motor commands.', connectedTo:['drone-top-board','drone-receiver','drone-battery','drone-motor-group'], dimensions:'Typical flight controller: ~30–60 mm square, 5–15 g',
      manufacturing:'SMT assembly, firmware flashing, IMU calibration and functional test', machinery:'SMT line + in-circuit test + sensor calibration fixture', tolerance:'Sensor alignment and vibration isolation are more critical than dimensional tolerance',
      forces:'Control loop reference: angular-rate sensing typically hundreds to thousands of samples per second; exact rate is firmware-dependent.',
      notes:['The controller closes a feedback loop: sensor measurement → state estimate → control law → motor commands.','A typical stack contains gyroscope and accelerometer sensing; navigation sensors may be connected separately.','PX4/ArduPilot architectures allocate desired thrust and torque into individual actuator commands based on airframe geometry.'],
      principles:['Keep the IMU close to the rigid central structure.','Isolate the sensor from high-frequency motor and propeller vibration without allowing low-frequency structural motion.'],
      interfaces:['Receiver/control input','IMU sensor buses','ESC motor outputs','Battery monitoring','Optional GPS, compass and telemetry'],
      inspection:['Verify IMU calibration and vibration levels.','Check failsafe behaviour and motor-order mapping before flight.'],
      reason:'The flight controller is placed near the mass centre because that location experiences less structural amplification and gives the control system a cleaner representation of rigid-body motion.'
    }),
    component({
      id:'drone-receiver', name:'Receiver & Input Module', category:'Communications', meshKey:'Object_123 + Object_126', explodeVector:[-3.0,1.0,2.0], color:'#14b8a6',
      materialName:'FR-4 PCB with RF transceiver, filters and antenna feed', materialType:'Composite', density:'~1.9 g/cm³', grade:'Digital radio-control receiver',
      function:'Receives pilot or external control commands and transfers them to the flight electronics using a digital or PWM-style interface.', connectedTo:['drone-flight-electronics'], dimensions:'Typical receiver module: 20–60 mm, <15 g',
      manufacturing:'SMT RF assembly and antenna test', machinery:'SMT line + RF network analyzer / production test', tolerance:'RF impedance and antenna routing are layout-critical',
      notes:['The exact radio frequency and protocol are not encoded by the GLB.','Receiver placement should reduce shielding and electromagnetic interference from high-current motor wiring.'],
      principles:['Maintain antenna clearance and polarization diversity where supported.','Keep RF cables away from switching power and ESC current loops.'],
      interfaces:['RF antenna','Digital control bus','Regulated low-voltage power'],
      failureModes:[{mode:'Control-link loss',cause:'RF interference, antenna damage, shielding or insufficient signal margin',mitigation:'Antenna diversity, failsafe logic and link-quality monitoring',severity:'Critical'}]
    }),
    component({
      id:'drone-battery', name:'Rechargeable Battery Pack & Connector', category:'Power System', meshKey:'Object_129 + Object_132', explodeVector:[0,-3.8,0.6], color:'#f59e0b',
      materialName:'Lithium-polymer cell pack with high-current connector', materialType:'Composite', density:'~1.9–2.1 g/cm³ cell-pack equivalent', grade:'Reference configuration: 4S 5.2 Ah LiPo, 14.8 V nominal',
      function:'Stores electrical energy and supplies high current to the propulsion system plus regulated power to avionics and payload electronics.', connectedTo:['drone-flight-electronics','drone-motor-group'], dimensions:'Reference pack: ~150 × 50 × 35 mm; ~450–550 g', weight:'Reference: ~0.50 kg',
      manufacturing:'Cell stacking, tab welding, pouch sealing, BMS/protection integration and pack testing', machinery:'Cell welding + impedance tester + formation / QA equipment', tolerance:'Cell matching and internal resistance consistency are critical',
      forces:'Reference energy = 14.8 V × 5.2 Ah = 76.96 Wh. Reference hover endurance at 230 W and 85% usable energy ≈ 17 min before reserve.',
      notes:['LiPo packs are common where high discharge capability and low mass matter.','Battery energy is better expressed in Wh than mAh when comparing packs of different voltages.','Voltage sag rises with current because internal resistance causes V_drop = I·R.'],
      principles:['Mount close to the centre of gravity to reduce trim change.','Use strain-relieved high-current connectors and monitor cell voltage under load.'],
      interfaces:['Main power connector','Power distribution / ESC input','Battery voltage and current sensing'],
      inspection:['Check swelling, punctures, damaged insulation and connector heating.','Verify secure retention and balanced cell voltages before flight.'],
      failureModes:[{mode:'Voltage sag or thermal runaway risk',cause:'Excessive current, cell damage, over-discharge or mechanical puncture',mitigation:'Current limits, low-voltage cutoff, protected storage and immediate removal of damaged packs',severity:'Critical'}],
      reason:'Battery placement is a control problem as much as a packaging problem: shifting a large battery away from the centre of gravity increases the control effort required to maintain attitude.'
    }),
    component({
      id:'drone-bottom-frame', name:'Central Bottom Frame & Standoffs', category:'Structural Chassis', meshKey:'Object_135–Object_156', explodeVector:[0,-0.8,-3.4], color:'#64748b',
      materialName:'Carbon-fibre reinforced composite with metal standoffs and fasteners', materialType:'Composite', density:'~1.55–1.70 g/cm³ composite', grade:'Woven CFRP laminate / aluminum standoffs', tensileStrength:'~500–1,000 MPa along fibre direction', elasticModulus:'~50–100 GPa laminate-dependent',
      function:'Creates the central load path supporting avionics, shell, camera and propulsion interfaces while maintaining motor geometry under manoeuvre and landing loads.', connectedTo:['drone-upper-body','drone-lower-body','drone-camera-base','drone-landing-gear','drone-motor-mounts'], dimensions:'Central chassis envelope model-dependent; structural stack spans the airframe centre',
      manufacturing:'Composite cutting/lay-up or molded laminate, CNC drilling and standoff assembly', machinery:'CNC router / waterjet + drilling fixture + torque-controlled assembly', tolerance:'Motor and standoff hole pattern typically held within ~±0.1–0.3 mm',
      forces:'Primary loads include motor thrust reactions, arm bending moments, landing impact loads and vibration transmission.',
      notes:['A stiff central chassis helps preserve sensor alignment and rotor geometry.','Carbon-fibre strength is directional; drilled holes and point impacts require local reinforcement.'],
      inspection:['Inspect for delamination, whitening, crushed fibres and loose standoffs.','Check fastener torque and crack growth around holes.'],
      failureModes:[{mode:'Delamination or structural crack',cause:'Hard impact, stress concentration at holes or repeated vibration',mitigation:'Local reinforcement, controlled torque, periodic inspection and damage limits',severity:'Critical'}]
    }),
    component({
      id:'drone-lower-body', name:'Lower Body Shell & Ventilation', category:'Structural Enclosure', meshKey:'Object_159 + Object_162', explodeVector:[0,-2.6,-0.4], color:'#475569',
      materialName:'Impact-resistant engineering polymer', materialType:'Polymer', density:'~1.1–1.3 g/cm³', grade:'ABS/PC or glass-filled nylon class',
      function:'Completes the lower enclosure, protects internal hardware and provides airflow, service and cable-routing geometry.', connectedTo:['drone-upper-body','drone-bottom-frame'], dimensions:'Thin-wall enclosure; exact thickness not encoded',
      manufacturing:'Injection molding with secondary trimming and threaded-insert installation', machinery:'Injection mold press + trimming fixture', tolerance:'Typical molded fit ±0.2–0.5 mm',
      notes:['Ventilation matters because ESCs, motors and voltage regulators convert part of their electrical power into heat.','The GLB does not define a validated airflow path or thermal model.'],
      principles:['Use generous radii to reduce stress concentration.','Separate splash/debris protection from intentional cooling paths.']
    }),
    component({
      id:'drone-upper-body', name:'Upper Body Shell', category:'Structural Enclosure', meshKey:'Object_165', explodeVector:[0,3.4,-0.3], color:'#334155',
      materialName:'Glass-filled engineering polymer / lightweight composite', materialType:'Composite', density:'~1.4 g/cm³', grade:'Ribbed lightweight enclosure',
      function:'Protects the upper electronics volume and forms the visible aerodynamic enclosure around the central chassis.', connectedTo:['drone-lower-body','drone-top-structure','drone-bottom-frame'], dimensions:'Primary shell spans central fuselage; exact size from asset scale only',
      manufacturing:'Injection molding or composite shell molding', machinery:'Mold tooling + trimming / drilling', tolerance:'Panel alignment typically ±0.3 mm class',
      notes:['Curved surfaces and internal ribs increase stiffness compared with a flat panel of equal thickness.','The shell should not become the only load path for propulsion loads.'],
      principles:['Protect electronics while maintaining cooling and RF transparency where needed.','Use sacrificial or replaceable panels for impact-prone regions.']
    }),
    component({
      id:'drone-camera-base', name:'Camera Mount & Base', category:'Payload Mount', meshKey:'Object_168 + Object_171–Object_180', explodeVector:[0,-2.3,2.8], color:'#8b5cf6',
      materialName:'Aluminum / engineering polymer with steel fasteners', materialType:'Composite', density:'~2.0 g/cm³ equivalent', grade:'Payload bracket with vibration isolation interfaces',
      function:'Positions the imaging payload below the airframe and transfers camera and manoeuvre loads into the chassis while managing vibration.', connectedTo:['drone-camera','drone-bottom-frame'], dimensions:'Model-dependent bracket and retaining hardware',
      manufacturing:'CNC machining, molding and threaded assembly', machinery:'3–5 axis CNC + torque-controlled assembly', tolerance:'Camera alignment and screw preload are critical',
      forces:'Camera mount sees gravity, manoeuvre acceleration and motor-induced vibration; excessive resonance directly degrades image quality.',
      notes:['Payload mounts trade stiffness against vibration isolation.','Soft isolators can attenuate high-frequency vibration but may introduce low-frequency motion if too compliant.'],
      principles:['Keep the camera optical axis repeatable after assembly.','Avoid resonant frequencies near dominant rotor harmonics.'],
      inspection:['Check isolator cracking, screw preload and optical-axis alignment.']
    }),
    component({
      id:'drone-camera', name:'Camera Assembly & Retaining Screws', category:'Imaging Payload', meshKey:'Object_183 + Object_186–Object_192', explodeVector:[0,-4.0,3.8], color:'#38bdf8',
      materialName:'Optical glass, aluminum, polymer and electronic assemblies', materialType:'Glass', density:'Mixed materials', grade:'Stabilized digital imaging payload',
      function:'Captures visual data for inspection, navigation, recording or remote observation.', connectedTo:['drone-camera-base'], dimensions:'Sensor, focal length and resolution not encoded in GLB',
      manufacturing:'Optical module assembly, sensor alignment and electronic calibration', machinery:'Optical alignment station + clean assembly + calibration target', tolerance:'Lens/sensor alignment typically micron-scale internally',
      notes:['Mechanical vibration can create blur and rolling-shutter artifacts.','Camera specifications are intentionally treated as model-dependent because the asset does not provide an optical datasheet.'],
      interfaces:['Mechanical mount','Power and data link','Optional stabilization/gimbal control'],
      failureModes:[{mode:'Image blur or intermittent video',cause:'Vibration, loose mount, contaminated lens or connector failure',mitigation:'Isolation tuning, fastener inspection, lens cleaning and connector strain relief',severity:'Medium'}]
    }),
    component({
      id:'drone-landing-gear', name:'Landing Gear Set', category:'Landing Structure', meshKey:'Object_195–Object_204', explodeVector:[0,-4.3,-1.8], color:'#94a3b8',
      materialName:'Glass-filled nylon / engineering polymer', materialType:'Polymer', density:'~1.25–1.45 g/cm³', grade:'Impact-tolerant molded landing structure', tensileStrength:'~70–160 MPa',
      function:'Provides ground clearance for the payload and transfers landing loads into the central frame while absorbing limited impact energy through controlled flex.', connectedTo:['drone-bottom-frame'], dimensions:'Ground-clearance geometry defined by model; exact scale not a certified dimension',
      manufacturing:'Injection molding with optional elastomer foot pads', machinery:'Injection mold press + assembly fixture', tolerance:'Symmetry and mounting alignment are more important than cosmetic surface tolerance',
      forces:'For a 1.35 kg reference drone, a 3 g hard landing corresponds to ~39.7 N total inertial load before local impact amplification.',
      principles:['Use controlled elastic deformation to reduce peak load.','Maintain camera clearance and avoid propeller contact with the ground.'],
      inspection:['Check feet, struts and frame mounting points for stress whitening or cracks.']
    }),
    component({
      id:'drone-propeller-group', name:'Propeller Set (4 Rotors)', category:'Propulsion', meshKey:'Object_207 + Object_216 + Object_225 + Object_234', explodeVector:[0,4.5,0], color:'#e2e8f0',
      materialName:'Glass- or carbon-fibre reinforced polymer', materialType:'Composite', density:'~1.25–1.55 g/cm³', grade:'Reference aerodynamic class: 10 in fixed-pitch rotor',
      function:'Generate thrust by accelerating air downward. Opposite rotor pairs spin in opposite directions so reaction torque cancels in hover and can be intentionally unbalanced for yaw.', connectedTo:['drone-motor-group','drone-prop-fasteners'], motion:'High-speed rotation; reference operating envelope ~2,000–8,000 RPM depending on prop and load', dimensions:'Reference diameter: 10 in (0.254 m); pitch model-dependent',
      manufacturing:'Injection molding or composite compression molding followed by balancing', machinery:'Precision mold + dynamic/static balancing fixture', tolerance:'Blade mass and balance must be tightly matched across a rotor pair',
      forces:'Rotor thrust follows the scaling T ≈ C_T·ρ·n²·D⁴. Diameter has a fourth-power influence in this simplified coefficient model.',
      notes:['Momentum theory describes thrust as the result of changing airflow momentum through the rotor disk.','CW and CCW propellers are not interchangeable in a conventional torque-balanced quad configuration.','Small chips can create imbalance, vibration and a disproportionate fatigue load on bearings and the camera mount.'],
      principles:['Large disk area can produce required thrust at lower induced velocity, improving hover efficiency.','Blade stiffness must prevent excessive twist while keeping rotational inertia low.'],
      inspection:['Check chips, cracks, hub damage and imbalance.','Verify correct CW/CCW placement and secure retention.'],
      failureModes:[{mode:'Blade fracture or severe imbalance',cause:'Impact damage, fatigue, loose hub or foreign-object strike',mitigation:'Pre-flight inspection, immediate replacement of damaged blades and correct torque retention',severity:'Critical'}]
    }),
    component({
      id:'drone-motor-group', name:'Brushless Motor Assemblies (4)', category:'Propulsion', meshKey:'Object_213 + Object_222 + Object_231 + Object_240', explodeVector:[0,2.7,0], color:'#ef4444',
      materialName:'Aluminum housing, copper windings, steel shaft and permanent magnets', materialType:'Composite', density:'Mixed materials', grade:'Reference class: outrunner BLDC, ~800–1,000 kV on 4S', electricalConductivity:'Copper windings ~5.8×10⁷ S/m',
      function:'Convert electrical power into controlled shaft torque. Independent rotor-speed changes create the differential thrust required for roll, pitch, yaw and altitude control.', connectedTo:['drone-flight-electronics','drone-battery','drone-propeller-group','drone-motor-mounts'], motion:'High-speed rotation; reference no-load speed n₀ ≈ kV·V, loaded RPM lower', dimensions:'Reference motor class: ~28–35 mm stator diameter',
      manufacturing:'Stator lamination stacking, automated copper winding, magnet bonding, bearing installation and dynamic balance', machinery:'Coil winder + magnet insertion fixture + balancing station', tolerance:'Bearing fit and rotor concentricity are critical',
      forces:'For hover at 1.35 kg, each rotor provides roughly 3.31 N on average; aggressive manoeuvres require substantial thrust margin above this value.',
      notes:['The ESC electronically commutates phase current to maintain a rotating magnetic field.','Motor kV is approximately the no-load speed constant in RPM/V; it is not a direct power rating.','Motor-prop matching determines current draw, efficiency, thermal loading and response.'],
      interfaces:['Three-phase ESC output','Propeller hub','Structural motor mount'],
      inspection:['Check bearing roughness, shaft play, winding discoloration and loose magnets.','Verify all motors start consistently and follow the correct rotation direction.'],
      failureModes:[{mode:'Loss of thrust',cause:'ESC failure, bearing seizure, winding overheating or mechanical damage',mitigation:'Current/temperature monitoring, pre-flight motor test and immediate landing on abnormal vibration',severity:'Critical'}],
      reason:'An outrunner BLDC provides high torque at relatively low mass, allowing direct propeller drive without a gearbox.'
    }),
    component({
      id:'drone-prop-fasteners', name:'Propeller Bolts, Nuts & Caps', category:'Mechanical Fastening', meshKey:'Object_210–Object_264', explodeVector:[0,5.8,0], color:'#cbd5e1',
      materialName:'Steel / aluminum fasteners', materialType:'Metal', density:'~7.8 g/cm³ steel', grade:'High-strength metric fastener class, exact grade unknown', tensileStrength:'Typical steel fastener class: ~400–1,000 MPa',
      function:'Retain the propellers and hub hardware on the motor assemblies while resisting vibration, centrifugal loading and cyclic torque.', connectedTo:['drone-propeller-group','drone-motor-group'], dimensions:'Exact thread and torque specification not encoded',
      manufacturing:'Cold heading, thread rolling and protective coating', machinery:'Cold former + thread roller + torque/inspection gauges', tolerance:'Thread fit and preload must match hub design',
      forces:'Fastener preload must remain high enough to resist slip without overstressing lightweight hubs or motor threads.',
      notes:['Fastener security is flight-critical because propeller separation can cause immediate loss of control.','Thread-locking strategy depends on temperature, vibration and service requirements.'],
      inspection:['Check preload, thread condition and hub seating.','Replace deformed or stripped hardware rather than re-torquing repeatedly.'],
      failureModes:[{mode:'Propeller retention loss',cause:'Insufficient preload, vibration loosening or damaged threads',mitigation:'Correct torque procedure, locking features and regular inspection',severity:'Critical'}]
    }),
    component({
      id:'drone-motor-mounts', name:'Motor Mounts & Fasteners', category:'Structural Interface', meshKey:'Object_267–Object_324', explodeVector:[0,1.3,-2.9], color:'#a78bfa',
      materialName:'Aluminum mounts with steel fasteners', materialType:'Metal', density:'~2.7–7.8 g/cm³', grade:'6061/7075-class aluminum interface, exact alloy unknown', tensileStrength:'~275–570 MPa depending on alloy and temper', elasticModulus:'~69 GPa for aluminum',
      function:'Secure the four motor assemblies to the frame and transmit thrust, torque and vibration loads into the airframe while preserving rotor alignment.', connectedTo:['drone-bottom-frame','drone-motor-group'], dimensions:'Repeated four-corner mount geometry',
      manufacturing:'CNC machining or die-casting followed by drilling, deburring and fastener assembly', machinery:'CNC machining centre + torque-controlled assembly', tolerance:'Motor bolt pattern and perpendicularity are alignment-critical',
      forces:'Each mount transmits thrust, motor reaction torque and cyclic vibration into the frame; bending moment rises with arm offset from the central chassis.',
      notes:['The source model contains four repeated mounts and many fasteners; they are grouped as one serviceable subsystem.','Mount stiffness affects alignment, vibration transmission and fatigue life.'],
      inspection:['Inspect for cracked arms, elongated holes and loose fasteners.','Check motor face remains perpendicular to the intended thrust axis.'],
      failureModes:[{mode:'Mount fatigue crack or loosening',cause:'Repeated vibration, impact overload or incorrect fastener torque',mitigation:'Proper preload, fillets, periodic inspection and replacement after crash damage',severity:'Critical'}]
    }),
  ],

  materials: [
    { name:'Carbon-Fibre Reinforced Composite', percentage:22, color:'#334155', category:'Composite', usedIn:['Central bottom frame','Structural plates'], properties:[{key:'Density',value:'~1.55–1.70 g/cm³'},{key:'Key property',value:'High specific stiffness'},{key:'Design concern',value:'Anisotropic and impact-sensitive'}], advantages:['Excellent stiffness-to-weight ratio','Low structural mass','Good fatigue resistance in fibre direction'], disadvantages:['Costly','Can delaminate after impact','Electrical conductivity can complicate RF isolation'], alternatives:['6061 aluminum','Glass-fibre composite'], selectionRationale:'Keeps the central chassis stiff enough to preserve rotor and sensor geometry without carrying a large mass penalty.' },
    { name:'Engineering Polymer', percentage:24, color:'#64748b', category:'Polymer', usedIn:['Upper/lower shell','Landing gear'], properties:[{key:'Density',value:'~1.1–1.4 g/cm³'},{key:'Strength',value:'Material-dependent; typically tens to low hundreds of MPa'}], advantages:['Complex geometry','Low mass','Electrical insulation'], disadvantages:['Lower heat resistance than metals','Creep and UV aging can matter'], alternatives:['Thin aluminum sheet','Composite shell'], selectionRationale:'Well suited to protective, aerodynamic and non-primary-load-bearing geometry.' },
    { name:'Aluminum Alloy', percentage:16, color:'#94a3b8', category:'Metal', usedIn:['Motor mounts','Camera bracket','Standoffs'], properties:[{key:'Density',value:'~2.70 g/cm³'},{key:'Elastic modulus',value:'~69 GPa'},{key:'Thermal conductivity',value:'High compared with polymers'}], advantages:['Machinable','Stiff','Good heat spreading'], disadvantages:['Heavier than composites','Fatigue design required'], alternatives:['CFRP','Magnesium alloy'], selectionRationale:'Provides precise threaded and machined interfaces around motors and payload hardware.' },
    { name:'Copper', percentage:8, color:'#f59e0b', category:'Metal', usedIn:['Motor windings','PCB traces','Power wiring'], properties:[{key:'Electrical conductivity',value:'~5.8×10⁷ S/m'},{key:'Thermal conductivity',value:'~400 W/m·K'}], advantages:['Excellent conductivity','Compact windings'], disadvantages:['Mass','Resistive heating at high current'], alternatives:['Aluminum winding'], selectionRationale:'High conductivity minimizes winding resistance and copper loss for a given conductor geometry.' },
    { name:'Permanent Magnet Material', percentage:6, color:'#ef4444', category:'Metal', usedIn:['Brushless motor rotors'], properties:[{key:'Typical class',value:'NdFeB rare-earth magnet'},{key:'Role',value:'High magnetic flux density'}], advantages:['High torque density','Compact motors'], disadvantages:['Temperature sensitivity','Material cost and supply concerns'], alternatives:['Ferrite magnets'], selectionRationale:'High energy density enables lightweight direct-drive propulsion.' },
    { name:'FR-4 & Semiconductor Assemblies', percentage:12, color:'#22c55e', category:'Electronics', usedIn:['Flight controller','Receiver','Control boards'], properties:[{key:'Substrate',value:'Glass-fibre/epoxy laminate'},{key:'Role',value:'Electrical interconnect + embedded computation'}], advantages:['Mature manufacturing','Dense electronics integration'], disadvantages:['Thermal hotspots','Vibration-sensitive solder joints'], alternatives:['Rigid-flex PCB','Ceramic substrate for niche high-power sections'], selectionRationale:'Allows sensing, computation, communication and power regulation in compact modules.' },
    { name:'Optical Glass & Elastomers', percentage:12, color:'#38bdf8', category:'Glass / Elastomer', usedIn:['Camera optics','Vibration isolators','Foot pads'], properties:[{key:'Role',value:'Optical transmission and vibration management'}], advantages:['High optical clarity','Tunable damping'], disadvantages:['Optics are impact-sensitive','Elastomers age with heat/UV'], alternatives:['Polymer optics','Mechanical isolation systems'], selectionRationale:'The payload needs both optical quality and isolation from propulsion vibration.' },
  ],

  howItWorks: [
    { step:1, title:'Store & Distribute Electrical Energy', description:'The reference 4S battery stores ~76.96 Wh. Power electronics distribute high current to propulsion while regulated rails feed sensitive avionics.', activeComponentIds:['drone-battery','drone-top-board'], forcesDescription:'Energy: E = V × Ah. Voltage sag under load follows V_drop = I × R_internal.' },
    { step:2, title:'Sense Motion & Receive Commands', description:'The receiver supplies desired commands while the flight electronics measure angular motion and acceleration, estimate vehicle state and calculate the error from the target state.', activeComponentIds:['drone-receiver','drone-flight-electronics'], forcesDescription:'Closed-loop control repeatedly minimizes attitude/rate error using sensor feedback.' },
    { step:3, title:'Allocate Forces to Four Motors', description:'The controller converts desired collective thrust and body torques into four motor commands according to the quadcopter geometry. ESCs then commutate the brushless motors.', activeComponentIds:['drone-flight-electronics','drone-motor-group'], forcesDescription:'Control allocation maps desired [T, τx, τy, τz] to individual rotor thrust commands.' },
    { step:4, title:'Generate Lift & Attitude Control', description:'Each propeller accelerates air downward. Increasing or decreasing selected rotor thrust changes roll and pitch moments; changing CW versus CCW rotor torque balance produces yaw.', activeComponentIds:['drone-motor-group','drone-propeller-group'], forcesDescription:'Hover condition: ΣT ≈ mg. A 1.35 kg reference mass requires ~13.24 N total, ~3.31 N per rotor.' },
    { step:5, title:'Manage Structure, Payload & Landing', description:'The chassis carries propulsion and payload loads, the camera mount manages vibration, and the landing gear provides clearance while absorbing limited impact energy.', activeComponentIds:['drone-bottom-frame','drone-camera-base','drone-camera','drone-landing-gear'], forcesDescription:'Structural design trades mass against stiffness, resonance, impact tolerance and serviceability.' },
  ],

  engineeringEquations: [
    {
      id:'eq-hover-thrust', title:'Hover Force Balance', discipline:'Mechanical',
      latex:'ΣT = mg  →  T_hover,total = m·g',
      explanation:'In steady hover, the upward thrust from all four rotors balances the vehicle weight. The per-rotor average is T_hover,total / 4 for a symmetric quadcopter.',
      variables:[
        {symbol:'ΣT',name:'Total rotor thrust',unit:'N',objectValue:'13.24 N at 1.35 kg reference mass'},
        {symbol:'m',name:'Vehicle mass',unit:'kg',objectValue:'1.35 kg reference configuration'},
        {symbol:'g',name:'Gravitational acceleration',unit:'m/s²',objectValue:'9.81 m/s²'},
      ],
      interactiveCalculator:{
        calculate:(i)=>{ const total=i.massKg*9.81; const per=total/4; return {result:total,unit:'N',formatted:`${total.toFixed(2)} N total · ${per.toFixed(2)} N/rotor`,interpretation:`This is the ideal steady-hover requirement before control margin. A practical vehicle needs additional thrust for manoeuvre, disturbance rejection and climb.`}; },
        inputs:[{key:'massKg',label:'All-Up Mass',min:0.5,max:5,step:0.05,default:referenceMassKg,unit:'kg'}]
      }
    },
    {
      id:'eq-rotor-thrust', title:'Rotor Thrust Scaling', discipline:'Fluid Mechanics',
      latex:'T = C_T · ρ · n² · D⁴',
      explanation:'A common non-dimensional rotor model estimates static thrust from thrust coefficient C_T, air density ρ, rotational speed n in revolutions per second and propeller diameter D. It is useful for scaling studies, not a substitute for a measured thrust curve.',
      variables:[
        {symbol:'T',name:'Single-rotor thrust',unit:'N'},
        {symbol:'C_T',name:'Thrust coefficient',unit:'—',objectValue:'Reference study value: 0.10'},
        {symbol:'ρ',name:'Air density',unit:'kg/m³',objectValue:'1.225 kg/m³ sea-level standard'},
        {symbol:'n',name:'Rotational speed',unit:'rev/s'},
        {symbol:'D',name:'Propeller diameter',unit:'m',objectValue:'0.254 m reference (10 in)'},
      ],
      interactiveCalculator:{
        calculate:(i)=>{ const n=i.rpm/60; const d=i.diameterIn*0.0254; const T=i.ct*1.225*n*n*Math.pow(d,4); return {result:T,unit:'N',formatted:`${T.toFixed(2)} N per rotor · ${(4*T).toFixed(2)} N total`,interpretation:`Coefficient-based estimate only. Real thrust depends strongly on blade geometry, pitch, Reynolds number, inflow, battery voltage and motor/ESC limits.`}; },
        inputs:[{key:'rpm',label:'Rotor Speed',min:2000,max:9000,step:100,default:5200,unit:'RPM'},{key:'diameterIn',label:'Propeller Diameter',min:6,max:14,step:0.5,default:10,unit:'in'},{key:'ct',label:'Thrust Coefficient Cₜ',min:0.04,max:0.18,step:0.01,default:0.10,unit:'—'}]
      }
    },
    {
      id:'eq-rotor-torque', title:'Reaction Torque & Yaw Authority', discipline:'Mechanical',
      latex:'Q = C_Q · ρ · n² · D⁵  ;  τ_yaw = Σ(±Q_i)',
      explanation:'Each rotor creates an aerodynamic reaction torque opposite its rotation. Alternating CW and CCW rotors cancel the net torque in balanced hover. Changing their relative speeds creates a net yaw moment.',
      variables:[
        {symbol:'Q',name:'Rotor reaction torque',unit:'N·m'},
        {symbol:'C_Q',name:'Torque coefficient',unit:'—',objectValue:'Reference study value: 0.012'},
        {symbol:'τ_yaw',name:'Net yaw moment',unit:'N·m'},
      ],
      interactiveCalculator:{
        calculate:(i)=>{ const n=i.rpm/60; const d=i.diameterIn*0.0254; const q=0.012*1.225*n*n*Math.pow(d,5); const yaw=q*(i.yawBias/100)*4; return {result:yaw,unit:'N·m',formatted:`${yaw.toFixed(3)} N·m estimated yaw moment`,interpretation:`The slider represents a simplified normalized CW/CCW speed bias. Actual yaw response also depends on motor inertia, controller limits and the vehicle moment of inertia.`}; },
        inputs:[{key:'rpm',label:'Reference Rotor Speed',min:2000,max:9000,step:100,default:5200,unit:'RPM'},{key:'diameterIn',label:'Propeller Diameter',min:6,max:14,step:0.5,default:10,unit:'in'},{key:'yawBias',label:'CW/CCW Torque Bias',min:0,max:25,step:1,default:8,unit:'%'}]
      }
    },
    {
      id:'eq-battery-endurance', title:'Battery Energy & Endurance Estimate', discipline:'Electrical',
      latex:'E_{Wh} = V_{nom}·C_{Ah}  ;  t ≈ η·E_{Wh}/P_{avg}',
      explanation:'Battery energy is nominal voltage multiplied by capacity. A simple endurance estimate divides usable battery energy by average electrical power; it intentionally leaves reserve and real voltage sag explicit through the usable-energy factor.',
      variables:[
        {symbol:'E',name:'Stored electrical energy',unit:'Wh',objectValue:'76.96 Wh reference'},
        {symbol:'V_nom',name:'Nominal pack voltage',unit:'V',objectValue:'14.8 V (4S reference)'},
        {symbol:'C',name:'Capacity',unit:'Ah',objectValue:'5.2 Ah reference'},
        {symbol:'P_avg',name:'Average electrical power',unit:'W',objectValue:'230 W hover-study reference'},
      ],
      interactiveCalculator:{
        calculate:(i)=>{ const wh=i.voltage*i.capacityAh; const min=(wh*i.usable/100/i.avgPower)*60; return {result:min,unit:'min',formatted:`${min.toFixed(1)} min estimated endurance`,interpretation:`Idealized energy budget. Wind, manoeuvres, battery aging, temperature and reserve requirements can materially reduce real flight time.`}; },
        inputs:[{key:'voltage',label:'Nominal Battery Voltage',min:7.4,max:25.2,step:0.1,default:14.8,unit:'V'},{key:'capacityAh',label:'Battery Capacity',min:2,max:10,step:0.1,default:5.2,unit:'Ah'},{key:'avgPower',label:'Average Electrical Power',min:100,max:1200,step:25,default:referenceHoverPowerW,unit:'W'},{key:'usable',label:'Usable Energy',min:60,max:95,step:1,default:85,unit:'%'}]
      }
    },
    {
      id:'eq-rigid-body', title:'Quadcopter Translational Dynamics', discipline:'Mechanical',
      latex:'m·a = R·[0,0,ΣT]^T − [0,0,mg]^T',
      explanation:'The total rotor thrust acts along the vehicle body thrust axis. Tilting the vehicle rotates that thrust vector into horizontal components, producing acceleration while reducing the vertical component available to oppose gravity.',
      variables:[
        {symbol:'m',name:'Vehicle mass',unit:'kg',objectValue:'1.35 kg reference'},
        {symbol:'a',name:'World-frame acceleration',unit:'m/s²'},
        {symbol:'R',name:'Body-to-world rotation matrix',unit:'—'},
        {symbol:'ΣT',name:'Total rotor thrust',unit:'N'},
      ],
      interactiveCalculator:{
        calculate:(i)=>{ const vertical=i.totalThrust*Math.cos(i.tiltDeg*Math.PI/180); const horizontal=i.totalThrust*Math.sin(i.tiltDeg*Math.PI/180); const az=(vertical-i.massKg*9.81)/i.massKg; const ax=horizontal/i.massKg; return {result:Math.hypot(ax,az),unit:'m/s²',formatted:`aₕ ${ax.toFixed(2)} m/s² · aᵥ ${az.toFixed(2)} m/s²`,interpretation:`Tilting redirects thrust: more horizontal acceleration requires more total thrust to maintain altitude.`}; },
        inputs:[{key:'massKg',label:'Vehicle Mass',min:0.5,max:5,step:0.05,default:referenceMassKg,unit:'kg'},{key:'totalThrust',label:'Total Thrust',min:10,max:120,step:1,default:25,unit:'N'},{key:'tiltDeg',label:'Tilt Angle',min:0,max:45,step:1,default:15,unit:'°'}]
      }
    },
  ],

  manufacturingTimeline: [
    {stepNumber:1,stageName:'Composite & Polymer Material Preparation',description:'Prepare carbon-fibre laminates, polymer feedstock and metal stock for structural and enclosure components.',machinery:'Prepreg freezer / cutting table / material dryer',tolerance:'Material-condition controlled',materialReq:'CFRP prepreg, nylon/PC/ABS pellets, aluminum stock',qualityChecks:['Moisture content','Fibre orientation','Material batch traceability'],commonDefects:['Void-prone laminate','Moisture-induced polymer defects']},
    {stepNumber:2,stageName:'Central Frame Fabrication',description:'Cut or machine structural plates, drill precision mounting patterns and inspect for delamination or fibre damage.',machinery:'CNC router / waterjet / drilling fixture',tolerance:'Hole pattern ~±0.1–0.3 mm class',materialReq:'CFRP laminate',qualityChecks:['Hole position','Edge finish','Delamination inspection'],commonDefects:['Delamination','Fibre pull-out','Misaligned holes']},
    {stepNumber:3,stageName:'Injection-Molded Enclosures',description:'Mold upper/lower shell and landing components, then trim gates and install inserts where required.',machinery:'Injection mold press + trimming fixture',tolerance:'Typical fit ±0.2–0.5 mm',materialReq:'Engineering polymer pellets',qualityChecks:['Warp','Sink marks','Insert retention'],commonDefects:['Warping','Short shots','Stress whitening']},
    {stepNumber:4,stageName:'Motor Manufacturing & Balance',description:'Assemble stator laminations, wind copper coils, bond magnets and install bearings before electrical and balance tests.',machinery:'Automated coil winder + magnet fixture + balancing station',tolerance:'Concentricity / balance controlled',materialReq:'Copper, electrical steel, magnets, bearings',qualityChecks:['Winding resistance','Back-EMF consistency','Rotor balance'],commonDefects:['Uneven winding','Magnet misalignment','Bearing preload error']},
    {stepNumber:5,stageName:'Propeller Molding & Balancing',description:'Form fibre-reinforced blades and verify mass, pitch consistency and static/dynamic balance.',machinery:'Precision mold + balancing fixture',tolerance:'Mass/pitch matched within production specification',materialReq:'Reinforced polymer or composite',qualityChecks:['Blade mass','Hub runout','Balance'],commonDefects:['Warp','Voids','Imbalance']},
    {stepNumber:6,stageName:'PCB Fabrication & SMT Assembly',description:'Fabricate control boards and populate flight electronics, receiver and power-management circuitry.',machinery:'SMT pick-and-place + reflow oven + AOI',tolerance:'Fine-pitch placement typically <±0.1 mm',materialReq:'FR-4, copper, semiconductors, passives',qualityChecks:['AOI','Electrical continuity','Firmware boot'],commonDefects:['Solder bridging','Tombstoning','Connector misalignment']},
    {stepNumber:7,stageName:'Chassis & Avionics Integration',description:'Install standoffs, electronics, wiring and battery interface while controlling cable routing and connector strain relief.',machinery:'Assembly jig + torque drivers + ESD workstation',tolerance:'Stack alignment controlled',materialReq:'Frame, boards, harnesses, fasteners',qualityChecks:['Connector lock','Fastener torque','Cable clearance'],commonDefects:['Pinched harness','Loose fastener','Incorrect connector polarity']},
    {stepNumber:8,stageName:'Propulsion Installation',description:'Mount motors and propeller interfaces, verify motor order and rotation direction, and configure ESC outputs.',machinery:'Torque driver + ESC programming/test stand',tolerance:'Motor-axis alignment controlled',materialReq:'Motors, ESCs, mounts, prop hardware',qualityChecks:['Motor order','CW/CCW direction','Current consistency'],commonDefects:['Wrong rotation','Loose mount','Phase connection error']},
    {stepNumber:9,stageName:'Sensor Calibration & Control Setup',description:'Calibrate IMU and input systems, establish failsafes and validate control allocation before flight testing.',machinery:'Calibration fixture + ground-control software',tolerance:'Bias and alignment calibration',materialReq:'Assembled aircraft',qualityChecks:['IMU bias','Level calibration','Failsafe'],commonDefects:['Poor vibration isolation','Incorrect frame orientation','Failsafe misconfiguration']},
    {stepNumber:10,stageName:'End-of-Line Functional Test',description:'Perform restrained motor test, communication checks and controlled flight/hover validation with data logging.',machinery:'Motor test stand + protected flight test area',tolerance:'System performance within test envelope',materialReq:'Completed aircraft',qualityChecks:['Vibration','Current draw','Control response','Telemetry'],commonDefects:['Unexpected oscillation','Thermal hotspot','Propeller imbalance']},
  ],

  relationships: [
    {sourceId:'drone-battery',targetId:'drone-flight-electronics',interactionType:'conducts',description:'The battery supplies electrical energy; regulated rails and sensing circuits power the flight-control system.'},
    {sourceId:'drone-flight-electronics',targetId:'drone-motor-group',interactionType:'couples',description:'The control system allocates desired thrust and torque into four motor commands that the ESC/motor system converts into rotor speed.'},
    {sourceId:'drone-motor-group',targetId:'drone-propeller-group',interactionType:'rotates',description:'Motor shaft torque accelerates the propeller; aerodynamic loading then determines steady operating RPM and thrust.'},
    {sourceId:'drone-propeller-group',targetId:'drone-prop-fasteners',interactionType:'locks',description:'Hub hardware maintains propeller retention and preload against vibration and cyclic torque.'},
    {sourceId:'drone-motor-mounts',targetId:'drone-bottom-frame',interactionType:'transfers',description:'Thrust, reaction torque and vibration loads travel from the propulsion units into the central structural chassis.'},
    {sourceId:'drone-receiver',targetId:'drone-flight-electronics',interactionType:'conducts',description:'Pilot or external control commands are delivered to the flight-control logic for interpretation and failsafe handling.'},
    {sourceId:'drone-camera-base',targetId:'drone-camera',interactionType:'supports',description:'The mount positions the camera and manages the trade-off between stiffness and vibration isolation.'},
    {sourceId:'drone-landing-gear',targetId:'drone-bottom-frame',interactionType:'dampens',description:'Landing loads are transferred into the chassis while controlled flex and foot materials reduce peak impact force.'},
    {sourceId:'drone-upper-body',targetId:'drone-flight-electronics',interactionType:'supports',description:'The enclosure protects the avionics environment without becoming the primary load path for propulsion forces.'},
  ],

  whatIfParameters: [
    {id:'payload-mass',label:'Payload Mass',component:'Flight Mass Budget',min:0,max:1.5,defaultValue:0.25,unit:'kg',impactMetrics:[
      {name:'Hover Thrust Required',calculate:(v)=>{const total=(referenceMassKg+v)*9.81; const pct=(total/(referenceMassKg*9.81)-1)*100; return {changePercent:pct,valueStr:`${total.toFixed(1)} N`,status:v>0.9?'warning':'optimal',explanation:'More payload raises the thrust required simply to hover and reduces available acceleration margin.'};}},
      {name:'Estimated Endurance',calculate:(v)=>{const power=referenceHoverPowerW*Math.pow((referenceMassKg+v)/referenceMassKg,1.25); const min=referenceBatteryWh*0.85/power*60; const pct=(min/(referenceBatteryWh*0.85/referenceHoverPowerW*60)-1)*100; return {changePercent:pct,valueStr:`${min.toFixed(1)} min`,status:v>1.0?'critical':v>0.6?'warning':'optimal',explanation:'Illustrative scaling: higher mass usually requires more induced power, reducing endurance.'};}},
    ]},
    {id:'prop-diameter',label:'Propeller Diameter',component:'Rotor Aerodynamics',min:6,max:14,defaultValue:10,unit:'in',impactMetrics:[
      {name:'Relative Thrust Scaling',calculate:(v)=>{const ratio=Math.pow(v/10,4); return {changePercent:(ratio-1)*100,valueStr:`${ratio.toFixed(2)}×`,status:v>12?'warning':'optimal',explanation:'At fixed RPM and thrust coefficient, the simplified model scales thrust with D⁴; real motors may not sustain the same RPM.'};}},
      {name:'Rotor Disk Area',calculate:(v)=>{const area=4*Math.PI*Math.pow(v*0.0254/2,2); const pct=(area/(4*Math.PI*Math.pow(0.254/2,2))-1)*100; return {changePercent:pct,valueStr:`${area.toFixed(3)} m²`,status:v>12?'warning':'optimal',explanation:'More disk area can improve hover efficiency but increases arm clearance, inertia and structural requirements.'};}},
    ]},
    {id:'battery-capacity',label:'Battery Capacity',component:'Energy Storage',min:2,max:10,defaultValue:5.2,unit:'Ah',impactMetrics:[
      {name:'Stored Energy',calculate:(v)=>{const wh=14.8*v; const pct=(wh/referenceBatteryWh-1)*100; return {changePercent:pct,valueStr:`${wh.toFixed(1)} Wh`,status:v>8?'warning':'optimal',explanation:'Energy scales directly with capacity at constant nominal voltage.'};}},
      {name:'Estimated Hover Endurance',calculate:(v)=>{const min=14.8*v*0.85/referenceHoverPowerW*60; const pct=(min/(14.8*5.2*0.85/referenceHoverPowerW*60)-1)*100; return {changePercent:pct,valueStr:`${min.toFixed(1)} min`,status:v>8?'warning':'optimal',explanation:'Idealized energy budget; larger packs also add mass, so real endurance gains are smaller than this simple calculation.'};}},
    ]},
    {id:'motor-kv',label:'Motor Speed Constant',component:'Brushless Propulsion',min:500,max:1600,defaultValue:900,unit:'RPM/V',impactMetrics:[
      {name:'No-Load RPM @ 14.8 V',calculate:(v)=>{const rpm=v*14.8; const pct=(rpm/(900*14.8)-1)*100; return {changePercent:pct,valueStr:`${rpm.toFixed(0)} RPM`,status:v>1300?'warning':'optimal',explanation:'Approximate no-load speed. Loaded RPM is lower and depends on propeller torque and battery voltage sag.'};}},
      {name:'Propeller Matching Risk',calculate:(v)=>{const change=(v/900-1)*100; return {changePercent:change,valueStr:v>1200?'High RPM bias':'Balanced',status:v>1400?'critical':v>1200?'warning':'optimal',explanation:'Higher kV tends toward higher speed and smaller-prop applications; the propeller and voltage must be matched to avoid excessive current.'};}},
    ]},
  ],

  didYouKnow: [
    'A quadcopter does not need to tilt its propellers to move: it tilts the entire airframe, redirecting the combined thrust vector horizontally.',
    'For a symmetric 1.35 kg reference drone, hover needs only about 3.31 N per rotor on average—but useful manoeuvrability requires substantially more than hover thrust.',
    'In the simplified rotor coefficient model, thrust scales with propeller diameter to the fourth power at fixed RPM and coefficient, which is why rotor sizing has a huge design impact.',
    'The supplied GLB contains 77 render meshes, grouped here into 15 engineering assemblies so the experience remains readable and educational.',
    'Alternating CW and CCW rotors cancel reaction torque in balanced hover; yaw comes from intentionally creating a torque imbalance.',
  ],
  engineersChoice: [
    {title:'Four Independently Controlled Rotors',rationale:'Provides direct attitude control with no cyclic-pitch swashplate or mechanical tail rotor. The trade-off is complete dependence on powered rotors and fast electronic control.'},
    {title:'Centralized Flight-Control Stack',rationale:'Keeping inertial sensing near the rigid mass centre improves state estimation and simplifies control allocation, provided vibration isolation is tuned correctly.'},
    {title:'Large Rotor Disk for Hover Efficiency',rationale:'More rotor disk area can reduce induced power for a given lift, but larger props increase vehicle span, structural bending loads and rotational inertia.'},
  ],
  redesignInsights: {
    simplify:{ title:'Integrated Power & Avionics Module', partReduction:'Reduce separate boards and harness connectors', description:'Combine low-power regulation, sensing and auxiliary interconnects into a serviceable central module while keeping high-current propulsion paths thermally and electrically isolated.', tradeoffs:'A single module reduces wiring but can increase thermal coupling and make one failure more consequential.' },
    makeItBetter:{ title:'Redundant State Estimation & Power Monitoring', upgrade:'Add redundant inertial sensing, ESC telemetry and battery current monitoring', performanceGain:'Improved fault awareness and earlier detection of abnormal propulsion behaviour', description:'Cross-check sensor and propulsion data so the controller can detect a degrading motor, vibration issue or battery problem before control authority is lost.' },
    cheaperVersion:{ title:'Fixed Payload + Simplified Airframe', costReduction:'Remove stabilized payload mechanisms and reduce machined interfaces', changes:'Use a fixed camera mount, simpler molded structure and fewer auxiliary boards.', tradeoffs:'Lower imaging quality, less vibration isolation and reduced upgradeability.' },
  },
  aiSuggestedQuestions:[
    'How does a quadcopter control yaw without a rudder?',
    'Why does a larger propeller affect thrust so strongly?',
    'How much thrust does this drone need just to hover?',
    'Why are brushless motors preferred over brushed motors?',
    'How does the flight controller convert a roll command into four motor speeds?',
    'What limits the flight time: battery energy, mass, or aerodynamic efficiency?',
  ],
};

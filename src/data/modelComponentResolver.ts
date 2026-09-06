import { ComponentNode, ObjectBreakdownData, ComponentMaterial, FailureMode } from '../types/objectData';
import { MODEL_ASSETS, ModelMeshMapping } from './modelRegistry';

const flatten = (nodes: ComponentNode[]): ComponentNode[] => {
  const out: ComponentNode[] = [];
  const walk = (items: ComponentNode[]) => items.forEach((n) => { out.push(n); if (n.children) walk(n.children); });
  walk(nodes);
  return out;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function mappingForId(objectId: string, componentId: string): { mapping?: ModelMeshMapping; meshName?: string } {
  const config = MODEL_ASSETS[objectId];
  if (!config?.meshMappings) return {};
  const entries = Object.entries(config.meshMappings);
  const exact = entries.find(([, m]) => m.componentId === componentId);
  if (exact) return { mapping: exact[1], meshName: exact[0] };
  return {};
}

function inferMaterial(name: string, category: string): ComponentMaterial {
  const text = `${name} ${category}`.toLowerCase();
  if (/sapphire|crystal|ceramic|ruby|jewel/.test(text)) {
    return { name: 'Technical ceramic / synthetic gemstone (model-dependent)', grade: 'Model-dependent', type: 'Ceramic', density: 'Model-dependent' };
  }
  if (/pbt|pom|nylon|polycarbonate|polymer|housing|keycap|plastic|stem/.test(text)) {
    return { name: 'Engineering thermoplastic (model-dependent)', grade: 'PBT / POM / Nylon family — model-dependent', type: 'Polymer', density: 'Model-dependent' };
  }
  if (/contact|leaf|spring|wheel|gear|bridge|barrel|staff|axle|steel|metal|crown|pin|pallet|escape|ratchet|case/.test(text)) {
    return { name: 'Precision metal alloy (model-dependent)', grade: 'Stainless / tool / horological alloy family — model-dependent', type: 'Metal', density: 'Model-dependent' };
  }
  if (/glass|display|screen/.test(text)) {
    return { name: 'Optical glass / display stack (model-dependent)', grade: 'Model-dependent', type: 'Glass', density: 'Model-dependent' };
  }
  return { name: 'Material not encoded in source mesh', grade: 'Model-dependent', type: 'Composite', density: 'Model-dependent' };
}

function technicalProfile(name: string, category: string, objectId: string) {
  const text = `${name} ${category}`.toLowerCase();
  let fn = 'This component is a distinct mesh in the supplied 3D asset. Its exact engineering role should be interpreted together with the assembly hierarchy and surrounding components.';
  let motion = 'Assembly-dependent motion; exact constraint is model-dependent.';
  let notes = ['The component is represented by a distinct mesh in the supplied GLB/GLTF asset.', 'Exact dimensions and material grade are not encoded reliably in the mesh metadata and are therefore marked model-dependent.'];
  let inspection = ['Check geometry for symmetry, sharp discontinuities, missing faces and visible interference with adjacent parts.', 'Compare the component’s position and interfaces against the assembled configuration.'];
  let interfaces = ['Interfaces with adjacent assembly geometry according to the source model.'];
  let principles = ['Maintain alignment and controlled clearances with mating components.', 'Minimize unnecessary mass while preserving stiffness, guidance or load transfer.'];
  let failure: FailureMode = { mode: 'Assembly interference / fit deviation', cause: 'Dimensional variation, deformation or incorrect positioning can disturb the intended interface.', mitigation: 'Verify mating geometry, clearances and assembly orientation before service.', severity: 'Medium' };

  if (/keycap/.test(text)) {
    fn = 'Provides the user-facing key surface and transfers finger force to the switch stem while defining the tactile/ergonomic interface.';
    motion = 'Axial travel with the switch stem; guided vertically during a keystroke.';
    notes = ['The keycap is the human-machine interface of the switch.', 'Its underside mounting geometry must remain concentric with the stem cross.', 'Profile and surface geometry influence finger comfort, key wobble and perceived stability.'];
    inspection = ['Inspect the stem mount for cracking or looseness.', 'Check the cap is centered and does not rub the switch housing.', 'Inspect the top surface for wear, shine and legends.'];
    interfaces = ['MX-style cross stem mount', 'Switch top housing / travel envelope', 'User fingertip contact surface'];
    principles = ['Use a rigid, lightweight shell to transmit force without excessive flex.', 'Maintain controlled clearance around the switch housing to prevent rubbing.'];
    failure = { mode: 'Stem mount cracking / key wobble', cause: 'Impact, brittle polymer damage or excessive clearance at the cross mount.', mitigation: 'Use appropriate polymer toughness and maintain controlled stem-fit tolerances.', severity: 'Medium' };
  } else if (/housing/.test(text)) {
    fn = 'Provides the structural reference for the switch mechanism, constrains moving parts and establishes the key travel envelope.';
    motion = 'Static housing; constrains stem and spring motion.';
    notes = ['Housing geometry controls alignment of the moving stem and internal spring/contact system.', 'Guide surfaces and clips are critical to consistent travel and return.'];
    inspection = ['Inspect guide rails for flash or deformation.', 'Check clips and mating surfaces for cracks.', 'Look for evidence of stem rubbing or asymmetric wear.'];
    interfaces = ['Switch stem guides', 'Spring/contact mechanism', 'PCB mounting interface'];
    failure = { mode: 'Stem binding / housing distortion', cause: 'Flash, warpage or damage changes the intended guide clearance.', mitigation: 'Control molding parameters and inspect guide dimensions during quality control.', severity: 'High' };
  } else if (/spring/.test(text)) {
    fn = 'Stores elastic energy and returns the mechanism toward its defined neutral position after actuation.';
    motion = 'Axial compression/extension along the spring axis.';
    notes = ['Spring force is determined by wire diameter, coil diameter, active turns and material modulus.', 'Fatigue life depends strongly on operating stress and surface condition.'];
    inspection = ['Check coil spacing and end condition.', 'Look for corrosion, permanent set or coil-to-coil contact marks.'];
    interfaces = ['Moving stem/plunger', 'Housing spring seat'];
    principles = ['Operate below the material’s fatigue limit and avoid side loading.', 'Control preload to achieve the intended force curve.'];
    failure = { mode: 'Spring fatigue / permanent set', cause: 'Repeated cycling at excessive stress or corrosion-assisted fatigue.', mitigation: 'Control stress range, surface finish and material heat treatment.', severity: 'Medium' };
  } else if (/wheel|gear|ratchet|escape/.test(text)) {
    fn = 'Transmits torque and/or angular position through the mechanism. Tooth geometry controls the timing and ratio of motion transfer.';
    motion = 'Continuous or indexed rotation about the component’s wheel axis.';
    notes = ['Gear performance depends on tooth geometry, center distance, lubrication and axial alignment.', 'In a watch, the wheel train progressively transfers mainspring torque to the escapement.'];
    inspection = ['Inspect tooth flanks for pitting, scoring and abnormal wear.', 'Check axial shake and concentricity.', 'Look for contamination or insufficient lubrication.'];
    interfaces = ['Mating wheel teeth', 'Pivot/shaft or jewel bearing', 'Bridge/mainplate support'];
    principles = ['Maintain correct center distance and backlash.', 'Minimize friction and preserve tooth alignment.'];
    failure = { mode: 'Tooth wear / timing error', cause: 'Poor lubrication, misalignment, contamination or excessive contact stress.', mitigation: 'Maintain correct mesh geometry and use appropriate lubrication.', severity: 'High' };
  } else if (/bridge|mainplate|base|chassis/.test(text)) {
    fn = 'Provides structural support and datum surfaces that locate the moving components and maintain assembly alignment.';
    motion = 'Static structural member.';
    notes = ['Datum surfaces and bearing locations establish the geometry of the entire mechanism.', 'Stiffness and thermal stability are important because small alignment errors accumulate in precision mechanisms.'];
    inspection = ['Check mounting faces and bearing bores.', 'Inspect for distortion, cracks and damaged threads.', 'Verify that mating components sit flush.'];
    interfaces = ['Adjacent bridges/plates', 'Shaft and bearing supports', 'Fasteners or retaining features'];
    principles = ['Maximize stiffness where alignment matters while removing unnecessary mass.', 'Provide repeatable datum surfaces for assembly and service.'];
  } else if (/pallet|balance|hairspring|staff|impulse|oscillator/.test(text)) {
    fn = 'Participates in the watch regulating system that converts stored mechanical energy into controlled periodic motion.';
    motion = 'Precision oscillation/rotation with tightly controlled amplitude and friction.';
    notes = ['Regulating components are highly sensitive to inertia, friction, balance, magnetism and geometry.', 'Small changes can produce measurable rate error.'];
    inspection = ['Inspect pivots/jewels for contamination or damage.', 'Check concentricity, freedom of motion and signs of magnetization.', 'Inspect the hairspring for deformation or rubbing.'];
    interfaces = ['Balance staff/pivots', 'Pallet/escape wheel interface', 'Regulator support / bridge'];
    principles = ['Control inertia and friction to preserve stable oscillation frequency.', 'Keep the oscillator centered and free from parasitic contact.'];
    failure = { mode: 'Rate drift / amplitude loss', cause: 'Friction, contamination, magnetization or deformation of the regulating assembly.', mitigation: 'Maintain clean pivots, correct lubrication and accurate poising.', severity: 'High' };
  } else if (/hand|index|dial/.test(text)) {
    fn = 'Provides visual indication of time by converting the movement’s controlled rotations into an interpretable display.';
    motion = 'Low-speed rotation around the dial axis.';
    notes = ['Hand geometry and mass affect the drive load and visual alignment.', 'Clearance between stacked hands is required to prevent contact.'];
    inspection = ['Check hand-to-hand clearance.', 'Verify concentric mounting and alignment with hour markers.'];
    interfaces = ['Central arbor / cannon pinion / hand stack', 'Dial and chapter ring'];
  } else if (/contact|leaf|terminal|pin/.test(text)) {
    fn = 'Provides a controlled electrical or mechanical contact interface between moving or stationary parts.';
    motion = 'Elastic deflection or static contact, depending on assembly role.';
    notes = ['Contact force, surface finish and plating strongly affect electrical resistance and wear.', 'Spring contacts must maintain force over repeated cycles.'];
    inspection = ['Check contact surfaces for oxidation, arcing or contamination.', 'Inspect spring deflection and retention.'];
    interfaces = ['PCB/contact pad', 'Mating contact surface', 'Housing retention features'];
  } else if (/barrel|clip|grip|tip|pen/.test(text)) {
    fn = 'Forms part of the pen’s structural and user-interface assembly, locating the writing mechanism and transferring actuation forces.';
    motion = 'Mostly static; local axial motion occurs in the actuation and writing mechanism.';
    notes = ['Pen geometry combines ergonomics, structural enclosure and controlled alignment of the writing cartridge.', 'The writing tip must remain coaxial with the cartridge for reliable ink delivery.'];
    inspection = ['Check tip alignment and barrel concentricity.', 'Inspect grip surfaces for wear and loss of texture.', 'Check clip attachment and actuation interfaces.'];
    interfaces = ['Ink cartridge', 'Grip/tip assembly', 'Clip/plunger and barrel interfaces'];
  }

  return { fn, motion, notes, inspection, interfaces, principles, failure };
}

export function resolveModelComponentNode(objectData: ObjectBreakdownData, componentId: string): ComponentNode | null {
  const all = flatten(objectData.rootComponents);
  const exact = all.find((n) => n.id === componentId);
  if (exact) {
    if (exact.technicalNotes || exact.interfaces || exact.inspectionPoints) return exact;
    const profile = technicalProfile(exact.name, exact.category, objectData.id);
    return {
      ...exact,
      technicalNotes: profile.notes,
      inspectionPoints: profile.inspection,
      interfaces: profile.interfaces,
      designPrinciples: profile.principles,
      evidence: exact.evidence || `Engineering data entry “${exact.id}” linked to the ${objectData.id} assembly.`,
      confidenceReason: exact.confidenceReason || `Confidence is ${exact.dataConfidence}; verify against manufacturer drawings where exact tolerances or material grades matter.`,
    };
  }

  const { mapping, meshName } = mappingForId(objectData.id, componentId);
  if (!mapping) return null;

  const profile = technicalProfile(mapping.displayName, mapping.category, objectData.id);
  const material = inferMaterial(mapping.displayName, mapping.category);
  const node: ComponentNode = {
    id: mapping.componentId,
    name: mapping.displayName,
    cadId: `MESH-${mapping.componentId.toUpperCase()}`,
    category: mapping.category,
    meshKey: meshName || mapping.componentId,
    explodeVector: mapping.explodeVector,
    defaultColor: mapping.color || '#94a3b8',
    material,
    function: profile.fn,
    manufacturing: {
      process: 'Asset/model-dependent; source GLB does not encode a verified manufacturing process for this mesh.',
      machinery: 'Model-dependent',
      tolerance: 'Model-dependent',
      defectRisks: ['Geometry/fit deviation at mating interfaces', 'Surface or edge damage during service'],
    },
    dimensions: { formatted: 'Asset-scaled; exact CAD dimensions are model-dependent' },
    mechanicalRole: { motion: profile.motion },
    connectedTo: [],
    failureModes: [profile.failure],
    engineeringReason: profile.principles.join(' '),
    dataConfidence: 'Model-dependent',
    sourceMeshName: meshName,
    technicalNotes: profile.notes,
    inspectionPoints: profile.inspection,
    interfaces: profile.interfaces,
    designPrinciples: profile.principles,
    evidence: `Mapped to the supplied ${objectData.id} GLB mesh “${meshName || mapping.componentId}”. Engineering interpretation is based on the component name/category and the surrounding assembly, not a manufacturer CAD specification.`,
    confidenceReason: 'The 3D asset provides geometry but does not embed a verified bill of materials or complete engineering specification for this mesh.',
  };
  return node;
}

function prettyMeshName(componentId: string, objectId: string): { name: string; category: string } {
  const raw = componentId.replace(/_0$/i, '').replace(/\./g, ' ').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  const text = raw.toLowerCase();
  if (objectId === 'wristwatch') {
    if (/spur gear/.test(text)) return { name: `Precision ${raw.replace(/spur gear/i, 'Gear')} ` .trim(), category: 'Kinematics' };
    if (/escape wheel/.test(text)) return { name: 'Swiss Lever Escape Wheel', category: 'Escapement' };
    if (/escapement/.test(text)) return { name: 'Pallet Fork / Escapement Linkage', category: 'Escapement' };
    if (/pallet/.test(text)) return { name: 'Synthetic Ruby Pallet Assembly', category: 'Escapement' };
    if (/balance wheel/.test(text)) return { name: 'Balance Wheel Assembly', category: 'Harmonic Oscillator' };
    if (/balance axle/.test(text)) return { name: 'Balance Staff / Axle', category: 'Harmonic Oscillator' };
    if (/impulse pin/.test(text)) return { name: 'Ruby Roller Impulse Pin', category: 'Tribology' };
    if (/pin[12]/.test(text)) return { name: 'Movement Fixing Pin', category: 'Structural Fastening' };
    if (/fixations/.test(text)) return { name: 'Movement Retaining Hardware', category: 'Structural Fastening' };
    if (/cube.*scratch/.test(text)) return { name: 'Scratch-Finished Movement Bridge', category: 'Structural' };
    if (/cylinder.*plastc pink/.test(text)) return { name: 'Synthetic Ruby Olive Jewel Bearing', category: 'Tribology & Bearings' };
    if (/cylinder.*inside metal/.test(text)) return { name: 'Blued Carbon Steel Movement Fastener', category: 'Fastening & Hardware' };
    if (/cylinder.*black watch/.test(text)) return { name: 'Movement Mainplate / Base', category: 'Chassis Base' };
    if (/circle.*tiktok/.test(text)) return { name: 'Time Indication Hand', category: 'Indication' };
    if (/cube.*tiktok/.test(text)) return { name: 'Applied Dial Index Marker', category: 'Indication' };
  }
  if (objectId === 'ballpoint-pen') {
    if (/object 4/.test(text)) return { name: 'Brushed Stainless Steel Outer Barrel', category: 'Structural Enclosure' };
    if (/object 5/.test(text)) return { name: 'Spring-Steel Pocket Clip & Push Plunger', category: 'Attachment & Kinematics' };
    if (/object 6/.test(text)) return { name: 'Ergonomic Grip & Writing Tip Assembly', category: 'Ergonomics & Fluidics' };
  }
  return { name: raw.replace(/\b\w/g, (c) => c.toUpperCase()), category: 'Model Component' };
}

export function buildGenericModelComponentNode(objectData: ObjectBreakdownData, componentId: string): ComponentNode {
  const config = MODEL_ASSETS[objectData.id];
  const pretty = prettyMeshName(componentId, objectData.id);
  let displayName = pretty.name;
  let category = pretty.category;
  let meshName = componentId;
  const mappingEntry = Object.entries(config?.meshMappings || {}).find(([, m]) => m.componentId === componentId);
  if (mappingEntry) {
    displayName = mappingEntry[1].displayName;
    category = mappingEntry[1].category;
    meshName = mappingEntry[0];
  }
  const profile = technicalProfile(displayName, category, objectData.id);
  return {
    id: componentId,
    name: displayName,
    cadId: `MESH-${componentId.toUpperCase()}`,
    category,
    meshKey: meshName,
    explodeVector: [0, 1, 0],
    defaultColor: '#94a3b8',
    material: inferMaterial(displayName, category),
    function: profile.fn,
    manufacturing: { process: 'Model-dependent', machinery: 'Model-dependent', tolerance: 'Model-dependent', defectRisks: ['Fit/interference variation', 'Surface damage'] },
    dimensions: { formatted: 'Asset-scaled; exact CAD dimensions are model-dependent' },
    mechanicalRole: { motion: profile.motion },
    connectedTo: [],
    failureModes: [profile.failure],
    engineeringReason: profile.principles.join(' '),
    dataConfidence: 'Model-dependent',
    sourceMeshName: meshName,
    technicalNotes: profile.notes,
    inspectionPoints: profile.inspection,
    interfaces: profile.interfaces,
    designPrinciples: profile.principles,
    evidence: `3D mesh “${meshName}” from the supplied ${objectData.id} asset.`,
    confidenceReason: 'Only geometry-level evidence is available for this mesh; no verified manufacturer specification is embedded in the asset.',
  };
}

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ObjectBreakdownData, ViewMode3D, ComponentNode } from '../../../types/objectData';
import { MODEL_ASSETS, ModelAssetConfig, ModelMeshMapping } from '../../../data/modelRegistry';
import { createComponentMesh } from './proceduralMeshes';

const gltfSceneCache = new Map<string, THREE.Group>();
const gltfLoader = new GLTFLoader();

export interface LoadedComponentMeshInfo {
  mesh: THREE.Mesh | THREE.Group;
  componentId: string;
  displayName: string;
  category: string;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  baseScale: THREE.Vector3;
  explodeVector: THREE.Vector3;
  explodedRotation: THREE.Euler;
  explodeStart: number;
  explodeEnd: number;
  originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]>;
}

export interface LoadedObjectResult {
  rootGroup: THREE.Group;
  componentMap: Map<string, LoadedComponentMeshInfo>;
  maxDimension: number;
  cameraDistance: number;
}

export async function loadGLTFGroup(url: string): Promise<THREE.Group> {
  if (gltfSceneCache.has(url)) {
    return gltfSceneCache.get(url)!.clone(true);
  }

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        gltfSceneCache.set(url, gltf.scene);
        resolve(gltf.scene.clone(true));
      },
      undefined,
      (error) => {
        console.error(`Failed to load GLTF at ${url}:`, error);
        reject(error);
      }
    );
  });
}

function registerMesh(
  root: THREE.Group,
  mesh: THREE.Mesh,
  mapping: ModelMeshMapping | undefined,
  componentMap: Map<string, LoadedComponentMeshInfo>,
  sequenceIndex: number,
  sequenceCount: number,
) {
  root.updateMatrixWorld(true);
  mesh.updateMatrixWorld(true);

  // Detach the mesh from its GLTF parent while preserving its exact world transform.
  // This makes each physical part independently animatable during an exploded view.
  root.attach(mesh);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const originalMats = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  originalMats.set(
    mesh,
    Array.isArray(mesh.material)
      ? mesh.material.map((m) => m.clone())
      : mesh.material.clone()
  );

  const meshName = mesh.name;
  const compId = mapping?.componentId || meshName || `comp-${mesh.id}`;
  const displayName = mapping?.displayName || meshName || 'Component';
  const category = mapping?.category || 'Mechanical';

  // Mapping vectors are deliberately object-specific. A small staged delay makes
  // the breakdown read as a disassembly instead of every part moving simultaneously.
  const derivedDirection = mesh.position.clone();
  if (derivedDirection.lengthSq() > 1e-6) {
    derivedDirection.normalize().multiplyScalar(1.8);
  } else {
    derivedDirection.set(0, 1.0, 0);
  }
  const explodeVector = new THREE.Vector3(...(mapping?.explodeVector || derivedDirection.toArray() as [number, number, number]));
  const explodeStart = mapping?.explodeStart ?? Math.min(0.55, sequenceIndex * (0.48 / Math.max(sequenceCount - 1, 1)));
  const explodeEnd = mapping?.explodeEnd ?? Math.min(1, explodeStart + 0.52);

  mesh.name = compId;

  componentMap.set(compId, {
    mesh,
    componentId: compId,
    displayName,
    category,
    basePosition: mesh.position.clone(),
    baseRotation: mesh.rotation.clone(),
    baseScale: mesh.scale.clone(),
    explodeVector,
    explodedRotation: mesh.rotation.clone(),
    explodeStart,
    explodeEnd,
    originalMaterials: originalMats,
  });
}


function uploadedMeshId(index: number) {
  return `upload-mesh-${String(index + 1).padStart(3, '0')}`;
}

function colorForUploadedMesh(name: string, index: number) {
  const value = name.toLowerCase();
  if (/lens|glass|screen|display/.test(value)) return 0x6fa9d5;
  if (/sensor|board|electronic/.test(value)) return 0x3f8f68;
  if (/button|dial|control|shutter/.test(value)) return 0xc58d4d;
  const palette = [0x5f6f82, 0x7a8798, 0x98a3b1, 0x69788a, 0xa6b0bd];
  return palette[index % palette.length];
}

function prepareUploadedMeshMaterials(mesh: THREE.Mesh, semanticName: string, index: number) {
  const materialList = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const hasUsefulMaterial = materialList.some((material) => {
    if (!material) return false;
    const anyMaterial = material as THREE.Material & { map?: THREE.Texture | null; color?: THREE.Color };
    return Boolean(anyMaterial.map) || Boolean(anyMaterial.color && anyMaterial.color.getHex() !== 0xffffff);
  });
  if (!hasUsefulMaterial) {
    mesh.material = new THREE.MeshStandardMaterial({
      color: colorForUploadedMesh(semanticName, index),
      roughness: /lens|glass|screen|display/i.test(semanticName) ? 0.22 : 0.48,
      metalness: /body|housing|lens|barrel|mount/i.test(semanticName) ? 0.35 : 0.08,
    });
  }
  if (!mesh.geometry.getAttribute('normal')) mesh.geometry.computeVertexNormals();
}

function registerUploadedGroup(
  root: THREE.Group,
  component: ComponentNode,
  meshes: THREE.Mesh[],
  sequenceIndex: number,
  sequenceCount: number,
  componentMap: Map<string, LoadedComponentMeshInfo>,
) {
  const group = new THREE.Group();
  group.name = component.id;
  root.add(group);
  const originalMats = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  meshes.forEach((mesh) => {
    originalMats.set(mesh, Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone());
    group.attach(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });

  // Keep each AI semantic assembly intact. Its final exploded pose is planned
  // after every group has been registered, using the whole model geometry.
  const explodeStart = Math.min(0.55, sequenceIndex * (0.48 / Math.max(sequenceCount - 1, 1)));
  componentMap.set(component.id, {
    mesh: group, componentId: component.id, displayName: component.name, category: component.category,
    basePosition: group.position.clone(), baseRotation: group.rotation.clone(), baseScale: group.scale.clone(),
    explodeVector: new THREE.Vector3(...component.explodeVector), explodedRotation: group.rotation.clone(), explodeStart, explodeEnd: Math.min(1, explodeStart + 0.52), originalMaterials: originalMats,
  });
}

/** Build a coherent exploded-view plan for semantic groups in an uploaded GLB. */
function planUploadedExplodedView(
  root: THREE.Group,
  componentMap: Map<string, LoadedComponentMeshInfo>,
) {
  const entries = Array.from(componentMap.values()).filter(
    (info) => !info.componentId.startsWith('upload-raw-')
  );
  if (!entries.length) return;

  root.updateMatrixWorld(true);
  const modelBox = new THREE.Box3().setFromObject(root);
  const modelSize = modelBox.getSize(new THREE.Vector3());
  const modelCenter = modelBox.getCenter(new THREE.Vector3());

  const axisIndex = modelSize.x >= modelSize.y && modelSize.x >= modelSize.z ? 0 : modelSize.y >= modelSize.z ? 1 : 2;
  const dominantAxis = axisIndex === 0 ? new THREE.Vector3(1, 0, 0) : axisIndex === 1 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
  const sideAxis = axisIndex === 2 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  const verticalAxis = new THREE.Vector3(0, 1, 0);

  const records = entries.map((info) => {
    const box = new THREE.Box3().setFromObject(info.mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const fromCenter = center.clone().sub(modelCenter);
    const axial = fromCenter.dot(dominantAxis);
    const radial = fromCenter.addScaledVector(dominantAxis, -axial);
    return { info, center, size, projection: center.dot(dominantAxis), radial };
  }).sort((a, b) => a.projection - b.projection);

  const dominantSpan = modelSize.getComponent(axisIndex);
  const averagePartSpan = records.reduce((sum, record) => sum + record.size.getComponent(axisIndex), 0) / Math.max(records.length, 1);
  const axialSpacing = Math.max(dominantSpan * 0.16, averagePartSpan * 0.9, 0.45);
  const radialSpacing = Math.max(dominantSpan * 0.10, 0.3);
  const middleIndex = (records.length - 1) / 2;

  records.forEach((record, index) => {
    const name = `${record.info.displayName} ${record.info.category}`.toLowerCase();
    const isCore = /main body|camera body|body housing|chassis|central housing|main housing/.test(name);
    const isFront = /front|optical|front barrel|front lens|front element/.test(name);
    const isRear = /rear|interface|display|back/.test(name);
    const isRing = /ring|zoom|focus|adjustment/.test(name);
    const isMount = /mount|rear barrel/.test(name);
    const isGrip = /grip|handgrip|handle/.test(name);
    const isTop = /top|control|dial|button|viewfinder|prism/.test(name);

    let axialOffset = (index - middleIndex) * axialSpacing;
    if (isCore) axialOffset *= 0.18;
    if (isFront) axialOffset = Math.sign(axialOffset || -1) * Math.max(Math.abs(axialOffset), axialSpacing * 1.5);
    if (isRear) axialOffset = Math.sign(axialOffset || 1) * Math.max(Math.abs(axialOffset), axialSpacing * 0.75);
    if (isRing) axialOffset *= 1.18;
    if (isMount) axialOffset *= 0.82;

    const vector = dominantAxis.clone().multiplyScalar(axialOffset);
    if (record.radial.lengthSq() > 1e-6 && !isCore) vector.add(record.radial.normalize().multiplyScalar(radialSpacing * 0.55));
    if (isGrip) {
      const sideSign = Math.sign(record.center.dot(sideAxis) - modelCenter.dot(sideAxis)) || 1;
      vector.addScaledVector(sideAxis, sideSign * radialSpacing * 1.4);
      vector.addScaledVector(verticalAxis, -radialSpacing * 0.25);
    }
    if (isTop) vector.addScaledVector(verticalAxis, radialSpacing * 1.5);
    if (/bottom|base|plate|foot/.test(name)) vector.addScaledVector(verticalAxis, -radialSpacing * 0.85);

    // Keep only a restrained AI-vector influence; actual geometry drives the view.
    const aiBias = record.info.explodeVector.clone();
    if (aiBias.lengthSq() > 1e-6) vector.add(aiBias.normalize().multiplyScalar(radialSpacing * 0.18));
    record.info.explodeVector.copy(vector);

    // Major groups appear first; secondary assemblies are progressively revealed.
    const baseStart = isCore ? 0 : isFront || isRear ? 0.18 : isTop || isGrip ? 0.32 : 0.12;
    const stagger = records.length > 1 ? index / (records.length - 1) : 0;
    record.info.explodeStart = Math.min(0.58, baseStart + stagger * 0.22);
    record.info.explodeEnd = Math.min(1, record.info.explodeStart + 0.62);
  });
}

export async function loadUploaded3DModel(
  url: string,
  objectData: ObjectBreakdownData,
  viewMode: ViewMode3D
): Promise<LoadedObjectResult> {
  const rootGroup = await loadGLTFGroup(url);
  const componentMap = new Map<string, LoadedComponentMeshInfo>();
  const meshes: THREE.Mesh[] = [];
  rootGroup.traverse((child) => { if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh); });
  const meshById = new Map<string, THREE.Mesh>();
  meshes.forEach((mesh, index) => meshById.set(uploadedMeshId(index), mesh));

  const mappedMeshIds = new Set<string>();
  const components = objectData.rootComponents.filter((node) => node.sourceMeshIds?.length || node.sourceMeshName || node.sourceMeshNames?.length);
  components.forEach((component, componentIndex) => {
    let componentMeshes = (component.sourceMeshIds || []).map((id) => meshById.get(id)).filter((mesh): mesh is THREE.Mesh => Boolean(mesh));
    if (!componentMeshes.length) {
      const names = new Set([...(component.sourceMeshNames || []), ...(component.sourceMeshName ? [component.sourceMeshName] : [])]);
      componentMeshes = meshes.filter((mesh) => names.has(mesh.name));
    }
    if (!componentMeshes.length) return;
    componentMeshes.forEach((mesh) => {
      const index = meshes.indexOf(mesh);
      mappedMeshIds.add(uploadedMeshId(index));
      prepareUploadedMeshMaterials(mesh, component.name, index);
    });
    registerUploadedGroup(rootGroup, component, componentMeshes, componentIndex, components.length, componentMap);
  });

  meshes.forEach((mesh, index) => {
    const meshId = uploadedMeshId(index);
    if (mappedMeshIds.has(meshId)) return;
    const id = `upload-raw-${meshId}`;
    const displayName = mesh.name || `Detected Component ${index + 1}`;
    prepareUploadedMeshMaterials(mesh, displayName, index);
    registerMesh(rootGroup, mesh, { componentId: id, displayName, category: 'Unmapped uploaded geometry', explodeVector: [0, 1, 0], color: '#94a3b8' }, componentMap, componentMap.size, meshes.length);
  });

  // Plan one physical motion per AI component, not one motion per raw mesh.
  planUploadedExplodedView(rootGroup, componentMap);

  rootGroup.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(rootGroup);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  rootGroup.position.sub(center);
  const maxDimension = Math.max(size.x, size.y, size.z, 1);
  const targetDimension = 4.8;
  rootGroup.scale.setScalar(targetDimension / maxDimension);
  componentMap.forEach((info) => { info.basePosition.copy(info.mesh.position); info.baseRotation.copy(info.mesh.rotation); info.baseScale.copy(info.mesh.scale); });
  applyViewModeToModel(componentMap, viewMode);
  return { rootGroup, componentMap, maxDimension: targetDimension, cameraDistance: targetDimension * 1.75 };
}

function normalizeMeshName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findMeshMapping(config: ModelAssetConfig, meshName: string): ModelMeshMapping | undefined {
  const mappings: Array<[string, ModelMeshMapping]> = Object.keys(config.meshMappings || {}).map((key) => [key, config.meshMappings![key]]);
  const exact = mappings.find(([key]) => key === meshName);
  if (exact) return exact[1];

  const normalized = normalizeMeshName(meshName);
  const normalizedMatch = mappings.find(([key]) => normalizeMeshName(key) === normalized);
  if (normalizedMatch) return normalizedMatch[1];

  const tokens: string[] = normalized.match(/[a-z]+|\d+/g) || [];
  let best: { score: number; mapping: ModelMeshMapping } | null = null;
  for (const [key, mapping] of mappings) {
    const keyTokens: string[] = normalizeMeshName(key).match(/[a-z]+|\d+/g) || [];
    const overlap = tokens.filter((t) => keyTokens.includes(t)).length;
    const score = overlap / Math.max(tokens.length, keyTokens.length, 1);
    if (score >= 0.55 && (!best || score > best.score)) best = { score, mapping };
  }
  return best?.mapping;
}

function processGLTFMeshes(
  root: THREE.Group,
  config: ModelAssetConfig,
  componentMap: Map<string, LoadedComponentMeshInfo>,
) {
  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });

  meshes.forEach((mesh, index) => {
    registerMesh(
      root,
      mesh,
      findMeshMapping(config, mesh.name),
      componentMap,
      index,
      meshes.length,
    );
  });
}

/**
 * The pen asset is a beautiful exterior model but contains only three render meshes.
 * Add a small set of clearly-labeled engineering internals as a supplemental cutaway
 * so the application's core "see what's inside" purpose remains useful.
 *
 * These are intentionally treated as supplemental engineering visualization parts,
 * not as geometry claimed to be present in the source GLB.
 */
function addPenEngineeringInternals(
  objectData: ObjectBreakdownData,
  rootGroup: THREE.Group,
  componentMap: Map<string, LoadedComponentMeshInfo>,
  viewMode: ViewMode3D,
) {
  if (objectData.id !== 'ballpoint-pen') return;

  const definitions: Array<{
    id: string;
    name: string;
    category: string;
    meshKey: string;
    color: string;
    position: [number, number, number];
    scale: number;
    explodeVector: [number, number, number];
    start: number;
    end: number;
  }> = [
    {
      id: 'supplemental-ink-cartridge',
      name: 'Ink Cartridge / Reservoir',
      category: 'Fluidics',
      meshKey: 'pen-cartridge',
      color: '#64748b',
      position: [0.1, 0, 0],
      scale: 0.82,
      explodeVector: [-0.35, 0, 0],
      start: 0.18,
      end: 0.72,
    },
    {
      id: 'supplemental-return-spring',
      name: 'Compression Return Spring',
      category: 'Kinematics',
      meshKey: 'pen-spring',
      color: '#d4d4d8',
      position: [1.05, 0, 0],
      scale: 0.8,
      explodeVector: [0.9, 0, 0],
      start: 0.3,
      end: 0.82,
    },
    {
      id: 'supplemental-click-cam',
      name: 'Rotary Click Cam',
      category: 'Kinematics',
      meshKey: 'pen-cam',
      color: '#f59e0b',
      position: [1.65, 0, 0],
      scale: 0.65,
      explodeVector: [1.35, 0.25, 0],
      start: 0.42,
      end: 0.9,
    },
    {
      id: 'supplemental-writing-tip',
      name: 'Precision Writing Tip',
      category: 'Fluidics',
      meshKey: 'pen-tip',
      color: '#b45309',
      position: [-2.15, 0, 0],
      scale: 0.9,
      explodeVector: [-1.0, -0.25, 0],
      start: 0.28,
      end: 0.78,
    },
    {
      id: 'supplemental-tungsten-ball',
      name: 'Tungsten Carbide Ball',
      category: 'Tribology',
      meshKey: 'pen-ball',
      color: '#a1a1aa',
      position: [-2.55, 0, 0],
      scale: 0.95,
      explodeVector: [-1.35, -0.4, 0],
      start: 0.52,
      end: 0.96,
    },
  ];

  definitions.forEach((def) => {
    const node = {
      id: def.id,
      name: def.name,
      cadId: `SUP-${def.id}`,
      category: def.category,
      meshKey: def.meshKey,
      explodeVector: def.explodeVector,
      defaultColor: def.color,
      material: {
        name: def.name,
        grade: 'Engineering visualization',
        type: 'Metal' as const,
        density: 'Model-dependent',
      },
      function: 'Supplemental engineering visualization component.',
      manufacturing: {
        process: 'Reference visualization',
        machinery: 'N/A',
        tolerance: 'Model-dependent',
        defectRisks: [],
      },
      dimensions: { formatted: 'Model-dependent' },
      mechanicalRole: { motion: 'Assembly-dependent' },
      connectedTo: [],
      failureModes: [],
      engineeringReason: 'Supplemental visualization because the supplied exterior GLB does not contain this internal mesh as a separate node.',
      dataConfidence: 'Model-dependent' as const,
    } satisfies ComponentNode;

    const group = createComponentMesh(node, objectData.id, viewMode, false, false);
    group.position.set(...def.position);
    group.scale.setScalar(def.scale);
    // The supplied pen is oriented along X; the procedural internals are authored along Y.
    // The pen asset itself is rotated into its upright presentation at the root.
    // Keep supplemental internals in their native Y-axis orientation so they remain
    // coaxial with the pen instead of creating a rod through the barrel.
    group.name = def.id;
    group.userData.supplemental = true;
    group.visible = false;
    rootGroup.add(group);

    const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.Material | THREE.Material[];
        originalMaterials.set(
          mesh,
          Array.isArray(material)
            ? material.map((m) => m.clone())
            : material.clone()
        );
      }
    });

    componentMap.set(def.id, {
      mesh: group,
      componentId: def.id,
      displayName: def.name,
      category: def.category,
      basePosition: group.position.clone(),
      baseRotation: group.rotation.clone(),
      baseScale: group.scale.clone(),
      explodeVector: new THREE.Vector3(...def.explodeVector),
      explodedRotation: group.rotation.clone(),
      explodeStart: def.start,
      explodeEnd: def.end,
      originalMaterials,
    });
  });
}

function buildProceduralFallback(
  objectData: ObjectBreakdownData,
  viewMode: ViewMode3D,
  rootGroup: THREE.Group,
  componentMap: Map<string, LoadedComponentMeshInfo>
) {
  const getAllNodes = (nodes: ComponentNode[]): ComponentNode[] => {
    const list: ComponentNode[] = [];
    const traverse = (nodeList: ComponentNode[]) => {
      nodeList.forEach((n) => {
        list.push(n);
        if (n.children) traverse(n.children);
      });
    };
    traverse(nodes);
    return list;
  };

  const allNodes = getAllNodes(objectData.rootComponents);

  allNodes.forEach((node, index) => {
    const group = createComponentMesh(node, objectData.id, viewMode, false, false);
    const basePos = new THREE.Vector3(0, (index - allNodes.length / 2) * 0.12, 0);
    const explodeVec = new THREE.Vector3(...node.explodeVector);

    group.position.copy(basePos);
    rootGroup.add(group);

    const originalMats = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    group.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        const mesh = c as THREE.Mesh;
        const material = mesh.material as THREE.Material | THREE.Material[];
        originalMats.set(
          mesh,
          Array.isArray(material)
            ? material.map((m) => m.clone())
            : material.clone()
        );
      }
    });

    componentMap.set(node.id, {
      mesh: group,
      componentId: node.id,
      displayName: node.name,
      category: node.category,
      basePosition: basePos.clone(),
      baseRotation: group.rotation.clone(),
      baseScale: group.scale.clone(),
      explodeVector: explodeVec,
      explodedRotation: group.rotation.clone(),
      explodeStart: Math.min(0.55, index * (0.48 / Math.max(allNodes.length - 1, 1))),
      explodeEnd: Math.min(1, index * (0.48 / Math.max(allNodes.length - 1, 1)) + 0.52),
      originalMaterials: originalMats,
    });
  });
}

export async function load3DModelForObject(
  objectData: ObjectBreakdownData,
  viewMode: ViewMode3D
): Promise<LoadedObjectResult> {
  const config = MODEL_ASSETS[objectData.id];
  const rootGroup = new THREE.Group();
  rootGroup.name = `root-${objectData.id}`;
  const componentMap = new Map<string, LoadedComponentMeshInfo>();

  if (config?.type === 'gltf-composite' && config.subModels) {
    for (const sub of config.subModels) {
      try {
        const subScene = await loadGLTFGroup(sub.modelPath);
        subScene.name = sub.id;
        subScene.scale.setScalar(sub.initialScale);
        subScene.position.set(...sub.initialOffset);
        if (sub.initialRotation) subScene.rotation.set(...sub.initialRotation);
        rootGroup.add(subScene);
      } catch (e) {
        console.warn(`Could not load sub-model ${sub.modelPath}:`, e);
      }
    }

    processGLTFMeshes(rootGroup, config, componentMap);
  } else if (config?.type === 'gltf' && config.modelPath) {
    try {
      const gltfScene = await loadGLTFGroup(config.modelPath);
      if (config.initialRotation) gltfScene.rotation.set(...config.initialRotation);
      if (config.initialOffset) gltfScene.position.set(...config.initialOffset);
      rootGroup.add(gltfScene);

      // The pen's supplemental internals are positioned in the same normalized
      // root space as the real exterior asset.
      processGLTFMeshes(rootGroup, config, componentMap);
      addPenEngineeringInternals(objectData, rootGroup, componentMap, viewMode);
    } catch (e) {
      console.warn(`Could not load GLTF model for ${objectData.id}, using procedural fallback`, e);
      buildProceduralFallback(objectData, viewMode, rootGroup, componentMap);
    }
  } else {
    buildProceduralFallback(objectData, viewMode, rootGroup, componentMap);
  }

  rootGroup.updateMatrixWorld(true);

  const bbox = new THREE.Box3().setFromObject(rootGroup);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  rootGroup.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const targetDim = config?.targetMaxDimension || 4.5;
  const normalizationScale = targetDim / maxDim;
  rootGroup.scale.multiplyScalar(normalizationScale);

  // All GLTF meshes were detached to root before normalization, so local transforms
  // remain stable and can be interpolated directly.
  componentMap.forEach((info) => {
    info.basePosition.copy(info.mesh.position);
    info.baseRotation.copy(info.mesh.rotation);
    info.baseScale.copy(info.mesh.scale);
    info.mesh.position.copy(info.basePosition);
    info.mesh.rotation.copy(info.baseRotation);
  });

  return {
    rootGroup,
    componentMap,
    maxDimension: targetDim,
    cameraDistance: config?.defaultCameraDistance || targetDim * 1.5,
  };
}

/**
 * Applies view mode shaders (Solid, X-Ray, Wireframe, FEA Stress, Thermal)
 */
export function applyViewModeToModel(
  componentMap: Map<string, LoadedComponentMeshInfo>,
  viewMode: ViewMode3D
) {
  componentMap.forEach((info) => {
    info.mesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const originalMat = info.originalMaterials.get(mesh);

        if (viewMode === 'solid') {
          // Restore original photorealistic PBR material
          if (originalMat) {
            mesh.material = Array.isArray(originalMat) ? originalMat.map(m => m.clone()) : originalMat.clone();
          }
        } else if (viewMode === 'wireframe') {
          mesh.material = new THREE.MeshBasicMaterial({
            color: '#38bdf8',
            wireframe: true,
          });
        } else if (viewMode === 'xray') {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: '#38bdf8',
            transparent: true,
            opacity: 0.28,
            roughness: 0.1,
            transmission: 0.82,
            ior: 1.45,
            depthWrite: false,
          });
        } else if (viewMode === 'stress') {
          const hash = Math.abs(info.componentId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
          const hue = (1.0 - (hash % 100) / 100) * 0.65;
          const stressColor = new THREE.Color().setHSL(hue, 0.95, 0.5);

          mesh.material = new THREE.MeshStandardMaterial({
            color: stressColor,
            roughness: 0.35,
            metalness: 0.2,
            emissive: stressColor,
            emissiveIntensity: 0.35,
          });
        } else if (viewMode === 'thermal') {
          const isHot = /combust|turbo|chip|soc|motor|stator|battery|friction|ball|leaf|stem/i.test(info.componentId);
          const color = isHot ? new THREE.Color('#f43f5e') : new THREE.Color('#38bdf8');

          mesh.material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.3,
            metalness: 0.15,
            emissive: color,
            emissiveIntensity: 0.35,
          });
        }
      }
    });
  });
}

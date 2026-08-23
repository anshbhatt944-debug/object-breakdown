import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ObjectBreakdownData, ViewMode3D, ComponentNode } from '../../../types/objectData';
import { MODEL_ASSETS, ModelAssetConfig, ModelMeshMapping } from '../../../data/modelRegistry';
import { createComponentMesh } from './proceduralMeshes';

const gltfSceneCache = new Map<string, THREE.Group>();
const gltfLoader = new GLTFLoader();

interface AnimatedGLTFAsset {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

const animatedGltfCache = new Map<string, AnimatedGLTFAsset>();


async function loadAnimatedGLTF(url: string): Promise<AnimatedGLTFAsset> {
  const cached = animatedGltfCache.get(url);
  if (cached) {
    return {
      scene: cloneSkeleton(cached.scene) as THREE.Group,
      animations: cached.animations,
    };
  }

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });
        const asset: AnimatedGLTFAsset = { scene: gltf.scene, animations: gltf.animations };
        animatedGltfCache.set(url, asset);
        resolve({ scene: cloneSkeleton(asset.scene) as THREE.Group, animations: asset.animations });
      },
      undefined,
      (error) => reject(error),
    );
  });
}

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
  /** Real render meshes for logical components that cannot be re-parented (e.g. skinned assets). */
  sourceMeshes?: THREE.Mesh[];
  /** Native-animation components are driven by the GLB clip, not custom explode vectors. */
  nativeAnimated?: boolean;
}

export interface LoadedObjectResult {
  rootGroup: THREE.Group;
  componentMap: Map<string, LoadedComponentMeshInfo>;
  maxDimension: number;
  cameraDistance: number;
  animationMixer?: THREE.AnimationMixer;
  explodedAnimation?: THREE.AnimationClip;
  /** End of the authored assemble → fully-exploded segment within exploded_view. */
  explodedAnimationPeakTime?: number;
  /** Separate mixer for propeller rotation so it can run alongside explode scrubbing. */
  propellerMixer?: THREE.AnimationMixer;
  hoverAnimation?: THREE.AnimationClip;
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
  preserveHierarchy = false,
) {
  root.updateMatrixWorld(true);
  mesh.updateMatrixWorld(true);

  // Most assets can be flattened into independently animated meshes. The drone is
  // a skinned GLB, so its hierarchy must remain intact for the skeleton and native
  // animations to keep the geometry in the correct assembled pose.
  if (!preserveHierarchy) root.attach(mesh);

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

function normalizeMeshName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getSemanticMeshName(mesh: THREE.Mesh): string {
  if (!/^Object_\d+$/i.test(mesh.name)) return mesh.name;
  let current: THREE.Object3D | null = mesh.parent;
  while (current) {
    if (current.name && !/^Object_\d+$/i.test(current.name)) return current.name;
    current = current.parent;
  }
  return mesh.name;
}

function findMeshMapping(config: ModelAssetConfig, meshName: string): ModelMeshMapping | undefined {
  const mappings: Array<[string, ModelMeshMapping]> = Object.keys(config.meshMappings || {}).map((key) => [key, config.meshMappings![key]]);

  // Explicit source mesh aliases are used for complex assets such as the drone.
  const aliased = mappings.find(([, mapping]) => mapping.sourceMeshNames?.includes(meshName));
  if (aliased) return aliased[1];

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

function registerDroneComponentGroups(
  root: THREE.Group,
  config: ModelAssetConfig,
  componentMap: Map<string, LoadedComponentMeshInfo>,
) {
  const grouped = new Map<string, { mapping: ModelMeshMapping; meshes: THREE.Mesh[] }>();
  const unmapped: THREE.Mesh[] = [];

  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    const mapping = findMeshMapping(config, mesh.name);
    if (!mapping) {
      unmapped.push(mesh);
      return;
    }
    mesh.userData.componentId = mapping.componentId;
    mesh.userData.sourceMeshName = mesh.name;
    const bucket = grouped.get(mapping.componentId) || { mapping, meshes: [] };
    bucket.meshes.push(mesh);
    grouped.set(mapping.componentId, bucket);
  });

  const ordered = Array.from(grouped.values());
  ordered.forEach(({ mapping, meshes }, index) => {
    // IMPORTANT: do not attach/re-parent skinned meshes. The drone's 77 render
    // meshes share one skeleton, and moving them into logical groups breaks the
    // bone hierarchy and the native exploded animation. A lightweight proxy is
    // used for metadata while sourceMeshes remain in their original GLTF tree.
    const proxy = new THREE.Group();
    proxy.name = mapping.componentId;
    proxy.userData.logicalComponent = true;
    proxy.userData.nativeAnimated = true;

    const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    meshes.forEach((mesh) => {
      // The drone uses its own viewer and does not render a shadow-map pass.
      // Avoid keeping per-mesh shadow flags enabled on this dense skinned asset.
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      originalMaterials.set(
        mesh,
        Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : mesh.material.clone(),
      );
    });

    const explodeStart = mapping.explodeStart ?? Math.min(0.55, index * (0.48 / Math.max(ordered.length - 1, 1)));
    const explodeEnd = mapping.explodeEnd ?? Math.min(1, explodeStart + 0.52);

    componentMap.set(mapping.componentId, {
      mesh: proxy,
      componentId: mapping.componentId,
      displayName: mapping.displayName,
      category: mapping.category,
      basePosition: new THREE.Vector3(),
      baseRotation: new THREE.Euler(),
      baseScale: new THREE.Vector3(1, 1, 1),
      explodeVector: new THREE.Vector3(...mapping.explodeVector),
      explodedRotation: new THREE.Euler(),
      explodeStart,
      explodeEnd,
      originalMaterials,
      sourceMeshes: meshes,
      nativeAnimated: true,
    });
  });

  // Preserve unmapped meshes in the GLTF hierarchy so the asset always renders.
  // They remain non-selectable rather than appearing as meaningless Object_### labels.
  if (unmapped.length) {
    console.warn(`Drone model has ${unmapped.length} unmapped render meshes.`, unmapped.map((m) => m.name));
  }
}

function processGLTFMeshes(
  root: THREE.Group,
  config: ModelAssetConfig,
  componentMap: Map<string, LoadedComponentMeshInfo>,
) {
  if (config.objectId === 'drone') {
    registerDroneComponentGroups(root, config, componentMap);
    return;
  }

  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });

  meshes.forEach((mesh, index) => {
    const originalName = mesh.name;
    const semanticName = getSemanticMeshName(mesh);
    mesh.name = semanticName;

    registerMesh(
      root,
      mesh,
      findMeshMapping(config, semanticName),
      componentMap,
      index,
      meshes.length,
      false,
    );
    mesh.userData.sourceMeshName = originalName;
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
      if (config.objectId === 'drone') {
        const asset = await loadAnimatedGLTF(config.modelPath);
        const gltfScene = asset.scene;
        if (config.initialRotation) gltfScene.rotation.set(...config.initialRotation);
        if (config.initialOffset) gltfScene.position.set(...config.initialOffset);
        rootGroup.add(gltfScene);
        processGLTFMeshes(rootGroup, config, componentMap);

        const mixer = new THREE.AnimationMixer(gltfScene);
        const explodedAnimation = THREE.AnimationClip.findByName(asset.animations, 'exploded_view');
        const hoverAnimation = THREE.AnimationClip.findByName(asset.animations, 'hover');
        if (!explodedAnimation) throw new Error('Drone GLB does not contain exploded_view animation');

        // IMPORTANT: this authored clip is not a simple 0% → 100% explosion.
        // It explodes, holds, then reassembles before the clip ends. For this exact
        // asset the fully-exploded state is reached at ~2.0s, while the full clip
        // lasts ~6.47s. Scrubbing the full duration therefore caused the slider to
        // reassemble the drone above ~60%. Expose only the assemble → explode segment.
        const explodedAnimationPeakTime = Math.min(config.nativeExplodePeakTime ?? 2.0, explodedAnimation.duration);

        const action = mixer.clipAction(explodedAnimation);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
        mixer.setTime(0);

        // The hover clip contains propeller rotation plus other transforms that would
        // fight the exploded-view clip. Run only the four propeller rotation tracks
        // in a separate mixer, so the rotors can spin continuously without disturbing
        // the authored exploded positions.
        let propellerMixer: THREE.AnimationMixer | undefined;
        if (hoverAnimation) {
          const propellerTracks = hoverAnimation.tracks
            .filter((track) => /prop_[1-4]_jnt.*\.quaternion$/i.test(track.name))
            .map((track) => track.clone());

          if (propellerTracks.length > 0) {
            const propellerClip = new THREE.AnimationClip(
              'drone_propeller_spin',
              hoverAnimation.duration,
              propellerTracks,
            );
            propellerMixer = new THREE.AnimationMixer(gltfScene);
            const propellerAction = propellerMixer.clipAction(propellerClip);
            propellerAction.setLoop(THREE.LoopRepeat, Infinity);
            propellerAction.play();
          }
        }

        rootGroup.userData.animationMixer = mixer;
        rootGroup.userData.explodedAnimation = explodedAnimation;
        rootGroup.userData.explodedAnimationPeakTime = explodedAnimationPeakTime;
        rootGroup.userData.propellerMixer = propellerMixer;
        rootGroup.userData.hoverAnimation = hoverAnimation;
      } else {
        const gltfScene = await loadGLTFGroup(config.modelPath);
        if (config.initialRotation) gltfScene.rotation.set(...config.initialRotation);
        if (config.initialOffset) gltfScene.position.set(...config.initialOffset);
        rootGroup.add(gltfScene);
        processGLTFMeshes(rootGroup, config, componentMap);
        addPenEngineeringInternals(objectData, rootGroup, componentMap, viewMode);
      }
    } catch (e) {
      console.warn(`Could not load GLTF model for ${objectData.id}, using procedural fallback`, e);
      buildProceduralFallback(objectData, viewMode, rootGroup, componentMap);
    }
  } else {
    buildProceduralFallback(objectData, viewMode, rootGroup, componentMap);
  }

  rootGroup.updateMatrixWorld(true);

  rootGroup.updateWorldMatrix(true, true);
  const bbox = new THREE.Box3().setFromObject(rootGroup, config?.objectId === 'drone');
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  rootGroup.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const targetDim = config?.targetMaxDimension || 4.5;
  const normalizationScale = targetDim / maxDim;
  rootGroup.scale.multiplyScalar(normalizationScale);

  // Native animated assets already contain their own exact exploded transforms.
  // Do not compensate or rewrite their component transforms; the mixer owns them.
  if (config?.objectId !== 'drone') {
    componentMap.forEach((info) => {
      info.basePosition.copy(info.mesh.position);
      info.baseRotation.copy(info.mesh.rotation);
      info.baseScale.copy(info.mesh.scale);
      info.mesh.position.copy(info.basePosition);
      info.mesh.rotation.copy(info.baseRotation);
    });
  }


  return {
    rootGroup,
    componentMap,
    maxDimension: targetDim,
    cameraDistance: config?.defaultCameraDistance || targetDim * 1.5,
    animationMixer: rootGroup.userData.animationMixer as THREE.AnimationMixer | undefined,
    explodedAnimation: rootGroup.userData.explodedAnimation as THREE.AnimationClip | undefined,
    explodedAnimationPeakTime: rootGroup.userData.explodedAnimationPeakTime as number | undefined,
    propellerMixer: rootGroup.userData.propellerMixer as THREE.AnimationMixer | undefined,
    hoverAnimation: rootGroup.userData.hoverAnimation as THREE.AnimationClip | undefined,
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
    const renderMeshes = info.sourceMeshes || (() => {
      const meshes: THREE.Mesh[] = [];
      info.mesh.traverse((child) => { if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh); });
      return meshes;
    })();
    renderMeshes.forEach((mesh) => {
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
      });
    });
}

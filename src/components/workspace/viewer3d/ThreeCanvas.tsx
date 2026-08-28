import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ObjectBreakdownData, ViewMode3D } from '../../../types/objectData';
import { load3DModelForObject, loadUploaded3DModel, applyViewModeToModel, LoadedComponentMeshInfo } from './ModelLoader';
import { Box, Sparkles } from 'lucide-react';
import { iphone14ProReferenceAnnotations } from '../../../data/smartphoneReference';

interface ThreeCanvasProps {
  objectData: ObjectBreakdownData;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  hoveredComponentId: string | null;
  onHoverComponent: (id: string | null) => void;
  explodeAmount: number; // 0.0 to 1.0
  viewMode: ViewMode3D;
  isPlayingMechanism: boolean;
  isolatedComponentId: string | null;
  hiddenComponentIds: Set<string>;
  showLeaderLines: boolean;
  uploadedModel?: { url: string; fileName: string } | null;
}

interface LeaderLineAnnotation {
  nodeId: string;
  name: string;
  category: string;
  screenX: number;
  screenY: number;
  anchorX?: number;
  anchorY?: number;
  labelX?: number;
  labelY?: number;
  isLeft: boolean;
  visible: boolean;
  isVirtual?: boolean;
  side?: 'front' | 'back' | 'edge';
}


/**
 * Geometry-driven exploded layout for uploaded assemblies.
 *
 * This deliberately does NOT depend on names such as "lens", "camera" or
 * "battery". AI labels are useful for the UI, but explode geometry must work
 * for arbitrary uploaded GLB/GLTF assets. The largest assembly becomes the
 * visual reference; the dominant separation axis is inferred from the real
 * component centres; every other assembly is then spread along that axis with
 * a small geometry-derived perpendicular offset.
 */
interface ProgressiveSubpartInfo {
  id: string;
  parentId: string;
  mesh: THREE.Mesh;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  baseScale: THREE.Vector3;
  explodeVector: THREE.Vector3;
  explodeStart: number;
  explodeEnd: number;
}

type MeasuredAssembly = {
  id: string;
  info: LoadedComponentMeshInfo;
  box: THREE.Box3;
  center: THREE.Vector3;
  size: THREE.Vector3;
  volume: number;
};

function farthestAxis(points: THREE.Vector3[], fallback: THREE.Vector3) {
  let bestA: THREE.Vector3 | null = null;
  let bestB: THREE.Vector3 | null = null;
  let bestDistance = 0;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const distance = points[i].distanceToSquared(points[j]);
      if (distance > bestDistance) {
        bestDistance = distance;
        bestA = points[i];
        bestB = points[j];
      }
    }
  }

  const axis = bestA && bestB
    ? bestB.clone().sub(bestA)
    : fallback.clone();

  if (axis.lengthSq() < 1e-8) axis.copy(fallback);
  if (axis.lengthSq() < 1e-8) axis.set(1, 0, 0);
  return axis.normalize();
}

function longestBoxAxis(size: THREE.Vector3) {
  if (size.x >= size.y && size.x >= size.z) return new THREE.Vector3(1, 0, 0);
  if (size.y >= size.x && size.y >= size.z) return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
}

function worldVectorToParentLocal(mesh: THREE.Object3D, vector: THREE.Vector3) {
  const parent = mesh.parent;
  if (!parent) return vector.clone();

  const local = vector.clone();
  const parentQuaternion = parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  const parentScale = parent.getWorldScale(new THREE.Vector3(1, 1, 1));
  local.applyQuaternion(parentQuaternion);
  local.set(
    local.x / Math.max(Math.abs(parentScale.x), 1e-6),
    local.y / Math.max(Math.abs(parentScale.y), 1e-6),
    local.z / Math.max(Math.abs(parentScale.z), 1e-6)
  );
  return local;
}

function applyUploadedExplodeLayout(
  componentMap: Map<string, LoadedComponentMeshInfo>,
  root: THREE.Object3D
) {
  const entries = Array.from(componentMap.entries())
    .filter(([, info]) => !info.mesh.userData?.supplemental);
  if (entries.length < 2) return;

  root.updateWorldMatrix(true, true);

  const measured: MeasuredAssembly[] = entries.flatMap(([id, info]) => {
    const box = new THREE.Box3().setFromObject(info.mesh);
    if (box.isEmpty()) return [];
    const size = box.getSize(new THREE.Vector3());
    return [{
      id,
      info,
      box,
      size,
      center: box.getCenter(new THREE.Vector3()),
      volume: Math.max(size.x * size.y * size.z, 1e-8),
    }];
  });
  if (measured.length < 2) return;

  const rootBox = new THREE.Box3().setFromObject(root);
  const rootSize = rootBox.getSize(new THREE.Vector3());
  const rootDiagonal = Math.max(rootSize.length(), 1);
  const rootCenter = rootBox.getCenter(new THREE.Vector3());

  // Pick a stable visual reference: a large assembly close to the overall centre.
  const sortedByVolume = measured.slice().sort((a, b) => b.volume - a.volume);
  const largestVolume = sortedByVolume[0].volume;
  const anchor = measured
    .filter((item) => item.volume >= largestVolume * 0.55)
    .sort((a, b) => a.center.distanceToSquared(rootCenter) - b.center.distanceToSquared(rootCenter))[0]
    || sortedByVolume[0];

  // The axis is only used to create a small amount of ordered clearance. The main
  // motion follows each assembly's REAL spatial relationship to the reference,
  // which keeps arbitrary models readable instead of scattering them randomly.
  const axis = farthestAxis(
    measured.filter((item) => item !== anchor).map((item) => item.center),
    longestBoxAxis(rootSize)
  );

  const ordered = measured
    .filter((item) => item !== anchor)
    .map((item) => ({ item, projection: item.center.clone().sub(anchor.center).dot(axis) }))
    .sort((a, b) => a.projection - b.projection);

  const rankById = new Map<string, number>();
  ordered.forEach((entry, index) => rankById.set(entry.item.id, index));

  measured.forEach((item) => {
    const worldVector = new THREE.Vector3();

    if (item !== anchor) {
      const relative = item.center.clone().sub(anchor.center);
      const relativeDistance = relative.length();
      const localScale = Math.max(item.size.length(), rootDiagonal * 0.05);
      const rank = rankById.get(item.id) ?? 0;
      const normalizedRank = ordered.length <= 1 ? 0.5 : rank / (ordered.length - 1);

      // Primary motion: expand away from the reference while preserving the
      // uploaded assembly's original layout. Large assemblies receive more room;
      // tiny assemblies stay close instead of flying across the scene.
      if (relativeDistance > rootDiagonal * 0.012) {
        const radial = relative.multiplyScalar(1 / relativeDistance);
        const radialDistance = Math.min(
          relativeDistance * 0.42 + localScale * 0.38 + rootDiagonal * 0.055,
          rootDiagonal * 0.52
        );
        worldVector.addScaledVector(radial, radialDistance);
      } else {
        // Coincident centres are rare, but can happen in CAD exports. Use the
        // measured dominant axis with a deterministic rank-based sign, never a
        // random direction.
        const sign = rank % 2 === 0 ? -1 : 1;
        worldVector.addScaledVector(axis, sign * Math.min(localScale * 0.42, rootDiagonal * 0.18));
      }

      // Secondary clearance along the measured construction axis. This is modest
      // on purpose: it opens gaps between neighbouring systems without destroying
      // the object's original silhouette.
      const projection = item.center.clone().sub(anchor.center).dot(axis);
      const sign = projection >= 0 ? 1 : -1;
      const orderedGap = rootDiagonal * (0.045 + normalizedRank * 0.035);
      worldVector.addScaledVector(axis, sign * orderedGap);

      // Never let a small component outrun a large one purely because it happened
      // to start far from the anchor.
      const maxTravel = Math.min(rootDiagonal * 0.68, localScale * 2.2 + rootDiagonal * 0.12);
      if (worldVector.length() > maxTravel) worldVector.setLength(maxTravel);
    }

    item.info.explodeVector.copy(worldVectorToParentLocal(item.info.mesh, worldVector));
    item.info.explodeStart = 0;
    item.info.explodeEnd = 0.64;
    item.info.explodedRotation.copy(item.info.baseRotation);
  });
}

/**
 * Stage 2 splits REAL render meshes inside each semantic assembly. The motion is
 * hierarchical: the parent assembly first reaches its exploded position, then the
 * child meshes open around that parent. No semantic names or object-specific rules
 * are used, so the same logic works for cameras, engines, electronics, appliances,
 * tools and other uploaded GLB/GLTF assemblies.
 */
function buildProgressiveSubparts(
  componentMap: Map<string, LoadedComponentMeshInfo>
): Map<string, ProgressiveSubpartInfo> {
  const result = new Map<string, ProgressiveSubpartInfo>();

  componentMap.forEach((info, parentId) => {
    if (info.mesh.userData?.supplemental) return;

    info.mesh.updateWorldMatrix(true, true);
    const componentBox = new THREE.Box3().setFromObject(info.mesh);
    if (componentBox.isEmpty()) return;

    const componentCenter = componentBox.getCenter(new THREE.Vector3());
    const componentSize = componentBox.getSize(new THREE.Vector3());
    const componentDiagonal = Math.max(componentSize.length(), 0.25);

    const candidates: Array<{
      mesh: THREE.Mesh;
      center: THREE.Vector3;
      size: THREE.Vector3;
      volume: number;
      diagonal: number;
    }> = [];

    info.mesh.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      if (!mesh.geometry || mesh.userData?.supplemental) return;

      // Never animate both a render mesh and one of its render-mesh descendants;
      // that would apply two nested offsets and is a major source of wild scatter.
      let hasMeshDescendant = false;
      for (const nested of mesh.children) {
        nested.traverse((node) => {
          if (node !== mesh && (node as THREE.Mesh).isMesh) hasMeshDescendant = true;
        });
      }
      if (hasMeshDescendant) return;

      const box = new THREE.Box3().setFromObject(mesh);
      if (box.isEmpty()) return;
      const size = box.getSize(new THREE.Vector3());
      const volume = Math.max(size.x * size.y * size.z, 1e-10);
      candidates.push({
        mesh,
        center: box.getCenter(new THREE.Vector3()),
        size,
        volume,
        diagonal: Math.max(size.length(), 1e-6),
      });
    });

    if (candidates.length < 2) return;

    const maxVolume = Math.max(...candidates.map((item) => item.volume));
    const chosen = candidates
      .filter((item) => (
        item.volume >= maxVolume * 0.0005 ||
        item.diagonal >= componentDiagonal * 0.055
      ))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 12);

    if (chosen.length < 2) return;

    const axis = farthestAxis(
      chosen.map((item) => item.center),
      longestBoxAxis(componentSize)
    );
    const referenceMesh = chosen[0];

    const ordered = chosen
      .map((item) => ({ item, projection: item.center.clone().sub(componentCenter).dot(axis) }))
      .sort((a, b) => a.projection - b.projection);

    chosen.forEach((candidate) => {
      const worldVector = new THREE.Vector3();

      if (candidate !== referenceMesh) {
        const relative = candidate.center.clone().sub(componentCenter);
        const distance = relative.length();
        const sizeRatio = THREE.MathUtils.clamp(candidate.diagonal / componentDiagonal, 0.03, 1);

        // Expand locally around the semantic assembly's own centre. Because this
        // mesh remains parented to the moving assembly, the final pose is always
        // parent explode + bounded local detail explode.
        if (distance > componentDiagonal * 0.01) {
          const radial = relative.multiplyScalar(1 / distance);
          const localDistance = Math.min(
            distance * 0.30 + candidate.diagonal * 0.42 + componentDiagonal * 0.035,
            componentDiagonal * (0.12 + sizeRatio * 0.22)
          );
          worldVector.addScaledVector(radial, localDistance);
        }

        // Add a small measured-axis clearance. This separates concentric stacks
        // such as barrels, rings, housings and layered mechanisms without sending
        // the pieces into unrelated directions.
        const projection = relative.dot(axis);
        const sign = projection >= 0 ? 1 : -1;
        const rank = ordered.findIndex((entry) => entry.item === candidate);
        const normalizedRank = ordered.length <= 1 ? 0.5 : rank / (ordered.length - 1);
        worldVector.addScaledVector(
          axis,
          sign * componentDiagonal * (0.045 + normalizedRank * 0.055)
        );

        // Coincident centres still need a deterministic split.
        if (worldVector.lengthSq() < 1e-8) {
          const signFromRank = rank % 2 === 0 ? -1 : 1;
          worldVector.addScaledVector(axis, signFromRank * componentDiagonal * (0.08 + sizeRatio * 0.08));
        }

        const maxLocalTravel = componentDiagonal * (0.14 + sizeRatio * 0.28);
        if (worldVector.length() > maxLocalTravel) worldVector.setLength(maxLocalTravel);
      }

      const id = `${parentId}::detail-${result.size + 1}`;
      result.set(id, {
        id,
        parentId,
        mesh: candidate.mesh,
        basePosition: candidate.mesh.position.clone(),
        baseRotation: candidate.mesh.rotation.clone(),
        baseScale: candidate.mesh.scale.clone(),
        explodeVector: worldVectorToParentLocal(candidate.mesh, worldVector),
        // Parent systems establish the readable global exploded layout first.
        // Internal detail separation then becomes increasingly visible near the
        // upper half of the slider, reaching full disassembly at 100%.
        explodeStart: 0.34,
        explodeEnd: 1,
      });
    });
  });

  return result;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  objectData,
  selectedComponentId,
  onSelectComponent,
  hoveredComponentId,
  onHoverComponent,
  explodeAmount,
  viewMode,
  isPlayingMechanism,
  isolatedComponentId,
  hiddenComponentIds,
  showLeaderLines,
  uploadedModel = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const activeRootGroupRef = useRef<THREE.Group | null>(null);
  const componentMapRef = useRef<Map<string, LoadedComponentMeshInfo>>(new Map());
  const progressiveSubpartsRef = useRef<Map<string, ProgressiveSubpartInfo>>(new Map());

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [annotations, setAnnotations] = useState<LeaderLineAnnotation[]>([]);

  // Internal mutable hover state refs to eliminate React re-render loops and flicker
  const activeHoverIdRef = useRef<string | null>(null);
  const lastReportedHoverIdRef = useRef<string | null>(null);
  const hoverThrottleTimerRef = useRef<number | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  // Separate raycaster used only for annotation anchors so the leader-line dot
  // lands on the actual visible surface of each moving component.
  const annotationRaycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Smooth Orbit & Camera State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({
    spherical: new THREE.Spherical(7.0, Math.PI / 2.6, Math.PI / 4),
    target: new THREE.Vector3(0, 0, 0),
  });
  const targetCameraDistanceRef = useRef(8.4);

  // Performance state is intentionally kept outside React. The watch asset is a
  // dense 300k+ triangle GLB, so we avoid turning every frame into a React update
  // or an expensive annotation/raycast pass.
  const isWatchRef = useRef(false);

  // Update camera position helper
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { spherical, target } = cameraRotationRef.current;
    cameraRef.current.position.setFromSpherical(spherical).add(target);
    cameraRef.current.lookAt(target);
  }, []);

  // Initialize Three.js WebGL Engine once
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    // PCFSoft at 2K is particularly expensive for the dense watch. Use a cheaper
    // filtered map; the visual difference is negligible at this viewer scale.
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    // Professional Studio CAD Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd6c7ba, 1.15);
    fillLight.position.set(-8, -4, -6);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xff5c35, 1.25, 30);
    rimLight.position.set(0, 8, -6);
    scene.add(rimLight);

    // Subtle CAD Floor Grid
    const gridHelper = new THREE.GridHelper(18, 36, 0xff5c35, 0x383838);
    gridHelper.position.y = -2.8;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.28;
    scene.add(gridHelper);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, isWatchRef.current ? 1.25 : 1.75));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [updateCameraPosition]);

  // Load Real GLB / Composite Model when objectData changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let isMounted = true;
    setIsLoading(true);

    // Remove existing root group
    if (activeRootGroupRef.current) {
      scene.remove(activeRootGroupRef.current);
      activeRootGroupRef.current = null;
    }
    componentMapRef.current.clear();
    progressiveSubpartsRef.current.clear();
    activeHoverIdRef.current = null;

    const loadPromise = uploadedModel ? loadUploaded3DModel(uploadedModel.url, objectData, viewMode) : load3DModelForObject(objectData, viewMode);
    loadPromise.then((result) => {
      if (!isMounted) return;

      activeRootGroupRef.current = result.rootGroup;
      componentMapRef.current = result.componentMap;
      if (uploadedModel) {
        applyUploadedExplodeLayout(result.componentMap, result.rootGroup);
        progressiveSubpartsRef.current = buildProgressiveSubparts(result.componentMap);
      }
      isWatchRef.current = objectData.id === 'wristwatch';

      // The watch has a high triangle count and dozens of independently moving
      // parts. Its self-shadow pass costs more than the main render pass while
      // exploded, so keep the studio lighting but disable per-part shadow maps.
      if (isWatchRef.current) {
        result.rootGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });
        rendererRef.current?.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      } else {
        rendererRef.current?.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      }

      scene.add(result.rootGroup);

      // Apply initial view mode
      applyViewModeToModel(result.componentMap, viewMode);

      // Smoothly frame model
      const presentationDistance = Math.max(result.cameraDistance * 1.24, result.maxDimension * 1.7);
      targetCameraDistanceRef.current = presentationDistance;
      cameraRotationRef.current.spherical.radius = presentationDistance;
      // Give the iPhone a presentation-oriented starting view: its GLB is a
      // very thin slab, so a front-biased camera makes the technical callouts
      // readable immediately instead of opening on an almost edge-on view.
      if (objectData.id === 'smartphone') {
        cameraRotationRef.current.spherical.theta = Math.PI / 2;
        cameraRotationRef.current.spherical.phi = Math.PI / 2.08;
      } else {
        cameraRotationRef.current.spherical.theta = Math.PI / 4;
        cameraRotationRef.current.spherical.phi = Math.PI / 2.6;
      }
      cameraRotationRef.current.target.set(0, 0, 0);
      updateCameraPosition();

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [objectData.id, uploadedModel?.url, updateCameraPosition]);

  // Apply ViewMode changes to model (without reloading)
  useEffect(() => {
    if (componentMapRef.current.size > 0) {
      applyViewModeToModel(componentMapRef.current, viewMode);
    }
  }, [viewMode]);

  // Update In-Place Selection & Isolation Visibility
  useEffect(() => {
    componentMapRef.current.forEach((info, id) => {
      const isSelected = selectedComponentId === id;
      const isHovered = activeHoverIdRef.current === id;
      const isHidden = hiddenComponentIds.has(id);
      const isIsolated = isolatedComponentId ? isolatedComponentId === id : true;

      info.mesh.visible = !isHidden && isIsolated;

      // Update mesh emissive highlighting in-place
      info.mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            if ((mat as THREE.MeshStandardMaterial).emissive) {
              const stdMat = mat as THREE.MeshStandardMaterial;
              if (isSelected) {
                stdMat.emissive.set('#ff5c35');
                stdMat.emissiveIntensity = 0.45;
              } else if (isHovered) {
                stdMat.emissive.set('#d4a28f');
                stdMat.emissiveIntensity = 0.3;
              } else {
                stdMat.emissive.set('#000000');
                stdMat.emissiveIntensity = 0.0;
              }
            }
          }
        }
      });
    });
  }, [selectedComponentId, isolatedComponentId, hiddenComponentIds]);

  // Render loop + staged engineering exploded-view interpolation.
  // Every component has its own explosion vector and progress window.
  useEffect(() => {
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let lastAnnotationUpdate = 0;
    let lastWatchRender = 0;

    const smoothStep = (value: number) => {
      const t = Math.max(0, Math.min(1, value));
      return t * t * (3 - 2 * t);
    };

    const renderLoop = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const isWatch = isWatchRef.current;

      // 45 FPS is visually smooth for this static engineering viewer and gives the
      // watch a stable frame budget on high-DPI displays. Keep 60 FPS for the
      // lighter models and for active mechanism playback.
      const watchFrameInterval = isPlayingMechanism ? (1 / 50) : (1 / 45);
      if (isWatch && elapsed - lastWatchRender < watchFrameInterval) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }
      lastWatchRender = elapsed;

      const spherical = cameraRotationRef.current.spherical;
      spherical.radius += (targetCameraDistanceRef.current - spherical.radius) * 0.12;
      updateCameraPosition();

      componentMapRef.current.forEach((info, id) => {
        const isSupplemental = Boolean(info.mesh.userData?.supplemental);
        const hiddenByUser = hiddenComponentIds.has(id);
        const isolatedOut = isolatedComponentId ? isolatedComponentId !== id : false;
        if (isSupplemental && explodeAmount < info.explodeStart) {
          info.mesh.visible = false;
        } else if (!hiddenByUser && !isolatedOut) {
          info.mesh.visible = true;
        }

        const range = Math.max(0.001, info.explodeEnd - info.explodeStart);
        const localProgress = Math.max(
          0,
          Math.min(1, (explodeAmount - info.explodeStart) / range)
        );
        const easedProgress = smoothStep(localProgress);

        const targetPos = info.basePosition.clone().addScaledVector(
          info.explodeVector,
          easedProgress
        );

        const targetRot = info.baseRotation.clone();
        targetRot.x += (info.explodedRotation.x - info.baseRotation.x) * easedProgress;
        targetRot.y += (info.explodedRotation.y - info.baseRotation.y) * easedProgress;
        targetRot.z += (info.explodedRotation.z - info.baseRotation.z) * easedProgress;

        // Use the exact state derived from the slider on every frame.
        // The previous lerp-based approach allowed each watch mesh to lag by a
        // different amount while the slider was moving, which looked like parts
        // were wobbling or tearing through one another. Keeping the explode pose
        // deterministic makes the mechanism read like a precise CAD disassembly.
        info.mesh.position.copy(targetPos);
        info.mesh.rotation.copy(targetRot);
        info.mesh.scale.copy(info.baseScale);

        // Mechanism motion is layered on top of the stable exploded pose, never
        // accumulated from the previous frame. This prevents rotational drift.
        if (isPlayingMechanism) {
          if (id.includes('ball') || id.includes('wheel') || id.includes('gear') || id.includes('rotor')) {
            info.mesh.rotation.y += elapsed * 2.2;
          }

          if (id.includes('spring')) {
            const compression = 1.0 + Math.sin(elapsed * 7) * 0.06 * localProgress;
            info.mesh.scale.set(
              info.baseScale.x,
              info.baseScale.y * compression,
              info.baseScale.z
            );
          }
        }
      });

      // Stage 2: split substantial real meshes inside semantic groups. This is
      // geometry-driven and therefore works for arbitrary uploaded assemblies.
      progressiveSubpartsRef.current.forEach((subpart) => {
        const parent = componentMapRef.current.get(subpart.parentId);
        const parentVisible = Boolean(parent?.mesh.visible);
        const range = Math.max(0.001, subpart.explodeEnd - subpart.explodeStart);
        const localProgress = Math.max(
          0,
          Math.min(1, (explodeAmount - subpart.explodeStart) / range)
        );
        const easedProgress = smoothStep(localProgress);

        subpart.mesh.position.copy(subpart.basePosition).addScaledVector(
          subpart.explodeVector,
          easedProgress
        );
        subpart.mesh.rotation.copy(subpart.baseRotation);
        subpart.mesh.scale.copy(subpart.baseScale);
        subpart.mesh.visible = parentVisible;
      });

      // DOM annotations are expensive to update at 60 FPS and can cause the cursor
      // to move between a canvas hit and a label. Update them at a modest rate.
      if (
        showLeaderLines &&
        cameraRef.current &&
        containerRef.current &&
        componentMapRef.current.size > 0 &&
        elapsed - lastAnnotationUpdate > (isWatch ? 0.18 : 0.08)
      ) {
        lastAnnotationUpdate = elapsed;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const entries = Array.from(componentMapRef.current.entries());
        const isSmartphone = objectData.id === 'smartphone';

        const newAnnotations: LeaderLineAnnotation[] = [];

        if (isSmartphone && activeRootGroupRef.current) {
          // The supplied iPhone GLB is a single exterior mesh. We therefore use
          // a true technical reference map: the dot is projected onto the
          // corresponding region of the phone, while the readable badge is
          // laid out in a clean left/right column with a leader line.
          const root = activeRootGroupRef.current;
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const cameraLocal = root.worldToLocal(cameraRef.current!.position.clone());
          const viewingFront = cameraLocal.z >= 0;

          const visibleRefs = iphone14ProReferenceAnnotations.filter((ref) => {
            if (ref.side === 'edge') return true;
            return ref.side === (viewingFront ? 'front' : 'back');
          });

          // Keep all relevant systems visible once the technical map is open.
          // At very low explosion values use a slightly smaller set to preserve
          // visual clarity; the full map appears as the user explores.
          const maxVisible = explodeAmount < 0.18 ? 9 : 14;
          const rankedRefs = [...visibleRefs]
            .sort((a, b) => {
              const aPriority = a.nodeId === 'iphone-display-assembly' || a.nodeId === 'iphone-logic-board' ? -2 : 0;
              const bPriority = b.nodeId === 'iphone-display-assembly' || b.nodeId === 'iphone-logic-board' ? -2 : 0;
              return aPriority - bPriority;
            })
            .slice(0, maxVisible);

          const projected = rankedRefs.map((ref) => {
            const local = new THREE.Vector3(
              center.x + (ref.anchor[0] * 0.5) * size.x,
              center.y + (ref.anchor[1] * 0.5) * size.y,
              center.z + (ref.anchor[2] * 0.5) * size.z,
            );
            const worldPos = root.localToWorld(local.clone());
            const screenPos = worldPos.project(cameraRef.current!);
            return { ref, screenPos, worldPos };
          }).filter(({ screenPos }) => screenPos.z <= 1.2);

          const left = projected
            .filter(({ ref }) => ref.anchor[0] < 0)
            .sort((a, b) => a.screenPos.y - b.screenPos.y);
          const right = projected
            .filter(({ ref }) => ref.anchor[0] >= 0)
            .sort((a, b) => a.screenPos.y - b.screenPos.y);

          const layoutColumn = (items: typeof left, isLeft: boolean) => {
            const minY = Math.max(110, height * 0.16);
            const maxY = Math.min(height - 105, height * 0.86);
            const step = items.length > 1
              ? Math.min(72, (maxY - minY) / (items.length - 1))
              : 0;
            const labelX = isLeft ? Math.max(145, width * 0.20) : Math.min(width - 145, width * 0.80);

            return items.map(({ ref, screenPos }, index) => {
              const labelY = items.length === 1
                ? (minY + maxY) / 2
                : minY + index * step;
              const anchorX = (screenPos.x * 0.5 + 0.5) * width;
              const anchorY = (-(screenPos.y * 0.5) + 0.5) * height;

              return {
                nodeId: ref.nodeId,
                name: ref.label,
                category: ref.category,
                screenX: labelX,
                screenY: labelY,
                anchorX,
                anchorY,
                labelX,
                labelY,
                isLeft,
                visible: true,
                isVirtual: true,
                side: ref.side,
              } satisfies LeaderLineAnnotation;
            });
          };

          newAnnotations.push(...layoutColumn(left, true), ...layoutColumn(right, false));
        } else {
          // For real multi-mesh assets, project the actual mesh hierarchy and
          // then lay labels out in dedicated left/right annotation columns.
          // This keeps the model readable instead of covering it with badges.
          const targets = selectedComponentId
            ? entries.filter(([id]) => id === selectedComponentId)
            : objectData.id === 'wristwatch'
              // Rendering 50+ DOM labels and raycasting every one of them against a
              // 300k triangle assembly is the main cause of the watch slowdown. Keep
              // the same annotation system, but show a curated visible set; every
              // component remains available in the component tree and can be selected.
              ? entries.filter(([id, info]) => info.mesh.visible).slice(0, explodeAmount >= 0.52 ? 18 : 10)
              : explodeAmount >= 0.52
                ? entries
                : entries.slice(0, Math.min(10, entries.length));

          const projectedTargets = targets.flatMap(([id, info]) => {
            if (!info.mesh.visible) return [];

            // For normal objects keep the exact surface raycast. For the dense watch
            // we use the component's transformed bounding sphere to derive the
            // camera-facing surface point. This is O(number of components) instead
            // of repeatedly testing the full 300k-triangle assembly for occlusion.
            info.mesh.updateWorldMatrix(true, true);
            const geometryBox = new THREE.Box3().setFromObject(info.mesh);
            if (geometryBox.isEmpty()) return [];

            const componentCenter = geometryBox.getCenter(new THREE.Vector3());
            let anchorWorld: THREE.Vector3;

            if (isWatch) {
              const sphere = geometryBox.getBoundingSphere(new THREE.Sphere());
              const towardCamera = cameraRef.current!.position.clone().sub(sphere.center);
              if (towardCamera.lengthSq() < 1e-8) return [];
              towardCamera.normalize();
              anchorWorld = sphere.center.clone().addScaledVector(towardCamera, sphere.radius * 0.72);
            } else {
              const rayDirection = componentCenter.clone().sub(cameraRef.current!.position);
              if (rayDirection.lengthSq() < 1e-8) return [];
              rayDirection.normalize();

              const anchorRaycaster = annotationRaycasterRef.current;
              anchorRaycaster.set(cameraRef.current!.position, rayDirection);
              anchorRaycaster.near = 0.01;
              anchorRaycaster.far = cameraRef.current!.position.distanceTo(componentCenter) + geometryBox.getSize(new THREE.Vector3()).length() * 1.5;

              const hits = anchorRaycaster.intersectObject(info.mesh, true);
              anchorWorld = hits.length ? hits[0].point.clone() : componentCenter.clone();
            }

            const screenPos = anchorWorld.clone().project(cameraRef.current!);
            if (screenPos.z > 1 || screenPos.z < -1.2) return [];

            return [{
              id,
              info,
              screenX: (screenPos.x * 0.5 + 0.5) * width,
              screenY: (-(screenPos.y * 0.5) + 0.5) * height,
            }];
          });

          const genericLeft = projectedTargets.filter((item) => item.screenX < width * 0.5).sort((a, b) => a.screenY - b.screenY);
          const genericRight = projectedTargets.filter((item) => item.screenX >= width * 0.5).sort((a, b) => a.screenY - b.screenY);

          const layoutGenericColumn = (items: typeof genericLeft, isLeft: boolean) => {
            const minY = Math.max(74, height * 0.14);
            const maxY = Math.min(height - 82, height * 0.86);
            const minGap = 56;
            const step = items.length > 1
              ? Math.max(minGap, Math.min(76, (maxY - minY) / Math.max(1, items.length - 1)))
              : 0;
            const labelX = isLeft ? Math.max(160, width * 0.18) : Math.min(width - 160, width * 0.82);

            return items.map((item, index) => {
              const preferredY = Math.max(minY, Math.min(maxY, item.screenY));
              const labelY = items.length === 1 ? preferredY : Math.max(minY + index * step, Math.min(maxY, preferredY));
              return {
                nodeId: item.id,
                name: item.info.displayName,
                category: item.info.category,
                screenX: labelX,
                screenY: labelY,
                anchorX: item.screenX,
                anchorY: item.screenY,
                labelX,
                labelY,
                isLeft,
                visible: true,
              } satisfies LeaderLineAnnotation;
            });
          };

          newAnnotations.push(...layoutGenericColumn(genericLeft, true), ...layoutGenericColumn(genericRight, false));
        }

        const leftLabels = newAnnotations.filter((a) => a.isLeft).sort((a, b) => a.screenY - b.screenY);
        const rightLabels = newAnnotations.filter((a) => !a.isLeft).sort((a, b) => a.screenY - b.screenY);

        const adjustSpacing = (labels: LeaderLineAnnotation[], topLimit: number, bottomLimit: number) => {
          const gap = 56;
          for (let i = 1; i < labels.length; i++) {
            labels[i].screenY = Math.max(labels[i].screenY, labels[i - 1].screenY + gap);
          }
          if (labels.length && labels[labels.length - 1].screenY > bottomLimit) {
            labels[labels.length - 1].screenY = bottomLimit;
            for (let i = labels.length - 2; i >= 0; i--) labels[i].screenY = Math.min(labels[i].screenY, labels[i + 1].screenY - gap);
          }
          if (labels.length && labels[0].screenY < topLimit) {
            const shift = topLimit - labels[0].screenY;
            labels.forEach((label) => { label.screenY += shift; });
          }
          labels.forEach((label) => { label.labelY = label.screenY; });
        };

        adjustSpacing(leftLabels, 66, height - 66);
        adjustSpacing(rightLabels, 66, height - 66);
        setAnnotations([...leftLabels, ...rightLabels]);
      } else if (!showLeaderLines && annotations.length > 0) {
        setAnnotations([]);
      }

      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    explodeAmount,
    isPlayingMechanism,
    showLeaderLines,
    selectedComponentId,
    updateCameraPosition,
  ]);

  // Stable In-Place Hover Function (100% Zero Flickering!)
  const setMeshHoverState = (targetId: string | null) => {
    if (activeHoverIdRef.current === targetId) return;

    // Reset previous hover
    if (activeHoverIdRef.current) {
      const prev = componentMapRef.current.get(activeHoverIdRef.current);
      if (prev && selectedComponentId !== activeHoverIdRef.current) {
        prev.mesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mat = (child as THREE.Mesh).material;
            const targetMat = Array.isArray(mat) ? mat[0] : mat;
            if ((targetMat as THREE.MeshStandardMaterial)?.emissive) {
              (targetMat as THREE.MeshStandardMaterial).emissive.set('#000000');
              (targetMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
            }
          }
        });
      }
    }

    // Set new hover
    activeHoverIdRef.current = targetId;
    if (targetId && selectedComponentId !== targetId) {
      const current = componentMapRef.current.get(targetId);
      if (current) {
        current.mesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mat = (child as THREE.Mesh).material;
            const targetMat = Array.isArray(mat) ? mat[0] : mat;
            if ((targetMat as THREE.MeshStandardMaterial)?.emissive) {
              (targetMat as THREE.MeshStandardMaterial).emissive.set('#0ea5e9');
              (targetMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.35;
            }
          }
        });
      }
    }

    // Throttled notification to React
    if (hoverThrottleTimerRef.current) {
      window.clearTimeout(hoverThrottleTimerRef.current);
    }
    hoverThrottleTimerRef.current = window.setTimeout(() => {
      if (lastReportedHoverIdRef.current !== targetId) {
        lastReportedHoverIdRef.current = targetId;
        onHoverComponent(targetId);
      }
    }, 60);
  };

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      const spherical = cameraRotationRef.current.spherical;
      spherical.theta -= deltaX * 0.007;
      spherical.phi = Math.max(0.12, Math.min(Math.PI - 0.12, spherical.phi - deltaY * 0.007));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Raycast hover detection against meshes in scene
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = mouseRef.current.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(mouse, cameraRef.current);

    const root = activeRootGroupRef.current;
    if (!root) {
      setMeshHoverState(null);
      return;
    }

    const intersects = raycaster.intersectObjects(root.children, true);
    if (intersects.length > 0) {
      let hitMesh: THREE.Object3D | null = intersects[0].object;
      while (hitMesh && hitMesh !== sceneRef.current) {
        if (componentMapRef.current.has(hitMesh.name)) {
          setMeshHoverState(hitMesh.name);
          return;
        }
        hitMesh = hitMesh.parent;
      }
    }
    setMeshHoverState(null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = mouseRef.current.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(mouse, cameraRef.current);

    const root = activeRootGroupRef.current;
    if (!root) return;

    const intersects = raycaster.intersectObjects(root.children, true);
    if (intersects.length > 0) {
      let hitMesh: THREE.Object3D | null = intersects[0].object;
      while (hitMesh && hitMesh !== sceneRef.current) {
        if (componentMapRef.current.has(hitMesh.name)) {
          onSelectComponent(hitMesh.name === selectedComponentId ? null : hitMesh.name);
          return;
        }
        hitMesh = hitMesh.parent;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    targetCameraDistanceRef.current = Math.max(3.5, Math.min(28.0, targetCameraDistanceRef.current + e.deltaY * 0.006));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {objectData.id === 'smartphone' && !isLoading && (
        <div className="absolute top-4 left-4 z-20 max-w-[310px] pointer-events-none">
          <div className="px-3 py-2 rounded-xl border border-[#38bdf8]/20 bg-[#0d111a]/75 backdrop-blur-md shadow-lg">
            <div className="text-[10px] font-mono-cad uppercase tracking-[0.18em] text-[#38bdf8] font-bold">Technical Component Map</div>
            <div className="mt-1 text-[10px] leading-relaxed text-slate-400">Internal systems are shown as reference callouts because the supplied smartphone GLB is an exterior model, not a separated teardown.</div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#07090e]/80 backdrop-blur-md font-mono-cad text-xs text-slate-300">
          <div className="w-10 h-10 rounded-xl bg-[#00f2ad]/10 border border-[#00f2ad]/30 flex items-center justify-center text-[#00f2ad] animate-spin mb-3">
            <Box className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-widest text-[#00f2ad] uppercase animate-pulse">
            LOADING REAL 3D ASSET...
          </span>
          <span className="text-[10px] text-slate-500 mt-1">Calibrating CAD geometry & PBR materials</span>
        </div>
      )}

      {/* Engineering-style leader lines. Every label lives outside the model and
          connects back to a projected anchor point with a small elbow line. */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {showLeaderLines && !isLoading && (
          <svg className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
            {annotations.map((ann) => {
              if (ann.anchorX == null || ann.anchorY == null || ann.labelX == null || ann.labelY == null) return null;
              const labelEdgeX = ann.isLeft ? ann.labelX + 8 : ann.labelX - 8;
              const elbowX = ann.isLeft ? Math.max(ann.anchorX - 38, labelEdgeX + 30) : Math.min(ann.anchorX + 38, labelEdgeX - 30);
              const active = selectedComponentId === ann.nodeId;
              return (
                <g key={`line-${ann.nodeId}`}>
                  <polyline
                    points={`${ann.anchorX},${ann.anchorY} ${elbowX},${ann.anchorY} ${labelEdgeX},${ann.labelY}`}
                    fill="none"
                    stroke={active ? '#ff5c35' : '#8b8b84'}
                    strokeOpacity={active ? 1 : 0.62}
                    strokeWidth={active ? 2 : 1}
                    strokeDasharray={active ? undefined : '3 3'}
                  />
                  <circle cx={ann.anchorX} cy={ann.anchorY} r={active ? 4.5 : 3.2} fill={active ? '#ff5c35' : '#8b8b84'} />
                </g>
              );
            })}
          </svg>
        )}

        {showLeaderLines &&
          !isLoading &&
          annotations.map((ann, idx) => {
            const isSelected = selectedComponentId === ann.nodeId;
            const isHovered = activeHoverIdRef.current === ann.nodeId;
            const left = ann.labelX ?? ann.screenX;
            const top = ann.labelY ?? ann.screenY;

            return (
              <div
                key={ann.nodeId}
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  transform: `translate(${ann.isLeft ? '-100%' : '0%'}, -50%)`,
                }}
                className="absolute flex items-center gap-2"
              >
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectComponent(isSelected ? null : ann.nodeId);
                  }}
                  className={`three-label pointer-events-auto cursor-pointer min-w-[184px] max-w-[250px] px-3 py-2 text-xs font-mono-cad border transition-all ${
                    isSelected
                      ? 'three-label-selected'
                      : isHovered
                      ? 'three-label-hovered'
                      : 'three-label-default'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[9px] font-bold annotation-index ${isSelected ? 'annotation-index-active' : ''}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="three-label-name font-semibold tracking-wide leading-tight">{ann.name}</div>
                      <div className="three-label-meta mt-1 text-[9px] uppercase tracking-[0.12em] flex items-center gap-1.5">
                        {ann.category}
                        {ann.isVirtual && <span className="text-[8px] text-amber-300/90 border border-amber-300/20 rounded px-1 py-0.5">REFERENCE</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

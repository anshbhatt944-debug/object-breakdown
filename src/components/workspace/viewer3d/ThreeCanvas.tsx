import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ObjectBreakdownData, ViewMode3D } from '../../../types/objectData';
import { load3DModelForObject, loadUploaded3DModel, applyViewModeToModel, LoadedComponentMeshInfo } from './ModelLoader';
import { fitCameraToObject, computeModelFramingSet, CameraFramingResult } from './cameraUtils';
import { Box } from 'lucide-react';
import { iphone14ProReferenceAnnotations } from '../../../data/smartphoneReference';
import { solveAnnotationLayout, AnnotationItem } from '../../../utils/annotationSolver';

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
  theme?: 'light' | 'dark';
}

interface LeaderLineAnnotation {
  nodeId: string;
  name: string;
  category: string;
  modelId?: string;
  isLeft: boolean;
  visible: boolean;
  isVirtual?: boolean;
  side?: 'front' | 'back' | 'edge';
  anchorX: number;
  anchorY: number;
  labelX: number;
  labelY: number;
  cardWidth: number;
  cardHeight: number;
  cardAttachX: number;
  cardCenterY: number;
  elbowX: number;
  elbowY: number;
  pathD: string;
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

function normalizeAndCenterUploadedModel(root: THREE.Object3D, targetSize = 5.5) {
  root.updateMatrixWorld(true);

  let box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return null;

  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);

  if (!Number.isFinite(maxDimension) || maxDimension <= 1e-8) {
    return null;
  }

  // Uploaded CAD/GLB files can use wildly different units/scales. Normalize only
  // uploaded assets so a millimetre-scale or kilometre-scale export still presents
  // at a sensible size. Preloaded objects are left completely untouched.
  const scaleFactor = THREE.MathUtils.clamp(
    targetSize / maxDimension,
    0.001,
    1000
  );

  root.scale.multiplyScalar(scaleFactor);
  root.updateMatrixWorld(true);

  // Re-center after scaling so the camera can always target the actual model,
  // regardless of the GLB's original world-space origin/pivot.
  box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(root);
  const finalSize = box.getSize(new THREE.Vector3());
  const finalCenter = box.getCenter(new THREE.Vector3());
  const sphere = box.getBoundingSphere(new THREE.Sphere());

  return {
    box,
    size: finalSize,
    center: finalCenter,
    radius: Math.max(sphere.radius, finalSize.length() * 0.5, 0.5),
  };
}

function frameCameraToBounds(
  camera: THREE.PerspectiveCamera,
  bounds: { center: THREE.Vector3; radius: number },
  aspect: number,
  margin = 1.22
) {
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(
    Math.tan(verticalFov / 2) * Math.max(aspect, 0.1)
  );

  const verticalDistance =
    bounds.radius / Math.sin(Math.max(verticalFov / 2, 0.05));
  const horizontalDistance =
    bounds.radius / Math.sin(Math.max(horizontalFov / 2, 0.05));

  const distance =
    Math.max(verticalDistance, horizontalDistance) * margin;

  const near = Math.max(
    0.01,
    distance - bounds.radius * 3
  );

  const far = Math.max(
    50,
    distance + bounds.radius * 6
  );

  camera.near = near;
  camera.far = far;
  camera.updateProjectionMatrix();

  return {
    center: bounds.center.clone(),
    distance,
  };
}

function disposeMaterial(mat: THREE.Material) {
  mat.dispose();
  for (const key of Object.keys(mat)) {
    const val = (mat as any)[key];
    if (val && typeof val === 'object' && 'isTexture' in val && typeof val.dispose === 'function') {
      val.dispose();
    }
  }
}

function disposeObjectTree(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => disposeMaterial(m));
        } else {
          disposeMaterial(mesh.material);
        }
      }
    }
  });
}

const _scratchPos = new THREE.Vector3();
const _scratchRot = new THREE.Euler();

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
  theme = 'dark',
}) => {
  const explodeAmountRef = useRef(explodeAmount);
  explodeAmountRef.current = explodeAmount;

  const isPlayingMechanismRef = useRef(isPlayingMechanism);
  isPlayingMechanismRef.current = isPlayingMechanism;

  const showLeaderLinesRef = useRef(showLeaderLines);
  showLeaderLinesRef.current = showLeaderLines;

  const selectedComponentIdRef = useRef(selectedComponentId);
  selectedComponentIdRef.current = selectedComponentId;

  const isolatedComponentIdRef = useRef(isolatedComponentId);
  isolatedComponentIdRef.current = isolatedComponentId;

  const hiddenComponentIdsRef = useRef(hiddenComponentIds);
  hiddenComponentIdsRef.current = hiddenComponentIds;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const modelGenerationRef = useRef(0);
  const objectDataRef = useRef(objectData);
  objectDataRef.current = objectData;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Dynamic Theme Lighting Refs
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const blueRimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const cyanRimLightRef = useRef<THREE.DirectionalLight | null>(null);

  const activeRootGroupRef = useRef<THREE.Group | null>(null);
  const componentMapRef = useRef<Map<string, LoadedComponentMeshInfo>>(new Map());
  const progressiveSubpartsRef = useRef<Map<string, ProgressiveSubpartInfo>>(new Map());
  const uploadedMixerRef = useRef<THREE.AnimationMixer | null>(null);

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

  // Dynamic assembled vs exploded framing set
  const assembledFramingRef = useRef<CameraFramingResult | null>(null);
  const explodedFramingRef = useRef<CameraFramingResult | null>(null);

  // Master Kinematic Animation Clock (Freezes in place when isPlayingMechanism is false)
  const kinematicTimeRef = useRef<number>(0);

  // Flat cached interactive mesh list for allocation-free, high-performance raycasting
  const interactiveMeshesRef = useRef<THREE.Mesh[]>([]);

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

    const isLight = theme === 'light';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isLight ? 0xf1f4f8 : 0x020408);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    // PCFSoft at 2K is particularly expensive for the dense watch. Use a cheaper
    // filtered map; the visual difference is negligible at this viewer scale.
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.15 : 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Professional Studio CAD Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 0.90 : 0.45);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, isLight ? 2.2 : 2.5);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(isLight ? 0x94a3b8 : 0x1e293b, isLight ? 1.4 : 1.0);
    fillLight.position.set(-8, -4, -6);
    fillLightRef.current = fillLight;
    scene.add(fillLight);

    const blueRimLight = new THREE.DirectionalLight(isLight ? 0x2563eb : 0x3b82f6, isLight ? 1.35 : 1.8);
    blueRimLight.position.set(-4, 4, -8);
    blueRimLightRef.current = blueRimLight;
    scene.add(blueRimLight);

    const cyanRimLight = new THREE.DirectionalLight(isLight ? 0x0284c7 : 0x38bdf8, isLight ? 0.85 : 1.1);
    cyanRimLight.position.set(6, -2, -6);
    cyanRimLightRef.current = cyanRimLight;
    scene.add(cyanRimLight);

    // Floor Reference Grid
    const gridHelper = new THREE.GridHelper(18, 36, isLight ? 0x2563eb : 0x3b82f6, isLight ? 0xcbd5e1 : 0x1e293b);
    gridHelper.position.y = -2.8;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = isLight ? 0.35 : 0.22;
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

  // Dynamically respond to Light / Dark Mode toggles
  useEffect(() => {
    const isLight = theme === 'light';
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isLight ? 0xf1f4f8 : 0x020408);
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = isLight ? 0.90 : 0.45;
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = isLight ? 2.2 : 2.5;
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.setHex(isLight ? 0x94a3b8 : 0x1e293b);
      fillLightRef.current.intensity = isLight ? 1.4 : 1.0;
    }
    if (blueRimLightRef.current) {
      blueRimLightRef.current.color.setHex(isLight ? 0x2563eb : 0x3b82f6);
      blueRimLightRef.current.intensity = isLight ? 1.35 : 1.8;
    }
    if (cyanRimLightRef.current) {
      cyanRimLightRef.current.color.setHex(isLight ? 0x0284c7 : 0x38bdf8);
      cyanRimLightRef.current.intensity = isLight ? 0.85 : 1.1;
    }
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = isLight ? 1.15 : 1.35;
    }
  }, [theme]);

  // Load Real GLB / Composite Model when objectData changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let isMounted = true;
    const loadGeneration = ++modelGenerationRef.current;
    setIsLoading(true);
    setAnnotations([]);

    // Remove and dispose existing root group
    if (activeRootGroupRef.current) {
      scene.remove(activeRootGroupRef.current);
      disposeObjectTree(activeRootGroupRef.current);
      activeRootGroupRef.current = null;
    }
    if (uploadedMixerRef.current) {
      uploadedMixerRef.current.stopAllAction();
      uploadedMixerRef.current = null;
    }
    componentMapRef.current.clear();
    progressiveSubpartsRef.current.clear();
    activeHoverIdRef.current = null;

    const loadPromise = uploadedModel ? loadUploaded3DModel(uploadedModel.url, objectData, viewMode) : load3DModelForObject(objectData, viewMode);
    loadPromise.then((result) => {
      if (!isMounted || loadGeneration !== modelGenerationRef.current) {
        disposeObjectTree(result.rootGroup);
        return;
      }

      activeRootGroupRef.current = result.rootGroup;
      componentMapRef.current = result.componentMap;

      // Uploaded GLB/GLTF assets are not guaranteed to share a common unit system,
      // world-space origin, pivot, or overall scale. Normalize and center them before
      // calculating the explosion layout so the same viewer works for arbitrary assets.
      let uploadedPresentationBounds: ReturnType<typeof normalizeAndCenterUploadedModel> = null;

      if (uploadedModel) {
        uploadedPresentationBounds = normalizeAndCenterUploadedModel(
          result.rootGroup
        );

        applyUploadedExplodeLayout(
          result.componentMap,
          result.rootGroup
        );

        progressiveSubpartsRef.current =
          buildProgressiveSubparts(result.componentMap);

        if (result.animations && result.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(result.rootGroup);
          result.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
          uploadedMixerRef.current = mixer;
        }
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

      // Uploaded GLB/GLTF assets are framed from their real world-space bounds.
      // Preloaded objects keep their existing curated camera behavior unchanged.
      const camera = cameraRef.current;
      const container = containerRef.current;

      if (uploadedModel && camera && container && uploadedPresentationBounds) {
        const aspect =
          container.clientWidth / Math.max(container.clientHeight, 1);

        const framed = frameCameraToBounds(
          camera,
          {
            center: uploadedPresentationBounds.center,
            radius: uploadedPresentationBounds.radius,
          },
          aspect,
          1.28
        );

        targetCameraDistanceRef.current = framed.distance;
        cameraRotationRef.current.spherical.radius = framed.distance;
        cameraRotationRef.current.spherical.theta = Math.PI / 4;
        cameraRotationRef.current.spherical.phi = Math.PI / 2.6;
        cameraRotationRef.current.target.copy(framed.center);
        updateCameraPosition();
      } else {
        // Dynamic framing: Calculate assembled AND exploded framing sets
        if (camera) {
          const framingSet = computeModelFramingSet(camera, result);
          if (objectData.id === 'car-engine') {
            framingSet.assembledFraming.distance = Math.max(framingSet.assembledFraming.distance * 1.35, 8.8);
            framingSet.explodedFraming.distance = Math.max(framingSet.explodedFraming.distance * 1.25, 11.5);
          }
          assembledFramingRef.current = framingSet.assembledFraming;
          explodedFramingRef.current = framingSet.explodedFraming;

          const initialDist = THREE.MathUtils.lerp(
            framingSet.assembledFraming.distance,
            framingSet.explodedFraming.distance,
            explodeAmount
          );
          targetCameraDistanceRef.current = initialDist;
          cameraRotationRef.current.spherical.radius = initialDist;
          cameraRotationRef.current.target.copy(framingSet.assembledFraming.center);
        } else {
          const fallbackDistance = Math.max(result.cameraDistance * 1.24, result.maxDimension * 1.7);
          targetCameraDistanceRef.current = fallbackDistance;
          cameraRotationRef.current.spherical.radius = fallbackDistance;
          cameraRotationRef.current.target.set(0, 0, 0);
        }

        if (objectData.id === 'smartphone') {
          cameraRotationRef.current.spherical.theta = Math.PI / 2;
          cameraRotationRef.current.spherical.phi = Math.PI / 2.08;
        } else if (objectData.id === 'car-engine') {
          cameraRotationRef.current.spherical.theta = -Math.PI / 4;
          cameraRotationRef.current.spherical.phi = Math.PI / 2.8;
        } else {
          cameraRotationRef.current.spherical.theta = Math.PI / 4;
          cameraRotationRef.current.spherical.phi = Math.PI / 2.6;
        }
        updateCameraPosition();
      }

      // Pre-cache flat interactive mesh array for instant, allocation-free raycasting
      const interactiveList: THREE.Mesh[] = [];
      result.componentMap.forEach((info) => {
        if (info.sourceMeshes && info.sourceMeshes.length > 0) {
          interactiveList.push(...info.sourceMeshes);
        } else {
          info.mesh.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) interactiveList.push(child as THREE.Mesh);
          });
        }
      });
      interactiveMeshesRef.current = interactiveList;

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      if (activeRootGroupRef.current && sceneRef.current) {
        sceneRef.current.remove(activeRootGroupRef.current);
        disposeObjectTree(activeRootGroupRef.current);
        activeRootGroupRef.current = null;
      }
    };
  }, [objectData.id, uploadedModel?.url, updateCameraPosition]);

  // Dynamically update camera framing distance and target center as explodeAmount changes
  useEffect(() => {
    if (assembledFramingRef.current && explodedFramingRef.current) {
      const t = Math.max(0, Math.min(1, explodeAmount));
      const eased = t * t * (3 - 2 * t);
      const targetDist = THREE.MathUtils.lerp(
        assembledFramingRef.current.distance,
        explodedFramingRef.current.distance,
        eased
      );
      targetCameraDistanceRef.current = targetDist;
      cameraRotationRef.current.target.lerpVectors(
        assembledFramingRef.current.center,
        explodedFramingRef.current.center,
        eased
      );
      updateCameraPosition();
    }
  }, [explodeAmount, updateCameraPosition]);

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
                stdMat.emissive.set('#38bdf8');
                stdMat.emissiveIntensity = 0.14;
              } else if (isHovered) {
                stdMat.emissive.set('#38bdf8');
                stdMat.emissiveIntensity = 0.07;
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
      // 144Hz-friendly: natural rAF pacing using delta without arbitrary FPS throttling
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Master kinematic timer advances only when mechanism is actively playing
      if (isPlayingMechanismRef.current) {
        kinematicTimeRef.current += delta;
      }
      const kTime = kinematicTimeRef.current;
      const currentModelId = objectDataRef.current?.id || '';
      const isSmartphone = currentModelId === 'smartphone';
      const isWatch = currentModelId === 'wristwatch';
      const explode = explodeAmountRef.current;

      const spherical = cameraRotationRef.current.spherical;
      spherical.radius += (targetCameraDistanceRef.current - spherical.radius) * 0.12;
      updateCameraPosition();

      componentMapRef.current.forEach((info, id) => {
        const isSupplemental = Boolean(info.mesh.userData?.supplemental);
        const hiddenByUser = hiddenComponentIdsRef.current.has(id);
        const isolatedOut = isolatedComponentIdRef.current ? isolatedComponentIdRef.current !== id : false;
        if (isSupplemental && explode < info.explodeStart) {
          info.mesh.visible = false;
        } else if (!hiddenByUser && !isolatedOut) {
          info.mesh.visible = true;
        }

        const range = Math.max(0.001, info.explodeEnd - info.explodeStart);
        const localProgress = Math.max(
          0,
          Math.min(1, (explode - info.explodeStart) / range)
        );
        const easedProgress = smoothStep(localProgress);

        const meshesToAnimate = (info.sourceMeshes && info.sourceMeshes.length > 0) ? info.sourceMeshes : [info.mesh];
        meshesToAnimate.forEach((m) => {
          const baseP = (m.userData?.basePosition as THREE.Vector3) || info.basePosition;
          const baseR = (m.userData?.baseRotation as THREE.Euler) || info.baseRotation;
          const baseS = (m.userData?.baseScale as THREE.Vector3) || info.baseScale;

          _scratchPos.copy(baseP).addScaledVector(info.explodeVector, easedProgress);
          _scratchRot.copy(baseR);
          _scratchRot.x += (info.explodedRotation.x - baseR.x) * easedProgress;
          _scratchRot.y += (info.explodedRotation.y - baseR.y) * easedProgress;
          _scratchRot.z += (info.explodedRotation.z - baseR.z) * easedProgress;

          m.position.copy(_scratchPos);
          m.rotation.copy(_scratchRot);
          m.scale.copy(baseS);
        });

        // Mechanism motion is layered on top of the stable exploded pose.
        // Using kTime ensures that clicking ANIMATE OFF freezes micro-mechanics instantly in place.
        if (isPlayingMechanismRef.current) {
          if (isWatch) {
            if (id.includes('balance-wheel') || id === 'watch-balance-wheel') {
              info.mesh.rotation.z += Math.sin(kTime * 16.0) * 0.45;
            } else if (id.includes('hairspring') || id === 'watch-hairspring') {
              info.mesh.rotation.z += Math.sin(kTime * 16.0) * 0.40;
            } else if (id.includes('pallet-fork') || id.includes('escapement')) {
              info.mesh.rotation.z += Math.sign(Math.sin(kTime * 16.0)) * 0.08;
            } else if (id.includes('escape-wheel')) {
              info.mesh.rotation.z += kTime * 1.8;
            } else if (id.includes('fourth-wheel') || id.includes('seconds')) {
              info.mesh.rotation.z += kTime * 0.6;
            } else if (id.includes('third-wheel')) {
              info.mesh.rotation.z -= kTime * 0.15;
            } else if (id.includes('center-wheel')) {
              info.mesh.rotation.z += kTime * 0.04;
            }
          }

          if (currentModelId === 'car-engine') {
            if (
              id === 'turbo-chra-core' ||
              id === 'turbo-compressor-inlet' ||
              id === 'turbo-exhaust-outlet' ||
              id.includes('chra') ||
              id.includes('compressor-inlet') ||
              id.includes('exhaust-outlet')
            ) {
              // High-speed rotordynamic rotation of turbine shaft, Inconel turbine wheel, and billet compressor impeller around Z axis
              meshesToAnimate.forEach((m) => {
                m.rotation.z += kTime * 14.0;
              });
            } else if (id === 'turbo-wastegate-linkage' || id.includes('linkage')) {
              // Subtle pneumatic wastegate flapper bellcrank oscillation
              meshesToAnimate.forEach((m) => {
                m.rotation.z += Math.sin(kTime * 3.5) * 0.04;
              });
            }
          } else if (currentModelId === 'electric-motor') {
            if (
              id === 'rotor-assembly' ||
              id === 'neodymium-magnets' ||
              id === 'motor-shaft' ||
              id === 'retaining-clip' ||
              id.includes('rotor') ||
              id.includes('magnets') ||
              id.includes('shaft') ||
              id.includes('retaining-clip')
            ) {
              // High-speed electromagnetic rotation of outer rotor bell, magnets, drive shaft, and retention clip around Y axis
              meshesToAnimate.forEach((m) => {
                m.rotation.y += kTime * 8.0;
              });
            }
          } else if (currentModelId === 'ballpoint-pen') {
            if (id.includes('spring') || id === 'supplemental-return-spring') {
              const compression = 1.0 + Math.sin(kTime * 5.0) * 0.04 * (1 - localProgress);
              info.mesh.scale.set(
                info.baseScale.x * compression,
                info.baseScale.y,
                info.baseScale.z
              );
            } else if (id.includes('cam') || id === 'supplemental-click-cam') {
              info.mesh.position.x += Math.sin(kTime * 2.5) * 0.02 * (1 - localProgress);
              info.mesh.rotation.x += kTime * 1.2;
            } else if (id.includes('clip-actuator') || id === 'pen-clip-actuator' || id === 'pen_1') {
              info.mesh.position.y += Math.sin(kTime * 2.5) * 0.015 * (1 - localProgress);
            }
          } else if (currentModelId === 'mechanical-keyboard') {
            if (id === 'pbt-keycap' || id === 'switch-stem') {
              info.mesh.position.y += Math.sin(kTime * 3.5) * 0.04 * (1 - localProgress);
            }
          }
        }
      });

      // Stage 2: split substantial real meshes inside semantic groups.
      progressiveSubpartsRef.current.forEach((subpart) => {
        const parent = componentMapRef.current.get(subpart.parentId);
        const parentVisible = Boolean(parent?.mesh.visible);
        const range = Math.max(0.001, subpart.explodeEnd - subpart.explodeStart);
        const localProgress = Math.max(
          0,
          Math.min(1, (explode - subpart.explodeStart) / range)
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

      if (uploadedMixerRef.current && isPlayingMechanismRef.current) {
        uploadedMixerRef.current.update(delta);
      }

      // Annotations powered by universal solver
      if (
        showLeaderLinesRef.current &&
        cameraRef.current &&
        containerRef.current &&
        componentMapRef.current.size > 0 &&
        elapsed - lastAnnotationUpdate > (isWatch ? 0.045 : 0.032)
      ) {
        lastAnnotationUpdate = elapsed;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const items: AnnotationItem[] = [];

        if (isSmartphone && activeRootGroupRef.current) {
          const root = activeRootGroupRef.current;
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const cameraLocal = root.worldToLocal(cameraRef.current.position.clone());
          const viewingFront = cameraLocal.z >= 0;

          const visibleRefs = iphone14ProReferenceAnnotations.filter((ref) => {
            if (ref.side === 'edge') return true;
            return ref.side === (viewingFront ? 'front' : 'back');
          });

          const maxVisible = explode < 0.20 ? 4 : explode < 0.55 ? 8 : visibleRefs.length;
          for (const ref of visibleRefs.slice(0, maxVisible)) {
            const local = new THREE.Vector3(
              center.x + (ref.anchor[0] * 0.5) * size.x,
              center.y + (ref.anchor[1] * 0.5) * size.y,
              center.z + (ref.anchor[2] * 0.5) * size.z,
            );
            items.push({
              id: ref.nodeId,
              name: ref.label,
              category: ref.category,
              worldPosition: root.localToWorld(local.clone()),
              isVirtual: true,
              side: ref.side,
              modelId: 'smartphone',
            });
          }
        } else {
          const selectedId = selectedComponentIdRef.current;
          const entries = Array.from(componentMapRef.current.entries());
          const targets = entries.filter(([id, info]) => {
            if (!info.mesh.visible) return false;
            if (selectedId && id === selectedId) return true;
            const threshold = uploadedModel ? 0.0 : (info.revealThreshold ?? (
              info.assemblyDepth !== undefined
                ? (info.assemblyDepth <= 0 ? 0.0 : info.assemblyDepth === 1 ? 0.25 : info.assemblyDepth === 2 ? 0.45 : 0.65)
                : 0.0
            ));
            return explode >= threshold;
          });

          for (const [id, info] of targets) {
            if (!info.mesh.visible) continue;
            info.mesh.updateWorldMatrix(true, true);
            const geometryBox = new THREE.Box3().setFromObject(info.mesh);
            if (geometryBox.isEmpty()) continue;

            const componentCenter = geometryBox.getCenter(new THREE.Vector3());
            let anchorWorld: THREE.Vector3;

            if (isWatch) {
              const sphere = geometryBox.getBoundingSphere(new THREE.Sphere());
              const towardCamera = cameraRef.current.position.clone().sub(sphere.center);
              if (towardCamera.lengthSq() > 1e-8) {
                anchorWorld = sphere.center.clone().addScaledVector(towardCamera.normalize(), sphere.radius * 0.72);
              } else {
                anchorWorld = componentCenter.clone();
              }
            } else {
              anchorWorld = componentCenter.clone();
            }

            items.push({
              id,
              name: info.displayName,
              category: info.category,
              worldPosition: anchorWorld,
              modelId: currentModelId,
              isSelected: selectedComponentIdRef.current === id,
            });
          }
        }

        const solved = solveAnnotationLayout(
          items,
          cameraRef.current,
          { width, height },
          {
            activeModelId: currentModelId,
            cardWidth: 210,
            cardHeight: 46,
            verticalGap: 10,
            topMargin: 76,
            bottomMargin: 144,
            leftMargin: 24,
            rightMargin: 24,
          }
        );

        setAnnotations(
          solved.map((s) => ({
            nodeId: s.nodeId,
            name: s.name,
            category: s.category,
            modelId: s.modelId,
            isLeft: s.isLeft,
            visible: s.visible,
            isVirtual: s.isVirtual,
            side: s.side,
            anchorX: s.anchorX,
            anchorY: s.anchorY,
            labelX: s.labelX,
            labelY: s.labelY,
            cardWidth: s.cardWidth,
            cardHeight: s.cardHeight,
            cardAttachX: s.cardAttachX,
            cardCenterY: s.cardCenterY,
            elbowX: s.elbowX,
            elbowY: s.elbowY,
            pathD: s.pathD,
          }))
        );
      } else if (!showLeaderLinesRef.current && annotations.length > 0) {
        setAnnotations([]);
      }

      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateCameraPosition]);

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
              (targetMat as THREE.MeshStandardMaterial).emissive.set('#38bdf8');
              (targetMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.07;
            }
          }
        });
      }
    }

    // Instant notification to CustomCursor (0 ms delay)
    const current = targetId ? componentMapRef.current.get(targetId) : null;
    window.dispatchEvent(
      new CustomEvent('component-hover', {
        detail: current ? { name: current.displayName, category: current.category } : null,
      })
    );

    // Responsive, lightly throttled notification to React state
    if (hoverThrottleTimerRef.current) {
      window.clearTimeout(hoverThrottleTimerRef.current);
    }
    hoverThrottleTimerRef.current = window.setTimeout(() => {
      if (lastReportedHoverIdRef.current !== targetId) {
        lastReportedHoverIdRef.current = targetId;
        onHoverComponent(targetId);
      }
    }, 20);
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

    // Instant raycast hover detection against pre-cached interactive meshes
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

    const targets = interactiveMeshesRef.current.length > 0 ? interactiveMeshesRef.current : root.children;
    const intersects = raycaster.intersectObjects(targets, true);
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
      className="relative w-full h-full select-none overflow-hidden cursor-grab active:cursor-grabbing touch-none bg-[#020408]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {objectData.id === 'smartphone' && !isLoading && (
        <div className="absolute top-2 left-6 z-20 pointer-events-none">
          <div className={`px-2.5 py-1 rounded-lg border backdrop-blur-md shadow-sm flex items-center gap-2 ${
            theme === 'light'
              ? 'border-blue-200 bg-white/90 text-slate-800'
              : 'border-[#38bdf8]/20 bg-[#080f1d]/85 text-white'
          }`}>
            <span className={`text-[9px] font-mono-cad uppercase tracking-[0.15em] font-bold ${
              theme === 'light' ? 'text-[#0284c7]' : 'text-[#38bdf8]'
            }`}>TECHNICAL MAP //</span>
            <span className={`text-[9px] font-mono-cad ${
              theme === 'light' ? 'text-slate-600' : 'text-white/50'
            }`}>Reference Callouts (Exterior CAD Asset)</span>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-md font-mono text-xs ${
          theme === 'light' ? 'bg-[#f8fafc]/90 text-slate-800' : 'bg-[#020408]/85 text-white'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center animate-spin mb-3 ${
            theme === 'light' ? 'bg-blue-50 border border-blue-200 text-[#0284c7]' : 'bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#38bdf8]'
          }`}>
            <Box className="w-5 h-5" />
          </div>
          <span className={`font-bold tracking-widest uppercase animate-pulse ${
            theme === 'light' ? 'text-[#0284c7]' : 'text-[#38bdf8]'
          }`}>
            CALIBRATING 3D ASSET...
          </span>
          <span className={`text-[10px] mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-white/40'}`}>Framing CAD geometry & PBR materials</span>
        </div>
      )}

      {/* Engineering-style leader lines and cards strictly confined to 3D safe zone */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {showLeaderLines && !isLoading && (
          <svg className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
            {annotations.map((ann) => {
              if (!ann.visible || !ann.pathD) return null;
              const active = selectedComponentId === ann.nodeId;
              return (
                <g key={`line-${ann.nodeId}`}>
                  <path
                    d={ann.pathD}
                    fill="none"
                    stroke={active ? (theme === 'light' ? '#0284c7' : '#38bdf8') : (theme === 'light' ? '#2563eb' : '#3b82f6')}
                    strokeOpacity={active ? 1 : 0.65}
                    strokeWidth={active ? 2 : 1.2}
                    strokeDasharray={active ? undefined : '3 3'}
                  />
                  <circle
                    cx={ann.anchorX}
                    cy={ann.anchorY}
                    r={active ? 4.5 : 3}
                    fill={active ? (theme === 'light' ? '#0284c7' : '#38bdf8') : (theme === 'light' ? '#2563eb' : '#3b82f6')}
                  />
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

            return (
              <div
                key={ann.nodeId}
                style={{
                  left: `${ann.labelX}px`,
                  top: `${ann.labelY}px`,
                  width: `${ann.cardWidth}px`,
                  transform: 'translate(0, -50%)',
                }}
                className="absolute pointer-events-none"
              >
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectComponent(isSelected ? null : ann.nodeId);
                  }}
                  className={`three-label pointer-events-auto cursor-pointer w-full px-3 py-2 text-xs font-mono-cad border transition-all ${
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
                    <div className="min-w-0 flex-1">
                      <div className="three-label-name font-semibold tracking-wide leading-tight truncate">{ann.name}</div>
                      <div className="three-label-meta mt-1 text-[9px] uppercase tracking-[0.12em] flex items-center gap-1.5 truncate">
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

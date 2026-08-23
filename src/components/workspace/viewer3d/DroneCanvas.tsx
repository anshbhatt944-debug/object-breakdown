import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ObjectBreakdownData, ViewMode3D } from '../../../types/objectData';
import { load3DModelForObject, applyViewModeToModel, LoadedComponentMeshInfo } from './DroneModelLoader';
import { Box, Sparkles } from 'lucide-react';
import { iphone14ProReferenceAnnotations } from '../../../data/smartphoneReference';

interface DroneCanvasProps {
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

export const DroneCanvas: React.FC<DroneCanvasProps> = ({
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const activeRootGroupRef = useRef<THREE.Group | null>(null);
  const componentMapRef = useRef<Map<string, LoadedComponentMeshInfo>>(new Map());
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const explodedAnimationRef = useRef<THREE.AnimationClip | null>(null);
  const explodedAnimationPeakTimeRef = useRef<number | null>(null);
  const propellerMixerRef = useRef<THREE.AnimationMixer | null>(null);
  // Cache the last authored exploded pose. Re-scrubbing a skinned animation and
  // forcing the full hierarchy to update every render frame is the main source
  // of orbit stutter on this GLB.
  const lastDroneExplodeRef = useRef<number>(-1);

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
  // The animated drone is also a dense asset. Keep its performance policy isolated
  // to DroneCanvas so the OG viewer and every non-drone object remain untouched.
  const isDroneRef = useRef(false);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    // DroneCanvas renders only the isolated drone path. Disable the costly shadow
    // map pass here; the multi-light rig still provides depth without affecting the
    // original shared viewer used by every other object.
    renderer.shadowMap.enabled = false;
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
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, (isWatchRef.current || isDroneRef.current) ? 1.25 : 1.5));
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
    animationMixerRef.current = null;
    explodedAnimationRef.current = null;
    explodedAnimationPeakTimeRef.current = null;
    propellerMixerRef.current = null;
    lastDroneExplodeRef.current = -1;
    activeHoverIdRef.current = null;

    load3DModelForObject(objectData, viewMode).then((result) => {
      if (!isMounted) return;

      activeRootGroupRef.current = result.rootGroup;
      componentMapRef.current = result.componentMap;
      animationMixerRef.current = result.animationMixer || null;
      explodedAnimationRef.current = result.explodedAnimation || null;
      explodedAnimationPeakTimeRef.current = result.explodedAnimationPeakTime || null;
      propellerMixerRef.current = result.propellerMixer || null;
      isWatchRef.current = objectData.id === 'wristwatch';
      isDroneRef.current = objectData.id === 'drone';

      // The watch has a high triangle count and dozens of independently moving
      // parts. Its self-shadow pass costs more than the main render pass while
      // exploded, so keep the studio lighting but disable per-part shadow maps.
      if (isWatchRef.current || isDroneRef.current) {
        result.rootGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });
        rendererRef.current?.setPixelRatio(Math.min(window.devicePixelRatio, 1.15));
      } else {
        rendererRef.current?.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }

      scene.add(result.rootGroup);

      // Apply initial view mode
      applyViewModeToModel(result.componentMap, viewMode);

      // The drone is an inspection object, but its previous presentation distance
      // was too aggressive and opened on a cropped close-up. Pull back enough to
      // show the whole assembled airframe, while keeping it substantially larger
      // than a thumbnail.
      const presentationDistance = objectData.id === 'drone'
        ? Math.max(15.5, result.cameraDistance * 1.5, result.maxDimension * 1.18)
        : Math.max(result.cameraDistance * 1.24, result.maxDimension * 1.7);
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
  }, [objectData.id, updateCameraPosition]);

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
      const renderMeshes: THREE.Mesh[] = info.sourceMeshes || (() => {
        const meshes: THREE.Mesh[] = [];
        info.mesh.traverse((child) => { if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh); });
        return meshes;
      })();

      if (info.sourceMeshes) {
        renderMeshes.forEach((mesh) => { mesh.visible = !isHidden && isIsolated; });
      } else {
        info.mesh.visible = !isHidden && isIsolated;
      }

      renderMeshes.forEach((mesh) => {
        if (!mesh.material) return;
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
      const isDrone = isDroneRef.current;
      const isHeavyAsset = isWatch || isDrone;

      // Do not artificially cap the isolated drone viewer. On a 144 Hz display
      // the old 45 FPS gate made camera motion feel inherently sluggish even
      // when the GPU had headroom. Expensive work below is cached instead.
      lastWatchRender = elapsed;

      const spherical = cameraRotationRef.current.spherical;
      spherical.radius += (targetCameraDistanceRef.current - spherical.radius) * 0.12;
      updateCameraPosition();

      // The drone GLB carries its own authored skeleton animation. The source clip
      // explodes and then reassembles later in the timeline, so scrub only the
      // assemble → fully-exploded segment. This makes 0% assembled and 100% stay
      // fully exploded, with a stable gradual transition throughout the slider.
      if (objectData.id === 'drone' && animationMixerRef.current && explodedAnimationRef.current) {
        const peakTime = Math.max(
          0.001,
          Math.min(
            explodedAnimationPeakTimeRef.current ?? 2.0,
            explodedAnimationRef.current.duration,
          ),
        );
        const clampedExplode = Math.max(0, Math.min(1, explodeAmount));

        // Only evaluate the expensive skinned explode clip when the slider pose
        // actually changes. Camera orbiting no longer recomputes 77 skinned
        // meshes + bones every frame.
        if (Math.abs(clampedExplode - lastDroneExplodeRef.current) > 0.0001) {
          animationMixerRef.current.setTime(clampedExplode * peakTime);
          activeRootGroupRef.current?.updateMatrixWorld(true);
          lastDroneExplodeRef.current = clampedExplode;
        }

        // Propeller rotation is intentionally kept independent from the explode
        // pose. This is the only per-frame animation work when the slider rests.
        propellerMixerRef.current?.update(delta);
      }

      componentMapRef.current.forEach((info, id) => {
        const isSupplemental = Boolean(info.mesh.userData?.supplemental);
        const hiddenByUser = hiddenComponentIds.has(id);
        const isolatedOut = isolatedComponentId ? isolatedComponentId !== id : false;
        const renderMeshes: THREE.Mesh[] = info.sourceMeshes || (() => {
          const meshes: THREE.Mesh[] = [];
          info.mesh.traverse((child) => { if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh); });
          return meshes;
        })();
        if (info.sourceMeshes) {
          renderMeshes.forEach((mesh) => { mesh.visible = !hiddenByUser && !isolatedOut; });
        } else if (isSupplemental && explodeAmount < info.explodeStart) {
          info.mesh.visible = false;
        } else if (!hiddenByUser && !isolatedOut) {
          info.mesh.visible = true;
        }

        if (info.nativeAnimated) return;

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

      // DOM annotations are expensive to update at 60 FPS and can cause the cursor
      // to move between a canvas hit and a label. Update them at a modest rate.
      if (
        showLeaderLines &&
        cameraRef.current &&
        containerRef.current &&
        componentMapRef.current.size > 0 &&
        elapsed - lastAnnotationUpdate > (isHeavyAsset ? (isDrone ? 0.20 : 0.18) : 0.08)
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
            : objectData.id === 'drone'
              // Keep the drone informative without rebuilding all label DOM every pass.
              ? entries.filter(([, info]) => info.sourceMeshes?.some((mesh) => mesh.visible) || info.mesh.visible).slice(0, explodeAmount >= 0.52 ? 15 : 10)
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
            const renderMeshes: THREE.Mesh[] = info.sourceMeshes || [];
            const isVisible = info.sourceMeshes
              ? renderMeshes.some((mesh) => mesh.visible)
              : info.mesh.visible;
            if (!isVisible) return [];

            // Dense/skinned assets are annotation-heavy. For the drone and watch,
            // derive a camera-facing anchor from transformed geometry bounding spheres
            // instead of Box3.setFromObject + triangle raycasts. This avoids repeatedly
            // traversing/skinning the GLB just to place DOM labels.
            info.mesh.updateWorldMatrix(true, true);
            let componentCenter = new THREE.Vector3();
            let componentRadius = 0;

            if (isHeavyAsset && info.sourceMeshes?.length) {
              let count = 0;
              info.sourceMeshes.forEach((mesh) => {
                if (!mesh.visible || !mesh.geometry) return;
                if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
                const sphere = mesh.geometry.boundingSphere;
                if (!sphere) return;
                const worldCenter = sphere.center.clone().applyMatrix4(mesh.matrixWorld);
                const worldScale = Math.max(
                  mesh.matrixWorld.getMaxScaleOnAxis(),
                  0.0001,
                );
                componentCenter.add(worldCenter);
                componentRadius = Math.max(componentRadius, sphere.radius * worldScale);
                count += 1;
              });
              if (!count) return [];
              componentCenter.multiplyScalar(1 / count);
              componentRadius = Math.max(componentRadius, 0.03);
            } else {
              const geometryBox = new THREE.Box3().setFromObject(info.mesh);
              if (geometryBox.isEmpty()) return [];
              componentCenter = geometryBox.getCenter(new THREE.Vector3());
              componentRadius = geometryBox.getSize(new THREE.Vector3()).length() * 0.28;
            }

            let anchorWorld: THREE.Vector3;
            if (isHeavyAsset) {
              const towardCamera = cameraRef.current!.position.clone().sub(componentCenter);
              if (towardCamera.lengthSq() < 1e-8) return [];
              towardCamera.normalize();
              anchorWorld = componentCenter.clone().addScaledVector(towardCamera, componentRadius * 0.72);
            } else {
              const rayDirection = componentCenter.clone().sub(cameraRef.current!.position);
              if (rayDirection.lengthSq() < 1e-8) return [];
              rayDirection.normalize();
              const anchorRaycaster = annotationRaycasterRef.current;
              anchorRaycaster.set(cameraRef.current!.position, rayDirection);
              anchorRaycaster.near = 0.01;
              anchorRaycaster.far = cameraRef.current!.position.distanceTo(componentCenter) + componentRadius * 4;
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
        const meshes = prev.sourceMeshes || (() => { const out: THREE.Mesh[] = []; prev.mesh.traverse((c) => { if ((c as THREE.Mesh).isMesh) out.push(c as THREE.Mesh); }); return out; })();
        meshes.forEach((mesh) => {
          const mat = mesh.material;
          const targetMat = Array.isArray(mat) ? mat[0] : mat;
          if ((targetMat as THREE.MeshStandardMaterial)?.emissive) {
            (targetMat as THREE.MeshStandardMaterial).emissive.set('#000000');
            (targetMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
          }
        });
      }
    }

    // Set new hover
    activeHoverIdRef.current = targetId;
    if (targetId && selectedComponentId !== targetId) {
      const current = componentMapRef.current.get(targetId);
      if (current) {
        const meshes = current.sourceMeshes || (() => { const out: THREE.Mesh[] = []; current.mesh.traverse((c) => { if ((c as THREE.Mesh).isMesh) out.push(c as THREE.Mesh); }); return out; })();
        meshes.forEach((mesh) => {
          const mat = mesh.material;
          const targetMat = Array.isArray(mat) ? mat[0] : mat;
          if ((targetMat as THREE.MeshStandardMaterial)?.emissive) {
            (targetMat as THREE.MeshStandardMaterial).emissive.set('#0ea5e9');
            (targetMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.35;
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
        const componentId = hitMesh.userData?.componentId || (componentMapRef.current.has(hitMesh.name) ? hitMesh.name : null);
        if (componentId && componentMapRef.current.has(componentId)) {
          setMeshHoverState(componentId);
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
        const componentId = hitMesh.userData?.componentId || (componentMapRef.current.has(hitMesh.name) ? hitMesh.name : null);
        if (componentId && componentMapRef.current.has(componentId)) {
          onSelectComponent(componentId === selectedComponentId ? null : componentId);
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

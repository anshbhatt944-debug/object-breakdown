import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ObjectBreakdownData, ViewMode3D } from '../../../types/objectData';
import { load3DModelForObject, applyViewModeToModel, LoadedComponentMeshInfo } from './DroneModelLoader';
import { fitCameraToObject, computeModelFramingSet, CameraFramingResult } from './cameraUtils';
import { Box, Sparkles } from 'lucide-react';
import { solveAnnotationLayout, AnnotationItem } from '../../../utils/annotationSolver';

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
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.15 : 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Precision Studio CAD Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 0.90 : 0.45);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, isLight ? 2.2 : 2.5);
    keyLight.position.set(6, 12, 8);
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(isLight ? 0x94a3b8 : 0x1e293b, isLight ? 1.4 : 1.0);
    fillLight.position.set(-8, -4, -6);
    fillLightRef.current = fillLight;
    scene.add(fillLight);

    // Electric Blue & Cool Cyan Rim Lights
    const blueRimLight = new THREE.DirectionalLight(isLight ? 0x2563eb : 0x3b82f6, isLight ? 1.35 : 1.8);
    blueRimLight.position.set(-4, 4, -8);
    blueRimLightRef.current = blueRimLight;
    scene.add(blueRimLight);

    const cyanRimLight = new THREE.DirectionalLight(isLight ? 0x0284c7 : 0x38bdf8, isLight ? 0.85 : 1.1);
    cyanRimLight.position.set(6, -2, -6);
    cyanRimLightRef.current = cyanRimLight;
    scene.add(cyanRimLight);

    // Subtle CAD Floor Grid
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
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, (isWatchRef.current || isDroneRef.current) ? 1.25 : 1.5));
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
    componentMapRef.current.clear();
    animationMixerRef.current = null;
    explodedAnimationRef.current = null;
    explodedAnimationPeakTimeRef.current = null;
    propellerMixerRef.current = null;
    lastDroneExplodeRef.current = -1;
    activeHoverIdRef.current = null;

    load3DModelForObject(objectData, viewMode).then((result) => {
      if (!isMounted || loadGeneration !== modelGenerationRef.current) {
        disposeObjectTree(result.rootGroup);
        return;
      }

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

      // Dynamic framing: Calculate assembled AND exploded framing sets
      if (cameraRef.current) {
        const framingSet = computeModelFramingSet(cameraRef.current, result);
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
        const fallbackDist = objectData.id === 'drone' ? 17.5 : 8.5;
        targetCameraDistanceRef.current = fallbackDist;
        cameraRotationRef.current.spherical.radius = fallbackDist;
      }
      
      if (objectData.id === 'smartphone') {
        cameraRotationRef.current.spherical.theta = Math.PI / 2;
        cameraRotationRef.current.spherical.phi = Math.PI / 2.08;
      } else {
        cameraRotationRef.current.spherical.theta = Math.PI / 4;
        cameraRotationRef.current.spherical.phi = Math.PI / 2.6;
      }
      updateCameraPosition();

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
  }, [objectData.id, updateCameraPosition]);

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
      const isWatch = isWatchRef.current;
      const isDrone = isDroneRef.current;
      const explode = explodeAmountRef.current;

      // Master kinematic timer advances only when mechanism is actively playing
      if (isPlayingMechanismRef.current) {
        kinematicTimeRef.current += delta;
      }
      const kTime = kinematicTimeRef.current;

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
        const clampedExplode = Math.max(0, Math.min(1, explode));

        // Only evaluate the expensive skinned explode clip when the slider pose
        // actually changes. Camera orbiting no longer recomputes 77 skinned
        // meshes + bones every frame.
        if (Math.abs(clampedExplode - lastDroneExplodeRef.current) > 0.0001) {
          animationMixerRef.current.setTime(clampedExplode * peakTime);
          activeRootGroupRef.current?.updateMatrixWorld(true);
          lastDroneExplodeRef.current = clampedExplode;
        }

        // Propeller rotation is active ONLY when isPlayingMechanism is true
        if (isPlayingMechanismRef.current) {
          propellerMixerRef.current?.update(delta);
        }

        // Subtle aerodynamic idle float only when isPlayingMechanism is true
        if (activeRootGroupRef.current) {
          const hoverFloat = isPlayingMechanismRef.current ? Math.sin(kTime * 2.0) * 0.04 : 0;
          activeRootGroupRef.current.position.y = hoverFloat;
        }
      }

      componentMapRef.current.forEach((info, id) => {
        const isSupplemental = Boolean(info.mesh.userData?.supplemental);
        const hiddenByUser = hiddenComponentIdsRef.current.has(id);
        const isolatedOut = isolatedComponentIdRef.current ? isolatedComponentIdRef.current !== id : false;
        const renderMeshes: THREE.Mesh[] = info.sourceMeshes || (() => {
          const meshes: THREE.Mesh[] = [];
          info.mesh.traverse((child) => { if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh); });
          return meshes;
        })();
        if (info.sourceMeshes) {
          renderMeshes.forEach((mesh) => { mesh.visible = !hiddenByUser && !isolatedOut; });
        } else if (isSupplemental && explode < info.explodeStart) {
          info.mesh.visible = false;
        } else if (!hiddenByUser && !isolatedOut) {
          info.mesh.visible = true;
        }

        if (info.nativeAnimated) return;

        const range = Math.max(0.001, info.explodeEnd - info.explodeStart);
        const localProgress = Math.max(
          0,
          Math.min(1, (explode - info.explodeStart) / range)
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

        info.mesh.position.copy(targetPos);
        info.mesh.rotation.copy(targetRot);
        info.mesh.scale.copy(info.baseScale);

        if (isPlayingMechanismRef.current) {
          if (id.includes('ball') || id.includes('wheel') || id.includes('gear') || id.includes('rotor')) {
            info.mesh.rotation.y += kTime * 2.2;
          }

          if (id.includes('spring')) {
            const compression = 1.0 + Math.sin(kTime * 7) * 0.06 * localProgress;
            info.mesh.scale.set(
              info.baseScale.x,
              info.baseScale.y * compression,
              info.baseScale.z
            );
          }
        }
      });

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

        const selectedId = selectedComponentIdRef.current;
        const entries = Array.from(componentMapRef.current.entries());
        const targets = entries.filter(([id, info]) => {
          const isVisible = info.sourceMeshes?.some((m) => m.visible) || info.mesh.visible;
          if (!isVisible) return false;
          if (selectedId && id === selectedId) return true;
          const threshold = info.revealThreshold ?? (
            info.assemblyDepth !== undefined
              ? (info.assemblyDepth <= 0 ? 0.0 : info.assemblyDepth === 1 ? 0.25 : info.assemblyDepth === 2 ? 0.45 : 0.65)
              : 0.0
          );
          return explode >= threshold;
        });

        for (const [id, info] of targets) {
          const geometryBox = new THREE.Box3();
          if (info.sourceMeshes && info.sourceMeshes.length > 0) {
            for (const sm of info.sourceMeshes) {
              if (sm.visible) {
                sm.updateWorldMatrix(true, true);
                geometryBox.expandByObject(sm);
              }
            }
          } else {
            info.mesh.updateWorldMatrix(true, true);
            geometryBox.setFromObject(info.mesh);
          }
          if (geometryBox.isEmpty()) continue;

          const componentCenter = geometryBox.getCenter(new THREE.Vector3());
          items.push({
            id,
            name: info.displayName,
            category: info.category,
            worldPosition: componentCenter,
            modelId: 'drone',
            isSelected: selectedComponentIdRef.current === id,
          });
        }

        const solved = solveAnnotationLayout(
          items,
          cameraRef.current,
          { width, height },
          {
            activeModelId: 'drone',
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
            (targetMat as THREE.MeshStandardMaterial).emissive.set('#38bdf8');
            (targetMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.07;
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

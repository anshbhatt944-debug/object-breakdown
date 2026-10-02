import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import * as THREE from 'three';
import Lenis from 'lenis';
import { ObjectBreakdownData } from '../../types/objectData';
import { electricMotorData } from '../../data/objects/electricMotor';
import { jetTurbineData } from '../../data/objects/jetTurbine';
import { getObjectById } from '../../data/objectRegistry';
import {
  load3DModelForObject,
  LoadedObjectResult,
  LoadedComponentMeshInfo,
} from '../workspace/viewer3d/DroneModelLoader';
import { fitCameraToObject, computeModelFramingSet } from '../workspace/viewer3d/cameraUtils';
import {
  Upload,
  ArrowRight,
  Compass,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  Box,
  Pause,
  Play,
  Terminal,
  Flame,
  Zap,
} from 'lucide-react';

interface ImmersiveExperienceProps {
  objects: ObjectBreakdownData[];
  onSelectObject: (obj: ObjectBreakdownData) => void;
  onUploadModel: (file: File) => void;
  onSearchCustom?: (query: string) => void;
  theme?: 'light' | 'dark';
  onActiveObjectChange?: (obj: ObjectBreakdownData) => void;
}

export interface ProjectedAnnotation {
  id: string;
  label: string;
  category: string;
  description: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  isLeft?: boolean;
  isSouth?: boolean;
  isNorth?: boolean;
  elbowX: number;
  labelEdgeX: number;
  orderIndex?: number;
}

function computeAdaptiveAnnotationLayout(
  items: Array<{
    id: string;
    label: string;
    category: string;
    description: string;
    x: number;
    y: number;
  }>,
  viewportW: number,
  viewportH: number,
  editorialSide: 'left' | 'right' | 'hero' | 'none' = 'none'
): ProjectedAnnotation[] {
  if (!items.length) return [];

  const midX = viewportW * 0.5;
  const sorted = [...items].sort((a, b) => {
    const diff = a.y - b.y;
    if (Math.abs(diff) > 4.0) return diff;
    return a.id.localeCompare(b.id);
  });

  // Distribute items strictly away from the chapter's editorial text
  let leftItems: typeof items = [];
  let rightItems: typeof items = [];

  if (editorialSide === 'hero') {
    // Hero Panoramic Viewport with 3 Non-Obstructing Spatial Zones:
    // 1. Back / Aft (Left Flank): Exhaust Mixer (01) & HP Turbine Vanes (02) strictly in upper-left (well above "Deconstruct the invisible")
    // 2. North of Model (Top Area): Concentric Shaft (03), Bleed Manifolds (04), Compressor Casing (05), Kevlar Containment (06)
    // 3. South of Model (User's Marked Spot): Fan Module (07), Intake Cowling (08), Bypass Stator Grid (09), Thrust Reverser (10), FADEC (11)
    // Note: ZERO cards on the right flank to completely free the 3D model from any obstruction.
    const textBlockWidth = 240;
    const result: ProjectedAnnotation[] = [];

    // Group items deterministically by component ID
    const backItems = items.filter(it => it.id === 'exhaust-mixer-nozzle' || it.id === 'turbine-nozzle-guide-vanes');
    const northItems = items.filter(it => it.id === 'coaxial-drive-shaft' || it.id === 'bleed-air-manifolds' || it.id === 'compressor-casing' || it.id === 'fan-containment-casing' || it.id === 'tcc-cooling-ring');
    const frontItems = items.filter(it => it.id === 'fan-module' || it.id === 'inlet-cowl' || it.id === 'bypass-stator-grid' || it.id === 'thrust-reverser-actuators');

    let idx = 1;

    // 1. Back / Aft (Left Flank, strictly upper-left above "Deconstruct the invisible")
    const leftColX = Math.max(36, Math.min(midX - 380 - textBlockWidth, 64));
    const leftStartY = Math.max(125, Math.round(viewportH * 0.16));
    backItems.slice(0, 2).forEach((it, i) => {
      const labelY = leftStartY + i * 88;
      const labelEdgeX = leftColX + textBlockWidth;
      result.push({
        ...it,
        isLeft: true,
        isSouth: false,
        isNorth: false,
        labelX: leftColX,
        labelY,
        labelEdgeX,
        elbowX: labelEdgeX + 24,
        orderIndex: idx++,
      });
    });

    // 2. North of Model (Top area: single or staggered row across wide open top)
    const availableNorthLeft = leftColX + textBlockWidth + 28;
    const availableNorthRight = viewportW - 48;
    const availableNorthWidth = availableNorthRight - availableNorthLeft;
    const topY = Math.max(76, Math.min(Math.round(viewportH * 0.088), 88));

    const northCardsToPlace = northItems.slice(0, 4);
    if (northCardsToPlace.length > 0) {
      if (availableNorthWidth >= 1140 || northCardsToPlace.length <= 2) {
        // Wide screen: single horizontal row across the top
        const slotWidth = availableNorthWidth / northCardsToPlace.length;
        northCardsToPlace.forEach((it, i) => {
          const labelX = Math.round(availableNorthLeft + i * slotWidth + (slotWidth - textBlockWidth) * 0.5);
          const labelEdgeX = labelX + Math.round(textBlockWidth * 0.5);
          result.push({
            ...it,
            isLeft: false,
            isSouth: false,
            isNorth: true,
            labelX,
            labelY: topY,
            labelEdgeX,
            elbowX: labelEdgeX,
            orderIndex: idx++,
          });
        });
      } else {
        // Moderate screen: staggered 2-tier layout so bounding boxes never collide
        const halfCount = Math.ceil(northCardsToPlace.length / 2);
        const slotWidth = availableNorthWidth / halfCount;
        northCardsToPlace.forEach((it, i) => {
          const col = Math.floor(i / 2);
          const tier = i % 2;
          const tierY = tier === 0 ? topY : topY + 70;
          const labelX = Math.round(availableNorthLeft + col * slotWidth + (slotWidth - textBlockWidth) * 0.5);
          const labelEdgeX = labelX + Math.round(textBlockWidth * 0.5);
          result.push({
            ...it,
            isLeft: false,
            isSouth: false,
            isNorth: true,
            labelX,
            labelY: tierY,
            labelEdgeX,
            elbowX: labelEdgeX,
            orderIndex: idx++,
          });
        });
      }
    }

    // 3. South of Model (User's Marked Spot: below engine, right of "Deconstruct the invisible", above bottom bar)
    const headlineRight = Math.max(340, Math.min(viewportW * 0.36, 520));
    const southLeft = Math.round(headlineRight + 28);
    const southRight = Math.round(viewportW - 40);
    const availableSouthWidth = Math.max(southRight - southLeft, 600);

    const maxEngineY = items.length > 0 ? Math.max(...items.map(it => it.y)) : viewportH * 0.46;
    const southStartY = Math.max(Math.round(maxEngineY + 44), Math.round(viewportH * 0.54));

    // Sort front items from left to right along engine thrust axis
    const southCards = frontItems.slice(0, 4).sort((a, b) => a.x - b.x);
    if (southCards.length > 0) {
      const cardWidth = Math.min(240, Math.max(200, Math.floor((availableSouthWidth - 40) / 4.2)));
      const stepX = (availableSouthWidth - cardWidth) / 4;

      // Slot 0 (over the text where the crossed card was) is completely empty.
      // Remaining 4 cards stay in their exact slots 1, 2, 3, 4 (clear of all text).
      // Bypass Guide Vanes (slot 2) is moved downwards to southStartY + 74 so it does not obstruct the engine casing.
      southCards.forEach((it, i) => {
        const slotIdx = i + 1; // slots 1, 2, 3, 4 (keeps original X positions)
        const cardX = Math.round(southLeft + slotIdx * stepX);
        // Only inlet-cowl on the far right (slot 4) stays upper; slot 2 (bypass guide vanes) is moved downwards
        const isUpper = slotIdx === 4;
        const cardY = isUpper ? southStartY : southStartY + 74;
        const labelEdgeX = cardX + Math.round(cardWidth * 0.5);

        result.push({
          ...it,
          isLeft: false,
          isSouth: true,
          isNorth: false,
          labelX: cardX,
          labelY: cardY,
          labelEdgeX,
          elbowX: labelEdgeX,
          orderIndex: idx++,
        });
      });
    }

    return result;
  } else if (editorialSide === 'left') {
    // Editorial text is on the LEFT flank -> place ALL annotation cards cleanly on the RIGHT flank
    rightItems = [...sorted];
    leftItems = [];
  } else if (editorialSide === 'right') {
    // Editorial text is on the RIGHT flank -> place ALL annotation cards cleanly on the LEFT flank
    leftItems = [...sorted];
    rightItems = [];
  } else if (sorted.length <= 4) {
    // Fallback heuristic for small stages
    const isMotor = items.some((it) => it.id.includes('rotor') || it.id.includes('motor') || it.id.includes('stator'));
    if (isMotor) {
      leftItems = [...sorted];
      rightItems = [];
    } else {
      rightItems = [...sorted];
      leftItems = [];
    }
  } else {
    // Position-guided with strictly enforced flank balancing
    leftItems = sorted.filter((item) => item.x < midX);
    rightItems = sorted.filter((item) => item.x >= midX);

    const maxPerSide = Math.ceil(sorted.length / 2);
    if (leftItems.length > maxPerSide) {
      const excess = leftItems.slice().sort((a, b) => Math.abs(a.x - midX) - Math.abs(b.x - midX));
      const toMove = excess.slice(0, leftItems.length - maxPerSide);
      leftItems = leftItems.filter((it) => !toMove.includes(it));
      rightItems = [...rightItems, ...toMove].sort((a, b) => a.y - b.y);
    } else if (rightItems.length > maxPerSide) {
      const excess = rightItems.slice().sort((a, b) => Math.abs(a.x - midX) - Math.abs(b.x - midX));
      const toMove = excess.slice(0, rightItems.length - maxPerSide);
      rightItems = rightItems.filter((it) => !toMove.includes(it));
      leftItems = [...leftItems, ...toMove].sort((a, b) => a.y - b.y);
    }
  }

  const processSide = (list: typeof leftItems, isLeft: boolean, indexStart: number = 1): ProjectedAnnotation[] => {
    const textBlockWidth = 260;
    const minGap = list.length > 5 ? Math.max(60, Math.min(76, (viewportH * 0.74) / list.length)) : 76;

    const topLimit = Math.max(80, viewportH * 0.12);
    // Keep cards well above the bottom buttons (Pause motion / Launch studio)
    const bottomLimit = editorialSide === 'left'
      ? Math.min(viewportH - 220, viewportH * 0.68)
      : Math.min(viewportH - 120, viewportH * 0.85);

    // Fixed column X for architectural HUD alignment (never sits on top of 3D models)
    const colX = isLeft
      ? Math.max(36, Math.min(midX - 340 - textBlockWidth, 64))
      : Math.min(viewportW - textBlockWidth - 36, Math.max(midX + 360, viewportW - textBlockWidth - 64));

    const result: ProjectedAnnotation[] = list.map((item, idx) => {
      const labelX = colX;
      const labelEdgeX = isLeft ? labelX + textBlockWidth : labelX;
      const elbowX = isLeft ? labelEdgeX + 24 : labelEdgeX - 24;

      return {
        ...item,
        isLeft,
        labelX,
        labelY: item.y - 28,
        labelEdgeX,
        elbowX,
        orderIndex: indexStart + idx,
      };
    });

    for (let i = 1; i < result.length; i++) {
      if (result[i].labelY < result[i - 1].labelY + minGap) {
        result[i].labelY = result[i - 1].labelY + minGap;
      }
    }
    if (result.length && result[result.length - 1].labelY > bottomLimit) {
      result[result.length - 1].labelY = bottomLimit;
      for (let i = result.length - 2; i >= 0; i--) {
        if (result[i].labelY > result[i + 1].labelY - minGap) {
          result[i].labelY = result[i + 1].labelY - minGap;
        }
      }
    }
    if (result.length && result[0].labelY < topLimit) {
      const shift = topLimit - result[0].labelY;
      for (const r of result) {
        r.labelY += shift;
      }
    }

    return result;
  };

  const leftAnnotations = processSide(leftItems, true, 1);
  const rightAnnotations = processSide(rightItems, false, leftAnnotations.length + 1);
  return [...leftAnnotations, ...rightAnnotations];
}

const _themeTargetBgColor = new THREE.Color();
const _themeTargetFillColor = new THREE.Color();
const _themeTargetRimBlueColor = new THREE.Color();
const _themeTargetRimCyanColor = new THREE.Color();

export const ImmersiveExperience: React.FC<ImmersiveExperienceProps> = ({
  objects,
  onSelectObject,
  onUploadModel,
  onSearchCustom,
  theme = 'dark',
  onActiveObjectChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isLight = theme === 'light';

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-999, -999));
  const modelsMapRef = useRef<Map<string, LoadedObjectResult>>(new Map());

  // Reliable ID-based lookup for all specimen objects
  const getObject = useCallback(
    (id: string): ObjectBreakdownData => {
      return objects.find((o) => o.id === id) || getObjectById(id) || objects[0];
    },
    [objects]
  );

  const jetTurbineObj = getObject('jet-turbine');
  const watchObj = getObject('wristwatch');
  const droneObj = getObject('drone');
  const engineObj = getObject('car-engine');
  const motorObj = getObject('electric-motor');
  const penObj = getObject('ballpoint-pen');

  // Active Object & Model Tracking for State-Based Routing (Wristwatch, Drone, Engine, Motor, Pen)
  const activeObjectRef = useRef<ObjectBreakdownData | null>(jetTurbineObj);
  const activeModelRef = useRef<LoadedObjectResult | null>(null);
  const activeModelIdRef = useRef<string | null>('jet-turbine');
  const lastReportedObjIdRef = useRef<string | null>(null);

  const setActiveModelAndObject = (
    model: LoadedObjectResult | null,
    obj: ObjectBreakdownData | null,
    modelId: string | null
  ) => {
    activeModelRef.current = model;
    activeObjectRef.current = obj;
    activeModelIdRef.current = modelId;

    if (obj && obj.id !== lastReportedObjIdRef.current) {
      lastReportedObjIdRef.current = obj.id;
      onActiveObjectChange?.(obj);
    }
  };

  // Machine Plate Ground & Seam Refs (Section 3 & 7)
  const watchGroundRef = useRef<HTMLDivElement>(null);
  const watchSeamRef = useRef<HTMLDivElement>(null);
  const droneGroundRef = useRef<HTMLDivElement>(null);
  const droneSeamRef = useRef<HTMLDivElement>(null);
  const turboGroundRef = useRef<HTMLDivElement>(null);
  const turboSeamRef = useRef<HTMLDivElement>(null);
  const motorGroundRef = useRef<HTMLDivElement>(null);
  const motorSeamRef = useRef<HTMLDivElement>(null);
  const penGroundRef = useRef<HTMLDivElement>(null);
  const penSeamRef = useRef<HTMLDivElement>(null);
  const uploadGroundRef = useRef<HTMLDivElement>(null);
  const uploadSeamRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(1);
  const currentChapterRef = useRef(1);
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Dynamic Theme Lighting Refs
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const blueRimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const cyanRimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const themeRef = useRef<'light' | 'dark'>(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Active Hovered 3D Component Ref & Tracking
  const hoveredMeshInfoRef = useRef<{
    info: LoadedComponentMeshInfo | null;
  } | null>(null);

  // Mechanical Kinematics Clock & User Pause/Resume State (Default: Active)
  const [isMotionPaused, setIsMotionPaused] = useState(false);
  const isMotionPausedRef = useRef(false);
  const kinematicTimeRef = useRef(0);

  const toggleMotionPause = useCallback(() => {
    setIsMotionPaused((prev) => {
      const next = !prev;
      isMotionPausedRef.current = next;
      return next;
    });
  }, []);

  // Safe Spacebar shortcut for landing page kinematics (disabled when interacting with forms/buttons)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.tagName === 'SELECT' ||
            (activeEl as HTMLElement).isContentEditable ||
            activeEl.tagName === 'BUTTON')
        ) {
          return;
        }
        e.preventDefault();
        toggleMotionPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMotionPause]);

  // High-Performance Pointer Movement Tracking for Zero-Overhead Raycasting
  const mouseMovedRef = useRef(false);
  const lastPickScrollPRef = useRef(0);
  const lastPickModelRef = useRef<LoadedObjectResult | null>(null);
  const currentHoverKeyRef = useRef<string | null>(null);

  // Direct DOM Refs for High-Frequency Annotations (Eliminates React re-renders for 144Hz smoothness)
  const annotationSvgRef = useRef<SVGSVGElement>(null);
  const annotationContainerRef = useRef<HTMLDivElement>(null);
  const annSlotElementsRef = useRef<Array<{
    group: SVGGElement;
    polyline: SVGPolylineElement;
    circle: SVGCircleElement;
    container: HTMLDivElement;
    cat?: HTMLElement | null;
    title: HTMLElement;
    desc: HTMLElement;
    badge?: HTMLElement | null;
  }>>([]);

  // Interruptible Physics-Smoothed Annotation State (Smooth gliding & jitter-free transitions)
  const smoothedAnnotationsRef = useRef<Array<{
    currentId: string | null;
    x: number;
    y: number;
    elbowX: number;
    labelEdgeX: number;
    labelX: number;
    labelY: number;
    opacity: number;
    targetOpacity: number;
    side: 'left' | 'right' | 'south' | 'north' | null;
    isSouth?: boolean;
    isNorth?: boolean;
  }>>(
    Array.from({ length: 16 }, () => ({
      currentId: null,
      x: 0,
      y: 0,
      elbowX: 0,
      labelEdgeX: 0,
      labelX: 0,
      labelY: 0,
      opacity: 0,
      targetOpacity: 0,
      side: null,
      isSouth: false,
      isNorth: false,
    }))
  );

  // Smooth Scroll Controller (Lenis) for Sub-Pixel 144Hz Physics & No Wheel Skips
  const lenisRef = useRef<Lenis | null>(null);

  // Physically Damped Inertia State for Hover Interactions
  const dampedMouseRef = useRef({ x: 0.5, y: 0.5 });
  const dampedVelocityRef = useRef(0);
  const uploadAuraWeightRef = useRef(0);

  // Scroll Progress MotionValue: strictly driven by single master 144Hz renderLoop
  const scrollYProgress = useMotionValue(0);

  const [isDragOver, setIsDragOver] = useState(false);

  // Smooth step helper
  const smoothstep = (min: number, max: number, value: number) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  };

  // Initialize Lenis Smooth Scroll Engine
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const lenis = new Lenis({
      lerp: 0.08,            // Balanced silky smooth momentum without runaway glide
      wheelMultiplier: 0.95, // Steady, controlled travel per wheel notch (prevents rushing)
      touchMultiplier: 1.2,  // Balanced response for trackpads
      smoothWheel: true,     // Silky sub-pixel interpolation
      infinite: false,
    });
    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // --------------------------------------------------------------------------
  // 1. Initialize Three.js Scene, Lights & Dynamic Models
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const isStartLight = themeRef.current === 'light';

    // Scene: Transparent WebGL stage layered directly above living atmospheric canvas
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera: 35-degree FOV for true architectural proportion
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 150);
    camera.position.set(0, 0, 18);
    cameraRef.current = camera;

    // WebGL Renderer with alpha: true so machine plates shine through
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isStartLight ? 0.98 : 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    scene.background = null;

    // Section 4 & 8: Machine Plate Scene Lighting Rig
    // Key Light: warm directional (#FFF0DC dark, #FFF7EB light)
    const keyLight = new THREE.DirectionalLight(isStartLight ? 0xFFF7EB : 0xFFF0DC, isStartLight ? 1.65 : 1.85);
    keyLight.position.set(6, 10, 8);
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    // Fill Light: soft warm ambient (#E9DCCB dark, #F0E8DC light)
    const fillLight = new THREE.DirectionalLight(isStartLight ? 0xF0E8DC : 0xE9DCCB, isStartLight ? 1.2 : 0.9);
    fillLight.position.set(-6, -3, -4);
    fillLightRef.current = fillLight;
    scene.add(fillLight);

    // Soft Ambient Light (#E9DCCB dark, #F0E8DC light)
    const ambientLight = new THREE.AmbientLight(isStartLight ? 0xF0E8DC : 0xE9DCCB, isStartLight ? 0.75 : 0.45);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    // Rim Light (Plate Tint - default tungsten #FFE7C7)
    const blueRimLight = new THREE.DirectionalLight(isStartLight ? 0xF5EADB : 0xFFE7C7, isStartLight ? 0.35 : 0.45);
    blueRimLight.position.set(-5, 4, -7);
    blueRimLightRef.current = blueRimLight;
    scene.add(blueRimLight);

    // Secondary Accent Light (Warm tungsten #FFE7C7)
    const cyanRimLight = new THREE.DirectionalLight(isStartLight ? 0xF5EADB : 0xFFE7C7, isStartLight ? 0.25 : 0.35);
    cyanRimLight.position.set(6, -2, -5);
    cyanRimLightRef.current = cyanRimLight;
    scene.add(cyanRimLight);

    // ------------------------------------------------------------------------
    // Load Models (Watch, Drone, Engine, Motor, Pen) with Dynamic Framing
    // ------------------------------------------------------------------------
    let isMounted = true;
    const loadModels = async () => {
      const allObjectsToLoad = [...objects];
      if (!allObjectsToLoad.some((o) => o.id === 'jet-turbine')) {
        allObjectsToLoad.push(jetTurbineData);
      }
      for (const obj of allObjectsToLoad) {
        try {
          const loaded = await load3DModelForObject(obj, 'solid');
          if (!isMounted) return;
          loaded.rootGroup.visible = false;

          // Preserve normalized base scale (crucial for drone's 51x factor)
          loaded.rootGroup.userData.baseScale = loaded.rootGroup.scale.clone();

          // Calculate both assembled framing and maximum exploded framing
          const framingSet = computeModelFramingSet(camera, loaded);
          loaded.rootGroup.userData.assembledDist = framingSet.assembledFraming.distance;
          loaded.rootGroup.userData.explodedDist = framingSet.explodedFraming.distance;
          loaded.rootGroup.userData.assembledCenter = framingSet.assembledFraming.center.clone();
          loaded.rootGroup.userData.explodedCenter = framingSet.explodedFraming.center.clone();
          loaded.rootGroup.userData.framingCenter = framingSet.assembledFraming.center.clone();

          // Pre-cache flat interactive mesh array for 0-latency raycasting
          const interactiveList: THREE.Mesh[] = [];
          loaded.componentMap.forEach((info) => {
            if (info.sourceMeshes && info.sourceMeshes.length > 0) {
              info.sourceMeshes.forEach((sm) => {
                if (sm instanceof THREE.Mesh) {
                  sm.userData.componentInfo = info;
                  interactiveList.push(sm);
                }
              });
            } else if (info.mesh instanceof THREE.Mesh) {
              info.mesh.userData.componentInfo = info;
              interactiveList.push(info.mesh);
            }
            info.mesh.traverse((child) => {
              if (child instanceof THREE.Mesh && !interactiveList.includes(child)) {
                child.userData.componentInfo = info;
                interactiveList.push(child);
              }
            });
          });
          loaded.rootGroup.userData.interactiveList = interactiveList;

          // Stage 1 broad-phase bounding box (encloses full model + exploded envelope)
          const modelBounds = new THREE.Box3().setFromObject(loaded.rootGroup);
          modelBounds.expandByScalar(0.75);
          loaded.rootGroup.userData.modelBounds = modelBounds;
          loaded.rootGroup.userData.objectId = obj.id;
          loaded.rootGroup.userData.objectData = obj;
          loaded.rootGroup.traverse((child) => {
            child.userData.objectId = obj.id;
          });

          scene.add(loaded.rootGroup);
          modelsMapRef.current.set(obj.id, loaded);
          (window as unknown as { __modelsMap?: Map<string, unknown> }).__modelsMap = modelsMapRef.current;
        } catch (err) {
          console.warn(`Could not load model for ${obj.id}:`, err);
        }
      }
    };
    loadModels();

    // Window Resize Handler: Update aspect and recalculate framing for all models
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      for (const loaded of modelsMapRef.current.values()) {
        const framingSet = computeModelFramingSet(cameraRef.current, loaded);
        loaded.rootGroup.userData.assembledDist = framingSet.assembledFraming.distance;
        loaded.rootGroup.userData.explodedDist = framingSet.explodedFraming.distance;
        loaded.rootGroup.userData.assembledCenter = framingSet.assembledFraming.center.clone();
        loaded.rootGroup.userData.explodedCenter = framingSet.explodedFraming.center.clone();
        loaded.rootGroup.userData.framingCenter = framingSet.assembledFraming.center.clone();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      modelsMapRef.current.clear();
    };
  }, [objects]);

  // --------------------------------------------------------------------------
  // 2. Mouse Tracking for 3D Raycasting
  // --------------------------------------------------------------------------
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseMovedRef.current = true;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // --------------------------------------------------------------------------
  // 3. Main Deterministic Animation & Render Loop
  // --------------------------------------------------------------------------
  useEffect(() => {
    let animationFrameId = 0;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // ----------------------------------------------------------------------
      // Dynamic Kinematics & Scroll Choreography Across All Chapters
      // ----------------------------------------------------------------------
      // Synchronously advance Lenis physics in the master animation frame
      if (lenisRef.current) {
        lenisRef.current.raf(time);
      }

      // Compute exact continuous scroll progress without discrete wheel jumping
      const maxScroll = (containerRef.current?.scrollHeight || document.documentElement.scrollHeight) - window.innerHeight;

      // Auto-sync Lenis if native scroll moved externally (e.g. scrollbar drag or instant scrollTo)
      if (lenisRef.current && Math.abs(window.scrollY - lenisRef.current.scroll) > 30 && !lenisRef.current.isScrolling) {
        lenisRef.current.scrollTo(window.scrollY, { immediate: true });
      }

      const currentScroll = lenisRef.current ? lenisRef.current.scroll : window.scrollY;
      const p = maxScroll > 0 ? Math.min(Math.max(currentScroll / maxScroll, 0), 1) : 0;
      scrollYProgress.set(p);
      (window as unknown as { __lastP?: number; __lastCurrentScroll?: number; __lastMaxScroll?: number }).__lastP = p;
      (window as unknown as { __lastP?: number; __lastCurrentScroll?: number; __lastMaxScroll?: number }).__lastCurrentScroll = currentScroll;
      (window as unknown as { __lastP?: number; __lastCurrentScroll?: number; __lastMaxScroll?: number }).__lastMaxScroll = maxScroll;

      // ----------------------------------------------------------------------
      // Machine Plate Grounds & Dynamic Scene Lighting (Section 3, 4, 7)
      // ----------------------------------------------------------------------
      const isCurrentLight = themeRef.current === 'light';
      const targetAmbInt = isCurrentLight ? 0.85 : 0.55;
      const targetKeyInt = isCurrentLight ? 1.75 : 1.90;
      const targetFillInt = isCurrentLight ? 1.1 : 0.8;
      const targetRimBlueInt = isCurrentLight ? 0.35 : 0.45;
      const targetRimCyanInt = isCurrentLight ? 0.25 : 0.35;
      const targetExposure = isCurrentLight ? 1.0 : 1.05;

      const themeLerpRate = Math.min(delta * 6, 0.25);

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Section 3: Seam windows (in normalized scroll progress p)
      const seams = [
        { id: 'watch', start: 0.04, end: 0.10, ground: watchGroundRef.current, seam: watchSeamRef.current },
        { id: 'drone', start: 0.36, end: 0.43, ground: droneGroundRef.current, seam: droneSeamRef.current },
        { id: 'turbo', start: 0.62, end: 0.67, ground: turboGroundRef.current, seam: turboSeamRef.current },
        { id: 'motor', start: 0.74, end: 0.77, ground: motorGroundRef.current, seam: motorSeamRef.current },
        { id: 'pen', start: 0.80, end: 0.825, ground: penGroundRef.current, seam: penSeamRef.current },
        { id: 'upload', start: 0.885, end: 0.93, ground: uploadGroundRef.current, seam: uploadSeamRef.current },
      ];

      for (const s of seams) {
        if (!s.ground) continue;
        if (p < s.start) {
          s.ground.style.clipPath = 'none';
          s.ground.style.opacity = '0';
          if (s.seam) s.seam.style.opacity = '0';
        } else if (p > s.end) {
          s.ground.style.clipPath = 'none';
          s.ground.style.opacity = '1';
          if (s.seam) s.seam.style.opacity = '0';
        } else {
          const pNorm = prefersReduced
            ? (p >= (s.start + s.end) / 2 ? 1 : 0)
            : (p - s.start) / (s.end - s.start);
          const smoothFade = pNorm * pNorm * (3 - 2 * pNorm);
          s.ground.style.clipPath = 'none';
          s.ground.style.opacity = smoothFade.toFixed(3);
          if (s.seam) s.seam.style.opacity = '0';
        }
      }

      let activePlate = 'hero';
      let activeGroundToken = 'var(--carbon)';
      let activeRimHex = isCurrentLight ? 0xF5EADB : 0xFFE7C7;
      let chapterNum = 1;

      if (p < 0.07) {
        activePlate = 'hero';
        activeGroundToken = 'var(--carbon)';
        activeRimHex = isCurrentLight ? 0xF5EADB : 0xFFE7C7;
        chapterNum = 1;
      } else if (p < 0.395) {
        activePlate = 'watch';
        activeGroundToken = 'var(--ruby)';
        activeRimHex = isCurrentLight ? 0xFCE8E8 : 0xFFE0E0;
        chapterNum = 1;
      } else if (p < 0.645) {
        activePlate = 'drone';
        activeGroundToken = 'var(--carbon)';
        activeRimHex = isCurrentLight ? 0xF5EADB : 0xFFE7C7;
        chapterNum = 2;
      } else if (p < 0.755) {
        activePlate = 'turbo';
        activeGroundToken = 'var(--plum)';
        activeRimHex = isCurrentLight ? 0xF4E8F8 : 0xEEDDF4;
        chapterNum = 3;
      } else if (p < 0.805) {
        activePlate = 'motor';
        activeGroundToken = 'var(--copper)';
        activeRimHex = isCurrentLight ? 0xFAECE2 : 0xFFE8D6;
        chapterNum = 3;
      } else if (p < 0.885) {
        activePlate = 'pen';
        activeGroundToken = 'var(--ruby)';
        activeRimHex = isCurrentLight ? 0xFCE8E8 : 0xFFE0E0;
        chapterNum = 3;
      } else {
        activePlate = 'upload';
        activeGroundToken = 'var(--carbon)';
        activeRimHex = isCurrentLight ? 0xF5EADB : 0xFFE7C7;
        chapterNum = 3;
      }

      document.documentElement.style.setProperty('--current-ground', activeGroundToken);
      window.dispatchEvent(new CustomEvent('plate-scroll', { detail: { p, activePlate } }));

      if (currentChapterRef.current !== chapterNum) {
        currentChapterRef.current = chapterNum;
        setActiveChapter(chapterNum);
      }

      const targetKeyHex = isCurrentLight ? 0xFFF7EB : 0xFFF0DC;
      const targetFillHex = isCurrentLight ? 0xF0E8DC : 0xE9DCCB;
      const targetAmbHex = isCurrentLight ? 0xF0E8DC : 0xE9DCCB;

      if (ambientLightRef.current) {
        ambientLightRef.current.color.setHex(targetAmbHex);
        ambientLightRef.current.intensity += (targetAmbInt - ambientLightRef.current.intensity) * themeLerpRate;
      }
      if (keyLightRef.current) {
        keyLightRef.current.color.setHex(targetKeyHex);
        keyLightRef.current.intensity += (targetKeyInt - keyLightRef.current.intensity) * themeLerpRate;
      }
      if (fillLightRef.current) {
        fillLightRef.current.color.lerp(_themeTargetFillColor.setHex(targetFillHex), themeLerpRate);
        fillLightRef.current.intensity += (targetFillInt - fillLightRef.current.intensity) * themeLerpRate;
      }
      if (blueRimLightRef.current) {
        blueRimLightRef.current.color.lerp(_themeTargetRimBlueColor.setHex(activeRimHex), themeLerpRate);
        blueRimLightRef.current.intensity += (targetRimBlueInt - blueRimLightRef.current.intensity) * themeLerpRate;
      }
      if (cyanRimLightRef.current) {
        cyanRimLightRef.current.color.lerp(_themeTargetRimCyanColor.setHex(isCurrentLight ? 0xF5EADB : 0xFFE7C7), themeLerpRate);
        cyanRimLightRef.current.intensity += (targetRimCyanInt - cyanRimLightRef.current.intensity) * themeLerpRate;
      }
      if (renderer) {
        renderer.toneMappingExposure += (targetExposure - renderer.toneMappingExposure) * themeLerpRate;
      }

      const models = modelsMapRef.current;

      const watchModel = models.get('wristwatch');
      const droneModel = models.get('drone');
      const engineModel = models.get('car-engine');
      const motorModel = models.get('electric-motor');
      const penModel = models.get('ballpoint-pen');

      // Preserve normalized base scales, dynamic framing centers, and distances
      const watchBase = (watchModel?.rootGroup.userData.baseScale as THREE.Vector3) || new THREE.Vector3(1, 1, 1);
      const watchDist = (watchModel?.rootGroup.userData.assembledDist as number) || 6.8;
      const watchExplodedDist = (watchModel?.rootGroup.userData.explodedDist as number) || watchDist * 1.35;
      const watchAssembledCenter = (watchModel?.rootGroup.userData.assembledCenter as THREE.Vector3) || new THREE.Vector3(0, 0, 0);
      const watchExplodedCenter = (watchModel?.rootGroup.userData.explodedCenter as THREE.Vector3) || watchAssembledCenter;

      const droneBase = (droneModel?.rootGroup.userData.baseScale as THREE.Vector3) || new THREE.Vector3(1, 1, 1);
      const droneDist = (droneModel?.rootGroup.userData.assembledDist as number) || 12.8;
      const droneExplodedDist = (droneModel?.rootGroup.userData.explodedDist as number) || droneDist * 1.65;
      const droneAssembledCenter = (droneModel?.rootGroup.userData.assembledCenter as THREE.Vector3) || new THREE.Vector3(0, 0, 0);
      const droneExplodedCenter = (droneModel?.rootGroup.userData.explodedCenter as THREE.Vector3) || droneAssembledCenter;

      const engineBase = (engineModel?.rootGroup.userData.baseScale as THREE.Vector3) || new THREE.Vector3(1, 1, 1);
      const engineDist = (engineModel?.rootGroup.userData.assembledDist as number) || 8.5;
      const engineExplodedDist = (engineModel?.rootGroup.userData.explodedDist as number) || engineDist * 1.35;
      const engineAssembledCenter = (engineModel?.rootGroup.userData.assembledCenter as THREE.Vector3) || new THREE.Vector3(0, 0, 0);
      const engineExplodedCenter = (engineModel?.rootGroup.userData.explodedCenter as THREE.Vector3) || engineAssembledCenter;

      const motorBase = (motorModel?.rootGroup.userData.baseScale as THREE.Vector3) || new THREE.Vector3(1, 1, 1);
      const motorDist = (motorModel?.rootGroup.userData.assembledDist as number) || 6.8;
      const motorExplodedDist = (motorModel?.rootGroup.userData.explodedDist as number) || motorDist * 1.35;
      const motorAssembledCenter = (motorModel?.rootGroup.userData.assembledCenter as THREE.Vector3) || new THREE.Vector3(0, 0, 0);
      const motorExplodedCenter = (motorModel?.rootGroup.userData.explodedCenter as THREE.Vector3) || motorAssembledCenter;

      const penBase = (penModel?.rootGroup.userData.baseScale as THREE.Vector3) || new THREE.Vector3(1, 1, 1);
      const penDist = (penModel?.rootGroup.userData.assembledDist as number) || 7.2;
      const penExplodedDist = (penModel?.rootGroup.userData.explodedDist as number) || penDist * 1.35;
      const penAssembledCenter = (penModel?.rootGroup.userData.assembledCenter as THREE.Vector3) || new THREE.Vector3(0, 0, 0);
      const penExplodedCenter = (penModel?.rootGroup.userData.explodedCenter as THREE.Vector3) || penAssembledCenter;

      const turbofanModel = models.get('jet-turbine');
      const turbofanBase = (turbofanModel?.rootGroup.userData.baseScale as THREE.Vector3) || new THREE.Vector3(1, 1, 1);
      const turbofanDist = (turbofanModel?.rootGroup.userData.assembledDist as number) || 8.5;
      const turbofanExplodedDist = (turbofanModel?.rootGroup.userData.explodedDist as number) || turbofanDist * 1.35;
      const turbofanAssembledCenter = (turbofanModel?.rootGroup.userData.assembledCenter as THREE.Vector3) || new THREE.Vector3(0, 0, 0);
      const turbofanExplodedCenter = (turbofanModel?.rootGroup.userData.explodedCenter as THREE.Vector3) || turbofanAssembledCenter;

      // ----------------------------------------------------------------------
      // 1. Live Continuous Mechanical Motion (Visibility-Aware & Pausable)
      // ----------------------------------------------------------------------
      if (!isMotionPausedRef.current) {
        kinematicTimeRef.current += Math.min(delta, 0.05);
      }
      const elapsed = kinematicTimeRef.current;

      // Turbofan Engine Rotordynamics (True rotating spools only)
      if (turbofanModel && (turbofanModel.rootGroup.visible || p < 0.10)) {
        turbofanModel.componentMap.forEach((info, id) => {
          const meshes = (info.sourceMeshes && info.sourceMeshes.length > 0) ? info.sourceMeshes : [info.mesh];
          if (id === 'fan-module' || id === 'blades_0') {
            meshes.forEach((m) => {
              const baseRot = (m.userData?.baseRotation as THREE.Euler) || info.baseRotation;
              m.rotation.x = baseRot.x;
              m.rotation.z = baseRot.z;
              m.rotation.y = baseRot.y + elapsed * 3.5;
            });
          } else if (id === 'turbine-nozzle-guide-vanes' || id === 'fins_0') {
            meshes.forEach((m) => {
              const baseRot = (m.userData?.baseRotation as THREE.Euler) || info.baseRotation;
              m.rotation.x = baseRot.x;
              m.rotation.y = baseRot.y;
              m.rotation.z = baseRot.z + elapsed * 4.8;
            });
          } else if (id === 'coaxial-drive-shaft' || id === 'tube_0') {
            meshes.forEach((m) => {
              const baseRot = (m.userData?.baseRotation as THREE.Euler) || info.baseRotation;
              m.rotation.x = baseRot.x;
              m.rotation.y = baseRot.y;
              m.rotation.z = baseRot.z + elapsed * 4.2;
            });
          }
        });
      }

      // Watch Horological Motion (Oscillating balance wheel, hairspring breathing, pallet ticking)
      if (watchModel && (watchModel.rootGroup.visible || p < 0.42)) {
        watchModel.componentMap.forEach((info, id) => {
          if (id.includes('balance-wheel') || id === 'watch-balance-wheel') {
            info.mesh.rotation.z = info.baseRotation.z + Math.sin(elapsed * 8.0) * 0.32;
          } else if (id.includes('hairspring') || id === 'watch-hairspring') {
            info.mesh.rotation.z = info.baseRotation.z + Math.sin(elapsed * 8.0) * 0.28;
          } else if (id.includes('pallet-fork') || id.includes('escapement')) {
            info.mesh.rotation.z = info.baseRotation.z + Math.sin(elapsed * 8.0) * 0.05;
          } else if (id.includes('escape-wheel')) {
            info.mesh.rotation.z = info.baseRotation.z + elapsed * 0.8;
          } else if (id.includes('fourth-wheel') || id.includes('seconds')) {
            info.mesh.rotation.z = info.baseRotation.z + elapsed * 0.3;
          } else if (id.includes('third-wheel')) {
            info.mesh.rotation.z = info.baseRotation.z - elapsed * 0.1;
          } else if (id.includes('center-wheel')) {
            info.mesh.rotation.z = info.baseRotation.z + elapsed * 0.03;
          }
        });
      }

      // Drone Propeller Dynamic Spin
      if (droneModel?.propellerMixer && !isMotionPausedRef.current && (droneModel.rootGroup.visible || (p >= 0.36 && p < 0.67))) {
        droneModel.propellerMixer.update(delta * 1.5);
      }

      // Turbocharger Kinematic High-Speed Rotordynamics (True rotating spools only)
      if (engineModel && (engineModel.rootGroup.visible || (p >= 0.61 && p < 0.75))) {
        engineModel.componentMap.forEach((info, id) => {
          const meshes = (info.sourceMeshes && info.sourceMeshes.length > 0) ? info.sourceMeshes : [info.mesh];
          if (
            id === 'turbo-chra-core' ||
            id === 'turbo-compressor-inlet' ||
            id === 'turbo-exhaust-outlet' ||
            id.includes('chra') ||
            id.includes('compressor-inlet') ||
            id.includes('exhaust-outlet')
          ) {
            meshes.forEach((m) => {
              const baseRotZ = (m.userData?.baseRotation as THREE.Euler)?.z ?? info.baseRotation.z;
              m.rotation.z = baseRotZ + elapsed * 10;
            });
          } else if (id === 'turbo-wastegate-linkage' || id.includes('linkage')) {
            meshes.forEach((m) => {
              const baseRotZ = (m.userData?.baseRotation as THREE.Euler)?.z ?? info.baseRotation.z;
              m.rotation.z = baseRotZ + Math.sin(elapsed * 3.5) * 0.04;
            });
          }
        });
      }

      // Motor Rotor High-Speed Electromagnetic Commutation (Bell, Magnets, Shaft, and Retention Clip)
      if (motorModel && (motorModel.rootGroup.visible || (p >= 0.72 && p < 0.81))) {
        motorModel.componentMap.forEach((info, id) => {
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
            // Continuous electromagnetic rotation of outer rotor bell, magnets, drive shaft, and retention clip around Y axis
            const meshes = (info.sourceMeshes && info.sourceMeshes.length > 0) ? info.sourceMeshes : [info.mesh];
            meshes.forEach((m) => {
              const baseRotY = (m.userData?.baseRotation as THREE.Euler)?.y ?? info.baseRotation.y;
              m.rotation.y = baseRotY + elapsed * 8.0;
            });
          }
        });
      }

      // Ballpoint Pen Supplemental Micro-Motion (Return Spring Compression and Cam Indexing)
      if (penModel && (penModel.rootGroup.visible || (p >= 0.79 && p < 0.885))) {
        penModel.componentMap.forEach((info, id) => {
          if (id.includes('spring') || id === 'supplemental-return-spring') {
            const springCompression = 1.0 + Math.sin(elapsed * 4.0) * 0.05;
            info.mesh.scale.set(
              info.baseScale.x * springCompression,
              info.baseScale.y,
              info.baseScale.z
            );
          } else if (id.includes('cam') || id === 'supplemental-click-cam') {
            info.mesh.rotation.x = info.baseRotation.x + elapsed * 0.8;
          }
        });
      }

      // Default all to hidden, then selectively activate
      if (watchModel) watchModel.rootGroup.visible = false;
      if (droneModel) droneModel.rootGroup.visible = false;
      if (engineModel) engineModel.rootGroup.visible = false;
      if (motorModel) motorModel.rootGroup.visible = false;
      if (penModel) penModel.rootGroup.visible = false;

      const rawTargets: Array<{ id: string; label: string; category: string; description: string; x: number; y: number }> = [];
      let currentEditorialSide: 'left' | 'right' | 'hero' | 'none' = 'none';

      // Precision 3D-to-Screen Projection Helper for Adaptive Annotations (Universal Skinned + Rigid Support)
      const projectTargets = (
        model: LoadedObjectResult | undefined,
        targets: Array<{ id: string; label: string; category: string; description: string }>
      ) => {
        if (!model) return;
        camera.updateMatrixWorld(true);
        model.rootGroup.updateMatrixWorld(true);

        targets.forEach((t) => {
          let comp = model.componentMap.get(t.id);
          if (!comp) {
            for (const [k, v] of model.componentMap.entries()) {
              if (k === t.id || v.componentId === t.id || k.includes(t.id) || t.id.includes(k)) {
                comp = v;
                break;
              }
            }
          }
          if (!comp) return;

          const worldPos = new THREE.Vector3();
          let foundBonePos = false;

          // Universal Skinned Skeleton Bone coordinate resolver
          // For animated skinned models (like the drone), vertices are deformed on GPU via skeleton bones.
          // Querying the animated bone world position yields the true deformed coordinate!
          if (comp.nativeAnimated || model.rootGroup.name.includes('drone')) {
            let targetBoneName = '';
            if (t.id === 'drone-upper-body') targetBoneName = 'upper_body_jnt';
            else if (t.id === 'drone-prop-fasteners') targetBoneName = 'prop_bolt_cap_1_jnt';
            else if (t.id === 'drone-propeller-group') targetBoneName = 'prop_1_jnt';
            else if (t.id === 'drone-motor-group') targetBoneName = 'motor_1_jnt';
            else if (t.id === 'drone-camera') targetBoneName = 'camera_jnt';
            else if (t.id === 'drone-battery') targetBoneName = 'battery_jnt';
            else if (t.id === 'drone-flight-electronics') targetBoneName = 'top_board_jnt';
            else if (t.id === 'drone-landing-gear') targetBoneName = 'leg_1_jnt';

            if (targetBoneName) {
              let matchedObj: THREE.Object3D | null = null;
              model.rootGroup.traverse((child) => {
                if (matchedObj) return;
                if (child.name && child.name.toLowerCase().includes(targetBoneName)) {
                  matchedObj = child;
                }
              });
              if (matchedObj) {
                (matchedObj as THREE.Object3D).updateWorldMatrix(true, false);
                (matchedObj as THREE.Object3D).getWorldPosition(worldPos);
                foundBonePos = true;
              }
            }
          }

          if (!foundBonePos) {
            if (comp.sourceMeshes && comp.sourceMeshes.length > 0) {
              const box = new THREE.Box3();
              let hasVisible = false;
              for (const sm of comp.sourceMeshes) {
                if (sm.visible !== false) {
                  sm.updateWorldMatrix(true, false);
                  box.expandByObject(sm);
                  hasVisible = true;
                }
              }
              if (hasVisible && !box.isEmpty()) {
                box.getCenter(worldPos);
              } else {
                return;
              }
            } else if (comp.mesh && comp.mesh.visible !== false) {
              comp.mesh.updateWorldMatrix(true, true);
              const box = new THREE.Box3().setFromObject(comp.mesh);
              if (!box.isEmpty()) {
                box.getCenter(worldPos);
              } else {
                comp.mesh.getWorldPosition(worldPos);
              }
            } else {
              return;
            }
          }

          const proj = worldPos.clone().project(camera);
          const x = (proj.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-proj.y * 0.5 + 0.5) * window.innerHeight;
          const inFrustum = proj.z > -1.0 && proj.z < 1.0;
          const inScreen = x >= 20 && x <= window.innerWidth - 20 && y >= 20 && y <= window.innerHeight - 20;

          if (inFrustum && inScreen) {
            rawTargets.push({ ...t, x, y });
          }
        });
      };

      // ----------------------------------------------------------------------
      // CHAPTER 01 & 02: Hero Boot & Specimen Overview (p: 0.00 - 0.14)
      // ----------------------------------------------------------------------
      if (p < 0.14) {
        if (p < 0.045) {
          // Hero boot: High-Bypass Turbofan FULLY EXPLODED horizontally across the panoramic viewport
          setActiveModelAndObject(turbofanModel || null, jetTurbineObj, 'jet-turbine');
          if (watchModel) {
            watchModel.rootGroup.visible = false;
          }

          if (turbofanModel) {
            currentEditorialSide = 'hero';
            turbofanModel.rootGroup.visible = true;
            // Positioned tastefully in the upper-middle zone:
            // Centered horizontally, elevated in Y so it sits comfortably above the bottom headline
            turbofanModel.rootGroup.position.set(0.08, 1.62, 0);
            // Pure horizontal alignment: -PI/2 yaw aligns thrust axis (Z) exactly left→right
            // Subtle pitch (0.10) gives an authentic engineering inspection angle
            const heroYaw = -Math.PI / 2 + Math.sin(elapsed * 0.25) * 0.008;
            const heroPitch = 0.10 + Math.cos(elapsed * 0.2) * 0.004;
            turbofanModel.rootGroup.rotation.set(heroPitch, heroYaw, 0);
            // Scale: scaled tastefully (1.08) to fit the whole model gracefully in the central band
            turbofanModel.rootGroup.scale.copy(turbofanBase).multiplyScalar(1.08);
            // FULL horizontal explosion along engine thrust axis
            applyModelExplodeHorizontal(turbofanModel, 1.0);
            turbofanModel.rootGroup.updateMatrixWorld(true);

            // Camera positioned to frame the entire expanded engine tastefully across ~46% of screen
            camera.position.set(0, 1.55, 17.5);
            camera.lookAt(0, 1.15, 0);

            // 11 precision engineering callouts arranged in 3 non-obstructing sectors:
            // 1. Back / Aft (Left Flank): Exhaust Mixer (01) & HP Turbine Vanes (02)
            // 2. North of Model (Top Area): Concentric Shaft (03), Bleed Manifolds (04), Compressor Casing (05), Kevlar Containment (06)
            // 3. Front / Intake & Bypass (Right Flank): Fan Module (07), Intake Cowling (08), Bypass Stators (09), Thrust Reverser (10), FADEC (11)
            projectTargets(turbofanModel, [
              // Aft / Left Flank (strictly upper-left above "Deconstruct the invisible")
              { id: 'exhaust-mixer-nozzle', label: 'EXHAUST MIXER', category: 'PROPULSION', description: '16-lobe convoluted core exhaust mixer.' },
              { id: 'turbine-nozzle-guide-vanes', label: 'HP TURBINE VANES', category: 'THERMODYNAMICS', description: 'CMSX-4 superalloy surviving 1,650°C.' },

              // North of Model (Shaft, Bleed, Compressor, Containment)
              { id: 'coaxial-drive-shaft', label: 'CONCENTRIC DRIVE SHAFT', category: 'ROTORDYNAMICS', description: 'Dual-spool concentric LP/HP torque transmission shaft.' },
              { id: 'bleed-air-manifolds', label: 'BLEED AIR MANIFOLDS', category: 'PNEUMATICS', description: '5th & 9th stage titanium bleed air delivery manifolds.' },
              { id: 'compressor-casing', label: 'HP COMPRESSOR CASING', category: 'CORE COMPRESSION', description: '10-stage axial casing producing 42:1 pressure ratio.' },
              { id: 'fan-containment-casing', label: 'KEVLAR CONTAINMENT', category: 'SAFETY CASING', description: 'Aramid-wrapped shield absorbing 160 kJ blade impact.' },

              // Front / South Flank (Fan, Cowling, OGV Grid, Reverser)
              { id: 'fan-module', label: 'TITANIUM FAN MODULE', category: 'BYPASS PROPULSION', description: '22 hollow Ti-6Al-4V wide-chord blades.' },
              { id: 'inlet-cowl', label: 'AIR INTAKE COWLING', category: 'NACELLE', description: 'CFRP acoustic lip conditioning freestream air.' },
              { id: 'bypass-stator-grid', label: 'BYPASS GUIDE VANES', category: 'AERODYNAMICS', description: 'Acoustic outlet guide vanes de-swirling bypass flow.' },
              { id: 'thrust-reverser-actuators', label: 'THRUST REVERSER', category: 'HYDRAULIC ACTUATION', description: 'Synchronized hydraulic actuators translating cascades.' },
            ]);
          } else {
            camera.position.set(
              watchAssembledCenter.x,
              watchAssembledCenter.y,
              watchAssembledCenter.z + watchDist * 2.5
            );
            camera.lookAt(watchAssembledCenter);
          }
        } else {
          // As visitor scrolls past hero (p: 0.045 - 0.14), the exploded turbofan
          // collapses inward and drifts upward while the watch emerges
          const emergeP = smoothstep(0.045, 0.14, p);

          if (turbofanModel && p < 0.09) {
            const heroRecede = smoothstep(0.09, 0.045, p);
            turbofanModel.rootGroup.visible = heroRecede > 0.02;
            turbofanModel.rootGroup.position.set(
              0.08,
              THREE.MathUtils.lerp(6.5, 1.62, heroRecede),
              THREE.MathUtils.lerp(-20, 0, heroRecede)
            );
            turbofanModel.rootGroup.scale.copy(turbofanBase).multiplyScalar(heroRecede * 1.08);
            applyModelExplodeHorizontal(turbofanModel, heroRecede * 1.0);
          } else if (turbofanModel) {
            turbofanModel.rootGroup.visible = false;
          }

          setActiveModelAndObject(watchModel || null, watchObj, 'wristwatch');

          camera.position.set(
            watchAssembledCenter.x,
            watchAssembledCenter.y,
            watchAssembledCenter.z + THREE.MathUtils.lerp(watchDist * 2.5, watchDist * 1.15, emergeP)
          );
          camera.lookAt(watchAssembledCenter);

          if (watchModel) {
            watchModel.rootGroup.visible = true;
            watchModel.rootGroup.scale.copy(watchBase).multiplyScalar(THREE.MathUtils.lerp(0.35, 1.15, emergeP));
            watchModel.rootGroup.position.set(0, THREE.MathUtils.lerp(-0.4, 0, emergeP), THREE.MathUtils.lerp(-10, 0, emergeP));
            watchModel.rootGroup.rotation.y = THREE.MathUtils.lerp(-0.6, 0, emergeP);
            watchModel.rootGroup.rotation.x = THREE.MathUtils.lerp(0.2, 0.05, emergeP);
            applyModelExplode(watchModel, 0);
          }
        }
      }

      // ----------------------------------------------------------------------
      // CHAPTER 03: Watch Assembled (p: 0.14 - 0.20)
      // ----------------------------------------------------------------------
      else if (p >= 0.14 && p < 0.20) {
        currentEditorialSide = 'left';
        setActiveModelAndObject(watchModel || null, watchObj, 'wristwatch');

        if (watchModel) {
          watchModel.rootGroup.visible = true;
          watchModel.rootGroup.scale.copy(watchBase).multiplyScalar(1.15);
          // Positioned cleanly in center-to-right zone (clear of left heading)
          watchModel.rootGroup.position.set(1.25, 0, 0);
          watchModel.rootGroup.rotation.y = Math.sin(time * 0.0006) * 0.08;
          watchModel.rootGroup.rotation.x = 0.05;
          applyModelExplode(watchModel, 0);

          projectTargets(watchModel, [
            { id: 'watch-dial-bezel', label: 'DIAL CHAPTER RING', category: 'STRUCTURE', description: 'Machined 316L casing bezel with engraved hour track' },
            { id: 'watch-minute-hand', label: 'FACETED MINUTE HAND', category: 'INDICATION', description: 'Polished rhodium-plated hand sweeping above the chapter track' },
            { id: 'watch-balance-wheel', label: 'HARMONIC OSCILLATOR', category: 'REGULATION', description: 'Glucydur balance wheel & hairspring oscillating at 4 Hz' },
            { id: 'watch-crown-wheel', label: 'CROWN WINDING WHEEL', category: 'WINDING', description: 'Keyless works intermediate transmission gear' },
          ]);
        }
        camera.position.set(watchAssembledCenter.x, watchAssembledCenter.y + 0.05, watchAssembledCenter.z + watchDist * 1.38);
        camera.lookAt(watchAssembledCenter);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 04: Watch Reveal (p: 0.20 - 0.26)
      // ----------------------------------------------------------------------
      else if (p >= 0.20 && p < 0.26) {
        currentEditorialSide = 'right';
        setActiveModelAndObject(watchModel || null, watchObj, 'wristwatch');

        const localP = (p - 0.20) / 0.06;
        const easedP = smoothstep(0, 1, localP);
        const explodeVal = easedP * 0.22;
        if (watchModel) {
          watchModel.rootGroup.visible = true;
          watchModel.rootGroup.scale.copy(watchBase);
          // Smoothly shifts from right to center-to-left zone away from right-side text
          watchModel.rootGroup.position.set(THREE.MathUtils.lerp(1.25, -1.05, easedP), 0, 0);
          watchModel.rootGroup.rotation.y = THREE.MathUtils.lerp(0, 0.45, easedP);
          watchModel.rootGroup.rotation.x = THREE.MathUtils.lerp(0.05, 0.15, easedP);
          applyModelExplode(watchModel, explodeVal);

          if (localP > 0.25) {
            projectTargets(watchModel, [
              { id: 'watch-balance-wheel', label: 'HARMONIC BALANCE', category: 'REGULATION', description: '4 Hz oscillating Glucydur wheel & hairspring' },
              { id: 'watch-escape-wheel', label: 'LEVER ESCAPEMENT', category: 'ESCAPEMENT', description: '15-tooth impulse escape wheel' },
              { id: 'watch-center-wheel', label: 'MOTION GEAR TRAIN', category: 'TRANSMISSION', description: 'High-ratio stepped minute drive gears' },
              { id: 'watch-dial-bezel', label: 'BEZEL & DIAL', category: 'STRUCTURE', description: '316L surgical stainless casing assembly' },
            ]);
          }
        }
        const camTarget = new THREE.Vector3().lerpVectors(watchAssembledCenter, watchExplodedCenter, explodeVal);
        const camDist = THREE.MathUtils.lerp(watchDist * 1.38, THREE.MathUtils.lerp(watchDist * 1.38, watchExplodedDist * 1.35, 0.22), easedP);
        camera.position.set(camTarget.x, camTarget.y + 0.05 + easedP * 0.05, camTarget.z + camDist);
        camera.lookAt(camTarget);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 05: Watch Deconstruction & Spatial Telemetry (p: 0.26 - 0.36)
      // ----------------------------------------------------------------------
      else if (p >= 0.26 && p < 0.36) {
        (window as unknown as { __lastChapter?: string }).__lastChapter = 'Chapter 05 (Watch)';
        currentEditorialSide = 'left';
        setActiveModelAndObject(watchModel || null, watchObj, 'wristwatch');

        const explodeP = (p - 0.26) / 0.10;
        const easedExplode = smoothstep(0, 1, explodeP);
        const explodeVal = 0.22 + easedExplode * 0.50;
        if (watchModel) {
          watchModel.rootGroup.visible = true;
          watchModel.rootGroup.scale.copy(watchBase);
          // Smoothly glides across from previous left position (-1.05) to right zone (1.25)
          const watchGlideP = smoothstep(0, 0.28, explodeP);
          const watchPosX = THREE.MathUtils.lerp(-1.05, 1.25, watchGlideP);
          watchModel.rootGroup.position.set(watchPosX, 0, 0);
          watchModel.rootGroup.rotation.y = 0.45 + explodeP * 0.35;
          watchModel.rootGroup.rotation.x = 0.15 - explodeP * 0.05;
          applyModelExplode(watchModel, explodeVal);

          // Curated 5 clean components on right flank with zero text overlap
          const targets = explodeP < 0.35
            ? [
                { id: 'watch-balance-wheel', label: 'HARMONIC BALANCE', category: 'REGULATION', description: '4 Hz oscillating Glucydur wheel & hairspring' },
                { id: 'watch-escape-wheel', label: 'LEVER ESCAPEMENT', category: 'ESCAPEMENT', description: '15-tooth impulse escape wheel' },
                { id: 'watch-center-wheel', label: 'MOTION GEAR TRAIN', category: 'TRANSMISSION', description: 'High-ratio stepped minute drive gears' },
                { id: 'watch-ratchet-wheel', label: 'MAINSPRING RATCHET', category: 'ENERGY STORAGE', description: 'Mainspring winding ratchet wheel' },
              ]
            : [
                { id: 'watch-balance-wheel', label: 'HARMONIC BALANCE', category: 'REGULATION', description: '4 Hz oscillating Glucydur wheel & hairspring' },
                { id: 'watch-escape-wheel', label: 'LEVER ESCAPEMENT', category: 'ESCAPEMENT', description: '15-tooth impulse escape wheel' },
                { id: 'watch-pallet-fork', label: 'STEEL PALLET FORK', category: 'ESCAPEMENT', description: 'Synthetic ruby impulse pallets' },
                { id: 'watch-center-wheel', label: 'MOTION GEAR TRAIN', category: 'TRANSMISSION', description: 'High-ratio stepped minute drive gears' },
                { id: 'watch-ratchet-wheel', label: 'MAINSPRING RATCHET', category: 'ENERGY STORAGE', description: 'Mainspring winding ratchet wheel' },
              ];

          projectTargets(watchModel, targets);
        }
        const camTarget = new THREE.Vector3().lerpVectors(watchAssembledCenter, watchExplodedCenter, explodeVal);
        const camDist = THREE.MathUtils.lerp(THREE.MathUtils.lerp(watchDist * 1.38, watchExplodedDist * 1.35, 0.22), watchExplodedDist * 1.35, easedExplode);
        camera.position.set(camTarget.x, camTarget.y + 0.10, camTarget.z + camDist);
        camera.lookAt(camTarget);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 06: Watch → Drone Cinematic Transition (p: 0.36 - 0.43)
      // ----------------------------------------------------------------------
      else if (p >= 0.36 && p < 0.43) {
        const transP = (p - 0.36) / 0.07;

        if (transP < 0.45) {
          setActiveModelAndObject(watchModel || null, watchObj, 'wristwatch');
        } else {
          setActiveModelAndObject(droneModel || null, droneObj, 'drone');
        }

        // Phase 1: Watch recedes smoothly into atmospheric depth along centered axis (transP: 0 to 0.42)
        if (watchModel && transP < 0.42) {
          const watchExitP = smoothstep(0, 0.40, transP);
          watchModel.rootGroup.visible = true;
          watchModel.rootGroup.scale.copy(watchBase).multiplyScalar(THREE.MathUtils.lerp(1.0, 0.2, watchExitP));
          watchModel.rootGroup.position.set(
            0,
            THREE.MathUtils.lerp(0, 0.5, watchExitP),
            THREE.MathUtils.lerp(0, -25, watchExitP)
          );
          watchModel.rootGroup.rotation.y = 0.8 + watchExitP * 1.5;
          applyModelExplode(watchModel, 1.0);
        }

        // Phase 2: Brief empty atmospheric space, camera re-aligns (transP: 0.40 to 0.52)
        // Handled naturally by camera lerp

        // Phase 3: Drone enters smoothly from depth directly toward its intended Ch 07 composition (transP: 0.50 to 1.0)
        if (droneModel && transP >= 0.50) {
          const droneEnterP = smoothstep(0.50, 1.0, transP);
          droneModel.rootGroup.visible = true;
          droneModel.rootGroup.scale.copy(droneBase).multiplyScalar(THREE.MathUtils.lerp(0.35, 1.0, droneEnterP));
          droneModel.rootGroup.position.set(
            THREE.MathUtils.lerp(0, 1.10, droneEnterP),
            0,
            THREE.MathUtils.lerp(-25, 0, droneEnterP)
          );
          droneModel.rootGroup.rotation.set(
            THREE.MathUtils.lerp(0.30, 0.12, droneEnterP),
            THREE.MathUtils.lerp(-0.6, 0, droneEnterP),
            0
          );
          if (droneModel.animationMixer) {
            droneModel.animationMixer.setTime(0);
          }
        }

        const easedCamera = smoothstep(0, 1, transP);
        const camTarget = new THREE.Vector3().lerpVectors(watchExplodedCenter, droneAssembledCenter, easedCamera);
        const camDist = THREE.MathUtils.lerp(watchExplodedDist, droneDist, easedCamera);
        camera.position.set(camTarget.x, camTarget.y + THREE.MathUtils.lerp(0.10, 0.20, easedCamera), camTarget.z + camDist);
        camera.lookAt(camTarget);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 07: Drone Assembled (p: 0.43 - 0.50)
      // ----------------------------------------------------------------------
      else if (p >= 0.43 && p < 0.50) {
        currentEditorialSide = 'left';
        setActiveModelAndObject(droneModel || null, droneObj, 'drone');

        if (droneModel) {
          droneModel.rootGroup.visible = true;
          droneModel.rootGroup.scale.copy(droneBase);
          const idleHover = Math.sin(elapsed * 1.4) * 0.025;
          const idleRoll = Math.sin(elapsed * 1.0) * 0.012;
          const idleYaw = Math.sin(elapsed * 0.5) * 0.05;
          // Positioned in center-to-right zone (clear of left heading)
          droneModel.rootGroup.position.set(1.10, idleHover, 0);
          droneModel.rootGroup.rotation.set(0.12, idleYaw, idleRoll);
          if (droneModel.animationMixer) {
            droneModel.animationMixer.setTime(0);
          }

          projectTargets(droneModel, [
            { id: 'drone-prop-fasteners', label: 'ROTOR HUB SPINNER CAPS', category: 'PROPULSION RETENTION', description: 'Counter-threaded aluminum propeller retaining caps' },
            { id: 'drone-upper-body', label: 'UPPER BODY SHELL', category: 'AERODYNAMIC CANOPY', description: 'Impact-resistant aerodynamic top fuselage enclosure' },
            { id: 'drone-propeller-group', label: 'LIFT PROPELLERS', category: 'PROPULSION', description: 'Counter-rotating high-efficiency rotors' },
            { id: 'drone-camera', label: 'GIMBAL IMAGING PAYLOAD', category: 'IMAGING PAYLOAD', description: '4K stabilized optical sensor module' },
            { id: 'drone-landing-gear', label: 'COMPOSITE LANDING GEAR', category: 'LANDING STRUCTURE', description: 'High-modulus shock absorption struts' },
          ]);
        }
        camera.position.set(droneAssembledCenter.x, droneAssembledCenter.y + 0.20, droneAssembledCenter.z + droneDist * 1.18);
        camera.lookAt(droneAssembledCenter);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 08: Drone Deconstruction & Insights (p: 0.50 - 0.62)
      // ----------------------------------------------------------------------
      else if (p >= 0.50 && p < 0.62) {
        (window as unknown as { __lastChapter?: string }).__lastChapter = 'Chapter 08 (Drone)';
        currentEditorialSide = 'right';
        setActiveModelAndObject(droneModel || null, droneObj, 'drone');

        const droneExplodeP = (p - 0.50) / 0.12;
        const easedExplode = smoothstep(0, 1, droneExplodeP);
        if (droneModel) {
          droneModel.rootGroup.visible = true;
          droneModel.rootGroup.scale.copy(droneBase);
          // Smoothly glides across from previous right position (1.10) to left zone (-0.95)
          const droneGlideP = smoothstep(0, 0.28, droneExplodeP);
          const dronePosX = THREE.MathUtils.lerp(1.10, -0.95, droneGlideP);
          droneModel.rootGroup.position.set(dronePosX, 0, 0);
          droneModel.rootGroup.rotation.set(0.12 - easedExplode * 0.04, easedExplode * 0.45, 0);

          // Scrub native GLB exploded clip smoothly
          if (droneModel.animationMixer) {
            const peak = droneModel.explodedAnimationPeakTime || 2.0;
            droneModel.animationMixer.setTime(easedExplode * peak);
          }

          // Curated clean components with Rotor Spinner Caps and Upper Body Shell prominently labelled at top
          const targets = droneExplodeP < 0.35
            ? [
                { id: 'drone-prop-fasteners', label: 'ROTOR HUB SPINNER CAPS', category: 'PROPULSION RETENTION', description: 'Counter-threaded aluminum propeller retaining caps' },
                { id: 'drone-upper-body', label: 'UPPER BODY SHELL', category: 'AERODYNAMIC CANOPY', description: 'Impact-resistant aerodynamic top fuselage enclosure' },
                { id: 'drone-propeller-group', label: 'LIFT PROPELLERS', category: 'PROPULSION', description: 'Counter-rotating high-efficiency rotors' },
                { id: 'drone-camera', label: 'GIMBAL IMAGING PAYLOAD', category: 'IMAGING PAYLOAD', description: '4K stabilized optical sensor module' },
              ]
            : [
                { id: 'drone-prop-fasteners', label: 'ROTOR HUB SPINNER CAPS', category: 'PROPULSION RETENTION', description: 'Counter-threaded aluminum propeller retaining caps' },
                { id: 'drone-upper-body', label: 'UPPER BODY SHELL', category: 'AERODYNAMIC CANOPY', description: 'Impact-resistant aerodynamic top fuselage enclosure' },
                { id: 'drone-propeller-group', label: 'LIFT PROPELLERS', category: 'PROPULSION', description: 'Counter-rotating high-efficiency rotors' },
                { id: 'drone-motor-group', label: 'BRUSHLESS MOTORS', category: 'ACTUATION', description: '14-pole electromagnetic outrunners' },
                { id: 'drone-battery', label: 'RECHARGEABLE BATTERY', category: 'POWER SYSTEM', description: 'High-discharge 4S LiPo power module' },
                { id: 'drone-camera', label: 'GIMBAL IMAGING PAYLOAD', category: 'IMAGING PAYLOAD', description: '4K stabilized optical sensor module' },
              ];

          projectTargets(droneModel, targets);
        }
        const camTarget = new THREE.Vector3().lerpVectors(droneAssembledCenter, droneExplodedCenter, easedExplode);
        const camDist = THREE.MathUtils.lerp(droneDist * 1.18, droneExplodedDist * 1.18, easedExplode);
        camera.position.set(camTarget.x, camTarget.y + THREE.MathUtils.lerp(0.20, 0.35, easedExplode), camTarget.z + camDist);
        camera.lookAt(camTarget);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 09: Drone → Engine Transition (p: 0.62 - 0.67)
      // ----------------------------------------------------------------------
      else if (p >= 0.62 && p < 0.67) {
        const transP = (p - 0.62) / 0.05;
        const easedTrans = smoothstep(0, 1, transP);

        if (transP < 0.45) {
          setActiveModelAndObject(droneModel || null, droneObj, 'drone');
        } else {
          setActiveModelAndObject(engineModel || null, engineObj, 'car-engine');
        }

        if (droneModel && transP < 0.8) {
          droneModel.rootGroup.visible = true;
          droneModel.rootGroup.position.set(0, THREE.MathUtils.lerp(0, 5.0, easedTrans), THREE.MathUtils.lerp(0, -18, easedTrans));
          droneModel.rootGroup.scale.copy(droneBase).multiplyScalar(THREE.MathUtils.lerp(1.0, 0.25, easedTrans));
        }

        if (engineModel) {
          engineModel.rootGroup.visible = true;
          engineModel.rootGroup.position.set(
            THREE.MathUtils.lerp(0.8, 1.35, easedTrans),
            THREE.MathUtils.lerp(-3.0, -0.55, easedTrans),
            THREE.MathUtils.lerp(-16, 0, easedTrans)
          );
          engineModel.rootGroup.scale.copy(engineBase).multiplyScalar(THREE.MathUtils.lerp(0.35, 1.0, easedTrans));
          engineModel.rootGroup.rotation.y = THREE.MathUtils.lerp(-1.0, 0.3, easedTrans);
          engineModel.rootGroup.rotation.x = THREE.MathUtils.lerp(0, 0.1, easedTrans);
          applyModelExplode(engineModel, 0);
        }

        const camTarget = new THREE.Vector3().lerpVectors(droneExplodedCenter, engineAssembledCenter, easedTrans);
        const camDist = THREE.MathUtils.lerp(droneExplodedDist * 1.18, engineDist * 1.38, easedTrans);
        camera.position.set(camTarget.x, camTarget.y + THREE.MathUtils.lerp(0.35, 0, easedTrans), camTarget.z + camDist);
        camera.lookAt(camTarget);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 10: Turbocharged Engine (p: 0.67 - 0.72)
      // ----------------------------------------------------------------------
      else if (p >= 0.67 && p < 0.72) {
        currentEditorialSide = 'left';
        setActiveModelAndObject(engineModel || null, engineObj, 'car-engine');

        const engineExplodeP = (p - 0.67) / 0.05;
        const easedEngine = smoothstep(0, 1, engineExplodeP);

        const camTarget = new THREE.Vector3().lerpVectors(engineAssembledCenter, engineExplodedCenter, easedEngine);
        // Backed up ~38% as requested for clear headroom and full geometric visibility
        const camDist = THREE.MathUtils.lerp(engineDist, engineExplodedDist, easedEngine) * 1.38;
        camera.position.set(camTarget.x, camTarget.y, camTarget.z + camDist);
        camera.lookAt(camTarget);
        camera.updateMatrixWorld(true);

        if (engineModel) {
          engineModel.rootGroup.visible = true;
          engineModel.rootGroup.scale.copy(engineBase);
          engineModel.rootGroup.position.set(1.35, -0.55, 0);
          engineModel.rootGroup.rotation.y = 0.3 + engineExplodeP * 0.4;
          engineModel.rootGroup.rotation.x = 0.1;
          applyModelExplode(engineModel, easedEngine * 0.85);
          engineModel.rootGroup.updateMatrixWorld(true);

          const targets = engineExplodeP < 0.18
            ? [
                { id: 'turbo-compressor-housing', label: 'COMPRESSOR VOLUTE HOUSING', category: 'AIR INDUCTION', description: 'Cast A356-T6 aluminum scroll converting Mach 0.8 airflow into 2.4 bar static boost via divergent volute geometry.' },
                { id: 'turbo-turbine-housing', label: 'TWIN-SCROLL TURBINE HOUSING', category: 'EXHAUST GAS', description: 'Ni-Resist D-5S ductile iron housing channeling 950°C pulse energy into dual divided scrolls without backflow.' },
              ]
            : engineExplodeP < 0.35
            ? [
                { id: 'turbo-compressor-housing', label: 'COMPRESSOR VOLUTE HOUSING', category: 'AIR INDUCTION', description: 'Cast A356-T6 aluminum scroll converting Mach 0.8 airflow into 2.4 bar static boost via divergent volute geometry.' },
                { id: 'turbo-turbine-housing', label: 'TWIN-SCROLL TURBINE HOUSING', category: 'EXHAUST GAS', description: 'Ni-Resist D-5S ductile iron housing channeling 950°C pulse energy into dual divided scrolls without backflow.' },
                { id: 'turbo-chra-core', label: 'CHRA ROTATING ASSEMBLY', category: 'CORE KINEMATICS', description: 'Inconel 713C turbine & billet compressor wheel spinning at 220,000 RPM on a 0.025mm hydrodynamic oil wedge.' },
                { id: 'turbo-wastegate-actuator', label: 'PNEUMATIC WASTEGATE ACTUATOR', category: 'BOOST CONTROL', description: 'Pre-calibrated spring diaphragm regulating maximum manifold boost pressure by bypassing excess exhaust.' },
              ]
            : [
                { id: 'turbo-compressor-housing', label: 'COMPRESSOR VOLUTE HOUSING', category: 'AIR INDUCTION', description: 'Cast A356-T6 aluminum scroll converting Mach 0.8 airflow into 2.4 bar static boost via divergent volute geometry.' },
                { id: 'turbo-turbine-housing', label: 'TWIN-SCROLL TURBINE HOUSING', category: 'EXHAUST GAS', description: 'Ni-Resist D-5S ductile iron housing channeling 950°C pulse energy into dual divided scrolls without backflow.' },
                { id: 'turbo-chra-core', label: 'CHRA ROTATING ASSEMBLY', category: 'CORE KINEMATICS', description: 'Inconel 713C turbine & billet compressor wheel spinning at 220,000 RPM on a 0.025mm hydrodynamic oil wedge.' },
                { id: 'turbo-wastegate-actuator', label: 'PNEUMATIC WASTEGATE ACTUATOR', category: 'BOOST CONTROL', description: 'Pre-calibrated spring diaphragm regulating maximum manifold boost pressure by bypassing excess exhaust.' },
                { id: 'turbo-heat-shield', label: 'INCONEL THERMAL HEAT SHIELD', category: 'THERMAL BARRIER', description: 'Formed Inconel radiant barrier isolating CHRA bearing housing from 950°C radiant exhaust heat.' },
              ];

          projectTargets(engineModel, targets);
        }
      }

      // ----------------------------------------------------------------------
      // CHAPTER 10 → 11: Engine → Motor Transition (p: 0.72 - 0.75)
      // ----------------------------------------------------------------------
      else if (p >= 0.72 && p < 0.75) {
        const transP = (p - 0.72) / 0.03;
        const easedTrans = smoothstep(0, 1, transP);

        if (transP < 0.45) {
          setActiveModelAndObject(engineModel || null, engineObj, 'car-engine');
        } else {
          setActiveModelAndObject(motorModel || null, motorObj, 'electric-motor');
        }

        if (engineModel && transP < 0.8) {
          engineModel.rootGroup.visible = true;
          engineModel.rootGroup.position.set(
            1.35,
            THREE.MathUtils.lerp(-0.55, 2.5, easedTrans),
            THREE.MathUtils.lerp(0, -18, easedTrans)
          );
          engineModel.rootGroup.scale.copy(engineBase).multiplyScalar(THREE.MathUtils.lerp(1.0, 0.25, easedTrans));
          applyModelExplode(engineModel, 1.0);
        }

        if (motorModel) {
          motorModel.rootGroup.visible = true;
          motorModel.rootGroup.position.set(
            THREE.MathUtils.lerp(0, -0.90, easedTrans),
            THREE.MathUtils.lerp(-3.0, -0.05, easedTrans),
            THREE.MathUtils.lerp(-18, 0, easedTrans)
          );
          motorModel.rootGroup.scale.copy(motorBase).multiplyScalar(THREE.MathUtils.lerp(0.35, 1.0, easedTrans));
          motorModel.rootGroup.rotation.y = THREE.MathUtils.lerp(-0.8, 0.4, easedTrans);
          applyModelExplode(motorModel, 0);
        }

        const camTarget = new THREE.Vector3().lerpVectors(engineExplodedCenter, motorAssembledCenter, easedTrans);
        const camDist = THREE.MathUtils.lerp(engineExplodedDist * 1.38, motorDist * 1.12, easedTrans);
        camera.position.set(camTarget.x, camTarget.y + THREE.MathUtils.lerp(0, 0.12, easedTrans), camTarget.z + camDist);
        camera.lookAt(camTarget);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 11: Electric Motor (p: 0.75 - 0.79)
      // ----------------------------------------------------------------------
      else if (p >= 0.75 && p < 0.79) {
        currentEditorialSide = 'right';
        setActiveModelAndObject(motorModel || null, motorObj, 'electric-motor');

        const motorExplodeP = (p - 0.75) / 0.04;
        const easedMotor = smoothstep(0, 1, motorExplodeP);

        const camTarget = new THREE.Vector3().lerpVectors(motorAssembledCenter, motorExplodedCenter, easedMotor);
        const camDist = THREE.MathUtils.lerp(motorDist, motorExplodedDist, easedMotor) * 1.12;
        camera.position.set(camTarget.x, camTarget.y + 0.12, camTarget.z + camDist);
        camera.lookAt(camTarget);
        camera.updateMatrixWorld(true);

        if (motorModel) {
          motorModel.rootGroup.visible = true;
          motorModel.rootGroup.scale.copy(motorBase);
          // Positioned in center-to-left zone (clear of right text panel "BRUSHLESS DC MOTOR")
          motorModel.rootGroup.position.set(-0.90, -0.05, 0);
          motorModel.rootGroup.rotation.y = 0.4 + motorExplodeP * 0.6;
          motorModel.rootGroup.rotation.x = 0.15;
          applyModelExplode(motorModel, easedMotor * 0.85);
          motorModel.rootGroup.updateMatrixWorld(true);

          // Dynamic progressive disclosure: curated up to 6 components on left flank away from right text
          const motorComponents = (activeObjectRef.current?.rootComponents && activeObjectRef.current.id === 'electric-motor' && activeObjectRef.current.rootComponents.length >= 6)
            ? activeObjectRef.current.rootComponents
            : electricMotorData.rootComponents;

          let targets = motorComponents
            .filter((c) => (c.revealThreshold ?? 0) <= motorExplodeP)
            .slice(0, 6)
            .map((c) => ({
              id: c.id,
              label: c.name.toUpperCase(),
              category: c.category.toUpperCase(),
              description: c.function,
            }));

          // Ensure bottom two components (base flange and rear bearing) are always present
          if (!targets.some((t) => t.id === 'base-flange')) {
            targets.push({
              id: 'base-flange',
              label: 'CNC BASE MOUNTING FLANGE',
              category: 'STRUCTURAL CHASSIS',
              description: 'Rigid CNC 6061-T6 aluminum base flange securing stator core and mounting motor to airframe.',
            });
          }
          if (!targets.some((t) => t.id === 'rear-bearing')) {
            targets.push({
              id: 'rear-bearing',
              label: 'REAR BALL BEARING & CIRCLIP',
              category: 'TRIBOLOGY & RETENTION',
              description: 'Secondary ABEC-7 deep groove ball bearing and shaft retaining circlip locking axial preload.',
            });
          }

          projectTargets(motorModel, targets);
        }
      }

      // ----------------------------------------------------------------------
      // CHAPTER 11 → 12: Motor → Pen Transition (p: 0.79 - 0.81)
      // ----------------------------------------------------------------------
      else if (p >= 0.79 && p < 0.81) {
        const transP = (p - 0.79) / 0.02;
        const easedTrans = smoothstep(0, 1, transP);

        if (transP < 0.45) {
          setActiveModelAndObject(motorModel || null, motorObj, 'electric-motor');
        } else {
          setActiveModelAndObject(penModel || null, penObj, 'ballpoint-pen');
        }

        if (motorModel && transP < 0.8) {
          motorModel.rootGroup.visible = true;
          motorModel.rootGroup.position.set(-0.75, THREE.MathUtils.lerp(0, 2.5, easedTrans), THREE.MathUtils.lerp(0, -18, easedTrans));
          motorModel.rootGroup.scale.copy(motorBase).multiplyScalar(THREE.MathUtils.lerp(1.0, 0.25, easedTrans));
          applyModelExplode(motorModel, 1.0);
        }

        if (penModel) {
          penModel.rootGroup.visible = true;
          penModel.rootGroup.position.set(0.42, THREE.MathUtils.lerp(-2.0, 0, easedTrans), THREE.MathUtils.lerp(-16, 0, easedTrans));
          penModel.rootGroup.scale.copy(penBase).multiplyScalar(THREE.MathUtils.lerp(0.25, 0.68, easedTrans));
          // Strictly upright standing orientation (pitch=0, roll=0, zero slant!)
          penModel.rootGroup.rotation.set(0, THREE.MathUtils.lerp(-0.4, 0.35, easedTrans), 0);
          // Arrives 100% un-exploded (assembled)
          applyPenExplode(penModel, 0.0);
        }

        const camTarget = new THREE.Vector3().lerpVectors(motorExplodedCenter, new THREE.Vector3(0.42, 0, 0), easedTrans);
        const camDist = THREE.MathUtils.lerp(motorExplodedDist * 1.12, 12.8, easedTrans);
        camera.position.set(camTarget.x, camTarget.y + THREE.MathUtils.lerp(0.12, 0, easedTrans), camTarget.z + camDist);
        camera.lookAt(camTarget);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 12: Ballpoint Pen (p: 0.805 - 0.85)
      // ----------------------------------------------------------------------
      else if (p >= 0.805 && p < 0.85) {
        currentEditorialSide = 'left';
        setActiveModelAndObject(penModel || null, penObj, 'ballpoint-pen');

        // Progressive Explosion on Scroll:
        // p in [0.805, 0.820]: Arrives completely UN-EXPLODED (assembled)
        // p in [0.820, 0.846]: Progressively deconstructs into full exploded CAD assembly
        const explodeNorm = Math.max(0, Math.min(1, (p - 0.820) / 0.026));
        const penExplodeFactor = smoothstep(0, 1, explodeNorm);

        // Camera smoothly adjusts framing from assembled (center Y=0, dist=12.8) to exploded (center Y=-0.65, dist=14.8)
        const camTargetY = THREE.MathUtils.lerp(0.0, -0.65, penExplodeFactor);
        const camTarget = new THREE.Vector3(0.42, camTargetY, 0);
        const camDist = THREE.MathUtils.lerp(12.8, 14.8, penExplodeFactor);
        camera.position.set(camTarget.x, camTarget.y, camDist);
        camera.lookAt(camTarget);
        camera.updateMatrixWorld(true);

        if (penModel) {
          penModel.rootGroup.visible = true;
          // Scale: 0.68 for slender, perfectly proportioned engineering specimen (strictly not enlarged)
          penModel.rootGroup.scale.copy(penBase).multiplyScalar(0.68);
          // Positioned safely clear of the left editorial text
          penModel.rootGroup.position.set(0.42, 0, 0);
          // Strictly upright vertical orientation (pitch=0, roll=0, zero slant!) with subtle yaw for 3D depth
          const penYaw = 0.35 + Math.sin(elapsed * 0.20) * 0.04;
          penModel.rootGroup.rotation.set(0, penYaw, 0);
          // Dynamically deconstructs on scroll: 0.0 un-exploded -> 1.0 exploded
          applyPenExplode(penModel, penExplodeFactor);
          penModel.rootGroup.updateMatrixWorld(true);

          // 4 clean callouts on the right flank (never cluttered, never reaching bottom buttons)
          const targets = penExplodeFactor < 0.35 ? [
            { id: 'pen-clip-actuator', label: 'SPRING-STEEL CLIP & PLUNGER', category: 'ACTUATION', description: 'Hardened spring steel pocket clip integrated with bistable click plunger.' },
            { id: 'pen-barrel', label: 'STAINLESS STEEL BARREL', category: 'CHASSIS', description: 'Deep-drawn AISI 304 cylindrical body with longitudinal satin-brush finish.' },
            { id: 'pen-grip-tip', label: 'RIBBED GRIP & NOSE CONE', category: 'ERGONOMICS', description: 'Precision Swiss-turned fluted front section housing the writing core.' },
          ] : [
            { id: 'pen-clip-actuator', label: 'SPRING-STEEL CLIP & PLUNGER', category: 'ACTUATION', description: 'Hardened spring steel pocket clip integrated with bistable click plunger.' },
            { id: 'pen-barrel', label: 'STAINLESS STEEL BARREL', category: 'CHASSIS', description: 'Deep-drawn AISI 304 cylindrical body with longitudinal satin-brush finish.' },
            { id: 'supplemental-return-spring', label: 'HELICAL RETURN SPRING', category: 'KINEMATICS', description: 'Cold-coiled ASTM A228 spring wire providing 2.8N return reset force.' },
            { id: 'pen-grip-tip', label: 'PRECISION TIP & NOSE CONE', category: 'MICRO-FLUIDICS', description: 'Swiss-turned brass socket housing 1.0mm rolling tungsten carbide sphere.' },
          ];

          projectTargets(penModel, targets);
        }
      }

      // ----------------------------------------------------------------------
      // CHAPTER 12 → 13: Pen Recedes // The Bridge: "Those Were Our Objects" (p: 0.85 - 0.885)
      // ----------------------------------------------------------------------
      else if (p >= 0.85 && p < 0.885) {
        setActiveModelAndObject(penModel || null, penObj, 'ballpoint-pen');

        const transP = (p - 0.85) / 0.035;
        const easedTrans = smoothstep(0, 1, transP);
        if (penModel && transP < 0.95) {
          penModel.rootGroup.visible = true;
          penModel.rootGroup.position.set(0.42, THREE.MathUtils.lerp(0, 2.0, easedTrans), THREE.MathUtils.lerp(0, -22, easedTrans));
          penModel.rootGroup.scale.copy(penBase).multiplyScalar(THREE.MathUtils.lerp(0.68, 0.15, easedTrans));
          penModel.rootGroup.rotation.set(0, 0.60, 0);
          applyPenExplode(penModel, 1.0);
        }
        camera.position.set(0, 0.1, THREE.MathUtils.lerp(14.8, penDist * 1.5, easedTrans));
        camera.lookAt(0, 0, 0);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 13: HOW THE ENGINE TAKES IT APART — 3D Visual Demonstration (p: 0.885 - 0.945)
      // ----------------------------------------------------------------------
      else if (p >= 0.885 && p < 0.945) {
        setActiveModelAndObject(droneModel || null, droneObj, 'drone');

        if (droneModel) {
          droneModel.rootGroup.visible = true;
          droneModel.rootGroup.position.set(0, 0, 0);

          if (p < 0.905) {
            // Step 01: UPLOAD (Assembled model rotates slowly)
            droneModel.rootGroup.scale.copy(droneBase);
            droneModel.rootGroup.rotation.y = time * 0.0006;
            droneModel.rootGroup.rotation.x = 0.15;
            applyModelExplode(droneModel, 0);
            camera.position.set(droneAssembledCenter.x, droneAssembledCenter.y + 0.1, droneAssembledCenter.z + droneDist);
            camera.lookAt(droneAssembledCenter);
          } else if (p < 0.925) {
            // Step 02 & 03: ANALYZE & DECONSTRUCT (Blossoming exploded view)
            const demoExplodeP = (p - 0.905) / 0.020;
            const easedDemo = smoothstep(0, 1, demoExplodeP);
            droneModel.rootGroup.scale.copy(droneBase);
            droneModel.rootGroup.rotation.y = time * 0.0006 + easedDemo * 0.4;
            droneModel.rootGroup.rotation.x = 0.15;
            applyModelExplode(droneModel, easedDemo);
            const camTarget = new THREE.Vector3().lerpVectors(droneAssembledCenter, droneExplodedCenter, easedDemo);
            const camDist = THREE.MathUtils.lerp(droneDist, droneExplodedDist, easedDemo);
            camera.position.set(camTarget.x, camTarget.y + 0.15, camTarget.z + camDist);
            camera.lookAt(camTarget);
          } else {
            // Step 04: EXPLORE (Clean cinematic background explosion behind the 4 pipeline cards)
            droneModel.rootGroup.scale.copy(droneBase);
            droneModel.rootGroup.rotation.y = time * 0.0003 + 0.4;
            droneModel.rootGroup.rotation.x = 0.15;
            applyModelExplode(droneModel, 1.0);
            const camTarget = droneExplodedCenter;
            camera.position.set(camTarget.x, camTarget.y + 0.15, camTarget.z + droneExplodedDist);
            camera.lookAt(camTarget);
            // Floating annotations intentionally REMOVED: Drone is purely a clean cinematic background
          }
        }
      }

      // ----------------------------------------------------------------------
      // CHAPTER 14: THE UPLOAD CLIMAX — "YOUR OBJECT" (p: 0.945 - 1.00)
      // ----------------------------------------------------------------------
      else if (p >= 0.945) {
        setActiveModelAndObject(null, null, null);

        const uploadRecedeP = Math.min((p - 0.945) / 0.035, 1);
        const easedRecede = smoothstep(0, 1, uploadRecedeP);
        if (droneModel && easedRecede < 0.98) {
          droneModel.rootGroup.visible = true;
          droneModel.rootGroup.position.set(0, THREE.MathUtils.lerp(0, 3.0, easedRecede), THREE.MathUtils.lerp(0, -28, easedRecede));
          droneModel.rootGroup.scale.copy(droneBase).multiplyScalar(THREE.MathUtils.lerp(1.0, 0.1, easedRecede));
          applyModelExplode(droneModel, 1.0);
        } else if (droneModel) {
          droneModel.rootGroup.visible = false;
        }
        camera.position.set(0, 0.15, THREE.MathUtils.lerp(droneExplodedDist, 18, easedRecede));
        camera.lookAt(0, 0, 0);
      }

      // ----------------------------------------------------------------------
      // 2. Direct DOM Annotation Overlay Updates (0 React Re-renders / 144Hz Smoothness)
      // ----------------------------------------------------------------------
      if (annSlotElementsRef.current.length === 0) {
        const slots: typeof annSlotElementsRef.current = [];
        for (let i = 0; i < 16; i++) {
          const group = document.getElementById(`ann-svg-group-${i}`) as unknown as SVGGElement | null;
          const polyline = document.getElementById(`ann-polyline-${i}`) as unknown as SVGPolylineElement | null;
          const circle = document.getElementById(`ann-circle-${i}`) as unknown as SVGCircleElement | null;
          const container = document.getElementById(`ann-dom-slot-${i}`) as HTMLDivElement | null;
          const cat = document.getElementById(`ann-slot-cat-${i}`) as HTMLElement | null;
          const title = document.getElementById(`ann-slot-title-${i}`) as HTMLElement | null;
          const desc = document.getElementById(`ann-slot-desc-${i}`) as HTMLElement | null;
          const badge = document.getElementById(`ann-slot-idx-${i}`) as HTMLElement | null;
          if (group && polyline && circle && container && title && desc) {
            slots.push({ group, polyline, circle, container, cat, title, desc, badge });
          }
        }
        annSlotElementsRef.current = slots;
      }

      const activeLayout = computeAdaptiveAnnotationLayout(
        rawTargets.slice(0, 16),
        window.innerWidth,
        window.innerHeight,
        currentEditorialSide
      );
      (window as unknown as { __lastRawTargets?: unknown; __lastActiveLayout?: unknown }).__lastRawTargets = rawTargets;
      (window as unknown as { __lastRawTargets?: unknown; __lastActiveLayout?: unknown }).__lastActiveLayout = activeLayout;

      const slots = annSlotElementsRef.current;
      const smoothedSlots = smoothedAnnotationsRef.current;
      const safeDelta = Math.min(Math.max(delta, 0.001), 0.05);

      // Stably match active annotations to slots by component ID (prevents cascading flicker)
      const assignedAnns: Array<ProjectedAnnotation | null> = new Array(slots.length).fill(null);
      const matchedAnnIds = new Set<string>();
      const freeSlots: number[] = [];

      // Pass 1: Keep existing active component IDs in their current slots
      for (let i = 0; i < slots.length; i++) {
        const curId = smoothedSlots[i]?.currentId;
        const match = curId ? activeLayout.find((a) => a.id === curId) : null;
        if (match) {
          assignedAnns[i] = match;
          matchedAnnIds.add(match.id);
        } else {
          freeSlots.push(i);
        }
      }

      // Pass 2: Assign new annotations to available free slots
      for (const ann of activeLayout) {
        if (!matchedAnnIds.has(ann.id) && freeSlots.length > 0) {
          const slotIdx = freeSlots.shift()!;
          assignedAnns[slotIdx] = ann;
          matchedAnnIds.add(ann.id);
        }
      }

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const smoothed = smoothedSlots[i];
        if (!slot || !smoothed) continue;

        const ann = assignedAnns[i];

        if (ann) {
          const annSide: 'left' | 'right' | 'south' | 'north' = ann.isNorth ? 'north' : (ann.isSouth ? 'south' : (ann.isLeft ? 'left' : 'right'));
          const sideSwapped = smoothed.side !== null && smoothed.side !== annSide;
          const idChanged = smoothed.currentId !== null && smoothed.currentId !== ann.id;

          if (smoothed.opacity < 0.05) {
            // Slot is currently invisible: snap immediately to target position & new metadata
            smoothed.currentId = ann.id;
            smoothed.side = annSide;
            smoothed.isSouth = !!ann.isSouth;
            smoothed.isNorth = !!ann.isNorth;
            smoothed.x = ann.x;
            smoothed.y = ann.y;
            smoothed.elbowX = ann.elbowX;
            smoothed.labelEdgeX = ann.labelEdgeX;
            smoothed.labelX = ann.labelX;
            smoothed.labelY = ann.labelY;
            smoothed.targetOpacity = 1.0;

            if (slot.badge && ann.orderIndex != null) {
              const badgeStr = String(ann.orderIndex).padStart(2, '0');
              if (slot.badge.textContent !== badgeStr) slot.badge.textContent = badgeStr;
            }
            if (slot.cat && slot.cat.textContent !== ann.category) slot.cat.textContent = ann.category;
            if (slot.title.textContent !== ann.label) slot.title.textContent = ann.label;
            if (slot.desc.textContent !== ann.description) slot.desc.textContent = ann.description;
          } else if (sideSwapped || idChanged) {
            // Target changed flank or component ID while visible: fade out cleanly before moving
            smoothed.targetOpacity = 0.0;
            if (smoothed.opacity < 0.08) {
              smoothed.currentId = ann.id;
              smoothed.side = annSide;
              smoothed.isSouth = !!ann.isSouth;
              smoothed.isNorth = !!ann.isNorth;
              smoothed.x = ann.x;
              smoothed.y = ann.y;
              smoothed.elbowX = ann.elbowX;
              smoothed.labelEdgeX = ann.labelEdgeX;
              smoothed.labelX = ann.labelX;
              smoothed.labelY = ann.labelY;
              smoothed.targetOpacity = 1.0;

              if (slot.badge && ann.orderIndex != null) {
                const badgeStr = String(ann.orderIndex).padStart(2, '0');
                if (slot.badge.textContent !== badgeStr) slot.badge.textContent = badgeStr;
              }
              if (slot.cat && slot.cat.textContent !== ann.category) slot.cat.textContent = ann.category;
              if (slot.title.textContent !== ann.label) slot.title.textContent = ann.label;
              if (slot.desc.textContent !== ann.description) slot.desc.textContent = ann.description;
            }
          } else {
            // Same target and same flank: smoothly track position with exponential decay
            smoothed.isSouth = !!ann.isSouth;
            smoothed.isNorth = !!ann.isNorth;
            const posDecay = 1.0 - Math.exp(-22.0 * safeDelta);
            smoothed.x += (ann.x - smoothed.x) * posDecay;
            smoothed.y += (ann.y - smoothed.y) * posDecay;
            smoothed.elbowX += (ann.elbowX - smoothed.elbowX) * posDecay;
            smoothed.labelEdgeX += (ann.labelEdgeX - smoothed.labelEdgeX) * posDecay;
            smoothed.labelX += (ann.labelX - smoothed.labelX) * posDecay;
            smoothed.labelY += (ann.labelY - smoothed.labelY) * posDecay;
            smoothed.targetOpacity = 1.0;

            if (slot.badge && ann.orderIndex != null) {
              const badgeStr = String(ann.orderIndex).padStart(2, '0');
              if (slot.badge.textContent !== badgeStr) slot.badge.textContent = badgeStr;
            }
            if (slot.cat && slot.cat.textContent !== ann.category) slot.cat.textContent = ann.category;
            if (slot.title.textContent !== ann.label) slot.title.textContent = ann.label;
            if (slot.desc.textContent !== ann.description) slot.desc.textContent = ann.description;
          }

          // Smoothly damp opacity toward targetOpacity
          const opDecay = 1.0 - Math.exp(-14.0 * safeDelta);
          smoothed.opacity += (smoothed.targetOpacity - smoothed.opacity) * opDecay;
        } else {
          // No target for this slot: fade out smoothly
          smoothed.targetOpacity = 0.0;
          const opDecay = 1.0 - Math.exp(-14.0 * safeDelta);
          smoothed.opacity += (0 - smoothed.opacity) * opDecay;
          if (smoothed.opacity < 0.01) {
            smoothed.opacity = 0;
            smoothed.currentId = null;
            smoothed.side = null;
            smoothed.isSouth = false;
            smoothed.isNorth = false;
          }
        }

        // Direct DOM write (0 React Re-renders / 144Hz Smoothness)
        if (smoothed.opacity <= 0.005) {
          slot.group.setAttribute('opacity', '0');
          slot.container.style.opacity = '0';
          slot.container.style.pointerEvents = 'none';
        } else {
          const opStr = smoothed.opacity.toFixed(3);
          slot.group.setAttribute('opacity', opStr);
          slot.circle.setAttribute('cx', smoothed.x.toFixed(1));
          slot.circle.setAttribute('cy', smoothed.y.toFixed(1));
          if (smoothed.isSouth) {
            const midY = smoothed.y + (smoothed.labelY - smoothed.y) * 0.45;
            slot.polyline.setAttribute(
              'points',
              `${smoothed.x.toFixed(1)},${smoothed.y.toFixed(1)} ${smoothed.x.toFixed(1)},${midY.toFixed(1)} ${smoothed.labelEdgeX.toFixed(1)},${midY.toFixed(1)} ${smoothed.labelEdgeX.toFixed(1)},${smoothed.labelY.toFixed(1)}`
            );
          } else if (smoothed.isNorth) {
            const cardBottomY = smoothed.labelY + 68;
            const midY = smoothed.y - (smoothed.y - cardBottomY) * 0.45;
            slot.polyline.setAttribute(
              'points',
              `${smoothed.x.toFixed(1)},${smoothed.y.toFixed(1)} ${smoothed.x.toFixed(1)},${midY.toFixed(1)} ${smoothed.labelEdgeX.toFixed(1)},${midY.toFixed(1)} ${smoothed.labelEdgeX.toFixed(1)},${cardBottomY.toFixed(1)}`
            );
          } else {
            slot.polyline.setAttribute(
              'points',
              `${smoothed.x.toFixed(1)},${smoothed.y.toFixed(1)} ${smoothed.elbowX.toFixed(1)},${smoothed.y.toFixed(1)} ${smoothed.labelEdgeX.toFixed(1)},${(smoothed.labelY + 28).toFixed(1)}`
            );
          }
          slot.container.style.opacity = opStr;
          slot.container.style.transform = `translate3d(${smoothed.labelX.toFixed(1)}px, ${smoothed.labelY.toFixed(1)}px, 0)`;
          slot.container.style.pointerEvents = smoothed.opacity > 0.5 ? 'auto' : 'none';
        }
      }

      // ----------------------------------------------------------------------
      // 3. High-Performance Two-Stage Raycasting & Component Hover (0 React Re-renders)
      // ----------------------------------------------------------------------
      if (camera && scene) {
        let activeModel: LoadedObjectResult | null = null;
        for (const m of models.values()) {
          if (m.rootGroup.visible) {
            activeModel = m;
            break;
          }
        }

        const scrollDelta = Math.abs(p - lastPickScrollPRef.current);
        const modelChanged = activeModel !== lastPickModelRef.current;
        const needsPicking = mouseMovedRef.current || scrollDelta > 0.0008 || modelChanged;

        if (needsPicking) {
          mouseMovedRef.current = false;
          lastPickScrollPRef.current = p;
          lastPickModelRef.current = activeModel;

          let bestComponent: LoadedComponentMeshInfo | null = null;
          let modelMeshHit = false;

          if (activeModel) {
            raycasterRef.current.setFromCamera(mouseRef.current, camera);

            // STAGE 1 — BROAD PHASE: Overall model bounding volume test (rejection in < 0.0001ms)
            const modelRoot = activeModel.rootGroup;
            let modelBounds = modelRoot.userData.modelBounds as THREE.Box3 | undefined;
            if (!modelBounds) {
              modelBounds = new THREE.Box3().setFromObject(modelRoot);
              modelRoot.userData.modelBounds = modelBounds;
            }

            const broadHit = raycasterRef.current.ray.intersectsBox(modelBounds);

            // STAGE 2 — COMPONENT / MESH PHASE: Strictly test actual visible geometry
            if (broadHit) {
              const interactiveMeshes: THREE.Mesh[] = modelRoot.userData.interactiveList || [];
              let intersects: THREE.Intersection[] = [];

              if (interactiveMeshes.length > 0) {
                intersects = raycasterRef.current.intersectObjects(interactiveMeshes, false);
              }
              if (intersects.length === 0) {
                intersects = raycasterRef.current.intersectObjects(modelRoot.children, true);
              }

              if (intersects.length > 0) {
                for (const hit of intersects) {
                  const mesh = hit.object as THREE.Mesh;
                  if (mesh.visible !== false) {
                    if (mesh.userData?.supplemental && !mesh.visible) continue;
                    modelMeshHit = true;
                    if (mesh.userData?.componentInfo) {
                      bestComponent = mesh.userData.componentInfo as LoadedComponentMeshInfo;
                      break; // Front-most valid component
                    }
                  }
                }
              }
            }
          }

          // Emit hover event ONLY when the target component actually changes (0 React Re-renders)
          const nextHoverKey = bestComponent
            ? bestComponent.componentId
            : (modelMeshHit ? 'model-body' : null);

          if (nextHoverKey !== currentHoverKeyRef.current) {
            currentHoverKeyRef.current = nextHoverKey;

            if (bestComponent) {
              hoveredMeshInfoRef.current = { info: bestComponent };
              window.dispatchEvent(
                new CustomEvent('component-hover', {
                  detail: {
                    name: bestComponent.displayName || bestComponent.componentId,
                    category: bestComponent.category || 'Mechanical',
                    action: 'CLICK TO OPEN STUDIO',
                  },
                })
              );
            } else if (modelMeshHit && activeObjectRef.current) {
              hoveredMeshInfoRef.current = { info: null };
              window.dispatchEvent(
                new CustomEvent('component-hover', {
                  detail: {
                    name: activeObjectRef.current.name,
                    category: 'Deconstructed 3D',
                    action: 'CLICK TO OPEN STUDIO',
                  },
                })
              );
            } else {
              hoveredMeshInfoRef.current = null;
              window.dispatchEvent(new CustomEvent('component-hover', { detail: null }));
            }
          }
        }
      }

      // Render WebGL frame
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [scrollYProgress]);

  // Helper: Horizontal-only explosion for the hero panoramic view
  // Constrains all component movement to primarily the Z-axis (engine thrust axis = horizontal after Y rotation)
  // Recreates the reference CAD visualization's clean linear spread matching Image 2 exactly
  const applyModelExplodeHorizontal = (model: LoadedObjectResult, factor: number) => {
    const elapsed = kinematicTimeRef.current;

    // Curated linear horizontal offsets along engine thrust axis matching Image 2 reference CAD
    // Reduced spacing on both flanks (Mark 1: left unison-to-shaft gap; Mark 2: right casing-to-fan cage gap)
    const HORIZONTAL_OFFSETS: Record<string, number> = {
      // Aft / Left Modules (Positive local Z -> moves to screen Left; Mark 1 gap reduced)
      'bolts_0': 10.5,
      'casing-fasteners': 10.5,
      'bolts_0_1': 10.5,
      'bearing-sump-hardware': 10.5,
      'plates_back_0': 8.8,
      'exhaust-mixer-nozzle': 8.8,
      'fins_0': 7.2,
      'turbine-nozzle-guide-vanes': 7.2,
      'flaps_ring_0': 5.8,
      'vsv-actuation-ring': 5.8,
      'clamps_0': 5.5,
      'casing-clamps': 5.5,
      'flaps_0': 5.2,
      'vsv-bleed-flaps': 5.2,
      'flaps_stabiliser_0': 4.8,
      'unison-linkages': 4.8,

      // Concentric Drive Shaft (bridges smoothly from turbine assembly into core)
      'tube_0': 1.2,
      'coaxial-drive-shaft': 1.2,

      // Core Modules (Around Center)
      'containers_spacers_0': 1.5,
      'gearbox-isolators': 1.5,
      'containers_0': 0.0,
      'accessory-gearbox': 0.0,
      'tubes002_0': -0.2,
      'lube-scavenge-lines': -0.2,
      'tubes001_0': 4.0,
      'tcc-cooling-ring': 4.0,
      'electronics_side_0': -0.3,
      'avionics-sensors': -0.3,
      'tubes_0': -0.4,
      'bleed-air-manifolds': -0.4,
      'electonics_side_1_0': -0.5,
      'ignition-harness': -0.5,
      'containers_small_0': -0.6,
      'fadec-computer': -0.6,
      'pipe_big_0': -0.8,
      'bypass-starter-pipe': -0.8,
      'turbine_hull_middle_0': -1.2,
      'compressor-casing': -1.2,
      'pistons_0': -1.5,
      'thrust-reverser-actuators': -1.5,

      // Front Casing & Nacelle (Negative local Z -> moves to screen Right)
      'turbine_hull_0': -3.5,
      'fan-containment-casing': -3.5,
      'fins_outside_0': -3.5,
      'nacelle-strakes': -3.5,
      'plates_0': -4.8,
      'combustor-heat-shields': -4.8,

      // Front Fan & Intake Module (Mark 2 gap reduced: fan cage & blades brought closer to casing)
      'grid_0': -6.8,
      'bypass-stator-grid': -6.8,
      'blades_0': -7.6,
      'fan-module': -7.6,
      'tube_middle_0': -8.2,
      'diffuser-combustor': -8.2,
      'tube_front_0': -9.2,
      'inlet-cowl': -9.2,
    };

    model.componentMap.forEach((info, id) => {
      if (info.nativeAnimated) return;
      const isSupplemental = Boolean(info.mesh.userData?.supplemental);
      if (isSupplemental) {
        info.mesh.visible = factor >= info.explodeStart;
      }
      let localT = 0;
      if (factor <= info.explodeStart) localT = 0;
      else if (factor >= info.explodeEnd) localT = 1;
      else localT = smoothstep(info.explodeStart, info.explodeEnd, factor);

      const targetOffsetZ = HORIZONTAL_OFFSETS[id] ?? HORIZONTAL_OFFSETS[info.mesh.name] ?? (info.explodeVector.z * 1.5);
      const horizVector = new THREE.Vector3(0, 0, targetOffsetZ);

      const meshes = (info.sourceMeshes && info.sourceMeshes.length > 0) ? info.sourceMeshes : [info.mesh];
      meshes.forEach((m) => {
        const basePos = (m.userData?.basePosition as THREE.Vector3) || info.basePosition;
        m.position.copy(basePos);
        m.position.addScaledVector(horizVector, localT);

        const baseRot = (m.userData?.baseRotation as THREE.Euler) || info.baseRotation;

        // Accurate Turbofan Rotordynamics: Fan disc spins around local Y axis (true spindle of wide-chord fan)
        if (id === 'fan-module' || id === 'blades_0' || m.name === 'blades_0') {
          m.rotation.x = baseRot.x;
          m.rotation.z = baseRot.z;
          m.rotation.y = baseRot.y + elapsed * 3.5;
        } else if (id === 'turbine-nozzle-guide-vanes' || id === 'fins_0' || m.name === 'fins_0') {
          m.rotation.x = baseRot.x;
          m.rotation.y = baseRot.y;
          m.rotation.z = baseRot.z + elapsed * 4.8;
        } else if (id === 'coaxial-drive-shaft' || id === 'tube_0' || m.name === 'tube_0') {
          m.rotation.x = baseRot.x;
          m.rotation.y = baseRot.y;
          m.rotation.z = baseRot.z + elapsed * 4.2;
        }
      });
    });
  };

  // Helper: Authentic coaxial breakdown of the ballpoint pen matching reference CAD visualization (Screenshot 2)
  const applyPenExplode = (model: LoadedObjectResult, factor: number) => {
    const eased = smoothstep(0, 1, Math.max(0, Math.min(1, factor)));

    model.componentMap.forEach((info, id) => {
      // Hide internal cam and cartridge so breakdown matches reference CAD visual exactly
      if (
        id.includes('cam') ||
        id === 'supplemental-click-cam' ||
        id.includes('cartridge') ||
        id === 'supplemental-ink-cartridge'
      ) {
        info.mesh.visible = false;
        if (info.sourceMeshes) {
          info.sourceMeshes.forEach((m) => (m.visible = false));
        }
        return;
      }

      const isSupplemental = Boolean(info.mesh.userData?.supplemental);
      if (isSupplemental) {
        info.mesh.visible = eased > 0.05;
      }

      let targetOffsetY = 0;
      if (id.includes('clip-actuator') || id === 'pen-clip-actuator' || id === 'Object_5') {
        targetOffsetY = 0.55 * eased;
      } else if (id.includes('barrel') || id === 'pen-barrel' || id === 'Object_4') {
        targetOffsetY = 0.0;
      } else if (id.includes('spring') || id === 'supplemental-return-spring') {
        targetOffsetY = -0.75 * eased;
      } else if ((id.includes('tip') && !id.includes('grip')) || id === 'supplemental-writing-tip') {
        targetOffsetY = -1.25 * eased;
      } else if (id.includes('ball') || id === 'supplemental-tungsten-ball') {
        targetOffsetY = -1.55 * eased;
      } else if (id.includes('grip') || id === 'pen-grip-tip' || id === 'Object_6') {
        targetOffsetY = -2.15 * eased;
      }

      const meshes = (info.sourceMeshes && info.sourceMeshes.length > 0) ? info.sourceMeshes : [info.mesh];
      meshes.forEach((m) => {
        const basePos = (m.userData?.basePosition as THREE.Vector3) || info.basePosition;
        m.position.set(basePos.x, basePos.y + targetOffsetY, basePos.z);
      });
    });
  };

  // Helper: Apply physical component deconstruction with layered procedural kinematics
  const applyModelExplode = (model: LoadedObjectResult, factor: number) => {
    const elapsed = kinematicTimeRef.current;
    model.componentMap.forEach((info, id) => {
      if (info.nativeAnimated) return;
      const isSupplemental = Boolean(info.mesh.userData?.supplemental);
      if (isSupplemental) {
        info.mesh.visible = factor >= info.explodeStart;
      }
      let localT = 0;
      if (factor <= info.explodeStart) localT = 0;
      else if (factor >= info.explodeEnd) localT = 1;
      else localT = smoothstep(info.explodeStart, info.explodeEnd, factor);

      const meshes = (info.sourceMeshes && info.sourceMeshes.length > 0) ? info.sourceMeshes : [info.mesh];
      meshes.forEach((m) => {
        const basePos = (m.userData?.basePosition as THREE.Vector3) || info.basePosition;
        m.position.copy(basePos);
        m.position.addScaledVector(info.explodeVector, localT);
      });

      // Layer mechanical micro-motion directly on top of exploded pose so explosion never wipes out translation
      if (id.includes('cam') || id === 'supplemental-click-cam') {
        meshes.forEach((m) => {
          m.position.y += Math.sin(elapsed * 2.0) * 0.015;
        });
      } else if (id.includes('clip-actuator') || id === 'pen-clip-actuator' || id === 'pen_1') {
        meshes.forEach((m) => {
          m.position.y += Math.sin(elapsed * 2.0) * 0.012;
        });
      } else if (
        id === 'turbo-chra-core' ||
        id === 'turbo-compressor-inlet' ||
        id === 'turbo-exhaust-outlet' ||
        id.includes('chra') ||
        id.includes('compressor-inlet') ||
        id.includes('exhaust-outlet')
      ) {
        meshes.forEach((m) => {
          const baseRotZ = (m.userData?.baseRotation as THREE.Euler)?.z ?? info.baseRotation.z;
          m.rotation.z = baseRotZ + elapsed * 10;
        });
      } else if (id === 'turbo-wastegate-linkage' || id.includes('linkage')) {
        meshes.forEach((m) => {
          const baseRotZ = (m.userData?.baseRotation as THREE.Euler)?.z ?? info.baseRotation.z;
          m.rotation.z = baseRotZ + Math.sin(elapsed * 3.5) * 0.04;
        });
      }
    });
  };

  // File drop handler for custom model upload
  const handleDrop = (e: React.DragEvent) => {
    console.log(`[CLIENT][ImmersiveExperience.handleDrop] EVENT FIRED timestamp=${new Date().toISOString()}`);
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log(`[CLIENT][ImmersiveExperience.handleDrop] Calling onUploadModel with "${e.dataTransfer.files[0].name}"`);
      onUploadModel(e.dataTransfer.files[0]);
    }
  };

  // --------------------------------------------------------------------------
  // Framer Motion Transforms for Pinned Editorial Content (Spring-Smoothed)
  // --------------------------------------------------------------------------
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.2,
    restDelta: 0.0001,
  });

  // 01. Intro Hero — text positioned in the lower portion beneath the elevated turbine
  const introOpacity = useTransform(smoothScrollProgress, [0.00, 0.02, 0.065, 0.088], [1, 1, 0, 0]);
  const introY = useTransform(smoothScrollProgress, [0.00, 0.088], [0, -45]);
  const introBlur = useTransform(introOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const introDisplay = useTransform(introOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // Liquid Glass Overlay: Frosted glass sits below model initially, rises above on scroll
  const liquidGlassOpacity = useTransform(smoothScrollProgress, [0.00, 0.005, 0.045, 0.075], [0.92, 0.92, 0.5, 0]);
  const liquidGlassBlur = useTransform(smoothScrollProgress, [0.00, 0.045, 0.075], [16, 8, 0]);
  const liquidGlassY = useTransform(smoothScrollProgress, [0.00, 0.07], [0, -35]);
  const liquidGlassScale = useTransform(smoothScrollProgress, [0.00, 0.07], [1.0, 0.98]);
  const liquidGlassDisplay = useTransform(liquidGlassOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));
  // Z-index: starts at 4 (beneath canvas z-10), on scroll rises to 25 (above canvas z-10)
  const liquidGlassZ = useTransform(smoothScrollProgress, [0.00, 0.018, 0.042], [4, 12, 25]);

  // 02. Architectural Concept
  const conceptOpacity = useTransform(smoothScrollProgress, [0.065, 0.088, 0.128, 0.148], [0, 1, 1, 0]);
  const conceptY = useTransform(smoothScrollProgress, [0.065, 0.088, 0.128, 0.148], [30, 0, 0, -28]);
  const conceptBlur = useTransform(conceptOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const conceptScale = useTransform(smoothScrollProgress, [0.065, 0.088, 0.128, 0.148], [0.97, 1.0, 1.0, 0.98]);
  const conceptDisplay = useTransform(conceptOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 03. Watch Assembled (Mechanical Wristwatch)
  const watchTitleOpacity = useTransform(smoothScrollProgress, [0.128, 0.148, 0.188, 0.208], [0, 1, 1, 0]);
  const watchTitleY = useTransform(smoothScrollProgress, [0.128, 0.148, 0.188, 0.208], [32, 0, 0, -28]);
  const watchTitleBlur = useTransform(watchTitleOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const watchTitleScale = useTransform(smoothScrollProgress, [0.128, 0.148, 0.188, 0.208], [0.97, 1.0, 1.0, 0.98]);
  const watchTitleDisplay = useTransform(watchTitleOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 04. Watch Reveal
  const watchRevealOpacity = useTransform(smoothScrollProgress, [0.188, 0.208, 0.248, 0.268], [0, 1, 1, 0]);
  const watchRevealY = useTransform(smoothScrollProgress, [0.188, 0.208, 0.248, 0.268], [32, 0, 0, -28]);
  const watchRevealBlur = useTransform(watchRevealOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const watchRevealScale = useTransform(smoothScrollProgress, [0.188, 0.208, 0.248, 0.268], [0.97, 1.0, 1.0, 0.98]);
  const watchRevealDisplay = useTransform(watchRevealOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 05. Watch Deconstruction
  const watchDeconstructOpacity = useTransform(smoothScrollProgress, [0.248, 0.268, 0.345, 0.365], [0, 1, 1, 0]);
  const watchDeconstructY = useTransform(smoothScrollProgress, [0.248, 0.268, 0.345, 0.365], [32, 0, 0, -28]);
  const watchDeconstructBlur = useTransform(watchDeconstructOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const watchDeconstructScale = useTransform(smoothScrollProgress, [0.248, 0.268, 0.345, 0.365], [0.97, 1.0, 1.0, 0.98]);
  const watchDeconstructDisplay = useTransform(watchDeconstructOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 06. Watch -> Drone Transition
  const transitionWatchDroneOpacity = useTransform(smoothScrollProgress, [0.345, 0.365, 0.415, 0.435], [0, 1, 1, 0]);
  const transitionWatchDroneY = useTransform(smoothScrollProgress, [0.345, 0.365, 0.415, 0.435], [24, 0, 0, -24]);
  const transitionWatchDroneBlur = useTransform(transitionWatchDroneOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const transitionWatchDroneDisplay = useTransform(transitionWatchDroneOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 07. Drone Assembled
  const droneTitleOpacity = useTransform(smoothScrollProgress, [0.415, 0.435, 0.485, 0.505], [0, 1, 1, 0]);
  const droneTitleY = useTransform(smoothScrollProgress, [0.415, 0.435, 0.485, 0.505], [32, 0, 0, -28]);
  const droneTitleBlur = useTransform(droneTitleOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const droneTitleScale = useTransform(smoothScrollProgress, [0.415, 0.435, 0.485, 0.505], [0.97, 1.0, 1.0, 0.98]);
  const droneTitleDisplay = useTransform(droneTitleOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 08. Drone Deconstruction
  const droneDeconstructOpacity = useTransform(smoothScrollProgress, [0.485, 0.505, 0.605, 0.625], [0, 1, 1, 0]);
  const droneDeconstructY = useTransform(smoothScrollProgress, [0.485, 0.505, 0.605, 0.625], [32, 0, 0, -28]);
  const droneDeconstructBlur = useTransform(droneDeconstructOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const droneDeconstructScale = useTransform(smoothScrollProgress, [0.485, 0.505, 0.605, 0.625], [0.97, 1.0, 1.0, 0.98]);
  const droneDeconstructDisplay = useTransform(droneDeconstructOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 09. Drone -> Engine Transition
  const transitionDroneEngineOpacity = useTransform(smoothScrollProgress, [0.605, 0.625, 0.655, 0.675], [0, 1, 1, 0]);
  const transitionDroneEngineY = useTransform(smoothScrollProgress, [0.605, 0.625, 0.655, 0.675], [24, 0, 0, -24]);
  const transitionDroneEngineBlur = useTransform(transitionDroneEngineOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const transitionDroneEngineDisplay = useTransform(transitionDroneEngineOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 10. Turbocharged Engine
  const engineOpacity = useTransform(smoothScrollProgress, [0.655, 0.675, 0.725, 0.745], [0, 1, 1, 0]);
  const engineY = useTransform(smoothScrollProgress, [0.655, 0.675, 0.725, 0.745], [32, 0, 0, -28]);
  const engineBlur = useTransform(engineOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const engineScale = useTransform(smoothScrollProgress, [0.655, 0.675, 0.725, 0.745], [0.97, 1.0, 1.0, 0.98]);
  const engineDisplay = useTransform(engineOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 11. Electric Motor Assembled
  const motorTitleOpacity = useTransform(smoothScrollProgress, [0.725, 0.745, 0.768, 0.776], [0, 1, 1, 0]);
  const motorTitleY = useTransform(smoothScrollProgress, [0.725, 0.745, 0.768, 0.776], [28, 0, 0, -24]);
  const motorTitleBlur = useTransform(motorTitleOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const motorTitleDisplay = useTransform(motorTitleOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 11b. Electric Motor Deconstructed
  const motorDeconstructOpacity = useTransform(smoothScrollProgress, [0.776, 0.782, 0.795, 0.805], [0, 1, 1, 0]);
  const motorDeconstructY = useTransform(smoothScrollProgress, [0.776, 0.782, 0.795, 0.805], [20, 0, 0, -20]);
  const motorDeconstructBlur = useTransform(motorDeconstructOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const motorDeconstructDisplay = useTransform(motorDeconstructOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 12. Ballpoint Pen
  const penOpacity = useTransform(smoothScrollProgress, [0.798, 0.812, 0.842, 0.855], [0, 1, 1, 0]);
  const penY = useTransform(smoothScrollProgress, [0.798, 0.812, 0.842, 0.855], [32, 0, 0, -28]);
  const penBlur = useTransform(penOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const penScale = useTransform(smoothScrollProgress, [0.798, 0.812, 0.842, 0.855], [0.97, 1.0, 1.0, 0.98]);
  const penDisplay = useTransform(penOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 13. The Bridge: "Those Were Our Objects. Now try yours."
  const bridgeOpacity = useTransform(smoothScrollProgress, [0.85, 0.86, 0.88, 0.89], [0, 1, 1, 0]);
  const bridgeY = useTransform(smoothScrollProgress, [0.85, 0.89], [30, -30]);
  const bridgeBlur = useTransform(bridgeOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const bridgeDisplay = useTransform(bridgeOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

  // 14. The Sequential Story: "How The Engine Takes It Apart"
  const howItWorksOpacity = useTransform(smoothScrollProgress, [0.885, 0.895, 0.94, 0.948], [0, 1, 1, 0]);
  const howItWorksY = useTransform(smoothScrollProgress, [0.885, 0.948], [30, -30]);
  const howItWorksBlur = useTransform(howItWorksOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const howItWorksDisplay = useTransform(howItWorksOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));
  const howItWorksPointerEvents = useTransform(howItWorksOpacity, (v) => (v > 0.5 ? 'auto' : 'none'));

  // 15. The Climax: "Your Object."
  const uploadOpacity = useTransform(smoothScrollProgress, [0.945, 0.958, 1.00, 1.00], [0, 1, 1, 1]);
  const uploadY = useTransform(smoothScrollProgress, [0.945, 1.00], [35, 0]);
  const uploadBlur = useTransform(uploadOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const uploadDisplay = useTransform(uploadOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));
  const uploadPointerEvents = useTransform(uploadOpacity, (v) => (v > 0.5 ? 'auto' : 'none'));

  // State-based canvas click handling: Raycasts active 3D model and opens its studio
  const lastClickTimeRef = useRef(0);

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (!pointerDownPosRef.current) return;
    const dx = e.clientX - pointerDownPosRef.current.x;
    const dy = e.clientY - pointerDownPosRef.current.y;
    pointerDownPosRef.current = null;
    if (Math.hypot(dx, dy) > 12) return;

    handleCanvasClick(e.clientX, e.clientY);
  };

  const handleCanvasClick = (clientX?: number, clientY?: number) => {
    const now = performance.now();
    if (now - lastClickTimeRef.current < 200) return;
    lastClickTimeRef.current = now;

    const camera = cameraRef.current;
    const scene = sceneRef.current;
    const activeModel = activeModelRef.current;
    const activeObj = activeObjectRef.current;

    const cx = typeof clientX === 'number' ? clientX : window.innerWidth / 2;
    const cy = typeof clientY === 'number' ? clientY : window.innerHeight / 2;

    if (!camera || !scene) {
      console.log('[handleCanvasClick BAILED]', {
        hasCamera: !!camera,
        hasScene: !!scene,
      });
      return;
    }

    const mouseVec = new THREE.Vector2(
      (cx / window.innerWidth) * 2 - 1,
      -(cy / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec, camera);

    // 1. Raycast across all currently visible models in the scene to find exact clicked specimen
    let bestHit: { objectId: string; distance: number } | null = null;
    for (const [modelId, model] of modelsMapRef.current.entries()) {
      if (model.rootGroup.visible) {
        const interactiveMeshes: THREE.Mesh[] = model.rootGroup.userData.interactiveList || [];
        let hits: THREE.Intersection[] = [];

        if (interactiveMeshes.length > 0) {
          hits = raycaster.intersectObjects(interactiveMeshes, true);
        }
        if (hits.length === 0) {
          hits = raycaster.intersectObjects(model.rootGroup.children, true);
        }
        if (hits.length === 0) {
          hits = raycaster.intersectObject(model.rootGroup, true);
        }

        if (hits.length > 0) {
          if (!bestHit || hits[0].distance < bestHit.distance) {
            const hitMesh = hits[0].object;
            const hitObjectId =
              (hitMesh.userData?.objectId as string) ||
              (model.rootGroup.userData?.objectId as string) ||
              modelId;
            bestHit = { objectId: hitObjectId, distance: hits[0].distance };
          }
        }
      }
    }

    if (bestHit) {
      const targetObj = objects.find((o) => o.id === bestHit.objectId) || getObjectById(bestHit.objectId);
      if (targetObj) {
        console.log('[handleCanvasClick DIRECT HIT]', {
          hitId: bestHit.objectId,
          targetObjName: targetObj.name,
          cx,
          cy,
        });
        onSelectObject(targetObj);
        return;
      }
    }

    // 2. Broad-phase / proximity fallback for the active model:
    // If ray hits active model bounding box or click was within active model region
    if (activeModel && activeObj && activeModel.rootGroup.visible) {
      const box = new THREE.Box3().setFromObject(activeModel.rootGroup);
      box.expandByScalar(0.75);
      const hitPoint = new THREE.Vector3();
      const intersectsBoundingBox = raycaster.ray.intersectBox(box, hitPoint);

      const screenCenter = new THREE.Vector3();
      activeModel.rootGroup.getWorldPosition(screenCenter);
      screenCenter.project(camera);
      const screenX = ((screenCenter.x + 1) * window.innerWidth) / 2;
      const screenY = ((-screenCenter.y + 1) * window.innerHeight) / 2;
      const distPx = Math.hypot(cx - screenX, cy - screenY);
      const maxProximityPx = Math.min(window.innerWidth, window.innerHeight) * 0.45;

      if (intersectsBoundingBox || distPx < maxProximityPx) {
        console.log('[handleCanvasClick ACTIVE MODEL BOUNDS/PROXIMITY]', {
          activeObjName: activeObj.name,
          distPx,
          intersectsBoundingBox: !!intersectsBoundingBox,
          cx,
          cy,
        });
        onSelectObject(activeObj);
        return;
      }
    }
  };

  // Expose global click helper for automated QA verification
  useEffect(() => {
    (window as unknown as { __TRIGGER_MODEL_CLICK__?: (x?: number, y?: number) => void }).__TRIGGER_MODEL_CLICK__ = (x, y) => {
      handleCanvasClick(x, y);
    };
    return () => {
      delete (window as unknown as { __TRIGGER_MODEL_CLICK__?: (x?: number, y?: number) => void }).__TRIGGER_MODEL_CLICK__;
    };
  }, []);

  // --------------------------------------------------------------------------
  // 4. Render Layout & Story Chapters
  // --------------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      style={{ height: '1800vh' }}
      className="relative overflow-x-clip select-none text-[var(--text)] bg-transparent"
    >
      {/* -------------------------------------------------------------------- */}
      {/* Machine Plate Grounds (Smooth Organic Crossfade Behind WebGL Canvas) */}
      {/* -------------------------------------------------------------------- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="ground" data-plate="hero" />
        <div ref={watchGroundRef} className="ground" data-plate="watch" style={{ opacity: 0 }} />
        <div ref={droneGroundRef} className="ground" data-plate="drone" style={{ opacity: 0 }} />
        <div ref={turboGroundRef} className="ground" data-plate="turbo" style={{ opacity: 0 }} />
        <div ref={motorGroundRef} className="ground" data-plate="motor" style={{ opacity: 0 }} />
        <div ref={penGroundRef} className="ground" data-plate="pen" style={{ opacity: 0 }} />
        <div ref={uploadGroundRef} className="ground" data-plate="upload" style={{ opacity: 0 }} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Fixed Fullscreen Three.js Canvas with State-Based Click Routing */}
      {/* -------------------------------------------------------------------- */}
      <motion.div
        className="fixed inset-0 z-10 pointer-events-auto cursor-pointer"
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={handleCanvasPointerUp}
        onClick={(e) => handleCanvasClick(e.clientX, e.clientY)}
      >
        <canvas
          ref={canvasRef}
          onClick={(e) => handleCanvasClick(e.clientX, e.clientY)}
          className="w-full h-full block cursor-pointer"
        />
      </motion.div>

      {/* -------------------------------------------------------------------- */}
      {/* Liquid Glass Frosted Overlay — Sits below model initially, rises above on scroll */}
      {/* On scroll, rises above the canvas (z-index 25 > 10) creating a liquid glass depth effect */}
      {/* -------------------------------------------------------------------- */}
      <motion.div
        style={{
          opacity: liquidGlassOpacity,
          y: liquidGlassY,
          scale: liquidGlassScale,
          display: liquidGlassDisplay,
          zIndex: liquidGlassZ,
        }}
        className="fixed inset-x-0 bottom-0 h-[52vh] pointer-events-none"
      >
        <div
          className="w-full h-full relative overflow-hidden"
          style={{
            background: 'linear-gradient(to top, var(--current-ground, var(--carbon)) 0%, color-mix(in srgb, var(--current-ground, var(--carbon)) 88%, transparent) 45%, color-mix(in srgb, var(--current-ground, var(--carbon)) 35%, transparent) 75%, transparent 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            maskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)',
          }}
        >
          {/* Subtle liquid glass specular highlight rim */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* -------------------------------------------------------------------- */}
      {/* Precision 3D-to-Screen SVG Leader Lines (Section 5 & 7) */}
      {/* -------------------------------------------------------------------- */}
      <svg ref={annotationSvgRef} className="fixed inset-0 w-full h-full z-[15] pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <g key={i} id={`ann-svg-group-${i}`} opacity="0" style={{ transition: 'opacity 220ms ease-out' }}>
            <polyline
              id={`ann-polyline-${i}`}
              points="0,0 0,0 0,0"
              fill="none"
              stroke="var(--text)"
              strokeWidth="0.8"
              strokeDasharray="3 4"
              opacity="0.4"
            />
            <circle
              id={`ann-circle-${i}`}
              cx="0"
              cy="0"
              r="2.5"
              fill="var(--text)"
              stroke="var(--current-ground, #211e1c)"
              strokeWidth="0.8"
              opacity="0.7"
            />
          </g>
        ))}
      </svg>

      {/* -------------------------------------------------------------------- */}
      {/* Precision Part Callouts — Refined Editorial Annotation Cards         */}
      {/* -------------------------------------------------------------------- */}
      <div ref={annotationContainerRef} className="fixed inset-0 pointer-events-none z-[16]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            id={`ann-dom-slot-${i}`}
            onClick={() => {
              if (activeObjectRef.current) {
                onSelectObject(activeObjectRef.current);
              }
            }}
            className="absolute top-0 left-0 pointer-events-auto cursor-pointer opacity-0 will-change-transform select-none"
            style={{
              transform: 'translate3d(-999px, -999px, 0)',
              transition: 'opacity 220ms ease-out',
            }}
          >
            <div className="flex items-stretch rounded-[3px] bg-[var(--carbon)]/92 border border-[var(--text)]/18 shadow-[0_6px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl w-[240px] hover:border-[var(--text)]/40 hover:shadow-[0_8px_36px_rgba(0,0,0,0.55)] transition-all duration-200 group overflow-hidden">
              {/* Left accent bar */}
              <div className="w-[3px] shrink-0 bg-[var(--text)]/25 group-hover:bg-[var(--text)]/50 transition-colors duration-200" />
              <div className="flex items-start gap-2 px-3 py-2.5 min-w-0 flex-1">
                <span
                  id={`ann-slot-idx-${i}`}
                  className="w-[18px] h-[18px] mt-px shrink-0 rounded-[2px] border border-[var(--text)]/40 bg-[var(--text)]/8 flex items-center justify-center text-[9px] font-mono font-bold tabular-nums text-[var(--text)]/80 group-hover:border-[var(--text)]/65 transition-colors"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <span
                    id={`ann-slot-cat-${i}`}
                    className="block text-[8px] font-sans uppercase tracking-[0.16em] text-[var(--muted)] leading-none mb-1.5 truncate font-medium"
                  />
                  <span
                    id={`ann-slot-title-${i}`}
                    className="block text-[11.5px] font-sans font-semibold tracking-[0.04em] text-[var(--text)] leading-[1.3] break-words"
                  />
                  <div
                    id={`ann-slot-desc-${i}`}
                    className="text-[10.5px] font-serif italic text-[var(--muted)] leading-[1.45] mt-1 break-words opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Sticky Viewport Frame (Section 5 & 6) */}
      {/* -------------------------------------------------------------------- */}
      <div className="sticky top-0 h-screen h-[100dvh] w-full flex flex-col justify-between px-[clamp(1.25rem,4vw,3.5rem)] py-6 sm:py-8 z-30 pointer-events-none">
        {/* Top spacer to balance the bottom bar and keep center free */}
        <div className="w-full h-8" />

        {/* Narrative Layers Container */}
        <div className="relative w-full max-w-[1700px] mx-auto my-auto h-full flex items-center">
          {/* 01. INTRO HERO (Section 6: Bottom-Left aligned, strictly stacked) */}
          <motion.div
            style={{ opacity: introOpacity, y: introY, filter: introBlur, display: introDisplay }}
            className="absolute bottom-6 left-0 max-w-2xl flex flex-col items-start gap-4 pointer-events-auto select-none"
          >
            <h1 className="font-sans font-light text-[clamp(3.25rem,8.5vw,8.5rem)] leading-[0.92] tracking-[-0.03em] text-[var(--text)] text-balance">
              Deconstruct<br />the invisible
            </h1>
            <p className="font-serif text-[1.125rem] leading-[1.6] max-w-[44ch] text-[var(--muted)] text-pretty">
              Discover what&apos;s inside everyday objects, from materials to motion.
            </p>
          </motion.div>

          {/* 02. SYSTEM CONCEPT */}
          <motion.div
            style={{ opacity: conceptOpacity, y: conceptY, filter: conceptBlur, scale: conceptScale, display: conceptDisplay }}
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              Architectural decomposition
            </p>
            <h2 className="font-sans font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-4 text-balance">
              Every object<br />has a system
            </h2>
            <p className="font-serif text-[1.0625rem] leading-[1.55] max-w-[46ch] text-[var(--muted)] text-pretty">
              Physical machines are hierarchies of functional assemblies, structural load paths, and kinematic linkages. Scroll forward to open the movement.
            </p>
          </motion.div>

          {/* 03. WATCH ASSEMBLED */}
          <motion.div
            style={{
              opacity: watchTitleOpacity,
              y: watchTitleY,
              filter: watchTitleBlur,
              scale: watchTitleScale,
              display: watchTitleDisplay,
            }}
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              1 Horology
            </p>
            <h2 className="font-sans font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-6 text-balance">
              Mechanical wristwatch
            </h2>
            <div className="flex gap-8 text-[0.8125rem] font-sans border-t border-[var(--line)] pt-4 text-[var(--muted)]">
              <div>
                <div className="text-2xl sm:text-3xl font-light text-[var(--text)] tabular-nums">138</div>
                <div className="text-[0.75rem] mt-1 text-[var(--muted)]">Components</div>
              </div>
              <div className="w-px h-10 bg-[var(--line)]" />
              <div>
                <div className="text-2xl sm:text-3xl font-light text-[var(--text)] tabular-nums">68</div>
                <div className="text-[0.75rem] mt-1 text-[var(--muted)]">Moving parts</div>
              </div>
            </div>
          </motion.div>

          {/* 04. WATCH REVEAL */}
          <motion.div
            style={{
              opacity: watchRevealOpacity,
              y: watchRevealY,
              filter: watchRevealBlur,
              scale: watchRevealScale,
              display: watchRevealDisplay,
            }}
            className="absolute inset-y-0 right-0 flex flex-col justify-center max-w-md text-right pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              Precision in motion
            </p>
            <h3 className="font-sans font-light text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-3 text-balance">
              Exposing the movement
            </h3>
            <p className="font-serif text-[1rem] leading-[1.5] text-[var(--muted)] text-pretty">
              The stainless steel enclosure and sapphire crystal lift outward to reveal the multi-tiered mechanical movement within.
            </p>
          </motion.div>

          {/* 05. WATCH DECONSTRUCTION */}
          <motion.div
            style={{
              opacity: watchDeconstructOpacity,
              y: watchDeconstructY,
              filter: watchDeconstructBlur,
              scale: watchDeconstructScale,
              display: watchDeconstructDisplay,
            }}
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-md pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              Internal kinematics
            </p>
            <h3 className="font-sans font-light text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-3 text-balance">
              Wheel train and escapement
            </h3>
            <p className="font-serif text-[1rem] leading-[1.5] text-[var(--muted)] text-pretty mb-4">
              Stepped center, third, and fourth wheels multiply barrel torque toward the Swiss lever escapement and Glucydur balance wheel.
            </p>
            <p className="font-serif italic text-[0.875rem] text-[var(--muted)]">
              Hover your cursor over any exposed gear to examine its technical role.
            </p>
          </motion.div>

          {/* 06. WATCH -> DRONE TRANSITION */}
          <motion.div
            style={{
              opacity: transitionWatchDroneOpacity,
              y: transitionWatchDroneY,
              filter: transitionWatchDroneBlur,
              display: transitionWatchDroneDisplay,
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
          >
            <div className="space-y-1">
              <p className="text-[0.8125rem] font-sans text-[var(--muted)]">Transitioning plates</p>
              <p className="font-sans text-xl sm:text-2xl text-[var(--text)]">Horology to Aerospace robotics</p>
            </div>
          </motion.div>

          {/* 07. DRONE ASSEMBLED */}
          <motion.div
            style={{
              opacity: droneTitleOpacity,
              y: droneTitleY,
              filter: droneTitleBlur,
              scale: droneTitleScale,
              display: droneTitleDisplay,
            }}
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              2 Aerospace and robotics
            </p>
            <h2 className="font-sans font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-6 text-balance">
              Quadcopter aerial system
            </h2>
            <div className="flex gap-8 text-[0.8125rem] font-sans border-t border-[var(--line)] pt-4 text-[var(--muted)]">
              <div>
                <div className="text-2xl sm:text-3xl font-light text-[var(--text)] tabular-nums">15</div>
                <div className="text-[0.75rem] mt-1 text-[var(--muted)]">Subsystems</div>
              </div>
              <div className="w-px h-10 bg-[var(--line)]" />
              <div>
                <div className="text-2xl sm:text-3xl font-light text-[var(--text)] tabular-nums">16</div>
                <div className="text-[0.75rem] mt-1 text-[var(--muted)]">Moving parts</div>
              </div>
            </div>
          </motion.div>

          {/* 08. DRONE DECONSTRUCTION */}
          <motion.div
            style={{
              opacity: droneDeconstructOpacity,
              y: droneDeconstructY,
              filter: droneDeconstructBlur,
              scale: droneDeconstructScale,
              display: droneDeconstructDisplay,
            }}
            className="absolute inset-y-0 right-0 flex flex-col justify-center max-w-md text-right pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              Dynamic aerodynamics
            </p>
            <h3 className="font-sans font-light text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-3 text-balance">
              Propulsion and avionics
            </h3>
            <p className="font-serif text-[1rem] leading-[1.5] text-[var(--muted)] text-pretty mb-3">
              Four independent brushless motors and counter-rotating rotors separate above the central carbon airframe, isolating the flight electronics stack.
            </p>
            <p className="font-serif italic text-[0.875rem] text-[var(--muted)]">
              Rotor blades spin dynamically while assemblies separate.
            </p>
          </motion.div>

          {/* 09. DRONE -> ENGINE TRANSITION */}
          <motion.div
            style={{
              opacity: transitionDroneEngineOpacity,
              y: transitionDroneEngineY,
              filter: transitionDroneEngineBlur,
              display: transitionDroneEngineDisplay,
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
          >
            <div className="space-y-1">
              <p className="text-[0.8125rem] font-sans text-[var(--muted)]">Transitioning plates</p>
              <p className="font-sans text-xl sm:text-2xl text-[var(--text)]">Rotary aerodynamics to Forced induction</p>
            </div>
          </motion.div>

          {/* 10. TURBOCHARGED ENGINE */}
          <motion.div
            style={{
              opacity: engineOpacity,
              y: engineY,
              filter: engineBlur,
              scale: engineScale,
              display: engineDisplay,
            }}
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              3 Kinematics
            </p>
            <h2 className="font-sans font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-4 text-balance">
              Twin-scroll turbocharger
            </h2>

            <div className="grid grid-cols-4 gap-2 text-[0.8125rem] font-sans border-y border-[var(--line)] py-3 my-4">
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">220k</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Max RPM</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">2.4 bar</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Boost</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">950°C</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Exhaust gas</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">25 kW</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Turbine shaft</div>
              </div>
            </div>

            <p className="font-serif text-[1rem] leading-[1.5] text-[var(--muted)] text-pretty mb-3">
              High-enthalpy exhaust gas expands across an Inconel 713C turbine wheel, transferring 25 kW of kinetic shaft power to a forged A356-T6 aluminum compressor wheel. The divergent volute scroll converts Mach 0.8 airflow into 2.4 bar static boost.
            </p>
          </motion.div>

          {/* 11. ELECTRIC MOTOR ASSEMBLED */}
          <motion.div
            style={{
              opacity: motorTitleOpacity,
              y: motorTitleY,
              filter: motorTitleBlur,
              display: motorTitleDisplay,
            }}
            className="absolute inset-y-0 right-0 flex flex-col justify-center max-w-lg text-right pointer-events-none"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              4 Electromechanical dynamics
            </p>
            <h2 className="font-sans font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-4 text-balance">
              Brushless DC motor
            </h2>

            <div className="grid grid-cols-4 gap-2 text-[0.8125rem] font-sans border-y border-[var(--line)] py-3 my-4">
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">91.4%</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Efficiency</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">1.4 T</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Flux density</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">850 W</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Peak power</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">12N14P</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Topology</div>
              </div>
            </div>

            <p className="font-serif text-[1rem] leading-[1.5] text-[var(--muted)] text-pretty ml-auto">
              Permanent magnet synchronous outrunner motor utilizing electronic commutation to deliver high torque density with zero brush friction.
            </p>
          </motion.div>

          {/* 11b. ELECTRIC MOTOR DECONSTRUCTED */}
          <motion.div
            style={{
              opacity: motorDeconstructOpacity,
              y: motorDeconstructY,
              filter: motorDeconstructBlur,
              display: motorDeconstructDisplay,
            }}
            className="absolute inset-y-0 right-0 flex flex-col justify-center items-end text-right max-w-lg pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              Deconstructed interface
            </p>
            <h3 className="font-sans font-light text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-3 text-balance">
              12-pole stator assembly
            </h3>
            <p className="font-serif text-[1rem] leading-[1.5] text-[var(--muted)] text-pretty max-w-md mb-3">
              Rotational commutation decoupled into discrete electromagnetic sub-assemblies. Continuous 3-phase AC excitation generating 91.4% peak energy conversion.
            </p>
            <p className="font-serif italic text-[0.875rem] text-[var(--muted)]">
              Insulated 0.20mm silicon steel suppressing eddy current losses.
            </p>
          </motion.div>

          {/* 12. BALLPOINT PEN */}
          <motion.div
            style={{
              opacity: penOpacity,
              y: penY,
              filter: penBlur,
              scale: penScale,
              display: penDisplay,
            }}
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl pointer-events-auto"
          >
            <p className="text-[0.8125rem] font-sans text-[var(--muted)] mb-2">
              5 Micro-scale fluidics
            </p>
            <h2 className="font-sans font-light text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text)] mb-4 text-balance">
              Ballpoint mechanism
            </h2>

            <div className="grid grid-cols-4 gap-2 text-[0.8125rem] font-sans border-y border-[var(--line)] py-3 my-4">
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">Ø 1.0mm</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Carbide ball</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">±0.5 µm</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Sphericity</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">10k cP</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Thixotropic</div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-light text-[var(--text)] tabular-nums">3.5 N</div>
                <div className="text-[0.75rem] text-[var(--muted)]">Click latch</div>
              </div>
            </div>

            <p className="font-serif text-[1rem] leading-[1.5] text-[var(--muted)] text-pretty">
              High-viscosity paste ink is metered via a tungsten carbide sphere rolling in a brass socket. Non-Newtonian shear thinning enables smooth laydown.
            </p>
          </motion.div>

          {/* 13. THE BRIDGE */}
          <motion.div
            style={{ opacity: bridgeOpacity, y: bridgeY, filter: bridgeBlur, display: bridgeDisplay }}
            className="absolute inset-0 flex flex-col justify-center items-center text-center pointer-events-none"
          >
            <div className="space-y-4 max-w-2xl">
              <p className="text-[0.8125rem] font-sans text-[var(--muted)]">Archive sequence complete</p>
              <h2 className="font-sans font-light text-[clamp(2.8rem,6.5vw,5.5rem)] leading-[0.92] tracking-[-0.02em] text-[var(--text)]">
                Those were our objects.
              </h2>
              <p className="font-serif text-xl sm:text-2xl text-[var(--muted)]">
                Now try yours.
              </p>
            </div>
          </motion.div>

          {/* 14. HOW THE SYSTEM WORKS */}
          <motion.div
            style={{ opacity: howItWorksOpacity, y: howItWorksY, filter: howItWorksBlur, display: howItWorksDisplay, pointerEvents: howItWorksPointerEvents }}
            className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
          >
            <div className="max-w-4xl w-full">
              <div className="text-center space-y-2 mb-8">
                <p className="text-[0.8125rem] font-sans text-[var(--muted)]">Deconstruction pipeline</p>
                <h2 className="font-sans font-light text-3xl sm:text-5xl tracking-tight text-[var(--text)]">
                  How the engine resolves CAD
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-[2px] border border-[var(--line)] bg-[var(--current-ground,var(--carbon))]">
                  <span className="text-[0.75rem] font-sans tabular-nums text-[var(--muted)] block mb-2">01 Upload</span>
                  <h3 className="text-base font-sans font-medium text-[var(--text)] mb-1">Your GLB / GLTF</h3>
                  <p className="text-[0.875rem] font-serif text-[var(--muted)] leading-relaxed">
                    Drop any 3D asset directly from your desktop into the viewport.
                  </p>
                </div>

                <div className="p-5 rounded-[2px] border border-[var(--line)] bg-[var(--current-ground,var(--carbon))]">
                  <span className="text-[0.75rem] font-sans tabular-nums text-[var(--muted)] block mb-2">02 Analyze</span>
                  <h3 className="text-base font-sans font-medium text-[var(--text)] mb-1">Resolve geometry</h3>
                  <p className="text-[0.875rem] font-serif text-[var(--muted)] leading-relaxed">
                    In-browser CAD engine maps mesh hierarchies, centroids, and roles.
                  </p>
                </div>

                <div className="p-5 rounded-[2px] border border-[var(--line)] bg-[var(--current-ground,var(--carbon))]">
                  <span className="text-[0.75rem] font-sans tabular-nums text-[var(--muted)] block mb-2">03 Deconstruct</span>
                  <h3 className="text-base font-sans font-medium text-[var(--text)] mb-1">Exploded vectors</h3>
                  <p className="text-[0.875rem] font-serif text-[var(--muted)] leading-relaxed">
                    Components calculate outward radial vectors for synchronized explosion.
                  </p>
                </div>

                <div className="p-5 rounded-[2px] border border-[var(--line)] bg-[var(--current-ground,var(--carbon))]">
                  <span className="text-[0.75rem] font-sans tabular-nums text-[var(--muted)] block mb-2">04 Explore</span>
                  <h3 className="text-base font-sans font-medium text-[var(--text)] mb-1">Interactive studio</h3>
                  <p className="text-[0.875rem] font-serif text-[var(--muted)] leading-relaxed">
                    Inspect tolerances, query material classifications, and animate reassembly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 15. YOUR OBJECT // UPLOAD & SEARCH */}
          <motion.div
            style={{ opacity: uploadOpacity, y: uploadY, filter: uploadBlur, display: uploadDisplay, pointerEvents: uploadPointerEvents }}
            className="absolute inset-0 flex flex-col justify-center items-center text-center pointer-events-none overflow-y-auto"
          >
            <div className="max-w-2xl w-full space-y-6 my-auto pointer-events-auto relative p-6 sm:p-9 rounded-lg bg-[var(--current-ground,var(--carbon))]/85 backdrop-blur-md border border-[var(--line)] shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <div className="space-y-2">
                <p className="text-[0.8125rem] font-sans text-[var(--muted)] tracking-wider uppercase font-mono text-[11px]">System Ingestion Protocol</p>
                <h2 className="font-sans font-light text-3xl sm:text-5xl tracking-tight text-[var(--text)]">
                  Analyze your specimen
                </h2>
                <p className="font-serif text-[1rem] text-[var(--muted)] max-w-lg mx-auto">
                  Drop any .glb or .gltf assembly or enter mechanical queries below.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                data-upload-zone="true"
                data-upload-active="true"
                onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); uploadAuraWeightRef.current = 1.0; }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); uploadAuraWeightRef.current = 1.0; }}
                onDragLeave={() => { setIsDragOver(false); uploadAuraWeightRef.current = 0; }}
                onDrop={handleDrop}
                onMouseEnter={() => { uploadAuraWeightRef.current = 0.85; }}
                onMouseLeave={() => { if (!isDragOver) uploadAuraWeightRef.current = 0; }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-8 rounded-[4px] border-2 border-dashed transition-all duration-150 cursor-pointer ${
                  isDragOver
                    ? 'border-[var(--text)] bg-[color-mix(in_srgb,var(--text)_8%,transparent)] shadow-lg'
                    : 'border-[var(--line)] bg-[color-mix(in_srgb,var(--text)_2%,transparent)] hover:border-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUploadModel(file);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                  <div className="w-11 h-11 rounded-[3px] border border-[var(--line)] flex items-center justify-center text-[var(--text)] bg-[var(--current-ground,var(--carbon))] shadow-sm">
                    <Upload className="w-5 h-5 text-[#c2410c] dark:text-[#e27228]" />
                  </div>
                  <div>
                    <div className="text-[1rem] font-sans font-medium text-[var(--text)] mb-1">
                      Drop your 3D CAD model
                    </div>
                    <div className="text-[0.875rem] font-serif text-[var(--muted)]">
                      Release file here or <span className="underline text-[var(--text)] font-sans">browse local disk</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mechanism Synthesis Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim() && onSearchCustom) {
                    onSearchCustom(searchQuery.trim());
                  }
                }}
                className="rounded-[3px] border border-[var(--line)] p-2 flex items-center gap-2 w-full bg-[var(--current-ground,var(--carbon))] shadow-sm"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Or enter mechanism: e.g. High-Bypass Turbofan Engine, Mechanical Wristwatch..."
                  className="flex-1 min-w-0 bg-transparent px-3 py-1.5 text-[0.875rem] font-sans text-[var(--text)] placeholder-[var(--muted)] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="btn-plate btn-plate-filled text-[0.8125rem]"
                >
                  <span className="relative z-10 pointer-events-none">Analyze</span>
                </button>
              </form>

              {/* Quick Click Prompts */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-3xl">
                <span className="text-[0.8125rem] font-sans text-[var(--muted)]">
                  Suggested:
                </span>
                {objects.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(obj.name);
                      onSelectObject(obj);
                    }}
                    className="px-2.5 py-1 rounded-[3px] border border-[var(--line)] text-[0.8125rem] font-sans text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] active:scale-[0.98] transition-all cursor-pointer select-none"
                  >
                    + {obj.name}
                  </button>
                ))}
              </div>

              {/* Direct Launch Built-in Objects */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 max-w-3xl">
                {objects.map((obj, idx) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => onSelectObject(obj)}
                    className={`btn-plate ${idx === 0 ? 'btn-plate-filled' : ''}`}
                  >
                    <span className="relative z-10 pointer-events-none">Explore {obj.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Bottom Sequence Indicators & Actions (Section 5) */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end text-[0.8125rem] font-sans pb-[env(safe-area-inset-bottom)] pointer-events-none w-full">
          {/* Chapters List */}
          <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap select-none">
            <span className="text-[var(--muted)]">Chapters</span>
            <span className={`tabular-nums transition-colors duration-150 ${activeChapter === 1 ? 'text-[var(--text)] font-medium' : 'text-[var(--muted)]'}`}>
              <span className="opacity-70 mr-1.5">1</span>Horology
            </span>
            <span className={`tabular-nums transition-colors duration-150 ${activeChapter === 2 ? 'text-[var(--text)] font-medium' : 'text-[var(--muted)]'}`}>
              <span className="opacity-70 mr-1.5">2</span>Aerospace
            </span>
            <span className={`tabular-nums transition-colors duration-150 ${activeChapter === 3 ? 'text-[var(--text)] font-medium' : 'text-[var(--muted)]'}`}>
              <span className="opacity-70 mr-1.5">3</span>Kinematics
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pointer-events-auto flex-wrap">
            <button
              type="button"
              onClick={toggleMotionPause}
              title={isMotionPaused ? "Resume mechanical micro-motion (Space)" : "Pause mechanical micro-motion (Space)"}
              aria-label={isMotionPaused ? "Resume mechanical micro-motion" : "Pause mechanical micro-motion"}
              className="btn-plate"
            >
              <span>{isMotionPaused ? 'Resume motion' : 'Pause motion'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectObject(activeObjectRef.current || objects[0])}
              className="btn-plate btn-plate-filled"
            >
              <span>Launch studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

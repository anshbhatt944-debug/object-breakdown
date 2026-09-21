import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import * as THREE from 'three';
import Lenis from 'lenis';
import { ObjectBreakdownData } from '../../types/objectData';
import { electricMotorData } from '../../data/objects/electricMotor';
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

interface ChapterColors {
  primary: [number, number, number];
  secondary: [number, number, number];
  baseGlow: [number, number, number];
  intensity: number;
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

function getAtmospherePalette(p: number, isLight: boolean): ChapterColors {
  // Keyframe progression along the scroll story
  if (!isLight) {
    // DARK MODE: Obsidian, Navy, Cyan, Electric Blue
    if (p <= 0.12) {
      // Intro
      return { primary: [20, 50, 110], secondary: [10, 30, 70], baseGlow: [4, 10, 24], intensity: 0.35 };
    } else if (p <= 0.38) {
      // Watch & Horological Deconstruction
      const t = (p - 0.12) / 0.26;
      return {
        primary: lerpColor([20, 50, 110], [30, 75, 195], t),
        secondary: lerpColor([10, 30, 70], [6, 160, 215], t),
        baseGlow: lerpColor([4, 10, 24], [8, 22, 54], t),
        intensity: 0.35 + t * 0.12,
      };
    } else if (p <= 0.63) {
      // Drone Aerospace
      const t = (p - 0.38) / 0.25;
      return {
        primary: lerpColor([30, 75, 195], [15, 60, 165], t),
        secondary: lerpColor([6, 160, 215], [2, 132, 199], t),
        baseGlow: lerpColor([8, 22, 54], [6, 18, 44], t),
        intensity: 0.47 + t * 0.05,
      };
    } else if (p <= 0.74) {
      // Engine Industrial Power
      const t = (p - 0.63) / 0.11;
      return {
        primary: lerpColor([15, 60, 165], [45, 35, 115], t),
        secondary: lerpColor([2, 132, 199], [37, 99, 235], t),
        baseGlow: lerpColor([6, 18, 44], [12, 14, 38], t),
        intensity: 0.52 - t * 0.08,
      };
    } else if (p <= 0.81) {
      // Motor Electrodynamics
      const t = (p - 0.74) / 0.07;
      return {
        primary: lerpColor([45, 35, 115], [15, 110, 115], t),
        secondary: lerpColor([37, 99, 235], [2, 132, 199], t),
        baseGlow: lerpColor([12, 14, 38], [8, 22, 38], t),
        intensity: 0.44 + t * 0.03,
      };
    } else if (p <= 0.86) {
      // Pen Micro-Mechanics
      const t = (p - 0.81) / 0.05;
      return {
        primary: lerpColor([15, 110, 115], [28, 48, 80], t),
        secondary: lerpColor([2, 132, 199], [56, 189, 248], t),
        baseGlow: lerpColor([8, 22, 38], [8, 16, 30], t),
        intensity: 0.47 - t * 0.08,
      };
    } else if (p <= 0.93) {
      // Transition & How It Works Sequential Story
      const t = (p - 0.86) / 0.07;
      return {
        primary: lerpColor([28, 48, 80], [30, 70, 180], t),
        secondary: lerpColor([56, 189, 248], [6, 182, 212], t),
        baseGlow: lerpColor([8, 16, 30], [12, 24, 60], t),
        intensity: 0.39 + t * 0.20,
      };
    } else {
      // Upload Climax (Luminous, Welcoming, Receptor Aura)
      const t = Math.min((p - 0.93) / 0.07, 1);
      return {
        primary: lerpColor([30, 70, 180], [35, 80, 215], t),
        secondary: lerpColor([6, 182, 212], [0, 242, 173], t),
        baseGlow: lerpColor([12, 24, 60], [14, 28, 70], t),
        intensity: 0.59 + t * 0.12,
      };
    }
  } else {
    // LIGHT MODE: Architectural Silver, Crisp Cobalt, Clean Sky Cyan
    if (p <= 0.12) {
      return { primary: [215, 228, 245], secondary: [225, 232, 242], baseGlow: [238, 242, 248], intensity: 0.42 };
    } else if (p <= 0.38) {
      const t = (p - 0.12) / 0.26;
      return {
        primary: lerpColor([215, 228, 245], [195, 218, 252], t),
        secondary: lerpColor([225, 232, 242], [185, 225, 248], t),
        baseGlow: lerpColor([238, 242, 248], [230, 238, 248], t),
        intensity: 0.42 + t * 0.08,
      };
    } else if (p <= 0.63) {
      const t = (p - 0.38) / 0.25;
      return {
        primary: lerpColor([195, 218, 252], [186, 215, 248], t),
        secondary: lerpColor([185, 225, 248], [180, 220, 245], t),
        baseGlow: lerpColor([230, 238, 248], [228, 236, 246], t),
        intensity: 0.50,
      };
    } else if (p <= 0.74) {
      const t = (p - 0.63) / 0.11;
      return {
        primary: lerpColor([186, 215, 248], [210, 215, 248], t),
        secondary: lerpColor([180, 220, 245], [200, 215, 245], t),
        baseGlow: lerpColor([228, 236, 246], [232, 236, 244], t),
        intensity: 0.48,
      };
    } else if (p <= 0.81) {
      const t = (p - 0.74) / 0.07;
      return {
        primary: lerpColor([210, 215, 248], [200, 235, 242], t),
        secondary: lerpColor([200, 215, 245], [210, 230, 245], t),
        baseGlow: lerpColor([232, 236, 244], [235, 242, 248], t),
        intensity: 0.50,
      };
    } else if (p <= 0.86) {
      const t = (p - 0.81) / 0.05;
      return {
        primary: lerpColor([200, 235, 242], [225, 232, 242], t),
        secondary: lerpColor([210, 230, 245], [215, 228, 242], t),
        baseGlow: lerpColor([235, 242, 248], [238, 242, 248], t),
        intensity: 0.45,
      };
    } else if (p <= 0.93) {
      const t = (p - 0.86) / 0.07;
      return {
        primary: lerpColor([225, 232, 242], [190, 218, 252], t),
        secondary: lerpColor([215, 228, 242], [180, 225, 248], t),
        baseGlow: lerpColor([238, 242, 248], [230, 238, 248], t),
        intensity: 0.45 + t * 0.15,
      };
    } else {
      const t = Math.min((p - 0.93) / 0.07, 1);
      return {
        primary: lerpColor([190, 218, 252], [180, 215, 255], t),
        secondary: lerpColor([180, 225, 248], [160, 240, 210], t),
        baseGlow: lerpColor([230, 238, 248], [225, 236, 248], t),
        intensity: 0.60 + t * 0.10,
      };
    }
  }
}

function drawAtmosphereCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  p: number,
  dampedX: number,
  dampedY: number,
  velocity: number,
  uploadAura: number,
  isLight: boolean
) {
  ctx.clearRect(0, 0, w, h);

  const colors = getAtmospherePalette(p, isLight);
  const maxDim = Math.max(w, h);

  // Base background fill
  ctx.fillStyle = isLight ? '#f4f6f9' : '#020408';
  ctx.fillRect(0, 0, w, h);

  // Blend mode: screen in dark gives luminous light fields; multiply in light gives rich architectural tonal depth
  ctx.globalCompositeOperation = isLight ? 'multiply' : 'screen';

  // ---------------------------------------------------------------------------
  // Layer 1: Deep Environmental Foundation (Slow gentle orbital drift)
  // ---------------------------------------------------------------------------
  const l1X = w * (0.5 + 0.08 * Math.sin(time * 0.00014));
  const l1Y = h * (0.5 + 0.06 * Math.cos(time * 0.00017));
  const l1R = maxDim * 0.75;
  const grad1 = ctx.createRadialGradient(l1X, l1Y, 0, l1X, l1Y, l1R);
  const baseAlpha = (isLight ? 0.30 : 0.45) * colors.intensity;
  grad1.addColorStop(0, `rgba(${colors.baseGlow[0]}, ${colors.baseGlow[1]}, ${colors.baseGlow[2]}, ${baseAlpha})`);
  grad1.addColorStop(1, `rgba(${colors.baseGlow[0]}, ${colors.baseGlow[1]}, ${colors.baseGlow[2]}, 0)`);
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, w, h);

  // ---------------------------------------------------------------------------
  // Layer 2: Primary Fluid Electric-Blue Field (Physical Inertia & Mouse Tracking)
  // Stretches subtly along velocity axis, settles when stopped
  // ---------------------------------------------------------------------------
  const mouseInfluence = 0.36;
  const l2X = w * 0.5 + (dampedX - 0.5) * w * mouseInfluence;
  const velStretchY = Math.min(Math.max(velocity * 0.06, -100), 100);
  const l2Y = h * 0.5 + (dampedY - 0.5) * h * mouseInfluence + velStretchY;
  const l2R = maxDim * (0.42 + Math.min(Math.abs(velocity) * 0.0007, 0.12));
  const grad2 = ctx.createRadialGradient(l2X, l2Y, 0, l2X, l2Y, l2R);
  const primAlpha = (isLight ? 0.38 : 0.50) * colors.intensity;
  grad2.addColorStop(0, `rgba(${colors.primary[0]}, ${colors.primary[1]}, ${colors.primary[2]}, ${primAlpha})`);
  grad2.addColorStop(0.5, `rgba(${colors.primary[0]}, ${colors.primary[1]}, ${colors.primary[2]}, ${primAlpha * 0.4})`);
  grad2.addColorStop(1, `rgba(${colors.primary[0]}, ${colors.primary[1]}, ${colors.primary[2]}, 0)`);
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, w, h);

  // ---------------------------------------------------------------------------
  // Layer 3: Cool Cyan Secondary Field (Counter-Balanced & Upload Focus)
  // Pulls toward center dropzone area when uploadAura is active
  // ---------------------------------------------------------------------------
  const counterInfluence = 0.30;
  const dropCenterX = w * 0.5;
  const dropCenterY = h * 0.52;
  const rawL3X = w * 0.5 - (dampedX - 0.5) * w * counterInfluence;
  const rawL3Y = h * 0.5 - (dampedY - 0.5) * h * counterInfluence;
  const l3X = rawL3X + (dropCenterX - rawL3X) * uploadAura;
  const l3Y = rawL3Y + (dropCenterY - rawL3Y) * uploadAura;
  const l3R = maxDim * (0.34 + uploadAura * 0.22);
  const grad3 = ctx.createRadialGradient(l3X, l3Y, 0, l3X, l3Y, l3R);
  const secAlpha = (isLight ? 0.34 : 0.44) * colors.intensity * (1 + uploadAura * 0.55);
  grad3.addColorStop(0, `rgba(${colors.secondary[0]}, ${colors.secondary[1]}, ${colors.secondary[2]}, ${secAlpha})`);
  grad3.addColorStop(0.6, `rgba(${colors.secondary[0]}, ${colors.secondary[1]}, ${colors.secondary[2]}, ${secAlpha * 0.3})`);
  grad3.addColorStop(1, `rgba(${colors.secondary[0]}, ${colors.secondary[1]}, ${colors.secondary[2]}, 0)`);
  ctx.fillStyle = grad3;
  ctx.fillRect(0, 0, w, h);

  // ---------------------------------------------------------------------------
  // Layer 4: Subtle Depth Vignette (Preserves 3D Model Centroid Contrast)
  // ---------------------------------------------------------------------------
  ctx.globalCompositeOperation = 'source-over';
  const grad4 = ctx.createRadialGradient(w * 0.5, h * 0.5, maxDim * 0.22, w * 0.5, h * 0.5, maxDim * 0.74);
  if (!isLight) {
    grad4.addColorStop(0, 'rgba(2, 4, 8, 0)');
    grad4.addColorStop(0.65, 'rgba(2, 4, 8, 0.32)');
    grad4.addColorStop(1, 'rgba(2, 4, 8, 0.72)');
  } else {
    grad4.addColorStop(0, 'rgba(244, 246, 249, 0)');
    grad4.addColorStop(0.65, 'rgba(226, 232, 240, 0.28)');
    grad4.addColorStop(1, 'rgba(203, 213, 225, 0.60)');
  }
  ctx.fillStyle = grad4;
  ctx.fillRect(0, 0, w, h);
}

interface ImmersiveExperienceProps {
  objects: ObjectBreakdownData[];
  onSelectObject: (obj: ObjectBreakdownData) => void;
  onUploadModel: (file: File) => void;
  onSearchCustom?: (query: string) => void;
  theme?: 'light' | 'dark';
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
  editorialSide: 'left' | 'right' | 'none' = 'none'
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

  if (editorialSide === 'left') {
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

  const processSide = (list: typeof leftItems, isLeft: boolean): ProjectedAnnotation[] => {
    const textBlockWidth = 220;
    const minGap = list.length > 5 ? Math.max(50, Math.min(58, (viewportH * 0.76) / list.length)) : 64;
    const topLimit = Math.max(60, viewportH * 0.10);
    const bottomLimit = Math.min(viewportH - 60, viewportH * 0.90);

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
        labelY: item.y - 20,
        labelEdgeX,
        elbowX,
        orderIndex: idx + 1,
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

  return [...processSide(leftItems, true), ...processSide(rightItems, false)];
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

  // Active Object & Model Tracking for State-Based Routing (Wristwatch, Drone, Engine, Motor, Pen)
  const activeObjectRef = useRef<ObjectBreakdownData | null>(null);
  const activeModelRef = useRef<LoadedObjectResult | null>(null);
  const activeModelIdRef = useRef<string | null>(null);
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
    side: 'left' | 'right' | null;
  }>>(
    Array.from({ length: 12 }, () => ({
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
    }))
  );

  // Smooth Scroll Controller (Lenis) for Sub-Pixel 144Hz Physics & No Wheel Skips
  const lenisRef = useRef<Lenis | null>(null);

  // Atmospheric Canvas 2D Ref & Physically Damped Inertia State
  const atmosphereCanvasRef = useRef<HTMLCanvasElement | null>(null);
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

    // WebGL Renderer with alpha: true so living atmospheric canvas shines through
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

    // Precision Engineering Lighting Rig (Balanced to prevent metallic blowout)
    const ambientLight = new THREE.AmbientLight(0xffffff, isStartLight ? 0.75 : 0.45);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    // Key Light (Balanced contrast)
    const keyLight = new THREE.DirectionalLight(0xffffff, isStartLight ? 1.65 : 1.85);
    keyLight.position.set(6, 10, 8);
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    // Deep Fill
    const fillLight = new THREE.DirectionalLight(isStartLight ? 0x94a3b8 : 0x1e293b, isStartLight ? 1.2 : 0.9);
    fillLight.position.set(-6, -3, -4);
    fillLightRef.current = fillLight;
    scene.add(fillLight);

    // Electric Blue Rim Light
    const blueRimLight = new THREE.DirectionalLight(isStartLight ? 0x2563eb : 0x3b82f6, isStartLight ? 1.15 : 1.35);
    blueRimLight.position.set(-5, 4, -7);
    blueRimLightRef.current = blueRimLight;
    scene.add(blueRimLight);

    // Cool Cyan Rim Light
    const cyanRimLight = new THREE.DirectionalLight(isStartLight ? 0x0284c7 : 0x38bdf8, isStartLight ? 0.75 : 0.95);
    cyanRimLight.position.set(6, -2, -5);
    cyanRimLightRef.current = cyanRimLight;
    scene.add(cyanRimLight);

    // ------------------------------------------------------------------------
    // Load Models (Watch, Drone, Engine, Motor, Pen) with Dynamic Framing
    // ------------------------------------------------------------------------
    let isMounted = true;
    const loadModels = async () => {
      for (const obj of objects) {
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
      // Dynamic Theme Lighting & Background Transition (0-pop smooth lerp)
      // ----------------------------------------------------------------------
      const isCurrentLight = themeRef.current === 'light';
      const targetBgHex = isCurrentLight ? 0xf1f4f8 : 0x020408;
      const targetAmbInt = isCurrentLight ? 0.75 : 0.45;
      const targetKeyInt = isCurrentLight ? 1.65 : 1.85;
      const targetFillHex = isCurrentLight ? 0x94a3b8 : 0x1e293b;
      const targetFillInt = isCurrentLight ? 1.2 : 0.9;
      const targetRimBlueHex = isCurrentLight ? 0x2563eb : 0x3b82f6;
      const targetRimBlueInt = isCurrentLight ? 1.15 : 1.35;
      const targetRimCyanHex = isCurrentLight ? 0x0284c7 : 0x38bdf8;
      const targetRimCyanInt = isCurrentLight ? 0.75 : 0.95;
      const targetExposure = isCurrentLight ? 0.98 : 1.05;

      const themeLerpRate = Math.min(delta * 6, 0.25);

      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(_themeTargetBgColor.setHex(targetBgHex), themeLerpRate);
      }
      if (ambientLightRef.current) {
        ambientLightRef.current.intensity += (targetAmbInt - ambientLightRef.current.intensity) * themeLerpRate;
      }
      if (keyLightRef.current) {
        keyLightRef.current.intensity += (targetKeyInt - keyLightRef.current.intensity) * themeLerpRate;
      }
      if (fillLightRef.current) {
        fillLightRef.current.color.lerp(_themeTargetFillColor.setHex(targetFillHex), themeLerpRate);
        fillLightRef.current.intensity += (targetFillInt - fillLightRef.current.intensity) * themeLerpRate;
      }
      if (blueRimLightRef.current) {
        blueRimLightRef.current.color.lerp(_themeTargetRimBlueColor.setHex(targetRimBlueHex), themeLerpRate);
        blueRimLightRef.current.intensity += (targetRimBlueInt - blueRimLightRef.current.intensity) * themeLerpRate;
      }
      if (cyanRimLightRef.current) {
        cyanRimLightRef.current.color.lerp(_themeTargetRimCyanColor.setHex(targetRimCyanHex), themeLerpRate);
        cyanRimLightRef.current.intensity += (targetRimCyanInt - cyanRimLightRef.current.intensity) * themeLerpRate;
      }
      if (renderer) {
        renderer.toneMappingExposure += (targetExposure - renderer.toneMappingExposure) * themeLerpRate;
      }

      // ----------------------------------------------------------------------
      // Dynamic Living Multi-Layer Atmospheric Lighting Canvas (144Hz)
      // ----------------------------------------------------------------------
      const atmosCanvas = atmosphereCanvasRef.current;
      if (atmosCanvas) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (atmosCanvas.width !== w || atmosCanvas.height !== h) {
          atmosCanvas.width = w;
          atmosCanvas.height = h;
        }
        const ctx = atmosCanvas.getContext('2d');
        if (ctx) {
          // Read raw normalized pointer coordinates from global tracking or fallback
          const rawCoord = (window as unknown as { __mouseCoord?: { nx: number; ny: number } }).__mouseCoord;
          const targetMouseX = rawCoord ? rawCoord.nx : 0.5;
          const targetMouseY = rawCoord ? rawCoord.ny : 0.5;

          // Physically damped inertia: atmosphere has physical mass/fluid drag (cursor fast, atmosphere fluid)
          dampedMouseRef.current.x += (targetMouseX - dampedMouseRef.current.x) * 0.032;
          dampedMouseRef.current.y += (targetMouseY - dampedMouseRef.current.y) * 0.032;

          // Smooth velocity tracking
          const currentVel = lenisRef.current ? lenisRef.current.velocity : 0;
          dampedVelocityRef.current += (currentVel - dampedVelocityRef.current) * 0.08;

          drawAtmosphereCanvas(
            ctx,
            w,
            h,
            time,
            p,
            dampedMouseRef.current.x,
            dampedMouseRef.current.y,
            dampedVelocityRef.current,
            uploadAuraWeightRef.current,
            isCurrentLight
          );
        }
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

      // ----------------------------------------------------------------------
      // 1. Live Continuous Mechanical Motion (Visibility-Aware & Pausable)
      // ----------------------------------------------------------------------
      if (!isMotionPausedRef.current) {
        kinematicTimeRef.current += Math.min(delta, 0.05);
      }
      const elapsed = kinematicTimeRef.current;

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

      // Turbocharger Kinematic High-Speed Rotordynamics (Compressor Wheel, Turbine Wheel, and Connecting Shaft)
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
            // Unified rotating assembly: compressor wheel, turbine wheel, and connecting shaft spin continuously around Z
            meshes.forEach((m) => {
              const baseRotZ = (m.userData?.baseRotation as THREE.Euler)?.z ?? info.baseRotation.z;
              m.rotation.z = baseRotZ + elapsed * 10.0;
            });
          } else if (id === 'turbo-wastegate-linkage' || id.includes('linkage')) {
            // Pneumatic boost wastegate flapper bellcrank oscillation
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
      let currentEditorialSide: 'left' | 'right' | 'none' = 'none';

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
      // CHAPTER 01 & 02: Intro & Concept (p: 0.00 - 0.14)
      // ----------------------------------------------------------------------
      if (p < 0.14) {
        if (p < 0.035) {
          // Pure typographic hero with atmosphere: Watch is NOT visible behind "DECONSTRUCT THE INVISIBLE"
          activeObjectRef.current = null;
          activeModelRef.current = null;
          activeModelIdRef.current = null;
          if (watchModel) {
            watchModel.rootGroup.visible = false;
          }
          camera.position.set(
            watchAssembledCenter.x,
            watchAssembledCenter.y,
            watchAssembledCenter.z + watchDist * 2.5
          );
          camera.lookAt(watchAssembledCenter);
        } else {
          // Watch smoothly emerges from depth, scales up, centers, and arrives as visual hero
          activeObjectRef.current = objects[0];
          activeModelRef.current = watchModel || null;
          activeModelIdRef.current = 'wristwatch';

          const emergeP = smoothstep(0.035, 0.14, p);
          camera.position.set(
            watchAssembledCenter.x,
            watchAssembledCenter.y,
            watchAssembledCenter.z + THREE.MathUtils.lerp(watchDist * 2.5, watchDist * 1.15, emergeP)
          );
          camera.lookAt(watchAssembledCenter);

          if (watchModel) {
            watchModel.rootGroup.visible = true;
            watchModel.rootGroup.scale.copy(watchBase).multiplyScalar(THREE.MathUtils.lerp(0.35, 1.0, emergeP));
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
        activeObjectRef.current = objects[0];
        activeModelRef.current = watchModel || null;
        activeModelIdRef.current = 'wristwatch';

        if (watchModel) {
          watchModel.rootGroup.visible = true;
          watchModel.rootGroup.scale.copy(watchBase);
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
        activeObjectRef.current = objects[0];
        activeModelRef.current = watchModel || null;
        activeModelIdRef.current = 'wristwatch';

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
              { id: 'watch-balance-wheel', label: 'HARMONIC OSCILLATOR', category: 'REGULATION', description: 'Glucydur balance wheel & hairspring oscillating at 4 Hz' },
              { id: 'watch-escape-wheel', label: 'SWISS LEVER ESCAPEMENT', category: 'ESCAPEMENT', description: '15-tooth escape wheel with synthetic ruby pallet stones' },
              { id: 'watch-center-wheel', label: 'STEPPED WHEEL TRAIN', category: 'TRANSMISSION', description: 'Center wheel driving minute motion with stepped gear multiplier' },
              { id: 'watch-dial-bezel', label: 'DIAL CHAPTER RING', category: 'STRUCTURE', description: 'Machined 316L casing bezel with hour chapter track' },
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
        activeObjectRef.current = objects[0];
        activeModelRef.current = watchModel || null;
        activeModelIdRef.current = 'wristwatch';

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
                { id: 'watch-balance-wheel', label: 'HARMONIC OSCILLATOR', category: 'REGULATION', description: 'Glucydur balance wheel & hairspring oscillating at 4 Hz' },
                { id: 'watch-escape-wheel', label: 'SWISS LEVER ESCAPEMENT', category: 'ESCAPEMENT', description: '15-tooth escape wheel with synthetic ruby pallet stones' },
                { id: 'watch-center-wheel', label: 'STEPPED WHEEL TRAIN', category: 'TRANSMISSION', description: 'Center wheel driving minute motion with stepped gear multiplier' },
                { id: 'watch-ratchet-wheel', label: 'MAINSPRING RATCHET', category: 'ENERGY STORAGE', description: 'Winding ratchet wheel coupled to mainspring barrel' },
              ]
            : [
                { id: 'watch-balance-wheel', label: 'HARMONIC OSCILLATOR', category: 'REGULATION', description: 'Glucydur balance wheel & hairspring oscillating at 4 Hz' },
                { id: 'watch-escape-wheel', label: 'SWISS LEVER ESCAPEMENT', category: 'ESCAPEMENT', description: '15-tooth escape wheel with synthetic ruby pallet stones' },
                { id: 'watch-pallet-fork', label: 'STEEL PALLET FORK', category: 'ESCAPEMENT', description: 'Hardened pallet fork with synthetic ruby pallet stones' },
                { id: 'watch-center-wheel', label: 'STEPPED WHEEL TRAIN', category: 'TRANSMISSION', description: 'Center wheel driving minute motion with stepped gear multiplier' },
                { id: 'watch-ratchet-wheel', label: 'MAINSPRING RATCHET', category: 'ENERGY STORAGE', description: 'Winding ratchet wheel coupled to mainspring barrel' },
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
          activeObjectRef.current = objects[0];
          activeModelRef.current = watchModel || null;
          activeModelIdRef.current = 'wristwatch';
        } else {
          activeObjectRef.current = objects[1];
          activeModelRef.current = droneModel || null;
          activeModelIdRef.current = 'drone';
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
        activeObjectRef.current = objects[1];
        activeModelRef.current = droneModel || null;
        activeModelIdRef.current = 'drone';

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
            { id: 'drone-propeller-group', label: 'COUNTER-ROTATING PROPELLERS', category: 'PROPULSION', description: 'Fixed-pitch aerodynamic rotors generating dynamic lift' },
            { id: 'drone-motor-group', label: 'BRUSHLESS OUTRUNNERS', category: 'ACTUATION', description: '14-pole direct-drive electromagnetic brushless motors' },
            { id: 'drone-camera', label: 'GIMBAL IMAGING PAYLOAD', category: 'IMAGING PAYLOAD', description: '4K stabilized optical sensor with anti-vibration dampening' },
            { id: 'drone-landing-gear', label: 'COMPOSITE LANDING GEAR', category: 'LANDING STRUCTURE', description: 'High-modulus composite struts absorbing touchdown loads' },
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
        activeObjectRef.current = objects[1];
        activeModelRef.current = droneModel || null;
        activeModelIdRef.current = 'drone';

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

          // Curated 5 clean components on left flank with zero text overlap
          const targets = droneExplodeP < 0.35
            ? [
                { id: 'drone-propeller-group', label: 'COUNTER-ROTATING PROPELLERS', category: 'PROPULSION', description: 'Fixed-pitch aerodynamic rotors generating dynamic lift' },
                { id: 'drone-motor-group', label: 'BRUSHLESS OUTRUNNERS', category: 'ACTUATION', description: '14-pole direct-drive electromagnetic brushless motors' },
                { id: 'drone-flight-electronics', label: 'FLIGHT AVIONICS', category: 'AVIONICS', description: 'Attitude stabilization core with dual IMU and telemetry bus' },
                { id: 'drone-battery', label: 'RECHARGEABLE BATTERY', category: 'POWER SYSTEM', description: 'High-discharge lithium-polymer cell with balanced power bus' },
              ]
            : [
                { id: 'drone-propeller-group', label: 'COUNTER-ROTATING PROPELLERS', category: 'PROPULSION', description: 'Fixed-pitch aerodynamic rotors generating dynamic lift' },
                { id: 'drone-motor-group', label: 'BRUSHLESS OUTRUNNERS', category: 'ACTUATION', description: '14-pole direct-drive electromagnetic brushless motors' },
                { id: 'drone-flight-electronics', label: 'FLIGHT AVIONICS', category: 'AVIONICS', description: 'Attitude stabilization core with dual IMU and telemetry bus' },
                { id: 'drone-battery', label: 'RECHARGEABLE BATTERY', category: 'POWER SYSTEM', description: 'High-discharge lithium-polymer cell with balanced power bus' },
                { id: 'drone-camera', label: 'GIMBAL IMAGING PAYLOAD', category: 'IMAGING PAYLOAD', description: '4K stabilized optical sensor with anti-vibration dampening' },
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
          activeObjectRef.current = objects[1];
          activeModelRef.current = droneModel || null;
          activeModelIdRef.current = 'drone';
        } else {
          activeObjectRef.current = objects[2];
          activeModelRef.current = engineModel || null;
          activeModelIdRef.current = 'car-engine';
        }

        if (droneModel && transP < 0.8) {
          droneModel.rootGroup.visible = true;
          droneModel.rootGroup.position.set(0, THREE.MathUtils.lerp(0, 5.0, easedTrans), THREE.MathUtils.lerp(0, -18, easedTrans));
          droneModel.rootGroup.scale.copy(droneBase).multiplyScalar(THREE.MathUtils.lerp(1.0, 0.25, easedTrans));
        }

        if (engineModel) {
          engineModel.rootGroup.visible = true;
          // Sits directly in its intended final visual zone (x: 1.35, y: -0.55), comfortably below heading
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
        activeObjectRef.current = objects[2];
        activeModelRef.current = engineModel || null;
        activeModelIdRef.current = 'car-engine';

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
          // Positioned in center-to-right zone comfortably below heading "TWIN-SCROLL TURBOCHARGER"
          engineModel.rootGroup.position.set(1.35, -0.55, 0);
          engineModel.rootGroup.rotation.y = 0.3 + engineExplodeP * 0.4;
          engineModel.rootGroup.rotation.x = 0.1;
          applyModelExplode(engineModel, easedEngine * 0.85);
          engineModel.rootGroup.updateMatrixWorld(true);

          // Progressive disclosure: 2 -> 4 -> 5 components, all routed to right flank
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
          activeObjectRef.current = objects[2];
          activeModelRef.current = engineModel || null;
          activeModelIdRef.current = 'car-engine';
        } else {
          activeObjectRef.current = objects[3];
          activeModelRef.current = motorModel || null;
          activeModelIdRef.current = 'electric-motor';
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
        activeObjectRef.current = objects[3];
        activeModelRef.current = motorModel || null;
        activeModelIdRef.current = 'electric-motor';

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
          activeObjectRef.current = objects[3];
          activeModelRef.current = motorModel || null;
          activeModelIdRef.current = 'electric-motor';
        } else {
          activeObjectRef.current = objects[4];
          activeModelRef.current = penModel || null;
          activeModelIdRef.current = 'ballpoint-pen';
        }

        if (motorModel && transP < 0.8) {
          motorModel.rootGroup.visible = true;
          motorModel.rootGroup.position.set(-0.75, THREE.MathUtils.lerp(0, 2.5, easedTrans), THREE.MathUtils.lerp(0, -18, easedTrans));
          motorModel.rootGroup.scale.copy(motorBase).multiplyScalar(THREE.MathUtils.lerp(1.0, 0.25, easedTrans));
          applyModelExplode(motorModel, 1.0);
        }

        if (penModel) {
          penModel.rootGroup.visible = true;
          penModel.rootGroup.position.set(0.50, THREE.MathUtils.lerp(-2.0, 0, easedTrans), THREE.MathUtils.lerp(-16, 0, easedTrans));
          penModel.rootGroup.scale.copy(penBase).multiplyScalar(THREE.MathUtils.lerp(0.35, 1.0, easedTrans));
          // Vertical standing orientation (tip pointing downward, plunger at top)
          penModel.rootGroup.rotation.set(0.08, THREE.MathUtils.lerp(-0.4, 0.35, easedTrans), 0);
          applyModelExplode(penModel, 0);
        }

        const camTarget = new THREE.Vector3().lerpVectors(motorExplodedCenter, penAssembledCenter, easedTrans);
        const camDist = THREE.MathUtils.lerp(motorExplodedDist * 1.12, penDist * 1.45, easedTrans);
        camera.position.set(camTarget.x, camTarget.y + THREE.MathUtils.lerp(0.12, 0, easedTrans), camTarget.z + camDist);
        camera.lookAt(camTarget);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 12: Ballpoint Pen (p: 0.81 - 0.85)
      // ----------------------------------------------------------------------
      else if (p >= 0.81 && p < 0.85) {
        currentEditorialSide = 'left';
        activeObjectRef.current = objects[4];
        activeModelRef.current = penModel || null;
        activeModelIdRef.current = 'ballpoint-pen';

        const penExplodeP = (p - 0.81) / 0.04;
        const easedPen = smoothstep(0, 1, penExplodeP);

        const camTarget = new THREE.Vector3().lerpVectors(penAssembledCenter, penExplodedCenter, easedPen);
        // Backed up ~45% so vertical exploded components stay comfortably inside viewport bounds
        const camDist = THREE.MathUtils.lerp(penDist, penExplodedDist, easedPen) * 1.45;
        camera.position.set(camTarget.x, camTarget.y, camTarget.z + camDist);
        camera.lookAt(camTarget);
        camera.updateMatrixWorld(true);

        if (penModel) {
          penModel.rootGroup.visible = true;
          penModel.rootGroup.scale.copy(penBase);
          // Positioned in center-to-right zone (clear of left heading "BALLPOINT MECHANISM")
          penModel.rootGroup.position.set(0.50, 0, 0);
          // Vertical standing orientation (tip pointing downward, plunger at top)
          penModel.rootGroup.rotation.set(0.08, 0.35 + penExplodeP * 0.25, 0);
          applyModelExplode(penModel, easedPen * 0.36);
          penModel.rootGroup.updateMatrixWorld(true);

          // Progressive disclosure: 2 -> 4 curated components on right flank
          const targets = penExplodeP < 0.35
            ? [
                { id: 'pen-barrel', label: 'STAINLESS STEEL BARREL', category: 'CHASSIS', description: 'Deep-drawn AISI 304 austenitic stainless steel cylindrical body (0.40mm wall) with longitudinal satin-brush finish.' },
                { id: 'supplemental-writing-tip', label: 'PRECISION WRITING TIP', category: 'MICRO-FLUIDICS', description: 'Swiss-turned CuZn39Pb3 brass socket broached with 5 micro-capillary ink feed grooves (0.005mm clearance).' },
              ]
            : [
                { id: 'pen-barrel', label: 'STAINLESS STEEL BARREL', category: 'CHASSIS', description: 'Deep-drawn AISI 304 austenitic stainless steel cylindrical body (0.40mm wall) with longitudinal satin-brush finish.' },
                { id: 'pen-clip-actuator', label: 'SPRING-STEEL CLIP & PLUNGER', category: 'ACTUATION', description: 'Hardened spring steel pocket clip integrated with bistable indexing plunger transmitting tactile 3.5N force.' },
                { id: 'supplemental-writing-tip', label: 'PRECISION WRITING TIP', category: 'MICRO-FLUIDICS', description: 'Swiss-turned CuZn39Pb3 brass socket broached with 5 micro-capillary ink feed grooves (0.005mm clearance).' },
                { id: 'supplemental-ink-cartridge', label: 'CAPILLARY INK RESERVOIR', category: 'FLUIDICS', description: 'Extruded polypropylene tube maintaining high surface tension to prevent air bubbles and gravity leakage.' },
                { id: 'supplemental-return-spring', label: 'HELICAL RETURN SPRING', category: 'KINEMATICS', description: 'Cold-coiled ASTM A228 high-carbon musical spring wire providing 2.8N return force and 100,000-cycle fatigue life.' },
              ];

          projectTargets(penModel, targets);
        }
      }

      // ----------------------------------------------------------------------
      // CHAPTER 12 → 13: Pen Recedes // The Bridge: "Those Were Our Objects" (p: 0.85 - 0.885)
      // ----------------------------------------------------------------------
      else if (p >= 0.85 && p < 0.885) {
        activeObjectRef.current = objects[4];
        activeModelRef.current = penModel || null;
        activeModelIdRef.current = 'ballpoint-pen';

        const transP = (p - 0.85) / 0.035;
        const easedTrans = smoothstep(0, 1, transP);
        if (penModel && transP < 0.95) {
          penModel.rootGroup.visible = true;
          penModel.rootGroup.position.set(0.50, THREE.MathUtils.lerp(0, 2.0, easedTrans), THREE.MathUtils.lerp(0, -22, easedTrans));
          penModel.rootGroup.scale.copy(penBase).multiplyScalar(THREE.MathUtils.lerp(1.0, 0.15, easedTrans));
          penModel.rootGroup.rotation.set(0.08, 0.60, 0);
          applyModelExplode(penModel, 1.0);
        }
        camera.position.set(0, 0.1, THREE.MathUtils.lerp(penExplodedDist * 1.45, penDist * 1.5, easedTrans));
        camera.lookAt(0, 0, 0);
      }

      // ----------------------------------------------------------------------
      // CHAPTER 13: HOW THE ENGINE TAKES IT APART — 3D Visual Demonstration (p: 0.885 - 0.945)
      // ----------------------------------------------------------------------
      else if (p >= 0.885 && p < 0.945) {
        activeObjectRef.current = objects[1];
        activeModelRef.current = droneModel || null;
        activeModelIdRef.current = 'drone';

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
        activeModelRef.current = null;

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
        for (let i = 0; i < 12; i++) {
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
        rawTargets.slice(0, 12),
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
          const annSide: 'left' | 'right' = ann.isLeft ? 'left' : 'right';
          const sideSwapped = smoothed.side !== null && smoothed.side !== annSide;
          const idChanged = smoothed.currentId !== null && smoothed.currentId !== ann.id;

          if (smoothed.opacity < 0.05) {
            // Slot is currently invisible: snap immediately to target position & new metadata
            smoothed.currentId = ann.id;
            smoothed.side = annSide;
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
          slot.polyline.setAttribute(
            'points',
            `${smoothed.x.toFixed(1)},${smoothed.y.toFixed(1)} ${smoothed.elbowX.toFixed(1)},${smoothed.y.toFixed(1)} ${smoothed.labelEdgeX.toFixed(1)},${(smoothed.labelY + 22).toFixed(1)}`
          );
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
          m.position.x += Math.sin(elapsed * 2.0) * 0.015;
        });
      } else if (id.includes('clip-actuator') || id === 'pen-clip-actuator' || id === 'pen_1') {
        meshes.forEach((m) => {
          m.position.y += Math.sin(elapsed * 2.0) * 0.012;
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

  // 01. Intro Hero
  const introOpacity = useTransform(smoothScrollProgress, [0.00, 0.02, 0.065, 0.088], [1, 1, 0, 0]);
  const introY = useTransform(smoothScrollProgress, [0.00, 0.088], [0, -45]);
  const introBlur = useTransform(introOpacity, (o) => (o >= 0.98 ? 'none' : `blur(${((1 - Math.max(0, Math.min(1, o))) * 5).toFixed(1)}px)`));
  const introDisplay = useTransform(introOpacity, (v) => (v > 0.01 ? 'flex' : 'none'));

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

    if (!camera || !scene || !activeModel || !activeObj || !activeModel.rootGroup.visible) {
      console.log('[handleCanvasClick BAILED]', {
        hasCamera: !!camera,
        hasScene: !!scene,
        hasActiveModel: !!activeModel,
        hasActiveObj: !!activeObj,
        isVisible: activeModel?.rootGroup.visible,
      });
      return;
    }

    const mouseVec = new THREE.Vector2(
      (cx / window.innerWidth) * 2 - 1,
      -(cy / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec, camera);

    const interactiveMeshes: THREE.Mesh[] = activeModel.rootGroup.userData.interactiveList || [];
    let hits: THREE.Intersection[] = [];

    if (interactiveMeshes.length > 0) {
      hits = raycaster.intersectObjects(interactiveMeshes, true);
    }
    if (hits.length === 0) {
      hits = raycaster.intersectObjects(activeModel.rootGroup.children, true);
    }
    if (hits.length === 0) {
      hits = raycaster.intersectObject(activeModel.rootGroup, true);
    }

    console.log('[handleCanvasClick HIT CHECK]', {
      activeObjName: activeObj.name,
      hitsCount: hits.length,
      cx,
      cy
    });

    if (hits.length > 0) {
      onSelectObject(activeObj);
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
      className={`relative ${
        isLight ? 'bg-[#f4f6f9] text-[#0f172a] selection:bg-[#2563eb]/20' : 'bg-[#020408] text-white selection:bg-[#3b82f6]/30'
      } overflow-x-clip select-none transition-colors duration-300`}
    >
      {/* -------------------------------------------------------------------- */}
      {/* Fixed Fullscreen Living Multi-Layer Atmospheric Lighting Canvas (144Hz) */}
      {/* -------------------------------------------------------------------- */}
      <canvas
        ref={atmosphereCanvasRef}
        className="fixed inset-0 z-0 pointer-events-none w-full h-full block"
      />

      {/* -------------------------------------------------------------------- */}
      {/* Fixed Fullscreen Three.js Canvas with State-Based Click Routing */}
      {/* -------------------------------------------------------------------- */}
      <div
        className="fixed inset-0 z-[1] pointer-events-auto cursor-pointer"
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={handleCanvasPointerUp}
        onClick={(e) => handleCanvasClick(e.clientX, e.clientY)}
      >
        <canvas
          ref={canvasRef}
          onClick={(e) => handleCanvasClick(e.clientX, e.clientY)}
          className="w-full h-full block cursor-pointer"
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Subtle Background CAD Grid */}
      {/* -------------------------------------------------------------------- */}
      <div className={`fixed inset-0 z-[2] pointer-events-none cad-grid ${isLight ? 'opacity-20' : 'opacity-25'}`} />

      {/* -------------------------------------------------------------------- */}
      {/* Precision 3D-to-Screen SVG Leader Lines with 90-degree elbows (Pool of 12) */}
      {/* -------------------------------------------------------------------- */}
      <svg ref={annotationSvgRef} className="fixed inset-0 w-full h-full z-[15] pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} id={`ann-svg-group-${i}`} opacity="0" style={{ transition: 'opacity 180ms ease-out' }}>
            <polyline
              id={`ann-polyline-${i}`}
              points="0,0 0,0 0,0"
              fill="none"
              stroke={isLight ? '#0284c7' : '#38bdf8'}
              strokeWidth="1.0"
              strokeDasharray="2 2"
              opacity={isLight ? '0.85' : '0.75'}
            />
            <circle
              id={`ann-circle-${i}`}
              cx="0"
              cy="0"
              r="2.5"
              fill={isLight ? '#0284c7' : '#38bdf8'}
              stroke={isLight ? '#ffffff' : '#030712'}
              strokeWidth="1.2"
            />
          </g>
        ))}
      </svg>

      {/* Precision Minimalist Typography Labels Attached Directly to 3D Parts (Pool of 12) */}
      <div ref={annotationContainerRef} className="fixed inset-0 pointer-events-none z-[16]">
        {Array.from({ length: 12 }).map((_, i) => (
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
              transition: 'opacity 180ms ease-out',
            }}
          >
            <div className={`w-[220px] px-2.5 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-150 hover:scale-[1.02] ${
              isLight
                ? 'bg-white/92 border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-[#2563eb]/60'
                : 'bg-[#060b17]/85 border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:border-[#38bdf8]/60'
            }`}>
              <div className="flex items-center gap-1.5">
                <span
                  id={`ann-slot-idx-${i}`}
                  className={`text-[9px] font-mono font-bold tracking-wider ${
                    isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  id={`ann-slot-title-${i}`}
                  className={`text-[10px] font-mono font-bold tracking-wide uppercase leading-tight truncate flex-1 ${
                    isLight ? 'text-[#0f172a]' : 'text-white'
                  }`}
                />
              </div>
              <div
                id={`ann-slot-desc-${i}`}
                className={`text-[9px] font-mono leading-tight mt-1 line-clamp-2 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Sticky Top-0 Viewport: Holds All Dynamic Editorial Chapters */}
      {/* -------------------------------------------------------------------- */}
      <div className="sticky top-0 h-screen h-[100dvh] w-full flex flex-col justify-between p-4 sm:p-8 md:p-14 z-20 pointer-events-none">
        {/* Top Telemetry */}
        <div className={`flex justify-between items-center text-[10px] font-mono tracking-widest uppercase ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
              isMotionPaused ? 'bg-amber-400' : isLight ? 'bg-[#2563eb]' : 'bg-[#3b82f6]'
            }`} />
            <span className={isLight ? 'text-slate-800' : 'text-white/70'}>CINEMATIC 3D ATLAS</span>
            <span>•</span>
            <span className={`truncate max-w-[120px] xs:max-w-none ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              {isMotionPaused ? 'KINEMATICS: PAUSED' : 'DETERMINISTIC KINEMATICS'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-6">
            <span>[SCROLL TO DECONSTRUCT]</span>
            <span>[HOVER 3D MESH TO INSPECT]</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* EDITORIAL NARRATIVE LAYERS (Synchronized with 3D Object Motion) */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative w-full max-w-[1700px] mx-auto my-auto h-full flex items-center">
          {/* 01. INTRO HERO */}
          <motion.div
            style={{ opacity: introOpacity, y: introY, filter: introBlur, display: introDisplay }}
            className="absolute inset-0 flex flex-col justify-center items-center text-center px-4"
          >
            <div className="space-y-4">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full transition-all duration-300 ${
                isLight ? 'bg-blue-50/80 border border-blue-200/80 text-[#2563eb]' : 'bg-white/5 border border-white/10 text-[#3b82f6]'
              } text-[10px] font-mono tracking-widest uppercase`}>
                <Compass className="w-3.5 h-3.5" />
                <span>Object Breakdown Atlas</span>
              </div>
              <h1 className={`text-[clamp(3.5rem,9vw,8.5rem)] font-light leading-[0.88] tracking-tighter font-heading transition-all duration-300 ${
                isLight ? 'text-[#0f172a]' : 'text-white'
              }`}>
                DECONSTRUCT <br />
                <span className={
                  isLight
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-slate-400'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/20'
                }>
                  THE INVISIBLE
                </span>
              </h1>
              <p className={`text-xs sm:text-sm font-mono tracking-widest uppercase max-w-md mx-auto pt-4 transition-all duration-300 ${
                isLight ? 'text-slate-500' : 'text-white/40'
              }`}>
                Scroll to unveil physical systems layer by layer
              </p>
            </div>
          </motion.div>

          {/* 02. SYSTEM CONCEPT */}
          <motion.div
            style={{ opacity: conceptOpacity, y: conceptY, filter: conceptBlur, scale: conceptScale, display: conceptDisplay }}
            className="absolute inset-0 flex flex-col justify-center items-start max-w-2xl px-4"
          >
            <p className={`text-xs font-mono tracking-[0.3em] uppercase mb-3 transition-all duration-300 ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`}>
              00 // ARCHITECTURAL DECOMPOSITION
            </p>
            <h2 className={`text-[clamp(2.5rem,5.5vw,5rem)] font-light leading-[0.92] tracking-tighter mb-6 transition-all duration-300 ${
              isLight ? 'text-[#0f172a]' : 'text-white'
            }`}>
              EVERY OBJECT <br />
              HAS A SYSTEM.
            </h2>
            <p className={`text-sm sm:text-base font-mono leading-relaxed max-w-lg transition-all duration-300 ${
              isLight ? 'text-slate-600' : 'text-white/60'
            }`}>
              Physical machines are hierarchies of functional assemblies, structural paths, and kinematic linkages. Scroll forward to open the movement.
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
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl px-4 pointer-events-auto"
          >
            <p className={`text-xs font-mono tracking-[0.3em] uppercase mb-2 transition-all duration-300 ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`}>
              01 // HOROLOGICAL KINEMATICS
            </p>
            <h2 className={`text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[0.9] tracking-tighter mb-6 transition-all duration-300 ${
              isLight ? 'text-[#0f172a]' : 'text-white'
            }`}>
              MECHANICAL <br />
              WRISTWATCH
            </h2>
            <div className={`flex gap-8 text-xs font-mono border-t pt-4 transition-all duration-300 ${
              isLight ? 'text-slate-500 border-slate-200' : 'text-white/50 border-white/10'
            }`}>
              <div className="transition-transform duration-300 hover:translate-y-[-2px]">
                <div className={`text-2xl sm:text-3xl font-light ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>138</div>
                <div className="text-[10px] tracking-widest uppercase mt-1">COMPONENTS</div>
              </div>
              <div className={`w-px h-10 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div className="transition-transform duration-300 hover:translate-y-[-2px]">
                <div className={`text-2xl sm:text-3xl font-light ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>68</div>
                <div className="text-[10px] tracking-widest uppercase mt-1">MOVING PARTS</div>
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
            className="absolute inset-y-0 right-0 flex flex-col justify-center max-w-md text-right px-4 pointer-events-auto"
          >
            <p className={`text-xs font-mono tracking-[0.3em] uppercase mb-2 transition-all duration-300 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
              Phase 02 // Reveal
            </p>
            <h3 className={`text-3xl sm:text-5xl font-light tracking-tight mb-4 transition-all duration-300 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              PRECISION <br />
              IN MOTION
            </h3>
            <p className={`text-xs sm:text-sm font-mono leading-relaxed transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              The AISI 316L stainless steel enclosure and single-crystal sapphire crystal lift outward to reveal the multi-tiered mechanical movement within.
            </p>
          </motion.div>

          {/* 05. WATCH DECONSTRUCTION & SPATIAL ANNOTATIONS */}
          <motion.div
            style={{
              opacity: watchDeconstructOpacity,
              y: watchDeconstructY,
              filter: watchDeconstructBlur,
              scale: watchDeconstructScale,
              display: watchDeconstructDisplay,
            }}
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-md px-4 pointer-events-auto"
          >
            <p className={`text-xs font-mono tracking-[0.3em] uppercase mb-2 transition-all duration-300 ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`}>
              Phase 03 // Decomposition
            </p>
            <h3 className={`text-3xl sm:text-4xl font-light tracking-tight mb-3 transition-all duration-300 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              WHEEL TRAIN & ESCAPEMENT
            </h3>
            <p className={`text-xs sm:text-sm font-mono leading-relaxed mb-6 transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              Stepped center, third, and fourth wheels multiply barrel torque toward the Swiss lever escapement and Glucydur balance wheel.
            </p>
            <div className={`p-3.5 rounded-xl border font-mono text-[11px] space-y-1 transition-all duration-300 ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-700 shadow-sm'
                : 'bg-[#080f1d]/80 border-white/10 text-white/70'
            }`}>
              <div className={`${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'} font-bold`}>TACTILE 3D PICKING</div>
              <div>Hover your cursor over any exposed gear to examine its technical role.</div>
            </div>
          </motion.div>

          {/* 06. WATCH -> DRONE TRANSITION */}
          <motion.div
            style={{
              opacity: transitionWatchDroneOpacity,
              y: transitionWatchDroneY,
              filter: transitionWatchDroneBlur,
              display: transitionWatchDroneDisplay,
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
          >
            <div className="space-y-2">
              <div className={`text-[10px] font-mono tracking-[0.3em] uppercase transition-all duration-300 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                Transitioning Subsystems
              </div>
              <div className={`text-xl sm:text-2xl font-mono tracking-widest transition-all duration-300 ${isLight ? 'text-slate-800' : 'text-white/80'}`}>
                HOROLOGY → AEROSPACE ROBOTICS
              </div>
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
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl px-4 pointer-events-auto"
          >
            <p className={`text-xs font-mono tracking-[0.3em] uppercase mb-2 transition-all duration-300 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
              02 // AEROSPACE & ROBOTICS
            </p>
            <h2 className={`text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[0.9] tracking-tighter mb-6 transition-all duration-300 ${
              isLight ? 'text-[#0f172a]' : 'text-white'
            }`}>
              QUADCOPTER <br />
              AERIAL SYSTEM
            </h2>
            <div className={`flex gap-8 text-xs font-mono border-t pt-4 transition-all duration-300 ${
              isLight ? 'text-slate-500 border-slate-200' : 'text-white/50 border-white/10'
            }`}>
              <div className="transition-transform duration-300 hover:translate-y-[-2px]">
                <div className={`text-2xl sm:text-3xl font-light ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>15</div>
                <div className="text-[10px] tracking-widest uppercase mt-1">SUBSYSTEMS</div>
              </div>
              <div className={`w-px h-10 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div className="transition-transform duration-300 hover:translate-y-[-2px]">
                <div className={`text-2xl sm:text-3xl font-light ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>16</div>
                <div className="text-[10px] tracking-widest uppercase mt-1">MOVING PARTS</div>
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
            className={`absolute inset-y-0 right-0 flex flex-col justify-center max-w-md text-right px-6 py-6 rounded-2xl backdrop-blur-sm pointer-events-auto transition-all duration-300 ${
              isLight ? 'bg-white/40' : 'bg-[#020408]/40'
            }`}
          >
            <p className={`text-xs font-mono tracking-[0.3em] uppercase mb-2 transition-all duration-300 ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`}>
              Phase 04 // Dynamic Aerodynamics
            </p>
            <h3 className={`text-3xl sm:text-4xl font-light tracking-tight mb-3 transition-all duration-300 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              PROPULSION & AVIONICS
            </h3>
            <p className={`text-xs sm:text-sm font-mono leading-relaxed mb-4 transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              Four independent brushless motors and counter-rotating rotors separate above the central carbon airframe, isolating the flight electronics stack.
            </p>
            <div className={`inline-block p-3 rounded-xl border text-left font-mono text-[11px] transition-all duration-300 ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-700 shadow-sm'
                : 'bg-[#080f1d]/80 border-white/10 text-white/70'
            }`}>
              <div className={`${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'} font-bold`}>NATIVE EXPLODED POSE</div>
              <div>Rotor blades spin dynamically while assemblies separate.</div>
            </div>
          </motion.div>

          {/* 09. DRONE -> ENGINE TRANSITION */}
          <motion.div
            style={{
              opacity: transitionDroneEngineOpacity,
              y: transitionDroneEngineY,
              filter: transitionDroneEngineBlur,
              display: transitionDroneEngineDisplay,
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
          >
            <div className="space-y-2">
              <div className={`text-[10px] font-mono tracking-[0.3em] uppercase transition-all duration-300 ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`}>
                Transitioning Subsystems
              </div>
              <div className={`text-xl sm:text-2xl font-mono tracking-widest transition-all duration-300 ${isLight ? 'text-slate-800' : 'text-white/80'}`}>
                AEROSPACE → AUTOMOTIVE THERMODYNAMICS
              </div>
            </div>
          </motion.div>

          {/* 10. TURBOCHARGED ENGINE / TURBOCHARGER */}
          <motion.div
            style={{
              opacity: engineOpacity,
              y: engineY,
              filter: engineBlur,
              scale: engineScale,
              display: engineDisplay,
            }}
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl px-4 pointer-events-auto"
          >
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full w-fit mb-2 transition-all duration-300 ${
              isLight ? 'bg-blue-50/90 border border-blue-200 text-[#2563eb]' : 'bg-[#2563eb]/10 border border-[#2563eb]/30 text-[#38bdf8]'
            } text-[10px] font-mono tracking-widest uppercase`}>
              <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>03 // Forced Induction Thermodynamics</span>
            </div>

            <h2 className={`text-[clamp(2.2rem,4.5vw,4.2rem)] font-light leading-[0.92] tracking-tighter mb-3 transition-all duration-300 ${
              isLight ? 'text-[#0f172a]' : 'text-white'
            }`}>
              TWIN-SCROLL <br />
              <span className={isLight ? 'text-[#2563eb]' : 'text-[#38bdf8]'}>TURBOCHARGER</span>
            </h2>

            {/* 4-Stat Telemetry Strip */}
            <div className={`grid grid-cols-4 gap-2 text-xs font-mono border-y py-2.5 my-3 transition-all duration-300 ${
              isLight ? 'text-slate-500 border-slate-200/90' : 'text-white/50 border-white/10'
            }`}>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#2563eb]' : 'text-[#38bdf8]'}`}>220k</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">MAX RPM</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>2.4 BAR</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">BOOST</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono text-amber-500`}>950°C</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">EXHAUST</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>25 kW</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">TURBINE</div>
              </div>
            </div>

            <p className={`text-[11px] sm:text-xs font-mono leading-relaxed mb-3 max-w-lg transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
              High-enthalpy exhaust gas expands across an Inconel 713C turbine wheel, transferring 25 kW of kinetic shaft power to a forged A356-T6 aluminum compressor wheel. The divergent volute scroll converts Mach 0.8 airflow into 2.4 bar static boost.
            </p>

            {/* Info-Heavy Technical Specifications Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono mb-3">
              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  DIVIDED PULSE VOLUTE
                </div>
                <div className="leading-snug text-slate-400">
                  Separates alternating exhaust pulses (1-4 vs 2-3) to banish pulse collision and turbo lag.
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  HYDRODYNAMIC OIL WEDGE
                </div>
                <div className="leading-snug text-slate-400">
                  Fully-floating bronze journal bearing spinning on a 0.025 mm pressurized 4.5-bar oil film.
                </div>
              </div>
            </div>

            {/* Technical Subsystem Tags */}
            <div className={`flex flex-wrap gap-1.5 text-[9px] font-mono tracking-wider ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>INCONEL 713C</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>A356-T6 BILLET</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>WASTEGATE CONTROL</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>THERMAL RADIANT SHIELD</span>
            </div>
          </motion.div>

          {/* 11. ELECTRIC MOTOR ASSEMBLED */}
          <motion.div
            style={{
              opacity: motorTitleOpacity,
              y: motorTitleY,
              filter: motorTitleBlur,
              display: motorTitleDisplay,
            }}
            className="absolute inset-y-0 right-0 flex flex-col justify-center max-w-lg text-right px-4 pointer-events-none"
          >
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full w-fit ml-auto mb-2 transition-all duration-300 ${
              isLight ? 'bg-sky-50/90 border border-sky-200 text-[#0284c7]' : 'bg-[#0284c7]/10 border border-[#0284c7]/30 text-[#38bdf8]'
            } text-[10px] font-mono tracking-widest uppercase`}>
              <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>04 // Electromechanical Dynamics</span>
            </div>

            <h2 className={`text-[clamp(2.2rem,4.5vw,4.2rem)] font-light leading-[0.92] tracking-tighter mb-3 transition-all duration-300 ${
              isLight ? 'text-[#0f172a]' : 'text-white'
            }`}>
              BRUSHLESS <br />
              <span className={isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}>DC MOTOR</span>
            </h2>

            {/* 4-Stat Telemetry Strip */}
            <div className={`grid grid-cols-4 gap-2 text-xs font-mono border-y py-2.5 my-3 transition-all duration-300 ${
              isLight ? 'text-slate-500 border-slate-200/90' : 'text-white/50 border-white/10'
            }`}>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>91.4%</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">EFFICIENCY</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>1.4 T</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">FLUX DENSITY</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>850 W</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">PEAK POWER</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>12N14P</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">TOPOLOGY</div>
              </div>
            </div>

            <p className={`text-[11px] sm:text-xs font-mono leading-relaxed mb-3 max-w-md ml-auto transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
              Permanent magnet synchronous outrunner motor utilizing electronic commutation and 3-phase sinusoidal AC waveforms to generate a revolving magnetic field (RMF), delivering high torque density with zero brush friction.
            </p>

            {/* Info-Heavy Technical Specifications Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-left mb-3">
              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  0.20mm LAMINATIONS
                </div>
                <div className="leading-snug text-slate-400">
                  Insulated silicon steel stack suppresses eddy current losses (P_eddy ∝ t²) for &gt;91% conversion.
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  N52H RARE-EARTH POLES
                </div>
                <div className="leading-snug text-slate-400">
                  14 sintered curved neodymium magnets focused across an ultra-tight 0.25 mm dynamic air gap.
                </div>
              </div>
            </div>

            {/* Technical Subsystem Tags */}
            <div className={`flex flex-wrap justify-end gap-1.5 text-[9px] font-mono tracking-wider ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>CLASS H COPPER (200°C)</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>ABEC-7 TRIBOLOGY</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>FOC COMMUTATION</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>40,000 RPM MAX</span>
            </div>
          </motion.div>

          {/* 11b. ELECTRIC MOTOR DECONSTRUCTED - RIGHT-FLANK ENGINEERING CONSOLE */}
          <motion.div
            style={{
              opacity: motorDeconstructOpacity,
              y: motorDeconstructY,
              filter: motorDeconstructBlur,
              display: motorDeconstructDisplay,
            }}
            className="absolute inset-y-0 right-0 flex flex-col justify-center items-end text-right max-w-lg px-4 sm:px-8 pointer-events-auto"
          >
            {/* Phase Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300 ${
              isLight ? 'bg-blue-50/90 border border-blue-200 text-[#0284c7]' : 'bg-[#0284c7]/10 border border-[#0284c7]/30 text-[#38bdf8]'
            } text-[10px] font-mono tracking-widest uppercase mb-2`}>
              <Cpu className="w-3 h-3 text-[#38bdf8] animate-pulse" />
              <span>Phase 04 // Deconstructed</span>
            </div>

            <h3 className={`text-2xl sm:text-3xl font-light tracking-tight mb-1 transition-all duration-300 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              12-POLE STATOR INTERFACE
            </h3>
            <p className={`text-[11px] sm:text-xs font-mono max-w-md mb-2.5 transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
              Rotational commutation decoupled into discrete electromagnetic sub-assemblies. Continuous 3-phase AC excitation generating 91.4% peak energy conversion.
            </p>

            {/* 4-Stat Telemetry Strip */}
            <div className={`grid grid-cols-4 gap-2 text-xs font-mono border-y py-2.5 my-2 w-full max-w-md transition-all duration-300 ${
              isLight ? 'text-slate-500 border-slate-200/90' : 'text-white/50 border-white/10'
            }`}>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-lg font-light font-mono ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>91.4%</div>
                <div className="text-[8px] tracking-wider uppercase text-slate-400">EFFICIENCY</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-lg font-light font-mono ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>1.40 T</div>
                <div className="text-[8px] tracking-wider uppercase text-slate-400">FLUX DENSITY</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-lg font-light font-mono ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>850 W</div>
                <div className="text-[8px] tracking-wider uppercase text-slate-400">PEAK POWER</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-lg font-light font-mono ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>12N14P</div>
                <div className="text-[8px] tracking-wider uppercase text-slate-400">TOPOLOGY</div>
              </div>
            </div>

            {/* Electromechanical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-left w-full max-w-md my-2">
              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  0.20mm LAMINATIONS
                </div>
                <div className="leading-snug text-slate-400">
                  Insulated 20PNF1500 silicon steel suppressing eddy current dissipation (P_eddy ∝ t²).
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  CLASS H WINDINGS
                </div>
                <div className="leading-snug text-slate-400">
                  200°C thermal index OFC copper needle-wound for &gt;78% slot fill factor.
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  AIR-GAP TOLERANCE
                </div>
                <div className="leading-snug text-slate-400">
                  0.25 mm dynamic clearance with ±0.008 mm concentricity eliminating torque cogging.
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ABEC-7 TRIBOLOGY
                </div>
                <div className="leading-snug text-slate-400">
                  Cryogenic martensitic 52100 bearing races supporting up to 40,000 RPM.
                </div>
              </div>
            </div>

            {/* Live Electrical Telemetry Box */}
            <div className={`w-full max-w-md p-2.5 rounded-lg border backdrop-blur-sm my-1 text-left font-mono text-[9px] transition-all duration-200 ${
              isLight ? 'bg-white/85 border-slate-200 text-slate-700 shadow-sm' : 'bg-[#060b17]/80 border-white/10 text-white/75'
            }`}>
              <div className={`flex justify-between items-center text-[8px] tracking-widest font-bold uppercase mb-1.5 border-b pb-1 ${
                isLight ? 'text-[#0284c7] border-slate-200' : 'text-[#38bdf8] border-white/10'
              }`}>
                <span>ELECTRICAL COMMUTATION</span>
                <span>3-PHASE FOC TOPOLOGY</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 block text-[8px]">MOTOR KV</span>
                  <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>920 RPM/V</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px]">PHASE RESISTANCE</span>
                  <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>0.042 Ω</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px]">STATIC THRUST</span>
                  <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>4.2 kg Max</span>
                </div>
              </div>
            </div>

            {/* Subsystem Tags */}
            <div className={`flex flex-wrap justify-end gap-1.5 text-[9px] font-mono tracking-wider mt-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>CNC 6061-T6 BELL</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>NdFeB N52H POLES</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>DIN 471 CIRCLIP</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>ZERO COGGING</span>
            </div>
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
            className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-xl px-4 pointer-events-auto"
          >
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full w-fit mb-2 transition-all duration-300 ${
              isLight ? 'bg-blue-50/90 border border-blue-200 text-[#2563eb]' : 'bg-[#2563eb]/10 border border-[#2563eb]/30 text-[#38bdf8]'
            } text-[10px] font-mono tracking-widest uppercase`}>
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>05 // Micro-Scale Fluidics &amp; Kinematics</span>
            </div>

            <h2 className={`text-[clamp(2.2rem,4.5vw,4.2rem)] font-light leading-[0.92] tracking-tighter mb-3 transition-all duration-300 ${
              isLight ? 'text-[#0f172a]' : 'text-white'
            }`}>
              BALLPOINT <br />
              <span className={isLight ? 'text-[#2563eb]' : 'text-[#38bdf8]'}>MECHANISM</span>
            </h2>

            {/* 4-Stat Telemetry Strip */}
            <div className={`grid grid-cols-4 gap-2 text-xs font-mono border-y py-2.5 my-3 transition-all duration-300 ${
              isLight ? 'text-slate-500 border-slate-200/90' : 'text-white/50 border-white/10'
            }`}>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#2563eb]' : 'text-[#38bdf8]'}`}>Ø 1.0mm</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">CARBIDE BALL</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>±0.5 µm</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">SPHERICITY</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>10k cP</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">THIXOTROPIC</div>
              </div>
              <div className="transition-transform duration-200 hover:translate-y-[-1px]">
                <div className={`text-base sm:text-xl font-light font-mono ${isLight ? 'text-[#2563eb]' : 'text-[#38bdf8]'}`}>3.5 N</div>
                <div className="text-[9px] tracking-wider uppercase text-slate-400">CLICK LATCH</div>
              </div>
            </div>

            <p className={`text-[11px] sm:text-xs font-mono leading-relaxed mb-3 max-w-lg transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
              High-viscosity paste ink is metered via a tungsten carbide sphere rolling in a Swiss-machined CuZn39Pb3 brass socket. Non-Newtonian shear thinning enables smooth laydown while capillary forces prevent leakage.
            </p>

            {/* Info-Heavy Technical Specifications Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono mb-3">
              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#2563eb]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  THIXOTROPIC FLUIDICS
                </div>
                <div className="leading-snug text-slate-400">
                  Viscosity drops from 10,000 cP under rolling shear (τ = μ·γ̇) to flow, then solidifies instantly upon paper contact.
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                isLight ? 'bg-white/80 border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#080f1d]/75 border-white/10 text-white/75'
              }`}>
                <div className={`font-bold flex items-center gap-1.5 mb-0.5 ${isLight ? 'text-[#2563eb]' : 'text-[#38bdf8]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  BISTABLE ROTARY CAM
                </div>
                <div className="leading-snug text-slate-400">
                  Self-lubricating POM rotary cam converts axial plunger push into 45° stepped indexing with ASTM A228 spring return.
                </div>
              </div>
            </div>

            {/* Technical Subsystem Tags */}
            <div className={`flex flex-wrap gap-1.5 text-[9px] font-mono tracking-wider ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>WC-6Co CARBIDE</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>0.005mm CLEARANCE</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>CAPILLARY GROOVES</span>
              <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>&gt;100k CLICK FATIGUE</span>
            </div>
          </motion.div>

          {/* 13. THE BRIDGE: THOSE WERE OUR OBJECTS */}
          <motion.div
            style={{ opacity: bridgeOpacity, y: bridgeY, filter: bridgeBlur, display: bridgeDisplay }}
            className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pointer-events-none"
          >
            <div className="space-y-5 max-w-2xl">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full transition-all duration-300 ${
                isLight ? 'bg-blue-50/80 border border-blue-200/80 text-[#2563eb]' : 'bg-white/5 border border-white/10 text-[#3b82f6]'
              } text-[10px] font-mono tracking-widest uppercase`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2ad]" />
                <span>Archive Sequence Complete</span>
              </div>
              <h2 className={`text-[clamp(2.8rem,6.5vw,5.5rem)] font-light leading-[0.92] tracking-tighter font-heading transition-all duration-300 ${
                isLight ? 'text-[#0f172a]' : 'text-white'
              }`}>
                THOSE WERE <br />
                <span className={isLight ? 'text-[#2563eb]' : 'text-[#38bdf8]'}>OUR OBJECTS.</span>
              </h2>
              <p className={`text-xl sm:text-2xl font-light tracking-wide pt-1 transition-all duration-300 ${
                isLight ? 'text-slate-600' : 'text-white/60'
              }`}>
                Now try yours.
              </p>
            </div>
          </motion.div>

          {/* 14. HOW THE SYSTEM WORKS (Sequential Storytelling, Not Card Grid) */}
          <motion.div
            style={{ opacity: howItWorksOpacity, y: howItWorksY, filter: howItWorksBlur, display: howItWorksDisplay, pointerEvents: howItWorksPointerEvents }}
            className="absolute inset-0 flex flex-col justify-center items-center px-4 pointer-events-none"
          >
            <div className="max-w-4xl w-full">
              <div className="text-center space-y-2 mb-8">
                <p className={`text-xs font-mono tracking-[0.3em] uppercase ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`}>
                  The Pipeline
                </p>
                <h2 className={`text-3xl sm:text-5xl font-light tracking-tight font-heading ${
                  isLight ? 'text-[#0f172a]' : 'text-white'
                }`}>
                  HOW THE ENGINE TAKES IT APART
                </h2>
              </div>

              {/* Sequential 4-Stage Narrative */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Step 1 */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isLight
                    ? 'bg-white/90 border-slate-200/90 shadow-sm'
                    : 'bg-[#080f1d]/90 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-mono font-bold tracking-widest ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`}>
                      01 // UPLOAD
                    </span>
                    <Upload className={`w-4 h-4 ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`} />
                  </div>
                  <h3 className={`text-base font-bold font-heading mb-1.5 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    YOUR GLB / GLTF
                  </h3>
                  <p className={`text-xs font-mono leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                    Drop any 3D asset directly from your desktop into the viewport.
                  </p>
                </div>

                {/* Step 2 */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isLight
                    ? 'bg-white/90 border-slate-200/90 shadow-sm'
                    : 'bg-[#080f1d]/90 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-mono font-bold tracking-widest ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
                      02 // ANALYZE
                    </span>
                    <Cpu className={`w-4 h-4 ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`} />
                  </div>
                  <h3 className={`text-base font-bold font-heading mb-1.5 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    RESOLVE GEOMETRY
                  </h3>
                  <p className={`text-xs font-mono leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                    In-browser CAD engine maps mesh hierarchies, centroids, and roles.
                  </p>
                </div>

                {/* Step 3 */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isLight
                    ? 'bg-white/90 border-slate-200/90 shadow-sm'
                    : 'bg-[#080f1d]/90 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-mono font-bold tracking-widest ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`}>
                      03 // DECONSTRUCT
                    </span>
                    <Layers className={`w-4 h-4 ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`} />
                  </div>
                  <h3 className={`text-base font-bold font-heading mb-1.5 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    EXPLODED VECTORS
                  </h3>
                  <p className={`text-xs font-mono leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                    Components calculate outward radial vectors for synchronized stage explosion.
                  </p>
                </div>

                {/* Step 4 */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isLight
                    ? 'bg-white/90 border-slate-200/90 shadow-sm'
                    : 'bg-[#080f1d]/90 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-mono font-bold tracking-widest ${isLight ? 'text-[#0284c7]' : 'text-[#00f2ad]'}`}>
                      04 // EXPLORE
                    </span>
                    <Sparkles className={`w-4 h-4 ${isLight ? 'text-[#0284c7]' : 'text-[#00f2ad]'}`} />
                  </div>
                  <h3 className={`text-base font-bold font-heading mb-1.5 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                    INTERACTIVE STUDIO
                  </h3>
                  <p className={`text-xs font-mono leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                    Inspect tolerances, query material classifications, and animate reassembly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 15. YOUR OBJECT // INTERACTIVE UPLOAD CLIMAX + SYNTHESIS SEARCH */}
          <motion.div
            style={{ opacity: uploadOpacity, y: uploadY, filter: uploadBlur, display: uploadDisplay, pointerEvents: uploadPointerEvents }}
            className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pointer-events-none overflow-y-auto"
          >
            <div className="max-w-2xl w-full space-y-5 my-auto pointer-events-auto">
              <div className="space-y-1.5">
                <p className={`text-xs font-mono tracking-[0.35em] uppercase ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`}>
                  The Climax
                </p>
                <h2 className={`text-3xl sm:text-5xl font-light tracking-tight font-heading ${
                  isLight ? 'text-[#0f172a]' : 'text-white'
                }`}>
                  YOUR OBJECT.
                </h2>
                <p className={`text-xs sm:text-sm font-mono max-w-lg mx-auto ${
                  isLight ? 'text-slate-600' : 'text-white/70'
                }`}>
                  DROP A .GLB / .GLTF FILE &bull; OR ENTER ANY PHYSICAL MECHANISM TO DECONSTRUCT.
                </p>
              </div>

              {/* Interactive Living CAD Dropzone */}
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
                className={`upload-dropzone group relative p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isDragOver
                    ? isLight
                      ? 'border-[#2563eb] bg-[#2563eb]/10 shadow-[0_0_60px_rgba(37,99,235,0.3)] scale-[1.02]'
                      : 'border-[#00f2ad] bg-[#00f2ad]/10 shadow-[0_0_80px_rgba(0,242,173,0.35)] scale-[1.02]'
                    : isLight
                      ? 'border-slate-300/80 bg-white/95 hover:border-[#2563eb]/60 shadow-[0_12px_36px_rgba(15,23,42,0.06)] hover:scale-[1.005]'
                      : 'border-white/15 bg-[#080d1a]/95 hover:border-[#00f2ad]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85)] hover:scale-[1.005]'
                }`}
              >
                {/* CAD Corner Crosshairs */}
                <div className={`absolute top-2.5 left-2.5 text-[9px] font-mono select-none ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`}>┌ +</div>
                <div className={`absolute top-2.5 right-2.5 text-[9px] font-mono select-none ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`}>+ ┐</div>
                <div className={`absolute bottom-2.5 left-2.5 text-[9px] font-mono select-none ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`}>└ +</div>
                <div className={`absolute bottom-2.5 right-2.5 text-[9px] font-mono select-none ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`}>+ ┘</div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    console.log(`[CLIENT][ImmersiveExperience.input.onChange] FIRED with file="${file?.name}" timestamp=${new Date().toISOString()}`);
                    if (file) {
                      console.log(`[CLIENT][ImmersiveExperience.input.onChange] Calling onUploadModel with "${file.name}"`);
                      onUploadModel(file);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                    isDragOver
                      ? isLight ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/30' : 'bg-[#00f2ad] text-[#080d1a] shadow-[0_0_30px_#00f2ad]'
                      : isLight ? 'bg-blue-50 border border-blue-200 text-[#2563eb]' : 'bg-[#00f2ad]/10 border border-[#00f2ad]/30 text-[#00f2ad]'
                  }`}>
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>

                  <div>
                    <div className={`text-sm sm:text-base font-mono font-bold tracking-tight mb-0.5 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                      DROP YOUR 3D CAD MODEL
                    </div>
                    <div className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                      Release file anywhere inside or <span className={isLight ? 'text-[#2563eb] underline font-semibold' : 'text-[#00f2ad] underline font-semibold'}>browse local disk</span>
                    </div>
                  </div>

                  <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest font-semibold ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-white/5 text-[#00f2ad] border border-[#00f2ad]/30'
                  }`}>
                    <span>.GLB</span>
                    <span>&bull;</span>
                    <span>.GLTF</span>
                    <span>&bull;</span>
                    <span>Instant Client Decomposition</span>
                  </div>
                </div>
              </div>

              {/* High-Tech Terminal Search / AI Mechanism Synthesis Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim() && onSearchCustom) {
                    onSearchCustom(searchQuery.trim());
                  }
                }}
                className={`rounded-2xl border p-2 sm:p-2.5 flex items-center gap-2.5 transition-all w-full max-w-full ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm focus-within:border-[#2563eb]'
                    : 'bg-[#060b17]/95 border-white/15 shadow-lg focus-within:border-[#38bdf8]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-1 ${
                  isLight ? 'bg-blue-50 text-[#2563eb]' : 'bg-white/5 text-[#38bdf8]'
                }`}>
                  <Terminal className="w-4 h-4" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Or enter mechanism: e.g. Mechanical Escapement, V8 Crankshaft..."
                  className={`flex-1 min-w-0 bg-transparent px-2 py-1.5 text-xs sm:text-sm focus:outline-none font-mono ${
                    isLight ? 'text-[#0f172a] placeholder-slate-400' : 'text-white placeholder-white/35'
                  }`}
                />

                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl font-mono text-xs tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 touch-manipulation ${
                    searchQuery.trim()
                      ? isLight
                        ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-sm cursor-pointer'
                        : 'bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-[0_0_20px_rgba(59,130,246,0.4)] cursor-pointer'
                      : isLight
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Quick Click Prompts */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                  Suggested:
                </span>
                {['Mechanical Escapement', 'Twin-Scroll Turbo', 'BLDC Motor', 'Drone Gimbal'].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setSearchQuery(prompt);
                      onSearchCustom?.(prompt);
                    }}
                    className={`px-2.5 py-1 rounded-md border text-[10px] font-mono transition-all cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-blue-50 text-slate-600 hover:text-[#2563eb] border-slate-200 shadow-sm'
                        : 'bg-white/5 hover:bg-[#3b82f6]/20 hover:text-[#38bdf8] border-white/10 text-white/70'
                    }`}
                  >
                    + {prompt}
                  </button>
                ))}
              </div>

              {/* Direct Launch Built-in Objects */}
              <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onSelectObject(objects[0])}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isLight
                      ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm'
                      : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  <span>Explore Swiss Watch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectObject(objects[1])}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 border border-white/15 text-white'
                  }`}
                >
                  <span>Explore Drone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectObject(objects[2])}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 border border-white/15 text-white'
                  }`}
                >
                  <span>Explore Turbo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Sequence Indicators */}
        <div className={`flex flex-col sm:flex-row gap-2.5 justify-between items-start sm:items-end text-[11px] font-mono tracking-wider pb-[env(safe-area-inset-bottom)] ${
          isLight ? 'text-slate-500' : 'text-white/50'
        }`}>
          <div className="space-y-1">
            <div className={`text-[9px] uppercase tracking-widest ${isLight ? 'text-[#2563eb]' : 'text-[#3b82f6]'}`}>Exploration Sequence</div>
            <div className={`font-semibold text-[10px] sm:text-[11px] truncate max-w-[280px] xs:max-w-none ${isLight ? 'text-slate-800' : 'text-white/80'}`}>01 HOROLOGY → 02 AEROSPACE → 03 KINEMATICS</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto flex-wrap">
            {/* Motion Pause / Resume Control */}
            <button
              onClick={toggleMotionPause}
              title={isMotionPaused ? "Resume mechanical micro-motion (Space)" : "Pause mechanical micro-motion (Space)"}
              aria-label={isMotionPaused ? "Resume mechanical micro-motion" : "Pause mechanical micro-motion"}
              className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer select-none touch-manipulation ${
                isLight
                  ? isMotionPaused
                    ? 'bg-amber-50 border border-amber-300 text-amber-800 shadow-sm'
                    : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm'
                  : isMotionPaused
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/80'
              }`}
            >
              {isMotionPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold tracking-wider text-[10px]">RESUME MOTION</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-blue-400" />
                  <span className="tracking-wider text-[10px]">PAUSE MOTION</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSelectObject(activeObjectRef.current || objects[0])}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer touch-manipulation ${
                isLight
                  ? 'bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 shadow-sm'
                  : 'bg-white/5 hover:bg-[#3b82f6]/20 border border-white/10 text-white'
              }`}
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
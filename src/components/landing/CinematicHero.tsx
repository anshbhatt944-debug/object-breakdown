import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import * as THREE from 'three';
import { ObjectBreakdownData, ViewMode3D } from '../../types/objectData';
import { load3DModelForObject, LoadedObjectResult } from '../workspace/viewer3d/ModelLoader';

interface CinematicHeroProps {
  objects: ObjectBreakdownData[];
  onSelectObject: (obj: ObjectBreakdownData) => void;
  onUploadModel: (file: File) => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  objects,
  onSelectObject,
  onUploadModel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentModelRef = useRef<LoadedObjectResult | null>(null);
  const animationFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentObject = objects[currentObjectIndex];

  // Scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Smooth scroll value
  const scrollSmooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 15, 35);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 12);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb8c5d6, 0.6);
    fillLight.position.set(-5, -3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 2, -8);
    scene.add(rimLight);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, []);

  // Load initial model
  useEffect(() => {
    if (!sceneRef.current || !currentObject) return;

    const loadModel = async () => {
      setIsTransitioning(true);

      // Fade out current model
      if (currentModelRef.current) {
        const oldModel = currentModelRef.current.rootGroup;
        await new Promise<void>((resolve) => {
          const fadeOut = () => {
            oldModel.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const mat = mesh.material as THREE.Material;
                if (mat.opacity !== undefined) {
                  mat.transparent = true;
                  mat.opacity = Math.max(0, mat.opacity - 0.05);
                }
              }
            });
            if (oldModel.children[0] && (oldModel.children[0] as any).material?.opacity > 0) {
              requestAnimationFrame(fadeOut);
            } else {
              sceneRef.current?.remove(oldModel);
              resolve();
            }
          };
          fadeOut();
        });
      }

      // Load new model
      try {
        const result = await load3DModelForObject(currentObject, 'solid');
        currentModelRef.current = result;

        // Fade in new model
        result.rootGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.Material;
            if (mat) {
              mat.transparent = true;
              mat.opacity = 0;
            }
          }
        });

        sceneRef.current?.add(result.rootGroup);

        const fadeIn = () => {
          result.rootGroup.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const mat = mesh.material as THREE.Material;
              if (mat.opacity !== undefined) {
                mat.opacity = Math.min(1, mat.opacity + 0.05);
              }
            }
          });
          if (result.rootGroup.children[0] && (result.rootGroup.children[0] as any).material?.opacity < 1) {
            requestAnimationFrame(fadeIn);
          } else {
            setIsTransitioning(false);
          }
        };
        fadeIn();
      } catch (error) {
        console.error('Failed to load model:', error);
        setIsTransitioning(false);
      }
    };

    loadModel();
  }, [currentObject]);

  // Animation loop with scroll-driven explosion
  useEffect(() => {
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      const scrollValue = scrollSmooth.get();
      const model = currentModelRef.current;

      if (model) {
        // Apply exploded view based on scroll
        model.componentMap.forEach((info) => {
          const { explodeStart, explodeEnd, basePosition, explodeVector } = info;

          // Calculate explosion factor for this component
          let explosionFactor = 0;
          if (scrollValue >= explodeStart && scrollValue <= explodeEnd) {
            explosionFactor = (scrollValue - explodeStart) / (explodeEnd - explodeStart);
          } else if (scrollValue > explodeEnd) {
            explosionFactor = 1;
          }

          // Smooth easing
          const eased = explosionFactor * explosionFactor * (3 - 2 * explosionFactor);

          // Apply position
          info.mesh.position.copy(basePosition);
          info.mesh.position.add(explodeVector.clone().multiplyScalar(eased));

          // Subtle rotation during explosion
          info.mesh.rotation.y = info.baseRotation.y + eased * 0.3;
        });

        // Gentle camera parallax
        const targetX = mouseRef.current.x * 0.3;
        const targetY = mouseRef.current.y * 0.2;
        cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.02;
        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.02;
        cameraRef.current.lookAt(0, 0, 0);

        // Slow ambient rotation
        model.rootGroup.rotation.y += 0.001;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scrollSmooth]);

  const handleObjectChange = (index: number) => {
    if (index !== currentObjectIndex && !isTransitioning) {
      setCurrentObjectIndex(index);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadModel(e.target.files[0]);
    }
  };

  // Text animations based on scroll
  const introOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const objectNameOpacity = useTransform(scrollYProgress, [0.15, 0.3, 0.6, 0.75], [0, 1, 1, 0]);
  const componentsOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);

  return (
    <div ref={containerRef} className="relative" style={{ height: '400vh' }}>
      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Sticky content overlay */}
      <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Intro Text - 0% to 15% */}
          <motion.div
            style={{ opacity: introOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
          >
            <h1 className="text-[12vw] md:text-[10vw] font-light leading-[0.9] tracking-tighter text-white">
              DECONSTRUCT
              <br />
              <span className="text-white/30">THE</span>
              <br />
              INVISIBLE
            </h1>
          </motion.div>

          {/* Object Name - 15% to 75% */}
          <motion.div
            style={{ opacity: objectNameOpacity }}
            className="absolute top-1/4 left-0 right-0 text-center px-8 pointer-events-none"
          >
            <p className="text-xs tracking-[0.3em] text-white/40 uppercase mb-4 font-mono">
              {currentObject.category}
            </p>
            <h2 className="text-[8vw] md:text-[6vw] font-light leading-[0.95] tracking-tighter text-white">
              {currentObject.name}
            </h2>
            <div className="mt-6 text-sm text-white/50 font-mono">
              {currentObject.stats.componentCount} COMPONENTS
            </div>
          </motion.div>

          {/* Components Revealed - 75% to 100% */}
          <motion.div
            style={{ opacity: componentsOpacity }}
            className="absolute top-1/3 left-0 right-0 text-center px-8"
          >
            <h3 className="text-[6vw] md:text-[4vw] font-light leading-[1] tracking-tighter text-white mb-8">
              NOW
              <br />
              <span className="text-white/40">UNDERSTAND IT</span>
            </h3>
          </motion.div>

          {/* Scroll indicator - bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/30"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-px h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent"
            />
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono">Scroll</span>
          </motion.div>
        </div>
      </div>

      {/* Object Selector - Fixed bottom left */}
      <div className="fixed bottom-8 left-8 z-50 pointer-events-auto">
        <div className="flex flex-col gap-2">
          {objects.map((obj, index) => (
            <button
              key={obj.id}
              onClick={() => handleObjectChange(index)}
              disabled={isTransitioning}
              className={`text-left text-sm font-mono tracking-wider transition-all ${
                index === currentObjectIndex
                  ? 'text-white opacity-100'
                  : 'text-white/30 opacity-50 hover:opacity-100'
              }`}
            >
              {obj.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Upload button - Fixed bottom right */}
      <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-mono tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors"
        >
          Upload Your Object
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Progress indicator - Fixed right */}
      <motion.div
        style={{ scaleY: scrollYProgress }}
        className="fixed right-8 top-1/4 bottom-1/4 w-px bg-white/20 origin-top z-50"
      >
        <div className="absolute inset-0 bg-white/60" />
      </motion.div>
    </div>
  );
};

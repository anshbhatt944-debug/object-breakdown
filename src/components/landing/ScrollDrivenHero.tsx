import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ThreeCanvas } from '../workspace/viewer3d/ThreeCanvas';
import { DroneCanvas } from '../workspace/viewer3d/DroneCanvas';
import { wristwatchData } from '../../data/objects/wristwatch';
import { electricMotorData } from '../../data/objects/electricMotor';
import { carEngineData } from '../../data/objects/carEngine';
import { droneData } from '../../data/objects/drone';
import { ballpointPenData } from '../../data/objects/ballpointPen';
import { ObjectBreakdownData, ViewMode3D } from '../../types/objectData';
import {
  Upload,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Zap,
  Box
} from 'lucide-react';

interface ScrollDrivenHeroProps {
  onSearch: (query: string) => void;
  onSelectPopular: (id: string) => void;
  onUploadModel: (file: File) => void;
}

export const ScrollDrivenHero: React.FC<ScrollDrivenHeroProps> = ({
  onSearch,
  onSelectPopular,
  onUploadModel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const [currentObject, setCurrentObject] = useState<ObjectBreakdownData>(wristwatchData);
  const [viewMode, setViewMode] = useState<ViewMode3D>('solid');
  const [isPlayingMechanism, setIsPlayingMechanism] = useState<boolean>(true);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const demoPresets = [
    { id: 'wristwatch', label: 'Swiss Watch', data: wristwatchData },
    { id: 'drone', label: 'Quadcopter', data: droneData },
    { id: 'car-engine', label: 'Turbocharger', data: carEngineData },
    { id: 'electric-motor', label: 'BLDC Motor', data: electricMotorData },
    { id: 'ballpoint-pen', label: 'Ballpoint', data: ballpointPenData },
  ];

  // Scroll-driven animation state
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Transform values based on scroll progress
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.7, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.95, 0.9]);
  const modelExplode = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 0.3, 0.65, 1]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const modelExplodeSmooth = useSpring(modelExplode, { damping: 25, stiffness: 80 });

  const isFeatureVisible = useInView(heroSectionRef, { once: true, amount: 0.3 });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadModel(e.target.files[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-[300vh]">
      {/* Hero Section - Sticky while scrolling */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-[#050608]" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#00f2ad]/8 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] bg-[#ff5c35]/6 rounded-full blur-[160px]" />

        {/* Hero Content */}
        <motion.div
          ref={heroSectionRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 flex flex-col justify-center items-center h-screen px-4 sm:px-8"
        >
          <div className="w-full max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Text Content */}
              <motion.div
                style={{ y: textY }}
                className="space-y-10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeatureVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                >
                  <div className="w-2 h-2 rounded-full bg-[#00f2ad] animate-ping" />
                  <span className="text-[11px] font-mono-cad text-[#00f2ad] uppercase tracking-widest font-semibold">
                    AI 3D CAD Analysis Engine
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isFeatureVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.95] tracking-tighter text-white font-heading mb-6">
                    DECONSTRUCT
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ad] via-[#00f2ad]/80 to-[#00f2ad]/40">
                      THE INVISIBLE
                    </span>
                    <br />
                    MECHANICS
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeatureVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xl text-slate-400 font-light max-w-xl leading-relaxed"
                >
                  An interactive atlas for engineering analysis.
                  <br className="hidden sm:block" />
                  <span className="text-white/60">Scroll down</span> to progressively explode assemblies and reveal internal kinematics.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeatureVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap items-center gap-4 pt-4"
                >
                  <button
                    onClick={() => onSelectPopular(currentObject.id)}
                    className="btn-premium flex items-center gap-3 text-xs px-8 py-4"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-ghost flex items-center gap-2.5 text-xs px-8 py-4"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload CAD File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".glb,.gltf"
                    className="hidden"
                  />
                </motion.div>
              </motion.div>

              {/* Right Column: Scroll-Driven 3D Model */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isFeatureVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-[500px] sm:h-[650px] relative rounded-3xl bg-gradient-to-br from-[#0a0d14]/90 to-[#050608]/80 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0">
                  {currentObject.id === 'drone' ? (
                    <DroneCanvas
                      objectData={currentObject}
                      selectedComponentId={selectedPartId}
                      onSelectComponent={setSelectedPartId}
                      hoveredComponentId={hoveredPartId}
                      onHoverComponent={setHoveredPartId}
                      explodeAmount={modelExplodeSmooth.get()}
                      viewMode={viewMode}
                      isPlayingMechanism={isPlayingMechanism}
                      isolatedComponentId={null}
                      hiddenComponentIds={new Set()}
                      showLeaderLines={false}
                    />
                  ) : (
                    <ThreeCanvas
                      objectData={currentObject}
                      selectedComponentId={selectedPartId}
                      onSelectComponent={setSelectedPartId}
                      hoveredComponentId={hoveredPartId}
                      onHoverComponent={setHoveredPartId}
                      explodeAmount={modelExplodeSmooth.get()}
                      viewMode={viewMode}
                      isPlayingMechanism={isPlayingMechanism}
                      isolatedComponentId={null}
                      hiddenComponentIds={new Set()}
                      showLeaderLines={false}
                    />
                  )}
                </div>

                {/* Floating HUD - Top */}
                <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center pointer-events-none">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={isFeatureVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-[11px] font-mono-cad px-4 py-2 rounded-full bg-black/70 border border-[#00f2ad]/30 text-[#00f2ad] font-bold uppercase tracking-widest backdrop-blur-xl"
                  >
                    {currentObject.name.toUpperCase()}
                  </motion.span>
                </div>

                {/* Scroll Progress Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isFeatureVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="absolute bottom-6 right-6 z-20 font-mono-cad pointer-events-none"
                >
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Deconstruction</div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#00f2ad] to-[#00f2ad]/60"
                        style={{
                          width: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
                        }}
                      />
                    </div>
                    <motion.span
                      className="text-[#00f2ad] text-sm font-bold"
                      style={{
                        opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.5, 1, 1, 0.5]),
                      }}
                    >
                      {Math.round(scrollYProgress.get() * 100)}%
                    </motion.span>
                  </div>
                </motion.div>

                {/* Floating corner accents */}
                <div className="cad-corner-tl" />
                <div className="cad-corner-tr" />
                <div className="cad-corner-bl" />
                <div className="cad-corner-br" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator - Bottom Center */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isFeatureVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-3 text-slate-500"
          >
            <span className="text-[10px] font-mono-cad uppercase tracking-widest">
              Scroll to Deconstruct
            </span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>

      {/* Content Below Hero - Reveal as you scroll */}
      <div className="relative z-20 -mt-[200vh] pt-[100vh]">
        <div className="min-h-screen bg-gradient-to-b from-transparent via-[#050608] to-[#050608] pt-32">
          <div className="w-full max-w-[1600px] mx-auto px-8">
            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-20"
            >
              <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.1] tracking-tighter mb-6 font-heading">
                CHOOSE YOUR{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ad] to-[#38bdf8]">
                  ASSEMBLY
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Select from our curated collection of mechanical assemblies,
                or upload your own CAD files for instant AI-powered analysis.
              </p>
            </motion.div>

            {/* Object Selector Grid */}
            <div className="flex flex-wrap justify-center gap-4 mb-32">
              {demoPresets.map((preset, idx) => {
                const isActive = currentObject.id === preset.id;
                return (
                  <motion.button
                    key={preset.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentObject(preset.data)}
                    className={`relative px-8 py-4 rounded-2xl text-sm font-mono-cad transition-all border backdrop-blur-xl ${
                      isActive
                        ? 'bg-[#00f2ad]/15 border-[#00f2ad] text-[#00f2ad] font-bold shadow-lg shadow-[#00f2ad]/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePreset"
                        className="absolute inset-0 bg-[#00f2ad]/10 rounded-2xl"
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {isActive && <Zap className="w-4 h-4" />}
                      {preset.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
              {[
                {
                  icon: Box,
                  title: 'CAD Analysis',
                  desc: 'AI-powered geometric breakdown with material inference',
                },
                {
                  icon: Zap,
                  title: 'Live Explode',
                  desc: 'Scroll-driven deconstruction reveals internal assemblies',
                },
                {
                  icon: Sparkles,
                  title: 'Deep Insights',
                  desc: 'Engineering rationale, manufacturing process, tolerances',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl group hover:border-[#00f2ad]/30 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#00f2ad]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-[#00f2ad]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 font-heading">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                  <div className="cad-corner-tl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="cad-corner-br opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

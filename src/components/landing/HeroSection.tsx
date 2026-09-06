import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ThreeCanvas } from '../workspace/viewer3d/ThreeCanvas';
import { DroneCanvas } from '../workspace/viewer3d/DroneCanvas';
import { wristwatchData } from '../../data/objects/wristwatch';
import { electricMotorData } from '../../data/objects/electricMotor';
import { carEngineData } from '../../data/objects/carEngine';
import { droneData } from '../../data/objects/drone';
import { ballpointPenData } from '../../data/objects/ballpointPen';
import { ObjectBreakdownData, ViewMode3D } from '../../types/objectData';
import {
  Sliders,
  Play,
  Pause,
  Upload,
  ArrowRight,
  Maximize2,
  Sparkles
} from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onSelectPopular: (id: string) => void;
  onUploadModel: (file: File) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onSelectPopular,
  onUploadModel,
}) => {
  const [currentObject, setCurrentObject] = useState<ObjectBreakdownData>(wristwatchData);
  const [explodeAmount, setExplodeAmount] = useState<number>(0.18);
  const [viewMode, setViewMode] = useState<ViewMode3D>('solid');
  const [isPlayingMechanism, setIsPlayingMechanism] = useState<boolean>(true);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const demoPresets = [
    { id: 'wristwatch', label: 'Horology', data: wristwatchData },
    { id: 'drone', label: 'Quadcopter', data: droneData },
    { id: 'car-engine', label: 'Turbocharger', data: carEngineData },
    { id: 'electric-motor', label: 'BLDC Motor', data: electricMotorData },
    { id: 'ballpoint-pen', label: 'Mechanism', data: ballpointPenData },
  ];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadModel(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadModel(e.target.files[0]);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 px-4 sm:px-8 max-w-[1800px] mx-auto overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 ambient-glow-emerald pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] ambient-glow-orange pointer-events-none" />

      {/* Main Grid: Editorial Typography Left + 3D Interactive Workbench Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-auto">
        {/* LEFT COLUMN: Editorial Storytelling */}
        <div className="lg:col-span-5 flex flex-col justify-center z-10">
          {/* Version / Telemetry Tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono-cad text-[#00f2ad] uppercase tracking-widest mb-6 w-fit"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ad] animate-ping" />
            <span>AI 3D CAD Deconstruction Engine</span>
          </motion.div>

          {/* Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[0.95] tracking-tighter text-slate-100 font-heading mb-6"
          >
            DECONSTRUCT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-400 to-slate-600 font-normal">
              THE INVISIBLE
            </span> <br />
            MECHANICS.
          </motion.h1>

          {/* Subtitle / Value Proposition */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 font-light leading-relaxed max-w-lg mb-8"
          >
            An interactive digital atlas for examining mechanical assemblies, material metallurgy,
            contact kinematics, and DFMA physics. Upload any 3D CAD asset or explore our verified catalog.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <button
              onClick={() => onSelectPopular(currentObject.id)}
              className="btn-premium flex items-center gap-3 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore {currentObject.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost flex items-center gap-2 text-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#00f2ad]" />
              <span>Drop 3D CAD File</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".glb,.gltf"
              className="hidden"
            />
          </motion.div>

          {/* Live Object Selector Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-10 pt-6 border-t border-white/10 flex flex-col gap-2"
          >
            <span className="text-[10px] font-mono-cad uppercase tracking-widest text-slate-500">
              Interactive Preview Target:
            </span>
            <div className="flex flex-wrap gap-2">
              {demoPresets.map((preset) => {
                const isActive = currentObject.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setCurrentObject(preset.data);
                      setSelectedPartId(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono-cad transition-all ${
                      isActive
                        ? 'bg-[#00f2ad]/15 text-[#00f2ad] border border-[#00f2ad]/40 font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:border-white/20'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Interactive 3D Canvas Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-7 h-[520px] sm:h-[620px] w-full relative rounded-3xl bg-[#080b11] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
        >
          {/* CAD Corner Accents */}
          <div className="cad-corner-tl" />
          <div className="cad-corner-tr" />
          <div className="cad-corner-bl" />
          <div className="cad-corner-br" />

          {/* Top Stage Header HUD */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono-cad text-[#00f2ad] font-bold">
                {currentObject.id.toUpperCase()} // CAD
              </span>
              <span className="hidden sm:inline px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono-cad text-slate-400">
                {currentObject.stats.componentCount} Components
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 pointer-events-auto">
              {(['solid', 'wireframe', 'xray'] as ViewMode3D[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-cad uppercase transition-all ${
                    viewMode === mode
                      ? 'bg-[#00f2ad] text-black font-bold shadow-[0_0_10px_rgba(0,242,173,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 3D WebGL Canvas Layer */}
          <div className="flex-1 w-full h-full relative">
            {currentObject.id === 'drone' ? (
              <DroneCanvas
                objectData={currentObject}
                selectedComponentId={selectedPartId}
                onSelectComponent={setSelectedPartId}
                hoveredComponentId={hoveredPartId}
                onHoverComponent={setHoveredPartId}
                explodeAmount={explodeAmount}
                viewMode={viewMode}
                isPlayingMechanism={isPlayingMechanism}
                isolatedComponentId={null}
                hiddenComponentIds={new Set()}
                showLeaderLines={true}
              />
            ) : (
              <ThreeCanvas
                objectData={currentObject}
                selectedComponentId={selectedPartId}
                onSelectComponent={setSelectedPartId}
                hoveredComponentId={hoveredPartId}
                onHoverComponent={setHoveredPartId}
                explodeAmount={explodeAmount}
                viewMode={viewMode}
                isPlayingMechanism={isPlayingMechanism}
                isolatedComponentId={null}
                hiddenComponentIds={new Set()}
                showLeaderLines={true}
              />
            )}

            {/* Drag & Drop Over Overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-[#00f2ad]/15 backdrop-blur-sm border-2 border-dashed border-[#00f2ad] z-30 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                <Upload className="w-12 h-12 text-[#00f2ad] animate-bounce mb-3" />
                <h3 className="text-xl font-bold text-white font-mono-cad">
                  DROP 3D CAD FILE (.GLB / .GLTF)
                </h3>
                <p className="text-xs text-[#00f2ad] mt-1">
                  Automatic mesh parsing and AI component decomposition will trigger instantly.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Viewport Control Deck */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/70 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl">
            {/* Explode Factor Slider */}
            <div className="flex items-center gap-3 flex-1 px-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-cad text-slate-400 uppercase tracking-wider shrink-0">
                <Sliders className="w-3.5 h-3.5 text-[#00f2ad]" />
                <span>Explode</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explodeAmount}
                onChange={(e) => setExplodeAmount(Number(e.target.value))}
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none accent-[#00f2ad]"
              />
              <span className="text-[10px] font-mono-cad text-[#00f2ad] w-10 text-right">
                {Math.round(explodeAmount * 100)}%
              </span>
            </div>

            {/* Mechanism Play / Pause Toggle & Launch Full Studio */}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setIsPlayingMechanism(!isPlayingMechanism)}
                className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                  isPlayingMechanism
                    ? 'bg-[#00f2ad]/15 border-[#00f2ad]/40 text-[#00f2ad]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title={isPlayingMechanism ? 'Pause kinematics' : 'Play kinematics'}
              >
                {isPlayingMechanism ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-mono-cad uppercase hidden md:inline">
                  {isPlayingMechanism ? 'Kinematics ON' : 'Kinematics OFF'}
                </span>
              </button>

              <button
                onClick={() => onSelectPopular(currentObject.id)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#00f2ad] hover:text-black border border-white/15 text-slate-200 text-xs font-mono-cad font-bold uppercase transition-all flex items-center gap-1.5"
                title="Open detailed CAD workspace"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Open Studio</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Real-Time Telemetry Bar Along Bottom */}
      <div className="mt-12 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 font-mono-cad text-xs">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500">Decomposition Depth</div>
          <div className="text-slate-200 font-bold text-sm mt-0.5">6 Assembly Layers</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500">Material Database</div>
          <div className="text-slate-200 font-bold text-sm mt-0.5">Metals, Polymers, Ceramics</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500">Kinematic Engine</div>
          <div className="text-[#00f2ad] font-bold text-sm mt-0.5">60 FPS WebGL Solver</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500">Format Ingestion</div>
          <div className="text-slate-200 font-bold text-sm mt-0.5">GLB • GLTF • STEP 3D</div>
        </div>
      </div>
    </section>
  );
};

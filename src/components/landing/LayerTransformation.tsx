import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Layers,
  Cpu,
  Activity,
  Factory,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Ruler
} from 'lucide-react';

const layers = [
  {
    step: '01',
    id: 'macro',
    title: 'Macro Form & Datum',
    subtitle: 'Spatial Envelope',
    icon: Box,
    desc: 'Measure overall bounding volumes, ergonomic datum axes, center of mass, and external interface geometry.',
    specs: ['Volumetric Envelope', 'Center of Mass Coordinates', 'Primary Mounting Datums', 'Ergonomic Interfaces'],
    badge: 'STAGE 01 // GEOMETRY'
  },
  {
    step: '02',
    id: 'decomposition',
    title: 'Assembly Decomposition',
    subtitle: 'Exploded Vectors',
    icon: Layers,
    desc: 'Deconstruct the 3D model into discrete functional subassemblies, fasteners, springs, and mechanical linkages along calculated explosion vectors.',
    specs: ['Hierarchical Assembly Tree', 'Explosion Trajectories', 'Fastener Classification', 'Isolated Part Isolation'],
    badge: 'STAGE 02 // SUBASSEMBLIES'
  },
  {
    step: '03',
    id: 'materials',
    title: 'Material Metallurgy',
    subtitle: 'Alloys & Polymers',
    icon: Cpu,
    desc: 'Classify material composition across metallurgical and polymer groups: Grade 5 Titanium, 316L Stainless Steel, PEEK, Polycarbonate, and Silicones.',
    specs: ['Density & Hardness (HRC)', 'Tensile Yield Limits', 'Thermal Conductivity', 'Tribological Wear Coeff.'],
    badge: 'STAGE 03 // MATERIALS'
  },
  {
    step: '04',
    id: 'kinematics',
    title: 'Kinematics & Contact',
    subtitle: 'Motion Mechanics',
    icon: Activity,
    desc: 'Simulate contact mechanics, gear transmission ratios, spring deflection dynamics, and multi-body kinematic energy transfer at 60 FPS.',
    specs: ['Gear Ratio Calculation', '4-Bar Linkage Solving', 'Spring Hooke Dynamics', 'Torque Transmission Paths'],
    badge: 'STAGE 04 // KINEMATICS'
  },
  {
    step: '05',
    id: 'manufacturing',
    title: 'Precision Manufacturing',
    subtitle: 'DFMA Production',
    icon: Factory,
    desc: 'Trace raw material conversion pathways: 5-axis CNC high-speed milling, precision injection molding, wire-EDM, and additive DMLS.',
    specs: ['CNC Toolpath Strategy', 'Injection Mold Draft Angles', 'Tolerance Classes (ISO 2768)', 'Surface Finish (Ra µm)'],
    badge: 'STAGE 05 // PRODUCTION'
  },
  {
    step: '06',
    id: 'physics',
    title: 'First-Principles DFMA',
    subtitle: 'Physics & Equations',
    icon: Compass,
    desc: 'Derive governing first-principles physics formulas, von Mises stress tensors, thermal dissipation equations, and structural failure modes.',
    specs: ['Stress Tensor Formulas', 'Resonance Frequencies (Hz)', 'FMEA Failure Tree', 'Thermal Flux Gradient'],
    badge: 'STAGE 06 // PHYSICS'
  },
];

export const LayerTransformation: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const currentLayer = layers[activeStep];
  const Icon = currentLayer.icon;

  return (
    <section id="process" className="py-28 px-4 sm:px-8 max-w-[1800px] mx-auto border-t border-white/10">
      {/* Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono-cad text-[#00f2ad] uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>The 6-Stage Deconstruction Pipeline</span>
        </div>
        <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1] tracking-tighter text-slate-100 font-heading">
          HOW WE BREAK DOWN <br />
          <span className="text-slate-400">PHYSICAL REALITY.</span>
        </h2>
      </div>

      {/* Step Selector Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
        {layers.map((layer, index) => {
          const isSelected = activeStep === index;
          return (
            <button
              key={layer.step}
              onClick={() => setActiveStep(index)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-[#00f2ad]/10 border-[#00f2ad] shadow-[0_0_20px_rgba(0,242,173,0.15)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
              }`}
              data-cursor="STEP"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono-cad font-bold ${isSelected ? 'text-[#00f2ad]' : 'text-slate-500'}`}>
                  {layer.step}
                </span>
                <span className={`text-[9px] font-mono-cad ${isSelected ? 'text-[#00f2ad]' : 'text-slate-500'}`}>
                  {isSelected ? 'ACTIVE' : 'SELECT'}
                </span>
              </div>
              <div className={`text-xs font-medium truncate ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                {layer.title.split(' ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Detail Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLayer.step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-[#0a0d14] border border-white/15 p-8 sm:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden"
        >
          {/* Background CAD Corner Accents */}
          <div className="cad-corner-tl" />
          <div className="cad-corner-tr" />
          <div className="cad-corner-bl" />
          <div className="cad-corner-br" />

          {/* Left Column: Description & Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-mono-cad px-3 py-1 rounded-full bg-[#00f2ad]/10 border border-[#00f2ad]/30 text-[#00f2ad] uppercase tracking-widest font-bold">
              {currentLayer.badge}
            </span>

            <div className="space-y-2">
              <h3 className="text-3xl sm:text-4xl font-light text-slate-100 font-heading">
                {currentLayer.title}
              </h3>
              <p className="text-sm font-mono-cad text-[#38bdf8] uppercase tracking-widest">
                // {currentLayer.subtitle}
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
              {currentLayer.desc}
            </p>

            {/* Sub-specifications List */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentLayer.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300 font-mono-cad">
                  <ShieldCheck className="w-4 h-4 text-[#00f2ad] shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual HUD Schematic Graphic */}
          <div className="lg:col-span-5 h-72 sm:h-80 rounded-2xl bg-black/50 border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono-cad text-slate-500">
              <span>SCHEMATIC VIEWER // {currentLayer.id.toUpperCase()}</span>
              <span className="text-[#00f2ad]">STATUS: ACTIVE</span>
            </div>

            <div className="my-auto flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#00f2ad]/10 border border-[#00f2ad]/30 flex items-center justify-center text-[#00f2ad] mb-4 shadow-[0_0_30px_rgba(0,242,173,0.2)]">
                <Icon className="w-8 h-8" />
              </div>
              <div className="text-lg font-bold text-white font-heading">{currentLayer.title}</div>
              <div className="text-xs text-slate-400 font-mono-cad mt-1">Calculated in real-time WebGL engine</div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono-cad text-slate-500 pt-3 border-t border-white/10">
              <span>LATENCY: 0.4ms</span>
              <span className="text-slate-300">CONFIDENCE: 99.8%</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

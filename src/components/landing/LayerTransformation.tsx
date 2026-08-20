import React, { useState } from 'react';
import { Box, Layers, Cpu, PlayCircle, Factory, Lightbulb, ChevronRight } from 'lucide-react';

export const LayerTransformation: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState(0);

  const layers = [
    {
      step: '01',
      title: 'The Object',
      subtitle: 'What is it?',
      icon: Box,
      color: '#00f2ad',
      desc: 'Inspect the external assembly, unibody geometry, datum references, and ergonomic user interfaces in 3D.',
      metrics: 'Macro-scale assembly envelope & aesthetics',
    },
    {
      step: '02',
      title: 'Components',
      subtitle: 'What is it made of?',
      icon: Layers,
      color: '#38bdf8',
      desc: 'Explode the model along multi-axis disassembly vectors to reveal every internal subassembly, spring, gear, and fastener.',
      metrics: 'Hierarchical Bill of Materials (BOM) decomposition',
    },
    {
      step: '03',
      title: 'Materials',
      subtitle: 'What are they made from?',
      icon: Cpu,
      color: '#a855f7',
      desc: 'Explore metallurgy and polymer science: 316L stainless steel, tungsten carbide, single-crystal superalloys, and POM acetal.',
      metrics: 'Tensile yield strength, hardness (HV), and density',
    },
    {
      step: '04',
      title: 'Mechanism',
      subtitle: 'How do they interact?',
      icon: PlayCircle,
      color: '#f59e0b',
      desc: 'Watch animated step-by-step kinematics: cam-and-ratchet indexing, balance wheel oscillation, and Lorentz force magnetic torque.',
      metrics: 'Real-time contact pressure & friction coefficients',
    },
    {
      step: '05',
      title: 'Manufacturing',
      subtitle: 'How is it produced?',
      icon: Factory,
      color: '#f43f5e',
      desc: 'Follow the factory journey from raw material ingots to 5-axis CNC machining, micro-injection molding, and laser quality control.',
      metrics: 'GD&T dimensional tolerances (±0.002 mm)',
    },
    {
      step: '06',
      title: 'Engineering',
      subtitle: 'Why was it designed this way?',
      icon: Lightbulb,
      color: '#10b981',
      desc: 'Understand the first-principles governing physics equations, finite element stress concentrations, and DFMA cost-down tradeoffs.',
      metrics: 'Governing differential equations & safety factors',
    },
  ];

  return (
    <section id="layers" className="py-20 px-6 max-w-7xl mx-auto select-none">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-xs font-mono-cad text-[#00f2ad] uppercase tracking-wider font-semibold">
          From Outside to Inside
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-heading tracking-tight">
          Discover Every Layer.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 font-sans">
          Engineering is not just how something looks — it's the continuous relationship between geometry, materials, physics, and manufacturing methods.
        </p>
      </div>

      {/* 6 Layer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;
          const isActive = activeLayer === idx;

          return (
            <div
              key={layer.step}
              onClick={() => setActiveLayer(idx)}
              className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border flex flex-col justify-between h-[280px] relative overflow-hidden ${
                isActive
                  ? 'glass-panel-accent bg-[#0d111a]/95 border-[#00f2ad]/50 shadow-[0_0_30px_rgba(0,242,173,0.15)] scale-[1.02]'
                  : 'glass-card border-white/5 hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                <div className="relative min-h-10 flex items-center justify-center">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-mono-cad font-extrabold text-slate-500">
                    {layer.step}
                  </span>
                  <div
                    className="w-9 h-9 flex items-center justify-center border"
                    style={{ backgroundColor: `${layer.color}12`, color: layer.color, borderColor: `${layer.color}45` }}
                  >
                    <Icon className="w-4 h-4 block" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100 font-heading">
                    {layer.title}
                  </h3>
                  <span className="text-xs font-mono-cad text-[#00f2ad]">
                    {layer.subtitle}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {layer.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono-cad text-slate-400">
                <span>{layer.metrics}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

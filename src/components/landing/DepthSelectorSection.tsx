import React from 'react';
import { DepthLevel } from '../../types/objectData';
import { Zap, Eye, Cpu, Flame, Check, ShieldCheck, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface DepthSelectorSectionProps {
  depthLevel: DepthLevel;
  onDepthChange: (depth: DepthLevel) => void;
}

export const DepthSelectorSection: React.FC<DepthSelectorSectionProps> = ({
  depthLevel,
  onDepthChange,
}) => {
  const tiers = [
    {
      id: 'quick' as DepthLevel,
      title: 'Quick',
      tagline: '30s orientation',
      badge: 'TIER 1',
      icon: Zap,
      features: ['Primary Subsystem Breakdown', 'Overall Complexity Score', 'High-level Material Summary'],
    },
    {
      id: 'detailed' as DepthLevel,
      title: 'Detailed',
      tagline: 'Assembly inspection',
      badge: 'TIER 2',
      icon: Eye,
      features: ['Measured Bounding Box Dimensions', 'Part Isolation & Leader Lines', 'Discrete Material Grades', 'Component Interface Graph'],
    },
    {
      id: 'engineering' as DepthLevel,
      title: 'Engineering',
      tagline: 'Manufacturing & DFMA',
      badge: 'TIER 3',
      icon: Cpu,
      features: ['CNC & Tooling Inferences', 'Tolerance Classifications', 'FMEA Failure Tree', 'Inspection Datum Verification'],
    },
    {
      id: 'expert' as DepthLevel,
      title: 'Expert',
      tagline: 'First-principles physics',
      badge: 'TIER 4',
      icon: Flame,
      features: ['Governing Physics Formulas', 'von Mises Stress Tensors', 'Resonance Frequency Equations', 'Thermal Flux Calculations'],
    },
  ];

  return (
    <section id="depth" className="py-28 px-4 sm:px-8 max-w-[1800px] mx-auto border-t border-white/10">
      {/* Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono-cad text-[#00f2ad] uppercase tracking-widest mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>Cognitive Exploration Tiers</span>
        </div>
        <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1] tracking-tighter text-slate-100 font-heading">
          SELECT YOUR <br />
          <span className="text-slate-400">ANALYSIS DEPTH.</span>
        </h2>
      </div>

      {/* Grid of 4 Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isSelected = depthLevel === tier.id;

          return (
            <motion.button
              key={tier.id}
              onClick={() => onDepthChange(tier.id)}
              whileHover={{ y: -4 }}
              className={`rounded-2xl p-6 sm:p-8 text-left transition-all duration-300 relative flex flex-col justify-between border ${
                isSelected
                  ? 'bg-[#00f2ad]/10 border-[#00f2ad] shadow-[0_0_30px_rgba(0,242,173,0.2)]'
                  : 'bg-[#0a0d14] border-white/10 hover:border-white/20 hover:bg-[#0f1420]'
              }`}
              data-cursor="SELECT"
            >
              {/* Top Row: Icon & Status */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#00f2ad] text-black shadow-[0_0_15px_rgba(0,242,173,0.4)]'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-[10px] font-mono-cad px-2.5 py-1 rounded-full font-bold ${
                      isSelected
                        ? 'bg-[#00f2ad] text-black'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {isSelected ? 'ACTIVE TIER' : tier.badge}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-2xl font-light text-slate-100 font-heading mb-1">
                  {tier.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono-cad uppercase tracking-wider mb-6">
                  {tier.tagline}
                </p>

                {/* Unlocked Features */}
                <div className="space-y-2.5 pt-4 border-t border-white/10">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                      <Check
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          isSelected ? 'text-[#00f2ad]' : 'text-slate-500'
                        }`}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Trigger Indicator */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-cad">
                <span className={isSelected ? 'text-[#00f2ad] font-bold' : 'text-slate-500'}>
                  {isSelected ? '✓ CURRENT WORKSPACE MODE' : 'CLICK TO ACTIVATE'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { ALL_OBJECTS } from '../../data/objectRegistry';
import { ArrowRight, Layers, Box, Cpu, Activity, Sparkles, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface PopularObjectsProps {
  onSelectObjectById: (id: string) => void;
}

export const PopularObjects: React.FC<PopularObjectsProps> = ({ onSelectObjectById }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'MECHANICAL', 'ELECTRONICS', 'AEROSPACE', 'CONSUMER'];

  const filteredObjects = ALL_OBJECTS.filter((obj) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'MECHANICAL') {
      return (
        obj.id === 'wristwatch' ||
        obj.id === 'car-engine' ||
        obj.id === 'ballpoint-pen' ||
        obj.id === 'electric-motor'
      );
    }
    if (selectedCategory === 'ELECTRONICS') {
      return obj.id === 'smartphone' || obj.id === 'mechanical-keyboard';
    }
    if (selectedCategory === 'AEROSPACE') {
      return obj.id === 'jet-turbine' || obj.id === 'drone';
    }
    if (selectedCategory === 'CONSUMER') {
      return (
        obj.id === 'smartphone' ||
        obj.id === 'ballpoint-pen' ||
        obj.id === 'mechanical-keyboard' ||
        obj.id === 'wristwatch'
      );
    }
    return true;
  });

  return (
    <section id="explore" className="py-28 px-4 sm:px-8 max-w-[1800px] mx-auto border-t border-white/10">
      {/* Header & Category Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono-cad text-[#00f2ad] uppercase tracking-widest mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Mechanical Archives</span>
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1] tracking-tighter text-slate-100 font-heading">
            EXPLORE THE <br />
            <span className="text-slate-400">ENGINEERING CATALOG.</span>
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono-cad uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-[#00f2ad] text-[#050608] font-bold shadow-[0_0_20px_rgba(0,242,173,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
              }`}
              data-cursor="FILTER"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Engineered Objects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredObjects.map((obj, index) => (
          <motion.div
            key={obj.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
            onClick={() => onSelectObjectById(obj.id)}
            className="group relative rounded-2xl bg-[#0a0d14] border border-white/10 p-6 flex flex-col justify-between cursor-pointer hover:border-[#00f2ad]/50 hover:bg-[#0f1420] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
            data-cursor="INSPECT"
          >
            {/* Top Accents */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-mono-cad px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[#00f2ad] uppercase tracking-wider font-bold">
                OBJ-{String(index + 1).padStart(2, '0')} // {obj.category}
              </span>

              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[#00f2ad] group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Middle: Title & Tagline */}
            <div className="mb-8">
              <h3 className="text-2xl font-light text-slate-100 font-heading group-hover:text-white transition-colors mb-2">
                {obj.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {obj.heroTagline || obj.summary}
              </p>
            </div>

            {/* Bottom: Technical Specifications / Telemetry */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-slate-400 font-mono-cad text-[10px]">
              <div>
                <span className="text-slate-500 uppercase block text-[8px]">Components</span>
                <span className="text-slate-200 font-bold">{obj.stats.componentCount} parts</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block text-[8px]">Materials</span>
                <span className="text-slate-200 font-bold">{obj.stats.materialCount} types</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block text-[8px]">Complexity</span>
                <span className="text-[#00f2ad] font-bold">{obj.complexityScore.overall.toFixed(1)}/10</span>
              </div>
            </div>

            {/* Ambient hover glow */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#00f2ad]/5 group-hover:bg-[#00f2ad]/15 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

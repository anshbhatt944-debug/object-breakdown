import React, { useState } from 'react';
import { MaterialItem, DepthLevel } from '../../../types/objectData';
import {
  Layers,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Info,
  Scale,
} from 'lucide-react';

interface MaterialAnalysisProps {
  materials: MaterialItem[];
  depthLevel: DepthLevel;
}

export const MaterialAnalysis: React.FC<MaterialAnalysisProps> = ({ materials, depthLevel }) => {
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState<number>(0);
  const activeMaterial = materials[selectedMaterialIndex] || materials[0];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00f2ad]" />
          <h3 className="text-xs font-mono-cad uppercase tracking-wider font-semibold text-slate-200">
            Material Composition & Metallurgy
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Visual mass distribution, mechanical properties, and engineering selection trade-offs.
        </p>
      </div>

      {/* Visual Composition Stacked Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono-cad text-slate-400">
          <span>Mass Breakdown</span>
          <span>100% Total Volume</span>
        </div>
        <div className="flex h-4 rounded-lg overflow-hidden bg-black/40 border border-white/10 p-0.5 gap-0.5">
          {materials.map((mat, idx) => (
            <div
              key={mat.name}
              onClick={() => setSelectedMaterialIndex(idx)}
              style={{
                width: `${mat.percentage}%`,
                backgroundColor: mat.color || '#38bdf8',
              }}
              title={`${mat.name}: ${mat.percentage}%`}
              className={`h-full rounded-sm cursor-pointer transition-all hover:brightness-125 ${
                selectedMaterialIndex === idx ? 'ring-2 ring-white shadow-lg' : 'opacity-85'
              }`}
            />
          ))}
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {materials.map((mat, idx) => (
            <button
              key={mat.name}
              onClick={() => setSelectedMaterialIndex(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono-cad transition-all ${
                selectedMaterialIndex === idx
                  ? 'bg-white/15 text-white border border-white/30 font-semibold'
                  : 'bg-black/30 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mat.color }} />
              <span>{mat.name.split(' ')[0]}</span>
              <span className="text-slate-500 font-normal">({mat.percentage}%)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Material Deep Inspection Card */}
      {activeMaterial && (
        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-mono-cad text-[#00f2ad] uppercase tracking-wider block">
                {activeMaterial.category}
              </span>
              <h4 className="text-base font-bold text-slate-100 font-heading">
                {activeMaterial.name}
              </h4>
            </div>
            <span className="text-xl font-extrabold font-mono-cad text-[#38bdf8]">
              {activeMaterial.percentage}%
            </span>
          </div>

          {/* Used in components */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono-cad text-slate-400 uppercase">Utilized In</span>
            <div className="flex flex-wrap gap-1.5">
              {activeMaterial.usedIn.map((comp) => (
                <span
                  key={comp}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono-cad text-slate-300"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Properties Table */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono-cad text-xs">
            {activeMaterial.properties.map((prop) => (
              <div key={prop.key} className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-500 block">{prop.key}</span>
                <span className="text-slate-200 font-semibold">{prop.value}</span>
              </div>
            ))}
          </div>

          {/* Advantages vs Disadvantages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-1.5">
              <span className="text-[11px] font-mono-cad text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Advantages
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {activeMaterial.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/[0.03] border border-rose-500/20 space-y-1.5">
              <span className="text-[11px] font-mono-cad text-rose-400 font-semibold flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />
                Trade-offs / Limitations
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {activeMaterial.disadvantages.map((dis, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Engineering Selection Rationale */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-[#00f2ad]/30 space-y-1.5">
            <span className="text-[11px] font-mono-cad text-[#00f2ad] font-semibold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Why Was This Material Selected?
            </span>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{activeMaterial.selectionRationale}"
            </p>
          </div>

          {/* Alternatives */}
          {activeMaterial.alternatives && activeMaterial.alternatives.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono-cad text-slate-400 pt-1">
              <RefreshCw className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Alternative Materials:</span>
              <span className="text-slate-200">{activeMaterial.alternatives.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

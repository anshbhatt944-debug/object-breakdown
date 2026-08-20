import React from 'react';
import { ObjectBreakdownData, DepthLevel } from '../../../types/objectData';
import {
  Activity,
  Layers,
  Wrench,
  Cpu,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ObjectOverviewProps {
  objectData: ObjectBreakdownData;
  depthLevel: DepthLevel;
}

export const ObjectOverview: React.FC<ObjectOverviewProps> = ({ objectData, depthLevel }) => {
  const { complexityScore, stats, summary, engineeringDisciplines } = objectData;

  const scoreBars = [
    { label: 'Mechanical Complexity', score: complexityScore.mechanical, color: '#38bdf8' },
    { label: 'Electrical / Electronics', score: complexityScore.electrical, color: '#a855f7' },
    { label: 'Material Science', score: complexityScore.material, color: '#f59e0b' },
    { label: 'Manufacturing & Tolerancing', score: complexityScore.manufacturing, color: '#00f2ad' },
    { label: 'Assembly & Integration', score: complexityScore.assembly, color: '#f43f5e' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Title & Summary */}
      <div className="space-y-3 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono-cad text-[#00f2ad] uppercase tracking-wider font-semibold">
            {objectData.category}
          </span>
          <span className="text-[11px] font-mono-cad px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
            {objectData.id.toUpperCase()}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 font-heading tracking-tight">
          {objectData.name}
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">{summary}</p>
      </div>

      {/* Technical Complexity Score Gauge */}
      <div className="p-5 rounded-2xl glass-card border border-[#00f2ad]/30 bg-[#00f2ad]/[0.02] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00f2ad]" />
            <h3 className="text-xs font-mono-cad uppercase tracking-wider font-bold text-slate-100">
              Technical Complexity Index
            </h3>
          </div>
          <div className="flex items-baseline gap-1 font-mono-cad">
            <span className="text-3xl font-extrabold text-[#00f2ad]">{complexityScore.overall.toFixed(1)}</span>
            <span className="text-sm text-slate-500 font-medium">/ 10</span>
          </div>
        </div>

        {/* Breakdown Dimension Bars */}
        <div className="space-y-2.5 pt-2">
          {scoreBars.map((bar) => (
            <div key={bar.label} className="space-y-1">
              <div className="flex justify-between text-xs font-mono-cad">
                <span className="text-slate-400">{bar.label}</span>
                <span className="text-slate-200 font-semibold">{bar.score.toFixed(1)} / 10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${bar.score * 10}%`,
                    backgroundColor: bar.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Engineering Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono-cad">
        <div className="p-3.5 rounded-xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Components</span>
          <span className="text-lg font-bold text-slate-100">{stats.componentCount}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Materials</span>
          <span className="text-lg font-bold text-[#38bdf8]">{stats.materialCount}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Moving Parts</span>
          <span className="text-lg font-bold text-[#00f2ad]">{stats.movingParts}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mfg Stages</span>
          <span className="text-lg font-bold text-amber-400">{stats.manufacturingStages}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Approx Cost</span>
          <span className="text-sm font-bold text-slate-200 truncate block">{stats.approxCostUsd}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Annual Volume</span>
          <span className="text-xs font-bold text-purple-400 truncate block">{stats.productionVolume}</span>
        </div>
      </div>

      {/* Engineering Disciplines Required */}
      <div className="p-4 rounded-xl glass-card border border-white/10 space-y-3">
        <h4 className="text-xs font-mono-cad font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#38bdf8]" />
          <span>Applicable Engineering Disciplines</span>
        </h4>
        <div className="space-y-1.5">
          {engineeringDisciplines.map((disc, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#00f2ad] shrink-0" />
              <span>{disc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* "Did You Know?" Engineering Facts */}
      {objectData.didYouKnow && objectData.didYouKnow.length > 0 && (
        <div className="p-4 rounded-xl glass-card border border-amber-500/20 bg-amber-500/[0.02] space-y-2.5">
          <h4 className="text-xs font-mono-cad font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Engineering Insights & Trivia</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            {objectData.didYouKnow.map((fact, idx) => (
              <li key={idx} className="leading-relaxed">
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ObjectBreakdownData, DepthLevel } from '../../../types/objectData';
import { Sparkles, Scissors, Zap, DollarSign, ArrowRight } from 'lucide-react';

interface DesignInsightsProps {
  objectData: ObjectBreakdownData;
  depthLevel: DepthLevel;
}

export const DesignInsights: React.FC<DesignInsightsProps> = ({ objectData, depthLevel }) => {
  const { redesignInsights, engineersChoice } = objectData;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00f2ad]" />
          <h3 className="text-xs font-mono-cad uppercase tracking-wider font-semibold text-slate-200">
            DFMA & Design Evolution Insights
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Design for Manufacturing and Assembly (DFMA), simplification proposals, aerospace upgrades, and cost-down teardowns.
        </p>
      </div>

      {/* 1. Simplify It (DFMA Part Reduction) */}
      <div className="p-5 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-500/[0.02] space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono-cad text-emerald-400 uppercase tracking-wider block font-bold">
                DFMA Simplification
              </span>
              <h4 className="text-sm font-bold text-slate-100 font-heading">
                {redesignInsights.simplify.title}
              </h4>
            </div>
          </div>

          <span className="text-[11px] font-mono-cad px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            {redesignInsights.simplify.partReduction}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {redesignInsights.simplify.description}
        </p>

        <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-400">
          <strong className="text-slate-200">Engineering Trade-offs:</strong>{' '}
          {redesignInsights.simplify.tradeoffs}
        </div>
      </div>

      {/* 2. Make It Better (Performance / Aerospace Upgrade) */}
      <div className="p-5 rounded-2xl glass-card border border-[#38bdf8]/20 bg-[#38bdf8]/[0.02] space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono-cad text-[#38bdf8] uppercase tracking-wider block font-bold">
                Aerospace / Extreme Upgrade
              </span>
              <h4 className="text-sm font-bold text-slate-100 font-heading">
                {redesignInsights.makeItBetter.title}
              </h4>
            </div>
          </div>

          <span className="text-[11px] font-mono-cad px-2.5 py-0.5 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 font-bold">
            Performance Gain
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-black/40 border border-[#38bdf8]/20 text-xs font-mono-cad text-[#38bdf8]">
          {redesignInsights.makeItBetter.performanceGain}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {redesignInsights.makeItBetter.description}
        </p>
      </div>

      {/* 3. Cheaper Version (Cost-Down Mass Production) */}
      <div className="p-5 rounded-2xl glass-card border border-amber-500/20 bg-amber-500/[0.02] space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono-cad text-amber-400 uppercase tracking-wider block font-bold">
                Cost-Down Strategy
              </span>
              <h4 className="text-sm font-bold text-slate-100 font-heading">
                {redesignInsights.cheaperVersion.title}
              </h4>
            </div>
          </div>

          <span className="text-[11px] font-mono-cad px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            {redesignInsights.cheaperVersion.costReduction}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {redesignInsights.cheaperVersion.changes}
        </p>

        <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-400">
          <strong className="text-slate-200">Resulting Trade-offs:</strong>{' '}
          {redesignInsights.cheaperVersion.tradeoffs}
        </div>
      </div>

      {/* Engineer's Choice Decisions */}
      {engineersChoice && engineersChoice.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono-cad uppercase tracking-wider text-slate-200 font-semibold">
            Engineer's Choice Design Decisions
          </h4>
          {engineersChoice.map((choice, i) => (
            <div key={i} className="p-4 rounded-xl glass-card border border-white/10 space-y-1.5">
              <h5 className="text-xs font-bold text-[#00f2ad] font-mono-cad">{choice.title}</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{choice.rationale}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

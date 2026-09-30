import React from 'react';
import { ObjectBreakdownData, DepthLevel } from '../../../types/objectData';
import { Sparkles, Scissors, Zap, DollarSign, ArrowRight } from 'lucide-react';

interface DesignInsightsProps {
  objectData: ObjectBreakdownData;
  depthLevel: DepthLevel;
  theme?: 'light' | 'dark';
}

export const DesignInsights: React.FC<DesignInsightsProps> = ({ objectData, depthLevel, theme = 'dark' }) => {
  const { redesignInsights, engineersChoice } = objectData;
  const isLight = theme === 'light';

  return (
    <div className={`p-6 space-y-6 overflow-y-auto h-full font-sans transition-colors ${
      isLight ? 'text-[#161311]' : 'text-slate-300'
    }`}>
      {/* Header */}
      <div className={`space-y-1 pb-4 border-b ${isLight ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C2410C] dark:text-[#00f2ad]" />
          <h3 className={`text-xs font-mono-cad uppercase tracking-wider font-semibold ${
            isLight ? 'text-[#161311]' : 'text-slate-200'
          }`}>
            DFMA & Design Evolution Insights
          </h3>
        </div>
        <p className={`text-xs ${isLight ? 'text-[#5e5750]' : 'text-slate-400'}`}>
          Design for Manufacturing and Assembly (DFMA), simplification proposals, aerospace upgrades, and cost-down teardowns.
        </p>
      </div>

      {/* 1. Simplify It (DFMA Part Reduction) */}
      <div className={`p-5 rounded-[4px] border space-y-3 transition-colors ${
        isLight
          ? 'bg-white border-[#DDD6CB] shadow-[0_1px_3px_rgba(22,19,17,0.03)]'
          : 'bg-[#211e1c] border-emerald-500/20'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-[3px] flex items-center justify-center ${
              isLight ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-[10px] font-mono-cad uppercase tracking-wider block font-bold ${
                isLight ? 'text-emerald-800' : 'text-emerald-400'
              }`}>
                DFMA Simplification
              </span>
              <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-[#161311]' : 'text-slate-100'}`}>
                {redesignInsights.simplify.title}
              </h4>
            </div>
          </div>

          <span className={`text-[11px] font-mono-cad px-2.5 py-0.5 rounded-full border font-bold ${
            isLight
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {redesignInsights.simplify.partReduction}
          </span>
        </div>

        <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-[#5e5750]' : 'text-slate-300'}`}>
          {redesignInsights.simplify.description}
        </p>

        <div className={`p-3 rounded-[3px] border text-xs ${
          isLight ? 'bg-[#F4EFE8] border-[#DDD6CB] text-[#161311]' : 'bg-black/40 border-white/5 text-slate-400'
        }`}>
          <strong className={isLight ? 'text-[#161311]' : 'text-slate-200'}>Engineering Trade-offs:</strong>{' '}
          <span className={isLight ? 'text-[#5e5750]' : 'text-slate-300'}>{redesignInsights.simplify.tradeoffs}</span>
        </div>
      </div>

      {/* 2. Make It Better (Performance / Aerospace Upgrade) */}
      <div className={`p-5 rounded-[4px] border space-y-3 transition-colors ${
        isLight
          ? 'bg-white border-[#DDD6CB] shadow-[0_1px_3px_rgba(22,19,17,0.03)]'
          : 'bg-[#211e1c] border-[#38bdf8]/20'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-[3px] flex items-center justify-center ${
              isLight ? 'bg-orange-50 text-[#C2410C]' : 'bg-[#38bdf8]/10 text-[#38bdf8]'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-[10px] font-mono-cad uppercase tracking-wider block font-bold ${
                isLight ? 'text-[#C2410C]' : 'text-[#38bdf8]'
              }`}>
                Aerospace / Extreme Upgrade
              </span>
              <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-[#161311]' : 'text-slate-100'}`}>
                {redesignInsights.makeItBetter.title}
              </h4>
            </div>
          </div>

          <span className={`text-[11px] font-mono-cad px-2.5 py-0.5 rounded-full border font-bold ${
            isLight
              ? 'bg-orange-50 text-[#C2410C] border-orange-200'
              : 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30'
          }`}>
            Performance Gain
          </span>
        </div>

        <div className={`p-2.5 rounded-[3px] border text-xs font-mono-cad ${
          isLight
            ? 'bg-[#F4EFE8] border-[#DDD6CB] text-[#C2410C] font-semibold'
            : 'bg-black/40 border-[#38bdf8]/20 text-[#38bdf8]'
        }`}>
          {redesignInsights.makeItBetter.performanceGain}
        </div>

        <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-[#5e5750]' : 'text-slate-300'}`}>
          {redesignInsights.makeItBetter.description}
        </p>
      </div>

      {/* 3. Cheaper Version (Cost-Down Mass Production) */}
      <div className={`p-5 rounded-[4px] border space-y-3 transition-colors ${
        isLight
          ? 'bg-white border-[#DDD6CB] shadow-[0_1px_3px_rgba(22,19,17,0.03)]'
          : 'bg-[#211e1c] border-amber-500/20'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-[3px] flex items-center justify-center ${
              isLight ? 'bg-amber-50 text-amber-700' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-[10px] font-mono-cad uppercase tracking-wider block font-bold ${
                isLight ? 'text-amber-800' : 'text-amber-400'
              }`}>
                Cost-Down Strategy
              </span>
              <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-[#161311]' : 'text-slate-100'}`}>
                {redesignInsights.cheaperVersion.title}
              </h4>
            </div>
          </div>

          <span className={`text-[11px] font-mono-cad px-2.5 py-0.5 rounded-full border font-bold ${
            isLight
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {redesignInsights.cheaperVersion.costReduction}
          </span>
        </div>

        <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-[#5e5750]' : 'text-slate-300'}`}>
          {redesignInsights.cheaperVersion.changes}
        </p>

        <div className={`p-3 rounded-[3px] border text-xs ${
          isLight ? 'bg-[#F4EFE8] border-[#DDD6CB] text-[#161311]' : 'bg-black/40 border-white/5 text-slate-400'
        }`}>
          <strong className={isLight ? 'text-[#161311]' : 'text-slate-200'}>Resulting Trade-offs:</strong>{' '}
          <span className={isLight ? 'text-[#5e5750]' : 'text-slate-300'}>{redesignInsights.cheaperVersion.tradeoffs}</span>
        </div>
      </div>

      {/* Engineer's Choice Decisions */}
      {engineersChoice && engineersChoice.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className={`text-xs font-mono-cad uppercase tracking-wider font-semibold ${
            isLight ? 'text-[#161311]' : 'text-slate-200'
          }`}>
            Engineer's Choice Design Decisions
          </h4>
          {engineersChoice.map((choice, i) => (
            <div
              key={i}
              className={`p-4 rounded-[4px] border space-y-1.5 transition-colors ${
                isLight
                  ? 'bg-white border-[#DDD6CB] shadow-[0_1px_2px_rgba(22,19,17,0.03)]'
                  : 'bg-[#211e1c] border-[var(--line)]'
              }`}
            >
              <h5 className={`text-xs font-bold font-mono-cad ${isLight ? 'text-[#C2410C]' : 'text-[#00f2ad]'}`}>
                {choice.title}
              </h5>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-[#5e5750]' : 'text-slate-300'}`}>
                {choice.rationale}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

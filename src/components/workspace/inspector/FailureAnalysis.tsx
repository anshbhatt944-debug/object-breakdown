import React from 'react';
import { ComponentNode, DepthLevel } from '../../../types/objectData';
import { AlertTriangle, ShieldCheck, Activity, Flame, RotateCcw } from 'lucide-react';

interface FailureAnalysisProps {
  rootComponents: ComponentNode[];
  depthLevel: DepthLevel;
  theme?: 'light' | 'dark';
}

export const FailureAnalysis: React.FC<FailureAnalysisProps> = ({
  rootComponents,
  depthLevel,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  // Aggregate all failure modes from all components
  const allFailures: {
    componentName: string;
    cadId: string;
    mode: string;
    cause: string;
    mitigation: string;
    severity: string;
  }[] = [];

  const traverse = (nodes: ComponentNode[]) => {
    nodes.forEach((n) => {
      n.failureModes.forEach((fm) => {
        allFailures.push({
          componentName: n.name,
          cadId: n.cadId,
          mode: fm.mode,
          cause: fm.cause,
          mitigation: fm.mitigation,
          severity: fm.severity,
        });
      });
      if (n.children) traverse(n.children);
    });
  };

  traverse(rootComponents);

  return (
    <div className={`p-6 space-y-6 overflow-y-auto h-full font-sans transition-colors ${
      isLight ? 'text-[#161311]' : 'text-slate-300'
    }`}>
      {/* Header */}
      <div className={`space-y-1 pb-4 border-b ${isLight ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h3 className={`text-xs font-mono-cad uppercase tracking-wider font-semibold ${
            isLight ? 'text-[#161311]' : 'text-slate-200'
          }`}>
            Failure Mode & Effects Analysis (FMEA)
          </h3>
        </div>
        <p className={`text-xs ${isLight ? 'text-[#5e5750]' : 'text-slate-400'}`}>
          Wear points, mechanical fatigue limits, thermal degradation, and engineering mitigations.
        </p>
      </div>

      {/* Failure Matrix List */}
      <div className="space-y-4">
        {allFailures.map((failure, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-[4px] border space-y-2.5 transition-all ${
              isLight
                ? 'bg-white border-[#DDD6CB] shadow-[0_1px_3px_rgba(22,19,17,0.03)] hover:border-rose-300'
                : 'bg-[#211e1c] border-[var(--line)] hover:border-rose-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[10px] font-mono-cad block font-semibold ${
                  isLight ? 'text-[#C2410C]' : 'text-[#38bdf8]'
                }`}>
                  {failure.cadId} • {failure.componentName}
                </span>
                <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-[#161311]' : 'text-slate-100'}`}>
                  {failure.mode}
                </h4>
              </div>

              <span
                className={`text-[10px] font-mono-cad px-2 py-0.5 rounded font-bold uppercase ${
                  failure.severity === 'Critical'
                    ? isLight ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : failure.severity === 'High'
                    ? isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : isLight ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {failure.severity}
              </span>
            </div>

            <div className={`p-3 rounded-[3px] border space-y-1.5 text-xs ${
              isLight ? 'bg-[#F4EFE8] border-[#DDD6CB]' : 'bg-black/40 border-white/5'
            }`}>
              <div className="flex items-start gap-1.5">
                <span className={`shrink-0 font-medium ${isLight ? 'text-[#786e64]' : 'text-slate-400'}`}>Root Cause:</span>
                <span className={isLight ? 'text-[#161311]' : 'text-slate-300'}>{failure.cause}</span>
              </div>
              <div className={`flex items-start gap-1.5 border-t pt-1.5 ${isLight ? 'border-[#DDD6CB]' : 'border-white/5'}`}>
                <span className={`shrink-0 font-semibold ${isLight ? 'text-emerald-800' : 'text-[#00f2ad]'}`}>Engineering Mitigation:</span>
                <span className={isLight ? 'text-[#161311]' : 'text-slate-200'}>{failure.mitigation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

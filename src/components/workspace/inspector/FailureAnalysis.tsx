import React from 'react';
import { ComponentNode, DepthLevel } from '../../../types/objectData';
import { AlertTriangle, ShieldCheck, Activity, Flame, RotateCcw } from 'lucide-react';

interface FailureAnalysisProps {
  rootComponents: ComponentNode[];
  depthLevel: DepthLevel;
}

export const FailureAnalysis: React.FC<FailureAnalysisProps> = ({
  rootComponents,
  depthLevel,
}) => {
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
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-mono-cad uppercase tracking-wider font-semibold text-slate-200">
            Failure Mode & Effects Analysis (FMEA)
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Wear points, mechanical fatigue limits, thermal degradation, and engineering mitigations.
        </p>
      </div>

      {/* Failure Matrix List */}
      <div className="space-y-4">
        {allFailures.map((failure, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl glass-card border border-white/10 space-y-2.5 hover:border-rose-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono-cad text-[#38bdf8] block">
                  {failure.cadId} • {failure.componentName}
                </span>
                <h4 className="text-sm font-bold text-slate-100 font-heading">
                  {failure.mode}
                </h4>
              </div>

              <span
                className={`text-[10px] font-mono-cad px-2 py-0.5 rounded font-bold uppercase ${
                  failure.severity === 'Critical'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : failure.severity === 'High'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {failure.severity}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-xs">
              <div className="flex items-start gap-1.5">
                <span className="text-slate-400 shrink-0 font-medium">Root Cause:</span>
                <span className="text-slate-300">{failure.cause}</span>
              </div>
              <div className="flex items-start gap-1.5 border-t border-white/5 pt-1.5">
                <span className="text-[#00f2ad] shrink-0 font-semibold">Engineering Mitigation:</span>
                <span className="text-slate-200">{failure.mitigation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

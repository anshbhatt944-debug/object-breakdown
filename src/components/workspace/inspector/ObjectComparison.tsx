import React, { useState } from 'react';
import { ALL_OBJECTS } from '../../../data/objectRegistry';
import { ObjectBreakdownData } from '../../../types/objectData';
import { Scale, X, ArrowRight, CheckCircle2, Cpu, Wrench } from 'lucide-react';

interface ObjectComparisonProps {
  currentObject: ObjectBreakdownData;
  onClose: () => void;
  onSelectObject: (obj: ObjectBreakdownData) => void;
}

export const ObjectComparison: React.FC<ObjectComparisonProps> = ({
  currentObject,
  onClose,
  onSelectObject,
}) => {
  const [compareTargetId, setCompareTargetId] = useState<string>(
    ALL_OBJECTS.find((o) => o.id !== currentObject.id)?.id || ALL_OBJECTS[0].id
  );

  const targetObject = ALL_OBJECTS.find((o) => o.id === compareTargetId) || ALL_OBJECTS[0];

  const comparisonRows = [
    {
      metric: 'Primary Category',
      val1: currentObject.category,
      val2: targetObject.category,
    },
    {
      metric: 'Overall Complexity Score',
      val1: `${currentObject.complexityScore.overall} / 10`,
      val2: `${targetObject.complexityScore.overall} / 10`,
      highlight: true,
    },
    {
      metric: 'Component Count',
      val1: `${currentObject.stats.componentCount} parts`,
      val2: `${targetObject.stats.componentCount} parts`,
    },
    {
      metric: 'Primary Materials',
      val1: `${currentObject.stats.materialCount} distinct materials`,
      val2: `${targetObject.stats.materialCount} distinct materials`,
    },
    {
      metric: 'Moving Kinematic Parts',
      val1: `${currentObject.stats.movingParts} active parts`,
      val2: `${targetObject.stats.movingParts} active parts`,
    },
    {
      metric: 'Manufacturing Stages',
      val1: `${currentObject.stats.manufacturingStages} factory stages`,
      val2: `${targetObject.stats.manufacturingStages} factory stages`,
    },
    {
      metric: 'Estimated Unit BOM Cost',
      val1: currentObject.stats.approxCostUsd,
      val2: targetObject.stats.approxCostUsd,
    },
    {
      metric: 'Annual Production Scale',
      val1: currentObject.stats.productionVolume,
      val2: targetObject.stats.productionVolume,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl glass-panel-accent bg-[#0d111a]/95 border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#00f2ad]" />
            <h3 className="text-sm font-mono-cad uppercase tracking-wider font-bold text-slate-100">
              Side-by-Side Engineering Comparison
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Object Selectors */}
        <div className="p-4 border-b border-white/5 bg-black/40 grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-black/40 border border-[#00f2ad]/40">
            <span className="text-[10px] font-mono-cad text-[#00f2ad] uppercase block font-semibold">
              Current Workspace Object
            </span>
            <h4 className="text-base font-bold text-slate-100 font-heading">
              {currentObject.name}
            </h4>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-[#38bdf8]/40 flex flex-col justify-between">
            <span className="text-[10px] font-mono-cad text-[#38bdf8] uppercase block font-semibold">
              Compare Against
            </span>
            <select
              value={compareTargetId}
              onChange={(e) => setCompareTargetId(e.target.value)}
              className="mt-1 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono-cad text-slate-200 focus:outline-none focus:border-[#38bdf8]"
            >
              {ALL_OBJECTS.filter((o) => o.id !== currentObject.id).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="space-y-2">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-3 p-3 rounded-xl border text-xs font-mono-cad items-center ${
                  row.highlight
                    ? 'bg-[#00f2ad]/[0.04] border-[#00f2ad]/30'
                    : 'bg-black/30 border-white/5'
                }`}
              >
                <span className="text-slate-400 font-medium">{row.metric}</span>
                <span className="text-slate-200 font-semibold px-2">{row.val1}</span>
                <span className="text-[#38bdf8] font-semibold px-2">{row.val2}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <span className="text-xs font-mono-cad text-slate-400">
            Compare across mechanics, tolerances, and thermodynamic cycles.
          </span>
          <button
            onClick={() => {
              onSelectObject(targetObject);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-[#00f2ad] text-slate-950 font-mono-cad text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_15px_#00f2ad]"
          >
            <span>Switch to {targetObject.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

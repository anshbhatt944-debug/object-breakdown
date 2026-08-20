import React, { useState } from 'react';
import { EngineeringEquation, DepthLevel } from '../../../types/objectData';
import { Cpu, Calculator, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface EngineeringAnalysisProps {
  equations: EngineeringEquation[];
  depthLevel: DepthLevel;
}

export const EngineeringAnalysis: React.FC<EngineeringAnalysisProps> = ({
  equations,
  depthLevel,
}) => {
  const [selectedEqId, setSelectedEqId] = useState<string>(equations[0]?.id || '');
  const [calcInputs, setCalcInputs] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    equations.forEach((eq) => {
      if (eq.interactiveCalculator) {
        eq.interactiveCalculator.inputs.forEach((inp) => {
          initial[`${eq.id}_${inp.key}`] = inp.default;
        });
      }
    });
    return initial;
  });

  const activeEquation = equations.find((eq) => eq.id === selectedEqId) || equations[0];

  const handleInputChange = (eqId: string, key: string, val: number) => {
    setCalcInputs((prev) => ({
      ...prev,
      [`${eqId}_${key}`]: val,
    }));
  };

  const getEquationInputs = (eq: EngineeringEquation) => {
    if (!eq.interactiveCalculator) return {};
    const inputs: Record<string, number> = {};
    eq.interactiveCalculator.inputs.forEach((inp) => {
      inputs[inp.key] = calcInputs[`${eq.id}_${inp.key}`] ?? inp.default;
    });
    return inputs;
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00f2ad]" />
          <h3 className="text-xs font-mono-cad uppercase tracking-wider font-semibold text-slate-200">
            Engineering Analysis & Governing Physics
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          First-principles mathematical models, variable breakdowns, and live parametric calculators.
        </p>
      </div>

      {/* Equation Selectors */}
      <div className="flex flex-wrap gap-2">
        {equations.map((eq) => (
          <button
            key={eq.id}
            onClick={() => setSelectedEqId(eq.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad transition-all ${
              selectedEqId === eq.id
                ? 'bg-[#00f2ad]/15 text-[#00f2ad] border border-[#00f2ad]/40 font-semibold shadow-[0_0_12px_rgba(0,242,173,0.15)]'
                : 'bg-black/30 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            <span>{eq.title}</span>
          </button>
        ))}
      </div>

      {/* Active Equation Deep Card */}
      {activeEquation && (
        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-[11px] font-mono-cad text-[#38bdf8] uppercase tracking-wider font-semibold">
              Discipline: {activeEquation.discipline}
            </span>
            <span className="text-[10px] font-mono-cad px-2 py-0.5 rounded bg-white/5 text-slate-400">
              {activeEquation.id}
            </span>
          </div>

          <h4 className="text-base font-bold text-slate-100 font-heading">
            {activeEquation.title}
          </h4>

          {/* Latex Formula Render Box */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-center font-mono-cad text-sm sm:text-base text-[#00f2ad] tracking-wide overflow-x-auto">
            {activeEquation.latex}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {activeEquation.explanation}
          </p>

          {/* Variables Table */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono-cad text-slate-400 uppercase tracking-wider block">
              Variables & Verified Object Quantities
            </span>
            <div className="space-y-1.5 text-xs font-mono-cad">
              {activeEquation.variables.map((v) => (
                <div
                  key={v.symbol}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#38bdf8] font-bold w-12">{v.symbol}</span>
                    <span className="text-slate-300">{v.name}</span>
                    <span className="text-slate-500 text-[10px]">[{v.unit}]</span>
                  </div>
                  {v.objectValue && (
                    <span className="text-[#00f2ad] font-semibold">{v.objectValue}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Calculator Widget */}
          {activeEquation.interactiveCalculator && (
            <div className="p-4 rounded-xl bg-[#00f2ad]/[0.02] border border-[#00f2ad]/30 space-y-4 pt-3">
              <div className="flex items-center gap-2 text-xs font-mono-cad font-bold text-[#00f2ad] uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>Live Parametric Physics Calculator</span>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                {activeEquation.interactiveCalculator.inputs.map((inp) => {
                  const currentVal =
                    calcInputs[`${activeEquation.id}_${inp.key}`] ?? inp.default;
                  return (
                    <div key={inp.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono-cad">
                        <span className="text-slate-400">{inp.label}</span>
                        <span className="text-slate-200 font-semibold">
                          {currentVal} {inp.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={inp.min}
                        max={inp.max}
                        step={inp.step}
                        value={currentVal}
                        onChange={(e) =>
                          handleInputChange(activeEquation.id, inp.key, Number(e.target.value))
                        }
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f2ad]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Computed Result Box */}
              {(() => {
                const inputs = getEquationInputs(activeEquation);
                const calcResult = activeEquation.interactiveCalculator.calculate(inputs);
                return (
                  <div className="p-3.5 rounded-lg bg-black/60 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono-cad">
                      <span className="text-slate-400">Calculated Value</span>
                      <span className="text-sm font-bold text-[#00f2ad]">
                        {calcResult.formatted}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-slate-300 leading-relaxed border-t border-white/5 pt-1.5 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                      <span>{calcResult.interpretation}</span>
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

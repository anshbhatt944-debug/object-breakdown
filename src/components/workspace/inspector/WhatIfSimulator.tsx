import React, { useState } from 'react';
import { WhatIfParameter, DepthLevel } from '../../../types/objectData';
import { Sliders, RotateCcw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface WhatIfSimulatorProps {
  parameters: WhatIfParameter[];
  depthLevel: DepthLevel;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  parameters,
  depthLevel,
}) => {
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    parameters.forEach((p) => {
      initial[p.id] = p.defaultValue;
    });
    return initial;
  });

  const handleSliderChange = (id: string, val: number) => {
    setParamValues((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleReset = () => {
    const resetVals: Record<string, number> = {};
    parameters.forEach((p) => {
      resetVals[p.id] = p.defaultValue;
    });
    setParamValues(resetVals);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#00f2ad]" />
            <h3 className="text-xs font-mono-cad uppercase tracking-wider font-semibold text-slate-200">
              "What If?" Engineering Sandbox
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Experiment with physical parameters and observe predicted real-time consequences on forces, stresses, and reliability.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Simulator Parameter Sliders */}
      <div className="space-y-6">
        {parameters.map((param) => {
          const currentVal = paramValues[param.id] ?? param.defaultValue;

          return (
            <div key={param.id} className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono-cad text-slate-400 uppercase tracking-wider block">
                    {param.component}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 font-heading">
                    {param.label}
                  </h4>
                </div>

                <div className="px-3 py-1 rounded-lg bg-black/60 border border-[#00f2ad]/40 font-mono-cad text-sm font-extrabold text-[#00f2ad]">
                  {currentVal} {param.unit}
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={(param.max - param.min) / 50}
                  value={currentVal}
                  onChange={(e) => handleSliderChange(param.id, Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f2ad]"
                />
                <div className="flex justify-between text-[10px] font-mono-cad text-slate-500">
                  <span>{param.min} {param.unit}</span>
                  <span>Default: {param.defaultValue} {param.unit}</span>
                  <span>{param.max} {param.unit}</span>
                </div>
              </div>

              {/* Real-time Computed Impact Metrics */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono-cad text-slate-400 uppercase tracking-wider block">
                  Predicted Engineering Impact
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {param.impactMetrics.map((metric) => {
                    const result = metric.calculate(currentVal);
                    const isPositive = result.changePercent > 0;

                    return (
                      <div
                        key={metric.name}
                        className={`p-3 rounded-xl border space-y-1 ${
                          result.status === 'critical'
                            ? 'bg-rose-500/[0.04] border-rose-500/30'
                            : result.status === 'warning'
                            ? 'bg-amber-500/[0.04] border-amber-500/30'
                            : 'bg-black/40 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono-cad">
                          <span className="text-slate-300 font-medium">{metric.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-100 font-bold">{result.valueStr}</span>
                            <span
                              className={`text-[11px] font-semibold ${
                                isPositive ? 'text-amber-400' : 'text-[#38bdf8]'
                              }`}
                            >
                              {isPositive ? `+${result.changePercent}%` : `${result.changePercent}%`}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] font-sans text-slate-400 leading-relaxed pt-1">
                          {result.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

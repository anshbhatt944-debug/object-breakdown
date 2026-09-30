import React, { useState } from 'react';
import { WhatIfParameter, DepthLevel } from '../../../types/objectData';
import { Sliders, RotateCcw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface WhatIfSimulatorProps {
  parameters: WhatIfParameter[];
  depthLevel: DepthLevel;
  theme?: 'light' | 'dark';
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  parameters,
  depthLevel,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

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
    <div className={`p-6 space-y-6 overflow-y-auto h-full font-sans transition-colors ${
      isLight ? 'text-[#161311]' : 'text-slate-300'
    }`}>
      {/* Header */}
      <div className={`flex items-start justify-between pb-4 border-b ${isLight ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C2410C] dark:text-[#00f2ad]" />
            <h3 className={`text-xs font-mono-cad uppercase tracking-wider font-semibold ${
              isLight ? 'text-[#161311]' : 'text-slate-200'
            }`}>
              "What If?" Engineering Sandbox
            </h3>
          </div>
          <p className={`text-xs ${isLight ? 'text-[#5e5750]' : 'text-slate-400'}`}>
            Experiment with physical parameters and observe predicted real-time consequences on forces, stresses, and reliability.
          </p>
        </div>

        <button
          onClick={handleReset}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-mono-cad flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border ${
            isLight
              ? 'bg-white text-[#161311] border-[#DDD6CB] hover:bg-[#F4EFE8] shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/10 border-white/10'
          }`}
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
            <div
              key={param.id}
              className={`p-5 rounded-[4px] border space-y-4 transition-colors ${
                isLight
                  ? 'bg-white border-[#DDD6CB] shadow-[0_1px_3px_rgba(22,19,17,0.03)]'
                  : 'bg-[#211e1c] border border-[var(--line)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-[10px] font-mono-cad uppercase tracking-wider block ${
                    isLight ? 'text-[#786e64]' : 'text-slate-400'
                  }`}>
                    {param.component}
                  </span>
                  <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-[#161311]' : 'text-slate-100'}`}>
                    {param.label}
                  </h4>
                </div>

                <div className={`px-3 py-1 rounded-[3px] border font-mono-cad text-sm font-bold ${
                  isLight
                    ? 'bg-orange-50 border-orange-200 text-[#C2410C]'
                    : 'bg-black/60 border-[#00f2ad]/40 text-[#00f2ad]'
                }`}>
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
                  className={`w-full h-1.5 rounded appearance-none cursor-pointer ${
                    isLight ? 'bg-[#EAE4DC] accent-[#C2410C]' : 'bg-slate-800 accent-[#00f2ad]'
                  }`}
                />
                <div className={`flex justify-between text-[10px] font-mono-cad ${isLight ? 'text-[#786e64]' : 'text-slate-500'}`}>
                  <span>{param.min} {param.unit}</span>
                  <span>Default: {param.defaultValue} {param.unit}</span>
                  <span>{param.max} {param.unit}</span>
                </div>
              </div>

              {/* Real-time Computed Impact Metrics */}
              <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-[#DDD6CB]' : 'border-white/5'}`}>
                <span className={`text-[10px] font-mono-cad uppercase tracking-wider block ${
                  isLight ? 'text-[#786e64]' : 'text-slate-400'
                }`}>
                  Predicted Engineering Impact
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {param.impactMetrics.map((metric) => {
                    const result = metric.calculate(currentVal);
                    const isPositive = result.changePercent > 0;

                    return (
                      <div
                        key={metric.name}
                        className={`p-3 rounded-[3px] border space-y-1 ${
                          result.status === 'critical'
                            ? isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/[0.04] border-rose-500/30'
                            : result.status === 'warning'
                            ? isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/[0.04] border-amber-500/30'
                            : isLight ? 'bg-[#F4EFE8] border-[#DDD6CB]' : 'bg-black/40 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono-cad">
                          <span className={`font-medium ${isLight ? 'text-[#161311]' : 'text-slate-300'}`}>{metric.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isLight ? 'text-[#161311]' : 'text-slate-100'}`}>{result.valueStr}</span>
                            <span
                              className={`text-[11px] font-semibold ${
                                isPositive
                                  ? isLight ? 'text-amber-800' : 'text-amber-400'
                                  : isLight ? 'text-[#C2410C]' : 'text-[#38bdf8]'
                              }`}
                            >
                              {isPositive ? `+${result.changePercent}%` : `${result.changePercent}%`}
                            </span>
                          </div>
                        </div>

                        <p className={`text-[11px] font-sans leading-relaxed pt-1 ${isLight ? 'text-[#5e5750]' : 'text-slate-400'}`}>
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

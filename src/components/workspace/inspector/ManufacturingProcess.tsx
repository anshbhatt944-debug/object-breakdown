import React from 'react';
import { ManufacturingStage, DepthLevel } from '../../../types/objectData';
import { Factory, ShieldAlert, Cpu, Wrench, CheckCircle } from 'lucide-react';

interface ManufacturingProcessProps {
  timeline: ManufacturingStage[];
  depthLevel: DepthLevel;
  theme?: 'light' | 'dark';
}

export const ManufacturingProcess: React.FC<ManufacturingProcessProps> = ({
  timeline,
  depthLevel,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`p-6 space-y-6 overflow-y-auto h-full font-sans transition-colors ${
      isLight ? 'text-[#161311]' : 'text-slate-300'
    }`}>
      {/* Header */}
      <div className={`space-y-1 pb-4 border-b ${isLight ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}>
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-[#C2410C] dark:text-[#00f2ad]" />
          <h3 className={`text-xs font-mono-cad uppercase tracking-wider font-semibold ${
            isLight ? 'text-[#161311]' : 'text-slate-200'
          }`}>
            Manufacturing & Production Line Process
          </h3>
        </div>
        <p className={`text-xs ${isLight ? 'text-[#5e5750]' : 'text-slate-400'}`}>
          Factory progression from raw material billet to micro-machining, automated assembly, and QC testing.
        </p>
      </div>

      {/* Stage Timeline */}
      <div className={`space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 ${
        isLight ? 'before:bg-[#DDD6CB]' : 'before:bg-white/10'
      }`}>
        {timeline.map((stage) => (
          <div key={stage.stepNumber} className="relative pl-9 group">
            {/* Step Number Dot */}
            <div className={`absolute left-2 top-3 -translate-x-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-mono-cad font-bold shadow-sm ${
              isLight
                ? 'bg-white border-[#C2410C] text-[#C2410C]'
                : 'bg-[#0d111a] border-[#00f2ad] text-[#00f2ad]'
            }`}>
              {stage.stepNumber}
            </div>

            {/* Stage Content Card */}
            <div className={`p-4 rounded-[4px] border space-y-3 transition-colors ${
              isLight
                ? 'bg-white border-[#DDD6CB] shadow-[0_1px_3px_rgba(22,19,17,0.03)]'
                : 'bg-[#211e1c] border border-[var(--line)]'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-mono-cad uppercase tracking-wider block ${
                    isLight ? 'text-[#786e64]' : 'text-slate-400'
                  }`}>
                    STAGE {stage.stepNumber}
                  </span>
                  <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-[#161311]' : 'text-slate-100'}`}>
                    {stage.stageName}
                  </h4>
                </div>
                <span className={`text-[11px] font-mono-cad px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-orange-50 border-orange-200 text-[#C2410C]'
                    : 'bg-[#00f2ad]/10 border-[#00f2ad]/30 text-[#00f2ad]'
                }`}>
                  {stage.tolerance}
                </span>
              </div>

              <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-[#5e5750]' : 'text-slate-300'}`}>
                {stage.description}
              </p>

              {/* Machinery & Tolerances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-cad pt-1">
                <div className={`p-2 rounded-[3px] border ${isLight ? 'bg-[#F4EFE8] border-[#DDD6CB]' : 'bg-black/40 border-white/5'}`}>
                  <span className={`text-[10px] block ${isLight ? 'text-[#786e64]' : 'text-slate-500'}`}>Factory Machinery</span>
                  <span className={isLight ? 'text-[#161311] font-medium' : 'text-slate-200'}>{stage.machinery}</span>
                </div>
                <div className={`p-2 rounded-[3px] border ${isLight ? 'bg-[#F4EFE8] border-[#DDD6CB]' : 'bg-black/40 border-white/5'}`}>
                  <span className={`text-[10px] block ${isLight ? 'text-[#786e64]' : 'text-slate-500'}`}>Material Input</span>
                  <span className={isLight ? 'text-[#C2410C] font-semibold' : 'text-[#38bdf8]'}>{stage.materialReq}</span>
                </div>
              </div>

              {/* Common Quality Risks & Defect Modes */}
              {stage.commonDefects.length > 0 && (
                <div className={`flex items-start gap-1.5 p-2.5 rounded-[3px] border text-xs ${
                  isLight
                    ? 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                    : 'bg-rose-500/[0.03] border-rose-500/20 text-slate-300'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className={`text-[10px] font-mono-cad uppercase block font-semibold ${
                      isLight ? 'text-rose-800' : 'text-rose-400'
                    }`}>
                      Primary Defect Risks
                    </span>
                    <span className={`text-[11px] ${isLight ? 'text-rose-900' : 'text-slate-300'}`}>
                      {stage.commonDefects.join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { ManufacturingStage, DepthLevel } from '../../../types/objectData';
import { Factory, ShieldAlert, Cpu, Wrench, CheckCircle } from 'lucide-react';

interface ManufacturingProcessProps {
  timeline: ManufacturingStage[];
  depthLevel: DepthLevel;
}

export const ManufacturingProcess: React.FC<ManufacturingProcessProps> = ({
  timeline,
  depthLevel,
}) => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-[#00f2ad]" />
          <h3 className="text-xs font-mono-cad uppercase tracking-wider font-semibold text-slate-200">
            Manufacturing & Production Line Process
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Factory progression from raw material billet to micro-machining, automated assembly, and QC testing.
        </p>
      </div>

      {/* Stage Timeline */}
      <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {timeline.map((stage) => (
          <div key={stage.stepNumber} className="relative pl-9 group">
            {/* Step Number Dot */}
            <div className="absolute left-2 top-3 -translate-x-1/2 w-5 h-5 rounded-full bg-[#0d111a] border-2 border-[#00f2ad] flex items-center justify-center text-[10px] font-mono-cad font-bold text-[#00f2ad] shadow-[0_0_10px_rgba(0,242,173,0.3)]">
              {stage.stepNumber}
            </div>

            {/* Stage Content Card */}
            <div className="p-4 rounded-xl glass-card border border-white/10 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono-cad text-slate-400 uppercase tracking-wider block">
                    STAGE {stage.stepNumber}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 font-heading">
                    {stage.stageName}
                  </h4>
                </div>
                <span className="text-[11px] font-mono-cad text-[#00f2ad] bg-[#00f2ad]/10 px-2 py-0.5 rounded border border-[#00f2ad]/30">
                  {stage.tolerance}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {stage.description}
              </p>

              {/* Machinery & Tolerances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-cad pt-1">
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 block">Factory Machinery</span>
                  <span className="text-slate-200">{stage.machinery}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 block">Material Input</span>
                  <span className="text-[#38bdf8]">{stage.materialReq}</span>
                </div>
              </div>

              {/* Common Quality Risks & Defect Modes */}
              {stage.commonDefects.length > 0 && (
                <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-rose-500/[0.03] border border-rose-500/20 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono-cad text-rose-400 uppercase block font-semibold">
                      Primary Defect Risks
                    </span>
                    <span className="text-slate-300 text-[11px]">
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

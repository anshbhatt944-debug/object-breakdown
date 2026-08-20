import React, { useState } from 'react';
import { KinematicStep, DepthLevel } from '../../../types/objectData';
import {
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  ArrowDown,
  Activity,
  Zap,
} from 'lucide-react';

interface HowItWorksProps {
  steps: KinematicStep[];
  depthLevel: DepthLevel;
  onSelectComponentById: (id: string) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  steps,
  depthLevel,
  onSelectComponentById,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const currentStep = steps[activeStepIndex] || steps[0];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-[#00f2ad]" />
          <h3 className="text-xs font-mono-cad uppercase tracking-wider font-semibold text-slate-200">
            How It Works — Kinematic Sequence
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Step-by-step mechanical and electrical operation cycle with live component highlighting.
        </p>
      </div>

      {/* Step Navigator Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl glass-card border border-white/10">
        <button
          onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={activeStepIndex === 0}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`w-7 h-7 rounded-lg text-xs font-mono-cad font-semibold transition-all ${
                activeStepIndex === idx
                  ? 'bg-[#00f2ad] text-slate-950 shadow-[0_0_12px_#00f2ad]'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {s.step}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
          disabled={activeStepIndex === steps.length - 1}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Step Showcase Card */}
      {currentStep && (
        <div className="p-5 rounded-2xl glass-card border border-[#00f2ad]/30 bg-[#00f2ad]/[0.02] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-mono-cad text-[#00f2ad] font-bold">
              STAGE 0{currentStep.step} / 0{steps.length}
            </span>
            <span className="text-[11px] font-mono-cad text-slate-400">
              Kinematics Active
            </span>
          </div>

          <h4 className="text-lg font-bold text-slate-100 font-heading">
            {currentStep.title}
          </h4>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {currentStep.description}
          </p>

          {/* Forces & Mechanics */}
          {currentStep.forcesDescription && (
            <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 space-y-1">
              <span className="text-[11px] font-mono-cad text-purple-400 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Forces & Physical Interaction
              </span>
              <p className="text-xs font-mono-cad text-slate-300 leading-relaxed">
                {currentStep.forcesDescription}
              </p>
            </div>
          )}

          {/* Active Engaging Components */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono-cad text-slate-400 uppercase tracking-wider block">
              Active Engaging Components (Click to Highlight in 3D)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentStep.activeComponentIds.map((cid) => (
                <button
                  key={cid}
                  onClick={() => onSelectComponentById(cid)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono-cad bg-[#00f2ad]/10 hover:bg-[#00f2ad]/25 text-[#00f2ad] border border-[#00f2ad]/30 transition-all flex items-center gap-1"
                >
                  <span>{cid.replace(/-/g, ' ')}</span>
                  <ChevronRight className="w-3 h-3 text-[#00f2ad]/60" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Step Progression Overview */}
      <div className="space-y-2 pt-2">
        <h5 className="text-xs font-mono-cad uppercase text-slate-400 font-semibold">
          Full Mechanism Lifecycle
        </h5>
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div
              key={step.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                activeStepIndex === idx
                  ? 'bg-white/10 border-[#00f2ad]/50 text-slate-100'
                  : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-mono-cad text-[#00f2ad] font-bold shrink-0">
                  {step.step}
                </span>
                <span className="text-xs font-semibold truncate">{step.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

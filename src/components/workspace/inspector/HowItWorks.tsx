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
  theme?: 'light' | 'dark';
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  steps,
  depthLevel,
  onSelectComponentById,
  theme = 'dark',
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const isLight = theme === 'light';
  const currentStep = steps[activeStepIndex] || steps[0];

  return (
    <div className={`p-6 space-y-6 overflow-y-auto h-full font-sans transition-colors ${
      isLight ? 'text-[#161311]' : 'text-slate-300'
    }`}>
      {/* Header */}
      <div className={`space-y-1 pb-4 border-b ${isLight ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}>
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-[#C2410C] dark:text-[#00f2ad]" />
          <h3 className={`text-xs font-mono-cad uppercase tracking-wider font-semibold ${
            isLight ? 'text-[#161311]' : 'text-slate-200'
          }`}>
            How It Works — Kinematic Sequence
          </h3>
        </div>
        <p className={`text-xs ${isLight ? 'text-[#5e5750]' : 'text-slate-400'}`}>
          Step-by-step mechanical and electrical operation cycle with live component highlighting.
        </p>
      </div>

      {/* Step Navigator Bar */}
      <div className={`flex items-center justify-between p-3 rounded-[4px] border transition-colors ${
        isLight
          ? 'bg-white border-[#DDD6CB] shadow-[0_1px_3px_rgba(22,19,17,0.03)]'
          : 'bg-[#211e1c] border-[var(--line)]'
      }`}>
        <button
          onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={activeStepIndex === 0}
          className={`p-1.5 rounded text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
            isLight ? 'text-[#5e5750] hover:text-[#161311] hover:bg-[#F4EFE8]' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`w-7 h-7 rounded-[3px] text-xs font-mono-cad font-semibold transition-all cursor-pointer ${
                activeStepIndex === idx
                  ? isLight
                    ? 'bg-[#C2410C] text-white shadow-sm'
                    : 'bg-[#00f2ad] text-slate-950 shadow-[0_0_12px_#00f2ad]'
                  : isLight
                  ? 'bg-[#F4EFE8] text-[#5e5750] hover:text-[#161311] border border-[#DDD6CB]'
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
          className={`p-1.5 rounded text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
            isLight ? 'text-[#5e5750] hover:text-[#161311] hover:bg-[#F4EFE8]' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Step Showcase Card */}
      {currentStep && (
        <div className={`p-5 rounded-[4px] border space-y-4 transition-colors ${
          isLight
            ? 'bg-white border-[#DDD6CB] shadow-[0_1px_3px_rgba(22,19,17,0.03)]'
            : 'bg-[#211e1c] border border-[var(--line)]'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b ${
            isLight ? 'border-[#DDD6CB]' : 'border-[var(--line)]'
          }`}>
            <span className="text-xs font-mono-cad text-[#C2410C] dark:text-[#00f2ad] font-bold">
              STAGE 0{currentStep.step} / 0{steps.length}
            </span>
            <span className={`text-[11px] font-mono-cad ${isLight ? 'text-[#786e64]' : 'text-slate-400'}`}>
              Kinematics Active
            </span>
          </div>

          <h4 className={`text-lg font-bold font-sans ${isLight ? 'text-[#161311]' : 'text-slate-100'}`}>
            {currentStep.title}
          </h4>

          <p className={`text-sm leading-relaxed font-sans ${isLight ? 'text-[#5e5750]' : 'text-slate-300'}`}>
            {currentStep.description}
          </p>

          {/* Forces & Mechanics */}
          {currentStep.forcesDescription && (
            <div className={`p-3.5 rounded-[3px] border space-y-1 ${
              isLight
                ? 'bg-[#F4EFE8] border-[#DDD6CB]'
                : 'bg-black/40 border-purple-500/30'
            }`}>
              <span className={`text-[11px] font-mono-cad font-semibold flex items-center gap-1.5 ${
                isLight ? 'text-[#C2410C]' : 'text-purple-400'
              }`}>
                <Zap className="w-3.5 h-3.5" />
                Forces & Physical Interaction
              </span>
              <p className={`text-xs font-mono-cad leading-relaxed ${isLight ? 'text-[#161311]' : 'text-slate-300'}`}>
                {currentStep.forcesDescription}
              </p>
            </div>
          )}

          {/* Active Engaging Components */}
          <div className="space-y-1.5 pt-2">
            <span className={`text-[10px] font-mono-cad uppercase tracking-wider block ${
              isLight ? 'text-[#786e64]' : 'text-slate-400'
            }`}>
              Active Engaging Components (Click to Highlight in 3D)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentStep.activeComponentIds.map((cid) => (
                <button
                  key={cid}
                  onClick={() => onSelectComponentById(cid)}
                  className={`px-2.5 py-1 rounded-[3px] text-xs font-mono-cad transition-all flex items-center gap-1 cursor-pointer ${
                    isLight
                      ? 'bg-orange-50 hover:bg-orange-100 text-[#C2410C] border border-orange-200'
                      : 'bg-[#00f2ad]/10 hover:bg-[#00f2ad]/25 text-[#00f2ad] border border-[#00f2ad]/30'
                  }`}
                >
                  <span>{cid.replace(/-/g, ' ')}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Step Progression Overview */}
      <div className="space-y-2 pt-2">
        <h5 className={`text-xs font-mono-cad uppercase font-semibold ${isLight ? 'text-[#786e64]' : 'text-slate-400'}`}>
          Full Mechanism Lifecycle
        </h5>
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div
              key={step.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-3 rounded-[3px] cursor-pointer transition-all border ${
                activeStepIndex === idx
                  ? isLight
                    ? 'bg-white border-[#C2410C] text-[#161311] font-semibold shadow-sm'
                    : 'bg-white/10 border-[#00f2ad]/50 text-slate-100'
                  : isLight
                  ? 'bg-[#F4EFE8] border-[#DDD6CB] text-[#5e5750] hover:bg-white hover:text-[#161311]'
                  : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono-cad font-bold shrink-0 ${
                  isLight
                    ? 'bg-[#EAE4DC] text-[#C2410C]'
                    : 'bg-white/5 text-[#00f2ad]'
                }`}>
                  {step.step}
                </span>
                <span className="text-xs truncate">{step.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

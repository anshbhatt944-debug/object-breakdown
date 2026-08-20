import React, { useState } from 'react';
import { Sliders, RotateCcw, Activity, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface LandingSimulatorProps {
  onLaunchWorkspace: () => void;
}

export const LandingSimulator: React.FC<LandingSimulatorProps> = ({ onLaunchWorkspace }) => {
  const [springStiffness, setSpringStiffness] = useState(50); // N/m (range 10 to 100)

  // Computed consequences
  const nominalK = 35;
  const forcePct = Math.round(((springStiffness - nominalK) / nominalK) * 45);
  const travelPct = Math.round(((nominalK - springStiffness) / nominalK) * 28);
  const stressPct = Math.round(((springStiffness - nominalK) / nominalK) * 52);

  return (
    <section id="simulator" className="py-20 px-6 max-w-7xl mx-auto select-none">
      <div className="p-8 sm:p-12 rounded-3xl glass-panel-accent bg-[#0d111a]/90 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f2ad]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left info */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ad]/10 border border-[#00f2ad]/30 text-[#00f2ad] text-xs font-mono-cad font-semibold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Engineering Laboratory</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading tracking-tight">
              What if you could redesign it?
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Test physical hypotheses before manufacturing a prototype. Adjust mechanical parameters like spring rate, material modulus, or thermal dissipation and see instant live engineering feedback.
            </p>

            <button
              onClick={onLaunchWorkspace}
              className="px-5 py-3 rounded-xl bg-[#00f2ad] text-slate-950 font-mono-cad text-xs font-bold hover:brightness-110 transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,173,0.3)]"
            >
              <span>Explore Full Studio Sandbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Live Simulation Card */}
          <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-cad text-slate-400 uppercase tracking-wider block">
                  Interactive Parameter Demo
                </span>
                <h4 className="text-base font-bold text-slate-100 font-heading">
                  Spring Stiffness (k)
                </h4>
              </div>

              <span className="text-lg font-mono-cad font-extrabold text-[#00f2ad]">
                {springStiffness} N/m
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={10}
                max={100}
                value={springStiffness}
                onChange={(e) => setSpringStiffness(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f2ad]"
              />
              <div className="flex justify-between text-[10px] font-mono-cad text-slate-500">
                <span>10 N/m</span>
                <span>50 N/m</span>
                <span>100 N/m</span>
              </div>
            </div>

            {/* Impact Metric Telemetry */}
            <div className="space-y-2 pt-2 border-t border-white/5 font-mono-cad text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Calculated Physical Response:
              </span>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-slate-300 font-medium">Force Output (F)</span>
                  <span className={`font-bold ${forcePct >= 0 ? 'text-[#00f2ad]' : 'text-[#38bdf8]'}`}>
                    {forcePct >= 0 ? `+${forcePct}%` : `${forcePct}%`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-slate-300 font-medium">Travel Deflection (Δx)</span>
                  <span className={`font-bold ${travelPct >= 0 ? 'text-amber-400' : 'text-[#38bdf8]'}`}>
                    {travelPct >= 0 ? `+${travelPct}%` : `${travelPct}%`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-slate-300 font-medium">Mechanical Shear Stress (τ)</span>
                  <span className={`font-bold ${stressPct > 40 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {stressPct >= 0 ? `+${stressPct}%` : `${stressPct}%`}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSpringStiffness(50)}
              className="w-full py-2 rounded-xl text-xs font-mono-cad text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Parameter</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

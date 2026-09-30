import React, { useState } from 'react';
import { RotateCcw, ArrowRight, Activity, Sliders, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingSimulatorProps {
  onLaunchWorkspace: () => void;
}

export const LandingSimulator: React.FC<LandingSimulatorProps> = ({ onLaunchWorkspace }) => {
  const [springStiffness, setSpringStiffness] = useState<number>(45);
  const [appliedForce, setAppliedForce] = useState<number>(25);

  const nominalK = 35;
  const massKg = 0.25;

  // Real physical derivations
  const deflectionMm = Number(((appliedForce / springStiffness) * 10).toFixed(2));
  const potentialEnergyJoules = Number((0.5 * springStiffness * Math.pow(deflectionMm / 1000, 2)).toFixed(4));
  const naturalFreqHz = Number(((1 / (2 * Math.PI)) * Math.sqrt(springStiffness / massKg)).toFixed(1));
  const stressMpa = Math.round((springStiffness * 4.2) + (appliedForce * 3.1));

  // Percentage deviations for display
  const forcePct = Math.round(((springStiffness - nominalK) / nominalK) * 45);
  const travelPct = Math.round(((nominalK - springStiffness) / nominalK) * 28);
  const stressPct = Math.round(((springStiffness - nominalK) / nominalK) * 52);

  // Dynamic SVG Spring Coils
  const springCoilCount = 8;
  const springHeight = Math.max(60, Math.min(180, 180 - deflectionMm * 8));

  return (
    <section id="simulator" className="py-28 px-4 sm:px-8 max-w-[1800px] mx-auto border-t border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Narrative & CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono-cad text-[var(--text)] uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Kinematics Sandbox</span>
          </div>

          <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1] tracking-tighter text-[var(--muted)] font-heading">
            SIMULATE BEFORE <br />
            <span className="text-[var(--muted)]">MANUFACTURING.</span>
          </h2>

          <p className="text-base sm:text-lg text-[var(--muted)] font-light leading-relaxed">
            Test engineering hypotheses before cutting metal. Adjust physical parameters such as spring stiffness
            $k$ and applied mechanical loads to calculate live kinematic deflections, resonant frequencies, and stress tensors.
          </p>

          <div className="pt-4">
            <button
              onClick={onLaunchWorkspace}
              className="btn-premium flex items-center gap-3 text-xs"
              data-cursor="SANDBOX"
            >
              <span>Enter Full Studio Sandbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Physical Simulation Instrument */}
        <div className="lg:col-span-7 rounded-3xl bg-[var(--carbon)] border border-white/15 p-6 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* CAD Corners */}
          <div className="cad-corner-tl" />
          <div className="cad-corner-tr" />
          <div className="cad-corner-bl" />
          <div className="cad-corner-br" />

          {/* Instrument Header HUD */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--text)]" />
              <span className="text-xs font-mono-cad font-bold text-[var(--muted)] uppercase tracking-wider">
                Parameter Solver // Dynamic Hooke Model
              </span>
            </div>

            <button
              onClick={() => {
                setSpringStiffness(45);
                setAppliedForce(25);
              }}
              className="flex items-center gap-1.5 text-[10px] font-mono-cad text-[var(--muted)] hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Nominal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-8">
            {/* Left Interactive Sliders */}
            <div className="md:col-span-7 space-y-6">
              {/* Slider 1: Spring Stiffness (k) */}
              <div>
                <div className="flex justify-between items-center mb-2 font-mono-cad text-xs">
                  <span className="text-[var(--muted)] uppercase tracking-wider">Spring Constant (k)</span>
                  <span className="text-xl font-bold text-[var(--text)]">{springStiffness} N/m</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={springStiffness}
                  onChange={(e) => setSpringStiffness(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--text)]"
                />
              </div>

              {/* Slider 2: Applied Force (F) */}
              <div>
                <div className="flex justify-between items-center mb-2 font-mono-cad text-xs">
                  <span className="text-[var(--muted)] uppercase tracking-wider">Applied Load (F)</span>
                  <span className="text-xl font-bold text-[var(--muted)]">{appliedForce} N</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={appliedForce}
                  onChange={(e) => setAppliedForce(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--muted)]"
                />
              </div>
            </div>

            {/* Right Dynamic Spring Simulation Visualizer */}
            <div className="md:col-span-5 h-48 rounded-2xl bg-black/60 border border-white/10 p-4 flex flex-col items-center justify-between relative overflow-hidden">
              <span className="text-[9px] font-mono-cad text-[var(--muted)] uppercase tracking-widest">
                Deflection Visualizer (δ = {deflectionMm} mm)
              </span>

              {/* Animated SVG Spring */}
              <div className="relative w-16 flex items-center justify-center" style={{ height: `${springHeight}px`, transition: 'height 0.15s ease-out' }}>
                <svg viewBox="0 0 40 160" className="w-full h-full stroke-[var(--text)] fill-none stroke-[2.5]">
                  <path d="M 20 0 L 20 15 L 35 25 L 5 45 L 35 65 L 5 85 L 35 105 L 5 125 L 35 145 L 20 155 L 20 160" />
                </svg>
              </div>

              <div className="text-[10px] font-mono-cad text-[var(--text)]">
                Harmonic fn = {naturalFreqHz} Hz
              </div>
            </div>
          </div>

          {/* Real-time Engineering Consequence Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 font-mono-cad">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] uppercase tracking-wider text-[var(--muted)] block">Deflection (δ)</span>
              <span className="text-base font-bold text-[var(--muted)] mt-1 block">{deflectionMm} mm</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] uppercase tracking-wider text-[var(--muted)] block">Strain Energy (U)</span>
              <span className="text-base font-bold text-[var(--muted)] mt-1 block">{potentialEnergyJoules} J</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] uppercase tracking-wider text-[var(--muted)] block">Peak Stress (σ)</span>
              <span className="text-base font-bold text-[#ff5c35] mt-1 block">{stressMpa} MPa</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] uppercase tracking-wider text-[var(--muted)] block">Resonance (fn)</span>
              <span className="text-base font-bold text-[var(--text)] mt-1 block">{naturalFreqHz} Hz</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

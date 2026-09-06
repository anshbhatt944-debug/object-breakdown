import React, { useState } from 'react';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

interface FooterCtaProps {
  onSearch: (query: string) => void;
  theme?: 'light' | 'dark';
}

export const FooterCta: React.FC<FooterCtaProps> = ({ onSearch, theme = 'dark' }) => {
  const [query, setQuery] = useState('');
  const isLight = theme === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const samplePrompts = [
    'Mechanical Watch Escapement',
    'Turbofan Jet Engine',
    'Quadcopter Drone Gimbal',
    'Brushless DC Motor',
  ];

  return (
    <footer className={`py-24 px-6 sm:px-12 max-w-[1700px] mx-auto border-t select-none transition-colors duration-300 ${
      isLight ? 'bg-[#f4f6f9] border-slate-200' : 'bg-[#020408] border-white/10'
    }`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
        {/* Left Column: Heading & Explanation */}
        <div className="lg:col-span-6 space-y-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${
            isLight
              ? 'bg-blue-50 border border-blue-200/60 text-[#2563eb]'
              : 'bg-white/5 border border-white/10 text-[#3b82f6]'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CAD Synthesis Engine</span>
          </div>

          <h3 className={`text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[1] tracking-tighter font-heading ${
            isLight ? 'text-[#0f172a]' : 'text-white'
          }`}>
            WHAT DO YOU WANT TO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#0284c7]">
              DECONSTRUCT NEXT?
            </span>
          </h3>

          <p className={`text-sm font-mono max-w-md leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-white/50'
          }`}>
            Enter any physical mechanism, machine, or assembly. The system will analyze component hierarchies, kinematic explode paths, and engineering roles.
          </p>

          {/* Quick Click Prompts */}
          <div className="flex flex-wrap gap-2 pt-2">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onSearch(prompt)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${
                  isLight
                    ? 'bg-white hover:bg-blue-50 text-slate-700 hover:text-[#2563eb] border-slate-200 shadow-sm'
                    : 'bg-white/5 hover:bg-[#3b82f6]/20 hover:text-[#38bdf8] border-white/10 text-white/70'
                }`}
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: High-tech Terminal Search Input */}
        <div className="lg:col-span-6">
          <form
            onSubmit={handleSubmit}
            className={`rounded-2xl border p-2 sm:p-3 flex items-center gap-3 relative transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.06)] focus-within:border-[#2563eb]'
                : 'bg-[#080f1d] border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] focus-within:border-[#3b82f6]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-2 ${
              isLight ? 'bg-blue-50 text-[#2563eb]' : 'bg-white/5 text-[#3b82f6]'
            }`}>
              <Terminal className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Mechanical Escapement, Quadcopter Rotor, V8 Crankshaft..."
              className={`flex-1 bg-transparent px-2 py-3 text-sm sm:text-base focus:outline-none font-mono ${
                isLight ? 'text-[#0f172a] placeholder-slate-400' : 'text-white placeholder-white/30'
              }`}
            />

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-mono tracking-wider font-semibold shrink-0 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              <span>Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Copyright & Telemetry Bar */}
      <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-mono ${
        isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-white/40'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`font-bold ${isLight ? 'text-[#0f172a]' : 'text-white/70'}`}>OBJECT BREAKDOWN &copy; 2026</span>
          <span>•</span>
          <span>HIGH-PRECISION 3D CAD VISUALIZATION</span>
        </div>

        <div className={`flex items-center gap-6 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
          <span>Three.js Hardware Accelerated</span>
          <span>•</span>
          <span>Deterministic Kinematics</span>
        </div>
      </div>
    </footer>
  );
};

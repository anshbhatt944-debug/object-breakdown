import React, { useState } from 'react';
import { Search, ArrowRight, Box, Sparkles, Heart } from 'lucide-react';

interface FooterCtaProps {
  onSearch: (query: string) => void;
}

export const FooterCta: React.FC<FooterCtaProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <footer className="relative pt-20 pb-12 border-t border-white/10 bg-[#06080d] select-none">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Call to Action Search */}
        <div className="p-8 sm:p-12 rounded-3xl glass-panel-accent bg-[#0d111a]/85 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-heading">
              What should we take apart next?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Enter any physical object, machine, or mechanism to generate an instant 3D engineering breakdown.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full md:w-auto flex-1 max-w-md flex items-center p-1.5 rounded-2xl bg-black/60 border border-white/15 focus-within:border-[#00f2ad]/50 transition-all shadow-inner"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any object (e.g. Drone)..."
              className="flex-1 px-4 py-2.5 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono-cad"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00f2ad] text-slate-950 font-mono-cad text-xs font-bold hover:brightness-110 transition-all shrink-0 flex items-center gap-1.5 shadow-[0_0_15px_#00f2ad]"
            >
              <span>ANALYZE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer Bottom Links & Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5 text-xs font-mono-cad text-slate-500">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[#00f2ad]" />
            <span className="text-slate-300 font-bold">OBJECT BREAKDOWN</span>
            <span>— Virtual CAD Engineering Workbench</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Built for curiosity. Made for engineers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

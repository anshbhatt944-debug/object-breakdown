import React, { useState } from 'react';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

interface FooterCtaProps {
  onSearch: (query: string) => void;
  theme?: 'light' | 'dark';
}

export const FooterCta: React.FC<FooterCtaProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const samplePrompts = [
    'High-Bypass Turbofan Engine',
    'Mechanical Wristwatch',
    'Quadcopter Drone',
    'Turbocharged Car Engine',
    'Brushless DC Motor (BLDC)',
    'Ballpoint Pen',
    'Mechanical Keyboard',
  ];

  return (
    <footer className="py-24 px-6 sm:px-12 max-w-[1700px] mx-auto border-t border-[var(--line)] select-none text-[var(--text)] bg-[var(--carbon)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
        {/* Left Column: Heading & Explanation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] border border-[var(--line)] text-[0.75rem] font-sans text-[var(--muted)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CAD Synthesis Engine</span>
          </div>

          <h3 className="text-[clamp(2.5rem,5vw,4.5rem)] font-sans font-light leading-[1.05] tracking-tight text-[var(--text)]">
            What do you want to <br />
            <span>deconstruct next?</span>
          </h3>

          <p className="text-[0.875rem] font-serif max-w-md leading-relaxed text-[var(--muted)]">
            Enter any physical mechanism, machine, or assembly. The system will analyze component hierarchies, kinematic explode paths, and engineering roles.
          </p>

          {/* Quick Click Prompts */}
          <div className="flex flex-wrap gap-2 pt-2">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setQuery(prompt);
                  onSearch(prompt);
                }}
                className="px-3 py-1.5 rounded-[2px] border border-[var(--line)] text-[0.8125rem] font-sans text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)] transition-colors cursor-pointer"
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Terminal Input */}
        <div className="lg:col-span-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2px] border border-[var(--line)] p-2 sm:p-3 flex items-center gap-3 bg-[var(--carbon)]"
          >
            <div className="w-10 h-10 rounded-[2px] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--text)]">
              <Terminal className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. High-Bypass Turbofan Engine, Mechanical Wristwatch..."
              className="flex-1 min-w-0 bg-transparent px-2 text-sm sm:text-base text-[var(--text)] placeholder-[var(--muted)] focus:outline-none font-sans"
            />

            <button
              type="submit"
              disabled={!query.trim()}
              className="btn-plate btn-plate-filled shrink-0"
            >
              <span className="relative z-10 pointer-events-none flex items-center gap-1.5">
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Footer Bottom Meta Bar */}
      <div className="border-t border-[var(--line)] pt-8 flex flex-col sm:flex-row items-center justify-between text-[0.8125rem] font-sans text-[var(--muted)] gap-4">
        <div>
          <span>Object Breakdown Atlas</span>
          <span className="mx-2">&bull;</span>
          <span>Kinematic CAD Engineering</span>
        </div>
        <div>
          <span>Crafted for Architectural Deconstruction</span>
        </div>
      </div>
    </footer>
  );
};

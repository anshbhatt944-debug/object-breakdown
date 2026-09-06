import React from 'react';
import { Search, Sun, Moon, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onLaunchWorkspace: () => void;
  depthLevel: 'quick' | 'detailed' | 'engineering' | 'expert';
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigateToProgress?: (p: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onLaunchWorkspace,
  theme,
  onToggleTheme,
  onNavigateToProgress,
}) => {
  const handleScrollToFraction = (fraction: number) => {
    if (onNavigateToProgress) {
      onNavigateToProgress(fraction);
    } else {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = maxScroll * fraction;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, opts?: { duration?: number }) => void } }).__lenis;
      if (lenis) {
        lenis.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  };

  const isLight = theme === 'light';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none select-none transition-colors duration-300">
      <div className="flex items-center justify-between max-w-[1700px] mx-auto">
        {/* Minimal Brand */}
        <div className="pointer-events-auto">
          <button
            onClick={() => handleScrollToFraction(0)}
            className="flex items-center gap-2 text-xs tracking-widest font-mono text-left focus:outline-none group"
          >
            <span className={`font-semibold transition-colors ${
              isLight ? 'text-[#0f172a] group-hover:text-[#2563eb]' : 'text-white group-hover:text-[#3b82f6]'
            }`}>
              OBJECT
            </span>
            <span className={`w-px h-3 transition-colors ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
            <span className={`transition-colors ${
              isLight ? 'text-slate-400 group-hover:text-slate-700' : 'text-white/40 group-hover:text-white/70'
            }`}>
              BREAKDOWN
            </span>
          </button>
        </div>

        {/* Subtle Chapter Navigation */}
        <nav className="hidden md:flex items-center gap-7 pointer-events-auto">
          <button
            onClick={() => handleScrollToFraction(0.16)}
            className={`text-[11px] font-mono tracking-[0.2em] transition-colors uppercase relative group ${
              isLight ? 'text-slate-500 hover:text-[#0f172a]' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>WATCH</span>
            <span className={`absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
              isLight ? 'bg-[#2563eb]' : 'bg-[#3b82f6]'
            }`} />
          </button>

          <button
            onClick={() => handleScrollToFraction(0.45)}
            className={`text-[11px] font-mono tracking-[0.2em] transition-colors uppercase relative group ${
              isLight ? 'text-slate-500 hover:text-[#0f172a]' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>DRONE</span>
            <span className={`absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
              isLight ? 'bg-[#0284c7]' : 'bg-[#38bdf8]'
            }`} />
          </button>

          <button
            onClick={() => handleScrollToFraction(0.69)}
            className={`text-[11px] font-mono tracking-[0.2em] transition-colors uppercase relative group ${
              isLight ? 'text-slate-500 hover:text-[#0f172a]' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>TURBO</span>
            <span className={`absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
              isLight ? 'bg-[#2563eb]' : 'bg-[#3b82f6]'
            }`} />
          </button>

          <button
            onClick={() => handleScrollToFraction(0.76)}
            className={`text-[11px] font-mono tracking-[0.2em] transition-colors uppercase relative group ${
              isLight ? 'text-slate-500 hover:text-[#0f172a]' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>MOTOR</span>
            <span className={`absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
              isLight ? 'bg-[#0284c7]' : 'bg-[#38bdf8]'
            }`} />
          </button>

          <button
            onClick={() => handleScrollToFraction(0.83)}
            className={`text-[11px] font-mono tracking-[0.2em] transition-colors uppercase relative group ${
              isLight ? 'text-slate-500 hover:text-[#0f172a]' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>PEN</span>
            <span className={`absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
              isLight ? 'bg-[#0284c7]' : 'bg-[#38bdf8]'
            }`} />
          </button>

          <button
            onClick={() => handleScrollToFraction(0.97)}
            className={`text-[11px] font-mono tracking-[0.2em] transition-colors uppercase relative group ${
              isLight ? 'text-[#2563eb] hover:text-[#1d4ed8]' : 'text-[#3b82f6] hover:text-white'
            }`}
          >
            <span>UPLOAD</span>
            <span className={`absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
              isLight ? 'bg-[#2563eb]' : 'bg-white'
            }`} />
          </button>
        </nav>

        {/* Minimal Actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onOpenSearch}
            className={`p-2 transition-all rounded-lg ${
              isLight
                ? 'text-slate-500 hover:text-[#0f172a] hover:bg-slate-900/5'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
            title="Search objects (Cmd/Ctrl + K)"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleTheme}
            className={`p-2 transition-all rounded-lg relative overflow-hidden group ${
              isLight
                ? 'text-slate-600 hover:text-[#2563eb] hover:bg-slate-900/5'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
            aria-label="Toggle visual theme"
          >
            <div className="transition-transform duration-300 transform group-hover:rotate-45">
              {isLight ? (
                <Moon className="w-4 h-4 text-[#2563eb]" />
              ) : (
                <Sun className="w-4 h-4 text-[#f59e0b]" />
              )}
            </div>
          </button>

          <button
            onClick={onLaunchWorkspace}
            className={`px-3.5 py-1.5 text-xs font-mono tracking-widest transition-all rounded-lg flex items-center gap-1.5 ${
              isLight
                ? 'text-[#0f172a] border border-slate-300 hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-blue-50/70'
                : 'text-white border border-white/20 hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#3b82f6]/10'
            }`}
          >
            <span>STUDIO</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

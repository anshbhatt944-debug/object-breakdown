import React from 'react';
import { Box, Search, ArrowRight, Sun, Moon } from 'lucide-react';
import { DepthLevel } from '../../types/objectData';

interface NavbarProps {
  onOpenSearch: () => void;
  onLaunchWorkspace: () => void;
  depthLevel: DepthLevel;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onLaunchWorkspace,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="landing-nav fixed top-0 left-0 right-0 z-50 px-6 py-4 select-none">
      <div className="landing-nav-inner max-w-[1500px] mx-auto h-14 rounded-2xl border px-4 sm:px-5 flex items-center justify-between">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 cursor-pointer group">
          <div className="brand-mark w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Box className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="brand-title text-sm font-bold tracking-tight">OBJECT<span>//</span>BREAKDOWN</span>
            <span className="brand-subtitle text-[9px] tracking-[0.16em] uppercase">Engineering made discoverable</span>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium">
          <a href="#popular" className="nav-link">Explore</a>
          <a href="#layers" className="nav-link">Learn</a>
          <a href="#depth" className="nav-link">How It Works</a>
          <a href="#simulator" className="nav-link">About</a>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onOpenSearch} className="nav-search hidden sm:flex items-center gap-2 rounded-xl border px-3 py-2 text-xs">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          <button onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className="theme-toggle rounded-xl border w-9 h-9 flex items-center justify-center">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={onLaunchWorkspace} className="launch-btn hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold">
            Explore an object <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

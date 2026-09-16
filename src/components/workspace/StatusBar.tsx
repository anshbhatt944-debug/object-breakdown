import React from 'react';
import { ComponentNode } from '../../types/objectData';

interface StatusBarProps {
  selectedComponent?: ComponentNode | null;
  objectName: string;
  theme?: 'light' | 'dark';
}

export const StatusBar: React.FC<StatusBarProps> = ({
  selectedComponent,
  objectName,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <footer
      className={`h-6 px-4 shrink-0 flex items-center justify-between border-t text-[10px] font-mono-cad tracking-wider select-none z-30 transition-colors ${
        isLight
          ? 'bg-[#f1f4f8] border-slate-200 text-slate-600'
          : 'bg-[#0c0e13] border-[#262832] text-[#6b7082]'
      }`}
    >
      {/* Left Section: Units, Coordinate System, Active Selection */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <span className={isLight ? 'text-slate-400' : 'text-[#525666]'}>UNITS:</span>
          <span className={isLight ? 'text-slate-800 font-semibold' : 'text-[#c5c7d0] font-medium'}>
            SI (mm / deg)
          </span>
        </div>

        <span className={isLight ? 'text-slate-300' : 'text-[#262832]'}>|</span>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className={isLight ? 'text-slate-400' : 'text-[#525666]'}>DATUM:</span>
          <span className={isLight ? 'text-[#0284c7] font-semibold' : 'text-[#22d3ee] font-medium'}>
            WCS [0.00, 0.00, 0.00]
          </span>
        </div>

        <span className="hidden sm:inline text-slate-300 dark:text-[#262832]">|</span>

        <div className="flex items-center gap-1.5 truncate">
          <span className={isLight ? 'text-slate-400' : 'text-[#525666]'}>TARGET:</span>
          <span className={`truncate font-medium ${
            selectedComponent
              ? (isLight ? 'text-[#c2410c] font-semibold' : 'text-[#e27228]')
              : (isLight ? 'text-slate-700' : 'text-[#f3f4f8]')
          }`}>
            {selectedComponent ? `${selectedComponent.cadId || selectedComponent.id} // ${selectedComponent.name}` : `ROOT // ${objectName.toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* Right Section: Telemetry, Solver status, Shader mode */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className={isLight ? 'text-emerald-700 font-medium' : 'text-[#10b981] font-medium'}>
            100% CONVERGED
          </span>
        </div>

        <span className="hidden md:inline text-slate-300 dark:text-[#262832]">|</span>

        <div className="hidden lg:flex items-center gap-1.5">
          <span className={isLight ? 'text-slate-500' : 'text-[#6b7082]'}>TOLERANCE:</span>
          <span className={isLight ? 'text-slate-700' : 'text-[#c5c7d0]'}>ISO 2768-m</span>
        </div>

        <span className="hidden lg:inline text-slate-300 dark:text-[#262832]">|</span>

        <div className="flex items-center gap-1.5">
          <span className={isLight ? 'text-slate-500' : 'text-[#6b7082]'}>PIPELINE:</span>
          <span className={isLight ? 'text-slate-800 font-semibold' : 'text-[#f3f4f8] font-medium'}>
            WEBGL 2.0 PBR
          </span>
        </div>
      </div>
    </footer>
  );
};

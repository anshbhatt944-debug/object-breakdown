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
      className={`min-h-[24px] h-[calc(1.5rem+env(safe-area-inset-bottom))] md:h-6 pb-[env(safe-area-inset-bottom)] md:pb-0 px-2 sm:px-4 shrink-0 flex items-center justify-between border-t text-[10px] font-mono-cad tracking-wider select-none z-30 transition-colors ${
        isLight
          ? 'bg-[#f1f4f8] border-slate-200 text-slate-600'
          : 'bg-[#0c0e13] border-[#262832] text-[#6b7082]'
      }`}
    >
      {/* Left Section: Units, Coordinate System, Active Selection */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
        <div className="flex items-center gap-1 shrink-0">
          <span className={isLight ? 'text-slate-400' : 'text-[#525666]'}>UNITS:</span>
          <span className={isLight ? 'text-slate-800 font-semibold' : 'text-[#c5c7d0] font-medium'}>
            SI
          </span>
        </div>

        <span className={isLight ? 'text-slate-300' : 'text-[#262832]'}>|</span>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className={isLight ? 'text-slate-400' : 'text-[#525666]'}>DATUM:</span>
          <span className={isLight ? 'text-[#0284c7] font-semibold' : 'text-[#22d3ee] font-medium'}>
            WCS [0,0,0]
          </span>
        </div>

        <span className="hidden sm:inline text-slate-300 dark:text-[#262832]">|</span>

        <div className="flex items-center gap-1 truncate min-w-0">
          <span className={isLight ? 'text-slate-400' : 'text-[#525666] shrink-0'}>TARGET:</span>
          <span className={`truncate font-medium max-w-[130px] xs:max-w-[190px] sm:max-w-none ${
            selectedComponent
              ? (isLight ? 'text-[#c2410c] font-semibold' : 'text-[#e27228]')
              : (isLight ? 'text-slate-700' : 'text-[#f3f4f8]')
          }`}>
            {selectedComponent ? `${selectedComponent.cadId || selectedComponent.id} // ${selectedComponent.name}` : `ROOT // ${objectName.toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* Right Section: Telemetry, Solver status, Shader mode */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
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

        <div className="hidden xs:flex items-center gap-1.5">
          <span className={isLight ? 'text-slate-500' : 'text-[#6b7082]'}>PIPELINE:</span>
          <span className={isLight ? 'text-slate-800 font-semibold' : 'text-[#f3f4f8] font-medium'}>
            WEBGL 2.0
          </span>
        </div>
      </div>
    </footer>
  );
};

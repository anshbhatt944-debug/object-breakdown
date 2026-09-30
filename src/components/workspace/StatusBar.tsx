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
          ? 'bg-[#F7F5F0] border-[#DDD6CB] text-[#5e5750]'
          : 'bg-[#181513] border-[var(--line)] text-[#8c8278]'
      }`}
    >
      {/* Left Section: Units, Coordinate System, Active Selection */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
        <div className="flex items-center gap-1 shrink-0">
          <span className={isLight ? 'text-[#786e64]' : 'text-[#8c8278]'}>UNITS:</span>
          <span className={isLight ? 'text-[#161311] font-semibold' : 'text-[#EFEAE2] font-medium'}>
            SI
          </span>
        </div>

        <span className={isLight ? 'text-[#DDD6CB]' : 'text-[var(--line)]'}>|</span>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className={isLight ? 'text-[#786e64]' : 'text-[#8c8278]'}>DATUM:</span>
          <span className={isLight ? 'text-[#C2410C] font-semibold' : 'text-[#e27228] font-medium'}>
            WCS [0,0,0]
          </span>
        </div>

        <span className={isLight ? 'text-[#DDD6CB]' : 'text-[var(--line)]'}>|</span>

        <div className="flex items-center gap-1 truncate min-w-0">
          <span className={isLight ? 'text-[#786e64]' : 'text-[#8c8278] shrink-0'}>TARGET:</span>
          <span className={`truncate font-medium max-w-[130px] xs:max-w-[190px] sm:max-w-none ${
            selectedComponent
              ? isLight ? 'text-[#C2410C] font-semibold' : 'text-[#e27228]'
              : isLight ? 'text-[#161311]' : 'text-[#EFEAE2]'
          }`}>
            {selectedComponent ? `${selectedComponent.cadId || selectedComponent.id} // ${selectedComponent.name}` : `ROOT // ${objectName.toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* Right Section: Telemetry, Solver status, Shader mode */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
        <div className="hidden md:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className={isLight ? 'text-emerald-800 font-semibold' : 'text-[#10b981] font-medium'}>
            100% CONVERGED
          </span>
        </div>

        <span className={isLight ? 'text-[#DDD6CB]' : 'text-[var(--line)]'}>|</span>

        <div className="hidden lg:flex items-center gap-1.5">
          <span className={isLight ? 'text-[#786e64]' : 'text-[#6b7082]'}>TOLERANCE:</span>
          <span className={isLight ? 'text-[#161311] font-medium' : 'text-[#c5c7d0]'}>ISO 2768-m</span>
        </div>

        <span className={isLight ? 'text-[#DDD6CB]' : 'text-[var(--line)]'}>|</span>

        <div className="hidden xs:flex items-center gap-1.5">
          <span className={isLight ? 'text-[#786e64]' : 'text-[#6b7082]'}>PIPELINE:</span>
          <span className={isLight ? 'text-[#161311] font-semibold' : 'text-[#f3f4f8] font-medium'}>
            WEBGL 2.0
          </span>
        </div>
      </div>
    </footer>
  );
};

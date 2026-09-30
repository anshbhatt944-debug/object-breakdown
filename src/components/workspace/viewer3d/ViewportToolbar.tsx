import React from 'react';
import { ViewMode3D } from '../../../types/objectData';
import {
  Layers,
  Sparkles,
  Maximize2,
  Box,
  Eye,
  Activity,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Tag,
  Ruler,
} from 'lucide-react';

interface ViewportToolbarProps {
  explodeAmount: number;
  onExplodeChange: (val: number) => void;
  viewMode: ViewMode3D;
  onViewModeChange: (mode: ViewMode3D) => void;
  isPlayingMechanism: boolean;
  onTogglePlayMechanism: () => void;
  showLeaderLines: boolean;
  onToggleLeaderLines: () => void;
  showCalipers: boolean;
  onToggleCalipers: () => void;
  onResetView: () => void;
  theme?: 'light' | 'dark';
}

export const ViewportToolbar: React.FC<ViewportToolbarProps> = ({
  explodeAmount,
  onExplodeChange,
  viewMode,
  onViewModeChange,
  isPlayingMechanism,
  onTogglePlayMechanism,
  showLeaderLines,
  onToggleLeaderLines,
  showCalipers,
  onToggleCalipers,
  onResetView,
  theme = 'dark',
}) => {
  const isExploded = explodeAmount > 0.1;

  const handleExplodeToggle = () => {
    onExplodeChange(isExploded ? 0.0 : 1.0);
  };

  return (
    <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 w-[95%] sm:w-[92%] max-w-2xl pointer-events-none">
      {/* Explode Slider Panel */}
      <div className={`pointer-events-auto flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-[2px] w-full border shadow-xl backdrop-blur-md transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-[#F7F5F0]/95 border-[#DDD6CB] text-[#161311] shadow-md'
          : 'bg-[#181513]/95 border-[var(--line)] text-[#EFEAE2]'
      }`}>
        <button
          onClick={handleExplodeToggle}
          className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono-cad font-semibold transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 touch-manipulation min-h-[36px] sm:min-h-0 cursor-pointer ${
            isExploded
              ? theme === 'light'
                ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] shadow-xs'
                : 'bg-[rgba(226,114,40,0.15)] text-[#e27228] border border-[rgba(226,114,40,0.5)] shadow-[0_0_10px_rgba(226,114,40,0.2)]'
              : theme === 'light'
              ? 'bg-[#EAE4DC] text-[#4A423B] hover:text-[#161311] hover:bg-[#ded7cc] border border-[#DDD6CB]'
              : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#2a2420] border border-[var(--line)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
          {isExploded ? 'REASSEMBLE' : 'EXPLODE'}
        </button>

        <div className="flex-1 flex items-center gap-2.5">
          <span className={`text-[10px] font-mono-cad ${theme === 'light' ? 'text-[#786E66]' : 'text-[#8c8278]'}`}>0%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(explodeAmount * 100)}
            onChange={(e) => onExplodeChange(Number(e.target.value) / 100)}
            className={`w-full h-1 rounded appearance-none cursor-pointer ${
              theme === 'light' ? 'bg-[#DDD6CB] accent-[#C2410C]' : 'bg-[#25201c] accent-[#e27228]'
            }`}
          />
          <span className={`text-[11px] font-mono-cad font-semibold w-9 text-right ${
            theme === 'light' ? 'text-[#C2410C]' : 'text-[#e27228]'
          }`}>
            {Math.round(explodeAmount * 100)}%
          </span>
        </div>

        {/* Continuous Mechanism Kinematic Playback Toggle (Independent from Explode) */}
        <button
          onClick={onTogglePlayMechanism}
          title={isPlayingMechanism ? 'Freeze automatic continuous motion' : 'Play continuous mechanism animations'}
          className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded transition-all flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-mono-cad font-medium shrink-0 touch-manipulation min-h-[36px] sm:min-h-0 cursor-pointer ${
            isPlayingMechanism
              ? theme === 'light'
                ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] shadow-xs'
                : 'bg-[rgba(226,114,40,0.15)] text-[#e27228] border border-[rgba(226,114,40,0.5)] shadow-[0_0_10px_rgba(226,114,40,0.2)]'
              : theme === 'light'
              ? 'bg-[#EAE4DC] text-[#4A423B] hover:text-[#161311] hover:bg-[#ded7cc] border border-[#DDD6CB]'
              : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#2a2420] border border-[var(--line)]'
          }`}
        >
          {isPlayingMechanism ? (
            <>
              <Pause className={`w-3 h-3 fill-current ${theme === 'light' ? 'text-[#C2410C]' : 'text-[#e27228]'}`} />
              <span className="hidden xs:inline">ANIMATING</span>
              <span className="xs:hidden">STOP</span>
            </>
          ) : (
            <>
              <Play className={`w-3 h-3 fill-current ${theme === 'light' ? 'text-[#4A423B]' : 'text-[#c5c7d0]'}`} />
              <span className="hidden xs:inline">ANIMATE</span>
              <span className="xs:hidden">PLAY</span>
            </>
          )}
        </button>
      </div>

      {/* View Mode Presets & Tool Icons */}
      <div className={`pointer-events-auto flex items-center gap-1 p-1 rounded-[2px] border shadow-xl backdrop-blur-md overflow-x-auto no-scrollbar max-w-full transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-[#F7F5F0]/95 border-[#DDD6CB] text-[#161311] shadow-md'
          : 'bg-[#181513]/95 border-[var(--line)] text-[#EFEAE2]'
      }`}>
        {/* Solid CAD */}
        <button
          onClick={() => onViewModeChange('solid')}
          className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono-cad flex items-center gap-1 sm:gap-1.5 transition-all touch-manipulation whitespace-nowrap min-h-[36px] sm:min-h-0 cursor-pointer ${
            viewMode === 'solid'
              ? theme === 'light'
                ? 'bg-white text-[#C2410C] font-semibold border border-[#DDD6CB] shadow-xs'
                : 'bg-[#25201c] text-[#EFEAE2] font-semibold border border-[rgba(226,114,40,0.7)]'
              : theme === 'light'
              ? 'text-[#5C554E] hover:text-[#161311] hover:bg-white/80 border border-transparent'
              : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#211e1c] border border-transparent'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          Solid
        </button>

        {/* X-Ray */}
        <button
          onClick={() => onViewModeChange('xray')}
          className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono-cad flex items-center gap-1.5 transition-all touch-manipulation whitespace-nowrap min-h-[36px] sm:min-h-0 cursor-pointer ${
            viewMode === 'xray'
              ? theme === 'light'
                ? 'bg-white text-[#C2410C] font-semibold border border-[#DDD6CB] shadow-xs'
                : 'bg-[#25201c] text-[#e27228] font-semibold border border-[rgba(226,114,40,0.7)]'
              : theme === 'light'
              ? 'text-[#5C554E] hover:text-[#161311] hover:bg-white/80 border border-transparent'
              : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#211e1c] border border-transparent'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          X-Ray
        </button>

        {/* Wireframe */}
        <button
          onClick={() => onViewModeChange('wireframe')}
          className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono-cad flex items-center gap-1.5 transition-all touch-manipulation whitespace-nowrap min-h-[36px] sm:min-h-0 cursor-pointer ${
            viewMode === 'wireframe'
              ? theme === 'light'
                ? 'bg-white text-[#C2410C] font-semibold border border-[#DDD6CB] shadow-xs'
                : 'bg-[#25201c] text-[#e27228] font-semibold border border-[rgba(226,114,40,0.7)]'
              : theme === 'light'
              ? 'text-[#5C554E] hover:text-[#161311] hover:bg-white/80 border border-transparent'
              : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#211e1c] border border-transparent'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Wireframe
        </button>

        {/* FEA Stress Map */}
        <button
          onClick={() => onViewModeChange('stress')}
          className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono-cad flex items-center gap-1.5 transition-all touch-manipulation whitespace-nowrap min-h-[36px] sm:min-h-0 cursor-pointer ${
            viewMode === 'stress'
              ? theme === 'light'
                ? 'bg-white text-[#C2410C] font-semibold border border-[#DDD6CB] shadow-xs'
                : 'bg-[#25201c] text-[#e27228] font-semibold border border-[rgba(226,114,40,0.7)]'
              : theme === 'light'
              ? 'text-[#5C554E] hover:text-[#161311] hover:bg-white/80 border border-transparent'
              : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#211e1c] border border-transparent'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Stress
        </button>

        {/* Thermal Map */}
        <button
          onClick={() => onViewModeChange('thermal')}
          className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono-cad flex items-center gap-1.5 transition-all touch-manipulation whitespace-nowrap min-h-[36px] sm:min-h-0 cursor-pointer ${
            viewMode === 'thermal'
              ? theme === 'light'
                ? 'bg-white text-[#C2410C] font-semibold border border-[#DDD6CB] shadow-xs'
                : 'bg-[#25201c] text-[#e27228] font-semibold border border-[rgba(226,114,40,0.7)]'
              : theme === 'light'
              ? 'text-[#5C554E] hover:text-[#161311] hover:bg-white/80 border border-transparent'
              : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#211e1c] border border-transparent'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Thermal
        </button>

        <div className={`w-[1px] h-3.5 mx-0.5 sm:mx-1 shrink-0 ${theme === 'light' ? 'bg-[#DDD6CB]' : 'bg-[var(--line)]'}`} />

        {/* Leader Lines Pin Toggle */}
        <button
          onClick={onToggleLeaderLines}
          title="Toggle 3D Leader Line Pins"
          className={`p-2 sm:p-1.5 rounded transition-all touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0 cursor-pointer ${
            showLeaderLines
              ? theme === 'light'
                ? 'bg-white text-[#C2410C] border border-[#DDD6CB] shadow-xs'
                : 'bg-[#25201c] text-[#e27228] border border-[rgba(226,114,40,0.7)]'
              : theme === 'light'
              ? 'text-[#5C554E] hover:text-[#161311] hover:bg-white/80 border border-transparent'
              : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#211e1c] border border-transparent'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
        </button>

        {/* Calipers Measurement Toggle */}
        <button
          onClick={onToggleCalipers}
          title="Toggle CAD Dimension Calipers"
          className={`p-2 sm:p-1.5 rounded transition-all touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0 cursor-pointer ${
            showCalipers
              ? theme === 'light'
                ? 'bg-white text-[#C2410C] border border-[#DDD6CB] shadow-xs'
                : 'bg-[#25201c] text-[#e27228] border border-[rgba(226,114,40,0.7)]'
              : theme === 'light'
              ? 'text-[#5C554E] hover:text-[#161311] hover:bg-white/80 border border-transparent'
              : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#211e1c] border border-transparent'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetView}
          title="Reset Camera Framing"
          className={`p-2 sm:p-1.5 rounded transition-all touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center shrink-0 cursor-pointer ${
            theme === 'light'
              ? 'text-[#5C554E] hover:text-[#161311] hover:bg-white/80 border border-transparent'
              : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#211e1c] border border-transparent'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

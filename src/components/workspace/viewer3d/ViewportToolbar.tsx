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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5 w-[92%] max-w-2xl pointer-events-none">
      {/* Explode Slider Panel */}
      <div className={`pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded w-full border shadow-xl transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
          : 'bg-[#1a1b21] border-[#262832] text-[#f3f4f8]'
      }`}>
        <button
          onClick={handleExplodeToggle}
          className={`px-2.5 py-1 rounded text-[11px] font-mono-cad font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            isExploded
              ? theme === 'light'
                ? 'bg-orange-50 text-[#c2410c] border border-orange-200'
                : 'bg-[rgba(226,114,40,0.15)] text-[#e27228] border border-[rgba(226,114,40,0.5)] shadow-[0_0_10px_rgba(226,114,40,0.2)]'
              : theme === 'light'
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              : 'bg-[#111318] text-[#c5c7d0] hover:bg-[#37393f]/40 border border-[#262832]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#e27228]" />
          {isExploded ? 'REASSEMBLE' : 'EXPLODE'}
        </button>

        <div className="flex-1 flex items-center gap-2.5">
          <span className={`text-[10px] font-mono-cad ${theme === 'light' ? 'text-slate-500' : 'text-[#6b7082]'}`}>0%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(explodeAmount * 100)}
            onChange={(e) => onExplodeChange(Number(e.target.value) / 100)}
            className={`w-full h-1 rounded appearance-none cursor-pointer ${
              theme === 'light' ? 'bg-slate-200 accent-[#c2410c]' : 'bg-[#0c0e13] accent-[#e27228]'
            }`}
          />
          <span className={`text-[11px] font-mono-cad font-semibold w-9 text-right ${
            theme === 'light' ? 'text-[#c2410c]' : 'text-[#e27228]'
          }`}>
            {Math.round(explodeAmount * 100)}%
          </span>
        </div>

        {/* Continuous Mechanism Kinematic Playback Toggle (Independent from Explode) */}
        <button
          onClick={onTogglePlayMechanism}
          title={isPlayingMechanism ? 'Freeze automatic continuous motion' : 'Play continuous mechanism animations'}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 text-[11px] font-mono-cad font-medium shrink-0 ${
            isPlayingMechanism
              ? theme === 'light'
                ? 'bg-orange-50 text-[#c2410c] border border-orange-200'
                : 'bg-[rgba(226,114,40,0.15)] text-[#e27228] border border-[rgba(226,114,40,0.5)] shadow-[0_0_10px_rgba(226,114,40,0.2)]'
              : theme === 'light'
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              : 'bg-[#111318] text-[#c5c7d0] hover:bg-[#37393f]/40 hover:text-white border border-[#262832]'
          }`}
        >
          {isPlayingMechanism ? (
            <>
              <Pause className={`w-3 h-3 fill-current ${theme === 'light' ? 'text-[#c2410c]' : 'text-[#e27228]'}`} />
              <span>ANIMATING</span>
            </>
          ) : (
            <>
              <Play className={`w-3 h-3 fill-current ${theme === 'light' ? 'text-slate-600' : 'text-[#c5c7d0]'}`} />
              <span>ANIMATE</span>
            </>
          )}
        </button>
      </div>

      {/* View Mode Presets & Tool Icons */}
      <div className={`pointer-events-auto flex items-center gap-1 p-1 rounded border shadow-xl overflow-x-auto max-w-full transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
          : 'bg-[#1a1b21] border-[#262832] text-[#f3f4f8]'
      }`}>
        {/* Solid CAD */}
        <button
          onClick={() => onViewModeChange('solid')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'solid'
              ? theme === 'light'
                ? 'bg-orange-50 text-[#c2410c] font-semibold border border-orange-200'
                : 'bg-[#16181f] text-white font-semibold border border-[rgba(226,114,40,0.6)]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#111318]'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          Solid
        </button>

        {/* X-Ray */}
        <button
          onClick={() => onViewModeChange('xray')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'xray'
              ? theme === 'light'
                ? 'bg-cyan-50 text-[#0284c7] font-semibold border border-cyan-200'
                : 'bg-[#16181f] text-[#22d3ee] font-semibold border border-[rgba(34,211,238,0.6)]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#111318]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          X-Ray
        </button>

        {/* Wireframe */}
        <button
          onClick={() => onViewModeChange('wireframe')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'wireframe'
              ? theme === 'light'
                ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                : 'bg-[#16181f] text-[#c084fc] font-semibold border border-[rgba(192,132,252,0.6)]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#111318]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Wireframe
        </button>

        {/* FEA Stress Map */}
        <button
          onClick={() => onViewModeChange('stress')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'stress'
              ? theme === 'light'
                ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200'
                : 'bg-[#16181f] text-[#f59e0b] font-semibold border border-[rgba(245,158,11,0.6)]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#111318]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          FEA Stress
        </button>

        {/* Thermal Map */}
        <button
          onClick={() => onViewModeChange('thermal')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'thermal'
              ? theme === 'light'
                ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200'
                : 'bg-[#16181f] text-[#ef4444] font-semibold border border-[rgba(239,68,68,0.6)]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#111318]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Thermal
        </button>

        <div className={`w-[1px] h-3.5 mx-1 ${theme === 'light' ? 'bg-slate-200' : 'bg-[#262832]'}`} />

        {/* Leader Lines Pin Toggle */}
        <button
          onClick={onToggleLeaderLines}
          title="Toggle 3D Leader Line Pins"
          className={`p-1.5 rounded transition-all ${
            showLeaderLines
              ? theme === 'light'
                ? 'bg-orange-50 text-[#c2410c] border border-orange-200'
                : 'bg-[#16181f] text-[#e27228] border border-[rgba(226,114,40,0.5)]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#111318]'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
        </button>

        {/* Calipers Measurement Toggle */}
        <button
          onClick={onToggleCalipers}
          title="Toggle CAD Dimension Calipers"
          className={`p-1.5 rounded transition-all ${
            showCalipers
              ? theme === 'light'
                ? 'bg-cyan-50 text-[#0284c7] border border-cyan-200'
                : 'bg-[#16181f] text-[#22d3ee] border border-[rgba(34,211,238,0.5)]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#111318]'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetView}
          title="Reset Camera Framing"
          className={`p-1.5 rounded transition-all ${
            theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#111318]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

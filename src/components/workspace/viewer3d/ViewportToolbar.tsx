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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-[92%] max-w-2xl pointer-events-none">
      {/* Explode Slider Panel */}
      <div className={`pointer-events-auto flex items-center gap-4 px-5 py-2.5 rounded-2xl w-full backdrop-blur-xl border shadow-2xl transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
          : 'bg-[#0d111a]/85 border-white/10 text-white'
      }`}>
        <button
          onClick={handleExplodeToggle}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-cad font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            isExploded
              ? theme === 'light'
                ? 'bg-blue-50 text-[#0284c7] border border-blue-200'
                : 'bg-[#3b82f6]/20 text-[#38bdf8] border border-[#3b82f6]/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : theme === 'light'
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {isExploded ? 'REASSEMBLE' : 'EXPLODE'}
        </button>

        <div className="flex-1 flex items-center gap-3">
          <span className={`text-[11px] font-mono-cad ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>0%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(explodeAmount * 100)}
            onChange={(e) => onExplodeChange(Number(e.target.value) / 100)}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
              theme === 'light' ? 'bg-slate-200 accent-[#2563eb]' : 'bg-slate-800 accent-[#3b82f6]'
            }`}
          />
          <span className={`text-[11px] font-mono-cad font-semibold w-9 text-right ${
            theme === 'light' ? 'text-[#0284c7]' : 'text-[#38bdf8]'
          }`}>
            {Math.round(explodeAmount * 100)}%
          </span>
        </div>

        {/* Continuous Mechanism Kinematic Playback Toggle (Independent from Explode) */}
        <button
          onClick={onTogglePlayMechanism}
          title={isPlayingMechanism ? 'Freeze automatic continuous motion' : 'Play continuous mechanism animations'}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-mono-cad font-medium shrink-0 ${
            isPlayingMechanism
              ? theme === 'light'
                ? 'bg-blue-50 text-[#0284c7] border border-blue-200'
                : 'bg-[#3b82f6]/20 text-[#38bdf8] border border-[#3b82f6]/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
              : theme === 'light'
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          {isPlayingMechanism ? (
            <>
              <Pause className={`w-3.5 h-3.5 fill-current ${theme === 'light' ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`} />
              <span>ANIMATING</span>
            </>
          ) : (
            <>
              <Play className={`w-3.5 h-3.5 fill-current ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`} />
              <span>ANIMATE</span>
            </>
          )}
        </button>
      </div>

      {/* View Mode Presets & Tool Icons */}
      <div className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl border shadow-xl overflow-x-auto max-w-full backdrop-blur-xl transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
          : 'bg-[#0d111a]/85 border-white/10 text-white'
      }`}>
        {/* Solid CAD */}
        <button
          onClick={() => onViewModeChange('solid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'solid'
              ? theme === 'light'
                ? 'bg-blue-50 text-[#0284c7] font-semibold border border-blue-200'
                : 'bg-[#3b82f6]/20 text-[#38bdf8] font-semibold border border-[#3b82f6]/40'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          Solid
        </button>

        {/* X-Ray */}
        <button
          onClick={() => onViewModeChange('xray')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'xray'
              ? theme === 'light'
                ? 'bg-cyan-50 text-[#0284c7] font-semibold border border-cyan-200'
                : 'bg-[#38bdf8]/20 text-[#38bdf8] font-semibold border border-[#38bdf8]/40'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          X-Ray
        </button>

        {/* Wireframe */}
        <button
          onClick={() => onViewModeChange('wireframe')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'wireframe'
              ? theme === 'light'
                ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                : 'bg-[#a855f7]/20 text-[#a855f7] font-semibold border border-[#a855f7]/40'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Wireframe
        </button>

        {/* FEA Stress Map */}
        <button
          onClick={() => onViewModeChange('stress')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'stress'
              ? theme === 'light'
                ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200'
                : 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/40'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          FEA Stress
        </button>

        {/* Thermal Map */}
        <button
          onClick={() => onViewModeChange('thermal')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'thermal'
              ? theme === 'light'
                ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200'
                : 'bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/40'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Thermal
        </button>

        <div className={`w-[1px] h-4 mx-1 ${theme === 'light' ? 'bg-slate-200' : 'bg-white/10'}`} />

        {/* Leader Lines Pin Toggle */}
        <button
          onClick={onToggleLeaderLines}
          title="Toggle 3D Leader Line Pins"
          className={`p-1.5 rounded-lg transition-all ${
            showLeaderLines
              ? theme === 'light'
                ? 'bg-blue-50 text-[#0284c7] border border-blue-200'
                : 'bg-[#3b82f6]/20 text-[#38bdf8]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
        </button>

        {/* Calipers Measurement Toggle */}
        <button
          onClick={onToggleCalipers}
          title="Toggle CAD Dimension Calipers"
          className={`p-1.5 rounded-lg transition-all ${
            showCalipers
              ? theme === 'light'
                ? 'bg-cyan-50 text-[#0284c7] border border-cyan-200'
                : 'bg-[#38bdf8]/20 text-[#38bdf8]'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetView}
          title="Reset Camera Framing"
          className={`p-1.5 rounded-lg transition-all ${
            theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

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
}) => {
  const isExploded = explodeAmount > 0.1;

  const handleExplodeToggle = () => {
    onExplodeChange(isExploded ? 0.0 : 1.0);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-[92%] max-w-2xl pointer-events-none">
      {/* Explode Slider Panel */}
      <div className="pointer-events-auto flex items-center gap-4 px-5 py-2.5 rounded-2xl glass-panel-accent w-full backdrop-blur-xl bg-[#0d111a]/85 border border-white/10 shadow-2xl">
        <button
          onClick={handleExplodeToggle}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-cad font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            isExploded
              ? 'bg-[#00f2ad]/20 text-[#00f2ad] border border-[#00f2ad]/40 shadow-[0_0_15px_rgba(0,242,173,0.25)]'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {isExploded ? 'REASSEMBLE' : 'EXPLODE'}
        </button>

        <div className="flex-1 flex items-center gap-3">
          <span className="text-[11px] font-mono-cad text-slate-400">0%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(explodeAmount * 100)}
            onChange={(e) => onExplodeChange(Number(e.target.value) / 100)}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f2ad]"
          />
          <span className="text-[11px] font-mono-cad text-[#00f2ad] font-semibold w-9 text-right">
            {Math.round(explodeAmount * 100)}%
          </span>
        </div>

        {/* Mechanism Kinematic Playback Toggle */}
        <button
          onClick={onTogglePlayMechanism}
          title={isPlayingMechanism ? 'Pause Mechanism' : 'Play Kinematic Mechanism'}
          className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-mono-cad ${
            isPlayingMechanism
              ? 'bg-[#00f2ad] text-slate-950 font-bold shadow-[0_0_15px_#00f2ad]'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          {isPlayingMechanism ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span className="hidden sm:inline">{isPlayingMechanism ? 'RUNNING' : 'ANIMATE'}</span>
        </button>
      </div>

      {/* View Mode Presets & Tool Icons */}
      <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl glass-panel bg-[#0d111a]/85 border border-white/10 shadow-xl overflow-x-auto max-w-full">
        {/* Solid CAD */}
        <button
          onClick={() => onViewModeChange('solid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'solid' ? 'bg-[#00f2ad]/20 text-[#00f2ad] font-semibold border border-[#00f2ad]/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          Solid
        </button>

        {/* X-Ray */}
        <button
          onClick={() => onViewModeChange('xray')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'xray' ? 'bg-[#38bdf8]/20 text-[#38bdf8] font-semibold border border-[#38bdf8]/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          X-Ray
        </button>

        {/* Wireframe */}
        <button
          onClick={() => onViewModeChange('wireframe')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'wireframe' ? 'bg-[#a855f7]/20 text-[#a855f7] font-semibold border border-[#a855f7]/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Wireframe
        </button>

        {/* FEA Stress Map */}
        <button
          onClick={() => onViewModeChange('stress')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'stress' ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          FEA Stress
        </button>

        {/* Thermal Map */}
        <button
          onClick={() => onViewModeChange('thermal')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
            viewMode === 'thermal' ? 'bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Thermal
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        {/* Leader Lines Pin Toggle */}
        <button
          onClick={onToggleLeaderLines}
          title="Toggle 3D Leader Line Pins"
          className={`p-1.5 rounded-lg transition-all ${
            showLeaderLines ? 'bg-[#00f2ad]/20 text-[#00f2ad]' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
        </button>

        {/* Calipers Measurement Toggle */}
        <button
          onClick={onToggleCalipers}
          title="Toggle CAD Dimension Calipers"
          className={`p-1.5 rounded-lg transition-all ${
            showCalipers ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        {/* Reset View */}
        <button
          onClick={onResetView}
          title="Reset Camera View"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

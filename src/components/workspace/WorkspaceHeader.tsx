import React from 'react';
import { ALL_OBJECTS } from '../../data/objectRegistry';
import { ObjectBreakdownData, DepthLevel } from '../../types/objectData';
import { ChevronLeft, Scale, Sun, Moon, Box, Activity, Sparkles, Layers, Upload } from 'lucide-react';

interface WorkspaceHeaderProps {
  currentObject: ObjectBreakdownData;
  onSelectObject: (obj: ObjectBreakdownData) => void;
  depthLevel: DepthLevel;
  onDepthChange: (depth: DepthLevel) => void;
  onOpenCompare: () => void;
  onReturnHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUploadModel?: (file: File) => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  currentObject,
  onSelectObject,
  depthLevel,
  onDepthChange,
  onOpenCompare,
  onReturnHome,
  theme,
  onToggleTheme,
  onUploadModel,
}) => {
  const depthModes: { id: DepthLevel; label: string; badge: string }[] = [
    { id: 'quick', label: 'Quick', badge: '30s' },
    { id: 'detailed', label: 'Detailed', badge: 'Part' },
    { id: 'engineering', label: 'Engineering', badge: 'DFMA' },
    { id: 'expert', label: 'Expert', badge: 'FEA' },
  ];

  const isLight = theme === 'light';

  return (
    <header className={`workspace-header h-[70px] px-6 flex items-center justify-between border-b ${
      isLight ? 'border-slate-200 bg-white/95 text-slate-800 shadow-sm' : 'border-white/10 bg-[#080b11]/90 text-white'
    } backdrop-blur-xl select-none z-30`}>
      {/* Left: Exit Studio + Object Switcher */}
      <div className="flex items-center gap-6">
        <button
          onClick={onReturnHome}
          className={`flex items-center gap-2 text-xs font-mono-cad uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
            isLight
              ? 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border-slate-200'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
          }`}
          data-cursor="EXIT"
        >
          <ChevronLeft className="w-4 h-4 text-[#00f2ad]" />
          <span>Exit Studio</span>
        </button>

        <div className={`h-6 w-px ${isLight ? 'bg-slate-200' : 'bg-white/10'} hidden sm:block`} />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00f2ad]/10 border border-[#00f2ad]/30 flex items-center justify-center text-[#00f2ad] shrink-0">
            <Box className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-cad text-[#00f2ad] uppercase tracking-widest font-bold">
                TARGET ASSET //
              </span>
              <select
                value={currentObject.id}
                onChange={(e) => {
                  const selected = ALL_OBJECTS.find((o) => o.id === e.target.value);
                  if (selected) onSelectObject(selected);
                }}
                className={`bg-transparent text-sm font-bold focus:outline-none cursor-pointer uppercase tracking-wider font-mono-cad border-b border-dashed pb-0.5 hover:border-[#00f2ad] transition-colors ${
                  isLight ? 'text-slate-900 border-slate-300' : 'text-slate-100 border-white/20'
                }`}
              >
                {!ALL_OBJECTS.some((o) => o.id === currentObject.id) && (
                  <option
                    value={currentObject.id}
                    className={isLight ? 'bg-white text-blue-600 font-bold' : 'bg-[#0a0d14] text-[#00f2ad] font-bold'}
                  >
                    ★ {currentObject.name.toUpperCase()} (UPLOADED)
                  </option>
                )}
                {ALL_OBJECTS.map((obj) => (
                  <option key={obj.id} value={obj.id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#0a0d14] text-slate-200'}>
                    {obj.name}
                  </option>
                ))}
              </select>
            </div>
            <span className={`text-[10px] font-mono-cad ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              {currentObject.category} • {currentObject.stats.componentCount} Components
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Depth Mode Selector Pill */}
      <div className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/50 border-white/10'
      }`}>
        {depthModes.map((dm) => {
          const isSelected = depthLevel === dm.id;
          return (
            <button
              key={dm.id}
              onClick={() => onDepthChange(dm.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-cad uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#00f2ad] text-[#050608] font-bold shadow-[0_0_15px_rgba(0,242,173,0.3)]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{dm.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-normal ${
                  isSelected ? 'bg-black/20 text-black' : isLight ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-slate-400'
                }`}
              >
                {dm.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Upload + Compare + Theme Toggle */}
      <div className="flex items-center gap-3">
        {onUploadModel && (
          <label
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono-cad uppercase tracking-wider transition-all cursor-pointer ${
              isLight
                ? 'bg-blue-50 hover:bg-blue-100 text-[#2563eb] border-blue-200'
                : 'bg-white/5 hover:bg-[#38bdf8]/15 text-slate-300 hover:text-[#38bdf8] border-white/10 hover:border-[#38bdf8]/40'
            }`}
            data-cursor="UPLOAD"
            title="Upload GLB or GLTF 3D model"
          >
            <Upload className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">Upload</span>
            <input
              type="file"
              accept=".glb,.gltf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUploadModel(file);
                  e.target.value = '';
                }
              }}
            />
          </label>
        )}

        <button
          onClick={onOpenCompare}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono-cad uppercase tracking-wider transition-all ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border-slate-200'
              : 'bg-white/5 hover:bg-[#00f2ad]/10 text-slate-300 hover:text-[#00f2ad] border-white/10 hover:border-[#00f2ad]/30'
          }`}
          data-cursor="COMPARE"
        >
          <Scale className="w-3.5 h-3.5 text-[#00f2ad]" />
          <span className="hidden sm:inline">Compare</span>
        </button>

        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};

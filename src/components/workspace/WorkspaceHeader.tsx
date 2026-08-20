import React from 'react';
import { ALL_OBJECTS } from '../../data/objectRegistry';
import { ObjectBreakdownData, DepthLevel } from '../../types/objectData';
import {
  ChevronLeft,
  ChevronDown,
  Layers,
  Sparkles,
  Download,
  Scale,
  Sliders,
  Sun,
  Moon,
  Share2,
  Box,
} from 'lucide-react';

interface WorkspaceHeaderProps {
  currentObject: ObjectBreakdownData;
  onSelectObject: (obj: ObjectBreakdownData) => void;
  depthLevel: DepthLevel;
  onDepthChange: (depth: DepthLevel) => void;
  onOpenCompare: () => void;
  onReturnHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
}) => {
  const depthModes: { id: DepthLevel; label: string; color: string; bg: string; dot: string }[] = [
    { id: 'quick', label: 'Quick', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/40', dot: 'bg-emerald-400' },
    { id: 'detailed', label: 'Detailed', color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/40', dot: 'bg-sky-400' },
    { id: 'engineering', label: 'Engineering', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/40', dot: 'bg-purple-400' },
    { id: 'expert', label: 'Expert', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/40', dot: 'bg-rose-400' },
  ];

  const handleExportSpecs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentObject.id}-engineering-spec.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header className="workspace-header h-16 px-4 sm:px-6 flex items-center justify-between select-none z-40">
      {/* Left Breadcrumbs & Object Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onReturnHome}
          className="flex items-center gap-1 text-xs font-mono-cad text-slate-400 hover:text-[#00f2ad] transition-all p-1.5 rounded-lg hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Landing</span>
        </button>

        <div className="w-[1px] h-4 bg-white/10" />

        {/* Brand Icon */}
        <div
          onClick={onReturnHome}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#00f2ad]/10 border border-[#00f2ad]/30 flex items-center justify-center text-[#00f2ad] group-hover:shadow-[0_0_15px_#00f2ad] transition-all">
            <Box className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-tight hidden md:inline">OBJECT<span className="brand-slash">//</span>BREAKDOWN</span>
        </div>

        <span className="text-slate-600 hidden sm:inline">/</span>

        {/* Object Quick Switcher Dropdown */}
        <div className="relative">
          <select
            value={currentObject.id}
            onChange={(e) => {
              const selected = ALL_OBJECTS.find((o) => o.id === e.target.value);
              if (selected) onSelectObject(selected);
            }}
            className="bg-black/50 border border-white/10 hover:border-[#00f2ad]/50 rounded-xl px-3 py-1.5 text-xs font-mono-cad font-semibold text-slate-100 focus:outline-none cursor-pointer transition-all"
          >
            {ALL_OBJECTS.map((obj) => (
              <option key={obj.id} value={obj.id} className="bg-[#0d111a] text-slate-200">
                {obj.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Depth Selector */}
      <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
        <span className="text-[10px] font-mono-cad text-slate-500 uppercase px-2">Depth:</span>
        {depthModes.map((dm) => {
          const isActive = depthLevel === dm.id;
          return (
            <button
              key={dm.id}
              onClick={() => onDepthChange(dm.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all ${
                isActive
                  ? `${dm.bg} ${dm.color} font-semibold border shadow-md`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${dm.dot}`} />
              <span>{dm.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCompare}
          className="px-3 py-1.5 rounded-xl text-xs font-mono-cad text-slate-300 hover:text-[#00f2ad] hover:bg-white/5 border border-white/10 transition-all flex items-center gap-1.5"
        >
          <Scale className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="hidden sm:inline">Compare</span>
        </button>

        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="theme-toggle rounded-xl border w-9 h-9 flex items-center justify-center"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={handleExportSpecs}
          title="Export JSON / CAD Specification Report"
          className="p-2 rounded-xl text-xs font-mono-cad text-slate-300 hover:text-[#00f2ad] hover:bg-white/5 border border-white/10 transition-all flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Export CAD Spec</span>
        </button>
      </div>
    </header>
  );
};

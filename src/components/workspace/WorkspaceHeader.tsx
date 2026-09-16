import React from 'react';
import { ALL_OBJECTS } from '../../data/objectRegistry';
import { ObjectBreakdownData, DepthLevel } from '../../types/objectData';
import { ChevronLeft, Scale, Sun, Moon, Box, Activity, Sparkles, Layers, Upload } from 'lucide-react';

interface WorkspaceHeaderProps {
  currentObject: ObjectBreakdownData;
  onSelectObject: (obj: ObjectBreakdownData) => void;
  uploadedObject?: ObjectBreakdownData | null;
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
  uploadedObject = null,
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
    <header
      className={`workspace-header h-12 px-4 flex items-center justify-between border-b text-xs font-mono-cad select-none z-30 transition-colors ${
        isLight
          ? 'border-slate-200 bg-white text-slate-800 shadow-sm'
          : 'border-[#262832] bg-[#111318] text-[#f3f4f8]'
      }`}
    >
      {/* Left: Exit Studio + Breadcrumb Navigation + Asset Switcher */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReturnHome}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors border ${
            isLight
              ? 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border-slate-200'
              : 'text-[#c5c7d0] hover:text-white bg-[#1a1b21] hover:bg-[#37393f]/40 border-[#262832]'
          }`}
          data-cursor="EXIT"
          title="Return to Landing Page"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#e27228]" />
          <span className="text-[11px] uppercase tracking-wider">EXIT</span>
        </button>

        <div className={`h-4 w-px ${isLight ? 'bg-slate-200' : 'bg-[#262832]'} hidden sm:block`} />

        {/* CAD Breadcrumb & Target Selector */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-[11px] tracking-wider text-[#6b7082]">
            <span>OBJECT BREAKDOWN</span>
            <span>/</span>
            <span className="text-[#22d3ee] font-medium">{currentObject.category?.toUpperCase() || 'CAD'}</span>
            <span>/</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentObject.id}
              onChange={(e) => {
                const val = e.target.value;
                if (uploadedObject && val === uploadedObject.id) {
                  onSelectObject(uploadedObject);
                  return;
                }
                if (val === currentObject.id) {
                  return;
                }
                const selected = ALL_OBJECTS.find((o) => o.id === val);
                if (selected) onSelectObject(selected);
              }}
              className={`bg-transparent text-[11px] font-bold focus:outline-none cursor-pointer uppercase tracking-wider font-mono-cad border-b border-dashed pb-0.5 hover:border-[#e27228] transition-colors ${
                isLight ? 'text-slate-900 border-slate-300' : 'text-[#f3f4f8] border-[#262832]'
              }`}
            >
              {uploadedObject && (
                <option
                  value={uploadedObject.id}
                  className={isLight ? 'bg-white text-blue-600 font-bold' : 'bg-[#111318] text-[#e27228] font-bold'}
                >
                  ★ {uploadedObject.name.toUpperCase()} (UPLOADED)
                </option>
              )}
              {!uploadedObject && !ALL_OBJECTS.some((o) => o.id === currentObject.id) && (
                <option
                  value={currentObject.id}
                  className={isLight ? 'bg-white text-blue-600 font-bold' : 'bg-[#111318] text-[#e27228] font-bold'}
                >
                  ★ {currentObject.name.toUpperCase()} (UPLOADED)
                </option>
              )}
              {ALL_OBJECTS.map((obj) => (
                <option key={obj.id} value={obj.id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#111318] text-[#c5c7d0]'}>
                  {obj.name}
                </option>
              ))}
            </select>

            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#1a1b21] border-[#262832] text-[#6b7082]'
            }`}>
              {currentObject.stats.componentCount} PARTS
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Segmented Depth Mode Switcher */}
      <div className={`hidden lg:flex items-center gap-1 p-0.5 rounded border ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#1a1b21] border-[#262832]'
      }`}>
        {depthModes.map((dm) => {
          const isSelected = depthLevel === dm.id;
          return (
            <button
              key={dm.id}
              onClick={() => onDepthChange(dm.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono-cad uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isSelected
                  ? isLight
                    ? 'bg-white text-[#c2410c] font-bold shadow-sm border border-slate-200'
                    : 'bg-[#16181f] text-[#f3f4f8] font-bold border border-[rgba(226,114,40,0.6)] shadow-[0_0_10px_rgba(226,114,40,0.2)]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#37393f]/30'
              }`}
            >
              <span>{dm.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                  isSelected
                    ? (isLight ? 'bg-orange-50 text-[#c2410c]' : 'bg-[rgba(226,114,40,0.2)] text-[#e27228]')
                    : (isLight ? 'bg-slate-200 text-slate-600' : 'bg-[#0c0e13] text-[#525666]')
                }`}
              >
                {dm.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Upload + Compare + Theme Toggle */}
      <div className="flex items-center gap-2">
        {onUploadModel && (
          <label
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono-cad uppercase tracking-wider transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-[#1a1b21] hover:bg-[#37393f]/40 text-[#c5c7d0] hover:text-white border-[#262832]'
            }`}
            data-cursor="UPLOAD"
            title="Upload GLB or GLTF 3D model"
          >
            <Upload className="w-3.5 h-3.5 text-[#22d3ee]" />
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
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono-cad uppercase tracking-wider transition-all ${
            isLight
              ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              : 'bg-[#1a1b21] hover:bg-[#37393f]/40 text-[#c5c7d0] hover:text-white border-[#262832]'
          }`}
          data-cursor="COMPARE"
        >
          <Scale className="w-3.5 h-3.5 text-[#e27228]" />
          <span className="hidden sm:inline">Compare</span>
        </button>

        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className={`w-7 h-7 rounded border flex items-center justify-center transition-all ${
            isLight
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              : 'bg-[#1a1b21] hover:bg-[#37393f]/40 border-[#262832] text-[#c5c7d0] hover:text-white'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};

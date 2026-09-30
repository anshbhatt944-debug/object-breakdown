import React from 'react';
import { ObjectBreakdownData, DepthLevel } from '../../types/objectData';
import { ALL_OBJECTS } from '../../data/objectRegistry';
import {
  Layers,
  ChevronLeft,
  Moon,
  Sun,
  Scale,
  Upload,
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
  onUploadModel?: (file: File) => void;
  uploadedObject?: ObjectBreakdownData | null;
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
  uploadedObject,
}) => {
  const isLight = theme === 'light';

  const depthModes: { id: DepthLevel; label: string; badge: string }[] = [
    { id: 'quick', label: 'QUICK', badge: '30s' },
    { id: 'detailed', label: 'DETAILED', badge: 'PART' },
    { id: 'engineering', label: 'ENGINEERING', badge: 'DFMA' },
    { id: 'expert', label: 'EXPERT', badge: 'FEA' },
  ];

  return (
    <header
      className={`workspace-header min-h-[48px] h-[calc(3rem+env(safe-area-inset-top))] md:h-12 px-2 sm:px-4 flex items-center justify-between border-b text-xs font-mono-cad select-none z-30 transition-colors pt-[env(safe-area-inset-top))] md:pt-0 ${
        isLight
          ? 'border-[#DDD6CB] bg-[#F7F5F0] text-[#161311] shadow-xs'
          : 'border-[var(--line)] bg-[#181513] text-[#EFEAE2]'
      }`}
    >
      {/* Left: Exit Studio + Breadcrumb Navigation + Asset Switcher */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onReturnHome}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-[3px] transition-all border touch-manipulation min-h-[36px] sm:min-h-0 shrink-0 cursor-pointer ${
            isLight
              ? 'text-[#161311] hover:text-[#C2410C] bg-white hover:bg-[#F4EFE8] border-[#DDD6CB] shadow-xs'
              : 'text-[#8c8278] hover:text-[#EFEAE2] bg-[#211e1c] hover:bg-[#2a2420] border-[var(--line)]'
          }`}
          data-cursor="EXIT"
          title="Return to Landing Page"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">EXIT</span>
        </button>

        <div className={`h-4 w-px ${isLight ? 'bg-[#DDD6CB]' : 'bg-[var(--line)]'} hidden sm:block`} />

        {/* CAD Breadcrumb & Target Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className={`hidden md:flex items-center gap-1 text-[11px] tracking-wider shrink-0 ${
            isLight ? 'text-[#786e64]' : 'text-[#8c8278]'
          }`}>
            <span>OBJECT BREAKDOWN</span>
            <span>/</span>
            <span className="text-[#C2410C] dark:text-[#e27228] font-bold">{currentObject.category?.toUpperCase() || 'CAD'}</span>
            <span>/</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
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
              className={`bg-transparent text-[11px] font-bold focus:outline-none cursor-pointer uppercase tracking-wider font-mono-cad border-b border-dashed pb-0.5 transition-colors max-w-[110px] xs:max-w-[150px] sm:max-w-none truncate ${
                isLight ? 'text-[#161311] border-[#DDD6CB] hover:border-[#C2410C]' : 'text-[#EFEAE2] border-[var(--line)] hover:border-[#e27228]'
              }`}
            >
              {uploadedObject && (
                <option
                  value={uploadedObject.id}
                  className={isLight ? 'bg-white text-[#C2410C] font-bold' : 'bg-[#181513] text-[#e27228] font-bold'}
                >
                  ★ {uploadedObject.name.toUpperCase()} (UPLOADED)
                </option>
              )}
              {!uploadedObject && !ALL_OBJECTS.some((o) => o.id === currentObject.id) && (
                <option
                  value={currentObject.id}
                  className={isLight ? 'bg-white text-[#C2410C] font-bold' : 'bg-[#181513] text-[#e27228] font-bold'}
                >
                  ★ {currentObject.name.toUpperCase()} (UPLOADED)
                </option>
              )}
              {ALL_OBJECTS.map((obj) => (
                <option key={obj.id} value={obj.id} className={isLight ? 'bg-white text-[#161311]' : 'bg-[#181513] text-[#EFEAE2]'}>
                  {obj.name}
                </option>
              ))}
            </select>

            <span className={`hidden xs:inline text-[10px] px-1.5 py-0.5 rounded-[2px] border shrink-0 ${
              isLight ? 'bg-[#EAE4DC] border-[#DDD6CB] text-[#5e5750] font-semibold' : 'bg-[#211e1c] border-[var(--line)] text-[#8c8278]'
            }`}>
              {currentObject.stats.componentCount} PARTS
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Segmented Depth Mode Switcher */}
      <div className={`hidden lg:flex items-center gap-1 p-0.5 rounded-[4px] border ${
        isLight ? 'bg-[#EAE4DC] border-[#DDD6CB]' : 'bg-[#211e1c] border-[var(--line)]'
      }`}>
        {depthModes.map((dm) => {
          const isSelected = depthLevel === dm.id;
          return (
            <button
              key={dm.id}
              onClick={() => onDepthChange(dm.id)}
              className={`px-2.5 py-1 rounded-[3px] text-[11px] font-mono-cad uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? isLight
                    ? 'bg-white text-[#C2410C] font-bold shadow-xs border border-[#DDD6CB]'
                    : 'bg-[#25201c] text-[#EFEAE2] font-bold border border-[#e27228]/70 shadow-[0_0_10px_rgba(226,114,40,0.15)]'
                  : isLight
                  ? 'text-[#5e5750] hover:text-[#161311] hover:bg-white/50'
                  : 'text-[#8c8278] hover:text-[#EFEAE2] hover:bg-[#25201c]'
              }`}
            >
              <span>{dm.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                  isSelected
                    ? isLight ? 'bg-orange-50 text-[#C2410C] font-bold' : 'bg-[rgba(226,114,40,0.2)] text-[#e27228]'
                    : isLight ? 'bg-[#DDD6CB] text-[#5e5750]' : 'bg-[#181513] text-[#8c8278]'
                }`}
              >
                {dm.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Upload + Compare + Theme Toggle */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {onUploadModel && (
          <label
            className={`flex items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-2.5 sm:py-1 rounded-[3px] border text-[11px] font-mono-cad uppercase tracking-wider transition-all cursor-pointer touch-manipulation min-h-[36px] sm:min-h-0 min-w-[36px] sm:min-w-0 ${
              isLight
                ? 'bg-white hover:bg-[#F4EFE8] text-[#161311] border-[#DDD6CB] shadow-xs'
                : 'bg-[#211e1c] hover:bg-[#2a2420] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)]'
            }`}
            data-cursor="UPLOAD"
            title="Upload GLB or GLTF 3D model"
          >
            <Upload className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
            <span className="hidden sm:inline font-semibold">Upload</span>
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
          className={`flex items-center justify-center gap-1 sm:gap-1.5 p-2 sm:px-2.5 sm:py-1 rounded-[3px] border text-[11px] font-mono-cad uppercase tracking-wider transition-all touch-manipulation min-h-[36px] sm:min-h-0 min-w-[36px] sm:min-w-0 cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-[#F4EFE8] text-[#161311] border-[#DDD6CB] shadow-xs'
              : 'bg-[#211e1c] hover:bg-[#2a2420] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)]'
          }`}
          data-cursor="COMPARE"
          title="Compare with other CAD mechanisms"
        >
          <Scale className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
          <span className="hidden sm:inline font-semibold">Compare</span>
        </button>

        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className={`w-9 h-9 sm:w-7 sm:h-7 rounded-[3px] border flex items-center justify-center transition-all touch-manipulation cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-[#F4EFE8] border-[#DDD6CB] text-[#161311] shadow-xs'
              : 'bg-[#211e1c] hover:bg-[#2a2420] border-[var(--line)] text-[#8c8278] hover:text-[#EFEAE2]'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#161311]" />}
        </button>
      </div>
    </header>
  );
};

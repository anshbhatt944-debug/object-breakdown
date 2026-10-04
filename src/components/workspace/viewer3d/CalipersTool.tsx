import React, { useState } from 'react';
import { ComponentNode } from '../../../types/objectData';
import { Ruler, X, Maximize2, ShieldCheck, Weight, GripVertical } from 'lucide-react';
import {
  getComponentCADDimensions,
  ASSEMBLY_MASTER_ENVELOPES,
  DetailedCADDimensions,
} from '../../../data/cadDimensionsDatabase';
import { useDraggable } from '../../../utils/useDraggable';

interface CalipersToolProps {
  selectedComponent: ComponentNode | null;
  onClose: () => void;
  theme?: 'light' | 'dark';
  objectId?: string;
  onSelectComponent?: (id: string) => void;
}

type UnitMode = 'metric-mm' | 'imperial-in';
type CaliperTab = 'envelope' | 'tolerances' | 'mass';

export const CalipersTool: React.FC<CalipersToolProps> = ({
  selectedComponent,
  onClose,
  theme = 'dark',
  objectId = 'jet-turbine',
}) => {
  const [unitMode, setUnitMode] = useState<UnitMode>('metric-mm');
  const [activeTab, setActiveTab] = useState<CaliperTab>('envelope');

  const { ref, position, isDragging, handlePointerDown, resetPosition } = useDraggable({
    storageKey: 'calipers_tool',
    boundsPadding: 12,
  });

  const isLight = theme === 'light';
  const masterEnvelope = ASSEMBLY_MASTER_ENVELOPES[objectId] || ASSEMBLY_MASTER_ENVELOPES['jet-turbine'];

  // Resolve component dimensions
  const dims: DetailedCADDimensions | null = selectedComponent
    ? getComponentCADDimensions(
        objectId,
        selectedComponent.id,
        selectedComponent.dimensions?.formatted,
        selectedComponent.material?.density
      )
    : null;

  // Unit conversion helpers
  const formatLength = (mm: number): string => {
    if (unitMode === 'imperial-in') {
      const inches = mm / 25.4;
      return inches >= 12
        ? `${(inches / 12).toFixed(2)} ft (${inches.toFixed(1)}″)`
        : `${inches.toFixed(2)}″`;
    }
    if (mm >= 1000) {
      return `${(mm / 1000).toFixed(2)} m`;
    }
    return `${mm.toLocaleString('en-US', { maximumFractionDigits: 1 })} mm`;
  };

  const formatMass = (grams: number): string => {
    if (unitMode === 'imperial-in') {
      const lbs = grams / 453.592;
      return lbs >= 1.0 ? `${lbs.toFixed(1)} lbs` : `${(grams / 28.3495).toFixed(1)} oz`;
    }
    if (grams >= 1000) {
      return `${(grams / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} kg`;
    }
    return `${grams.toLocaleString('en-US', { maximumFractionDigits: 1 })} g`;
  };

  return (
    <div
      ref={ref}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: 'auto',
              bottom: 'auto',
            }
          : undefined
      }
      className={`calipers-card absolute ${
        position ? '' : 'top-2 sm:top-3.5 left-2 sm:left-4'
      } z-30 p-2.5 sm:p-3 rounded-[3px] border shadow-xl space-y-2 select-none w-auto sm:w-[275px] backdrop-blur-xl pointer-events-auto ${
        isDragging
          ? 'ring-1 ring-[#e27228]/70 shadow-2xl opacity-95 transition-none scale-[1.01]'
          : 'transition-all duration-150'
      } ${
        isLight
          ? 'bg-[#F7F5F0]/95 border-[#DDD6CB] text-[#161311]'
          : 'bg-[#181513]/95 border-[var(--line)] text-[#EFEAE2]'
      }`}
    >
      {/* Draggable Header Bar */}
      <div
        onPointerDown={handlePointerDown}
        onDoubleClick={resetPosition}
        title="Drag anywhere to reposition • Double-click to reset"
        className="flex items-center justify-between pb-1.5 border-b border-current/10 cursor-grab active:cursor-grabbing touch-none select-none group"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3 h-3 text-current/30 group-hover:text-current/80 transition-colors shrink-0" />
          <div
            className={`p-1 rounded-[2px] border shrink-0 ${
              isLight
                ? 'bg-white text-[#C2410C] border-[#DDD6CB]'
                : 'bg-[#211e1c] text-[#e27228] border-[var(--line)]'
            }`}
          >
            <Ruler className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <div className="text-[10.5px] font-mono-cad font-bold tracking-wider uppercase leading-none truncate">
              CAD Dimension Calipers
            </div>
            <div className="text-[8px] font-mono-cad text-current/60 leading-tight pt-0.5 truncate">
              Precision Metrology (Movable)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Unit Toggle */}
          <div
            className={`flex items-center p-0.5 rounded-[2px] border text-[8.5px] font-mono-cad font-bold ${
              isLight ? 'bg-white/80 border-[#DDD6CB]' : 'bg-[#211e1c] border-[var(--line)]'
            }`}
          >
            <button
              onClick={() => setUnitMode('metric-mm')}
              className={`px-1 py-0.2 rounded-[1px] transition-colors cursor-pointer ${
                unitMode === 'metric-mm'
                  ? isLight
                    ? 'bg-[#C2410C] text-white'
                    : 'bg-[#e27228] text-white'
                  : 'text-current/60 hover:text-current'
              }`}
            >
              MM
            </button>
            <button
              onClick={() => setUnitMode('imperial-in')}
              className={`px-1 py-0.2 rounded-[1px] transition-colors cursor-pointer ${
                unitMode === 'imperial-in'
                  ? isLight
                    ? 'bg-[#C2410C] text-white'
                    : 'bg-[#e27228] text-white'
                  : 'text-current/60 hover:text-current'
              }`}
            >
              IN
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            title="Close Calipers Tool"
            className={`p-1 rounded-[2px] text-current/60 hover:text-current transition-colors cursor-pointer flex items-center justify-center ${
              isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Component Inspection View */}
      {selectedComponent && dims ? (
        <div className="space-y-1.5 font-mono-cad">
          {/* Component Name & CAD Identification */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate leading-tight">
                {selectedComponent.name}
              </div>
            </div>
            <span
              className={`shrink-0 px-1 py-0.2 text-[8.5px] font-mono-cad font-bold rounded-[2px] border ${
                isLight
                  ? 'bg-white text-[#C2410C] border-[#DDD6CB]'
                  : 'bg-[#211e1c] text-[#e27228] border-[rgba(226,114,40,0.4)]'
              }`}
            >
              {selectedComponent.cadId || 'CAD-REF'}
            </span>
          </div>

          {/* Sub-tabs: Envelope / Tolerances / Mass */}
          <div
            className={`flex items-center gap-0.5 p-0.5 rounded-[2px] border text-[9px] ${
              isLight ? 'bg-white/60 border-[#DDD6CB]' : 'bg-[#211e1c]/80 border-[var(--line)]'
            }`}
          >
            <button
              onClick={() => setActiveTab('envelope')}
              className={`flex-1 py-0.5 rounded-[1px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'envelope'
                  ? isLight
                    ? 'bg-white text-[#C2410C] font-bold shadow-xs'
                    : 'bg-[#25201c] text-[#EFEAE2] font-bold'
                  : 'text-current/60 hover:text-current'
              }`}
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>Envelope</span>
            </button>
            <button
              onClick={() => setActiveTab('tolerances')}
              className={`flex-1 py-0.5 rounded-[1px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'tolerances'
                  ? isLight
                    ? 'bg-white text-[#C2410C] font-bold shadow-xs'
                    : 'bg-[#25201c] text-[#EFEAE2] font-bold'
                  : 'text-current/60 hover:text-current'
              }`}
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Tolerance</span>
            </button>
            <button
              onClick={() => setActiveTab('mass')}
              className={`flex-1 py-0.5 rounded-[1px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'mass'
                  ? isLight
                    ? 'bg-white text-[#C2410C] font-bold shadow-xs'
                    : 'bg-[#25201c] text-[#EFEAE2] font-bold'
                  : 'text-current/60 hover:text-current'
              }`}
            >
              <Weight className="w-2.5 h-2.5" />
              <span>Mass</span>
            </button>
          </div>

          {/* Tab 1: Envelope Bounding Box */}
          {activeTab === 'envelope' && (
            <div
              className={`p-1.5 rounded-[2px] border space-y-1 text-[10px] ${
                isLight ? 'bg-white/90 border-[#DDD6CB]' : 'bg-[#211e1c]/90 border-[var(--line)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-current/60 text-[9px]">CAD Envelope:</span>
                <span className={`font-bold truncate max-w-[170px] ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`}>
                  {dims.formatted}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                <div className={`p-1 rounded-[2px] border text-center ${isLight ? 'bg-[#F7F5F0]' : 'bg-[#181513]/60'}`}>
                  <div className="text-[8px] font-bold text-red-500 uppercase">X Span</div>
                  <div className="font-semibold tabular-nums text-[9.5px]">{formatLength(dims.widthMm)}</div>
                </div>
                <div className={`p-1 rounded-[2px] border text-center ${isLight ? 'bg-[#F7F5F0]' : 'bg-[#181513]/60'}`}>
                  <div className="text-[8px] font-bold text-emerald-500 uppercase">Y Height</div>
                  <div className="font-semibold tabular-nums text-[9.5px]">{formatLength(dims.heightMm)}</div>
                </div>
                <div className={`p-1 rounded-[2px] border text-center ${isLight ? 'bg-[#F7F5F0]' : 'bg-[#181513]/60'}`}>
                  <div className="text-[8px] font-bold text-blue-500 uppercase">Z Depth</div>
                  <div className="font-semibold tabular-nums text-[9.5px]">{formatLength(dims.lengthMm)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Metrology & Tolerances */}
          {activeTab === 'tolerances' && (
            <div
              className={`p-1.5 rounded-[2px] border space-y-1 text-[10px] ${
                isLight ? 'bg-white/90 border-[#DDD6CB]' : 'bg-[#211e1c]/90 border-[var(--line)]'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-current/60">Tolerance:</span>
                <span className={`font-bold tabular-nums ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`}>
                  {selectedComponent.manufacturing?.tolerance || dims.tolerance}
                </span>
              </div>
              <div className="flex justify-between items-center pt-0.5 border-t border-current/10">
                <span className="text-current/60">Surface Finish:</span>
                <span className="font-semibold tabular-nums">{dims.surfaceFinishRa || 'Ra 0.4 µm'}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5 border-t border-current/10">
                <span className="text-current/60">Machining:</span>
                <span className="font-medium truncate max-w-[160px] text-right">{dims.machiningProcess}</span>
              </div>
            </div>
          )}

          {/* Tab 3: Mass & Material Volume */}
          {activeTab === 'mass' && (
            <div
              className={`p-1.5 rounded-[2px] border space-y-1 text-[10px] ${
                isLight ? 'bg-white/90 border-[#DDD6CB]' : 'bg-[#211e1c]/90 border-[var(--line)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-current/60">Mass:</span>
                <span className={`font-bold tabular-nums text-[11px] ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`}>
                  {formatMass(dims.massGrams)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-0.5 border-t border-current/10">
                <span className="text-current/60">Material:</span>
                <span className="font-medium truncate max-w-[160px]">{selectedComponent.material?.name || 'Aerospace Alloy'}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5 border-t border-current/10">
                <span className="text-current/60">Density:</span>
                <span className="font-semibold tabular-nums">{dims.materialDensityGCm3} g/cm³</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Overall Assembly Master Envelope (when no component selected) */
        <div className="space-y-1.5 font-mono-cad">
          <div
            className={`p-2 rounded-[2px] border space-y-1 text-[10px] ${
              isLight ? 'bg-white/90 border-[#DDD6CB]' : 'bg-[#211e1c]/90 border-[var(--line)]'
            }`}
          >
            <div>
              <div className="text-[8.5px] uppercase tracking-wider text-current/60 font-semibold">
                Assembly Envelope
              </div>
              <div className={`font-bold text-[11px] truncate leading-tight ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`}>
                {masterEnvelope.name}
              </div>
            </div>

            <div className="flex items-center justify-between text-[9.5px] pt-1 border-t border-current/10">
              <span className="text-current/60">Bounding:</span>
              <span className="font-semibold tabular-nums">
                {formatLength(masterEnvelope.overallSpanMm.x)} × {formatLength(masterEnvelope.overallSpanMm.y)} × {formatLength(masterEnvelope.overallSpanMm.z)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[9.5px] pt-0.5 border-t border-current/10">
              <span className="text-current/60">Total Mass:</span>
              <span className="font-bold tabular-nums">
                {formatMass(masterEnvelope.totalMassKg * 1000)}
              </span>
            </div>
          </div>

          <p className="text-[8.5px] text-current/60 italic leading-tight px-0.5">
            Click any component in the scene or tree to inspect precision CAD envelope, ISO tolerances, and mass.
          </p>
        </div>
      )}
    </div>
  );
};

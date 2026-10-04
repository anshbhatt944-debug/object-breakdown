import React, { useState } from 'react';
import { ViewMode3D, ComponentNode } from '../../../types/objectData';
import { getComponentStressTelemetry, getComponentThermalTelemetry } from './engineeringViewModes';
import { Activity, Flame, Radio, Layers, X, GripVertical } from 'lucide-react';
import { useDraggable } from '../../../utils/useDraggable';

interface ViewModeHUDProps {
  viewMode: ViewMode3D;
  selectedComponent: ComponentNode | null;
  objectId: string;
  theme?: 'light' | 'dark';
  hasCalipersOpen?: boolean;
  onClose?: () => void;
}

export const ViewModeHUD: React.FC<ViewModeHUDProps> = ({
  viewMode,
  selectedComponent,
  objectId,
  theme = 'dark',
  hasCalipersOpen = false,
  onClose,
}) => {
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  const { ref, position, isDragging, handlePointerDown, resetPosition } = useDraggable({
    storageKey: 'viewmode_hud',
    boundsPadding: 12,
  });

  if (viewMode === 'solid') {
    return null;
  }

  const isLight = theme === 'light';

  // Base positioning:
  // When calipers are closed: exactly in the top-left caliper space (top-3.5 left-4).
  // When calipers are open: smoothly side-by-side in the clear top area (left-[295px]), avoiding any overlap.
  const positionClass = hasCalipersOpen
    ? 'top-2 sm:top-3.5 left-2 sm:left-[295px]'
    : 'top-2 sm:top-3.5 left-2 sm:left-4';

  const containerBaseClass = `viewmode-hud absolute ${
    position ? '' : positionClass
  } z-30 p-2.5 sm:p-3 rounded-[3px] border shadow-xl backdrop-blur-xl select-none w-auto sm:w-[275px] pointer-events-auto ${
    isDragging
      ? 'ring-1 ring-[#e27228]/70 shadow-2xl opacity-95 transition-none scale-[1.01]'
      : 'transition-all duration-150'
  } ${
    isLight
      ? 'bg-[#F7F5F0]/95 border-[#DDD6CB] text-[#161311]'
      : 'bg-[#181513]/95 border-[var(--line)] text-[#EFEAE2]'
  }`;

  const containerStyle = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
      }
    : undefined;

  // Stress Mode HUD
  if (viewMode === 'stress') {
    const stressData = selectedComponent
      ? getComponentStressTelemetry(
          selectedComponent.id,
          selectedComponent.category,
          selectedComponent.material?.tensileStrength
        )
      : null;

    return (
      <div ref={ref} style={containerStyle} className={containerBaseClass}>
        <div
          onPointerDown={handlePointerDown}
          onDoubleClick={resetPosition}
          title="Drag anywhere to reposition • Double-click to reset"
          className="flex items-center justify-between pb-1.5 border-b border-current/10 cursor-grab active:cursor-grabbing touch-none select-none group"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono-cad font-bold tracking-wider uppercase leading-none min-w-0">
            <GripVertical className="w-3 h-3 text-current/30 group-hover:text-current/80 transition-colors shrink-0" />
            <Activity className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`} />
            <span className="truncate">FEA Von Mises Stress</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8.5px] font-mono-cad text-current/60 uppercase">ISO 10211</span>
            {onClose && (
              <button
                onClick={onClose}
                title="Return to Solid View"
                className={`p-0.5 rounded-[2px] text-current/60 hover:text-current transition-colors cursor-pointer flex items-center justify-center ${
                  isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Colormap Scale Gradient */}
        <div className="mt-1.5 space-y-0.5 font-mono-cad">
          <div className="h-1.5 rounded-[1px] w-full bg-gradient-to-r from-[#0000ff] via-[#00ffff] via-[#00ff00] via-[#ffff00] via-[#ff0000] to-[#ff00ff] shadow-inner" />
          <div className="flex justify-between text-[8px] text-current/70 tabular-nums">
            <span>0 MPa</span>
            <span>300</span>
            <span>600</span>
            <span>900</span>
            <span>1,200+</span>
          </div>
        </div>

        {/* Active Telemetry Readout */}
        {selectedComponent && stressData ? (
          <div
            className={`mt-1.5 p-1.5 rounded-[2px] border text-[10px] font-mono-cad space-y-0.5 ${
              isLight ? 'bg-white/90 border-[#DDD6CB]' : 'bg-[#211e1c]/90 border-[var(--line)]'
            }`}
          >
            <div className="font-semibold truncate text-[10.5px] leading-tight">{selectedComponent.name}</div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-current/60 text-[9px]">Von Mises:</span>
              <span className={`font-bold tabular-nums ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`}>
                {stressData.stressMpa} MPa
              </span>
            </div>
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="text-current/60 text-[9px]">Yield FoS:</span>
              <span className={`font-semibold tabular-nums ${stressData.factorOfSafety < 1.2 ? 'text-red-500 font-bold' : 'text-emerald-500'}`}>
                {stressData.factorOfSafety}× {stressData.factorOfSafety < 1.2 ? '(Peak Load)' : '(Nominal)'}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-1.5 text-[8.5px] font-mono-cad text-current/60 italic leading-tight">
            Select any component to inspect active Von Mises stress, FoS, and load distribution.
          </p>
        )}
      </div>
    );
  }

  // Thermal Mode HUD
  if (viewMode === 'thermal') {
    const thermalData = selectedComponent
      ? getComponentThermalTelemetry(selectedComponent.id, objectId)
      : null;

    return (
      <div ref={ref} style={containerStyle} className={containerBaseClass}>
        <div
          onPointerDown={handlePointerDown}
          onDoubleClick={resetPosition}
          title="Drag anywhere to reposition • Double-click to reset"
          className="flex items-center justify-between pb-1.5 border-b border-current/10 cursor-grab active:cursor-grabbing touch-none select-none group"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono-cad font-bold tracking-wider uppercase leading-none min-w-0">
            <GripVertical className="w-3 h-3 text-current/30 group-hover:text-current/80 transition-colors shrink-0" />
            <Flame className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`} />
            <span className="truncate">FLIR Ironbow Telemetry</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setUseFahrenheit(!useFahrenheit)}
              className={`px-1 py-0.2 rounded-[1px] text-[8.5px] font-mono-cad font-bold border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white text-[#C2410C] border-[#DDD6CB] hover:bg-white/80'
                  : 'bg-[#211e1c] text-[#e27228] border-[var(--line)] hover:bg-[#25201c]'
              }`}
            >
              {useFahrenheit ? '°F' : '°C'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                title="Return to Solid View"
                className={`p-0.5 rounded-[2px] text-current/60 hover:text-current transition-colors cursor-pointer flex items-center justify-center ${
                  isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* FLIR Ironbow Colormap Scale */}
        <div className="mt-1.5 space-y-0.5 font-mono-cad">
          <div className="h-1.5 rounded-[1px] w-full bg-gradient-to-r from-[#1d4ed8] via-[#06b6d4] via-[#10b981] via-[#f59e0b] via-[#ea580c] via-[#ff2200] to-[#fff7ed] shadow-inner" />
          <div className="flex justify-between text-[8px] text-current/70 tabular-nums">
            <span>{useFahrenheit ? '-49°F' : '-45°C'}</span>
            <span>{useFahrenheit ? '176°' : '80°'}</span>
            <span>{useFahrenheit ? '968°' : '520°'}</span>
            <span>{useFahrenheit ? '3,182°' : '1,750°'}</span>
          </div>
        </div>

        {/* Active Thermal Telemetry Readout */}
        {selectedComponent && thermalData ? (
          <div
            className={`mt-1.5 p-1.5 rounded-[2px] border text-[10px] font-mono-cad space-y-0.5 ${
              isLight ? 'bg-white/90 border-[#DDD6CB]' : 'bg-[#211e1c]/90 border-[var(--line)]'
            }`}
          >
            <div className="font-semibold truncate text-[10.5px] leading-tight">{selectedComponent.name}</div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-current/60 text-[9px]">Operating Temp:</span>
              <span className={`font-bold tabular-nums ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`}>
                {useFahrenheit ? `${thermalData.tempFahrenheit} °F` : `${thermalData.tempCelsius} °C`}
              </span>
            </div>
            <p className="text-[8.5px] text-current/70 pt-0.5 border-t border-current/10 leading-tight truncate">
              {thermalData.heatSource}
            </p>
          </div>
        ) : (
          <p className="mt-1.5 text-[8.5px] font-mono-cad text-current/60 italic leading-tight">
            Select any component to inspect thermodynamic temperatures and heat distribution.
          </p>
        )}
      </div>
    );
  }

  // X-Ray Mode HUD
  if (viewMode === 'xray') {
    return (
      <div ref={ref} style={containerStyle} className={containerBaseClass}>
        <div
          onPointerDown={handlePointerDown}
          onDoubleClick={resetPosition}
          title="Drag anywhere to reposition • Double-click to reset"
          className="flex items-center justify-between pb-1.5 border-b border-current/10 cursor-grab active:cursor-grabbing touch-none select-none group"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono-cad font-bold tracking-wider uppercase leading-none min-w-0">
            <GripVertical className="w-3 h-3 text-current/30 group-hover:text-current/80 transition-colors shrink-0" />
            <Radio className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`} />
            <span className="truncate">Radiographic NDT (CT)</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8.5px] font-mono-cad text-current/60">120 kV</span>
            {onClose && (
              <button
                onClick={onClose}
                title="Return to Solid View"
                className={`p-0.5 rounded-[2px] text-current/60 hover:text-current transition-colors cursor-pointer flex items-center justify-center ${
                  isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-1.5 space-y-0.5 font-mono-cad">
          <div className="h-1.5 rounded-[1px] w-full bg-gradient-to-r from-transparent via-[#67e8f9]/50 to-[#67e8f9] border border-current/20 shadow-inner" />
          <div className="flex justify-between text-[8px] text-current/70 tabular-nums">
            <span>Air</span>
            <span>Composite</span>
            <span>Titanium</span>
            <span>Tungsten</span>
          </div>
        </div>

        <p className="mt-1.5 text-[8.5px] font-mono-cad text-current/70 leading-snug">
          Attenuation scales with material electron density, revealing internal shafts, bearings, and gears.
        </p>
      </div>
    );
  }

  // Wireframe Mode HUD
  if (viewMode === 'wireframe') {
    return (
      <div ref={ref} style={containerStyle} className={containerBaseClass}>
        <div
          onPointerDown={handlePointerDown}
          onDoubleClick={resetPosition}
          title="Drag anywhere to reposition • Double-click to reset"
          className="flex items-center justify-between pb-1.5 border-b border-current/10 cursor-grab active:cursor-grabbing touch-none select-none group"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono-cad font-bold tracking-wider uppercase leading-none min-w-0">
            <GripVertical className="w-3 h-3 text-current/30 group-hover:text-current/80 transition-colors shrink-0" />
            <Layers className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#C2410C]' : 'text-[#e27228]'}`} />
            <span className="truncate">CAD Mesh Topology</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8.5px] font-mono-cad text-current/60">ISO STEP</span>
            {onClose && (
              <button
                onClick={onClose}
                title="Return to Solid View"
                className={`p-0.5 rounded-[2px] text-current/60 hover:text-current transition-colors cursor-pointer flex items-center justify-center ${
                  isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-1.5 text-[8.5px] font-mono-cad text-current/70 leading-snug">
          Clean structural facet wireframe with facet occlusion for topological surface flow inspection.
        </p>
      </div>
    );
  }

  return null;
};

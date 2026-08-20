import React from 'react';
import { ComponentNode } from '../../../types/objectData';
import { Ruler, X } from 'lucide-react';

interface CalipersToolProps {
  selectedComponent: ComponentNode | null;
  onClose: () => void;
}

export const CalipersTool: React.FC<CalipersToolProps> = ({ selectedComponent, onClose }) => {
  return (
    <div className="absolute top-6 left-6 z-30 p-4 rounded-xl glass-panel-accent bg-[#0d111a]/90 border border-white/10 shadow-2xl space-y-2 select-none w-72 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-mono-cad text-[#38bdf8] font-bold">
          <Ruler className="w-4 h-4" />
          <span>CAD Dimension Calipers</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {selectedComponent ? (
        <div className="space-y-1.5 text-xs font-mono-cad">
          <div className="text-slate-300 font-semibold truncate">
            {selectedComponent.name}
          </div>
          <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1 text-slate-400 text-[11px]">
            <div>
              <span className="text-slate-500">CAD Envelope: </span>
              <span className="text-[#00f2ad] font-bold">{selectedComponent.dimensions.formatted}</span>
            </div>
            <div>
              <span className="text-slate-500">Tolerance: </span>
              <span className="text-slate-200 font-semibold">{selectedComponent.manufacturing.tolerance}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[11px] font-mono-cad text-slate-400">
          Click any component in 3D to take live precision dimensional measurements.
        </p>
      )}
    </div>
  );
};

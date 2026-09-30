import React, { useState } from 'react';
import { RelationshipLink, ComponentNode } from '../../../types/objectData';
import { Share2, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

interface RelationshipMapProps {
  relationships: RelationshipLink[];
  rootComponents: ComponentNode[];
  onSelectComponentById: (id: string) => void;
  theme?: 'light' | 'dark';
}

export const RelationshipMap: React.FC<RelationshipMapProps> = ({
  relationships,
  rootComponents,
  onSelectComponentById,
  theme = 'dark',
}) => {
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number | null>(0);
  const isLight = theme === 'light';
  const activeLink = selectedLinkIndex !== null ? relationships[selectedLinkIndex] : null;

  return (
    <div className={`p-6 space-y-6 overflow-y-auto h-full font-sans transition-colors ${
      isLight ? 'text-[#161311]' : 'text-slate-300'
    }`}>
      {/* Header */}
      <div className={`space-y-1 pb-4 border-b ${isLight ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}>
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#C2410C] dark:text-[#00f2ad]" />
          <h3 className={`text-xs font-mono-cad uppercase tracking-wider font-semibold ${
            isLight ? 'text-[#161311]' : 'text-slate-200'
          }`}>
            Component Kinematic & Energy Network
          </h3>
        </div>
        <p className={`text-xs ${isLight ? 'text-[#5e5750]' : 'text-slate-400'}`}>
          Interactive mechanical linkages, force vectors, and energy transfer pathways between parts.
        </p>
      </div>

      {/* Interactive Linkage List & Visual Node Flow */}
      <div className="space-y-3">
        {relationships.map((rel, idx) => {
          const isSelected = selectedLinkIndex === idx;

          return (
            <div
              key={idx}
              onClick={() => setSelectedLinkIndex(idx)}
              className={`p-4 rounded-[4px] cursor-pointer transition-all border ${
                isSelected
                  ? isLight
                    ? 'bg-white border-[#C2410C] shadow-sm'
                    : 'bg-[#00f2ad]/10 border-[#00f2ad]/40 shadow-[0_0_15px_rgba(0,242,173,0.1)]'
                  : isLight
                  ? 'bg-white border-[#DDD6CB] hover:bg-[#F4EFE8]'
                  : 'bg-black/30 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectComponentById(rel.sourceId);
                  }}
                  className={`px-2.5 py-1 rounded-[3px] border text-xs font-mono-cad transition-all truncate cursor-pointer ${
                    isLight
                      ? 'bg-[#F4EFE8] hover:bg-orange-50 hover:text-[#C2410C] border-[#DDD6CB] text-[#161311]'
                      : 'bg-white/5 hover:bg-[#38bdf8]/20 hover:text-[#38bdf8] border-white/10 text-slate-200'
                  }`}
                >
                  {rel.sourceId.replace(/-/g, ' ')}
                </button>

                <div className={`flex items-center gap-1 text-[11px] font-mono-cad font-bold px-2 py-0.5 rounded ${
                  isLight
                    ? 'text-[#C2410C] bg-orange-50 border border-orange-200'
                    : 'text-[#00f2ad] bg-[#00f2ad]/10'
                }`}>
                  <span>{rel.interactionType}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectComponentById(rel.targetId);
                  }}
                  className={`px-2.5 py-1 rounded-[3px] border text-xs font-mono-cad transition-all truncate cursor-pointer ${
                    isLight
                      ? 'bg-[#F4EFE8] hover:bg-orange-50 hover:text-[#C2410C] border-[#DDD6CB] text-[#161311]'
                      : 'bg-white/5 hover:bg-[#38bdf8]/20 hover:text-[#38bdf8] border-white/10 text-slate-200'
                  }`}
                >
                  {rel.targetId.replace(/-/g, ' ')}
                </button>
              </div>

              <p className={`text-xs leading-relaxed font-sans mt-2 ${isLight ? 'text-[#5e5750]' : 'text-slate-300'}`}>
                {rel.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Interaction Deep Explainer */}
      {activeLink && (
        <div className={`p-4 rounded-[4px] border space-y-2 ${
          isLight
            ? 'bg-[#FAF8F5] border-[#DDD6CB]'
            : 'bg-[#211e1c] border-[#00f2ad]/30'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-mono-cad text-[#C2410C] dark:text-[#00f2ad] font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>Kinematic Transfer Mechanics</span>
          </div>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-[#5e5750]' : 'text-slate-300'}`}>
            The mechanical coupling between{' '}
            <strong className={isLight ? 'text-[#161311]' : 'text-slate-100'}>{activeLink.sourceId.replace(/-/g, ' ')}</strong>{' '}
            and{' '}
            <strong className={isLight ? 'text-[#161311]' : 'text-slate-100'}>{activeLink.targetId.replace(/-/g, ' ')}</strong>{' '}
            governs system power efficiency and alignment tolerances.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ALL_OBJECTS } from '../../data/objectRegistry';
import { ObjectBreakdownData } from '../../types/objectData';
import { Search, X, ArrowRight, Sparkles, Box, Layers } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObject: (obj: ObjectBreakdownData) => void;
  onSearchCustom: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectObject,
  onSearchCustom,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredObjects = ALL_OBJECTS.filter(
    (obj) =>
      obj.name.toLowerCase().includes(query.toLowerCase()) ||
      obj.category.toLowerCase().includes(query.toLowerCase()) ||
      obj.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (filteredObjects.length > 0) {
      onSelectObject(filteredObjects[0]);
    } else {
      onSearchCustom(query.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl glass-panel-accent bg-[#0d111a]/95 border border-white/15 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Box */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center p-4 border-b border-white/10 gap-3"
        >
          <Search className="w-5 h-5 text-[#00f2ad] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any object (e.g. Ballpoint Pen, Smartphone, Motor)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none font-mono-cad"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1.5 font-mono-cad text-xs">
          {filteredObjects.map((obj) => (
            <div
              key={obj.id}
              onClick={() => {
                onSelectObject(obj);
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer border border-transparent hover:border-[#00f2ad]/30 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00f2ad]/10 text-[#00f2ad] flex items-center justify-center">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 group-hover:text-[#00f2ad] transition-colors">
                    {obj.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">{obj.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <span>{obj.stats.componentCount} parts</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#00f2ad]" />
              </div>
            </div>
          ))}

          {/* AI Custom Generator Fallback Card if query not in verified list */}
          {query.trim() && (
            <div
              onClick={() => {
                onSearchCustom(query.trim());
                onClose();
              }}
              className="p-4 rounded-xl bg-[#00f2ad]/10 border border-[#00f2ad]/40 cursor-pointer flex items-center justify-between group hover:bg-[#00f2ad]/20 transition-all mt-2"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#00f2ad] animate-pulse" />
                <div>
                  <span className="font-bold text-slate-100 block font-heading">
                    Synthesize 3D Engineering Teardown: "{query}"
                  </span>
                  <span className="text-[10px] text-[#00f2ad]">
                    AI procedural CAD generation with materials, kinematics, and formulas
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#00f2ad]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

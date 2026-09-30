import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Box, ArrowRight, Sparkles, Upload } from 'lucide-react';
import { ObjectBreakdownData } from '../../types/objectData';
import { ALL_OBJECTS } from '../../data/objectRegistry';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObject: (obj: ObjectBreakdownData) => void;
  onSearchCustom: (query: string) => void;
  theme?: 'light' | 'dark';
  onUploadModel?: (file: File) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectObject,
  onSearchCustom,
  onUploadModel,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredObjects = ALL_OBJECTS.filter((obj: ObjectBreakdownData) =>
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
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 sm:pt-24 p-2.5 sm:p-4 bg-black/80 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -8 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-2xl rounded-[2px] bg-[var(--carbon)] border border-[var(--line)] overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[80vh] text-[var(--text)]"
        >
          {/* Search Input Box */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center p-3.5 sm:p-5 border-b border-[var(--line)] gap-3 relative"
          >
            <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search catalog or type custom object..."
              className="flex-1 bg-transparent text-sm sm:text-base text-[var(--text)] placeholder-[var(--muted)] focus:outline-none font-sans min-w-0"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[2px] border border-[var(--line)] flex items-center justify-center shrink-0 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </form>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-1.5 font-sans text-xs">
            <div className="px-3 py-1.5 text-[0.75rem] text-[var(--muted)] tabular-nums">
              Verified 3D objects ({filteredObjects.length})
            </div>

            {filteredObjects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => {
                  onSelectObject(obj);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-[2px] border border-[var(--line)] hover:border-[var(--text)] cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[2px] border border-[var(--line)] flex items-center justify-center text-[var(--text)]">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-sans font-medium text-[var(--text)] leading-tight">
                      {obj.name}
                    </h4>
                    <span className="text-[0.75rem] font-serif text-[var(--muted)]">
                      {obj.category} &bull; {obj.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[var(--muted)]">
                  <span className="text-[0.75rem] tabular-nums">
                    {obj.stats.componentCount} parts
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}

            {/* Custom Generator Trigger Card */}
            {query.trim() && (
              <div
                onClick={() => {
                  onSearchCustom(query.trim());
                  onClose();
                }}
                className="p-3.5 rounded-[2px] border border-[var(--line)] hover:border-[var(--text)] cursor-pointer flex items-center justify-between group transition-colors mt-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[2px] border border-[var(--line)] flex items-center justify-center text-[var(--text)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-sans font-medium text-[var(--text)] block text-sm">
                      Analyze mechanism: &ldquo;{query}&rdquo;
                    </span>
                    <span className="text-[0.75rem] font-serif text-[var(--muted)]">
                      Generate kinematics, component hierarchy & 3D nodes
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text)] font-sans font-medium">
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Direct Model Upload Card */}
            {onUploadModel && (
              <label
                className="p-3.5 rounded-[2px] border border-dashed border-[var(--line)] hover:border-[var(--text)] cursor-pointer flex items-center justify-between group transition-colors mt-2 text-[var(--text)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[2px] border border-[var(--line)] flex items-center justify-center text-[var(--text)]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-sans font-medium block text-xs">
                      Upload 3D model
                    </span>
                    <span className="text-[0.75rem] font-serif text-[var(--muted)]">
                      Drop or browse .glb / .gltf files for interactive breakdown
                    </span>
                  </div>
                </div>
                <span className="btn-plate text-[0.75rem]">
                  <span className="relative z-10 pointer-events-none">Browse</span>
                </span>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUploadModel(file);
                      onClose();
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Keyboard Footer */}
          <div className="p-3 border-t border-[var(--line)] flex items-center justify-between text-[0.75rem] font-sans text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded-[2px] border border-[var(--line)] text-[var(--text)]">ESC</kbd> to exit
              <span className="mx-1">&bull;</span>
              <kbd className="px-1.5 py-0.5 rounded-[2px] border border-[var(--line)] text-[var(--text)]">Enter</kbd> to select
            </div>
            <span>Catalog ready</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { ALL_OBJECTS } from '../../data/objectRegistry';
import { ObjectBreakdownData } from '../../types/objectData';
import { Search, X, ArrowRight, Sparkles, Box, ShieldCheck, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  theme = 'dark',
  onUploadModel,
}) => {
  const isLight = theme === 'light';
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
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
    <AnimatePresence>
      <div className={`fixed inset-0 z-[100] flex items-start justify-center pt-24 p-4 ${
        isLight ? 'bg-slate-900/40' : 'bg-black/85'
      } backdrop-blur-xl select-none`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-2xl rounded-2xl ${
            isLight
              ? 'bg-white border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.18)]'
              : 'bg-[#0b0e14] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)]'
          } overflow-hidden flex flex-col`}
        >
          {/* Search Input Box */}
          <form
            onSubmit={handleSubmit}
            className={`flex items-center p-5 border-b ${
              isLight ? 'border-slate-200' : 'border-white/10'
            } gap-3 relative`}
          >
            <Search className={`w-5 h-5 ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'} shrink-0`} />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search catalog or type custom object to synthesize..."
              className={`flex-1 bg-transparent text-base ${
                isLight ? 'text-slate-900 placeholder-slate-400' : 'text-slate-100 placeholder-slate-500'
              } focus:outline-none font-mono-cad`}
            />
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
              } transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-1.5 font-mono-cad text-xs">
            <div className={`px-3 py-1.5 text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'} uppercase tracking-wider font-semibold`}>
              Verified 3D Objects ({filteredObjects.length})
            </div>

            {filteredObjects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => {
                  onSelectObject(obj);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-xl ${
                  isLight
                    ? 'bg-slate-50/80 hover:bg-blue-50/80 border border-slate-200/60 hover:border-blue-300'
                    : 'bg-white/[0.02] hover:bg-[#00f2ad]/10 border border-transparent hover:border-[#00f2ad]/30'
                } cursor-pointer group transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${
                    isLight
                      ? 'bg-blue-100 text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white'
                      : 'bg-white/5 group-hover:bg-[#00f2ad]/20 text-[#00f2ad]'
                  } flex items-center justify-center transition-colors`}>
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${
                      isLight ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-200 group-hover:text-white'
                    } transition-colors`}>
                      {obj.name}
                    </h4>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{obj.category} • {obj.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-white/5 border border-white/10 text-slate-300'
                  }`}>
                    {obj.stats.componentCount} parts
                  </span>
                  <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`} />
                </div>
              </div>
            ))}

            {/* AI Custom Generator Trigger Card */}
            {query.trim() && (
              <div
                onClick={() => {
                  onSearchCustom(query.trim());
                  onClose();
                }}
                className={`p-4 rounded-xl ${
                  isLight
                    ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100/70'
                    : 'bg-[#00f2ad]/10 border border-[#00f2ad]/40 hover:bg-[#00f2ad]/20'
                } cursor-pointer flex items-center justify-between group transition-all mt-3`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${
                    isLight ? 'bg-blue-100 text-[#2563eb]' : 'bg-[#00f2ad]/20 text-[#00f2ad]'
                  } flex items-center justify-center`}>
                    <Sparkles className={`w-5 h-5 ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'} animate-pulse`} />
                  </div>
                  <div>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'} block text-sm`}>
                      Synthesize AI Breakdown: "{query}"
                    </span>
                    <span className={`text-[10px] ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`}>
                      Generate kinematics, metallurgy, DFMA equations & 3D nodes
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'} font-bold`}>
                  <span>GENERATE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}

            {/* Direct Model Upload Card */}
            {onUploadModel && (
              <label
                className={`p-3.5 rounded-xl border border-dashed cursor-pointer flex items-center justify-between group transition-all mt-2 ${
                  isLight
                    ? 'border-blue-300/80 bg-blue-50/40 hover:bg-blue-50 text-slate-800'
                    : 'border-white/15 bg-white/[0.02] hover:bg-white/5 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isLight ? 'bg-blue-100 text-[#2563eb]' : 'bg-white/10 text-[#38bdf8]'
                  }`}>
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-xs">
                      Upload Your Own 3D Model
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Drop or browse .glb / .gltf files for interactive breakdown
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded border transition-colors ${
                  isLight
                    ? 'border-blue-200 bg-white text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white'
                    : 'border-white/20 bg-white/5 text-[#38bdf8] group-hover:border-[#38bdf8]'
                }`}>
                  BROWSE
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
          <div className={`p-3 border-t ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/10 bg-black/40 text-slate-500'
          } flex items-center justify-between text-[10px] font-mono-cad`}>
            <div className="flex items-center gap-2">
              <kbd className={`px-1.5 py-0.5 rounded ${isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'}`}>ESC</kbd> to exit
              <span className="mx-1">•</span>
              <kbd className={`px-1.5 py-0.5 rounded ${isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'}`}>↵</kbd> to select
            </div>
            <span className={isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}>AI Procedural Engine Ready</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

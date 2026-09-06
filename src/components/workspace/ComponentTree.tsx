import React, { useState } from 'react';
import { ComponentNode } from '../../types/objectData';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Focus,
  Search,
  Layers,
  CheckCircle2,
  Box,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComponentTreeProps {
  rootComponents: ComponentNode[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  hoveredComponentId: string | null;
  onHoverComponent: (id: string | null) => void;
  isolatedComponentId: string | null;
  onToggleIsolate: (id: string) => void;
  hiddenComponentIds: Set<string>;
  onToggleHide: (id: string) => void;
  theme?: 'light' | 'dark';
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({
  rootComponents: incomingRootComponents,
  selectedComponentId,
  onSelectComponent,
  hoveredComponentId,
  onHoverComponent,
  isolatedComponentId,
  onToggleIsolate,
  hiddenComponentIds,
  onToggleHide,
  theme = 'dark',
}) => {
  const rootComponents = Array.isArray(incomingRootComponents) ? incomingRootComponents : [];
  const [searchQuery, setSearchQuery] = useState('');

  const collectNodeIds = (nodes: ComponentNode[] | undefined | null): string[] => (nodes || []).flatMap((node) => [
    node.id,
    ...(node.children ? collectNodeIds(node.children) : []),
  ]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    () => new Set(collectNodeIds(rootComponents))
  );

  React.useEffect(() => {
    setExpandedNodes(new Set(collectNodeIds(rootComponents)));
  }, [rootComponents]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNode = (node: ComponentNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedComponentId === node.id;
    const isHovered = hoveredComponentId === node.id;
    const isHidden = hiddenComponentIds.has(node.id);
    const isIsolated = isolatedComponentId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const matchesSearch =
      !searchQuery ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.cadId || '').toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={node.id} className="flex flex-col">
        {matchesSearch && (
          <motion.div
            layout
            onClick={() => onSelectComponent(isSelected ? null : node.id)}
            onMouseEnter={() => onHoverComponent(node.id)}
            onMouseLeave={() => onHoverComponent(null)}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`group relative flex items-center justify-between py-2.5 pr-3 cursor-pointer transition-all border ${
              isSelected
                ? theme === 'light'
                  ? 'bg-blue-50 text-[#0284c7] border-blue-200 shadow-sm'
                  : 'bg-[#00f2ad]/10 text-[#00f2ad] border-[#00f2ad]/30 shadow-[0_0_15px_rgba(0,242,173,0.1)]'
                : isHovered
                ? theme === 'light'
                  ? 'bg-slate-100 text-slate-900 border-slate-200'
                  : 'bg-white/5 text-slate-100 border-white/10'
                : theme === 'light'
                ? 'text-slate-700 hover:bg-slate-50 border-transparent'
                : 'text-slate-400 hover:bg-white/5 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              {hasChildren ? (
                <button
                  onClick={(e) => toggleExpand(node.id, e)}
                  className={`p-1 rounded transition-all shrink-0 ${
                    theme === 'light' ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900' : 'hover:bg-white/10 text-slate-500 hover:text-white'
                  }`}
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="w-3.5 shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: node.defaultColor || (theme === 'light' ? '#0284c7' : '#00f2ad') }} />
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate">{node.name}</span>
                <span className={`text-[9px] font-mono-cad truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  {node.cadId} • {node.material.name.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleIsolate(node.id); }}
                className={`p-1.5 rounded ${
                  isIsolated
                    ? 'bg-[#00f2ad] text-black'
                    : theme === 'light'
                    ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Focus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleHide(node.id); }}
                className={`p-1.5 rounded ${
                  isHidden
                    ? 'text-rose-400'
                    : theme === 'light'
                    ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`border-l ml-5 ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}
            >
              {node.children!.map((child) => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`workspace-sidebar flex flex-col h-full backdrop-blur-xl border-r select-none overflow-hidden ${
      theme === 'light' ? 'bg-white/95 border-slate-200 text-slate-800 shadow-sm' : 'bg-[#0a0d14]/90 border-white/10 text-white'
    }`}>
      <div className={`p-5 border-b flex flex-col gap-4 ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#00f2ad]" />
            <h3 className={`text-xs font-mono-cad uppercase tracking-wider font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Assembly Hierarchy
            </h3>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parts by name/ID..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono-cad border transition-all ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                : 'bg-black/40 border-white/10 text-slate-200 placeholder-slate-600 focus:bg-black/60 focus:border-[#00f2ad]/50'
            }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {rootComponents.map((node) => renderNode(node, 0))}
      </div>

      <div className={`p-4 border-t flex items-center gap-2.5 text-[10px] font-mono-cad uppercase tracking-widest ${
        theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-black/30 text-slate-500'
      }`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2ad]" />
        <span>Live Datum Synchronized</span>
      </div>
    </div>
  );
};

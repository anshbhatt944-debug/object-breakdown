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
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            className={`group relative flex items-center justify-between py-1.5 pr-2 my-0.5 rounded cursor-pointer transition-all border text-xs font-mono-cad ${
              isSelected
                ? theme === 'light'
                  ? 'bg-orange-50 text-[#c2410c] border-[rgba(226,114,40,0.5)] font-semibold shadow-sm'
                  : 'bg-[rgba(226,114,40,0.15)] text-white border-[rgba(226,114,40,0.7)] font-medium shadow-[0_0_12px_rgba(226,114,40,0.15)]'
                : isHovered
                ? theme === 'light'
                  ? 'bg-slate-100 text-slate-900 border-slate-200'
                  : 'bg-[#1a1b21] text-[#f3f4f8] border-[#262832]'
                : theme === 'light'
                ? 'text-slate-700 hover:bg-slate-50 border-transparent'
                : 'text-[#c5c7d0] hover:bg-[#1a1b21]/60 border-transparent'
            }`}
          >
            <div className="flex items-center gap-1.5 overflow-hidden mr-2">
              {hasChildren ? (
                <button
                  onClick={(e) => toggleExpand(node.id, e)}
                  className={`p-0.5 rounded transition-all shrink-0 ${
                    theme === 'light' ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#37393f]/40 text-[#6b7082] hover:text-white'
                  }`}
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="w-3.5 shrink-0 flex items-center justify-center">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isSelected ? 'bg-[#e27228]' : ''
                    }`}
                    style={{ backgroundColor: isSelected ? '#e27228' : (node.defaultColor || (theme === 'light' ? '#0284c7' : '#6b7082')) }}
                  />
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-[11px] truncate leading-tight">{node.name}</span>
                <span className={`text-[9px] font-mono-cad truncate ${theme === 'light' ? 'text-slate-400' : 'text-[#6b7082]'}`}>
                  {node.cadId || node.id} • {node.material.name.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleIsolate(node.id); }}
                title={isIsolated ? 'Show all parts' : 'Isolate this part'}
                className={`p-1 rounded ${
                  isIsolated
                    ? 'bg-[#e27228] text-white'
                    : theme === 'light'
                    ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-[#6b7082] hover:text-white hover:bg-[#37393f]/40'
                }`}
              >
                <Focus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleHide(node.id); }}
                title={isHidden ? 'Show part' : 'Hide part'}
                className={`p-1 rounded ${
                  isHidden
                    ? 'text-[#ef4444]'
                    : theme === 'light'
                    ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-[#6b7082] hover:text-white hover:bg-[#37393f]/40'
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
              className={`border-l ml-3.5 pl-0.5 ${theme === 'light' ? 'border-slate-200' : 'border-[#262832]'}`}
            >
              {node.children!.map((child) => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`workspace-sidebar flex flex-col h-full select-none overflow-hidden ${
      theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#111318] text-[#f3f4f8]'
    }`}>
      {/* Search & Assembly Explorer Header */}
      <div className={`p-3 border-b flex flex-col gap-2.5 ${theme === 'light' ? 'border-slate-200' : 'border-[#262832]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#e27228]" />
            <h3 className={`text-[11px] font-mono-cad uppercase tracking-wider font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-[#f3f4f8]'}`}>
              Assembly Explorer
            </h3>
          </div>
          <span className={`text-[9px] font-mono-cad px-1.5 py-0.5 rounded border ${
            theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#1a1b21] border-[#262832] text-[#6b7082]'
          }`}>
            {rootComponents.length} GROUPS
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7082]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter components (name / ID)..."
            className={`w-full pl-8 pr-2.5 py-1.5 rounded text-[11px] font-mono-cad border transition-all focus:outline-none ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#e27228]'
                : 'bg-[#1a1b21] border-[#262832] text-[#f3f4f8] placeholder-[#525666] focus:border-[rgba(226,114,40,0.6)]'
            }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        {rootComponents.map((node) => renderNode(node, 0))}
      </div>

      {/* Bottom Sync Status */}
      <div className={`px-3 py-2 border-t flex items-center justify-between text-[10px] font-mono-cad uppercase tracking-wider ${
        theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-[#262832] bg-[#0c0e13] text-[#6b7082]'
      }`}>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
          <span>WCS SYNCED</span>
        </div>
        <span className="text-[9px] text-[#525666]">v4.2 CAD</span>
      </div>
    </div>
  );
};

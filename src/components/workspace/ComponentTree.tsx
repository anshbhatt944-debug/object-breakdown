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
            className={`group relative flex items-center justify-between py-1.5 pr-2 my-0.5 rounded-[2px] cursor-pointer transition-all border text-xs font-mono-cad ${
              isSelected
                ? theme === 'light'
                  ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74] font-semibold shadow-xs'
                  : 'bg-[#e27228]/15 text-[#EFEAE2] border-[#e27228]/60 font-medium shadow-[0_0_12px_rgba(226,114,40,0.15)]'
                : isHovered
                ? theme === 'light'
                  ? 'bg-[#EAE4DC] text-[#161311] border-[#DDD6CB]'
                  : 'bg-[#25201c] text-[#EFEAE2] border-[var(--line)]'
                : theme === 'light'
                ? 'text-[#4A423B] hover:bg-[#F3EFE8] border-transparent'
                : 'text-[#c2bab2] hover:bg-[#211e1c] border-transparent'
            }`}
          >
            <div className="flex items-center gap-1.5 overflow-hidden mr-2">
              {hasChildren ? (
                <button
                  onClick={(e) => toggleExpand(node.id, e)}
                  className={`p-0.5 rounded transition-all shrink-0 cursor-pointer ${
                    theme === 'light' ? 'hover:bg-[#EAE4DC] text-[#786E66]' : 'hover:bg-[#342e29] text-[#8c8278] hover:text-[#EFEAE2]'
                  }`}
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="w-3.5 shrink-0 flex items-center justify-center">
                  <div
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{ backgroundColor: isSelected ? (theme === 'light' ? '#C2410C' : '#e27228') : (node.defaultColor || (theme === 'light' ? '#786e66' : '#8c8278')) }}
                  />
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-[11px] truncate leading-tight font-sans font-medium text-[var(--text)]">{node.name}</span>
                <span className={`text-[9px] font-mono truncate ${theme === 'light' ? 'text-[#786E66]' : 'text-[#8c8278]'}`}>
                  {node.cadId || node.id} • {node.material.name.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleIsolate(node.id); }}
                title={isIsolated ? 'Show all parts' : 'Isolate this part'}
                className={`p-1 rounded cursor-pointer ${
                  isIsolated
                    ? 'bg-[#C2410C] text-white dark:bg-[#e27228]'
                    : theme === 'light'
                    ? 'text-[#786E66] hover:text-[#161311] hover:bg-[#EAE4DC]'
                    : 'text-[#8c8278] hover:text-white hover:bg-[#342e29]'
                }`}
              >
                <Focus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleHide(node.id); }}
                title={isHidden ? 'Show part' : 'Hide part'}
                className={`p-1 rounded cursor-pointer ${
                  isHidden
                    ? 'text-[#ef4444]'
                    : theme === 'light'
                    ? 'text-[#786E66] hover:text-[#161311] hover:bg-[#EAE4DC]'
                    : 'text-[#8c8278] hover:text-white hover:bg-[#342e29]'
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
              className={`border-l ml-3.5 pl-0.5 ${theme === 'light' ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}
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
      theme === 'light' ? 'bg-[#F7F5F0] text-[#161311]' : 'bg-[#181513] text-[#EFEAE2]'
    }`}>
      {/* Search & Assembly Explorer Header */}
      <div className={`p-3 border-b flex flex-col gap-2.5 ${theme === 'light' ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
            <h3 className={`text-[11px] font-mono-cad uppercase tracking-wider font-semibold ${theme === 'light' ? 'text-[#161311]' : 'text-[#EFEAE2]'}`}>
              Assembly Explorer
            </h3>
          </div>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
            theme === 'light' ? 'bg-[#EAE4DC] border-[#DDD6CB] text-[#5C554E]' : 'bg-[#211e1c] border-[var(--line)] text-[var(--muted)]'
          }`}>
            {rootComponents.length} GROUPS
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#786E66] dark:text-[#8c8278]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter components (name / ID)..."
            className={`w-full pl-8 pr-2.5 py-1.5 rounded-[2px] text-[11px] font-mono border transition-all focus:outline-none ${
              theme === 'light'
                ? 'bg-[#EAE4DC] border-[#DDD6CB] text-[#161311] placeholder-[#786E66] focus:bg-white focus:border-[#C2410C]'
                : 'bg-[#211e1c] border-[var(--line)] text-[#EFEAE2] placeholder-[#7d746a] focus:border-[#e27228]'
            }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 no-scrollbar">
        {rootComponents.map((node) => renderNode(node, 0))}
      </div>

      {/* Bottom Sync Status */}
      <div className={`px-3 py-2 border-t flex items-center justify-between text-[10px] font-mono uppercase tracking-wider ${
        theme === 'light' ? 'border-[#DDD6CB] bg-[#EAE4DC] text-[#5C554E]' : 'border-[var(--line)] bg-[#141210] text-[var(--muted)]'
      }`}>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-[#C2410C] dark:text-[#e27228]" />
          <span>WCS SYNCED</span>
        </div>
        <span className="text-[9px] text-[var(--muted)]">v4.2 CAD</span>
      </div>
    </div>
  );
};

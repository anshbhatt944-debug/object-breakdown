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
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

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
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({
  rootComponents,
  selectedComponentId,
  onSelectComponent,
  hoveredComponentId,
  onHoverComponent,
  isolatedComponentId,
  onToggleIsolate,
  hiddenComponentIds,
  onToggleHide,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const collectNodeIds = (nodes: ComponentNode[]): string[] => nodes.flatMap((node) => [
    node.id,
    ...(node.children ? collectNodeIds(node.children) : []),
  ]);

  // Open the hierarchy by default so selecting an object never hides the
  // components the current explode level is meant to teach the user about.
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

    // Filter match check
    const matchesSearch =
      !searchQuery ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.cadId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.material.name.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={node.id} className="flex flex-col">
        {matchesSearch && (
          <div
            onClick={() => onSelectComponent(isSelected ? null : node.id)}
            onMouseEnter={() => onHoverComponent(node.id)}
            onMouseLeave={() => onHoverComponent(null)}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`group relative flex items-center justify-between py-2 pr-3 rounded-lg cursor-pointer transition-all ${
              isSelected
                ? 'bg-[#00f2ad]/15 text-[#00f2ad] border border-[#00f2ad]/40 shadow-[0_0_15px_rgba(0,242,173,0.1)]'
                : isHovered
                ? 'bg-white/5 text-slate-100 border border-white/10'
                : 'text-slate-300 hover:bg-white/[0.03] border border-transparent'
            }`}
          >
            {/* Left expand toggle & name */}
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              {hasChildren ? (
                <button
                  onClick={(e) => toggleExpand(node.id, e)}
                  className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <div className="w-3.5 shrink-0 flex items-center justify-center">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: node.defaultColor || '#00f2ad' }}
                  />
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium truncate">{node.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono-cad text-slate-400">
                  <span className="text-[#38bdf8]">{node.cadId}</span>
                  <span>•</span>
                  <span className="truncate">{node.material.name.split(' ')[0]}</span>
                </div>
              </div>
            </div>

            {/* Right Action Icons (Hide, Isolate) */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              {/* Isolate Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleIsolate(node.id);
                }}
                title={isIsolated ? 'Restore full assembly' : 'Isolate component in 3D'}
                className={`p-1 rounded transition-all ${
                  isIsolated
                    ? 'bg-[#00f2ad] text-slate-950 shadow-[0_0_10px_#00f2ad]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Focus className="w-3 h-3" />
              </button>

              {/* Hide / Show Visibility Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide(node.id);
                }}
                title={isHidden ? 'Show component in 3D' : 'Hide component'}
                className={`p-1 rounded transition-all ${
                  isHidden
                    ? 'text-rose-400 bg-rose-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {/* Render Child Sub-components */}
        {hasChildren && isExpanded && (
          <div className="relative flex flex-col border-l border-white/10 ml-4 pl-1">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0d111a]/90 backdrop-blur-xl border-r border-white/10 select-none overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00f2ad]" />
            <h3 className="text-xs font-mono-cad uppercase tracking-wider font-semibold text-slate-200">
              Assembly Structure
            </h3>
          </div>
          <span className="text-[10px] font-mono-cad px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
            {rootComponents.length} Subsystems
          </span>
        </div>

        {/* Search & Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter components or CAD ID..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00f2ad]/50 font-mono-cad"
          />
        </div>
      </div>

      {/* Hierarchy Tree View */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {rootComponents.map((node) => renderNode(node, 0))}
      </div>

      {/* Assembly Statistics Footer */}
      <div className="p-3 border-t border-white/10 bg-black/30 flex items-center justify-between text-[11px] font-mono-cad text-slate-400">
        <div className="flex items-center gap-1.5 text-[#00f2ad]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Interactive Datum Active</span>
        </div>
        <span>Click to Inspect</span>
      </div>
    </div>
  );
};

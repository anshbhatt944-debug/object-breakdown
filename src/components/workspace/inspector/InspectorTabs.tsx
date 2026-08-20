import React from 'react';
import {
  FileText,
  Activity,
  Layers,
  PlayCircle,
  Cpu,
  Factory,
  Share2,
  AlertTriangle,
  Sliders,
  Bot,
  Sparkles,
  Scale,
} from 'lucide-react';

export type InspectorTabType =
  | 'component'
  | 'overview'
  | 'materials'
  | 'kinematics'
  | 'equations'
  | 'manufacturing'
  | 'relationships'
  | 'failures'
  | 'whatif'
  | 'ai'
  | 'insights';

interface InspectorTabsProps {
  activeTab: InspectorTabType;
  onTabChange: (tab: InspectorTabType) => void;
  hasSelectedComponent: boolean;
  onOpenCompare: () => void;
}

export const InspectorTabs: React.FC<InspectorTabsProps> = ({
  activeTab,
  onTabChange,
  hasSelectedComponent,
  onOpenCompare,
}) => {
  const tabs = [
    { id: 'component' as InspectorTabType, label: 'Component', icon: FileText, badge: hasSelectedComponent ? '1' : null },
    { id: 'overview' as InspectorTabType, label: 'Overview', icon: Activity },
    { id: 'materials' as InspectorTabType, label: 'Materials', icon: Layers },
    { id: 'kinematics' as InspectorTabType, label: 'How It Works', icon: PlayCircle },
    { id: 'equations' as InspectorTabType, label: 'Equations', icon: Cpu },
    { id: 'manufacturing' as InspectorTabType, label: "How It's Made", icon: Factory },
    { id: 'relationships' as InspectorTabType, label: 'Linkages', icon: Share2 },
    { id: 'failures' as InspectorTabType, label: 'Failures', icon: AlertTriangle },
    { id: 'whatif' as InspectorTabType, label: 'What If?', icon: Sliders, highlight: true },
    { id: 'ai' as InspectorTabType, label: 'AI Engineer', icon: Bot, highlight: true },
    { id: 'insights' as InspectorTabType, label: 'DFMA Insights', icon: Sparkles },
  ];

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#0a0e17] overflow-x-auto select-none gap-1">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 transition-all shrink-0 relative ${
                isActive
                  ? 'bg-[#00f2ad]/15 text-[#00f2ad] font-semibold border border-[#00f2ad]/40 shadow-[0_0_12px_rgba(0,242,173,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00f2ad]' : tab.highlight ? 'text-[#38bdf8]' : ''}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-[#00f2ad] text-slate-950 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onOpenCompare}
        className="px-3 py-1.5 rounded-lg text-xs font-mono-cad flex items-center gap-1.5 text-slate-300 hover:text-[#00f2ad] hover:bg-white/5 border border-white/10 transition-all shrink-0 ml-2"
      >
        <Scale className="w-3.5 h-3.5 text-[#38bdf8]" />
        <span>Compare</span>
      </button>
    </div>
  );
};

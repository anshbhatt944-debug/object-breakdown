import React from 'react';

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
  theme?: 'light' | 'dark';
}

export const InspectorTabs: React.FC<InspectorTabsProps> = ({
  activeTab,
  onTabChange,
  hasSelectedComponent,
  onOpenCompare,
  theme = 'dark',
}) => {
  const tabs = [
    { id: 'component' as InspectorTabType, label: 'Component' },
    { id: 'overview' as InspectorTabType, label: 'Overview' },
    { id: 'materials' as InspectorTabType, label: 'Materials' },
    { id: 'kinematics' as InspectorTabType, label: 'How It Works' },
    { id: 'equations' as InspectorTabType, label: 'Equations' },
    { id: 'manufacturing' as InspectorTabType, label: "Mfg" },
    { id: 'relationships' as InspectorTabType, label: 'Linkages' },
    { id: 'failures' as InspectorTabType, label: 'Failures' },
    { id: 'whatif' as InspectorTabType, label: 'What If' },
    { id: 'ai' as InspectorTabType, label: 'AI' },
    { id: 'insights' as InspectorTabType, label: 'Insights' },
  ];

  return (
    <div className={`flex border-b overflow-x-auto no-scrollbar transition-colors ${
      theme === 'light'
        ? 'border-slate-200 bg-white'
        : 'border-[#111] bg-[#030303]'
    }`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors border-r ${
              theme === 'light'
                ? `border-slate-100 ${
                    isActive
                      ? 'text-[#0f172a] font-bold border-b-2 border-[#2563eb] bg-slate-50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`
                : `border-[#111] ${
                    isActive
                      ? 'text-white border-b-2 border-[#ff5c35]'
                      : 'text-[#555] hover:text-[#ede9e1]'
                  }`
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

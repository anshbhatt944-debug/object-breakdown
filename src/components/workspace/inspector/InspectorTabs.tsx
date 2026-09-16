import React from 'react';

export type InspectorTabType =
  | 'overview'
  | 'component'
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
    { id: 'overview' as InspectorTabType, label: 'Overview' },
    { id: 'component' as InspectorTabType, label: 'Component' },
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
    <div className={`flex border-b overflow-x-auto no-scrollbar transition-colors select-none shrink-0 ${
      theme === 'light'
        ? 'border-slate-200 bg-slate-50'
        : 'border-[#262832] bg-[#111318]'
    }`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 text-[10px] font-mono-cad uppercase tracking-wider whitespace-nowrap transition-colors border-r ${
              theme === 'light'
                ? `border-slate-200 ${
                    isActive
                      ? 'text-[#c2410c] font-bold border-b-2 border-[#e27228] bg-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`
                : `border-[#262832] ${
                    isActive
                      ? 'text-[#f3f4f8] font-bold border-b-2 border-[#e27228] bg-[#16181f]'
                      : 'text-[#6b7082] hover:text-[#c5c7d0] hover:bg-[#1a1b21]'
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

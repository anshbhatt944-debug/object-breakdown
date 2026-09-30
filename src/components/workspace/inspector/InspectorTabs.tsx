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
        ? 'border-[#dfd8cf] bg-[#eae5de]'
        : 'border-[var(--line)] bg-[#181513]'
    }`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors border-r ${
              theme === 'light'
                ? `border-[#dfd8cf] ${
                    isActive
                      ? 'text-[#1D1713] font-semibold border-b-2 border-[#e27228] bg-[#f4efe8]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-[#ece7e0]'
                  }`
                : `border-[var(--line)] ${
                    isActive
                      ? 'text-[#EFEAE2] font-semibold border-b-2 border-[#e27228] bg-[#211e1c]'
                      : 'text-[var(--muted)] hover:text-[#EFEAE2] hover:bg-[#25201c]'
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

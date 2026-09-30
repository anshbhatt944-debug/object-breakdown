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

  const isLight = theme === 'light';

  return (
    <div className={`flex border-b overflow-x-auto no-scrollbar transition-colors select-none shrink-0 ${
      isLight
        ? 'border-[#DDD6CB] bg-[#EAE4DC]'
        : 'border-[var(--line)] bg-[#181513]'
    }`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-all border-r cursor-pointer ${
              isLight
                ? `border-[#DDD6CB] ${
                    isActive
                      ? 'text-[#C2410C] font-bold border-b-2 border-b-[#C2410C] bg-white shadow-sm'
                      : 'text-[#686058] hover:text-[#161311] hover:bg-[#F4EFE8]'
                  }`
                : `border-[var(--line)] ${
                    isActive
                      ? 'text-[#EFEAE2] font-semibold border-b-2 border-b-[#e27228] bg-[#211e1c]'
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

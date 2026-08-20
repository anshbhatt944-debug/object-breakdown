import React, { useState } from 'react';
import { ObjectBreakdownData, DepthLevel } from './types/objectData';
import { ballpointPenData } from './data/objects/ballpointPen';
import { searchOrGenerateObject, getObjectById } from './data/objectRegistry';
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { PopularObjects } from './components/landing/PopularObjects';
import { LayerTransformation } from './components/landing/LayerTransformation';
import { DepthSelectorSection } from './components/landing/DepthSelectorSection';
import { LandingSimulator } from './components/landing/LandingSimulator';
import { FooterCta } from './components/landing/FooterCta';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { SearchModal } from './components/common/SearchModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing');
  const [currentObject, setCurrentObject] = useState<ObjectBreakdownData>(ballpointPenData);
  const [depthLevel, setDepthLevel] = useState<DepthLevel>('detailed');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = window.localStorage.getItem('object-breakdown-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('object-breakdown-theme', theme);
  }, [theme]);

  // Navigate to workspace with specified object
  const handleLaunchObject = (obj: ObjectBreakdownData) => {
    setCurrentObject(obj);
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSearchQuery = (query: string) => {
    const result = searchOrGenerateObject(query);
    handleLaunchObject(result);
  };

  const handleSelectPopularById = (id: string) => {
    const found = getObjectById(id);
    if (found) {
      handleLaunchObject(found);
    }
  };

  if (currentView === 'workspace') {
    return (
      <WorkspaceLayout
        currentObject={currentObject}
        onSelectObject={setCurrentObject}
        depthLevel={depthLevel}
        onDepthChange={setDepthLevel}
        onReturnHome={() => setCurrentView('landing')}
        theme={theme}
        onToggleTheme={() => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))}
      />
    );
  }

  return (
    <div className={`landing-app min-h-screen flex flex-col ${theme === 'light' ? 'theme-light' : 'theme-dark'} selection:bg-[#00f2ad]/20`}> 
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onLaunchWorkspace={() => handleLaunchObject(currentObject)}
        depthLevel={depthLevel}
        theme={theme}
        onToggleTheme={() => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Landing Sections */}
      <main className="flex-1">
        <HeroSection
          onSearch={handleSearchQuery}
          onSelectPopular={handleSelectPopularById}
        />

        <PopularObjects onSelectObjectById={handleSelectPopularById} />

        <LayerTransformation />

        <DepthSelectorSection
          depthLevel={depthLevel}
          onDepthChange={setDepthLevel}
        />

        <LandingSimulator
          onLaunchWorkspace={() => handleLaunchObject(currentObject)}
        />

        <FooterCta onSearch={handleSearchQuery} />
      </main>

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectObject={handleLaunchObject}
        onSearchCustom={handleSearchQuery}
      />
    </div>
  );
};

export default App;

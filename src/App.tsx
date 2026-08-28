import React, { useState } from 'react';
import { ObjectBreakdownData, DepthLevel } from './types/objectData';
import { ballpointPenData } from './data/objects/ballpointPen';
import { searchOrGenerateObject, getObjectById } from './data/objectRegistry';
import * as uploadAnalysis from './data/uploadAnalysis';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
  const [currentView, setCurrentView] = useState<
    'landing' | 'workspace'
  >('landing');

  const [currentObject, setCurrentObject] =
    useState<ObjectBreakdownData>(ballpointPenData);

  const [uploadedModel, setUploadedModel] = useState<{
    url: string;
    fileName: string;
  } | null>(null);

  const [depthLevel, setDepthLevel] =
    useState<DepthLevel>('detailed');

  const [uploadStatus, setUploadStatus] =
    useState<string | null>(null);

  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = window.localStorage.getItem(
      'object-breakdown-theme'
    );

    return saved === 'light' ? 'light' : 'dark';
  });

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;

    window.localStorage.setItem(
      'object-breakdown-theme',
      theme
    );
  }, [theme]);

  // Open workspace with a selected object
  const handleLaunchObject = (obj: ObjectBreakdownData) => {
    setCurrentObject(obj);
    setCurrentView('workspace');

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  // Handle uploaded GLB / GLTF models
  const handleUploadModel = async (file: File) => {
    const url = URL.createObjectURL(file);
    const loader = new GLTFLoader();

    setUploadStatus('Loading 3D model…');

    try {
      const gltf = await loader.loadAsync(url);

      setUploadStatus(
        'Inspecting model structure and identifying components…'
      );

      /*
       * Different versions of uploadAnalysis.ts may expose
       * different function names.
       *
       * Using the module namespace here keeps App.tsx compatible
       * without importing exports that may not exist.
       */
      const analysisApi = uploadAnalysis as unknown as Record<
        string,
        unknown
      >;

      const aiAnalyzer =
        analysisApi.analyzeUploadedModelWithAI;

      const sceneAnalyzer =
        analysisApi.analyzeUploadedScene;

      const legacyAnalyzer =
        analysisApi.analyzeUploadedModel;

      let analyzed: ObjectBreakdownData | null = null;

      // Prefer AI analysis if the current uploadAnalysis module has it
      if (typeof aiAnalyzer === 'function') {
        try {
          setUploadStatus(
            'AI is identifying meaningful assemblies and components…'
          );

          const result = await (
            aiAnalyzer as (
              scene: typeof gltf.scene,
              fileName: string
            ) => Promise<unknown>
          )(gltf.scene, file.name);

          analyzed = result as ObjectBreakdownData;
        } catch (analysisError) {
          console.warn(
            'AI analysis failed, attempting available geometry analysis:',
            analysisError
          );
        }
      }

      // Geometry fallback
      if (
        !analyzed &&
        typeof sceneAnalyzer === 'function'
      ) {
        setUploadStatus(
          'Using model geometry to identify components…'
        );

        const result = (
          sceneAnalyzer as (
            scene: typeof gltf.scene,
            fileName: string
          ) => unknown
        )(gltf.scene, file.name);

        analyzed = result as ObjectBreakdownData;
      }

      // Compatibility with older versions of uploadAnalysis.ts
      if (
        !analyzed &&
        typeof legacyAnalyzer === 'function'
      ) {
        setUploadStatus(
          'Analyzing uploaded model structure…'
        );

        const result = await (
          legacyAnalyzer as (
            scene: typeof gltf.scene,
            fileName: string
          ) => Promise<unknown>
        )(gltf.scene, file.name);

        analyzed = result as ObjectBreakdownData;
      }

      /*
       * If no compatible analyzer exists, stop here instead of
       * silently opening the model with fake/random components.
       */
      if (!analyzed) {
        throw new Error(
          'No compatible analysis function was found in uploadAnalysis.ts.'
        );
      }

      setCurrentObject(analyzed);

      setUploadedModel({
        url,
        fileName: file.name,
      });

      setCurrentView('workspace');

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    } catch (error) {
      console.error(
        'Unable to load or analyze uploaded model:',
        error
      );

      URL.revokeObjectURL(url);

      alert(
        'This 3D file could not be loaded or analyzed.\n\nCheck the browser console and server terminal for details.'
      );
    } finally {
      setUploadStatus(null);
    }
  };

  // Handle custom object search
  const handleSearchQuery = (query: string) => {
    setUploadedModel(null);

    const result = searchOrGenerateObject(query);

    handleLaunchObject(result);
  };

  // Handle popular object selection
  const handleSelectPopularById = (id: string) => {
    setUploadedModel(null);

    const found = getObjectById(id);

    if (found) {
      handleLaunchObject(found);
    }
  };

  // Workspace view
  if (currentView === 'workspace') {
    return (
      <WorkspaceLayout
        currentObject={currentObject}
        onSelectObject={setCurrentObject}
        depthLevel={depthLevel}
        onDepthChange={setDepthLevel}
        onReturnHome={() => setCurrentView('landing')}
        theme={theme}
        onToggleTheme={() =>
          setTheme((value) =>
            value === 'dark' ? 'light' : 'dark'
          )
        }
        uploadedModel={uploadedModel}
      />
    );
  }

  // Landing page
  return (
    <div
      className={`landing-app min-h-screen flex flex-col ${
        theme === 'light'
          ? 'theme-light'
          : 'theme-dark'
      } selection:bg-[#00f2ad]/20`}
    >
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onLaunchWorkspace={() =>
          handleLaunchObject(currentObject)
        }
        depthLevel={depthLevel}
        theme={theme}
        onToggleTheme={() =>
          setTheme((value) =>
            value === 'dark' ? 'light' : 'dark'
          )
        }
      />

      {/* Main Landing Sections */}
      <main className="flex-1">
        <HeroSection
          onSearch={handleSearchQuery}
          onSelectPopular={handleSelectPopularById}
          onUploadModel={handleUploadModel}
        />

        <PopularObjects
          onSelectObjectById={handleSelectPopularById}
        />

        <LayerTransformation />

        <DepthSelectorSection
          depthLevel={depthLevel}
          onDepthChange={setDepthLevel}
        />

        <LandingSimulator
          onLaunchWorkspace={() =>
            handleLaunchObject(currentObject)
          }
        />

        <FooterCta
          onSearch={handleSearchQuery}
        />
      </main>

      {/* Upload analysis overlay */}
      {uploadStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[min(440px,90vw)] rounded-2xl border border-[#00f2ad]/40 bg-[#10151d] p-6 shadow-2xl">
            <div className="mb-3 text-xs font-bold tracking-[0.2em] text-[#00f2ad]">
              UPLOAD ANALYSIS
            </div>

            <div className="text-lg font-semibold text-white">
              {uploadStatus}
            </div>

            <div className="mt-5 h-1 overflow-hidden rounded bg-white/10">
              <div className="h-full w-1/2 animate-pulse bg-[#00f2ad]" />
            </div>

            <p className="mt-4 text-sm text-slate-400">
              The model is being analyzed using its actual mesh
              structure and available AI analysis.
            </p>
          </div>
        </div>
      )}

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
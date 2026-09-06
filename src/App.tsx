import React, { useState } from 'react';
import { ObjectBreakdownData, DepthLevel } from './types/objectData';
import { wristwatchData } from './data/objects/wristwatch';
import { droneData } from './data/objects/drone';
import { carEngineData } from './data/objects/carEngine';
import { electricMotorData } from './data/objects/electricMotor';
import { ballpointPenData } from './data/objects/ballpointPen';
import { searchOrGenerateObject, getObjectById } from './data/objectRegistry';
import * as uploadAnalysis from './data/uploadAnalysis';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Upload } from 'lucide-react';

import { Navbar } from './components/landing/Navbar';
import { ImmersiveExperience } from './components/landing/ImmersiveExperience';

import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { SearchModal } from './components/common/SearchModal';
import { AiScanOverlay } from './components/common/AiScanOverlay';
import { CustomCursor } from './components/common/CustomCursor';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'workspace' || v === 'studio') return 'workspace';
    }
    return 'landing';
  });

  const [currentObject, setCurrentObject] = useState<ObjectBreakdownData>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const objId = params.get('object');
      if (objId) {
        const found = getObjectById(objId);
        if (found) return found;
      }
    }
    return ballpointPenData;
  });

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
    const saved = window.localStorage.getItem('object-breakdown-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }

    window.localStorage.setItem('object-breakdown-theme', theme);
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

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const isUploadingRef = React.useRef(false);

  // Handle uploaded GLB / GLTF models
  const handleUploadModel = async (file: File) => {
    if (isUploadingRef.current) {
      console.warn(`[CLIENT][App.tsx:handleUploadModel] IGNORED duplicate invocation while upload is already active for file="${file?.name}"`);
      return;
    }
    isUploadingRef.current = true;
    console.log(`[CLIENT][App.tsx:handleUploadModel] ENTRY called with file="${file?.name}" size=${file?.size} timestamp=${new Date().toISOString()}`);
    const url = URL.createObjectURL(file);
    const loader = new GLTFLoader();

    setUploadStatus('Loading 3D model geometry…');

    try {
      const gltf = await loader.loadAsync(url);

      setUploadStatus('Decomposing assembly into kinematic components…');

      let analyzed: ObjectBreakdownData | null = null;

      try {
        console.log(`[CLIENT][App.tsx:handleUploadModel] CALLING uploadAnalysis.analyzeUploadedModelWithAI for file="${file.name}"`);
        analyzed = await uploadAnalysis.analyzeUploadedModelWithAI(
          gltf.scene,
          file.name
        );
        console.log(`[CLIENT][App.tsx:handleUploadModel] AI analysis SUCCESS for file="${file.name}"`);
      } catch (err) {
        console.warn('AI analysis skipped/failed, using in-browser geometry decomposition:', err);
      }

      if (!analyzed) {
        analyzed = uploadAnalysis.analyzeUploadedScene(
          gltf.scene,
          file.name
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
      console.error('Unable to load or analyze uploaded model:', error);
      URL.revokeObjectURL(url);
      alert('This 3D file could not be parsed. Please make sure it is a valid .glb or .gltf asset.');
    } finally {
      isUploadingRef.current = false;
      setUploadStatus(null);
    }
  };

  // Global window-level drag & drop support anywhere in the application
  React.useEffect(() => {
    let dragDepth = 0;

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragDepth++;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDraggingFile(true);
      }
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragDepth--;
      if (dragDepth <= 0) {
        dragDepth = 0;
        setIsDraggingFile(false);
      }
    };

    const onDrop = (e: DragEvent) => {
      console.log(`[CLIENT][App.tsx:window.onDrop] EVENT FIRED timestamp=${new Date().toISOString()}`);
      e.preventDefault();
      dragDepth = 0;
      setIsDraggingFile(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const lower = file.name.toLowerCase();
        if (lower.endsWith('.glb') || lower.endsWith('.gltf')) {
          console.log(`[CLIENT][App.tsx:window.onDrop] Calling handleUploadModel with "${file.name}"`);
          handleUploadModel(file);
        } else {
          alert('Please drop a 3D model in .glb or .gltf format.');
        }
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

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
      <>
        <CustomCursor theme={theme} />
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
          onUploadModel={handleUploadModel}
        />

        {/* Global Full-Screen Drag-and-Drop HUD Overlay */}
        {isDraggingFile && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-2xl pointer-events-none select-none animate-in fade-in duration-150">
            <div className="flex flex-col items-center p-12 rounded-3xl border-2 border-dashed border-[#00f2ad] bg-[#080d1a]/95 text-center shadow-[0_0_80px_rgba(0,242,173,0.35)]">
              <div className="w-20 h-20 rounded-2xl bg-[#00f2ad]/10 border border-[#00f2ad]/30 flex items-center justify-center mb-6 text-[#00f2ad] animate-bounce">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white tracking-tight mb-2">
                DROP 3D CAD MODEL TO DECONSTRUCT
              </h3>
              <p className="text-xs font-mono-cad text-slate-400 max-w-sm">
                Release anywhere to inspect assembly geometry and generate an interactive 3D exploded breakdown.
              </p>
              <div className="mt-6 flex items-center gap-3 text-[10px] font-mono-cad text-[#00f2ad] uppercase tracking-widest font-bold">
                <span>Supports .GLB</span>
                <span>•</span>
                <span>Supports .GLTF</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload analysis overlay */}
        {uploadStatus && <AiScanOverlay status={uploadStatus} theme={theme} />}
      </>
    );
  }

  // Landing page
  return (
    <div
      className={`landing-app min-h-screen flex flex-col ${
        theme === 'light'
          ? 'theme-light'
          : 'theme-dark'
      } selection:bg-[#3b82f6]/30`}
    >
      <CustomCursor theme={theme} />

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
        <ImmersiveExperience
          objects={[
            wristwatchData,
            droneData,
            carEngineData,
            electricMotorData,
            ballpointPenData,
          ]}
          onSelectObject={handleLaunchObject}
          onUploadModel={handleUploadModel}
          onSearchCustom={handleSearchQuery}
          theme={theme}
        />
      </main>

      {/* Upload analysis overlay */}
      {uploadStatus && <AiScanOverlay status={uploadStatus} theme={theme} />}

      {/* Global Full-Screen Drag-and-Drop HUD Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-2xl pointer-events-none select-none animate-in fade-in duration-150">
          <div className="flex flex-col items-center p-12 rounded-3xl border-2 border-dashed border-[#00f2ad] bg-[#080d1a]/95 text-center shadow-[0_0_80px_rgba(0,242,173,0.35)]">
            <div className="w-20 h-20 rounded-2xl bg-[#00f2ad]/10 border border-[#00f2ad]/30 flex items-center justify-center mb-6 text-[#00f2ad] animate-bounce">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-white tracking-tight mb-2">
              DROP 3D CAD MODEL TO DECONSTRUCT
            </h3>
            <p className="text-xs font-mono-cad text-slate-400 max-w-sm">
              Release anywhere to inspect assembly geometry and generate an interactive 3D exploded breakdown.
            </p>
            <div className="mt-6 flex items-center gap-3 text-[10px] font-mono-cad text-[#00f2ad] uppercase tracking-widest font-bold">
              <span>Supports .GLB</span>
              <span>•</span>
              <span>Supports .GLTF</span>
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectObject={handleLaunchObject}
        onSearchCustom={handleSearchQuery}
        theme={theme}
        onUploadModel={handleUploadModel}
      />
    </div>
  );
};

export default App;
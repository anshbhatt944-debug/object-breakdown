import React, { useEffect, useRef, useState } from 'react';
import { ObjectBreakdownData, DepthLevel, ViewMode3D, ComponentNode } from '../../types/objectData';
import { WorkspaceHeader } from './WorkspaceHeader';
import { ComponentTree } from './ComponentTree';
import { ThreeCanvas } from './viewer3d/ThreeCanvas';
import { DroneCanvas } from './viewer3d/DroneCanvas';
import { ViewportToolbar } from './viewer3d/ViewportToolbar';
import { CalipersTool } from './viewer3d/CalipersTool';
import { ViewModeHUD } from './viewer3d/ViewModeHUD';
import { InspectorTabs, InspectorTabType } from './inspector/InspectorTabs';
import { ComponentDetails } from './inspector/ComponentDetails';
import { ObjectOverview } from './inspector/ObjectOverview';
import { MaterialAnalysis } from './inspector/MaterialAnalysis';
import { HowItWorks } from './inspector/HowItWorks';
import { EngineeringAnalysis } from './inspector/EngineeringAnalysis';
import { ManufacturingProcess } from './inspector/ManufacturingProcess';
import { RelationshipMap } from './inspector/RelationshipMap';
import { FailureAnalysis } from './inspector/FailureAnalysis';
import { WhatIfSimulator } from './inspector/WhatIfSimulator';
import { AskEngineer } from './inspector/AskEngineer';
import { DesignInsights } from './inspector/DesignInsights';
import { ObjectComparison } from './inspector/ObjectComparison';
import { StatusBar } from './StatusBar';
import { resolveModelComponentNode, buildGenericModelComponentNode } from '../../data/modelComponentResolver';
import {
  ChevronUp,
  ChevronDown,
  X,
  Focus,
  Eye,
  EyeOff,
  Settings,
  Layers,
  Box,
  RotateCcw,
  Ruler,
  Play,
  Pause,
  Maximize2,
  Sliders,
  Tag,
  Activity,
  Flame,
} from 'lucide-react';

interface WorkspaceLayoutProps {
  currentObject: ObjectBreakdownData;
  onSelectObject: (obj: ObjectBreakdownData) => void;
  depthLevel: DepthLevel;
  onDepthChange: (depth: DepthLevel) => void;
  onReturnHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  uploadedModel?: { url: string; fileName: string } | null;
  uploadedObject?: ObjectBreakdownData | null;
  onUploadModel?: (file: File) => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  currentObject,
  onSelectObject,
  depthLevel,
  onDepthChange,
  onReturnHome,
  theme,
  onToggleTheme,
  uploadedModel = null,
  uploadedObject = null,
  onUploadModel,
}) => {
  // 3D Viewport state
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [explodeAmount, setExplodeAmount] = useState<number>(0.16);
  const [viewMode, setViewMode] = useState<ViewMode3D>('solid');
  const [isPlayingMechanism, setIsPlayingMechanism] = useState<boolean>(true);
  const [isolatedComponentId, setIsolatedComponentId] = useState<string | null>(null);
  const [hiddenComponentIds, setHiddenComponentIds] = useState<Set<string>>(new Set());
  const [showLeaderLines, setShowLeaderLines] = useState<boolean>(true);
  const [showCalipers, setShowCalipers] = useState<boolean>(false);

  // Inspector state
  const [activeInspectorTab, setActiveInspectorTab] = useState<InspectorTabType>('overview');
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isMobileTreeOpen, setIsMobileTreeOpen] = useState<boolean>(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState<boolean>(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState<boolean>(false);
  const [mobileSheetStage, setMobileSheetStage] = useState<'peek' | 'expanded'>('peek');
  const [inspectorWidth, setInspectorWidth] = useState<number>(() => {
    const saved = Number(window.localStorage.getItem('object-breakdown-inspector-width'));
    return Number.isFinite(saved) && saved >= 360 && saved <= 760 ? saved : 480;
  });
  const resizingInspectorRef = useRef(false);

  // Model teardown & reset: purge all previous component selections and states
  useEffect(() => {
    setSelectedComponentId(null);
    setHoveredComponentId(null);
    setIsolatedComponentId(null);
    setHiddenComponentIds(new Set());
    setExplodeAmount(0.0);
    setIsPlayingMechanism(true);
    setActiveInspectorTab('overview');
    setIsMobileTreeOpen(false);
    setIsMobileInspectorOpen(false);
    setIsMobileControlsOpen(false);
    setMobileSheetStage('peek');
  }, [currentObject.id]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!resizingInspectorRef.current) return;
      const nextWidth = Math.max(360, Math.min(760, window.innerWidth - event.clientX));
      setInspectorWidth(nextWidth);
    };
    const handlePointerUp = () => {
      if (!resizingInspectorRef.current) return;
      resizingInspectorRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.localStorage.setItem('object-breakdown-inspector-width', String(inspectorWidth));
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [inspectorWidth]);

  const startInspectorResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    resizingInspectorRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const selectedComponentIdRef = useRef<string | null>(null);
  selectedComponentIdRef.current = selectedComponentId;

  // Helper to find selected component node
  const findComponentNode = (id: string | null): ComponentNode | null => {
    if (!id) return null;
    let found: ComponentNode | null = null;
    const traverse = (nodes: ComponentNode[]) => {
      for (const n of nodes) {
        if (n.id === id) {
          found = n;
          return;
        }
        if (n.children) traverse(n.children);
      }
    };
    traverse(currentObject.rootComponents);
    return found;
  };

  const selectedNode = selectedComponentId
    ? findComponentNode(selectedComponentId)
      ?? resolveModelComponentNode(currentObject, selectedComponentId)
      ?? buildGenericModelComponentNode(currentObject, selectedComponentId)
    : null;

  // When a component is selected, auto-switch inspector to component tab.
  // If the user clicks on the component again (or deselects it), return to the overview tab.
  const handleSelectComponent = (id: string | null) => {
    if (!id || id === selectedComponentIdRef.current) {
      setSelectedComponentId(null);
      setActiveInspectorTab('overview');
      setMobileSheetStage('peek');
    } else {
      setSelectedComponentId(id);
      setActiveInspectorTab('component');
      setMobileSheetStage('peek');
    }
  };

  const handleToggleIsolate = (id: string) => {
    setIsolatedComponentId((prev) => (prev === id ? null : id));
  };

  const handleToggleHide = (id: string) => {
    setHiddenComponentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleResetView = () => {
    setExplodeAmount(0.0);
    setViewMode('solid');
    setIsolatedComponentId(null);
    setHiddenComponentIds(new Set());
    setSelectedComponentId(null);
    setActiveInspectorTab('overview');
    setIsPlayingMechanism(false);
    setMobileSheetStage('peek');
    setIsMobileControlsOpen(false);
  };

  // Centralized inspector content renderer shared between desktop right panel and mobile full sheet
  const renderInspectorContent = () => {
    switch (activeInspectorTab) {
      case 'component':
        return (
          <ComponentDetails
            component={selectedNode}
            depthLevel={depthLevel}
            onSelectComponentById={handleSelectComponent}
            objectData={currentObject}
            theme={theme}
          />
        );
      case 'overview':
        return <ObjectOverview objectData={currentObject} depthLevel={depthLevel} theme={theme} />;
      case 'materials':
        return <MaterialAnalysis materials={currentObject.materials} depthLevel={depthLevel} theme={theme} />;
      case 'kinematics':
        return (
          <HowItWorks
            steps={currentObject.howItWorks}
            depthLevel={depthLevel}
            onSelectComponentById={handleSelectComponent}
            theme={theme}
          />
        );
      case 'equations':
        return <EngineeringAnalysis equations={currentObject.engineeringEquations} depthLevel={depthLevel} theme={theme} />;
      case 'manufacturing':
        return <ManufacturingProcess timeline={currentObject.manufacturingTimeline} depthLevel={depthLevel} theme={theme} />;
      case 'relationships':
        return (
          <RelationshipMap
            relationships={currentObject.relationships}
            rootComponents={currentObject.rootComponents}
            onSelectComponentById={handleSelectComponent}
            theme={theme}
          />
        );
      case 'failures':
        return <FailureAnalysis rootComponents={currentObject.rootComponents} depthLevel={depthLevel} theme={theme} />;
      case 'whatif':
        return <WhatIfSimulator parameters={currentObject.whatIfParameters} depthLevel={depthLevel} theme={theme} />;
      case 'ai':
        return <AskEngineer objectData={currentObject} selectedComponent={selectedNode} theme={theme} />;
      case 'insights':
        return <DesignInsights objectData={currentObject} depthLevel={depthLevel} theme={theme} />;
      default:
        return null;
    }
  };

  return (
    <div className={`workspace-app flex flex-col h-screen h-[100dvh] w-screen max-w-full overflow-hidden select-none ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}> 
      {/* Top Navigation Header */}
      <WorkspaceHeader
        currentObject={currentObject}
        onSelectObject={(obj) => {
          onSelectObject(obj);
          setSelectedComponentId(null);
          setIsolatedComponentId(null);
          setHiddenComponentIds(new Set());
        }}
        uploadedObject={uploadedObject}
        depthLevel={depthLevel}
        onDepthChange={onDepthChange}
        onOpenCompare={() => setIsCompareOpen(true)}
        onReturnHome={onReturnHome}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onUploadModel={onUploadModel}
      />

      {/* Main 3-Column Engineering Studio */}
      <div className={`workspace-main flex-1 flex overflow-hidden relative ${theme === 'light' ? 'bg-[#F4EFE8]' : 'bg-[#141210]'}`}>
        {/* LEFT PANEL: Assembly Hierarchy & Component Tree (Hidden on mobile, 260-320px on desktop) */}
        <div className={`workspace-sidebar hidden md:flex flex-col w-72 lg:w-80 shrink-0 h-full border-r ${
          theme === 'light' ? 'border-[#DDD6CB] bg-[#F4EFE8]' : 'border-[var(--line)] bg-[#181513]'
        }`}>
          <ComponentTree
            rootComponents={currentObject.rootComponents}
            selectedComponentId={selectedComponentId}
            onSelectComponent={handleSelectComponent}
            hoveredComponentId={hoveredComponentId}
            onHoverComponent={setHoveredComponentId}
            isolatedComponentId={isolatedComponentId}
            onToggleIsolate={handleToggleIsolate}
            hiddenComponentIds={hiddenComponentIds}
            onToggleHide={handleToggleHide}
            theme={theme}
          />
        </div>

        {/* CENTER PANEL: Interactive 3D WebGL Workbench */}
        <div
          className="workspace-viewport flex-1 h-full relative overflow-hidden flex flex-col select-none"
          style={{
            background: theme === 'light'
              ? 'radial-gradient(circle at 50% 48%, #ffffff 0%, #F5F1EB 60%, #ECE6DE 100%)'
              : 'radial-gradient(circle at 50% 42%, #38322c 0%, #292420 50%, #1c1917 100%)',
          }}
        >
          {currentObject.id === 'drone' ? (
            <DroneCanvas
              objectData={currentObject}
              selectedComponentId={selectedComponentId}
              onSelectComponent={handleSelectComponent}
              hoveredComponentId={hoveredComponentId}
              onHoverComponent={setHoveredComponentId}
              explodeAmount={explodeAmount}
              viewMode={viewMode}
              isPlayingMechanism={isPlayingMechanism}
              isolatedComponentId={isolatedComponentId}
              hiddenComponentIds={hiddenComponentIds}
              showLeaderLines={showLeaderLines}
              showCalipers={showCalipers}
              theme={theme}
            />
          ) : (
            <ThreeCanvas
              objectData={currentObject}
              selectedComponentId={selectedComponentId}
              onSelectComponent={handleSelectComponent}
              hoveredComponentId={hoveredComponentId}
              onHoverComponent={setHoveredComponentId}
              explodeAmount={explodeAmount}
              viewMode={viewMode}
              isPlayingMechanism={isPlayingMechanism}
              isolatedComponentId={isolatedComponentId}
              hiddenComponentIds={hiddenComponentIds}
              showLeaderLines={showLeaderLines}
              uploadedModel={
                Boolean(
                  uploadedModel &&
                  (currentObject.id.startsWith('uploaded-') ||
                    (currentObject as unknown as { isUploaded?: boolean }).isUploaded ||
                    (uploadedObject && currentObject.id === uploadedObject.id))
                )
                  ? uploadedModel
                  : null
              }
              showCalipers={showCalipers}
              theme={theme}
            />
          )}

          {/* Calipers Overlay Tool */}
          {showCalipers && (
            <CalipersTool
              selectedComponent={selectedNode}
              onClose={() => setShowCalipers(false)}
              theme={theme}
              objectId={currentObject.id}
              onSelectComponent={handleSelectComponent}
            />
          )}

          {/* Calibrated Physical ViewMode HUD (FEA Stress, FLIR Thermal, X-Ray, Wireframe) */}
          <ViewModeHUD
            viewMode={viewMode}
            selectedComponent={selectedNode}
            objectId={currentObject.id}
            theme={theme}
            hasCalipersOpen={showCalipers}
            onClose={() => setViewMode('solid')}
          />

          {/* Viewport Toolbar & Explode Slider */}
          <ViewportToolbar
            explodeAmount={explodeAmount}
            onExplodeChange={setExplodeAmount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isPlayingMechanism={isPlayingMechanism}
            onTogglePlayMechanism={() => setIsPlayingMechanism(!isPlayingMechanism)}
            showLeaderLines={showLeaderLines}
            onToggleLeaderLines={() => setShowLeaderLines(!showLeaderLines)}
            showCalipers={showCalipers}
            onToggleCalipers={() => setShowCalipers(!showCalipers)}
            onResetView={handleResetView}
            theme={theme}
          />

          {/* MOBILE FLOATING HUD (Top-Right): Clean, non-intrusive scene controls */}
          <div
            className="absolute top-2 right-2 z-30 md:hidden flex items-center gap-1.5 p-1 rounded-xl border backdrop-blur-xl shadow-lg pointer-events-auto transition-all"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(247,245,240,0.96)' : 'rgba(24,21,19,0.94)',
              borderColor: theme === 'light' ? '#DDD6CB' : 'var(--line)',
            }}
          >
            {/* View Mode Toggle Pill */}
            <button
              onClick={() => setIsMobileControlsOpen(true)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono-cad font-semibold transition-all touch-manipulation min-h-[36px] cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-[#161311] border-[#DDD6CB] active:bg-[#EAE4DC]'
                  : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)] active:bg-[#2a2420]'
              }`}
              title="View Modes & Shaders"
            >
              <Box className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
              <span className="uppercase text-[10px] tracking-wider">{viewMode}</span>
            </button>

            {/* Animate Continuous Mechanism Toggle */}
            <button
              onClick={() => setIsPlayingMechanism(!isPlayingMechanism)}
              className={`p-2 rounded-lg border transition-all touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                isPlayingMechanism
                  ? theme === 'light' ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74]' : 'bg-[#e27228]/15 text-[#e27228] border-[#e27228]/40'
                  : theme === 'light' ? 'bg-white text-[#5C554E] hover:text-[#161311] border-[#DDD6CB]' : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)]'
              }`}
              title={isPlayingMechanism ? 'Pause motion' : 'Play motion'}
            >
              {isPlayingMechanism ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            {/* Reset Camera View */}
            <button
              onClick={handleResetView}
              className={`p-2 rounded-lg border transition-all touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-[#5C554E] hover:text-[#161311] border-[#DDD6CB]'
                  : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)]'
              }`}
              title="Reset View & Camera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MOBILE BOTTOM COMMAND DOCK: Accessible when NO component is selected */}
          {!selectedNode && !isMobileTreeOpen && !isMobileInspectorOpen && !isMobileControlsOpen && (
            <div className="absolute inset-x-2 bottom-2 z-30 md:hidden flex flex-col gap-1.5 pointer-events-auto pb-[env(safe-area-inset-bottom)] animate-in fade-in duration-200">
              {/* Explode Slider Card */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl shadow-xl transition-all"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(247,245,240,0.98)' : 'rgba(24,21,19,0.96)',
                  borderColor: theme === 'light' ? '#DDD6CB' : 'var(--line)',
                }}
              >
                <button
                  onClick={() => setExplodeAmount(explodeAmount > 0.1 ? 0.0 : 1.0)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono-cad font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shrink-0 touch-manipulation min-h-[36px] cursor-pointer ${
                    explodeAmount > 0.1
                      ? theme === 'light' ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74]' : 'bg-[#e27228]/20 text-[#e27228] border border-[#e27228]/50'
                      : theme === 'light' ? 'bg-[#EAE4DC] text-[#161311] border border-[#DDD6CB]' : 'bg-[#211e1c] text-[#8c8278] border border-[var(--line)]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
                  <span>{explodeAmount > 0.1 ? 'ASSEMBLE' : 'EXPLODE'}</span>
                </button>

                <div className="flex-1 flex items-center gap-2.5 min-w-0">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(explodeAmount * 100)}
                    onChange={(e) => setExplodeAmount(Number(e.target.value) / 100)}
                    className={`w-full h-1.5 rounded appearance-none cursor-pointer ${
                      theme === 'light' ? 'bg-[#DDD6CB] accent-[#C2410C]' : 'bg-[#25201c] accent-[#e27228]'
                    }`}
                  />
                  <span className={`text-[11px] font-mono-cad font-bold w-9 text-right shrink-0 ${
                    theme === 'light' ? 'text-[#C2410C]' : 'text-[#e27228]'
                  }`}>
                    {Math.round(explodeAmount * 100)}%
                  </span>
                </div>
              </div>

              {/* Navigation Action Dock */}
              <div
                className="flex items-center justify-between gap-1.5 p-1 rounded-xl border backdrop-blur-xl shadow-xl"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(247,245,240,0.98)' : 'rgba(24,21,19,0.96)',
                  borderColor: theme === 'light' ? '#DDD6CB' : 'var(--line)',
                }}
              >
                <button
                  onClick={() => setIsMobileTreeOpen(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg border text-[11px] font-mono-cad font-bold transition-all touch-manipulation min-h-[44px] cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white hover:bg-[#F4EFE8] border-[#DDD6CB] text-[#161311] active:bg-[#EAE4DC]'
                      : 'bg-[#211e1c] hover:bg-[#2a2420] border-[var(--line)] text-[#EFEAE2] active:bg-[#2a2420]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
                  <span>PARTS ({currentObject.rootComponents?.length || 0})</span>
                </button>

                <button
                  onClick={() => setIsMobileControlsOpen(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg border text-[11px] font-mono-cad font-bold transition-all touch-manipulation min-h-[44px] cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white hover:bg-[#F4EFE8] border-[#DDD6CB] text-[#161311] active:bg-[#EAE4DC]'
                      : 'bg-[#211e1c] hover:bg-[#2a2420] border-[var(--line)] text-[#EFEAE2] active:bg-[#2a2420]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
                  <span>VIEW MODES</span>
                </button>

                <button
                  onClick={() => {
                    setActiveInspectorTab('overview');
                    setIsMobileInspectorOpen(true);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg border text-[11px] font-mono-cad font-bold transition-all touch-manipulation min-h-[44px] cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white hover:bg-[#F4EFE8] border-[#DDD6CB] text-[#161311] active:bg-[#EAE4DC]'
                      : 'bg-[#211e1c] hover:bg-[#2a2420] border-[var(--line)] text-[#EFEAE2] active:bg-[#2a2420]'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228]" />
                  <span>OVERVIEW</span>
                </button>
              </div>
            </div>
          )}

          {/* MOBILE SELECTED COMPONENT BOTTOM SHEET (Peek & Expanded States with 100% Discoverable Specs) */}
          {selectedNode && (
            <div
              className={`fixed inset-x-0 bottom-0 z-40 md:hidden flex flex-col rounded-t-2xl border-t shadow-2xl backdrop-blur-2xl pointer-events-auto transition-all duration-300 ease-out ${
                mobileSheetStage === 'expanded'
                  ? 'h-[84dvh] max-h-[85dvh]'
                  : 'h-auto'
              }`}
              style={{
                backgroundColor: theme === 'light' ? '#F7F5F0' : '#181513',
                borderColor: theme === 'light' ? '#DDD6CB' : 'var(--line)',
                boxShadow: theme === 'light' ? '0 -10px 40px rgba(0,0,0,0.08)' : '0 -10px 50px rgba(0,0,0,0.9)',
              }}
            >
              {/* Drag Handle & Quick Toggle Bar */}
              <div
                onClick={() => setMobileSheetStage(mobileSheetStage === 'peek' ? 'expanded' : 'peek')}
                className="w-full pt-2 pb-1 cursor-pointer touch-manipulation flex flex-col items-center select-none"
              >
                <div className="w-10 h-1 rounded-full bg-[#DDD6CB] dark:bg-white/25" />
              </div>

              {/* SHEET HEADER (Always Visible in both Peek & Expanded) */}
              <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-mono-cad ${
                theme === 'light' ? 'border-[#DDD6CB] bg-[#EAE4DC]' : 'border-[var(--line)] bg-[#181513]'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#C2410C] dark:bg-[#e27228] shrink-0 animate-pulse" />
                  <span className="font-bold text-[#C2410C] dark:text-[#e27228] shrink-0 text-xs tracking-wider">{selectedNode.cadId || 'PART'}</span>
                  <span className={`shrink-0 ${theme === 'light' ? 'text-[#786E66]' : 'text-slate-400'}`}>•</span>
                  <span className={`uppercase tracking-wider font-semibold truncate max-w-[130px] text-[10px] ${
                    theme === 'light' ? 'text-[#5C554E]' : 'text-[#8c8278]'
                  }`}>
                    {selectedNode.category}
                  </span>
                </div>

                {/* Tactile Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleIsolate(selectedNode.id)}
                    title={isolatedComponentId === selectedNode.id ? 'Restore all components' : 'Isolate component'}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all touch-manipulation min-h-[36px] flex items-center gap-1 border cursor-pointer ${
                      isolatedComponentId === selectedNode.id
                        ? 'bg-[#C2410C] text-white border-[#C2410C] dark:bg-[#e27228] dark:border-[#e27228]'
                        : theme === 'light'
                        ? 'bg-white text-[#161311] border-[#DDD6CB] active:bg-[#EAE4DC]'
                        : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)] active:bg-[#2a2420]'
                    }`}
                  >
                    <Focus className="w-3.5 h-3.5" />
                    <span>{isolatedComponentId === selectedNode.id ? 'ISOLATED' : 'ISOLATE'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleHide(selectedNode.id)}
                    title="Hide component"
                    className={`p-1.5 rounded-md border transition-all touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                      hiddenComponentIds.has(selectedNode.id)
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : theme === 'light'
                        ? 'bg-white text-[#5C554E] hover:text-[#161311] border-[#DDD6CB]'
                        : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)]'
                    }`}
                  >
                    {hiddenComponentIds.has(selectedNode.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleSelectComponent(null)}
                    className={`p-1.5 rounded-md border transition-all touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                      theme === 'light' ? 'bg-white border-[#DDD6CB] text-[#786E66] hover:text-[#161311]' : 'bg-[#211e1c] border-[var(--line)] text-[#8c8278] hover:text-[#EFEAE2]'
                    }`}
                    title="Deselect and return to model"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PEEK STAGE CONTENT */}
              {mobileSheetStage === 'peek' ? (
                <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-2.5">
                  <div>
                    <h3 className={`text-base font-bold font-heading truncate ${theme === 'light' ? 'text-[#161311]' : 'text-white'}`}>
                      {selectedNode.name}
                    </h3>
                    <p className={`text-xs leading-relaxed line-clamp-2 mt-1 font-mono-cad ${theme === 'light' ? 'text-[#5C554E]' : 'text-[#c5c7d0]'}`}>
                      {selectedNode.function || 'Mechanical CAD component in current assembly.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] font-mono-cad">
                    <span className={`truncate max-w-[170px] ${theme === 'light' ? 'text-[#786E66]' : 'text-slate-400'}`}>
                      MATERIAL: <span className={`font-bold ${theme === 'light' ? 'text-[#161311]' : 'text-slate-200'}`}>{selectedNode.material?.name || 'Engineered Alloy'}</span>
                    </span>

                    <button
                      onClick={() => setMobileSheetStage('expanded')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all touch-manipulation min-h-[44px] shadow-sm cursor-pointer ${
                        theme === 'light'
                          ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] active:bg-[#FFEDD5]'
                          : 'bg-[#e27228]/15 text-[#e27228] border border-[#e27228]/40 active:bg-[#e27228]/30'
                      }`}
                    >
                      <span>FULL SPECS & TABS</span>
                      <ChevronUp className="w-4 h-4 animate-bounce" />
                    </button>
                  </div>
                </div>
              ) : (
                /* EXPANDED STAGE CONTENT: 100% Discoverable Engineering Inspector */
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  {/* Sticky Tabs Header */}
                  <div className="shrink-0 border-b border-[#DDD6CB] dark:border-[var(--line)]">
                    <InspectorTabs
                      activeTab={activeInspectorTab}
                      onTabChange={setActiveInspectorTab}
                      hasSelectedComponent={Boolean(selectedComponentId)}
                      onOpenCompare={() => {
                        setIsCompareOpen(true);
                      }}
                      theme={theme}
                    />
                  </div>

                  {/* Scrollable Content (100% of information available) */}
                  <div className="flex-1 overflow-y-auto p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-3 -webkit-overflow-scrolling-touch no-scrollbar">
                    {renderInspectorContent()}
                  </div>

                  {/* Bottom Collapse Bar */}
                  <div className="p-2.5 border-t border-[#DDD6CB] dark:border-[var(--line)] bg-[#EAE4DC] dark:bg-[#181513] flex items-center justify-between pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                    <span className={`text-[10px] font-mono-cad ${theme === 'light' ? 'text-[#5C554E]' : 'text-slate-500'}`}>
                      {selectedNode.cadId} • {activeInspectorTab.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setMobileSheetStage('peek')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[11px] font-mono-cad font-bold uppercase transition-all touch-manipulation min-h-[36px] cursor-pointer ${
                        theme === 'light'
                          ? 'bg-white text-[#161311] border-[#DDD6CB]'
                          : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)]'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>COLLAPSE TO PEEK</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MOBILE VIEW MODES & TOOLS DRAWER */}
          {isMobileControlsOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
              <div
                className="w-full rounded-t-2xl border-t shadow-2xl p-4 space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200"
                style={{
                  backgroundColor: theme === 'light' ? '#F7F5F0' : '#181513',
                  borderColor: theme === 'light' ? '#DDD6CB' : 'var(--line)',
                  color: theme === 'light' ? '#161311' : '#EFEAE2',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#DDD6CB] dark:border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#C2410C] dark:text-[#e27228]" />
                    <span className="text-xs font-mono-cad font-bold tracking-wider uppercase">
                      VIEWPORT RENDERING & TOOLS
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileControlsOpen(false)}
                    className="p-1.5 rounded-lg border border-[#DDD6CB] dark:border-[var(--line)] text-[#786E66] dark:text-slate-400 hover:text-[#161311] dark:hover:text-white touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* View Modes Grid */}
                <div>
                  <span className="text-[10px] font-mono-cad uppercase tracking-wider text-[#786E66] dark:text-slate-400 block mb-2">
                    Rendering Shaders
                  </span>
                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                    {[
                      { id: 'solid', label: 'Solid CAD', icon: Box },
                      { id: 'xray', label: 'X-Ray View', icon: Eye },
                      { id: 'wireframe', label: 'Wireframe Mesh', icon: Maximize2 },
                      { id: 'stress', label: 'FEA Stress Map', icon: Activity },
                      { id: 'thermal', label: 'Thermal Profile', icon: Flame },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSel = viewMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setViewMode(mode.id as ViewMode3D);
                            setIsMobileControlsOpen(false);
                          }}
                          className={`p-3 rounded-xl border text-xs font-mono-cad font-bold flex flex-col items-center gap-1.5 transition-all touch-manipulation min-h-[54px] cursor-pointer ${
                            isSel
                              ? theme === 'light'
                                ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74] shadow-xs'
                                : 'bg-[#e27228]/20 text-[#e27228] border-[#e27228]/60 shadow-[0_0_12px_rgba(226,114,40,0.25)]'
                              : theme === 'light'
                              ? 'bg-white text-[#161311] border-[#DDD6CB] hover:bg-[#F4EFE8]'
                              : 'bg-[#211e1c] text-[#8c8278] hover:text-[#EFEAE2] border-[var(--line)] hover:bg-[#2a2420]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px]">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Auxiliary Toggles */}
                <div className="pt-2 border-t border-[#DDD6CB] dark:border-[var(--line)] grid grid-cols-2 gap-2 text-xs font-mono-cad">
                  <button
                    onClick={() => setShowLeaderLines(!showLeaderLines)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 touch-manipulation min-h-[44px] cursor-pointer ${
                      showLeaderLines
                        ? theme === 'light' ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74] font-bold' : 'bg-[#e27228]/15 text-[#e27228] border-[#e27228]/40 font-bold'
                        : theme === 'light' ? 'bg-white text-[#5C554E] border-[#DDD6CB]' : 'bg-[#211e1c] text-[#8c8278] border-[var(--line)]'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{showLeaderLines ? 'CALLOUTS ON' : 'CALLOUTS OFF'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowCalipers(!showCalipers);
                      setIsMobileControlsOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 touch-manipulation min-h-[44px] cursor-pointer ${
                      showCalipers
                        ? theme === 'light' ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74] font-bold' : 'bg-[#e27228]/15 text-[#e27228] border-[#e27228]/40 font-bold'
                        : theme === 'light' ? 'bg-white text-[#5C554E] border-[#DDD6CB]' : 'bg-[#211e1c] text-[#8c8278] border-[var(--line)]'
                    }`}
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>CALIPERS TOOL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE ASSEMBLY TREE DRAWER */}
          {isMobileTreeOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
              <div
                className="w-full max-h-[85dvh] flex flex-col rounded-t-2xl border-t shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
                style={{
                  backgroundColor: theme === 'light' ? '#F7F5F0' : '#181513',
                  borderColor: theme === 'light' ? '#DDD6CB' : 'var(--line)',
                  color: theme === 'light' ? '#161311' : '#EFEAE2',
                }}
              >
                {/* Drawer Header */}
                <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
                  theme === 'light' ? 'border-[#DDD6CB] bg-[#EAE4DC]' : 'border-[var(--line)] bg-[#1c1917]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C2410C] dark:text-[#e27228]" />
                    <span className="text-xs font-mono-cad font-bold tracking-wider uppercase">
                      ASSEMBLY HIERARCHY
                    </span>
                    <span className={`text-[10px] font-mono-cad px-1.5 py-0.5 rounded border ${
                      theme === 'light' ? 'bg-[#DDD6CB] border-[#C8C0B4] text-[#5C554E]' : 'bg-[#211e1c] border-[var(--line)] text-[#8c8278]'
                    }`}>
                      {currentObject.rootComponents?.length || 0} ROOTS
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileTreeOpen(false)}
                    className={`p-1.5 rounded-lg border transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                      theme === 'light' ? 'border-[#DDD6CB] text-[#786E66] hover:text-[#161311] bg-white' : 'border-[var(--line)] text-[#8c8278] hover:text-[#EFEAE2] bg-[#211e1c]'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Component Tree */}
                <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                  <ComponentTree
                    rootComponents={currentObject.rootComponents}
                    selectedComponentId={selectedComponentId}
                    onSelectComponent={(id) => {
                      handleSelectComponent(id);
                      if (id) setIsMobileTreeOpen(false);
                    }}
                    hoveredComponentId={hoveredComponentId}
                    onHoverComponent={setHoveredComponentId}
                    isolatedComponentId={isolatedComponentId}
                    onToggleIsolate={handleToggleIsolate}
                    hiddenComponentIds={hiddenComponentIds}
                    onToggleHide={handleToggleHide}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          )}

          {/* MOBILE MACHINE OVERVIEW & TEARDOWN DRAWER (When opened from bottom dock) */}
          {isMobileInspectorOpen && !selectedNode && (
            <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
              <div
                className="w-full max-h-[85dvh] flex flex-col rounded-t-2xl border-t shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
                style={{
                  backgroundColor: theme === 'light' ? '#F7F5F0' : '#181513',
                  borderColor: theme === 'light' ? '#DDD6CB' : 'var(--line)',
                  color: theme === 'light' ? '#161311' : '#EFEAE2',
                }}
              >
                {/* Drawer Header */}
                <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
                  theme === 'light' ? 'border-[#DDD6CB] bg-[#EAE4DC]' : 'border-[var(--line)] bg-[#1c1917]'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C2410C] dark:bg-[#e27228]" />
                    <span className="text-xs font-mono-cad font-bold tracking-wider uppercase">
                      {currentObject.name.toUpperCase()} • TEARDOWN
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileInspectorOpen(false)}
                    className={`p-1.5 rounded-lg border transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                      theme === 'light' ? 'border-[#DDD6CB] text-[#786E66] hover:text-[#161311] bg-white' : 'border-[var(--line)] text-[#8c8278] hover:text-[#EFEAE2] bg-[#211e1c]'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs */}
                <InspectorTabs
                  activeTab={activeInspectorTab}
                  onTabChange={setActiveInspectorTab}
                  hasSelectedComponent={false}
                  onOpenCompare={() => {
                    setIsMobileInspectorOpen(false);
                    setIsCompareOpen(true);
                  }}
                  theme={theme}
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 -webkit-overflow-scrolling-touch no-scrollbar">
                  {renderInspectorContent()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Engineering Inspector & Analysis Studio (drag to resize) */}
        <div
          className={`workspace-inspector hidden md:flex shrink-0 h-full relative flex-col border-l z-20 min-w-0 ${
            theme === 'light' ? 'bg-[#F4EFE8] border-[#DDD6CB] shadow-sm' : 'bg-[#181513] border-[var(--line)]'
          }`}
          style={{ width: inspectorWidth }}
        >
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize engineering inspector"
            title="Drag to resize inspector"
            onPointerDown={startInspectorResize}
            className="absolute -left-1 top-0 bottom-0 w-2 cursor-col-resize z-40 hover:bg-[rgba(226,114,40,0.5)] transition-colors"
          />
          <InspectorTabs
            activeTab={activeInspectorTab}
            onTabChange={setActiveInspectorTab}
            hasSelectedComponent={Boolean(selectedComponentId)}
            onOpenCompare={() => setIsCompareOpen(true)}
            theme={theme}
          />

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {renderInspectorContent()}
          </div>
        </div>
      </div>

      {/* CAD Telemetry Status Bar */}
      <StatusBar
        selectedComponent={selectedNode}
        objectName={currentObject.name}
        theme={theme}
      />

      {/* Side-by-Side Object Comparison Modal */}
      {isCompareOpen && (
        <ObjectComparison
          currentObject={currentObject}
          onClose={() => setIsCompareOpen(false)}
          onSelectObject={(newObj) => {
            onSelectObject(newObj);
            setSelectedComponentId(null);
          }}
        />
      )}
    </div>
  );
};

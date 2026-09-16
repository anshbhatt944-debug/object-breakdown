import React, { useEffect, useRef, useState } from 'react';
import { ObjectBreakdownData, DepthLevel, ViewMode3D, ComponentNode } from '../../types/objectData';
import { WorkspaceHeader } from './WorkspaceHeader';
import { ComponentTree } from './ComponentTree';
import { ThreeCanvas } from './viewer3d/ThreeCanvas';
import { DroneCanvas } from './viewer3d/DroneCanvas';
import { ViewportToolbar } from './viewer3d/ViewportToolbar';
import { CalipersTool } from './viewer3d/CalipersTool';
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

  // When a component is selected, auto-switch inspector to component tab
  const handleSelectComponent = (id: string | null) => {
    setSelectedComponentId(id);
    if (id) {
      setActiveInspectorTab('component');
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
    setIsPlayingMechanism(false);
  };

  return (
    <div className={`workspace-app flex flex-col h-screen w-screen overflow-hidden select-none ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}> 
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
      <div className={`workspace-main flex-1 flex overflow-hidden relative ${theme === 'light' ? 'bg-[#f1f4f8]' : 'bg-[#0c0e13]'}`}>
        {/* LEFT PANEL: Assembly Hierarchy & Component Tree (Hidden on mobile, 260-320px on desktop) */}
        <div className={`workspace-sidebar hidden md:flex flex-col w-72 lg:w-80 shrink-0 h-full border-r ${
          theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#262832] bg-[#111318]'
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
              ? 'radial-gradient(circle at 50% 48%, #ffffff 0%, #edf1f7 60%, #e2e7ef 100%)'
              : 'radial-gradient(circle at 50% 42%, #787e8c 0%, #5e6473 48%, #444955 100%)',
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
              theme={theme}
            />
          )}

          {/* Calipers Overlay Tool */}
          {showCalipers && (
            <CalipersTool
              selectedComponent={selectedNode}
              onClose={() => setShowCalipers(false)}
            />
          )}

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
        </div>

        {/* RIGHT PANEL: Engineering Inspector & Analysis Studio (drag to resize) */}
        <div
          className={`workspace-inspector hidden md:flex shrink-0 h-full relative flex-col border-l z-20 min-w-0 ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111318] border-[#262832]'
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

          <div className="flex-1 overflow-y-auto">
            {activeInspectorTab === 'component' && (
              <ComponentDetails
                component={selectedNode}
                depthLevel={depthLevel}
                onSelectComponentById={handleSelectComponent}
                objectData={currentObject}
                theme={theme}
              />
            )}
            {activeInspectorTab === 'overview' && (
              <ObjectOverview
                objectData={currentObject}
                depthLevel={depthLevel}
              />
            )}
            {activeInspectorTab === 'materials' && (
              <MaterialAnalysis
                materials={currentObject.materials}
                depthLevel={depthLevel}
              />
            )}
            {activeInspectorTab === 'kinematics' && (
              <HowItWorks
                steps={currentObject.howItWorks}
                depthLevel={depthLevel}
                onSelectComponentById={handleSelectComponent}
              />
            )}
            {activeInspectorTab === 'equations' && (
              <EngineeringAnalysis
                equations={currentObject.engineeringEquations}
                depthLevel={depthLevel}
              />
            )}
            {activeInspectorTab === 'manufacturing' && (
              <ManufacturingProcess
                timeline={currentObject.manufacturingTimeline}
                depthLevel={depthLevel}
              />
            )}
            {activeInspectorTab === 'relationships' && (
              <RelationshipMap
                relationships={currentObject.relationships}
                rootComponents={currentObject.rootComponents}
                onSelectComponentById={handleSelectComponent}
              />
            )}
            {activeInspectorTab === 'failures' && (
              <FailureAnalysis
                rootComponents={currentObject.rootComponents}
                depthLevel={depthLevel}
              />
            )}
            {activeInspectorTab === 'whatif' && (
              <WhatIfSimulator
                parameters={currentObject.whatIfParameters}
                depthLevel={depthLevel}
              />
            )}
            {activeInspectorTab === 'ai' && (
              <AskEngineer
                objectData={currentObject}
                selectedComponent={selectedNode}
              />
            )}
            {activeInspectorTab === 'insights' && (
              <DesignInsights
                objectData={currentObject}
                depthLevel={depthLevel}
              />
            )}
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

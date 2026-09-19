import React, { useEffect, useRef } from 'react';

interface ComponentHoverDetail {
  name: string;
  category: string;
  action?: string;
}

interface CustomCursorProps {
  theme?: 'light' | 'dark';
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const badgeCatRef = useRef<HTMLDivElement>(null);
  const badgeNameRef = useRef<HTMLDivElement>(null);
  const badgeActionRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  const mousePosRef = useRef({ x: -200, y: -200 });
  const isUploadHoveredRef = useRef(false);
  const isFileDraggingRef = useRef(false);
  const modelHoverDetailRef = useRef<ComponentHoverDetail | null>(null);

  useEffect(() => {
    // Accessible: On coarse touch devices, preserve native browser touch
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (containerRef.current) containerRef.current.style.display = 'none';
      return;
    }

    let animId: number;
    let fileDragDepth = 0;

    // High refresh rate (144Hz / 240Hz / 360Hz) direct GPU-accelerated update
    const updateCursorPosition = (clientX: number, clientY: number) => {
      mousePosRef.current.x = clientX;
      mousePosRef.current.y = clientY;

      // 0-latency direct hardware transform (hotspot at arrow tip: x - 2px, y - 2px)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX - 2}px, ${clientY - 2}px, 0)`;
        if (cursorRef.current.style.opacity !== '1') {
          cursorRef.current.style.opacity = '1';
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateCursorPosition(e.clientX, e.clientY);

      // Expose normalized window mouse position for atmospheric lighting canvas (0ms latency, 0 React state)
      const w = window.innerWidth || 1920;
      const h = window.innerHeight || 1080;
      (window as unknown as { __mouseCoord?: { x: number; y: number; nx: number; ny: number } }).__mouseCoord = {
        x: e.clientX,
        y: e.clientY,
        nx: Math.min(Math.max(e.clientX / w, 0), 1),
        ny: Math.min(Math.max(e.clientY / h, 0), 1),
      };

      // Detect hover target types
      const target = e.target as HTMLElement | null;
      if (target) {
        const dropzone = target.closest<HTMLElement>('.upload-dropzone, [data-upload-zone]');
        if (dropzone) {
          const style = window.getComputedStyle(dropzone);
          const rect = dropzone.getBoundingClientRect();
          const isVisible =
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            parseFloat(style.opacity || '1') > 0.1 &&
            style.pointerEvents !== 'none';
          isUploadHoveredRef.current = isVisible;
        } else {
          isUploadHoveredRef.current = false;
        }
      }
    };

    const handlePointerDown = () => {
      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = 'scale(0.9)';
      }
    };

    const handlePointerUp = () => {
      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = 'scale(1)';
      }
    };

    const handleMouseLeave = () => {
      if (containerRef.current) containerRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (containerRef.current) containerRef.current.style.opacity = '1';
    };

    // Global drag-and-drop file detection
    const handleDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        fileDragDepth++;
        isFileDraggingRef.current = true;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
        isFileDraggingRef.current = true;
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      fileDragDepth--;
      if (fileDragDepth <= 0) {
        fileDragDepth = 0;
        isFileDraggingRef.current = false;
      }
    };

    const handleDrop = () => {
      fileDragDepth = 0;
      isFileDraggingRef.current = false;
    };

    // Animation frame loop: handles badge following and inspection state machine
    const renderLoop = () => {
      const targetX = mousePosRef.current.x;
      const targetY = mousePosRef.current.y;

      // Update badge position (smoothly attached near cursor tip)
      if (badgeRef.current && targetX > 0) {
        badgeRef.current.style.transform = `translate3d(${targetX + 20}px, ${targetY + 8}px, 0)`;
      }

      const isDragging = isFileDraggingRef.current;
      const isUploadHover = !isDragging && isUploadHoveredRef.current;
      const modelDetail = !isDragging && !isUploadHover ? modelHoverDetailRef.current : null;

      // Update badge according to strict 5-state machine
      if (badgeRef.current && badgeCatRef.current && badgeNameRef.current && badgeActionRef.current) {
        if (isDragging || isUploadHover) {
          // STATE 4 / 5: Designated Upload Zone Hover or Global File Drag
          badgeCatRef.current.textContent = 'CAD RECEPTOR';
          badgeNameRef.current.textContent = 'DROP .GLB / .GLTF';
          badgeActionRef.current.style.display = 'none';
          badgeRef.current.style.opacity = '1';
        } else if (modelDetail) {
          // STATE 2 / 3: Model Hover or Component Hover (NEVER mentions upload or .glb)
          badgeCatRef.current.textContent = modelDetail.category;
          badgeNameRef.current.textContent = modelDetail.name;
          if (modelDetail.action) {
            badgeActionRef.current.textContent = modelDetail.action;
            badgeActionRef.current.style.display = 'inline-block';
          } else {
            badgeActionRef.current.style.display = 'none';
          }
          badgeRef.current.style.opacity = '1';
        } else {
          // STATE 1: Normal Cursor (Badge hidden, zero stale text)
          badgeRef.current.style.opacity = '0';
          badgeActionRef.current.style.display = 'none';
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    // 3. Component hover event listener from 3D canvases (Direct DOM, 0 React re-renders)
    const handleComponentHover = (e: Event) => {
      const customEvent = e as CustomEvent<ComponentHoverDetail | null>;
      modelHoverDetailRef.current = customEvent.detail || null;
    };

    // Use pointerrawupdate for lowest-latency hardware mouse polling on high-refresh monitors (Chromium)
    const hasRawUpdate = 'onpointerrawupdate' in window;
    if (hasRawUpdate) {
      window.addEventListener('pointerrawupdate', handlePointerMove as EventListener, { passive: true });
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('component-hover', handleComponentHover as EventListener);
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    animId = requestAnimationFrame(renderLoop);

    return () => {
      if (hasRawUpdate) {
        window.removeEventListener('pointerrawupdate', handlePointerMove as EventListener);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('component-hover', handleComponentHover as EventListener);
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      cancelAnimationFrame(animId);
    };
  }, [isLight]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden transition-opacity duration-150"
    >
      {/* Precision Arrow Cursor (0-latency hardware transform, buttery smooth on high refresh rate) */}
      <div
        ref={cursorRef}
        style={{
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0)',
        }}
        className="fixed top-0 left-0 pointer-events-none z-[999999] opacity-0 select-none"
      >
        <div
          ref={cursorInnerRef}
          className="transition-transform duration-75 ease-out origin-top-left"
          style={{ willChange: 'transform' }}
        >
          <svg
            width="25"
            height="32"
            viewBox="0 0 26 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.35)]"
          >
            <path
              d="M 2.5 2.5 L 2.5 30.5 L 11.8 23.2 L 22.8 21.8 Z"
              fill="#1d89e4"
              stroke="#1e1e20"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Floating 3D Component Inspection Badge (Direct DOM updates) */}
      <div
        ref={badgeRef}
        id="custom-cursor-badge"
        style={{ willChange: 'transform' }}
        className={`fixed top-0 left-0 px-3 py-1.5 rounded-lg backdrop-blur-md pointer-events-none opacity-0 transition-opacity duration-150 ${
          isLight
            ? 'bg-white/95 border border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.12)]'
            : 'bg-[#080f1d]/95 border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.85)]'
        }`}
      >
        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <div
              ref={badgeCatRef}
              id="custom-cursor-badge-cat"
              className={`text-[9px] font-mono tracking-widest uppercase font-semibold ${
                isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'
              }`}
            />
            <div
              ref={badgeActionRef}
              id="custom-cursor-badge-action"
              style={{ display: 'none' }}
              className={`text-[8px] font-mono tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${
                isLight ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-blue-500/20 text-[#38bdf8] border border-blue-500/30'
              }`}
            />
          </div>
          <div
            ref={badgeNameRef}
            id="custom-cursor-badge-name"
            className={`text-xs font-mono font-bold tracking-wide ${
              isLight ? 'text-[#0f172a]' : 'text-white'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

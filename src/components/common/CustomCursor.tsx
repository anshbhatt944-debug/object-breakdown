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
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const badgeCatRef = useRef<HTMLDivElement>(null);
  const badgeNameRef = useRef<HTMLDivElement>(null);
  const badgeActionRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  const mousePosRef = useRef({ x: -200, y: -200 });
  const ringPosRef = useRef({ x: -200, y: -200 });
  const isClickableRef = useRef(false);
  const isCanvasRef = useRef(false);
  const isUploadHoveredRef = useRef(false);
  const isFileDraggingRef = useRef(false);
  const isComponentHoveredRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const modelHoverDetailRef = useRef<ComponentHoverDetail | null>(null);

  useEffect(() => {
    // Accessible: On coarse touch devices, preserve native browser touch
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (containerRef.current) containerRef.current.style.display = 'none';
      return;
    }

    let animId: number;
    let fileDragDepth = 0;

    const handlePointerMove = (e: PointerEvent) => {
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;

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

        isClickableRef.current =
          !isUploadHoveredRef.current &&
          !!target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, .three-label');
        isCanvasRef.current = target.tagName === 'CANVAS' || !!target.closest('canvas');
      }
    };

    const handlePointerDown = () => {
      isMouseDownRef.current = true;
    };

    const handlePointerUp = () => {
      isMouseDownRef.current = false;
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

    // 144Hz render loop: exactly 1 GPU transform per vsync frame, zero input lag
    const updateRing = () => {
      const targetX = mousePosRef.current.x;
      const targetY = mousePosRef.current.y;

      // 1. Primary dot: direct 1:1 hardware-accelerated transform, zero lerp, 0 ms delay
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX - 4}px, ${targetY - 4}px, 0)`;
        dotRef.current.style.opacity = targetX > 0 ? '1' : '0';
      }

      // Update badge position
      if (badgeRef.current) {
        badgeRef.current.style.transform = `translate3d(${targetX + 16}px, ${targetY - 12}px, 0)`;
      }

      // 2. Secondary CAD follower ring (subtle smoothing, tight low-damping lerp)
      ringPosRef.current.x += (targetX - ringPosRef.current.x) * 0.38;
      ringPosRef.current.y += (targetY - ringPosRef.current.y) * 0.38;

      const isDragging = isFileDraggingRef.current;
      const isUploadHover = !isDragging && isUploadHoveredRef.current;
      const modelDetail = !isDragging && !isUploadHover ? modelHoverDetailRef.current : null;

      if (ringRef.current) {
        let scale = 1.0;
        let borderColor = isLight ? 'rgba(37, 99, 235, 0.55)' : 'rgba(59, 130, 246, 0.45)';
        let bgColor = 'transparent';

        if (isMouseDownRef.current) {
          scale = 0.82;
          borderColor = isLight ? '#2563eb' : '#38bdf8';
        } else if (isDragging || isUploadHover) {
          scale = 1.65;
          borderColor = isLight ? '#2563eb' : '#00f2ad';
          bgColor = isLight ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 242, 173, 0.14)';
        } else if (modelDetail) {
          scale = 1.35;
          borderColor = isLight ? '#2563eb' : '#38bdf8';
          bgColor = isLight ? 'rgba(37, 99, 235, 0.12)' : 'rgba(56, 189, 248, 0.10)';
        } else if (isClickableRef.current) {
          scale = 1.45;
          borderColor = isLight ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.80)';
          bgColor = isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.06)';
        } else if (isCanvasRef.current) {
          scale = 1.15;
          borderColor = isLight ? 'rgba(37, 99, 235, 0.70)' : 'rgba(59, 130, 246, 0.65)';
        }

        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x - 18}px, ${ringPosRef.current.y - 18}px, 0) scale(${scale})`;
        ringRef.current.style.borderColor = borderColor;
        ringRef.current.style.backgroundColor = bgColor;
      }

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

      animId = requestAnimationFrame(updateRing);
    };

    // 3. Component hover event listener from 3D canvases (Direct DOM, 0 React re-renders)
    const handleComponentHover = (e: Event) => {
      const customEvent = e as CustomEvent<ComponentHoverDetail | null>;
      modelHoverDetailRef.current = customEvent.detail || null;
      isComponentHoveredRef.current = Boolean(customEvent.detail);
    };

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

    animId = requestAnimationFrame(updateRing);

    return () => {
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
      {/* Precision Primary Dot (0-latency direct transform, physically attached to mouse) */}
      <div
        ref={dotRef}
        style={{ willChange: 'transform' }}
        className={`custom-cursor-dot fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none opacity-0 ${
          isLight
            ? 'bg-[#2563eb] shadow-[0_0_8px_rgba(37,99,235,0.6)]'
            : 'bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]'
        }`}
      />

      {/* Secondary CAD Reticle Follower Ring (smooth tight lerp) */}
      <div
        ref={ringRef}
        style={{ willChange: 'transform' }}
        className={`custom-cursor-ring fixed top-0 left-0 w-9 h-9 rounded-full border pointer-events-none transition-[border-color,background-color] duration-150 ${
          isLight ? 'border-[#2563eb]/45' : 'border-[#3b82f6]/45'
        }`}
      >
        <div className={`absolute -top-1 left-1/2 w-0.5 h-1 -translate-x-1/2 ${isLight ? 'bg-[#2563eb]/70' : 'bg-[#3b82f6]/70'}`} />
        <div className={`absolute -bottom-1 left-1/2 w-0.5 h-1 -translate-x-1/2 ${isLight ? 'bg-[#2563eb]/70' : 'bg-[#3b82f6]/70'}`} />
        <div className={`absolute top-1/2 -left-1 w-1 h-0.5 -translate-y-1/2 ${isLight ? 'bg-[#2563eb]/70' : 'bg-[#3b82f6]/70'}`} />
        <div className={`absolute top-1/2 -right-1 w-1 h-0.5 -translate-y-1/2 ${isLight ? 'bg-[#2563eb]/70' : 'bg-[#3b82f6]/70'}`} />
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

import React, { useEffect, useRef } from 'react';

interface ComponentHoverDetail {
  name: string;
  category?: string;
  index?: number;
}

interface CustomCursorProps {
  theme?: 'light' | 'dark' | 'night' | 'day';
}

export const CustomCursor: React.FC<CustomCursorProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const badgeNumRef = useRef<HTMLDivElement>(null);
  const badgeNameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preserve native browser touch on mobile/coarse devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (containerRef.current) containerRef.current.style.display = 'none';
      return;
    }

    let isInside = false;

    const handlePointerMove = (e: PointerEvent) => {
      isInside = true;
      const x = e.clientX;
      const y = e.clientY;

      const target = (e.target as Element | null) || document.elementFromPoint(x, y);
      const isInteractive = Boolean(
        target && (
          target.closest('button, a, input, select, textarea, [role="button"], .btn-plate, .cursor-pointer, [data-interactive]') ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'A'
        )
      );

      // Adaptive CAD reticle: 20px hollow frame over interactive elements (never covers text), 10px solid square otherwise
      if (cursorRef.current) {
        if (isInteractive) {
          cursorRef.current.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
          cursorRef.current.classList.add('is-interactive');
        } else {
          cursorRef.current.style.transform = `translate3d(${x - 5}px, ${y - 5}px, 0)`;
          cursorRef.current.classList.remove('is-interactive');
        }
        cursorRef.current.style.opacity = '1';
      }

      // Position callout badge offset from cursor
      if (badgeRef.current) {
        badgeRef.current.style.transform = `translate3d(${x + 16}px, ${y - 12}px, 0)`;
      }

      // Expose normalized window mouse position
      (window as unknown as { __mouseCoord?: { x: number; y: number; nx: number; ny: number } }).__mouseCoord = {
        x,
        y,
        nx: (x / window.innerWidth) * 2 - 1,
        ny: -(y / window.innerHeight) * 2 + 1,
      };
    };

    const handleMouseLeave = () => {
      isInside = false;
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
      if (badgeRef.current) badgeRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isInside = true;
      if (cursorRef.current) cursorRef.current.style.opacity = '1';
    };

    let partIndexCounter = 1;
    const partMap = new Map<string, number>();

    const handleComponentHover = (e: Event) => {
      const customEvent = e as CustomEvent<ComponentHoverDetail | null>;
      const detail = customEvent.detail;

      if (!badgeRef.current || !badgeNameRef.current) return;

      if (detail && detail.name) {
        if (!partMap.has(detail.name)) {
          partMap.set(detail.name, (detail.index != null) ? detail.index : partIndexCounter++);
        }
        const num = partMap.get(detail.name) || 1;

        if (badgeNumRef.current) {
          badgeNumRef.current.textContent = String(num);
        }
        badgeNameRef.current.textContent = detail.name;

        if (isInside) {
          badgeRef.current.style.opacity = '1';
        }
      } else {
        badgeRef.current.style.opacity = '0';
      }
    };

    const hasRaw = 'onpointerrawupdate' in window;
    if (hasRaw) {
      window.addEventListener('pointerrawupdate', handlePointerMove as EventListener, { passive: true });
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('component-hover', handleComponentHover as EventListener);

    return () => {
      if (hasRaw) {
        window.removeEventListener('pointerrawupdate', handlePointerMove as EventListener);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('component-hover', handleComponentHover as EventListener);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden"
    >
      {/* Precision CAD cursor: 10px solid square over canvas, transforms to 20px hollow reticle over interactive elements */}
      <div
        ref={cursorRef}
        className="plate-cursor-square opacity-0"
      />

      {/* Inspect Callout (22px circle with 1px --text stroke + Newsreader italic name, no card, no shadow, no blur) */}
      <div
        ref={badgeRef}
        className="fixed top-0 left-0 pointer-events-none opacity-0 flex items-center gap-2 z-[999998]"
        style={{
          willChange: 'transform',
          transform: 'translate3d(-200px, -200px, 0)',
          transition: 'opacity 120ms linear',
        }}
      >
        {/* 22px balloon circle */}
        <div
          ref={badgeNumRef}
          className="callout-balloon"
        >
          1
        </div>

        {/* Part name in Newsreader italic with solid ground background */}
        <div
          ref={badgeNameRef}
          className="callout-name"
        />
      </div>
    </div>
  );
};

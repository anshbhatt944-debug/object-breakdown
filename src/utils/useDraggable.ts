import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseDraggableOptions {
  initialPosition?: { x: number; y: number } | null;
  boundsPadding?: number;
  storageKey?: string;
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    if (options.storageKey) {
      try {
        const saved = sessionStorage.getItem(`draggable_${options.storageKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
            return parsed;
          }
        }
      } catch {
        // ignore storage errors
      }
    }
    return options.initialPosition ?? null;
  });

  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const dragStartRef = useRef<{
    pointerStartX: number;
    pointerStartY: number;
    elementStartX: number;
    elementStartY: number;
    parentWidth: number;
    parentHeight: number;
    elementWidth: number;
    elementHeight: number;
  }>({
    pointerStartX: 0,
    pointerStartY: 0,
    elementStartX: 0,
    elementStartY: 0,
    parentWidth: 0,
    parentHeight: 0,
    elementWidth: 0,
    elementHeight: 0,
  });

  // Save to session storage when moved
  useEffect(() => {
    if (options.storageKey && position) {
      try {
        sessionStorage.setItem(`draggable_${options.storageKey}`, JSON.stringify(position));
      } catch {
        // ignore
      }
    }
  }, [position, options.storageKey]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only primary mouse button (0) or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Skip if clicking an interactive control
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, textarea, [role="button"]')) {
      return;
    }

    const el = elementRef.current;
    if (!el) return;

    const parent = (el.offsetParent as HTMLElement) || document.body;
    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const currentX = elRect.left - parentRect.left;
    const currentY = elRect.top - parentRect.top;

    dragStartRef.current = {
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
      elementStartX: currentX,
      elementStartY: currentY,
      parentWidth: parentRect.width,
      parentHeight: parentRect.height,
      elementWidth: elRect.width,
      elementHeight: elRect.height,
    };

    setIsDragging(true);

    const padding = options.boundsPadding ?? 8;

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const dx = moveEvent.clientX - dragStartRef.current.pointerStartX;
      const dy = moveEvent.clientY - dragStartRef.current.pointerStartY;

      const minX = padding;
      const maxX = Math.max(minX, dragStartRef.current.parentWidth - dragStartRef.current.elementWidth - padding);
      const minY = padding;
      const maxY = Math.max(minY, dragStartRef.current.parentHeight - dragStartRef.current.elementHeight - padding);

      const targetX = dragStartRef.current.elementStartX + dx;
      const targetY = dragStartRef.current.elementStartY + dy;

      const clampedX = Math.min(Math.max(targetX, minX), maxX);
      const clampedY = Math.min(Math.max(targetY, minY), maxY);

      setPosition({ x: clampedX, y: clampedY });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }, [options.boundsPadding]);

  const resetPosition = useCallback(() => {
    setPosition(null);
    if (options.storageKey) {
      try {
        sessionStorage.removeItem(`draggable_${options.storageKey}`);
      } catch {
        // ignore
      }
    }
  }, [options.storageKey]);

  return {
    ref: elementRef,
    position,
    isDragging,
    handlePointerDown,
    resetPosition,
  };
}

import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onOpenSearch: () => void;
  onLaunchWorkspace: () => void;
  depthLevel?: 'quick' | 'detailed' | 'engineering' | 'expert';
  theme: 'light' | 'dark' | 'night' | 'day';
  onToggleTheme: () => void;
  onNavigateToProgress?: (p: number) => void;
}

interface PlateItem {
  index: number;
  name: string;
  fraction: number;
  rangeStart: number;
  rangeEnd: number;
}

const PLATES: PlateItem[] = [
  { index: 1, name: 'Watch', fraction: 0.16, rangeStart: 0.035, rangeEnd: 0.395 },
  { index: 2, name: 'Drone', fraction: 0.45, rangeStart: 0.395, rangeEnd: 0.645 },
  { index: 3, name: 'Turbo', fraction: 0.69, rangeStart: 0.645, rangeEnd: 0.755 },
  { index: 4, name: 'Motor', fraction: 0.76, rangeStart: 0.755, rangeEnd: 0.805 },
  { index: 5, name: 'Pen',   fraction: 0.83, rangeStart: 0.805, rangeEnd: 0.885 },
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onLaunchWorkspace,
  theme,
  onToggleTheme,
  onNavigateToProgress,
}) => {
  const [activePlate, setActivePlate] = useState<number>(0);
  const [plateProgress, setPlateProgress] = useState<number>(0);

  useEffect(() => {
    const handlePlateScroll = (e: Event) => {
      const detail = (e as CustomEvent<{ p: number }>).detail;
      if (!detail || typeof detail.p !== 'number') return;
      const p = detail.p;

      let matchedIndex = 0;
      let progressInPlate = 0;

      for (const pl of PLATES) {
        if (p >= pl.rangeStart && p < pl.rangeEnd) {
          matchedIndex = pl.index;
          progressInPlate = (p - pl.rangeStart) / (pl.rangeEnd - pl.rangeStart);
          break;
        }
      }

      setActivePlate(matchedIndex);
      setPlateProgress(Math.max(0, Math.min(1, progressInPlate)));
    };

    window.addEventListener('plate-scroll', handlePlateScroll as EventListener);
    return () => window.removeEventListener('plate-scroll', handlePlateScroll as EventListener);
  }, []);

  const handleScrollToFraction = (fraction: number) => {
    if (onNavigateToProgress) {
      onNavigateToProgress(fraction);
    } else {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = maxScroll * fraction;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, opts?: { duration?: number }) => void } }).__lenis;
      if (lenis) {
        lenis.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  };

  const handleThemeToggleWithTransition = () => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        onToggleTheme();
      });
    } else {
      onToggleTheme();
    }
  };

  const isNight = theme === 'dark' || theme === 'night';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none pt-[env(safe-area-inset-top)]"
      style={{
        paddingLeft: 'clamp(1.25rem, 4vw, 3.5rem)',
        paddingRight: 'clamp(1.25rem, 4vw, 3.5rem)',
        paddingTop: '1.25rem',
      }}
    >
      <div className="flex items-baseline justify-between max-w-[1700px] mx-auto w-full">
        {/* Brand */}
        <div className="pointer-events-auto">
          <button
            onClick={() => handleScrollToFraction(0)}
            className="text-[0.8125rem] font-medium tracking-[0.01em] text-left focus:outline-none cursor-pointer"
            style={{ fontFamily: 'var(--sans)', color: 'var(--text)' }}
          >
            Object Breakdown
          </button>
        </div>

        {/* Plate Navigation */}
        <nav className="hidden md:flex items-center gap-7 pointer-events-auto">
          {PLATES.map((plate) => {
            const isActive = activePlate === plate.index;
            return (
              <button
                key={plate.index}
                onClick={() => handleScrollToFraction(plate.fraction)}
                className="relative py-1 text-[0.8125rem] tracking-[0.01em] transition-colors cursor-pointer"
                style={{
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  fontFamily: 'var(--sans)',
                }}
              >
                <span style={{ fontVariantNumeric: 'tabular-nums' }} className="mr-1.5 font-medium">
                  {plate.index}
                </span>
                <span>{plate.name}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 h-[2px] pointer-events-none"
                    style={{
                      backgroundColor: 'var(--text)',
                      width: `${plateProgress * 100}%`,
                      transition: 'width 60ms linear',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6 pointer-events-auto text-[0.8125rem] tracking-[0.01em]" style={{ fontFamily: 'var(--sans)' }}>
          <button
            onClick={() => handleScrollToFraction(0.96)}
            className="transition-colors cursor-pointer hover:opacity-100"
            style={{ color: 'var(--muted)' }}
          >
            Upload
          </button>

          <button
            onClick={handleThemeToggleWithTransition}
            className="transition-colors cursor-pointer hover:opacity-100"
            style={{ color: 'var(--muted)' }}
            title={isNight ? 'Switch to Day theme' : 'Switch to Night theme'}
            aria-label="Toggle theme"
          >
            {isNight ? 'Day' : 'Night'}
          </button>

          <button
            onClick={onLaunchWorkspace}
            className="transition-colors cursor-pointer hover:opacity-100"
            style={{ color: 'var(--text)' }}
          >
            Studio
          </button>
        </div>
      </div>

      {/* Hints under the nav on the right */}
      <div className="hidden md:flex justify-end max-w-[1700px] mx-auto w-full pt-1.5">
        <p
          className="text-[1rem] leading-[1.4] pointer-events-none select-none"
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            color: 'var(--muted)',
          }}
        >
          Scroll to take it apart. Hover a part to name it.
        </p>
      </div>
    </header>
  );
};

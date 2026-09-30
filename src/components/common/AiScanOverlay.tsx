import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Sparkles, ShieldCheck, Activity } from 'lucide-react';

interface AiScanOverlayProps {
  status: string;
  theme?: 'light' | 'dark';
}

export const AiScanOverlay: React.FC<AiScanOverlayProps> = ({ status }) => {
  const [logs, setLogs] = useState<string[]>([
    'Initializing CAD spatial buffer...',
    'Streaming geometry data to holographic pipeline...',
  ]);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLogs((prev) => [...prev, 'Computing spatial bounding envelope...']);
      setProgress(42);
    }, 600);

    const timer2 = setTimeout(() => {
      setLogs((prev) => [...prev, 'Classifying isolated mesh topologies...']);
      setProgress(75);
    }, 1300);

    const timer3 = setTimeout(() => {
      setLogs((prev) => [...prev, 'Synthesizing DFMA & material kinematics...']);
      setProgress(94);
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 select-none">
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-[min(540px,92vw)] rounded-[2px] bg-[var(--carbon)] border border-[var(--line)] p-8 overflow-hidden text-[var(--text)]"
      >
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] border border-[var(--line)] flex items-center justify-center text-[var(--text)]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[0.75rem] font-sans text-[var(--text)] font-medium flex items-center gap-1.5">
                <Activity className="w-3 h-3 animate-spin text-[var(--muted)]" />
                CAD resolution pipeline
              </div>
              <div className="text-[0.75rem] font-serif text-[var(--muted)]">
                Parsing 3D topology
              </div>
            </div>
          </div>

          <div className="text-right font-sans">
            <div className="text-xl font-light text-[var(--text)] tabular-nums">{progress}%</div>
            <div className="text-[0.6875rem] text-[var(--muted)]">Analysis stage</div>
          </div>
        </div>

        {/* Center Status Display */}
        <div className="my-4 p-4 rounded-[2px] border border-[var(--line)] space-y-1.5">
          <div className="text-xs text-[var(--muted)] font-sans flex items-center gap-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>Current operation</span>
          </div>
          <p className="text-sm font-sans font-medium text-[var(--text)] leading-snug">
            {status}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 rounded-[1px] bg-[var(--line)] overflow-hidden my-6">
          <motion.div
            className="h-full bg-[var(--text)]"
            initial={{ width: '10%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Live Log Readout */}
        <div className="p-3 rounded-[2px] border border-[var(--line)] font-sans text-[0.75rem] space-y-1 max-h-28 overflow-hidden text-[var(--muted)]">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[var(--line)]">&gt;</span>
              <span className="truncate">{log}</span>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-between text-[0.75rem] font-sans text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--muted)]" />
            Geometric verification active
          </span>
          <span>100% Client CAD engine</span>
        </div>
      </motion.div>
    </div>
  );
};

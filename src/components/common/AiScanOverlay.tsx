import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers, Sparkles, Box, ShieldCheck, Activity } from 'lucide-react';

interface AiScanOverlayProps {
  status: string;
  theme?: 'light' | 'dark';
}

export const AiScanOverlay: React.FC<AiScanOverlayProps> = ({ status, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [logs, setLogs] = useState<string[]>([
    'INITIALIZING CAD SPATIAL BUFFER...',
    'STREAMING GEOMETRY DATA TO HOLOGRAPHIC PIPELINE...',
  ]);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLogs((prev) => [...prev, 'COMPUTING SPATIAL BOUNDING ENVELOPE...']);
      setProgress(42);
    }, 600);

    const timer2 = setTimeout(() => {
      setLogs((prev) => [...prev, 'CLASSIFYING ISOLATED MESH TOPOLOGIES...']);
      setProgress(75);
    }, 1300);

    const timer3 = setTimeout(() => {
      setLogs((prev) => [...prev, 'SYNTHESIZING DFMA & MATERIAL KINEMATICS...']);
      setProgress(94);
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[999] flex items-center justify-center ${
      isLight ? 'bg-slate-900/40' : 'bg-[#050608]/85'
    } backdrop-blur-xl select-none`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative w-[min(540px,92vw)] rounded-2xl ${
          isLight
            ? 'bg-white border border-[#2563eb]/40 shadow-[0_20px_60px_rgba(15,23,42,0.18)]'
            : 'bg-[#0a0d14] border border-[#00f2ad]/40 shadow-[0_0_80px_rgba(0,242,173,0.15)]'
        } p-8 overflow-hidden`}
      >
        {/* CAD Corner Accents */}
        <div className="cad-corner-tl" />
        <div className="cad-corner-tr" />
        <div className="cad-corner-bl" />
        <div className="cad-corner-br" />

        {/* Scanning Laser Sweep Effect */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent ${
          isLight ? 'via-[#2563eb]' : 'via-[#00f2ad]'
        } to-transparent animate-scan-laser opacity-75 blur-xs pointer-events-none`} />

        {/* Header HUD */}
        <div className={`flex items-center justify-between border-b ${isLight ? 'border-slate-200' : 'border-white/10'} pb-4 mb-6`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${
              isLight ? 'bg-blue-50 border border-blue-200 text-[#2563eb]' : 'bg-[#00f2ad]/10 border border-[#00f2ad]/30 text-[#00f2ad]'
            } flex items-center justify-center`}>
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className={`text-[10px] font-mono-cad ${
                isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'
              } uppercase tracking-widest font-bold flex items-center gap-1.5`}>
                <Activity className="w-3 h-3 animate-spin" />
                AI CAD TELEMETRY ENGINE
              </div>
              <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} font-mono-cad`}>
                PARSING 3D TOPOLOGY // v3.8
              </div>
            </div>
          </div>

          <div className="text-right font-mono-cad">
            <div className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'} tracking-tight`}>{progress}%</div>
            <div className={`text-[9px] ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'} uppercase font-semibold`}>ANALYSIS STAGE</div>
          </div>
        </div>

        {/* Center Status Display */}
        <div className={`my-4 p-4 rounded-xl ${
          isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/50 border border-white/5'
        } space-y-2`}>
          <div className={`text-xs ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'} font-mono-cad flex items-center gap-2 font-semibold`}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>CURRENT OPERATION</span>
          </div>
          <p className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'} leading-snug`}>
            {status}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className={`w-full h-1.5 rounded-full ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-white/5 border border-white/10'} overflow-hidden my-6`}>
          <motion.div
            className={`h-full ${
              isLight
                ? 'bg-gradient-to-r from-[#2563eb] via-[#0284c7] to-[#2563eb]'
                : 'bg-gradient-to-r from-[#00f2ad] via-[#38bdf8] to-[#00f2ad]'
            }`}
            initial={{ width: '10%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Live Terminal Log Readout */}
        <div className={`p-3 rounded-lg ${
          isLight ? 'bg-slate-100 border border-slate-200 text-slate-700' : 'bg-black/70 border border-white/5 text-slate-400'
        } font-mono-cad text-[10px] space-y-1 max-h-28 overflow-hidden`}>
          {logs.map((log, i) => (
            <div key={i} className={`flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              <span className={isLight ? 'text-[#2563eb] font-bold' : 'text-[#00f2ad]'}>&gt;</span>
              <span className="truncate">{log}</span>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className={`mt-6 flex items-center justify-between text-[10px] font-mono-cad ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
          <span className={`flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-[#2563eb]' : 'text-[#00f2ad]'}`} />
            Geometric Verification Active
          </span>
          <span>100% IN-BROWSER PARSER</span>
        </div>
      </motion.div>
    </div>
  );
};

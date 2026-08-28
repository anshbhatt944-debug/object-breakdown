import React from 'react';
import { ObjectBreakdownData, DepthLevel } from '../../../types/objectData';
import { Activity, Box, CheckCircle, Cpu, Layers, Lightbulb, Network, Triangle, Ruler, Sparkles } from 'lucide-react';

interface ObjectOverviewProps { objectData: ObjectBreakdownData; depthLevel: DepthLevel; }

const Metric = ({ label, value }: { label: string; value: React.ReactNode }) => <div className="p-3 rounded-xl glass-card border border-white/5 space-y-1"><span className="text-[9px] text-slate-500 uppercase tracking-wider block font-mono-cad">{label}</span><span className="text-sm font-bold text-slate-100 break-words block">{value}</span></div>;

export const ObjectOverview: React.FC<ObjectOverviewProps> = ({ objectData, depthLevel }) => {
  const { complexityScore, stats, summary, engineeringDisciplines, assemblyAnalysis } = objectData;
  const detailed = depthLevel !== 'quick';
  const scoreBars = [
    { label: 'Mechanical Complexity', score: complexityScore.mechanical }, { label: 'Electrical / Electronics', score: complexityScore.electrical }, { label: 'Material Science', score: complexityScore.material }, { label: 'Manufacturing', score: complexityScore.manufacturing }, { label: 'Assembly & Integration', score: complexityScore.assembly },
  ];
  return <div className="p-6 space-y-5 overflow-y-auto h-full text-slate-300 font-sans">
    <section className="space-y-3 pb-4 border-b border-white/10"><div className="flex items-center justify-between gap-3"><span className="text-xs font-mono-cad text-[#00f2ad] uppercase tracking-wider font-semibold">{objectData.category}</span>{assemblyAnalysis && <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 font-mono-cad">{assemblyAnalysis.complexity} complexity</span>}</div><h1 className="text-2xl font-bold text-slate-100 font-heading tracking-tight">{objectData.name}</h1>{assemblyAnalysis?.objectType && <div className="text-xs text-[#38bdf8] font-mono-cad">Type: {assemblyAnalysis.objectType}</div>}<p className="text-sm text-slate-300 leading-relaxed">{summary}</p></section>

    {assemblyAnalysis && <section className="p-4 rounded-xl glass-card border border-[#38bdf8]/20 bg-[#38bdf8]/[0.02] space-y-3"><div className="flex items-center gap-2 text-xs font-mono-cad font-semibold uppercase tracking-wider text-slate-200"><Ruler className="w-4 h-4 text-[#38bdf8]" />Measured Assembly Geometry</div><div className="grid grid-cols-2 gap-2"><Metric label="Overall Bounds" value={assemblyAnalysis.geometry.formatted} /><Metric label="Approx. Bounding Volume" value={assemblyAnalysis.geometry.approxBoundingVolume} /><Metric label="Raw Meshes" value={assemblyAnalysis.geometry.meshCount} /><Metric label="Triangles" value={assemblyAnalysis.geometry.triangleCount.toLocaleString()} /></div><p className="text-[10px] text-slate-500 leading-relaxed">{assemblyAnalysis.geometry.unitNote}</p></section>}

    <section className="p-4 rounded-xl glass-card border border-white/10 space-y-3"><div className="flex items-center gap-2 text-xs font-mono-cad font-semibold uppercase tracking-wider text-slate-200"><Network className="w-4 h-4 text-purple-400" />Primary Systems</div><div className="flex flex-wrap gap-1.5">{(assemblyAnalysis?.primarySystems || objectData.rootComponents.map((c) => c.category)).slice(0, 6).map((system, i) => <span key={`${system}-${i}`} className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-400/20 text-[11px] text-slate-300">{system}</span>)}</div></section>

    {detailed && assemblyAnalysis?.analysisNotes && <section className="p-4 rounded-xl glass-card border border-[#00f2ad]/20 space-y-2"><div className="flex items-center gap-2 text-xs font-mono-cad font-semibold uppercase tracking-wider text-slate-200"><Sparkles className="w-4 h-4 text-[#00f2ad]" />AI Analysis Notes</div>{assemblyAnalysis.analysisNotes.map((note, i) => <p key={i} className="text-xs leading-relaxed text-slate-300 pl-3 border-l border-[#00f2ad]/30">{note}</p>)}</section>}

    <section className="p-5 rounded-2xl glass-card border border-[#00f2ad]/30 bg-[#00f2ad]/[0.02] space-y-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Activity className="w-5 h-5 text-[#00f2ad]" /><h3 className="text-xs font-mono-cad uppercase tracking-wider font-bold text-slate-100">Technical Complexity Index</h3></div><div className="font-mono-cad"><span className="text-3xl font-extrabold text-[#00f2ad]">{complexityScore.overall.toFixed(1)}</span><span className="text-sm text-slate-500"> / 10</span></div></div><div className="space-y-2.5">{scoreBars.map((bar) => <div key={bar.label}><div className="flex justify-between text-[10px] font-mono-cad mb-1"><span className="text-slate-400">{bar.label}</span><span className="text-slate-200">{bar.score.toFixed(1)} / 10</span></div><div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden"><div className="h-full rounded-full bg-[#00f2ad]" style={{ width: `${Math.min(100, bar.score * 10)}%` }} /></div></div>)}</div></section>

    <section className="grid grid-cols-2 gap-2"><Metric label="Semantic Components" value={stats.componentCount} /><Metric label="Material Groups" value={stats.materialCount} /><Metric label="Moving Parts" value={stats.movingParts} /><Metric label="Manufacturing Stages" value={stats.manufacturingStages || 'Not inferred'} /></section>

    <section className="p-4 rounded-xl glass-card border border-white/10 space-y-3"><div className="flex items-center gap-2 text-xs font-mono-cad font-semibold uppercase tracking-wider text-slate-200"><Cpu className="w-4 h-4 text-[#38bdf8]" />Applicable Engineering Disciplines</div>{engineeringDisciplines.map((disc, i) => <div key={i} className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle className="w-3.5 h-3.5 text-[#00f2ad] shrink-0" />{disc}</div>)}</section>

    {objectData.didYouKnow.length > 0 && <section className="p-4 rounded-xl glass-card border border-amber-500/20 bg-amber-500/[0.02] space-y-2"><div className="flex items-center gap-2 text-xs font-mono-cad font-semibold uppercase tracking-wider text-amber-400"><Lightbulb className="w-4 h-4" />Engineering Insights</div>{objectData.didYouKnow.map((fact, i) => <p key={i} className="text-xs text-slate-300 leading-relaxed">• {fact}</p>)}</section>}
  </div>;
};

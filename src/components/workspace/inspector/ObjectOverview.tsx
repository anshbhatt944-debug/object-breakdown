import React from 'react';
import { ObjectBreakdownData, DepthLevel } from '../../../types/objectData';
import { Activity, CheckCircle, Cpu, Lightbulb, Network, Ruler, Sparkles } from 'lucide-react';

interface ObjectOverviewProps {
  objectData: ObjectBreakdownData;
  depthLevel: DepthLevel;
}

const Metric = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="p-3 rounded-[2px] bg-[#211e1c] border border-[var(--line)] space-y-1">
    <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider block font-mono">
      {label}
    </span>
    <span className="text-sm font-semibold text-[var(--text)] break-words block font-mono">
      {value}
    </span>
  </div>
);

export const ObjectOverview: React.FC<ObjectOverviewProps> = ({ objectData, depthLevel }) => {
  const { complexityScore, stats, summary, engineeringDisciplines, assemblyAnalysis } = objectData;
  const detailed = depthLevel !== 'quick';
  const scoreBars = [
    { label: 'Mechanical Complexity', score: complexityScore.mechanical },
    { label: 'Electrical / Electronics', score: complexityScore.electrical },
    { label: 'Material Science', score: complexityScore.material },
    { label: 'Manufacturing', score: complexityScore.manufacturing },
    { label: 'Assembly & Integration', score: complexityScore.assembly },
  ];

  return (
    <div className="p-5 sm:p-6 space-y-5 overflow-y-auto h-full text-[var(--text)] font-sans">
      {/* Title & Category Header */}
      <section className="space-y-3 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-[#e27228] uppercase tracking-wider font-semibold">
            {objectData.category}
          </span>
          {assemblyAnalysis && (
            <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-[#e27228]/10 border border-[#e27228]/30 text-[#e27228] font-mono">
              {assemblyAnalysis.complexity} complexity
            </span>
          )}
        </div>
        <h1 className="text-2xl font-light text-[var(--text)] font-sans tracking-tight">
          {objectData.name}
        </h1>
        {assemblyAnalysis?.objectType && (
          <div className="text-xs text-[var(--muted)] font-mono">
            Type: {assemblyAnalysis.objectType}
          </div>
        )}
        <p className="text-xs leading-relaxed text-[var(--muted)] font-serif">
          {summary}
        </p>
      </section>

      {/* Assembly Geometry */}
      {assemblyAnalysis && (
        <section className="p-4 rounded-[2px] bg-[#211e1c] border border-[var(--line)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text)]">
            <Ruler className="w-4 h-4 text-[#e27228]" />
            Measured Assembly Geometry
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Overall Bounds" value={assemblyAnalysis.geometry.formatted} />
            <Metric label="Approx. Bounding Volume" value={assemblyAnalysis.geometry.approxBoundingVolume} />
            <Metric label="Raw Meshes" value={assemblyAnalysis.geometry.meshCount} />
            <Metric label="Triangles" value={assemblyAnalysis.geometry.triangleCount.toLocaleString()} />
          </div>
          <p className="text-[10px] text-[var(--muted)] font-serif leading-relaxed">
            {assemblyAnalysis.geometry.unitNote}
          </p>
        </section>
      )}

      {/* Primary Systems */}
      <section className="p-4 rounded-[2px] bg-[#211e1c] border border-[var(--line)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text)]">
          <Network className="w-4 h-4 text-[#e27228]" />
          Primary Systems
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(assemblyAnalysis?.primarySystems || objectData.rootComponents.map((c) => c.category))
            .slice(0, 6)
            .map((system, i) => (
              <span
                key={`${system}-${i}`}
                className="px-2.5 py-1 rounded-[2px] bg-[#2a2420] border border-[var(--line)] text-[11px] text-[var(--text)] font-sans"
              >
                {system}
              </span>
            ))}
        </div>
      </section>

      {/* AI Analysis Notes */}
      {detailed && assemblyAnalysis?.analysisNotes && (
        <section className="p-4 rounded-[2px] bg-[#211e1c] border border-[var(--line)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text)]">
            <Sparkles className="w-4 h-4 text-[#e27228]" />
            AI Analysis Notes
          </div>
          {assemblyAnalysis.analysisNotes.map((note, i) => (
            <p key={i} className="text-xs leading-relaxed text-[var(--muted)] pl-3 border-l border-[#e27228]/40 font-serif">
              {note}
            </p>
          ))}
        </section>
      )}

      {/* Technical Complexity Index */}
      <section className="p-5 rounded-[2px] bg-[#211e1c] border border-[var(--line)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#e27228]" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--text)]">
              Technical Complexity Index
            </h3>
          </div>
          <div className="font-mono">
            <span className="text-2xl font-bold text-[#e27228]">
              {complexityScore.overall.toFixed(1)}
            </span>
            <span className="text-xs text-[var(--muted)]"> / 10</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {scoreBars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-[var(--muted)]">{bar.label}</span>
                <span className="text-[var(--text)]">{bar.score.toFixed(1)} / 10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c2410c] to-[#e27228]"
                  style={{ width: `${Math.min(100, bar.score * 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Numbers */}
      <section className="grid grid-cols-2 gap-2">
        <Metric label="Semantic Components" value={stats.componentCount} />
        <Metric label="Material Groups" value={stats.materialCount} />
        <Metric label="Moving Parts" value={stats.movingParts} />
        <Metric label="Manufacturing Stages" value={stats.manufacturingStages || 'Not inferred'} />
      </section>

      {/* Engineering Disciplines */}
      <section className="p-4 rounded-[2px] bg-[#211e1c] border border-[var(--line)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text)]">
          <Cpu className="w-4 h-4 text-[#e27228]" />
          Applicable Engineering Disciplines
        </div>
        {engineeringDisciplines.map((disc, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-[var(--muted)] font-serif">
            <CheckCircle className="w-3.5 h-3.5 text-[#e27228] shrink-0" />
            {disc}
          </div>
        ))}
      </section>

      {/* Did You Know */}
      {objectData.didYouKnow.length > 0 && (
        <section className="p-4 rounded-[2px] bg-[#211e1c] border border-[var(--line)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#e27228]">
            <Lightbulb className="w-4 h-4" />
            Engineering Insights
          </div>
          {objectData.didYouKnow.map((fact, i) => (
            <p key={i} className="text-xs text-[var(--muted)] leading-relaxed font-serif">
              • {fact}
            </p>
          ))}
        </section>
      )}
    </div>
  );
};


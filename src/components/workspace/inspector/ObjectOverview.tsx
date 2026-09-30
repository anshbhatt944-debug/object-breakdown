import React from 'react';
import { ObjectBreakdownData, DepthLevel } from '../../../types/objectData';
import { Activity, CheckCircle, Cpu, Lightbulb, Network, Ruler, Sparkles } from 'lucide-react';

interface ObjectOverviewProps {
  objectData: ObjectBreakdownData;
  depthLevel: DepthLevel;
  theme?: 'light' | 'dark';
}

const Metric = ({ label, value, isLight }: { label: string; value: React.ReactNode; isLight?: boolean }) => (
  <div className={`p-3 rounded-[3px] border space-y-1 transition-colors ${
    isLight
      ? 'bg-white border-[#DDD6CB] shadow-[0_1px_2px_rgba(22,19,17,0.02)]'
      : 'bg-[#211e1c] border-[var(--line)]'
  }`}>
    <span className={`text-[9px] uppercase tracking-wider block font-mono ${
      isLight ? 'text-[#786e64]' : 'text-[var(--muted)]'
    }`}>
      {label}
    </span>
    <span className={`text-sm font-semibold break-words block font-mono ${
      isLight ? 'text-[#161311]' : 'text-[var(--text)]'
    }`}>
      {value}
    </span>
  </div>
);

export const ObjectOverview: React.FC<ObjectOverviewProps> = ({ objectData, depthLevel, theme = 'dark' }) => {
  const { complexityScore, stats, summary, engineeringDisciplines, assemblyAnalysis } = objectData;
  const detailed = depthLevel !== 'quick';
  const isLight = theme === 'light';

  const cardClass = isLight
    ? 'p-4 rounded-[4px] bg-white border border-[#DDD6CB] space-y-3 shadow-[0_1px_3px_rgba(22,19,17,0.03)]'
    : 'p-4 rounded-[2px] bg-[#211e1c] border border-[var(--line)] space-y-3';

  const scoreBars = [
    { label: 'Mechanical Complexity', score: complexityScore.mechanical },
    { label: 'Electrical / Electronics', score: complexityScore.electrical },
    { label: 'Material Science', score: complexityScore.material },
    { label: 'Manufacturing', score: complexityScore.manufacturing },
    { label: 'Assembly & Integration', score: complexityScore.assembly },
  ];

  return (
    <div className={`p-5 sm:p-6 space-y-5 overflow-y-auto h-full font-sans transition-colors ${
      isLight ? 'text-[#161311]' : 'text-[var(--text)]'
    }`}>
      {/* Title & Category Header */}
      <section className={`space-y-3 pb-4 border-b ${isLight ? 'border-[#DDD6CB]' : 'border-[var(--line)]'}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-[#C2410C] dark:text-[#e27228] uppercase tracking-wider font-semibold">
            {objectData.category}
          </span>
          {assemblyAnalysis && (
            <span className={`text-[10px] px-2 py-0.5 rounded-[2px] font-mono border ${
              isLight
                ? 'bg-orange-50 border-orange-200 text-[#C2410C] font-semibold'
                : 'bg-[#e27228]/10 border-[#e27228]/30 text-[#e27228]'
            }`}>
              {assemblyAnalysis.complexity} complexity
            </span>
          )}
        </div>
        <h1 className={`text-2xl font-light font-sans tracking-tight ${isLight ? 'text-[#161311]' : 'text-[var(--text)]'}`}>
          {objectData.name}
        </h1>
        {assemblyAnalysis?.objectType && (
          <div className={`text-xs font-mono ${isLight ? 'text-[#786e64]' : 'text-[var(--muted)]'}`}>
            Type: {assemblyAnalysis.objectType}
          </div>
        )}
        <p className={`text-xs leading-relaxed font-serif ${isLight ? 'text-[#5e5750]' : 'text-[var(--muted)]'}`}>
          {summary}
        </p>
      </section>

      {/* Assembly Geometry */}
      {assemblyAnalysis && (
        <section className={cardClass}>
          <div className={`flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider ${
            isLight ? 'text-[#161311]' : 'text-[var(--text)]'
          }`}>
            <Ruler className="w-4 h-4 text-[#C2410C] dark:text-[#e27228]" />
            Measured Assembly Geometry
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Overall Bounds" value={assemblyAnalysis.geometry.formatted} isLight={isLight} />
            <Metric label="Approx. Bounding Volume" value={assemblyAnalysis.geometry.approxBoundingVolume} isLight={isLight} />
            <Metric label="Raw Meshes" value={assemblyAnalysis.geometry.meshCount} isLight={isLight} />
            <Metric label="Triangles" value={assemblyAnalysis.geometry.triangleCount.toLocaleString()} isLight={isLight} />
          </div>
          <p className={`text-[10px] font-serif leading-relaxed ${isLight ? 'text-[#786e64]' : 'text-[var(--muted)]'}`}>
            {assemblyAnalysis.geometry.unitNote}
          </p>
        </section>
      )}

      {/* Primary Systems */}
      <section className={cardClass}>
        <div className={`flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider ${
          isLight ? 'text-[#161311]' : 'text-[var(--text)]'
        }`}>
          <Network className="w-4 h-4 text-[#C2410C] dark:text-[#e27228]" />
          Primary Systems
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(assemblyAnalysis?.primarySystems || objectData.rootComponents.map((c) => c.category))
            .slice(0, 6)
            .map((system, i) => (
              <span
                key={`${system}-${i}`}
                className={`px-2.5 py-1 rounded-[3px] border text-[11px] font-sans transition-colors ${
                  isLight
                    ? 'bg-[#F4EFE8] border-[#DDD6CB] text-[#161311] font-medium shadow-sm'
                    : 'bg-[#2a2420] border-[var(--line)] text-[var(--text)]'
                }`}
              >
                {system}
              </span>
            ))}
        </div>
      </section>

      {/* AI Analysis Notes */}
      {detailed && assemblyAnalysis?.analysisNotes && (
        <section className={cardClass}>
          <div className={`flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider ${
            isLight ? 'text-[#161311]' : 'text-[var(--text)]'
          }`}>
            <Sparkles className="w-4 h-4 text-[#C2410C] dark:text-[#e27228]" />
            AI Analysis Notes
          </div>
          {assemblyAnalysis.analysisNotes.map((note, i) => (
            <p
              key={i}
              className={`text-xs leading-relaxed pl-3 font-serif border-l ${
                isLight ? 'text-[#5e5750] border-[#C2410C]/40' : 'text-[var(--muted)] border-[#e27228]/40'
              }`}
            >
              {note}
            </p>
          ))}
        </section>
      )}

      {/* Technical Complexity Index */}
      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#C2410C] dark:text-[#e27228]" />
            <h3 className={`text-xs font-mono uppercase tracking-wider font-semibold ${
              isLight ? 'text-[#161311]' : 'text-[var(--text)]'
            }`}>
              Technical Complexity Index
            </h3>
          </div>
          <div className="font-mono">
            <span className="text-2xl font-bold text-[#C2410C] dark:text-[#e27228]">
              {complexityScore.overall.toFixed(1)}
            </span>
            <span className={`text-xs ${isLight ? 'text-[#786e64]' : 'text-[var(--muted)]'}`}> / 10</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {scoreBars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className={isLight ? 'text-[#5e5750]' : 'text-[var(--muted)]'}>{bar.label}</span>
                <span className={isLight ? 'text-[#161311] font-semibold' : 'text-[var(--text)]'}>{bar.score.toFixed(1)} / 10</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                isLight ? 'bg-[#EAE4DC]' : 'bg-black/40'
              }`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C2410C] to-[#e27228]"
                  style={{ width: `${Math.min(100, bar.score * 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Numbers */}
      <section className="grid grid-cols-2 gap-2">
        <Metric label="Semantic Components" value={stats.componentCount} isLight={isLight} />
        <Metric label="Material Groups" value={stats.materialCount} isLight={isLight} />
        <Metric label="Moving Parts" value={stats.movingParts} isLight={isLight} />
        <Metric label="Manufacturing Stages" value={stats.manufacturingStages || 'Not inferred'} isLight={isLight} />
      </section>

      {/* Engineering Disciplines */}
      <section className={cardClass}>
        <div className={`flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider ${
          isLight ? 'text-[#161311]' : 'text-[var(--text)]'
        }`}>
          <Cpu className="w-4 h-4 text-[#C2410C] dark:text-[#e27228]" />
          Applicable Engineering Disciplines
        </div>
        {engineeringDisciplines.map((disc, i) => (
          <div key={i} className={`flex items-center gap-2 text-xs font-serif ${
            isLight ? 'text-[#5e5750]' : 'text-[var(--muted)]'
          }`}>
            <CheckCircle className="w-3.5 h-3.5 text-[#C2410C] dark:text-[#e27228] shrink-0" />
            {disc}
          </div>
        ))}
      </section>

      {/* Did You Know */}
      {objectData.didYouKnow.length > 0 && (
        <section className={cardClass}>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#C2410C] dark:text-[#e27228]">
            <Lightbulb className="w-4 h-4" />
            Engineering Insights
          </div>
          {objectData.didYouKnow.map((fact, i) => (
            <p key={i} className={`text-xs leading-relaxed font-serif ${
              isLight ? 'text-[#5e5750]' : 'text-[var(--muted)]'
            }`}>
              • {fact}
            </p>
          ))}
        </section>
      )}
    </div>
  );
};

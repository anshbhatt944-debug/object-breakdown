import React from 'react';
import { ComponentNode, DepthLevel } from '../../../types/objectData';
import {
  Cpu,
  Eye,
  Factory,
  FileText,
  Lightbulb,
  Link,
  Ruler,
  ShieldCheck,
  Sparkles,
  Target,
  Compass,
  Network,
  Box
} from 'lucide-react';

interface ComponentDetailsProps {
  component: ComponentNode | null;
  depthLevel: DepthLevel;
  onSelectComponentById: (id: string) => void;
}

const Metric = ({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 min-w-0">
    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono-cad">
      {label}
    </div>

    <div className="text-xs text-slate-200 font-medium mt-1 break-words">
      {value}
    </div>
  </div>
);

export const ComponentDetails: React.FC<ComponentDetailsProps> = ({
  component,
  depthLevel,
  onSelectComponentById
}) => {
  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 select-none">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <Compass className="w-6 h-6 text-[#00f2ad] animate-pulse" />
        </div>

        <h4 className="text-sm font-semibold text-slate-200 mb-1 font-mono-cad">
          No Component Selected
        </h4>

        <p className="text-xs text-slate-500 max-w-xs">
          Click a component in the 3D model or assembly tree to inspect AI
          findings and geometry measured directly from the uploaded asset.
        </p>
      </div>
    );
  }

  const isQuick = depthLevel === 'quick';

  const isDetailed =
    depthLevel === 'detailed' ||
    depthLevel === 'engineering' ||
    depthLevel === 'expert';

  const isEngineering =
    depthLevel === 'engineering' ||
    depthLevel === 'expert';

  const g = component.geometry;

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full text-slate-300 font-sans">

      {/* HEADER */}
      <div className="space-y-2 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono-cad px-2.5 py-1 rounded-full bg-[#00f2ad]/10 border border-[#00f2ad]/30 text-[#00f2ad]">
            {component.cadId}
          </span>

          <span className="text-[10px] font-mono-cad px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#38bdf8]" />
            {component.dataConfidence}
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-100 tracking-tight font-heading">
          {component.name}
        </h2>

        <div className="flex flex-wrap gap-2 text-[10px] font-mono-cad">
          <span className="text-[#38bdf8]">
            {component.category}
          </span>

          {component.engineeringRole && (
            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-400/20 text-purple-300">
              {component.engineeringRole}
            </span>
          )}

          {component.importance && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/20 text-amber-300">
              {component.importance} importance
            </span>
          )}
        </div>
      </div>

      {/* PRIMARY FUNCTION */}
      <section className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-[#00f2ad]" />
          Primary Function
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {component.function}
        </p>
      </section>

      {/* MEASURED GEOMETRY */}
      {isDetailed && g && (
        <section className="p-4 rounded-xl glass-card border border-[#38bdf8]/20 bg-[#38bdf8]/[0.02] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
              <Ruler className="w-4 h-4 text-[#38bdf8]" />
              Measured Geometry
            </div>

            <span className="text-[9px] text-[#38bdf8] font-mono-cad">
              FROM 3D ASSET
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric
              label="Bounding Dimensions"
              value={g.formatted}
            />

            <Metric
              label="Approx. Bounding Volume"
              value={g.approxBoundingVolume}
            />

            <Metric
              label="Triangles"
              value={g.triangleCount.toLocaleString()}
            />

            <Metric
              label="Meshes Grouped"
              value={g.meshCount}
            />

            <Metric
              label="Relative Assembly Size"
              value={`${g.relativeSizePercent}%`}
            />

            <Metric
              label="Center"
              value={g.center
                .map((v) => v.toFixed(2))
                .join(', ')}
            />
          </div>

          {g.sourceMaterials.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono-cad mb-1.5">
                Source Material Names
              </div>

              <div className="flex flex-wrap gap-1.5">
                {g.sourceMaterials.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* MATERIAL */}
      <section className="p-4 rounded-xl glass-card border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-[#38bdf8]" />
            Material Estimate
          </div>

          <span className="text-[10px] text-slate-500">
            {component.material.type}
          </span>
        </div>

        <Metric
          label="Likely Material"
          value={component.material.name}
        />

        {!isQuick && (
          <div className="grid grid-cols-2 gap-2">
            <Metric
              label="Confidence"
              value={component.material.grade}
            />

            <Metric
              label="Density"
              value={component.material.density}
            />
          </div>
        )}
      </section>

      {/* MANUFACTURING */}
      {!isQuick && (
        <section className="p-4 rounded-xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <Factory className="w-4 h-4 text-amber-400" />
            Manufacturing Inference
          </div>

          <Metric
            label="Likely Process"
            value={component.manufacturing.process}
          />

          <div className="grid grid-cols-2 gap-2">
            <Metric
              label="Tolerance Class"
              value={component.manufacturing.tolerance}
            />

            <Metric
              label="Tooling / Machinery"
              value={
                component.manufacturing.machinery ||
                'Model-dependent'
              }
            />
          </div>
        </section>
      )}

      {/* KEY INSIGHTS */}
      {isDetailed &&
        component.insights &&
        component.insights.length > 0 && (
          <section className="p-4 rounded-xl glass-card border border-[#00f2ad]/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#00f2ad]" />
              Key Engineering Insights
            </div>

            <ul className="space-y-2">
              {component.insights.map((item, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-300 leading-relaxed pl-3 border-l border-[#00f2ad]/30"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

      {/* INTERFACES */}
      {isDetailed &&
        component.interfaces &&
        component.interfaces.length > 0 && (
          <section className="p-4 rounded-xl glass-card border border-purple-400/20 bg-purple-500/[0.02] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
              <Network className="w-4 h-4 text-purple-400" />
              Interfaces & Integration
            </div>

            <div className="space-y-2">
              {component.interfaces.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-2 text-xs text-slate-300 leading-relaxed"
                >
                  <span className="text-purple-400 font-bold">
                    →
                  </span>

                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* DESIGN PRINCIPLES */}
      {isDetailed &&
        component.designPrinciples &&
        component.designPrinciples.length > 0 && (
          <section className="p-4 rounded-xl glass-card border border-cyan-400/20 bg-cyan-500/[0.02] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
              <Box className="w-4 h-4 text-cyan-400" />
              Design Principles
            </div>

            <div className="flex flex-wrap gap-2">
              {component.designPrinciples.map((item, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono-cad bg-cyan-400/5 border border-cyan-400/20 text-cyan-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

      {/* CLASSIFICATION EVIDENCE */}
      {isEngineering && (
        <section className="p-4 rounded-xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <Target className="w-4 h-4 text-purple-400" />
            Classification Evidence
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {component.classificationReason ||
              component.engineeringReason}
          </p>

          <div className="p-3 rounded-lg bg-black/30 border border-white/5">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono-cad mb-1">
              Confidence rationale
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {component.confidenceReason ||
                'Estimated from visible geometry and mesh grouping.'}
            </p>
          </div>
        </section>
      )}

      {/* CONNECTED COMPONENTS */}
      {component.connectedTo.length > 0 && (
        <section className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <Link className="w-4 h-4 text-[#38bdf8]" />
            Connected Components
          </div>

          <div className="flex flex-wrap gap-1.5">
            {component.connectedTo.map((id) => (
              <button
                key={id}
                onClick={() => onSelectComponentById(id)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono-cad bg-white/5 hover:bg-[#00f2ad]/20 hover:text-[#00f2ad] border border-white/10 transition-all"
              >
                {id
                  .replace('upload-component-', '')
                  .replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* INSPECTION POINTS */}
      {isEngineering &&
        component.inspectionPoints &&
        component.inspectionPoints.length > 0 && (
          <section className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-amber-400" />
              What an Engineer Inspects
            </div>

            {component.inspectionPoints.map((item, i) => (
              <div
                key={i}
                className="text-xs text-slate-300 leading-relaxed flex gap-2"
              >
                <span className="text-amber-400">
                  •
                </span>

                {item}
              </div>
            ))}
          </section>
        )}

      {/* ENGINEERING RATIONALE */}
      <section className="p-4 rounded-xl glass-card border border-[#00f2ad]/30 bg-[#00f2ad]/[0.03] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-[#00f2ad] uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          Engineering Design Rationale
        </div>

        <p className="text-xs text-slate-300 leading-relaxed italic">
          “{component.engineeringReason}”
        </p>
      </section>

    </div>
  );
};
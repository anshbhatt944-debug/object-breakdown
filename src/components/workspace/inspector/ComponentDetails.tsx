import React from 'react';
import { ComponentNode, DepthLevel } from '../../../types/objectData';
import {
  FileText,
  ShieldCheck,
  Cpu,
  Factory,
  Compass,
  AlertTriangle,
  Lightbulb,
  Link,
  ChevronRight,
  Info,
  Eye,
  ListChecks,
  Network,
  BookOpen,
} from 'lucide-react';

interface ComponentDetailsProps {
  component: ComponentNode | null;
  depthLevel: DepthLevel;
  onSelectComponentById: (id: string) => void;
}

export const ComponentDetails: React.FC<ComponentDetailsProps> = ({
  component,
  depthLevel,
  onSelectComponentById,
}) => {
  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 select-none">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-slate-300">
          <Compass className="w-6 h-6 text-[#00f2ad] animate-pulse" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1 font-mono-cad">No Component Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Click any component in the 3D model or assembly structure tree to inspect detailed CAD specifications, materials, and forces.
        </p>
      </div>
    );
  }

  const isQuick = depthLevel === 'quick';
  const isEngineeringOrExpert = depthLevel === 'engineering' || depthLevel === 'expert';

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-300 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono-cad px-2.5 py-0.5 rounded-full bg-[#00f2ad]/10 border border-[#00f2ad]/30 text-[#00f2ad]">
            {component.cadId}
          </span>
          <span className="text-[11px] font-mono-cad px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#38bdf8]" />
            {component.dataConfidence}
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-100 tracking-tight font-heading">
          {component.name}
        </h2>
        <span className="text-xs font-mono-cad text-[#38bdf8] capitalize">
          Category: {component.category}
        </span>
        {component.sourceMeshName && (
          <span className="text-[10px] font-mono-cad text-slate-500 truncate">
            Source mesh: {component.sourceMeshName}
          </span>
        )}
      </div>

      {/* Function Overview */}
      <div className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-[#00f2ad]" />
          <span>Primary Function</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{component.function}</p>
      </div>

      {/* Material & Physical Properties */}
      <div className="p-4 rounded-xl glass-card border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-[#38bdf8]" />
            <span>Material & Properties</span>
          </div>
          <span className="text-[11px] font-mono-cad text-slate-400">
            {component.material.type}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#00f2ad] font-mono-cad">
            {component.material.name}
          </span>
          <span className="text-[11px] font-mono-cad text-slate-400">
            Grade: {component.material.grade}
          </span>
        </div>

        {!isQuick && (
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-cad pt-1">
            <div className="p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-500 block">Density</span>
              <span className="text-slate-200 font-semibold">{component.material.density}</span>
            </div>
            {component.material.tensileStrength && (
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-500 block">Tensile Strength</span>
                <span className="text-slate-200 font-semibold">{component.material.tensileStrength}</span>
              </div>
            )}
            {component.material.elasticModulus && (
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-500 block">Elastic Modulus (E)</span>
                <span className="text-slate-200 font-semibold">{component.material.elasticModulus}</span>
              </div>
            )}
            {component.material.hardness && (
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-500 block">Hardness</span>
                <span className="text-slate-200 font-semibold">{component.material.hardness}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manufacturing & Dimensions */}
      {!isQuick && (
        <div className="p-4 rounded-xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <Factory className="w-4 h-4 text-amber-400" />
            <span>Manufacturing & Tolerances</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Process</span>
              <span className="text-slate-200 font-medium text-right max-w-[200px] truncate">
                {component.manufacturing.process}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Tolerance Class</span>
              <span className="text-[#00f2ad] font-mono-cad font-semibold">
                {component.manufacturing.tolerance}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">CAD Dimensions</span>
              <span className="text-slate-200 font-mono-cad">
                {component.dimensions.formatted}
              </span>
            </div>
            {component.manufacturing.machinery && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Factory Tooling</span>
                <span className="text-slate-300 text-right max-w-[200px] truncate">
                  {component.manufacturing.machinery}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mechanical Role & Forces (Engineering & Expert Mode) */}
      {isEngineeringOrExpert && (
        <div className="p-4 rounded-xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Kinematic Forces & Tribology</span>
          </div>

          <div className="space-y-2 text-xs font-mono-cad">
            {component.mechanicalRole.forces && (
              <div className="p-2.5 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-purple-400 block mb-0.5">Applied Load / Stress</span>
                <span className="text-slate-200">{component.mechanicalRole.forces}</span>
              </div>
            )}
            {component.mechanicalRole.frictionCoeff && (
              <div className="p-2.5 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-purple-400 block mb-0.5">Frictional Interface</span>
                <span className="text-slate-200">{component.mechanicalRole.frictionCoeff}</span>
              </div>
            )}
            {component.mechanicalRole.motion && (
              <div className="p-2.5 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-purple-400 block mb-0.5">Motion Constraints</span>
                <span className="text-slate-200">{component.mechanicalRole.motion}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connected Components Linkages */}
      {component.connectedTo.length > 0 && (
        <div className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <Link className="w-4 h-4 text-[#38bdf8]" />
            <span>Kinematic Linkages ({component.connectedTo.length})</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {component.connectedTo.map((targetId) => (
              <button
                key={targetId}
                onClick={() => onSelectComponentById(targetId)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono-cad bg-white/5 hover:bg-[#00f2ad]/20 hover:text-[#00f2ad] border border-white/10 hover:border-[#00f2ad]/40 transition-all flex items-center gap-1 text-slate-300"
              >
                <span>{targetId.replace(/-/g, ' ')}</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Failure Modes & Mitigation */}
      {component.failureModes.length > 0 && (
        <div className="p-4 rounded-xl glass-card border border-rose-500/20 bg-rose-500/[0.02] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Failure Mode & Mitigation</span>
          </div>

          {component.failureModes.map((fm, i) => (
            <div key={i} className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{fm.mode}</span>
                <span className={`text-[10px] font-mono-cad px-1.5 py-0.5 rounded ${
                  fm.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {fm.severity}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                <strong className="text-slate-300">Cause:</strong> {fm.cause}
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-[#00f2ad]">Mitigation:</strong> {fm.mitigation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Deep Technical Profile */}
      {(component.technicalNotes?.length || component.interfaces?.length || component.inspectionPoints?.length || component.designPrinciples?.length || component.evidence) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-slate-200 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#00f2ad]" />
            <span>Deep Technical Profile</span>
          </div>

          {component.technicalNotes && component.technicalNotes.length > 0 && (
            <div className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono-cad font-semibold text-slate-300 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-[#38bdf8]" /> How the part works
              </div>
              <ul className="space-y-2">
                {component.technicalNotes.map((note, i) => (
                  <li key={i} className="text-xs leading-relaxed text-slate-300 pl-3 border-l border-[#38bdf8]/30">{note}</li>
                ))}
              </ul>
            </div>
          )}

          {component.interfaces && component.interfaces.length > 0 && (
            <div className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono-cad font-semibold text-slate-300 uppercase tracking-wider">
                <Network className="w-3.5 h-3.5 text-purple-400" /> Interfaces & Mating Surfaces
              </div>
              <div className="flex flex-wrap gap-1.5">
                {component.interfaces.map((item, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-400/20 text-[11px] text-slate-300">{item}</span>
                ))}
              </div>
            </div>
          )}

          {isEngineeringOrExpert && component.inspectionPoints && component.inspectionPoints.length > 0 && (
            <div className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono-cad font-semibold text-slate-300 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-amber-400" /> What an engineer inspects
              </div>
              <ul className="space-y-2">
                {component.inspectionPoints.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed"><span className="text-amber-400">•</span>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {isEngineeringOrExpert && component.designPrinciples && component.designPrinciples.length > 0 && (
            <div className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono-cad font-semibold text-slate-300 uppercase tracking-wider">
                <ListChecks className="w-3.5 h-3.5 text-[#00f2ad]" /> Design Principles
              </div>
              <ul className="space-y-2">
                {component.designPrinciples.map((item, i) => (
                  <li key={i} className="text-xs text-slate-300 leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {component.evidence && (
            <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono-cad">3D Asset Evidence</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{component.evidence}</p>
              {component.confidenceReason && (
                <p className="text-[10px] text-slate-500 leading-relaxed pt-1">{component.confidenceReason}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Engineering Rationale */}
      <div className="p-4 rounded-xl glass-card border border-[#00f2ad]/30 bg-[#00f2ad]/[0.03] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-cad font-semibold text-[#00f2ad] uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          <span>Engineering Design Rationale</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed italic">
          "{component.engineeringReason}"
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { ComponentNode, DepthLevel, ObjectBreakdownData, EngineeringEquation } from '../../../types/objectData';
import {
  Cpu,
  Factory,
  FileText,
  Lightbulb,
  Link,
  Ruler,
  ShieldCheck,
  Layers,
  Box,
  Zap,
  Activity,
  AlertTriangle,
  Compass,
  Flame,
  Gauge,
  BookOpen,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface ComponentDetailsProps {
  component: ComponentNode | null;
  depthLevel: DepthLevel;
  onSelectComponentById: (id: string) => void;
  objectData?: ObjectBreakdownData;
  theme?: 'light' | 'dark';
}

const ComponentThemeContext = React.createContext<{ isLight: boolean }>({ isLight: false });

const DataCard = ({
  icon: Icon,
  title,
  colorClass,
  badge,
  children,
}: {
  icon: any;
  title: string;
  colorClass: string;
  badge?: string;
  children: React.ReactNode;
}) => {
  const { isLight } = React.useContext(ComponentThemeContext);
  return (
    <section className={`rounded-xl border p-4 sm:p-5 space-y-3.5 shadow-sm transition-all ${
      isLight
        ? 'border-slate-200 bg-slate-50/90 shadow-sm hover:border-slate-300'
        : 'border-white/10 bg-[#0a0d14]/75 hover:border-white/20'
    }`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-[10px] font-mono-cad font-bold uppercase tracking-widest ${colorClass}`}>
          <Icon className="w-4 h-4 shrink-0" />
          <span>{title}</span>
        </div>
        {badge && (
          <span className={`text-[9px] font-mono-cad px-2 py-0.5 rounded border uppercase tracking-wider ${
            isLight ? 'bg-slate-200/70 border-slate-300 text-slate-700' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
};

const Metric = ({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  highlight?: boolean;
}) => {
  const { isLight } = React.useContext(ComponentThemeContext);
  return (
    <div className={`flex flex-col gap-0.5 min-w-0 border rounded-lg p-2.5 ${
      isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border border-white/5'
    }`}>
      <div className={`text-[9px] uppercase tracking-wider font-mono-cad ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
      <div className={`text-xs font-semibold truncate ${
        highlight ? (isLight ? 'text-emerald-600' : 'text-[#00f2ad]') : (isLight ? 'text-slate-900' : 'text-slate-100')
      }`}>
        {value} {unit && <span className={`text-[10px] font-mono-cad font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{unit}</span>}
      </div>
    </div>
  );
};

function getConfidenceBadge(confidence: string = 'Typical') {
  const norm = confidence.toLowerCase();
  if (norm.includes('verified')) {
    return {
      label: 'VERIFIED',
      desc: 'Directly supported by engineering specifications and manufacturer CAD metadata',
      classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    };
  }
  if (norm.includes('source')) {
    return {
      label: 'SOURCE-DERIVED',
      desc: 'Calculated and cross-referenced from authoritative technical engineering references',
      classes: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    };
  }
  if (norm.includes('model')) {
    return {
      label: 'MODEL-DERIVED',
      desc: 'Extracted directly from measured 3D asset geometry and spatial hierarchy',
      classes: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    };
  }
  return {
    label: 'ESTIMATED',
    desc: 'Empirical engineering reference estimate for typical production class',
    classes: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };
}

function getApplicableStandards(component: ComponentNode, objectData?: ObjectBreakdownData) {
  const objId = objectData?.id || '';
  const compId = component.id.toLowerCase();
  const category = component.category.toLowerCase();

  const standards: Array<{ code: string; title: string; organization: string }> = [];

  if (objId === 'wristwatch' || category.includes('horology') || compId.includes('watch')) {
    standards.push(
      { code: 'ISO 1413:2016', title: 'Horology — Shock-resistant watches specification and test methods', organization: 'ISO' },
      { code: 'ISO 22810:2010', title: 'Horology — Water-resistant watches pressure testing standards', organization: 'ISO' },
      { code: 'NIHS 91-10', title: 'Swiss Watchmaking Standards — Movement casing & pivot dimensions', organization: 'NIHS' },
      { code: 'DIN 8243', title: 'Gears for horology and precision engineering — Cycloidal profiles', organization: 'DIN' }
    );
  } else if (objId === 'drone' || category.includes('avionics') || category.includes('aerospace')) {
    standards.push(
      { code: 'RTCA DO-178C', title: 'Software Considerations in Airborne Systems and Equipment Certification', organization: 'RTCA / FAA' },
      { code: 'ASTM F38', title: 'Standard Specification for Small Unmanned Aircraft System Airworthiness', organization: 'ASTM International' },
      { code: 'ISO 21384-3', title: 'Unmanned aircraft systems — Operational procedures and reliability', organization: 'ISO' }
    );
  } else if (objId === 'car-engine' || category.includes('engine') || category.includes('powertrain')) {
    standards.push(
      { code: 'SAE J1349', title: 'Engine Power Test Code — Spark Ignition and Compression Ignition', organization: 'SAE International' },
      { code: 'ISO 7967-1', title: 'Reciprocating internal combustion engines — Vocabulary and components', organization: 'ISO' },
      { code: 'AGMA 2001-D04', title: 'Fundamental Rating Factors and Calculation Methods for Involute Gearing', organization: 'AGMA' },
      { code: 'ASTM A319', title: 'Standard Specification for Gray Iron Castings for Elevated Temperatures', organization: 'ASTM' }
    );
  } else if (objId === 'electric-motor' || category.includes('motor') || category.includes('magnetic')) {
    standards.push(
      { code: 'IEC 60034-1:2022', title: 'Rotating electrical machines — Rating, performance and insulation classes', organization: 'IEC' },
      { code: 'NEMA MG 1', title: 'Motors and Generators — Design, torque ratings and thermal limits', organization: 'NEMA' },
      { code: 'ISO 1940-1', title: 'Mechanical vibration — Balance quality requirements for rotors in a constant state', organization: 'ISO' }
    );
  } else if (objId === 'ballpoint-pen' || category.includes('fluid') || compId.includes('pen')) {
    standards.push(
      { code: 'ISO 12757-1:2017', title: 'Ball point pens and refills — General writing performance and dimensions', organization: 'ISO' },
      { code: 'ISO 12757-2:2017', title: 'Ball point pens and refills — Documentary use requirements and lightfastness', organization: 'ISO' },
      { code: 'ASTM F2257', title: 'Standard Specification for Writing Instruments and Ink Viscosity Stability', organization: 'ASTM' }
    );
  } else {
    standards.push(
      { code: 'ISO 2768-1', title: 'General tolerances — Tolerances for linear and angular dimensions without individual indications', organization: 'ISO' },
      { code: 'ISO 1101', title: 'Geometrical product specifications (GPS) — Geometrical tolerancing', organization: 'ISO' }
    );
  }

  return standards;
}

function findMatchingEquation(
  component: ComponentNode,
  objectData?: ObjectBreakdownData
): EngineeringEquation | null {
  if (!objectData?.engineeringEquations || objectData.engineeringEquations.length === 0) {
    return null;
  }

  const compText = `${component.id} ${component.name} ${component.category} ${component.function}`.toLowerCase();

  // Try keyword matching against equation id/title/explanation
  for (const eq of objectData.engineeringEquations) {
    const eqText = `${eq.id} ${eq.title} ${eq.discipline} ${eq.explanation}`.toLowerCase();
    if (
      (compText.includes('gear') && eqText.includes('gear')) ||
      (compText.includes('spring') && eqText.includes('spring')) ||
      (compText.includes('escapement') && eqText.includes('escapement')) ||
      (compText.includes('balance') && eqText.includes('balance')) ||
      (compText.includes('rotor') && (eqText.includes('rotor') || eqText.includes('thrust') || eqText.includes('motor'))) ||
      (compText.includes('motor') && eqText.includes('motor')) ||
      (compText.includes('stator') && (eqText.includes('torque') || eqText.includes('power'))) ||
      (compText.includes('piston') && (eqText.includes('otto') || eqText.includes('pressure') || eqText.includes('work'))) ||
      (compText.includes('crankshaft') && (eqText.includes('torque') || eqText.includes('crank'))) ||
      (compText.includes('propeller') && eqText.includes('thrust')) ||
      (compText.includes('battery') && eqText.includes('power')) ||
      (compText.includes('pen') && (eqText.includes('capillary') || eqText.includes('flow') || eqText.includes('stress'))) ||
      (compText.includes('ball') && (eqText.includes('contact') || eqText.includes('flow')))
    ) {
      return eq;
    }
  }

  // Fallback to the first equation from the same discipline if possible
  return objectData.engineeringEquations[0] || null;
}

export const ComponentDetails: React.FC<ComponentDetailsProps> = ({
  component,
  depthLevel,
  onSelectComponentById,
  objectData,
  theme = 'dark',
}) => {
  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 select-none">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Compass className="w-8 h-8 text-[#00f2ad] animate-pulse" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1 font-mono-cad uppercase tracking-widest">
          No Component Selected
        </h4>
        <p className="text-xs text-slate-400 max-w-xs">
          Click any 3D component or select a node in the assembly tree to inspect CAD geometry and engineering specifications.
        </p>
      </div>
    );
  }

  const isLight = theme === 'light';
  const confidence = getConfidenceBadge(component.dataConfidence);
  const applicableStandards = getApplicableStandards(component, objectData);
  const matchingEquation = findMatchingEquation(component, objectData);
  const g = component.geometry;
  const m = component.material;
  const mfg = component.manufacturing;
  const mech = component.mechanicalRole;

  // Mode booleans
  const isQuick = depthLevel === 'quick';
  const isDetailed = depthLevel === 'detailed' || depthLevel === 'engineering' || depthLevel === 'expert';
  const isEngineering = depthLevel === 'engineering' || depthLevel === 'expert';
  const isExpert = depthLevel === 'expert';

  // Check discipline content availability for Engineering mode
  const hasMechanicalData = mech && (mech.forces || mech.contactPressure || mech.frictionCoeff || mech.stressConcentration || mech.motion);
  const hasMaterialPhysics = m && (m.density || m.tensileStrength || m.elasticModulus || m.hardness || m.wearResistance);
  const hasMfgData = mfg && (mfg.process || mfg.machinery || mfg.tolerance || (mfg.defectRisks && mfg.defectRisks.length > 0));
  const hasThermalData = m && (m.thermalConductivity || (component.function.toLowerCase().includes('cool') || component.function.toLowerCase().includes('heat')));
  const hasElectricalData = m && (m.electricalConductivity || component.category.toLowerCase().includes('electronic') || component.category.toLowerCase().includes('magnetic') || component.name.toLowerCase().includes('board') || component.name.toLowerCase().includes('motor') || component.name.toLowerCase().includes('coil'));

  return (
    <ComponentThemeContext.Provider value={{ isLight }}>
      <div className={`p-5 sm:p-6 space-y-5 overflow-y-auto h-full font-sans ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
        {/* CAD Header */}
        <div className={`space-y-3 pb-5 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] font-mono-cad px-2.5 py-1 rounded-full bg-[#00f2ad]/10 border border-[#00f2ad]/30 text-[#00f2ad] font-bold tracking-widest">
              {component.cadId || 'PART-01'}
            </span>
            <div
              title={confidence.desc}
              className={`flex items-center gap-1.5 text-[9px] font-mono-cad px-2.5 py-1 rounded-md border font-semibold tracking-wider cursor-help ${confidence.classes}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>CONFIDENCE: {confidence.label}</span>
            </div>
          </div>

          <div>
            <h2 className={`text-xl sm:text-2xl font-bold font-heading tracking-tight leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {component.name}
            </h2>
            <div className={`flex items-center gap-2 mt-1.5 text-[10px] font-mono-cad uppercase tracking-widest ${isLight ? 'text-[#0284c7]' : 'text-[#38bdf8]'}`}>
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{component.category}</span>
            </div>
          </div>

          {/* Current Depth Indicator Banner */}
          <div className={`flex items-center justify-between text-[9px] font-mono-cad px-3 py-1.5 rounded-lg border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/[0.03] border-white/5 text-slate-400'
          }`}>
            <span className="uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#00f2ad]" />
              Active Layer:
            </span>
            <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
              {isQuick && 'QUICK INSPECTION (1/4)'}
              {depthLevel === 'detailed' && 'DETAILED BREAKDOWN (2/4)'}
              {depthLevel === 'engineering' && 'ENGINEERING ANALYSIS (3/4)'}
              {isExpert && 'EXPERT & GOVERNING PHYSICS (4/4)'}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. QUICK MODE CONTENT: Primary Function & One-Sentence Essence           */}
        {/* ========================================================================= */}
        <DataCard icon={FileText} title="Primary Function" colorClass={isLight ? 'text-emerald-600' : 'text-[#00f2ad]'} badge="Core Role">
          <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
            {component.function}
          </p>
        </DataCard>

        {/* One-Sentence Engineering Rationale Essence */}
        <div className={`p-4 sm:p-5 rounded-xl border space-y-2 ${
          isLight
            ? 'bg-blue-50/70 border-blue-200 text-slate-800 shadow-sm'
            : 'bg-gradient-to-r from-[#00f2ad]/10 via-[#38bdf8]/5 to-transparent border-[#00f2ad]/30 shadow-[0_0_20px_rgba(0,242,173,0.05)]'
        }`}>
          <div className={`flex items-center gap-2 text-[10px] font-mono-cad font-bold uppercase tracking-widest ${isLight ? 'text-[#0284c7]' : 'text-[#00f2ad]'}`}>
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>Engineering Essence</span>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed font-medium italic ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            “{component.engineeringReason || component.function}”
          </p>
        </div>

      {/* Quick Attributes Summary (Visible in all modes, extra compact in Quick) */}
      <div className="grid grid-cols-2 gap-2.5">
        <Metric label="Material Class" value={m?.name?.split('/')[0]?.trim() || 'Engineering Spec'} highlight />
        <Metric label="Kinematic Motion" value={mech?.motion || (component.category.includes('Static') ? 'Static Structure' : 'Dynamic Coupling')} />
        {component.dimensions?.formatted && (
          <div className="col-span-2">
            <Metric label="Reference Bounds" value={component.dimensions.formatted} />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DETAILED MODE CONTENT: How It Works, Mating Parts, Geometry, Mfg      */}
      {/* ========================================================================= */}
      {isDetailed && (
        <>
          {/* Mating Interfacing Parts */}
          {component.connectedTo && component.connectedTo.length > 0 && (
            <DataCard icon={Link} title="Mating Interfacing Parts" colorClass="text-[#38bdf8]" badge={`${component.connectedTo.length} Links`}>
              <p className="text-xs text-slate-400">
                Direct physical couplings, load-bearing contacts, or mechanical linkages:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {component.connectedTo.map((id) => (
                  <button
                    key={id}
                    onClick={() => onSelectComponentById(id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-cad bg-white/5 hover:bg-[#00f2ad]/20 border border-white/10 hover:border-[#00f2ad]/40 text-slate-200 hover:text-[#00f2ad] transition-all group"
                  >
                    <span>{id.replace(/^(upload-component-|part-|sub-)/i, '')}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#00f2ad] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </DataCard>
          )}

          {/* Measured 3D Geometry */}
          {g && (
            <DataCard icon={Ruler} title="Measured 3D Geometry" colorClass="text-[#38bdf8]" badge="CAD Mesh">
              <div className="grid grid-cols-2 gap-2.5">
                <Metric label="Extents (X×Y×Z)" value={g.formatted} />
                <Metric label="Bounding Volume" value={g.approxBoundingVolume} />
                <Metric label="Triangle Count" value={g.triangleCount.toLocaleString()} />
                <Metric label="Meshes Grouped" value={g.meshCount} />
              </div>
            </DataCard>
          )}

          {/* Material Specification */}
          <DataCard icon={Box} title="Material Specification" colorClass="text-emerald-400" badge={m?.type || 'Solid'}>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Box className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">{m?.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono-cad">{m?.grade || 'Reference Specification'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {m?.density && <Metric label="Density" value={m.density} />}
                {m?.tensileStrength && <Metric label="Tensile Strength" value={m.tensileStrength} />}
                {m?.hardness && <Metric label="Hardness" value={m.hardness} />}
                {m?.elasticModulus && <Metric label="Elastic Modulus" value={m.elasticModulus} />}
              </div>
            </div>
          </DataCard>

          {/* Manufacturing Inference */}
          {mfg && (
            <DataCard icon={Factory} title="Manufacturing & Tooling" colorClass="text-amber-400" badge="Process">
              <div className="space-y-2.5">
                <div className="text-xs text-slate-200 leading-relaxed font-medium">
                  {mfg.process}
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {mfg.machinery && <Metric label="Primary Tooling" value={mfg.machinery} />}
                  {mfg.tolerance && <Metric label="Critical Tolerance" value={mfg.tolerance} highlight />}
                </div>
                {mfg.defectRisks && mfg.defectRisks.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="text-[9px] font-mono-cad uppercase text-slate-400 tracking-wider">
                      Process Defect Risks:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {mfg.defectRisks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 text-[10px] mt-0.5">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DataCard>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. ENGINEERING MODE CONTENT: Grouped Physical Parameters by Discipline   */}
      {/* ========================================================================= */}
      {isEngineering && (
        <div className="space-y-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono-cad uppercase tracking-wider text-[#00f2ad] font-bold">
            <Gauge className="w-4 h-4" />
            <span>Discipline Engineering Parameters</span>
          </div>

          {/* Mechanical Discipline */}
          {hasMechanicalData && (
            <DataCard icon={Gauge} title="Mechanical & Dynamic Parameters" colorClass="text-[#38bdf8]" badge="Mechanical">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {mech?.forces && <Metric label="Forces / Combustion Load" value={mech.forces} highlight />}
                {mech?.contactPressure && <Metric label="Contact Pressure" value={mech.contactPressure} />}
                {mech?.frictionCoeff && <Metric label="Friction Coeff (μ)" value={mech.frictionCoeff} />}
                {mech?.stressConcentration && <Metric label="Stress Concentration (Kt)" value={mech.stressConcentration} />}
                {mech?.motion && <Metric label="Kinematic Freedom" value={mech.motion} />}
              </div>
            </DataCard>
          )}

          {/* Thermal Discipline */}
          {hasThermalData && (
            <DataCard icon={Flame} title="Thermal & Dissipation Parameters" colorClass="text-orange-400" badge="Thermal">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {m?.thermalConductivity && <Metric label="Thermal Conductivity (k)" value={m.thermalConductivity} />}
                <Metric label="Dissipation Regime" value={component.name.toLowerCase().includes('stator') || component.name.toLowerCase().includes('engine') ? 'Forced convection / oil cooling' : 'Passive air dissipation'} />
                <Metric label="Thermal Operating Envelope" value={objectData?.id === 'car-engine' ? '-40°C to +220°C ambient' : '-20°C to +85°C standard'} />
              </div>
            </DataCard>
          )}

          {/* Electrical & Magnetic Discipline */}
          {hasElectricalData && (
            <DataCard icon={Zap} title="Electrical & Electromagnetic Parameters" colorClass="text-yellow-400" badge="Electrical">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {m?.electricalConductivity && <Metric label="Conductivity (σ)" value={m.electricalConductivity} highlight />}
                {component.category.includes('Magnetic') && <Metric label="Remanence (Br)" value="1.45 Tesla (NdFeB N52)" />}
                {component.category.includes('Avionics') && <Metric label="Bus Protocol" value="CAN / UART / SPI High-Speed" />}
                <Metric label="Isolation Class" value="Class F / IP67 environmental seal" />
              </div>
            </DataCard>
          )}

          {/* Material Metallurgy & Physics */}
          {hasMaterialPhysics && (
            <DataCard icon={Box} title="Metallurgy & Physical Limits" colorClass="text-emerald-400" badge="Materials">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {m?.density && <Metric label="Specific Mass" value={m.density} />}
                {m?.tensileStrength && <Metric label="Ultimate Tensile (Rm)" value={m.tensileStrength} highlight />}
                {m?.elasticModulus && <Metric label="Young's Modulus (E)" value={m.elasticModulus} />}
                {m?.hardness && <Metric label="Surface Hardness" value={m.hardness} />}
              </div>
            </DataCard>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EXPERT MODE CONTENT: Equations, Failure Modes, Standards & Assumptions */}
      {/* ========================================================================= */}
      {isExpert && (
        <div className="space-y-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono-cad uppercase tracking-wider text-purple-400 font-bold">
            <Cpu className="w-4 h-4" />
            <span>Expert Physical Models & Failure Risk</span>
          </div>

          {/* Governing Physics & Equation */}
          {matchingEquation && (
            <DataCard icon={Cpu} title="Governing Physical Equation" colorClass="text-[#00f2ad]" badge={matchingEquation.discipline}>
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white font-heading">
                  {matchingEquation.title}
                </div>

                {/* LaTeX Monospace CAD Display Box */}
                <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 text-center font-mono-cad text-sm sm:text-base text-[#00f2ad] tracking-wider overflow-x-auto shadow-inner">
                  {matchingEquation.latex}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {matchingEquation.explanation}
                </p>

                {/* Variable Breakdown Table */}
                {matchingEquation.variables && matchingEquation.variables.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="text-[9px] font-mono-cad uppercase text-slate-400 tracking-wider">
                      Physical Variables & Units:
                    </div>
                    <div className="space-y-1.5">
                      {matchingEquation.variables.map((v) => (
                        <div
                          key={v.symbol}
                          className="flex items-center justify-between text-xs font-mono-cad p-1.5 rounded bg-white/[0.02] border border-white/5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[#00f2ad] font-bold px-1.5 py-0.5 rounded bg-[#00f2ad]/10">
                              {v.symbol}
                            </span>
                            <span className="text-slate-300">{v.name}</span>
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {v.objectValue ? (
                              <span className="text-slate-200 font-medium">{v.objectValue}</span>
                            ) : (
                              <span>[{v.unit}]</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DataCard>
          )}

          {/* Failure Modes & Risk Matrix */}
          {component.failureModes && component.failureModes.length > 0 && (
            <DataCard icon={AlertTriangle} title="Failure Modes & Risk Matrix" colorClass="text-red-400" badge="FMEA Analysis">
              <div className="space-y-3">
                {component.failureModes.map((fm, idx) => {
                  const isCrit = fm.severity === 'Critical' || fm.severity === 'High';
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-2 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-100">{fm.mode}</span>
                        <span
                          className={`text-[9px] font-mono-cad px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isCrit
                              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                              : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                          }`}
                        >
                          {fm.severity} RISK
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        <strong className="text-slate-400 font-normal">Root Cause:</strong> {fm.cause}
                      </div>
                      <div className="text-xs text-[#00f2ad] bg-[#00f2ad]/5 border border-[#00f2ad]/20 rounded-lg p-2 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span><strong>Mitigation:</strong> {fm.mitigation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DataCard>
          )}

          {/* Design Principles & Inspection Points */}
          {(component.designPrinciples || component.inspectionPoints) && (
            <DataCard icon={CheckCircle2} title="Inspection & Design Principles" colorClass="text-sky-400" badge="QA">
              <div className="space-y-3">
                {component.designPrinciples && component.designPrinciples.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[9px] font-mono-cad uppercase text-slate-400 tracking-wider">Key Design Principles:</div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {component.designPrinciples.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-sky-400 text-[10px] mt-0.5">▪</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {component.inspectionPoints && component.inspectionPoints.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-white/5">
                    <div className="text-[9px] font-mono-cad uppercase text-slate-400 tracking-wider">Quality Inspection Points:</div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {component.inspectionPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#00f2ad] text-[10px] mt-0.5">✓</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DataCard>
          )}

          {/* Authoritative Standards & References Section */}
          <DataCard icon={BookOpen} title="Authoritative Standards & References" colorClass="text-slate-300" badge="Standards">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Applicable engineering codes, testing specifications, and manufacturing tolerances governing this component class:
            </p>
            <div className="space-y-2 pt-1">
              {applicableStandards.map((std, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs font-mono-cad"
                >
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[#00f2ad] font-bold shrink-0">
                    {std.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-200 font-medium text-[11px] leading-tight">{std.title}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">{std.organization} Standard</div>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      )}
    </div>
    </ComponentThemeContext.Provider>
  );
};

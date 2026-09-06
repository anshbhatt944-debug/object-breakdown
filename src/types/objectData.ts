export type DepthLevel = 'quick' | 'detailed' | 'engineering' | 'expert';

export type ViewMode3D =
  | 'solid'
  | 'xray'
  | 'section'
  | 'wireframe'
  | 'stress'
  | 'thermal';

export type ConfidenceLevel =
  | 'Verified'
  | 'Typical'
  | 'Estimated'
  | 'Model-dependent'
  | 'Unknown';

export interface ComponentMaterial {
  name: string;
  grade: string;
  type:
    | 'Metal'
    | 'Polymer'
    | 'Ceramic'
    | 'Composite'
    | 'Semiconductor'
    | 'Fluid'
    | 'Elastomer'
    | 'Glass';
  density: string;
  tensileStrength?: string;
  elasticModulus?: string;
  hardness?: string;
  thermalConductivity?: string;
  electricalConductivity?: string;
  wearResistance?: string;
}

export interface ComponentManufacturing {
  process: string;
  machinery: string;
  tolerance: string;
  defectRisks: string[];
  cycleTime?: string;
}

export interface ComponentDimensions {
  length?: string;
  diameter?: string;
  thickness?: string;
  weight?: string;
  formatted: string;
}

export interface MechanicalRole {
  forces?: string;
  contactPressure?: string;
  frictionCoeff?: string;
  stressConcentration?: string;
  motion?: string;
}

export interface FailureMode {
  mode: string;
  cause: string;
  mitigation: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ComponentNode {
  id: string;
  name: string;
  cadId: string;
  category: string;
  parentId?: string;
  children?: ComponentNode[];

  meshKey: string;
  explodeVector: [number, number, number];

  defaultColor: string;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;

  material: ComponentMaterial;
  function: string;
  manufacturing: ComponentManufacturing;
  dimensions: ComponentDimensions;
  mechanicalRole: MechanicalRole;

  connectedTo: string[];
  failureModes: FailureMode[];

  engineeringReason: string;
  dataConfidence: ConfidenceLevel;

  sourceMeshName?: string;
  /** Stable IDs of one or more raw uploaded meshes represented by this semantic component. */
  sourceMeshIds?: string[];
  /** Source mesh names when a semantic component groups several raw meshes. */
  sourceMeshNames?: string[];
  /** Source GLTF Object3D node names (e.g. parent groups) represented by this component. */
  sourceNodeNames?: string[];
  technicalNotes?: string[];
  inspectionPoints?: string[];
  interfaces?: string[];
  designPrinciples?: string[];

  evidence?: string;
  confidenceReason?: string;

  /** Geometry measured directly from the uploaded 3D asset, not guessed by AI. */
  geometry?: {
    dimensions: [number, number, number];
    formatted: string;
    approxBoundingVolume: string;
    triangleCount: number;
    meshCount: number;
    relativeSizePercent: number;
    center: [number, number, number];
    sourceMaterials: string[];
  };

  /** Compact semantic information inferred by the AI. */
  engineeringRole?: string;
  importance?: 'Low' | 'Medium' | 'High' | 'Critical';
  /** Hierarchy level: 0 = outer enclosure/primary chassis, 1 = secondary assembly, 2 = internal mechanism, 3 = deep component */
  assemblyDepth?: number;
  /** Explosion progress (0.00 to 0.85) at which this component annotation becomes active in 3D */
  revealThreshold?: number;
  insights?: string[];
  classificationReason?: string;
}


export function getComponentRevealThreshold(comp: {
  assemblyDepth?: number;
  importance?: 'Low' | 'Medium' | 'High' | 'Critical';
  revealThreshold?: number;
}): number {
  if (typeof comp.revealThreshold === 'number') {
    return comp.revealThreshold;
  }
  const depth = comp.assemblyDepth ?? 1;
  const impOffset =
    comp.importance === 'Critical'
      ? 0.0
      : comp.importance === 'High'
      ? 0.08
      : comp.importance === 'Medium'
      ? 0.18
      : 0.28;
  return Math.min(0.85, Number((depth * 0.22 + impOffset).toFixed(2)));
}

export interface MaterialItem {
  name: string;
  percentage: number;
  color: string;
  category: string;
  usedIn: string[];

  properties: {
    key: string;
    value: string;
  }[];

  advantages: string[];
  disadvantages: string[];
  alternatives: string[];
  selectionRationale: string;
}

export interface KinematicStep {
  step: number;
  title: string;
  description: string;
  activeComponentIds: string[];
  forcesDescription?: string;
}

export interface EngineeringEquation {
  id: string;
  title: string;

  discipline:
    | 'Mechanical'
    | 'Electrical'
    | 'Thermal'
    | 'Fluid Mechanics'
    | 'Materials';

  latex: string;
  explanation: string;

  variables: {
    symbol: string;
    name: string;
    unit: string;
    objectValue?: string;
  }[];

  interactiveCalculator?: {
    calculate: (
      inputs: Record<string, number>
    ) => {
      result: number;
      unit: string;
      formatted: string;
      interpretation: string;
    };

    inputs: {
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
      default: number;
      unit: string;
    }[];
  };
}

export interface ManufacturingStage {
  stepNumber: number;
  stageName: string;
  description: string;
  machinery: string;
  tolerance: string;
  materialReq: string;
  qualityChecks: string[];
  commonDefects: string[];
}

export interface RelationshipLink {
  sourceId: string;
  targetId: string;

  interactionType:
    | 'pushes'
    | 'rotates'
    | 'seals'
    | 'conducts'
    | 'locks'
    | 'dampens'
    | 'supports'
    | 'transfers'
    | 'couples';

  description: string;
}

export interface WhatIfParameter {
  id: string;
  label: string;
  component: string;

  min: number;
  max: number;
  defaultValue: number;
  unit: string;

  impactMetrics: {
    name: string;

    calculate: (
      val: number
    ) => {
      changePercent: number;
      valueStr: string;
      status: 'optimal' | 'warning' | 'critical';
      explanation: string;
    };
  }[];
}

export interface ObjectBreakdownData {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  heroTagline: string;
  thumbnail: string;

  complexityScore: {
    overall: number;
    mechanical: number;
    electrical: number;
    material: number;
    manufacturing: number;
    assembly: number;
  };

  stats: {
    componentCount: number;
    materialCount: number;
    manufacturingStages: number;
    movingParts: number;
    approxCostUsd: string;
    productionVolume: string;
  };

  summary: string;
  engineeringDisciplines: string[];

  rootComponents: ComponentNode[];
  materials: MaterialItem[];
  howItWorks: KinematicStep[];
  engineeringEquations: EngineeringEquation[];
  manufacturingTimeline: ManufacturingStage[];
  relationships: RelationshipLink[];
  whatIfParameters: WhatIfParameter[];

  didYouKnow: string[];

  engineersChoice: {
    title: string;
    rationale: string;
  }[];

  redesignInsights: {
    simplify: {
      title: string;
      partReduction: string;
      description: string;
      tradeoffs: string;
    };

    makeItBetter: {
      title: string;
      upgrade: string;
      performanceGain: string;
      description: string;
      tradeoffs?: string;
    };

    cheaperVersion: {
      title: string;
      costReduction: string;
      changes: string;
      tradeoffs: string;
    };
  };

  aiSuggestedQuestions: string[];

  /** Optional richer analysis for uploaded models. Existing built-in objects can omit this. */
  assemblyAnalysis?: {
    objectType: string;
    complexity: 'Low' | 'Moderate' | 'High' | 'Very High';
    primarySystems: string[];
    analysisNotes: string[];
    geometry: {
      dimensions: [number, number, number];
      formatted: string;
      approxBoundingVolume: string;
      triangleCount: number;
      meshCount: number;
      unitNote: string;
    };
  };
}

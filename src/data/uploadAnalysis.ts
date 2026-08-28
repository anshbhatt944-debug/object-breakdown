import * as THREE from 'three';
import {
  ComponentNode,
  ConfidenceLevel,
  FailureMode,
  MaterialItem,
  ObjectBreakdownData,
  RelationshipLink,
} from '../types/objectData';

interface MeshInfo {
  id: string;
  name: string;
  vertexCount: number;
  triangleCount: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  materialNames: string[];
}

type UnknownRecord = Record<string, unknown>;

interface ServerComponent {
  id?: unknown;
  name?: unknown;
  category?: unknown;

  meshIds?: unknown;
  sourceMeshIds?: unknown;

  description?: unknown;
  function?: unknown;

  engineeringRole?: unknown;
  mechanicalRole?: unknown;
  importance?: unknown;

  connectedTo?: unknown;

  material?: unknown;
  materialReason?: unknown;

  manufacturing?: unknown;
  manufacturingReason?: unknown;

  engineeringReason?: unknown;
  classificationReason?: unknown;

  insights?: unknown;
  technicalNotes?: unknown;
  inspectionPoints?: unknown;
  interfaces?: unknown;
  designPrinciples?: unknown;

  failureModes?: unknown;

  confidence?: unknown;
  confidenceReason?: unknown;
}

/* =========================================================
   BASIC HELPERS
========================================================= */

function asRecord(value: unknown): UnknownRecord {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord;
  }

  return {};
}

function asString(
  value: unknown,
  fallback = ''
): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();

  return trimmed || fallback;
}

function asStringList(
  value: unknown,
  max = 8
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, max)
    .map((item) => asString(item))
    .filter(Boolean);
}

function toConfidence(
  value: unknown
): ConfidenceLevel {
  const allowed: ConfidenceLevel[] = [
    'Verified',
    'Typical',
    'Estimated',
    'Model-dependent',
    'Unknown',
  ];

  return allowed.includes(
    value as ConfidenceLevel
  )
    ? (value as ConfidenceLevel)
    : 'Estimated';
}

function toMaterialType(
  value: unknown
): ComponentNode['material']['type'] {
  const allowed: ComponentNode['material']['type'][] =
    [
      'Metal',
      'Polymer',
      'Ceramic',
      'Composite',
      'Semiconductor',
      'Fluid',
      'Elastomer',
      'Glass',
    ];

  return allowed.includes(
    value as ComponentNode['material']['type']
  )
    ? (value as ComponentNode['material']['type'])
    : 'Composite';
}

function cleanFileName(
  fileName: string
): string {
  return fileName
    .replace(/\.(glb|gltf)$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

/* =========================================================
   GARBAGE COMPONENT PROTECTION
========================================================= */

function isGarbageComponentName(
  name: string
): boolean {
  const value = name
    .trim()
    .toLowerCase();

  if (!value) {
    return true;
  }

  const garbagePatterns = [
    /^object(?:[ _.-]*\d+)?$/,
    /^mesh(?:[ _.-]*\d+)?$/,
    /^node(?:[ _.-]*\d+)?$/,
    /^part(?:[ _.-]*\d+)?$/,
    /^component(?:[ _.-]*\d+)?$/,
    /^assembly(?:[ _.-]*\d+)?$/,
    /^group(?:[ _.-]*\d+)?$/,
    /^geometry(?:[ _.-]*\d+)?$/,
    /^unnamed(?:[ _.-]*mesh)?(?:[ _.-]*\d+)?$/,
    /^detected[ _.-]*component(?:[ _.-]*\d+)?$/,
    /^spatial[ _.-]*assembly(?:[ _.-]*\d+)?$/,
    /^uploaded[ _.-]*geometry(?:[ _.-]*\d+)?$/,
    /^unmapped(?:[ _.-]*uploaded)?(?:[ _.-]*geometry)?(?:[ _.-]*\d+)?$/,
    /^model[ _.-]*component(?:[ _.-]*\d+)?$/,
  ];

  return garbagePatterns.some(
    (pattern) =>
      pattern.test(value)
  );
}

function isMeaningfulComponentName(
  name: string
): boolean {
  return (
    name.trim().length >= 3 &&
    !isGarbageComponentName(name)
  );
}

/* =========================================================
   MESH EXTRACTION
========================================================= */

function createMeshId(
  index: number
): string {
  return `upload-mesh-${String(
    index + 1
  ).padStart(3, '0')}`;
}

function getSceneMeshes(
  scene: THREE.Object3D
): MeshInfo[] {
  const meshes: MeshInfo[] = [];
  let meshIndex = 0;

  scene.updateMatrixWorld(true);

  scene.traverse((object) => {
    if (
      !(object instanceof THREE.Mesh) ||
      !object.geometry
    ) {
      return;
    }

    const geometry =
      object.geometry;

    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }

    if (!geometry.boundingBox) {
      return;
    }

    const size =
      geometry.boundingBox.getSize(
        new THREE.Vector3()
      );

    const worldScale =
      object.getWorldScale(
        new THREE.Vector3()
      );

    const position =
      object.getWorldPosition(
        new THREE.Vector3()
      );

    const positionAttribute =
      geometry.getAttribute(
        'position'
      );

    const vertexCount =
      positionAttribute?.count ?? 0;

    const indexCount =
      geometry.index?.count ??
      vertexCount;

    const materials =
      Array.isArray(object.material)
        ? object.material
        : [object.material];

    meshes.push({
      id: createMeshId(
        meshIndex
      ),

      name:
        object.name?.trim() ||
        `Unnamed Mesh ${
          meshIndex + 1
        }`,

      vertexCount,

      triangleCount:
        Math.floor(
          indexCount / 3
        ),

      position: {
        x: Number(
          position.x.toFixed(3)
        ),
        y: Number(
          position.y.toFixed(3)
        ),
        z: Number(
          position.z.toFixed(3)
        ),
      },

      dimensions: {
        x: Number(
          Math.abs(
            size.x *
              worldScale.x
          ).toFixed(3)
        ),
        y: Number(
          Math.abs(
            size.y *
              worldScale.y
          ).toFixed(3)
        ),
        z: Number(
          Math.abs(
            size.z *
              worldScale.z
          ).toFixed(3)
        ),
      },

      materialNames:
        materials
          .map(
            (
              material,
              materialIndex
            ) =>
              material?.name?.trim() ||
              `Material ${
                materialIndex + 1
              }`
          )
          .filter(Boolean),
    });

    meshIndex += 1;
  });

  return meshes;
}

/* =========================================================
   SCENE BOUNDS
========================================================= */

function getSceneBounds(
  scene: THREE.Object3D
): {
  width: number;
  height: number;
  depth: number;
} {
  scene.updateMatrixWorld(true);

  const box =
    new THREE.Box3().setFromObject(
      scene
    );

  const size =
    box.getSize(
      new THREE.Vector3()
    );

  return {
    width: Number(
      size.x.toFixed(3)
    ),
    height: Number(
      size.y.toFixed(3)
    ),
    depth: Number(
      size.z.toFixed(3)
    ),
  };
}

/* =========================================================
   EXPLODE VECTOR
========================================================= */

function getExplodeVector(
  index: number,
  count: number
): [number, number, number] {
  if (count <= 1) {
    return [0, 0, 0];
  }

  const angle =
    (Math.PI * 2 * index) /
    count;

  return [
    Number(
      Math.cos(angle).toFixed(3)
    ),
    0.18,
    Number(
      Math.sin(angle).toFixed(3)
    ),
  ];
}

/* =========================================================
   FAILURE MODES
========================================================= */

function makeFailureModes(
  value: unknown
): FailureMode[] {
  if (Array.isArray(value)) {
    const parsed: FailureMode[] = [];

    value
      .slice(0, 2)
      .forEach((item) => {
        const record =
          asRecord(item);

        const mode =
          asString(
            record.issue ??
              record.mode
          );

        if (!mode) {
          return;
        }

        const severityText =
          asString(
            record.severity,
            'Medium'
          );

        const severity:
          FailureMode['severity'] =
          ['Low', 'Medium', 'High', 'Critical'].includes(
            severityText
          )
            ? (severityText as FailureMode['severity'])
            : 'Medium';

        parsed.push({
          mode,

          cause:
            asString(
              record.cause,
              'Wear, overload, impact or environmental exposure.'
            ),

          mitigation:
            asString(
              record.mitigation ??
                record.effect,
              'Inspect the component and repair or replace it if function is affected.'
            ),

          severity,
        });
      });

    if (parsed.length) {
      return parsed;
    }
  }

  return [
    {
      mode:
        'Wear or damage at interfaces',

      cause:
        'Repeated use, impact, overload or environmental exposure.',

      mitigation:
        'Inspect contact surfaces and replace damaged parts before function is compromised.',

      severity:
        'Medium',
    },
  ];
}

/* =========================================================
   COMPONENT GEOMETRY
========================================================= */

function meshGeometry(
  meshes: MeshInfo[],
  sourceMeshIds: string[]
) {
  const selected =
    meshes.filter(
      (mesh) =>
        sourceMeshIds.includes(
          mesh.id
        )
    );

  if (!selected.length) {
    throw new Error(
      'Component has no valid source mesh IDs.'
    );
  }

  const min = {
    x: Infinity,
    y: Infinity,
    z: Infinity,
  };

  const max = {
    x: -Infinity,
    y: -Infinity,
    z: -Infinity,
  };

  for (const mesh of selected) {
    const half = {
      x:
        mesh.dimensions.x /
        2,

      y:
        mesh.dimensions.y /
        2,

      z:
        mesh.dimensions.z /
        2,
    };

    min.x =
      Math.min(
        min.x,
        mesh.position.x -
          half.x
      );

    min.y =
      Math.min(
        min.y,
        mesh.position.y -
          half.y
      );

    min.z =
      Math.min(
        min.z,
        mesh.position.z -
          half.z
      );

    max.x =
      Math.max(
        max.x,
        mesh.position.x +
          half.x
      );

    max.y =
      Math.max(
        max.y,
        mesh.position.y +
          half.y
      );

    max.z =
      Math.max(
        max.z,
        mesh.position.z +
          half.z
      );
  }

  const dimensions:
    [number, number, number] =
    [
      Number(
        (
          max.x - min.x
        ).toFixed(3)
      ),

      Number(
        (
          max.y - min.y
        ).toFixed(3)
      ),

      Number(
        (
          max.z - min.z
        ).toFixed(3)
      ),
    ];

  const volume =
    dimensions[0] *
    dimensions[1] *
    dimensions[2];

  const totalVolume =
    meshes.reduce(
      (
        sum,
        mesh
      ) =>
        sum +
        mesh.dimensions.x *
          mesh.dimensions.y *
          mesh.dimensions.z,
      0
    ) || 1;

  const center:
    [number, number, number] =
    [
      Number(
        (
          (min.x + max.x) /
          2
        ).toFixed(3)
      ),

      Number(
        (
          (min.y + max.y) /
          2
        ).toFixed(3)
      ),

      Number(
        (
          (min.z + max.z) /
          2
        ).toFixed(3)
      ),
    ];

  return {
    dimensions,

    formatted:
      `${dimensions[0]} × ${dimensions[1]} × ${dimensions[2]} model units`,

    approxBoundingVolume:
      `${volume.toFixed(
        3
      )} model units³`,

    triangleCount:
      selected.reduce(
        (
          sum,
          mesh
        ) =>
          sum +
          mesh.triangleCount,
        0
      ),

    meshCount:
      selected.length,

    relativeSizePercent:
      Number(
        Math.min(
          100,
          (volume /
            totalVolume) *
            100
        ).toFixed(1)
      ),

    center,

    sourceMaterials:
      [
        ...new Set(
          selected.flatMap(
            (mesh) =>
              mesh.materialNames
          )
        ),
      ],
  };
}

/* =========================================================
   COMPONENT CONVERSION
========================================================= */

function makeComponentNode(
  raw: ServerComponent,
  index: number,
  count: number,
  meshes: MeshInfo[],
  sourceMeshIds: string[]
): ComponentNode {
  const materialRecord =
    asRecord(
      raw.material
    );

  const manufacturingRecord =
    asRecord(
      raw.manufacturing
    );

  const confidence =
    toConfidence(
      raw.confidence
    );

  const geometry =
    meshGeometry(
      meshes,
      sourceMeshIds
    );

  const sourceMeshNames =
    meshes
      .filter(
        (mesh) =>
          sourceMeshIds.includes(
            mesh.id
          )
      )
      .map(
        (mesh) =>
          mesh.name
      );

  const materialName =
    asString(
      materialRecord.name,
      'Likely engineering material'
    );

  const materialType =
    toMaterialType(
      materialRecord.category
    );

  const materialReason =
    asString(
      raw.materialReason,
      'Material is estimated from visible geometry and typical product construction.'
    );

  const importanceText =
    asString(
      raw.importance,
      'Medium'
    );

  const importance:
    ComponentNode['importance'] =
    ['Low', 'Medium', 'High', 'Critical'].includes(
      importanceText
    )
      ? (importanceText as ComponentNode['importance'])
      : 'Medium';

  return {
    id:
      asString(
        raw.id,
        `component-${
          index + 1
        }`
      ),

    name:
      asString(
        raw.name,
        `Component ${
          index + 1
        }`
      ),

    cadId:
      `A1-${String(
        index + 1
      ).padStart(
        3,
        '0'
      )}`,

    category:
      asString(
        raw.category,
        'Mechanical'
      ),

    meshKey:
      sourceMeshIds[0],

    explodeVector:
      getExplodeVector(
        index,
        count
      ),

    defaultColor:
      '#94a3b8',

    roughness:
      0.42,

    metalness:
      0.18,

    material: {
      name:
        materialName,

      grade:
        confidence ===
        'Verified'
          ? 'Model metadata / verified'
          : 'Likely / estimated',

      type:
        materialType,

      density:
        'Model-dependent',

      wearResistance:
        materialReason,
    },

    function:
      asString(
        raw.function,
        'Contributes to the assembled object’s primary function.'
      ),

    manufacturing: {
      process:
        asString(
          manufacturingRecord.process,
          'Model-dependent manufacturing process'
        ),

      machinery:
        'Not verified from the uploaded asset',

      tolerance:
        asString(
          manufacturingRecord.tolerance,
          'Model-dependent'
        ),

      defectRisks: [
        'Dimensional variation',
        'Assembly misalignment',
      ],
    },

    dimensions: {
      formatted:
        geometry.formatted,
    },

    mechanicalRole: {
      forces:
        asString(
          raw.mechanicalRole ??
            raw.engineeringRole,
          'Supports or transmits local loads within the assembly.'
        ),
    },

    connectedTo:
      asStringList(
        raw.connectedTo,
        8
      ),

    failureModes:
      makeFailureModes(
        raw.failureModes
      ),

    engineeringReason:
      asString(
        raw.engineeringReason,
        'Geometry and placement support the identified functional role within the overall assembly.'
      ),

    dataConfidence:
      confidence,

    sourceMeshName:
      sourceMeshNames[0],

    sourceMeshIds:
      sourceMeshIds,

    sourceMeshNames:
      sourceMeshNames,

    technicalNotes:
      [
        ...asStringList(
          raw.technicalNotes,
          4
        ),

        ...asStringList(
          raw.insights,
          4
        ),
      ].slice(
        0,
        6
      ),

    inspectionPoints:
      asStringList(
        raw.inspectionPoints,
        5
      ),

    interfaces:
      asStringList(
        raw.interfaces,
        5
      ),

    designPrinciples:
      asStringList(
        raw.designPrinciples,
        5
      ),

    evidence:
      `Mapped to ${
        sourceMeshIds.length
      } uploaded mesh${
        sourceMeshIds.length ===
        1
          ? ''
          : 'es'
      } using semantic analysis and model geometry.`,

    confidenceReason:
      asString(
        raw.confidenceReason,
        'Estimated from the rendered model and available mesh geometry.'
      ),

    geometry,

    engineeringRole:
      asString(
        raw.engineeringRole,
        'Support'
      ),

    importance,

    insights:
      asStringList(
        raw.insights,
        5
      ),

    classificationReason:
      asString(
        raw.classificationReason,
        'Grouped from spatially and functionally related uploaded meshes.'
      ),
  };
}

/* =========================================================
   MATERIAL SUMMARY
========================================================= */

function buildMaterials(
  components: ComponentNode[]
): MaterialItem[] {
  const groups =
    new Map<
      string,
      ComponentNode[]
    >();

  components.forEach(
    (component) => {
      const key =
        component.material
          .name ||
        'Likely engineering material';

      groups.set(
        key,
        [
          ...(groups.get(
            key
          ) || []),
          component,
        ]
      );
    }
  );

  const total =
    Math.max(
      components.length,
      1
    );

  return Array.from(
    groups.entries()
  ).map(
    (
      [name, nodes],
      index
    ) => ({
      name,

      percentage:
        Number(
          (
            (nodes.length /
              total) *
            100
          ).toFixed(1)
        ),

      color:
        [
          '#94a3b8',
          '#64748b',
          '#a78bfa',
          '#22d3ee',
          '#f59e0b',
        ][index % 5],

      category:
        nodes[0].material
          .type,

      usedIn:
        nodes.map(
          (node) =>
            node.name
        ),

      properties: [
        {
          key:
            'Confidence',

          value:
            nodes[0]
              .dataConfidence,
        },
      ],

      advantages: [
        'Selected or inferred for the component’s visible engineering role.',
      ],

      disadvantages: [
        'Exact composition cannot be verified from mesh geometry alone.',
      ],

      alternatives: [],

      selectionRationale:
        nodes[0].material
          .wearResistance ||
        'Estimated from the uploaded model and typical product construction.',
    })
  );
}

/* =========================================================
   RELATIONSHIPS
========================================================= */

function buildRelationships(
  components: ComponentNode[]
): RelationshipLink[] {
  const valid =
    new Set(
      components.map(
        (component) =>
          component.id
      )
    );

  const links:
    RelationshipLink[] = [];

  components.forEach(
    (component) => {
      component.connectedTo
        .filter(
          (id) =>
            valid.has(id) &&
            id !==
              component.id
        )
        .forEach(
          (targetId) => {
            links.push({
              sourceId:
                component.id,

              targetId,

              interactionType:
                'couples',

              description:
                `${component.name} interfaces with the connected assembly as identified during semantic analysis.`,
            });
          }
        );
    }
  );

  return links;
}

/* =========================================================
   OBJECT BUILDER
========================================================= */

function buildObjectData(
  options: {
    id: string;

    name: string;

    category: string;

    summary: string;

    components:
      ComponentNode[];

    meshes:
      MeshInfo[];

    bounds: {
      width: number;
      height: number;
      depth: number;
    };

    engineeringDisciplines?:
      string[];

    primarySystems?:
      string[];

    analysisNotes?:
      string[];

    complexity?:
      | 'Low'
      | 'Moderate'
      | 'High'
      | 'Very High';

    suggestedQuestions?:
      string[];

    didYouKnow?:
      string[];
  }
): ObjectBreakdownData {
  const triangleCount =
    options.meshes.reduce(
      (
        sum,
        mesh
      ) =>
        sum +
        mesh.triangleCount,
      0
    );

  const materials =
    buildMaterials(
      options.components
    );

  const relationships =
    buildRelationships(
      options.components
    );

  return {
    id:
      options.id,

    name:
      options.name,

    category:
      options.category,

    subtitle:
      'Uploaded 3D semantic engineering analysis',

    heroTagline:
      options.summary,

    thumbnail:
      '',

    complexityScore: {
      overall:
        Math.min(
          100,
          25 +
            options.components
              .length *
              7
        ),

      mechanical:
        60,

      electrical:
        25,

      material:
        55,

      manufacturing:
        50,

      assembly:
        Math.min(
          100,
          30 +
            options.components
              .length *
              7
        ),
    },

    stats: {
      componentCount:
        options.components
          .length,

      materialCount:
        materials.length,

      manufacturingStages:
        0,

      movingParts:
        0,

      approxCostUsd:
        'Model-dependent',

      productionVolume:
        'Unknown',
    },

    summary:
      options.summary,

    engineeringDisciplines:
      options
        .engineeringDisciplines
        ?.length
        ? options.engineeringDisciplines
        : [
            'Mechanical Engineering',
            'Industrial Design',
            'Materials Engineering',
          ],

    rootComponents:
      options.components,

    materials,

    howItWorks: [],

    engineeringEquations: [],

    manufacturingTimeline: [],

    relationships,

    whatIfParameters: [],

    didYouKnow:
      options.didYouKnow
        ?.length
        ? options.didYouKnow
        : [
            `The uploaded asset contains ${options.meshes.length} renderable meshes and ${triangleCount.toLocaleString()} triangles.`,
          ],

    engineersChoice: [],

    redesignInsights: {
      simplify: {
        title:
          'Model-dependent simplification',

        partReduction:
          'Requires verified bill of materials',

        description:
          'Use the semantic component groups to identify assemblies that may be consolidated after validating real manufacturing constraints.',

        tradeoffs:
          'Part reduction can reduce serviceability and increase tooling complexity.',
      },

      makeItBetter: {
        title:
          'Target interface durability',

        upgrade:
          'Validate high-wear and high-load interfaces with real material and load data.',

        performanceGain:
          'Potentially improved durability and service life.',

        description:
          'The uploaded geometry provides structure, but material verification is required before quantitative redesign recommendations.',

        tradeoffs:
          'Higher-performance materials can increase cost and manufacturing complexity.',
      },

      cheaperVersion: {
        title:
          'Manufacturing cost review',

        costReduction:
          'Model-dependent',

        changes:
          'Review grouped assemblies for reduced part count and simplified manufacturing operations.',

        tradeoffs:
          'Cost reduction may affect finish, stiffness, durability or serviceability.',
      },
    },

    aiSuggestedQuestions:
      options
        .suggestedQuestions
        ?.length
        ? options.suggestedQuestions
        : [
            'Which component carries the highest structural load?',
            'Which assemblies are most likely to require inspection or service?',
          ],

    assemblyAnalysis: {
      objectType:
        options.category,

      complexity:
        options.complexity ||
        'Moderate',

      primarySystems:
        options.primarySystems
          ?.length
          ? options.primarySystems
          : options.components
              .slice(
                0,
                6
              )
              .map(
                (component) =>
                  component.category
              ),

      analysisNotes:
        options.analysisNotes ||
        [],

      geometry: {
        dimensions: [
          options.bounds.width,
          options.bounds.height,
          options.bounds.depth,
        ],

        formatted:
          `${options.bounds.width} × ${options.bounds.height} × ${options.bounds.depth} model units`,

        approxBoundingVolume:
          `${(
            options.bounds.width *
            options.bounds.height *
            options.bounds.depth
          ).toFixed(
            3
          )} model units³`,

        triangleCount,

        meshCount:
          options.meshes.length,

        unitNote:
          'Dimensions are reported in the source model’s coordinate units.',
      },
    },
  };
}

/* =========================================================
   MESH ID NORMALIZATION
========================================================= */

function normalizeMeshIds(
  value: unknown,
  validMeshIds: Set<string>
): string[] {
  return asStringList(
    value,
    100
  ).filter(
    (id, index, list) =>
      validMeshIds.has(
        id
      ) &&
      list.indexOf(id) ===
        index
  );
}

/* =========================================================
   GEOMETRY-ONLY FALLBACK
========================================================= */

export function analyzeUploadedScene(
  scene: THREE.Object3D,
  fileName: string
): ObjectBreakdownData {
  const meshes =
    getSceneMeshes(scene);

  if (!meshes.length) {
    throw new Error(
      'The uploaded model contains no visible mesh geometry.'
    );
  }

  const bounds =
    getSceneBounds(scene);

  /*
   * IMPORTANT:
   *
   * Do NOT manufacture:
   *   Spatial Assembly 1
   *   Spatial Assembly 2
   *   Object_11
   *
   * when AI is unavailable.
   *
   * One honest assembly is much better than
   * pretending arbitrary mesh partitions are
   * meaningful engineering components.
   */
  const components:
    ComponentNode[] = [
      makeComponentNode(
        {
          id:
            'component-1',

          name:
            'Uploaded Model Assembly',

          category:
            'Structural',

          description:
            'Complete uploaded model treated as one assembly because semantic AI identification was unavailable.',

          function:
            'Represents the complete uploaded object without inventing individual component identities.',

          engineeringRole:
            'Structural',

          material: {
            name:
              'Model-dependent material',

            category:
              'Composite',
          },

          materialReason:
            'Exact material cannot be verified from geometry alone.',

          manufacturing: {
            process:
              'Model-dependent',

            tolerance:
              'Model-dependent',
          },

          engineeringReason:
            'The complete geometry remains inspectable without fabricating unsupported component identities.',

          classificationReason:
            'All visible meshes are retained as one honest assembly because semantic separation was unavailable.',

          insights: [
            'Geometry remains available for inspection and measurement.',
            'No arbitrary mesh fragments are promoted to named engineering parts.',
          ],

          inspectionPoints: [
            'Inspect visible interfaces and geometry boundaries.',
          ],

          confidence:
            'Model-dependent',

          confidenceReason:
            'Generated without a semantic AI response.',
        },

        0,

        1,

        meshes,

        meshes.map(
          (mesh) =>
            mesh.id
        )
      ),
    ];

  return buildObjectData({
    id:
      `uploaded-${Date.now()}`,

    name:
      cleanFileName(
        fileName
      ) ||
      'Uploaded 3D Object',

    category:
      'Uploaded 3D Model',

    summary:
      `Geometry-level engineering representation of an uploaded ${meshes.length}-mesh model.`,

    components,

    meshes,

    bounds,

    complexity:
      'Moderate',

    analysisNotes: [
      'AI semantic analysis was unavailable, so the system intentionally avoided inventing individual component identities.',
    ],
  });
}

/* =========================================================
   AI ANALYSIS
========================================================= */

export async function analyzeUploadedModelWithAI(
  scene: THREE.Object3D,
  fileName: string
): Promise<ObjectBreakdownData> {
  const meshes =
    getSceneMeshes(scene);

  if (!meshes.length) {
    throw new Error(
      'The uploaded model contains no visible mesh geometry.'
    );
  }

  const bounds =
    getSceneBounds(scene);

  /*
   * IMPORTANT:
   *
   * Do not send the giant analysis prompt from
   * the browser. The server owns that prompt.
   *
   * This keeps the API request smaller.
   */
  const response =
    await fetch(
      '/api/analyze-model',
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            fileName,

            objectNameHint:
              cleanFileName(
                fileName
              ),

            sceneBounds:
              bounds,

            meshCount:
              meshes.length,

            meshes,
          }),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `AI upload analysis failed (${response.status}): ${errorText}`
    );
  }

  const payload:
    unknown =
    await response.json();

  const payloadRecord =
    asRecord(payload);

  /*
   * Accept:
   *   { analysis: {...} }
   *   { result: {...} }
   *   { content: {...} }
   *   or the analysis object itself.
   */
  const analysis =
    payloadRecord.analysis ??
    payloadRecord.result ??
    payloadRecord.content ??
    payload;

  const analysisRecord =
    asRecord(
      analysis
    );

  if (
    !Array.isArray(
      analysisRecord.components
    )
  ) {
    throw new Error(
      'The AI server returned an invalid analysis structure.'
    );
  }

  const validMeshIds =
    new Set(
      meshes.map(
        (mesh) =>
          mesh.id
      )
    );

  const usedMeshIds =
    new Set<string>();

  const rawComponents =
    analysisRecord
      .components as unknown[];

  const components:
    ComponentNode[] = [];

  /*
   * Maximum of 8 meaningful components.
   *
   * We NEVER create extra components for
   * leftover meshes.
   */
  for (
    const value of rawComponents
  ) {
    if (
      components.length >=
      8
    ) {
      break;
    }

    const raw =
      asRecord(
        value
      ) as ServerComponent;

    const name =
      asString(
        raw.name,
        ''
      );

    /*
     * Filter garbage names BEFORE adding
     * anything to the component list.
     */
    if (
      !isMeaningfulComponentName(
        name
      )
    ) {
      continue;
    }

    let sourceMeshIds =
      normalizeMeshIds(
        raw.sourceMeshIds ??
          raw.meshIds,
        validMeshIds
      );

    /*
     * Each uploaded mesh should normally
     * belong to only one semantic component.
     */
    sourceMeshIds =
      sourceMeshIds.filter(
        (id) =>
          !usedMeshIds.has(
            id
          )
      );

    /*
     * CRITICAL:
     *
     * DO NOT do this:
     *
     * const next = meshes.find(...)
     * sourceMeshIds = [next.id]
     *
     * That was creating random fake components.
     *
     * If AI did not map a component to real
     * geometry, discard it.
     */
    if (
      !sourceMeshIds.length
    ) {
      continue;
    }

    sourceMeshIds.forEach(
      (id) =>
        usedMeshIds.add(
          id
        )
    );

    const component =
      makeComponentNode(
        raw,

        components.length,

        Math.max(
          1,
          Math.min(
            8,
            rawComponents.length
          )
        ),

        meshes,

        sourceMeshIds
      );

    /*
     * Final protection against bad names.
     */
    if (
      !isMeaningfulComponentName(
        component.name
      )
    ) {
      continue;
    }

    components.push(
      component
    );
  }

  if (!components.length) {
    throw new Error(
      'No meaningful AI components matched valid mesh IDs.'
    );
  }

  /*
   * Clean component relationships so
   * they only point to components that
   * actually survived filtering.
   */
  const validComponentIds =
    new Set(
      components.map(
        (component) =>
          component.id
      )
    );

  components.forEach(
    (component) => {
      component.connectedTo =
        component.connectedTo.filter(
          (id) =>
            validComponentIds.has(
              id
            ) &&
            id !==
              component.id
        );
    }
  );

  return buildObjectData({
    id:
      `uploaded-ai-${Date.now()}`,

    name:
      asString(
        analysisRecord.objectName,
        cleanFileName(
          fileName
        ) ||
          'Uploaded 3D Object'
      ),

    category:
      asString(
        analysisRecord.objectCategory ??
          analysisRecord.objectType,
        'Uploaded 3D Model'
      ),

    summary:
      asString(
        analysisRecord.objectSummary ??
          analysisRecord.overallDescription,
        'AI-generated semantic engineering breakdown of the uploaded 3D model.'
      ),

    components,

    meshes,

    bounds,

    engineeringDisciplines:
      asStringList(
        analysisRecord
          .engineeringDisciplines,
        6
      ),

    primarySystems:
      asStringList(
        analysisRecord.primarySystems,
        8
      ),

    analysisNotes:
      asStringList(
        analysisRecord.analysisNotes,
        6
      ),

    complexity:
      [
        'Low',
        'Moderate',
        'High',
        'Very High',
      ].includes(
        asString(
          analysisRecord.complexity
        )
      )
        ? (asString(
            analysisRecord.complexity
          ) as
            | 'Low'
            | 'Moderate'
            | 'High'
            | 'Very High')
        : 'Moderate',

    suggestedQuestions:
      asStringList(
        analysisRecord
          .suggestedQuestions,
        5
      ),

    didYouKnow:
      asStringList(
        analysisRecord.didYouKnow,
        3
      ),
  });
}
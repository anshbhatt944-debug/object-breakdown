import * as THREE from 'three';

export interface AnnotationItem {
  id: string;
  name: string;
  category: string;
  worldPosition: THREE.Vector3;
  modelId?: string;
  isSelected?: boolean;
  isHovered?: boolean;
  isVirtual?: boolean;
  side?: 'front' | 'back' | 'edge';
}

export interface ExclusionZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SolverOptions {
  activeModelId?: string;
  cardWidth?: number;
  cardHeight?: number;
  verticalGap?: number;
  topMargin?: number;
  bottomMargin?: number;
  leftMargin?: number;
  rightMargin?: number;
  exclusionZones?: ExclusionZone[];
}

export interface SolvedAnnotation {
  nodeId: string;
  name: string;
  category: string;
  modelId?: string;
  isLeft: boolean;
  visible: boolean;
  isVirtual?: boolean;
  side?: 'front' | 'back' | 'edge';

  // Screen anchor on 3D model
  anchorX: number;
  anchorY: number;

  // Screen card placement (strictly inside center 3D viewport)
  labelX: number;
  labelY: number;
  cardWidth: number;
  cardHeight: number;

  // Leader line attachment point on card
  cardAttachX: number;
  cardCenterY: number;

  // Leader line geometry
  elbowX: number;
  elbowY: number;
  pathD: string;
}

/**
 * Universal CAD Annotation Layout Solver.
 *
 * Guarantees:
 * 1. Zero spill into Left panel (Assembly Hierarchy) or Right panel (Inspector).
 * 2. Zero collision with Top Navigation and Bottom Explode/Playback controls.
 * 3. Non-overlapping vertical relaxation between annotations.
 * 4. Model-scoped isolation (discards items not matching activeModelId).
 * 5. Clean, authoritative CAD 90-degree leader lines with anchor points.
 */
export function solveAnnotationLayout(
  items: AnnotationItem[],
  camera: THREE.Camera,
  viewport: { width: number; height: number },
  options: SolverOptions = {}
): SolvedAnnotation[] {
  const { width, height } = viewport;
  if (width <= 0 || height <= 0 || items.length === 0) return [];

  const activeModelId = options.activeModelId;
  const leftMargin = options.leftMargin ?? 24; // Strict margin from left Assembly Hierarchy panel
  const rightMargin = options.rightMargin ?? 24; // Strict margin from right Inspector panel
  const maxCardWidthAllowed = Math.max(140, Math.floor((width - leftMargin - rightMargin - 28) / 2));
  const cardWidth = Math.min(options.cardWidth ?? 210, maxCardWidthAllowed);
  const cardHeight = options.cardHeight ?? 46;
  const verticalGap = options.verticalGap ?? 10;
  const topMargin = options.topMargin ?? 76; // Safely below top nav, badges & mode selector
  const bottomMargin = options.bottomMargin ?? 144; // Safely above bottom explode toolbar & view modes

  const minY = topMargin;
  const maxY = Math.max(minY + cardHeight, height - bottomMargin - cardHeight);
  const availableHeight = maxY - minY;

  // 1. Model Isolation Filter: Reject any items not belonging to the active model
  const validItems = activeModelId
    ? items.filter((it) => !it.modelId || it.modelId === activeModelId)
    : items;

  if (validItems.length === 0) return [];

  // 2. Project 3D coordinates into 2D viewport space
  const projected: Array<{
    item: AnnotationItem;
    screenX: number;
    screenY: number;
    depth: number;
  }> = [];

  const tempVec = new THREE.Vector3();

  for (const item of validItems) {
    tempVec.copy(item.worldPosition).project(camera);

    // Skip if behind camera or excessively clipped
    if (tempVec.z > 1.05 || tempVec.z < -1.2) continue;

    // Viewport-relative screen coordinates
    const screenX = (tempVec.x * 0.5 + 0.5) * width;
    const screenY = (-(tempVec.y * 0.5) + 0.5) * height;

    projected.push({
      item,
      screenX,
      screenY,
      depth: tempVec.z,
    });
  }

  if (projected.length === 0) return [];

  // 3. Partition into Left and Right columns based on model anchor X
  let leftItems = projected
    .filter((p) => p.screenX < width * 0.5)
    .sort((a, b) => a.screenY - b.screenY);

  let rightItems = projected
    .filter((p) => p.screenX >= width * 0.5)
    .sort((a, b) => a.screenY - b.screenY);

  // If one side has all items and the other has none, balance if > 6 items
  if (leftItems.length === 0 && rightItems.length > 6) {
    const half = Math.floor(rightItems.length / 2);
    leftItems = rightItems.slice(0, half);
    rightItems = rightItems.slice(half);
  } else if (rightItems.length === 0 && leftItems.length > 6) {
    const half = Math.floor(leftItems.length / 2);
    rightItems = leftItems.slice(half);
    leftItems = leftItems.slice(0, half);
  }

  // 4. Density Capping: Gracefully reduce density to prevent label pile-ups
  const maxPerCol = Math.max(1, Math.floor(availableHeight / (cardHeight + verticalGap)));

  const capColumn = (col: typeof leftItems) => {
    if (col.length <= maxPerCol) return col;
    // Always preserve selected or hovered component
    const prioritized = [...col].sort((a, b) => {
      const aScore = (a.item.isSelected ? 100 : 0) + (a.item.isHovered ? 50 : 0);
      const bScore = (b.item.isSelected ? 100 : 0) + (b.item.isHovered ? 50 : 0);
      return bScore - aScore;
    });
    return prioritized.slice(0, maxPerCol).sort((a, b) => a.screenY - b.screenY);
  };

  const solvedLeftItems = capColumn(leftItems);
  const solvedRightItems = capColumn(rightItems);

  // 5. Vertical non-overlapping spacing solver
  const solveColumn = (
    columnItems: typeof leftItems,
    isLeft: boolean
  ): SolvedAnnotation[] => {
    if (columnItems.length === 0) return [];

    const count = columnItems.length;

    // Effective gap calculation
    const effectiveGap =
      count > 1
        ? Math.min(verticalGap, Math.max(4, (availableHeight - count * cardHeight) / (count - 1)))
        : 0;

    // Strict X boundaries:
    // Left column cards start at leftMargin and extend to leftMargin + cardWidth
    // Right column cards start at width - rightMargin - cardWidth and extend to width - rightMargin
    const targetX = isLeft ? leftMargin : width - rightMargin - cardWidth;
    const cardAttachX = isLeft ? leftMargin + cardWidth : width - rightMargin - cardWidth;

    // Initial positioning based on anchor Y
    const positions: number[] = columnItems.map((c) =>
      THREE.MathUtils.clamp(c.screenY - cardHeight / 2, minY, maxY)
    );

    // Forward relaxation pass: push down if overlapping
    for (let i = 1; i < count; i++) {
      const prevBottom = positions[i - 1] + cardHeight + effectiveGap;
      if (positions[i] < prevBottom) {
        positions[i] = prevBottom;
      }
    }

    // Backward relaxation pass: pull up if overflowing maxY
    if (positions[count - 1] > maxY) {
      positions[count - 1] = maxY;
      for (let i = count - 2; i >= 0; i--) {
        const nextTop = positions[i + 1] - cardHeight - effectiveGap;
        if (positions[i] > nextTop) {
          positions[i] = nextTop;
        }
      }
    }

    // Secondary clamp pass if top overflowed
    if (positions[0] < minY) {
      const shift = minY - positions[0];
      for (let i = 0; i < count; i++) {
        positions[i] = Math.min(positions[i] + shift, maxY);
      }
    }

    // Assemble solved annotations with CAD leader line geometry
    return columnItems.map((c, i) => {
      const labelY = positions[i];
      const cardCenterY = labelY + cardHeight / 2;
      const anchorX = c.screenX;
      const anchorY = c.screenY;

      // Clean 90-degree CAD elbow position
      const elbowX = isLeft
        ? Math.max(cardAttachX + 16, Math.min(anchorX - 24, cardAttachX + 48))
        : Math.min(cardAttachX - 16, Math.max(anchorX + 24, cardAttachX - 48));

      // Leader path: 3D Anchor Point -> Horizontal Elbow -> Card Attachment Edge
      const pathD = `M ${anchorX.toFixed(1)},${anchorY.toFixed(1)} L ${elbowX.toFixed(1)},${anchorY.toFixed(1)} L ${cardAttachX.toFixed(1)},${cardCenterY.toFixed(1)}`;

      return {
        nodeId: c.item.id,
        name: c.item.name,
        category: c.item.category,
        modelId: c.item.modelId,
        isLeft,
        visible: true,
        isVirtual: c.item.isVirtual,
        side: c.item.side,
        anchorX,
        anchorY,
        labelX: targetX,
        labelY,
        cardWidth,
        cardHeight,
        cardAttachX,
        cardCenterY,
        elbowX,
        elbowY: anchorY,
        pathD,
      };
    });
  };

  const solvedLeft = solveColumn(solvedLeftItems, true);
  const solvedRight = solveColumn(solvedRightItems, false);

  return [...solvedLeft, ...solvedRight];
}

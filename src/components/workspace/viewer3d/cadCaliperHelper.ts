import * as THREE from 'three';

/**
 * High-Precision 3D CAD Caliper & Bounding Box Engine
 * Renders authentic CAD metrology corner brackets, dashed boundary projection lines,
 * and axis measurement indicators directly in 3D WebGL space.
 */

export function createCADCaliperBox(box: THREE.Box3, accentColor: string): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cad-caliper-measurement-overlay';

  const min = box.min;
  const max = box.max;
  const size = new THREE.Vector3().subVectors(max, min);

  // Avoid creating calipers on zero-sized or invalid bounds
  if (size.x <= 0.001 && size.y <= 0.001 && size.z <= 0.001) {
    return group;
  }

  // Corner bracket arm length: 18% of min dimension, clamped
  const minDim = Math.min(size.x, size.y, size.z);
  const maxDim = Math.max(size.x, size.y, size.z);
  const armLen = Math.max(0.04, Math.min(minDim * 0.28, maxDim * 0.15));

  const bracketPoints: THREE.Vector3[] = [];

  // All 8 corners of the 3D bounding box
  const corners = [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];

  corners.forEach((c) => {
    const dx = c.x === min.x ? armLen : -armLen;
    const dy = c.y === min.y ? armLen : -armLen;
    const dz = c.z === min.z ? armLen : -armLen;

    // Line segment along X axis
    bracketPoints.push(c.clone(), new THREE.Vector3(c.x + dx, c.y, c.z));
    // Line segment along Y axis
    bracketPoints.push(c.clone(), new THREE.Vector3(c.x, c.y + dy, c.z));
    // Line segment along Z axis
    bracketPoints.push(c.clone(), new THREE.Vector3(c.x, c.y, c.z + dz));
  });

  const bracketGeo = new THREE.BufferGeometry().setFromPoints(bracketPoints);
  const bracketMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(accentColor),
    linewidth: 1.5,
    transparent: true,
    opacity: 0.9,
    depthTest: true,
  });

  const cornerLines = new THREE.LineSegments(bracketGeo, bracketMat);
  cornerLines.renderOrder = 10;
  group.add(cornerLines);

  // Dashed bounding box wireframe outline (subtle CAD datum projection)
  const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
  const edgesGeo = new THREE.EdgesGeometry(boxGeo);
  const dashedMat = new THREE.LineDashedMaterial({
    color: new THREE.Color(accentColor),
    dashSize: Math.max(0.04, minDim * 0.05),
    gapSize: Math.max(0.03, minDim * 0.035),
    transparent: true,
    opacity: 0.2,
    depthTest: true,
  });

  const dashedBox = new THREE.LineSegments(edgesGeo, dashedMat);
  dashedBox.computeLineDistances();
  const center = new THREE.Vector3();
  box.getCenter(center);
  dashedBox.position.copy(center);
  dashedBox.renderOrder = 9;
  group.add(dashedBox);

  // Center crosshair marker
  const chLen = Math.max(0.02, minDim * 0.06);
  const chPoints: THREE.Vector3[] = [
    new THREE.Vector3(center.x - chLen, center.y, center.z),
    new THREE.Vector3(center.x + chLen, center.y, center.z),
    new THREE.Vector3(center.x, center.y - chLen, center.z),
    new THREE.Vector3(center.x, center.y + chLen, center.z),
    new THREE.Vector3(center.x, center.y, center.z - chLen),
    new THREE.Vector3(center.x, center.y, center.z + chLen),
  ];
  const chGeo = new THREE.BufferGeometry().setFromPoints(chPoints);
  const chMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(accentColor),
    transparent: true,
    opacity: 0.35,
    depthTest: true,
  });
  const crosshair = new THREE.LineSegments(chGeo, chMat);
  crosshair.renderOrder = 10;
  group.add(crosshair);

  return group;
}

export function disposeCADCaliperBox(group: THREE.Group) {
  group.traverse((child) => {
    if ((child as THREE.LineSegments).isLineSegments) {
      const line = child as THREE.LineSegments;
      if (line.geometry) line.geometry.dispose();
      if (line.material) {
        if (Array.isArray(line.material)) {
          line.material.forEach((m) => m.dispose());
        } else {
          line.material.dispose();
        }
      }
    }
  });
}

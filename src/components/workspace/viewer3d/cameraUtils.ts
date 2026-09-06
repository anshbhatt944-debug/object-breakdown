import * as THREE from 'three';

export interface CameraFramingResult {
  distance: number;
  center: THREE.Vector3;
  targetPosition: THREE.Vector3;
  box: THREE.Box3;
  sphere: THREE.Sphere;
  size: THREE.Vector3;
}

export interface ModelFramingSet {
  assembledFraming: CameraFramingResult;
  explodedFraming: CameraFramingResult;
}

/**
 * Mathematically calculates the exact camera distance and target center required
 * to fit a 3D bounding box so that it commands targetRatio (e.g. 0.65 = 65%, 0.78 = 78%)
 * of the viewport regardless of aspect ratio, screen resolution, or device dimensions.
 */
export function fitCameraToBox(
  camera: THREE.PerspectiveCamera,
  box: THREE.Box3,
  targetRatio = 0.65,
  direction = new THREE.Vector3(0, 0.2, 1).normalize()
): CameraFramingResult {
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);

  const aspect = camera.aspect || (window.innerWidth / window.innerHeight);
  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

  // Half-dimensions along all axes with fallback floor
  const halfWidth = Math.max(size.x, 0.1) / 2;
  const halfHeight = Math.max(size.y, 0.1) / 2;

  const distanceV = halfHeight / Math.tan(vFov / 2);
  const distanceH = halfWidth / Math.tan(hFov / 2);
  const baseDistance = Math.max(distanceV, distanceH);

  // Clamp target ratio comfortably between 50% and 85%
  const clampedRatio = Math.max(0.50, Math.min(0.85, targetRatio));
  const distance = baseDistance / clampedRatio;

  const targetPosition = center.clone().add(direction.clone().multiplyScalar(distance));

  return {
    distance,
    center,
    targetPosition,
    box: box.clone(),
    sphere,
    size,
  };
}

/**
 * Fits camera directly to an Object3D in its current transformation state.
 */
export function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  targetRatio = 0.65, // Target 65% of viewport
  direction = new THREE.Vector3(0, 0, 1).normalize()
): CameraFramingResult {
  // Ensure matrices are up to date
  object.updateMatrixWorld(true);

  // Use precise bounds calculation (handles skinned meshes like the drone accurately)
  const box = new THREE.Box3().setFromObject(object, true);
  return fitCameraToBox(camera, box, targetRatio, direction);
}

/**
 * Calculates both assembled framing (0% explode, large hero composition)
 * and maximum exploded framing (100% explode, ~13% comfortable breathing margins)
 * for any 3D model asset.
 */
export function computeModelFramingSet(
  camera: THREE.PerspectiveCamera,
  loadedResult: {
    rootGroup: THREE.Group;
    componentMap: Map<string, any>;
    animationMixer?: THREE.AnimationMixer;
    explodedAnimation?: THREE.AnimationClip;
    explodedAnimationPeakTime?: number;
  },
  direction = new THREE.Vector3(0, 0, 1).normalize()
): ModelFramingSet {
  const root = loadedResult.rootGroup;
  root.updateWorldMatrix(true, true);

  // 1. Assembled state framing (commanding ~65% of viewport)
  const assembledFraming = fitCameraToObject(camera, root, 0.65, direction);

  // 2. Exploded state framing (targetRatio 0.74 leaves ~13% breathing margin around edges)
  let explodedFraming: CameraFramingResult;

  if (loadedResult.animationMixer && loadedResult.explodedAnimation) {
    // Native skeletal animation (e.g. Quadcopter Drone)
    const peakTime = loadedResult.explodedAnimationPeakTime || 2.0;
    loadedResult.animationMixer.setTime(peakTime);
    root.updateWorldMatrix(true, true);

    const explodedBox = new THREE.Box3().setFromObject(root, true);
    explodedFraming = fitCameraToBox(camera, explodedBox, 0.74, direction);

    // Reset back to assembled state
    loadedResult.animationMixer.setTime(0);
    root.updateWorldMatrix(true, true);
  } else if (loadedResult.componentMap && loadedResult.componentMap.size > 0) {
    // Vector exploded models (e.g. Wristwatch, Pen, Engine, Motor)
    // Temporarily apply full 100% explode to measure actual aggregate world bounds
    const savedPositions = new Map<THREE.Object3D, THREE.Vector3>();
    loadedResult.componentMap.forEach((info) => {
      if (info.mesh) {
        savedPositions.set(info.mesh, info.mesh.position.clone());
        if (info.explodeVector && info.basePosition) {
          info.mesh.position.copy(info.basePosition).add(info.explodeVector);
        }
      }
    });

    root.updateWorldMatrix(true, true);
    const explodedBox = new THREE.Box3().setFromObject(root, false);
    explodedFraming = fitCameraToBox(camera, explodedBox, 0.74, direction);

    // Restore to exact original assembled positions
    loadedResult.componentMap.forEach((info) => {
      const orig = savedPositions.get(info.mesh);
      if (orig && info.mesh) {
        info.mesh.position.copy(orig);
      }
    });
    root.updateWorldMatrix(true, true);
  } else {
    explodedFraming = fitCameraToObject(camera, root, 0.74, direction);
  }

  return {
    assembledFraming,
    explodedFraming,
  };
}

/**
 * Smoothly interpolates camera target center and distance between the assembled
 * state (0% explode) and the complete exploded bounding volume (100% explode).
 * Guarantees that at any explosion percentage, the visual composition remains
 * centered as a cohesive unit.
 */
export function interpolateCameraFraming(
  assembled: CameraFramingResult,
  exploded: CameraFramingResult,
  progress: number,
  cameraDirection = new THREE.Vector3(0, 0.2, 1).normalize()
): {
  target: THREE.Vector3;
  distance: number;
  position: THREE.Vector3;
} {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * (3 - 2 * t);

  const target = new THREE.Vector3().lerpVectors(assembled.center, exploded.center, eased);
  const distance = THREE.MathUtils.lerp(assembled.distance, exploded.distance, eased);
  const position = target.clone().add(cameraDirection.clone().multiplyScalar(distance));

  return { target, distance, position };
}


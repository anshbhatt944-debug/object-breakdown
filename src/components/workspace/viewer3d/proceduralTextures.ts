import * as THREE from 'three';

/**
 * Procedural PBR Texture Generator
 * Generates photorealistic high-frequency normal maps, roughness maps,
 * anisotropic toolpath striations, and cast grain textures using HTML5 Canvas.
 */

// Cache textures to guarantee zero duplicate GPU allocations
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Helper to wrap a 2D canvas into a configured Three.js PBR texture
 */
function wrapCanvasTexture(key: string, canvas: HTMLCanvasElement, isNormal = false): THREE.CanvasTexture {
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  if (!isNormal) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  textureCache.set(key, texture);
  return texture;
}

/**
 * 1. Cast Aluminum Texture (A356-T6 Volute Housing)
 * Generates fine micro-pebble cast grain bump/normal map with subtle surface stippling
 */
export function getCastAluminumNormalMap(): THREE.CanvasTexture {
  const key = 'cast-aluminum-normal';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Height map simulation
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Simple pseudo-random coherent noise for cast sand pebble grain
  const heightMap = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let n = 0;
      n += Math.sin(x * 0.18) * Math.cos(y * 0.18) * 0.5;
      n += Math.sin(x * 0.42 + 1.2) * Math.cos(y * 0.42 + 2.1) * 0.25;
      n += Math.sin(x * 0.85 + 3.4) * Math.cos(y * 0.85 + 0.9) * 0.15;
      n += (Math.random() - 0.5) * 0.25; // High frequency micro-grain
      heightMap[y * size + x] = n;
    }
  }

  // Sobel filter to compute normal vector (RGB = [X, Y, Z])
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xLeft = x > 0 ? x - 1 : size - 1;
      const xRight = x < size - 1 ? x + 1 : 0;
      const yUp = y > 0 ? y - 1 : size - 1;
      const yDown = y < size - 1 ? y + 1 : 0;

      const dx = (heightMap[y * size + xRight] - heightMap[y * size + xLeft]) * 2.2;
      const dy = (heightMap[yDown * size + x] - heightMap[yUp * size + x]) * 2.2;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = (dx / len) * 0.5 + 0.5;
      const ny = (-dy / len) * 0.5 + 0.5;
      const nz = (dz / len) * 0.5 + 0.5;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round(nx * 255);
      data[idx + 1] = Math.round(ny * 255);
      data[idx + 2] = Math.round(nz * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = wrapCanvasTexture(key, canvas, true);
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * 2. Ni-Resist Cast Iron Texture (Ni-Resist D-5S Turbine Housing)
 * Sand-cast refractory grain with pronounced micro-cavities and casting parting grain
 */
export function getCastIronNormalMap(): THREE.CanvasTexture {
  const key = 'cast-iron-normal';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const heightMap = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let n = 0;
      n += Math.sin(x * 0.12) * Math.cos(y * 0.12) * 0.6;
      n += Math.sin(x * 0.28 + 0.7) * Math.sin(y * 0.31 + 1.4) * 0.3;
      n += Math.cos(x * 0.65 + 2.3) * Math.cos(y * 0.72 + 3.1) * 0.18;
      n += (Math.random() - 0.5) * 0.35; // Coarser sand-cast grain
      heightMap[y * size + x] = n;
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xLeft = x > 0 ? x - 1 : size - 1;
      const xRight = x < size - 1 ? x + 1 : 0;
      const yUp = y > 0 ? y - 1 : size - 1;
      const yDown = y < size - 1 ? y + 1 : 0;

      const dx = (heightMap[y * size + xRight] - heightMap[y * size + xLeft]) * 3.5;
      const dy = (heightMap[yDown * size + x] - heightMap[yUp * size + x]) * 3.5;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = (dx / len) * 0.5 + 0.5;
      const ny = (-dy / len) * 0.5 + 0.5;
      const nz = (dz / len) * 0.5 + 0.5;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round(nx * 255);
      data[idx + 1] = Math.round(ny * 255);
      data[idx + 2] = Math.round(nz * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = wrapCanvasTexture(key, canvas, true);
  texture.repeat.set(5, 5);
  return texture;
}

/**
 * 3. Ni-Resist Thermal Discoloration / Heat Patina Map
 * Adds realistic scorching, bronze temper lines, and refractory oxide gradients along the volute
 */
export function getTurbineHeatPatinaMap(): THREE.CanvasTexture {
  const key = 'turbine-heat-patina';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark refractory base with charred bronze and violet heat-tint gradients
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3f444d'); // Dark gunmetal iron
  gradient.addColorStop(0.3, '#4d4842'); // Warm bronze heat soak
  gradient.addColorStop(0.65, '#564e52'); // Subtle violet-charred temper
  gradient.addColorStop(1.0, '#383c44'); // Deep refractory carbon

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Subtle soot / cast mottled noise overlay
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 2.5;
    const alpha = Math.random() * 0.15;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(220, 160, 100, ${alpha})` : `rgba(20, 20, 25, ${alpha * 1.5})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = wrapCanvasTexture(key, canvas, false);
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * 4. Billet Impeller Anisotropic 5-Axis CNC Machining Striations
 * Concentric circular lathe toolpath normal map creating realistic radial metallic highlights
 */
export function getBilletMachinedNormalMap(): THREE.CanvasTexture {
  const key = 'billet-machined-normal';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const center = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Micro-grooved concentric rings + radial cutter passes
      const ringNoise = Math.sin(dist * 1.4) * 0.45;
      const radialNoise = Math.sin(angle * 48.0) * 0.25;
      const combined = ringNoise + radialNoise;

      // Normal vector perturbed tangential to concentric rings
      const tangentX = -Math.sin(angle) * combined * 0.6;
      const tangentY = Math.cos(angle) * combined * 0.6;
      const normalZ = 1.0;

      const len = Math.sqrt(tangentX * tangentX + tangentY * tangentY + normalZ * normalZ);
      const nx = (tangentX / len) * 0.5 + 0.5;
      const ny = (-tangentY / len) * 0.5 + 0.5;
      const nz = (normalZ / len) * 0.5 + 0.5;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round(nx * 255);
      data[idx + 1] = Math.round(ny * 255);
      data[idx + 2] = Math.round(nz * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = wrapCanvasTexture(key, canvas, true);
  return texture;
}

/**
 * 5. Brushed Stainless Steel Normal Map (Wastegate Linkage & Actuator Rod)
 */
export function getBrushedStainlessNormalMap(): THREE.CanvasTexture {
  const key = 'brushed-stainless-normal';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Linear brushed scratches along Y axis
  const colNoise = new Float32Array(size);
  for (let x = 0; x < size; x++) {
    colNoise[x] = (Math.random() - 0.5) * 0.8;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const noise = colNoise[x] + (Math.random() - 0.5) * 0.15;
      const dx = noise * 2.0;
      const dy = 0.0;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = (dx / len) * 0.5 + 0.5;
      const ny = 0.5;
      const nz = (dz / len) * 0.5 + 0.5;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round(nx * 255);
      data[idx + 1] = Math.round(ny * 255);
      data[idx + 2] = Math.round(nz * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = wrapCanvasTexture(key, canvas, true);
  texture.repeat.set(1, 8);
  return texture;
}

/**
 * 6. Yellow-Zinc Dichromate Iridescent Texture (Wastegate Actuator Canister)
 */
export function getZincDichromateColorMap(): THREE.CanvasTexture {
  const key = 'zinc-dichromate-color';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Lustrous yellow zinc chromate passivation gradient with iridescent gold/bronze/green sheen
  const gradient = ctx.createRadialGradient(size * 0.4, size * 0.4, 20, size * 0.5, size * 0.5, size * 0.7);
  gradient.addColorStop(0, '#f59e0b'); // Golden amber
  gradient.addColorStop(0.35, '#d97706'); // Deep golden bronze
  gradient.addColorStop(0.7, '#ca8a04'); // Yellow-zinc passivation
  gradient.addColorStop(0.9, '#a16207'); // Dark bronze edge
  gradient.addColorStop(1.0, '#78350f'); // Shadow edge

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Stamped concentric ribbing rings
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.22)';
  ctx.lineWidth = 3;
  for (let r = 40; r < size * 0.45; r += 28) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = wrapCanvasTexture(key, canvas, false);
  return texture;
}

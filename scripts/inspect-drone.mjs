import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

global.self = global;
global.window = global;

const buf = fs.readFileSync('public/models/drone/animated_drone.glb');
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;
  console.log('Drone meshes:');
  const meshes = [];
  scene.traverse((obj) => {
    if (obj.isMesh) {
      const b = new THREE.Box3().setFromObject(obj);
      const center = new THREE.Vector3();
      b.getCenter(center);
      const size = new THREE.Vector3();
      b.getSize(size);
      meshes.push({ name: obj.name, center, size });
    }
  });
  // Sort by Y descending (highest Y first)
  meshes.sort((a, b) => b.center.y - a.center.y);
  meshes.slice(0, 15).forEach((m, idx) => {
    console.log(`[Top ${idx}] "${m.name}" center.y=${m.center.y.toFixed(2)}, center.z=${m.center.z.toFixed(2)}, center.x=${m.center.x.toFixed(2)}, size=(${m.size.x.toFixed(2)}, ${m.size.y.toFixed(2)}, ${m.size.z.toFixed(2)})`);
  });
}, (err) => console.error(err));

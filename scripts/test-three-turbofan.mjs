import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Minimal mock for browser environment in Node
global.self = global;
global.window = global;

const buf = fs.readFileSync('public/models/turbofan_engine.glb');
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;
  const bbox = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  console.log('Scene BBox Size (x,y,z):', size);
  console.log('Scene BBox Center (x,y,z):', center);

  console.log('\nTop-level children in scene:');
  scene.traverse((obj) => {
    if (obj.isMesh) {
      const mb = new THREE.Box3().setFromObject(obj);
      const msize = new THREE.Vector3();
      mb.getSize(msize);
      const mcenter = new THREE.Vector3();
      mb.getCenter(mcenter);
      console.log(`Mesh: "${obj.name}" | parent: "${obj.parent?.name}" | pos=${JSON.stringify(obj.position)} | center=${JSON.stringify(mcenter)} | size=${JSON.stringify(msize)}`);
    }
  });
}, (err) => {
  console.error('Parse error:', err);
});

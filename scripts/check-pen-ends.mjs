import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

global.self = global;
global.window = global;

const buf = fs.readFileSync('public/models/ballpoint-pen/lamy_logo.glb');
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      const b = new THREE.Box3().setFromObject(obj);
      console.log(`Mesh "${obj.name}": min.x=${b.min.x.toFixed(2)}, max.x=${b.max.x.toFixed(2)}, min.y=${b.min.y.toFixed(2)}, max.y=${b.max.y.toFixed(2)}`);
    }
  });
}, (err) => console.error(err));

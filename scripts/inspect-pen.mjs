import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

global.self = global;
global.window = global;

const buf = fs.readFileSync('public/models/ballpoint-pen/lamy_logo.glb');
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;
  const b = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  b.getSize(size);
  const center = new THREE.Vector3();
  b.getCenter(center);
  console.log('Pen scene size:', size, 'center:', center);

  scene.traverse((obj) => {
    if (obj.isMesh) {
      const mb = new THREE.Box3().setFromObject(obj);
      const msize = new THREE.Vector3();
      mb.getSize(msize);
      const mc = new THREE.Vector3();
      mb.getCenter(mc);
      console.log(`Mesh: "${obj.name}" center:`, mc, 'size:', msize);
    }
  });
}, (err) => console.error(err));

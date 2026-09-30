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
  const mixer = new THREE.AnimationMixer(scene);
  const clip = gltf.animations[0];
  console.log('Clip name:', clip?.name, 'duration:', clip?.duration);
  const action = mixer.clipAction(clip);
  action.play();

  // Test at time = 2.0 (exploded)
  mixer.setTime(2.0);
  scene.updateMatrixWorld(true);

  scene.traverse((obj) => {
    if (obj.isBone) {
      const wp = new THREE.Vector3();
      obj.getWorldPosition(wp);
      console.log(`Bone: "${obj.name}" worldPos=(${wp.x.toFixed(2)}, ${wp.y.toFixed(2)}, ${wp.z.toFixed(2)})`);
    }
    if (obj.isMesh && (obj.name === 'Object_165' || obj.name.includes('165'))) {
      console.log(`Mesh: "${obj.name}" parent: "${obj.parent?.name}" isSkinned: ${obj.isSkinnedMesh}`);
      if (obj.skeleton) {
        console.log(`Mesh "${obj.name}" skeleton bones count:`, obj.skeleton.bones.length);
        obj.skeleton.bones.forEach((b, i) => {
          const wp = new THREE.Vector3();
          b.getWorldPosition(wp);
          if (Math.abs(wp.y) > 0.05 || Math.abs(wp.z) > 0.05) {
            console.log(`  Bone [${i}] "${b.name}" pos: (${wp.x.toFixed(3)}, ${wp.y.toFixed(3)}, ${wp.z.toFixed(3)})`);
          }
        });
      }
    }
  });
}, (err) => console.error(err));

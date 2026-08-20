import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const loader=new GLTFLoader();
loader.load('file://' + process.cwd() + '/public/models/smartphone/iphone_14_pro.glb', g=>{
 const box=new THREE.Box3().setFromObject(g.scene); const size=box.getSize(new THREE.Vector3()); const center=box.getCenter(new THREE.Vector3());
 console.log('size', size.toArray(),'center',center.toArray());
 g.scene.traverse(o=>{if(o.isMesh) console.log('mesh',o.name,'pos',o.position.toArray(),'scale',o.scale.toArray(),'rot',o.rotation.toArray())});
}, undefined, e=>console.error(e));

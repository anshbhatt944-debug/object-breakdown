import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const THREE = require('three');
const loader = new GLTFLoader();
const base = path.resolve('/mnt/data/obwork/object-breakdown/public');
const files = process.argv.slice(2);
for (const f of files) {
 const url='file://'+path.resolve(base,f);
 await new Promise((resolve,reject)=>loader.load(url,g=>{
   console.log('\nFILE',f);
   const box=new THREE.Box3().setFromObject(g.scene); const s=box.getSize(new THREE.Vector3()); const c=box.getCenter(new THREE.Vector3());
   console.log('size',s.toArray(),'center',c.toArray(),'rot0');
   g.scene.traverse(o=>{ if(o.isMesh) console.log('MESH',o.name,'parent',o.parent?.name,'pos',o.position.toArray(),'rot',o.rotation.toArray(),'scale',o.scale.toArray(),'geom',o.geometry?.attributes?.position?.count); });
   resolve();
 },undefined,reject));
}

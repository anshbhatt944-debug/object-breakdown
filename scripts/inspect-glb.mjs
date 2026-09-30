import fs from 'fs';

const buf = fs.readFileSync('public/models/turbofan_engine.glb');
const chunk0Length = buf.readUInt32LE(12);
const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonStr);

console.log('Scene:', gltf.scenes[gltf.scene || 0]);
console.log('Root nodes:', gltf.scenes[gltf.scene || 0]?.nodes);
gltf.scenes[gltf.scene || 0]?.nodes?.forEach(rootIdx => {
  console.log(`Root Node [${rootIdx}]:`, gltf.nodes[rootIdx]);
});

// Let's inspect node 0, 1, 2
console.log('Node 0:', gltf.nodes[0]);
console.log('Node 1:', gltf.nodes[1]);
console.log('Node 2:', gltf.nodes[2]);

// Accessors for positions of meshes to get bounding boxes
console.log('\n--- MESH BOUNDING BOXES (from accessors) ---');
gltf.meshes.forEach((m, i) => {
  const posAccIdx = m.primitives[0]?.attributes?.POSITION;
  if (posAccIdx !== undefined) {
    const acc = gltf.accessors[posAccIdx];
    console.log(`Mesh [${i}] "${m.name}": min=${JSON.stringify(acc.min)}, max=${JSON.stringify(acc.max)}`);
  }
});

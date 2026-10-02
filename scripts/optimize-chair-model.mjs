// Rebuild the presentation chair from the original GLB without changing its materials.
// Run with: node scripts/optimize-chair-model.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { MeshoptSimplifier } from 'meshoptimizer';

const source = 'public/models/dalemans-chair.glb';
const target = 'public/models/dalemans-chair-low.glb';
const input = readFileSync(source);
const jsonLength = input.readUInt32LE(12);
const gltf = JSON.parse(input.subarray(20, 20 + jsonLength).toString());
const binaryStart = 28 + jsonLength;
const view = (index) => {
  const item = gltf.bufferViews[index];
  return input.subarray(binaryStart + (item.byteOffset || 0), binaryStart + (item.byteOffset || 0) + item.byteLength);
};
const accessor = (index, Type) => {
  const item = gltf.accessors[index];
  const bytes = view(item.bufferView);
  return new Type(bytes.buffer.slice(bytes.byteOffset + (item.byteOffset || 0), bytes.byteOffset + (item.byteOffset || 0) + item.count * Type.BYTES_PER_ELEMENT * (item.type === 'VEC3' ? 3 : item.type === 'VEC2' ? 2 : 1)));
};
const primitive = gltf.meshes[0].primitives[0];
const positions = accessor(primitive.attributes.POSITION, Float32Array);
const indices = accessor(primitive.indices, Uint32Array);
await MeshoptSimplifier.ready;
const [reduced, error] = MeshoptSimplifier.simplify(indices, positions, 3, 30000 * 3, 0.02);
if (reduced.length >= indices.length || reduced.length < 3000) throw new Error(`Unexpected simplification: ${reduced.length / 3} triangles`);

// Keep all vertex streams intact; only the index stream changes. This preserves UVs,
// normals, texture seams, materials and embedded images exactly.
const chunks = [];
let offset = 0;
const append = (bytes) => {
  const aligned = Buffer.alloc((bytes.length + 3) & ~3);
  Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).copy(aligned);
  const start = offset;
  chunks.push(aligned);
  offset += aligned.length;
  return start;
};
const indexBytes = Buffer.from(reduced.buffer, reduced.byteOffset, reduced.byteLength);
const indexView = gltf.accessors[primitive.indices].bufferView;
gltf.bufferViews = gltf.bufferViews.map((item, index) => {
  const bytes = index === indexView ? indexBytes : view(index);
  return { ...item, byteOffset: append(bytes), byteLength: bytes.length };
});
gltf.accessors[primitive.indices].count = reduced.length;
gltf.buffers[0].byteLength = offset;
const json = Buffer.from(JSON.stringify(gltf));
const paddedJson = Buffer.alloc((json.length + 3) & ~3, 0x20);
json.copy(paddedJson);
const bin = Buffer.concat(chunks);
const output = Buffer.alloc(20);
output.write('glTF', 0);
output.writeUInt32LE(2, 4);
output.writeUInt32LE(12 + 8 + paddedJson.length + 8 + bin.length, 8);
output.writeUInt32LE(paddedJson.length, 12);
output.write('JSON', 16);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(bin.length, 0);
binHeader.write('BIN\0', 4);
writeFileSync(target, Buffer.concat([output, paddedJson, binHeader, bin]));
console.log(`${indices.length / 3} -> ${reduced.length / 3} triangles, error ${error.toFixed(5)}, ${input.length} -> ${readFileSync(target).length} bytes`);

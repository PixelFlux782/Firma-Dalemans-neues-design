import { readFileSync, writeFileSync } from "node:fs";
import { basename, extname } from "node:path";
import sharp from "sharp";

const files = process.argv.slice(2);
if (!files.length) {
  throw new Error("Usage: node scripts/optimize-glb-textures.mjs <model.glb> [...]");
}

const align4 = (value) => (value + 3) & ~3;

for (const source of files) {
  const input = readFileSync(source);
  if (input.toString("ascii", 0, 4) !== "glTF" || input.readUInt32LE(4) !== 2) {
    throw new Error(`${source} is not a binary glTF 2.0 file`);
  }

  const jsonLength = input.readUInt32LE(12);
  const gltf = JSON.parse(input.subarray(20, 20 + jsonLength).toString().trim());
  const binaryStart = 28 + jsonLength;
  const originalViews = gltf.bufferViews.map((item) =>
    input.subarray(
      binaryStart + (item.byteOffset ?? 0),
      binaryStart + (item.byteOffset ?? 0) + item.byteLength,
    ),
  );
  const optimizedImages = new Map();

  for (const image of gltf.images ?? []) {
    if (image.mimeType !== "image/jpeg" || image.bufferView === undefined) continue;
    const original = originalViews[image.bufferView];
    const metadata = await sharp(original).metadata();
    const optimized = await sharp(original)
      .jpeg({ quality: 84, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toBuffer();
    const verified = await sharp(optimized).metadata();
    if (verified.width !== metadata.width || verified.height !== metadata.height) {
      throw new Error(`${source}: texture dimensions changed unexpectedly`);
    }
    optimizedImages.set(image.bufferView, optimized);
  }

  const chunks = [];
  let byteOffset = 0;
  gltf.bufferViews = gltf.bufferViews.map((item, index) => {
    const bytes = optimizedImages.get(index) ?? originalViews[index];
    const padded = Buffer.alloc(align4(bytes.length));
    bytes.copy(padded);
    const next = { ...item, byteOffset, byteLength: bytes.length };
    chunks.push(padded);
    byteOffset += padded.length;
    return next;
  });
  gltf.buffers[0].byteLength = byteOffset;

  const json = Buffer.from(JSON.stringify(gltf));
  const paddedJson = Buffer.alloc(align4(json.length), 0x20);
  json.copy(paddedJson);
  const binary = Buffer.concat(chunks);
  const output = Buffer.alloc(20);
  output.write("glTF", 0);
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(12 + 8 + paddedJson.length + 8 + binary.length, 8);
  output.writeUInt32LE(paddedJson.length, 12);
  output.write("JSON", 16);
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(binary.length, 0);
  binaryHeader.write("BIN\0", 4);

  const extension = extname(source);
  const target = source.slice(0, -extension.length) + "-web" + extension;
  writeFileSync(target, Buffer.concat([output, paddedJson, binaryHeader, binary]));
  const saved = input.length - readFileSync(target).length;
  console.log(`${basename(source)} -> ${basename(target)}: ${input.length} -> ${input.length - saved} bytes (${Math.round(saved / input.length * 100)}% smaller)`);
}

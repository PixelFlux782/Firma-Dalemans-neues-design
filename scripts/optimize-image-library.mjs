import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { imageMigrations, mediaDirectories } from "./image-library.config.mjs";

const root = process.cwd();
const auditDir = path.join(root, "audit", "prelaunch", "screenshots");

const xmlEscape = (value) => value.replace(/[<>&"']/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;",
})[character]);

async function comparePixels(source, target, width) {
  const originalPipeline = sharp(source).rotate().toColourspace("srgb");
  if (width) originalPipeline.resize({ width, withoutEnlargement: true });
  const original = await originalPipeline.flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const optimized = await sharp(target).toColourspace("srgb").flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  if (original.info.width !== optimized.info.width || original.info.height !== optimized.info.height) {
    throw new Error(`Dimensions changed for ${source}`);
  }
  let squaredError = 0;
  for (let index = 0; index < original.data.length; index += 1) {
    const difference = original.data[index] - optimized.data[index];
    squaredError += difference * difference;
  }
  const mse = squaredError / original.data.length;
  return mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
}

async function createComparisonSheet(entries, outputPath) {
  const panelWidth = 280;
  const imageHeight = 170;
  const rowHeight = 220;
  const width = panelWidth * 2;
  const height = rowHeight * entries.length;
  const composites = [];

  for (const [index, entry] of entries.entries()) {
    const top = index * rowHeight + 30;
    for (const [column, file] of [entry.source, entry.target].entries()) {
      const image = await sharp(file)
        .rotate()
        .resize(panelWidth, imageHeight, { fit: "contain", background: "#f4f1e8" })
        .flatten({ background: "#f4f1e8" })
        .jpeg({ quality: 92 })
        .toBuffer();
      composites.push({ input: image, left: column * panelWidth, top });
    }
    const label = xmlEscape(path.basename(entry.target));
    composites.push({
      input: Buffer.from(`<svg width="${width}" height="30"><rect width="100%" height="100%" fill="#13251b"/><text x="12" y="20" fill="white" font-family="Arial" font-size="13">${label} — vorher | nachher</text></svg>`),
      left: 0,
      top: index * rowHeight,
    });
  }

  await sharp({ create: { width, height, channels: 3, background: "#e8e1d4" } })
    .composite(composites)
    .webp({ quality: 88 })
    .toFile(outputPath);
}

for (const directory of mediaDirectories) {
  await fs.mkdir(path.join(root, "public", "images", directory), { recursive: true });
}
await fs.mkdir(auditDir, { recursive: true });

const results = [];
for (const migration of imageMigrations) {
  const source = path.join(root, migration.source);
  const target = path.join(root, migration.target);
  await fs.access(source);
  await fs.mkdir(path.dirname(target), { recursive: true });

  const pipeline = sharp(source).rotate().toColourspace("srgb");
  if (migration.width) pipeline.resize({ width: migration.width, withoutEnlargement: true });
  if (migration.lossless) {
    pipeline.webp({ lossless: true, effort: 6 });
  } else {
    pipeline.webp({ quality: migration.quality, alphaQuality: 100, smartSubsample: true, effort: 6 });
  }
  await pipeline.toFile(target);

  const [before, after, metadata, psnr] = await Promise.all([
    fs.stat(source),
    fs.stat(target),
    sharp(target).metadata(),
    comparePixels(source, target, migration.width),
  ]);
  results.push({
    ...migration,
    before: before.size,
    after: after.size,
    saved: before.size - after.size,
    width: metadata.width,
    height: metadata.height,
    psnr,
  });
}

await createComparisonSheet(results.slice(0, 10), path.join(auditDir, "wp06-comparison-01.webp"));
await createComparisonSheet(results.slice(10), path.join(auditDir, "wp06-comparison-02.webp"));

const totalBefore = results.reduce((total, item) => total + item.before, 0);
const totalAfter = results.reduce((total, item) => total + item.after, 0);
console.log(JSON.stringify({
  count: results.length,
  totalBefore,
  totalAfter,
  saved: totalBefore - totalAfter,
  savedPercent: ((totalBefore - totalAfter) / totalBefore) * 100,
  minimumPsnr: Math.min(...results.filter((item) => Number.isFinite(item.psnr)).map((item) => item.psnr)),
  images: results,
}, null, 2));

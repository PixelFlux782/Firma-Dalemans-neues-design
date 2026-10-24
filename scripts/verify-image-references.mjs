import fs from "node:fs/promises";
import path from "node:path";
import { imageMigrations, publicUrl } from "./image-library.config.mjs";

const root = process.cwd();
const extensions = "(?:avif|gif|ico|jpe?g|png|svg|webp)";
const literalPattern = new RegExp(`[\"'\\\`](?<url>/[^\"'\\\`\\r\\n?]+\\.${extensions})`, "gi");
const importPattern = new RegExp(`[\"'](?<import>[^\"']*public[/\\\\][^\"']+\\.${extensions})[\"']`, "gi");
const codePattern = /\.(?:css|js|jsx|mjs|ts|tsx)$/i;
const compatibilityTargets = new Map(imageMigrations.map((migration) => [
  publicUrl(migration.source),
  path.join(root, migration.target),
]));

async function walk(directory, output = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(filePath, output);
    else if (codePattern.test(filePath)) output.push(filePath);
  }
  return output;
}

const files = [...await walk(path.join(root, "src")), ...await walk(path.join(root, "tests"))];
const missing = [];
let checked = 0;
for (const filePath of files) {
  const text = await fs.readFile(filePath, "utf8");
  for (const match of text.matchAll(literalPattern)) {
    const url = match.groups.url;
    if (url.includes("${") || url.startsWith("//")) continue;
    checked += 1;
    const decodedUrl = decodeURI(url);
    const localPath = compatibilityTargets.get(decodedUrl)
      ?? path.join(root, "public", decodedUrl.replace(/^\//, ""));
    try { await fs.access(localPath); } catch { missing.push(`${path.relative(root, filePath)}: ${url}`); }
  }
  for (const match of text.matchAll(importPattern)) {
    checked += 1;
    const importPath = match.groups.import.replaceAll("\\", "/");
    const publicIndex = importPath.indexOf("public/");
    const localPath = path.join(root, importPath.slice(publicIndex));
    try { await fs.access(localPath); } catch { missing.push(`${path.relative(root, filePath)}: ${match.groups.import}`); }
  }
}

const dynamicChecks = [
  ...((await fs.readdir(path.join(root, "public", "materials", "fabrics", "previews"))).map((name) => `public/materials/fabrics/previews/${name}`)),
];
for (const relativePath of dynamicChecks) {
  checked += 1;
  try { await fs.access(path.join(root, relativePath)); } catch { missing.push(`dynamisch: ${relativePath}`); }
}

if (missing.length) {
  console.error(`Fehlende Bildreferenzen (${missing.length}):\n${missing.join("\n")}`);
  process.exit(1);
}
console.log(`${checked} direkte bzw. bekannte dynamische Bildreferenzen geprüft; keine fehlenden Dateien.`);

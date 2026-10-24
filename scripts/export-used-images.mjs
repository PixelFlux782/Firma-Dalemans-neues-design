import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "audit", "prelaunch", "WP06-IMAGE-MANIFEST.csv");
const targetArgument = process.argv[2];

if (!targetArgument) {
  console.error("Verwendung: node scripts/export-used-images.mjs <exportverzeichnis>");
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const rows = parseCsv(await fs.readFile(manifestPath, "utf8"));
const headers = rows.shift();
const pathIndex = headers.indexOf("Neuer Pfad");
const statusIndex = headers.indexOf("Optimierungsstatus");
const usageIndex = headers.indexOf("Verwendende Seiten/Komponenten");
if (pathIndex < 0 || statusIndex < 0 || usageIndex < 0) throw new Error("Unerwartete Manifest-Spalten");

const exportRoot = path.resolve(root, targetArgument);
if (exportRoot === root || !exportRoot.startsWith(`${root}${path.sep}`)) {
  throw new Error("Das Exportverzeichnis muss innerhalb des Projektverzeichnisses liegen.");
}

let copied = 0;
for (const row of rows) {
  const relativePath = row[pathIndex];
  if (
    !relativePath?.startsWith("public/")
    || row[statusIndex].startsWith("extern")
    || row[usageIndex].startsWith("keine Code-Referenz")
  ) continue;
  const source = path.join(root, relativePath);
  try {
    const stat = await fs.stat(source);
    if (!stat.isFile()) continue;
  } catch {
    continue;
  }
  const target = path.join(exportRoot, relativePath.slice("public/".length));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  copied += 1;
}

console.log(`${copied} verwendete lokale Bilder wurden nach ${exportRoot} kopiert.`);

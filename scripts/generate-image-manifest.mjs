import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { imageMigrations, publicUrl } from "./image-library.config.mjs";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const auditRoot = path.join(root, "audit", "prelaunch");
const manifestPath = path.join(auditRoot, "WP06-IMAGE-MANIFEST.csv");
const baselinePath = path.join(auditRoot, "WP06-IMAGE-BASELINE.json");
const imagePattern = /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i;
const codePattern = /\.(?:css|js|jsx|mjs|ts|tsx)$/i;

async function walk(directory, predicate, output = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(filePath, predicate, output);
    else if (predicate(filePath)) output.push(filePath);
  }
  return output;
}

const normalize = (filePath) => path.relative(root, filePath).replaceAll("\\", "/");
const codeFiles = await walk(path.join(root, "src"), (filePath) => codePattern.test(filePath));
const testFiles = await walk(path.join(root, "tests"), (filePath) => codePattern.test(filePath));
const searchableFiles = [...codeFiles, ...testFiles];
const code = await Promise.all(searchableFiles.map(async (filePath) => ({
  path: normalize(filePath),
  text: await fs.readFile(filePath, "utf8"),
})));

const dynamicRules = [
  { prefix: "public/images/curated/", files: ["src/lib/category-media.ts"] },
  { prefix: "public/neue bilder/Stapelstühle/neu_beschriftet/", files: ["src/lib/commerce/providers/local-stacking-chairs.ts"] },
  { prefix: "public/neue bilder/Zubehör/", files: ["src/lib/commerce/providers/local-glider-products.ts"] },
  { prefix: "public/neue bilder/Gestelle/Gestelltypen/", files: ["src/components/products/TableFrameGuide.tsx", "src/components/products/Table310FrameAdvice.tsx", "src/lib/knowledge/guides.ts", "src/lib/products.ts"] },
  { prefix: "public/neue bilder/Tische/klapptisch-310c/", files: ["src/components/products/Table310FrameAdvice.tsx", "src/lib/commerce/providers/local-price-list-products.ts"] },
  { prefix: "public/materials/fabrics/previews/", files: ["src/components/chairs/FabricSelectionDialog.tsx"] },
];

function usagesFor(relativePath) {
  const url = publicUrl(relativePath);
  const encodedUrl = encodeURI(url);
  const direct = code
    .filter((entry) => entry.text.includes(url) || entry.text.includes(encodedUrl) || entry.text.includes(relativePath))
    .map((entry) => entry.path);

  const dynamic = dynamicRules.flatMap((rule) => {
    if (!relativePath.startsWith(rule.prefix)) return [];
    const basename = path.posix.basename(relativePath);
    const stem = basename.replace(/\.[^.]+$/, "");
    return rule.files.filter((file) => {
      const entry = code.find((candidate) => candidate.path === file);
      return entry && (entry.text.includes(basename) || entry.text.includes(`${stem}.png`) || rule.prefix.includes("materials/fabrics/previews"));
    });
  });
  return [...new Set([...direct, ...dynamic])].sort();
}

function rightsFor(relativePath) {
  const lower = relativePath.toLocaleLowerCase("de-DE");
  if (lower.includes("chatgpt") || lower.includes("ki-verbessert")) {
    return ["Dateiname weist auf KI-Bearbeitung/-Erzeugung hin", "ungeklärt – Generierungs- und Nutzungsnachweis erforderlich"];
  }
  if (lower.includes("pngtree")) {
    return ["Dateiname weist auf fremde Bildquelle pngtree hin", "ungeklärt – Lizenznachweis erforderlich"];
  }
  if (lower.includes("materials/fabrics") || lower.includes("stoff")) {
    return ["Bestandsdatei / mögliche Hersteller-Farbkarte", "ungeklärt – Herstellerfreigabe bzw. Lizenz nachweisen"];
  }
  if (lower.includes("portrait") || lower.includes("referenz") || lower.includes("realisierte") || lower.includes("produktion") || lower.includes("über uns")) {
    return ["Bestandsdatei / mögliches eigenes oder Kundenfoto; Herkunft nicht belegt", "ungeklärt – Urheberrecht und ggf. Personen-/Kundenfreigabe nachweisen"];
  }
  if (lower.includes("branding") || lower.includes("logo")) {
    return ["Unternehmensbranding aus dem Repository-Bestand", "intern zu bestätigen"];
  }
  return ["Bestandsdatei; Herkunft im Repository nicht dokumentiert", "ungeklärt – Freigabe- oder Lizenznachweis erforderlich"];
}

async function metadataFor(filePath) {
  const stat = await fs.stat(filePath);
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      size: stat.size,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      format: metadata.format ?? path.extname(filePath).slice(1).toLowerCase(),
    };
  } catch {
    return { size: stat.size, width: null, height: null, format: path.extname(filePath).slice(1).toLowerCase() };
  }
}

let baseline = {};
try {
  baseline = JSON.parse(await fs.readFile(baselinePath, "utf8"));
} catch {
  // The first run captures the source values before verified originals are removed.
}

for (const migration of imageMigrations) {
  const source = path.join(root, migration.source);
  try {
    baseline[migration.source] = await metadataFor(source);
  } catch {
    if (!baseline[migration.source]) throw new Error(`Baseline fehlt für ${migration.source}`);
  }
}
await fs.mkdir(auditRoot, { recursive: true });
await fs.writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");

const publicImages = await walk(publicRoot, (filePath) => imagePattern.test(filePath) && !normalize(filePath).startsWith("public/models/"));
const migrationBySource = new Map(imageMigrations.map((item) => [item.source, item]));
const migrationTargets = new Set(imageMigrations.map((item) => item.target));
const inventoryPaths = publicImages.map(normalize).filter((filePath) => !migrationTargets.has(filePath));
for (const source of migrationBySource.keys()) {
  if (!inventoryPaths.includes(source)) inventoryPaths.push(source);
}

const rows = [];
for (const originalPath of inventoryPaths.sort((a, b) => a.localeCompare(b, "de"))) {
  const migration = migrationBySource.get(originalPath);
  const newPath = migration?.target ?? originalPath;
  const currentAbsolutePath = path.join(root, newPath);
  let current;
  try {
    current = await metadataFor(currentAbsolutePath);
  } catch {
    current = null;
  }
  const original = migration ? baseline[originalPath] : current;
  const usages = usagesFor(newPath);
  const [origin, rights] = rightsFor(newPath);
  const saving = original && current ? original.size - current.size : null;
  const savingPercent = saving !== null && original.size ? (saving / original.size) * 100 : null;
  rows.push({
    "Ursprünglicher Dateiname": path.posix.basename(originalPath),
    "Ursprünglicher Pfad": originalPath,
    "Neuer Dateiname": path.posix.basename(newPath),
    "Neuer Pfad": newPath,
    "Verwendende Seiten/Komponenten": usages.length ? usages.join("; ") : "keine Code-Referenz erkannt",
    "Bildformat": current?.format ?? original?.format ?? "unbekannt",
    "Auflösung": current?.width && current?.height ? `${current.width}x${current.height}` : "unbekannt",
    "Ursprüngliche Dateigröße (Byte)": original?.size ?? "",
    "Neue Dateigröße (Byte)": current?.size ?? "",
    "Einsparung (Byte)": saving ?? "",
    "Einsparung (%)": savingPercent === null ? "" : savingPercent.toFixed(2),
    "Optimierungsstatus": migration
      ? "optimiert und migriert; technischer Vergleich und Kontaktbogen geprüft"
      : usages.length
        ? "verwendet; im WP06-Folgedurchgang zu bewerten"
        : "nicht als verwendet erkannt; Bestand unverändert",
    "Bildherkunft": origin,
    "Bildrechte-Freigabestatus": rights,
  });
}

rows.push({
  "Ursprünglicher Dateiname": "Shop-/Produktbilder (dynamisch)",
  "Ursprünglicher Pfad": "extern: Shopify Storefront API",
  "Neuer Dateiname": "nicht lokal dupliziert",
  "Neuer Pfad": "extern: vom Commerce-Provider gelieferte URL",
  "Verwendende Seiten/Komponenten": "src/lib/shopify/mappers/product.ts; CommerceMedia; Warenkorb",
  "Bildformat": "extern / variabel",
  "Auflösung": "extern / variabel",
  "Ursprüngliche Dateigröße (Byte)": "",
  "Neue Dateigröße (Byte)": "",
  "Einsparung (Byte)": "",
  "Einsparung (%)": "",
  "Optimierungsstatus": "extern; bewusst nicht heruntergeladen oder dupliziert",
  "Bildherkunft": "Shopify Storefront API / jeweilige Produktquelle",
  "Bildrechte-Freigabestatus": "extern zu verifizieren – Produktbildfreigaben nachweisen",
});

const headers = Object.keys(rows[0]);
const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csv = [headers, ...rows.map((row) => headers.map((header) => row[header]))]
  .map((row) => row.map(csvEscape).join(","))
  .join("\r\n");
await fs.writeFile(manifestPath, `${csv}\r\n`, "utf8");

console.log(JSON.stringify({
  manifest: normalize(manifestPath),
  rows: rows.length,
  usedLocal: rows.filter((row) => !row["Verwendende Seiten/Komponenten"].startsWith("keine Code-Referenz") && !row["Optimierungsstatus"].startsWith("extern")).length,
  migrated: imageMigrations.length,
}, null, 2));

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const expectedFiles = [
  "bondai.pdf",
  "radio.pdf",
  "pisa.pdf",
  "xtreme.pdf",
  "x2.pdf",
  "king-flex.pdf",
  "king-l.pdf",
  "era.pdf",
  "advantage.pdf",
  "pulfero.pdf",
  "pure.pdf",
  "mini.pdf",
];

test("all configured fabric cards are local, valid PDFs awaiting rights review", async () => {
  const sourceDocumentation = JSON.parse(await readFile(path.join(root, "config", "fabric-material-sources.json"), "utf8"));
  const fabricsSource = await readFile(path.join(root, "src", "lib", "fabrics.ts"), "utf8");

  assert.equal(Object.keys(sourceDocumentation.pdfSources).length, expectedFiles.length);
  assert.equal(sourceDocumentation.rightsReview.status, "unconfirmed");
  assert.doesNotMatch(fabricsSource, /colorCardUrl:\s*["']https?:\/\//);

  for (const filename of expectedFiles) {
    const id = filename.replace(/\.pdf$/, "");
    const source = sourceDocumentation.pdfSources[id];
    assert.equal(source.localPath, `/materials/fabrics/${filename}`);
    assert.equal(source.publicationRights, "unconfirmed");
    assert.match(fabricsSource, new RegExp(`colorCardUrl: ["']${source.localPath.replaceAll("/", "\\/")}["']`));

    const contents = await readFile(path.join(root, "public", "materials", "fabrics", filename));
    assert.ok(contents.length > 8, `${filename} is unexpectedly small`);
    assert.equal(contents.length, source.bytes, `${filename} size differs from the verified download`);
    assert.equal(createHash("sha256").update(contents).digest("hex"), source.sha256, `${filename} hash differs from the verified download`);
    assert.equal(contents.subarray(0, 5).toString("ascii"), "%PDF-", `${filename} has no PDF signature`);
    assert.match(contents.subarray(Math.max(0, contents.length - 2048)).toString("latin1"), /%%EOF/, `${filename} has no PDF end marker`);
  }
});

test("the UI only exposes a local color card after publication approval", async () => {
  const dialogSource = await readFile(path.join(root, "src", "components", "chairs", "FabricSelectionDialog.tsx"), "utf8");
  assert.match(dialogSource, /colorCardPublicationStatus === "approved"/);
  assert.match(dialogSource, /Vollständige Farbkarte ansehen/);
  assert.doesNotMatch(dialogSource, /zachert-gmbh\.de|camirafabrics\.com|fidivi\.com|vowalon\.eu/);
});

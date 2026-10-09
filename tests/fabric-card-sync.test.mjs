import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  atomicReplaceFiles,
  createPublicCards,
  discoverPdfLinks,
  fetchPdf,
  findUnreviewedSourceUrls,
  sha256,
} from "../scripts/fabric-card-sync-lib.mjs";

const pdf = (content = "card") => Buffer.from(`%PDF-1.7\n${content}\n%%EOF\n`);
const response = (body, init = {}) => new Response(body, {
  status: init.status ?? 200,
  headers: { "content-type": "application/pdf", ...init.headers },
});

test("accepts an unchanged PDF and detects a new PDF hash", async () => {
  const first = pdf("version-one");
  const unchanged = await fetchPdf("https://zachert-gmbh.de/card.pdf", { fetchImpl: async () => response(first) });
  const changed = await fetchPdf("https://zachert-gmbh.de/card.pdf", { fetchImpl: async () => response(pdf("version-two")) });
  assert.equal(unchanged.hash, sha256(first));
  assert.notEqual(changed.hash, unchanged.hash);
});

test("rejects 404 responses", async () => {
  await assert.rejects(
    fetchPdf("https://zachert-gmbh.de/missing.pdf", { fetchImpl: async () => response("missing", { status: 404 }) }),
    /HTTP 404/,
  );
});

test("rejects HTML instead of PDF", async () => {
  await assert.rejects(
    fetchPdf("https://zachert-gmbh.de/login.pdf", {
      fetchImpl: async () => response("<html>login</html>", { headers: { "content-type": "text/html" } }),
    }),
    /Rejected content type/,
  );
});

test("rejects oversized responses before reading the body", async () => {
  await assert.rejects(
    fetchPdf("https://zachert-gmbh.de/large.pdf", {
      maxBytes: 10,
      fetchImpl: async () => response(pdf(), { headers: { "content-length": "11" } }),
    }),
    /exceeds 10 bytes/,
  );
});

test("stops an oversized streamed response without a content-length header", async () => {
  await assert.rejects(
    fetchPdf("https://zachert-gmbh.de/streamed.pdf", {
      maxBytes: 10,
      fetchImpl: async () => response(pdf("more-than-ten-bytes"), { headers: { "content-length": null } }),
    }),
    /exceeds 10 bytes/,
  );
});

test("rejects redirects to a foreign domain", async () => {
  await assert.rejects(
    fetchPdf("https://zachert-gmbh.de/card.pdf", {
      fetchImpl: async () => response(null, { status: 302, headers: { location: "https://example.com/card.pdf" } }),
    }),
    /outside the allowlist/,
  );
});

test("supports one approved PDF shared by groups 2, 3 and 4", () => {
  const cards = createPublicCards({ documents: [{
    id: "shared",
    groups: [2, 3, 4],
    approvalStatus: "approved",
    currentPublicFilename: "shared.pdf",
    sourceCheckedAt: "2026-10-09T00:00:00.000Z",
  }] }, new Set(["shared.pdf"]));
  assert.deepEqual(cards.map((card) => card.publicUrl), [
    "/downloads/stoffkarten/shared.pdf",
    "/downloads/stoffkarten/shared.pdf",
    "/downloads/stoffkarten/shared.pdf",
  ]);
  for (const card of cards) assert.deepEqual(Object.keys(card).sort(), ["group", "lastVerifiedAt", "publicUrl", "status", "title"]);
});

test("marks a newly discovered source URL for review without deriving group order", () => {
  const discovered = discoverPdfLinks('<a href="/media/current.pdf">PDF</a><a href="https://evil.example/card.pdf">bad</a>');
  const unknown = findUnreviewedSourceUrls(discovered, { documents: [] });
  assert.deepEqual(unknown, ["https://zachert-gmbh.de/media/current.pdf"]);
});

test("rolls every target back after an atomic replacement failure", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "fabric-sync-"));
  const first = path.join(directory, "first.txt");
  const second = path.join(directory, "second.txt");
  await writeFile(first, "old-first");
  await writeFile(second, "old-second");
  await assert.rejects(
    atomicReplaceFiles([
      { target: first, data: "new-first" },
      { target: second, data: "new-second" },
    ], { failAfter: 1 }),
    /Injected atomic replacement failure/,
  );
  assert.equal(await readFile(first, "utf8"), "old-first");
  assert.equal(await readFile(second, "utf8"), "old-second");
  await rm(directory, { recursive: true, force: true });
});

#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  atomicReplaceFiles,
  createPublicCards,
  discoverPdfLinks,
  fetchAllowlisted,
  fetchPdf,
  findUnreviewedSourceUrls,
  loadManifest,
} from "./fabric-card-sync-lib.mjs";

const root = process.cwd();
const manifestPath = path.join(root, "config", "fabric-card-sources.json");
const downloadDir = path.join(root, "public", "downloads", "stoffkarten");
const publicDataPath = path.join(root, "src", "lib", "knowledge", "fabric-cards.public.json");
const wantsApply = process.argv.includes("--apply");
const wantsCheck = process.argv.includes("--check");

if (wantsApply === wantsCheck) {
  console.error("error: use exactly one of --check or --apply");
  process.exitCode = 1;
} else {
  await main(wantsApply ? "apply" : "check");
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function main(mode) {
  try {
    const manifest = await loadManifest(manifestPath);
    const page = await fetchAllowlisted(manifest.sourcePage, { maxBytes: 2 * 1024 * 1024 });
    const discovered = discoverPdfLinks(page.body.toString("utf8"), page.finalUrl);
    const unknownUrls = findUnreviewedSourceUrls(discovered, manifest);
    let needsReview = false;

    if (discovered.length === 0) {
      console.log("unchanged: source page exposed no directly discoverable PDF links; checking maintained manifest URLs");
    }
    for (const url of unknownUrls) {
      needsReview = true;
      try {
        const candidate = await fetchPdf(url);
        console.log(`needs_review: discovered=${url} sha256=${candidate.hash} lastModified=${candidate.lastModified ?? "unknown"} groups=unmapped`);
      } catch (error) {
        console.log(`needs_review: discovered=${url} validation=${error.message} groups=unmapped`);
      }
    }

    const downloads = [];
    const nextManifest = structuredClone(manifest);
    for (const document of manifest.documents.filter((item) => item.approvalStatus === "needs_review")) {
      needsReview = true;
      try {
        const candidate = await fetchPdf(document.sourcePdfUrl);
        console.log(`needs_review: id=${document.id} source=${document.sourcePdfUrl} sha256=${candidate.hash} lastModified=${candidate.lastModified ?? "unknown"} proposedGroups=${document.groups.join(",") || "unmapped"}`);
      } catch (error) {
        console.log(`needs_review: id=${document.id} source=${document.sourcePdfUrl} error=${error.message}`);
      }
    }

    for (const document of manifest.documents.filter((item) => item.approvalStatus === "approved")) {
      try {
        const download = await fetchPdf(document.sourcePdfUrl);
        if (download.finalUrl !== document.sourcePdfUrl) {
          needsReview = true;
          console.log(`needs_review: id=${document.id} redirect=${download.finalUrl}`);
          continue;
        }
        const target = path.join(downloadDir, document.currentPublicFilename);
        const localHash = await exists(target)
          ? createHash("sha256").update(await readFile(target)).digest("hex")
          : null;
        const changed = localHash !== download.hash;
        console.log(`${changed ? "updated" : "unchanged"}: id=${document.id} source=${document.sourcePdfUrl} sha256=${download.hash}`);
        downloads.push({ document, download, target, changed });
      } catch (error) {
        console.error(`error: id=${document.id} ${error.message}`);
        process.exitCode = 1;
        return;
      }
    }

    if (mode === "apply" && needsReview) {
      console.error("needs_review: apply aborted because unapproved or newly discovered sources exist");
      process.exitCode = 2;
      return;
    }

    if (mode === "apply") {
      const verifiedAt = new Date().toISOString();
      const entries = [];
      for (const item of downloads) {
        if (item.changed) entries.push({ target: item.target, data: item.download.body });
        const manifestDocument = nextManifest.documents.find((candidate) => candidate.id === item.document.id);
        manifestDocument.sha256 = item.download.hash;
        manifestDocument.sourceCheckedAt = verifiedAt;
      }
      const available = new Set(downloads.map((item) => item.document.currentPublicFilename));
      const publicCards = createPublicCards(nextManifest, available);
      entries.push({ target: publicDataPath, data: `${JSON.stringify(publicCards, null, 2)}\n` });
      entries.push({ target: manifestPath, data: `${JSON.stringify(nextManifest, null, 2)}\n` });
      await atomicReplaceFiles(entries);
    }

    if (needsReview) process.exitCode = 2;
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
  }
}

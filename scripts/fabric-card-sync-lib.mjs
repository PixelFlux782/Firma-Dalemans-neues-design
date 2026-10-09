import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const ALLOWED_ORIGIN = "https://zachert-gmbh.de";
export const DEFAULT_SOURCE_PAGE = `${ALLOWED_ORIGIN}/stoffe-und-leder.html`;
export const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const ALLOWED_PDF_TYPES = new Set(["application/pdf", "application/octet-stream"]);

export function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function assertAllowedUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.origin !== ALLOWED_ORIGIN || url.username || url.password) {
    throw new Error(`URL is outside the allowlist: ${value}`);
  }
  return url;
}

export function discoverPdfLinks(html, sourcePage = DEFAULT_SOURCE_PAGE) {
  const links = new Set();
  const hrefPattern = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  let match;
  while ((match = hrefPattern.exec(html)) !== null) {
    const href = (match[1] ?? match[2] ?? match[3] ?? "").replaceAll("&amp;", "&");
    try {
      const candidate = new URL(href, sourcePage);
      if (candidate.pathname.toLowerCase().endsWith(".pdf")) {
        assertAllowedUrl(candidate.href);
        candidate.hash = "";
        links.add(candidate.href);
      }
    } catch {
      // Malformed and foreign links are deliberately ignored during discovery.
    }
  }
  return [...links].sort();
}

export function findUnreviewedSourceUrls(discoveredUrls, manifest) {
  const knownUrls = new Set(manifest.documents.map((item) => item.sourcePdfUrl));
  return discoveredUrls.filter((url) => !knownUrls.has(url));
}

function retryableStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

async function readBodyWithLimit(response, maxBytes, timeoutMs) {
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  const deadline = Date.now() + timeoutMs;
  try {
    while (true) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw new Error(`Response body timed out after ${timeoutMs} ms`);
      let timer;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Response body timed out after ${timeoutMs} ms`)), remaining);
      });
      const result = await Promise.race([reader.read(), timeout]).finally(() => clearTimeout(timer));
      if (result.done) break;
      size += result.value.byteLength;
      if (size > maxBytes) throw new Error(`Response exceeds ${maxBytes} bytes`);
      chunks.push(Buffer.from(result.value));
    }
    return Buffer.concat(chunks, size);
  } catch (error) {
    await reader.cancel(error).catch(() => {});
    throw error;
  }
}

export async function fetchAllowlisted(url, {
  fetchImpl = globalThis.fetch,
  timeoutMs = 12_000,
  retries = 2,
  maxBytes = MAX_PDF_BYTES,
} = {}) {
  let current = assertAllowedUrl(url);
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    let response;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        response = await fetchImpl(current, {
          headers: { "user-agent": "DLMNS-FabricCardSync/1.0" },
          redirect: "manual",
          signal: controller.signal,
        });
        if (!retryableStatus(response.status) || attempt === retries) break;
        await response.body?.cancel().catch(() => {});
      } catch (error) {
        lastError = error;
        if (attempt === retries) {
          const cause = error.cause?.code || error.cause?.message;
          throw new Error(`Request failed for ${current.href}: ${error.message}${cause ? ` (${cause})` : ""}`);
        }
      } finally {
        clearTimeout(timer);
      }
    }
    if (!response) throw lastError ?? new Error(`No response for ${current.href}`);

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error(`Redirect without Location from ${current.href}`);
      current = assertAllowedUrl(new URL(location, current).href);
      continue;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${current.href}`);

    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > maxBytes) throw new Error(`Response exceeds ${maxBytes} bytes`);
    const body = await readBodyWithLimit(response, maxBytes, timeoutMs);
    return { response, body, finalUrl: current.href };
  }
  throw new Error(`Too many redirects for ${url}`);
}

export function validatePdf({ body, contentType = "" }) {
  const normalizedType = contentType.split(";", 1)[0].trim().toLowerCase();
  if (!ALLOWED_PDF_TYPES.has(normalizedType)) {
    throw new Error(`Rejected content type: ${normalizedType || "missing"}`);
  }
  if (body.length < 8 || !body.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new Error("Response does not start with the PDF signature");
  }
  const tail = body.subarray(Math.max(0, body.length - 2048)).toString("latin1");
  if (!tail.includes("%%EOF")) throw new Error("PDF end marker is missing");
}

export async function fetchPdf(url, options = {}) {
  const result = await fetchAllowlisted(url, options);
  validatePdf({ body: result.body, contentType: result.response.headers.get("content-type") || "" });
  return {
    ...result,
    hash: sha256(result.body),
    lastModified: result.response.headers.get("last-modified"),
  };
}

export function validateManifest(manifest) {
  if (manifest.version !== 1 || !Array.isArray(manifest.documents)) throw new Error("Unsupported manifest format");
  assertAllowedUrl(manifest.sourcePage);
  for (const document of manifest.documents) {
    if (!document.id || !Array.isArray(document.groups) || !document.sourcePage || !document.sourcePdfUrl) {
      throw new Error("Manifest document is missing required fields");
    }
    assertAllowedUrl(document.sourcePage);
    assertAllowedUrl(document.sourcePdfUrl);
    if (!document.groups.every((group) => [2, 3, 4].includes(group))) throw new Error(`Invalid groups for ${document.id}`);
    if (new Set(document.groups).size !== document.groups.length) throw new Error(`Duplicate groups for ${document.id}`);
    if (!["approved", "needs_review", "rejected"].includes(document.approvalStatus)) throw new Error(`Invalid approvalStatus for ${document.id}`);
    if (document.currentPublicFilename) {
      if (path.basename(document.currentPublicFilename) !== document.currentPublicFilename || !document.currentPublicFilename.toLowerCase().endsWith(".pdf")) {
        throw new Error(`Unsafe public filename for ${document.id}`);
      }
    }
    if (document.approvalStatus === "approved" && (!document.currentPublicFilename || document.groups.length === 0)) {
      throw new Error(`Approved document ${document.id} needs groups and a public filename`);
    }
  }
  return manifest;
}

export function createPublicCards(manifest, availableFilenames) {
  const byGroup = new Map();
  for (const document of manifest.documents) {
    if (document.approvalStatus !== "approved" || !document.currentPublicFilename) continue;
    if (!availableFilenames.has(document.currentPublicFilename) || !document.sourceCheckedAt) continue;
    for (const group of document.groups) {
      if (byGroup.has(group)) throw new Error(`More than one approved fabric card maps to group ${group}`);
      byGroup.set(group, {
        group,
        title: `Stoffgruppe ${group}`,
        publicUrl: `/downloads/stoffkarten/${document.currentPublicFilename}`,
        lastVerifiedAt: document.sourceCheckedAt,
        status: "available",
      });
    }
  }
  return [2, 3, 4].map((group) => byGroup.get(group) ?? ({ group, title: `Stoffgruppe ${group}`, status: "pending" }));
}

export async function atomicReplaceFiles(entries, { failAfter = Number.POSITIVE_INFINITY } = {}) {
  const token = `${process.pid}-${Date.now()}`;
  const staged = [];
  const backups = [];
  const touched = new Set();
  let replacements = 0;
  try {
    for (const { target, data } of entries) {
      await mkdir(path.dirname(target), { recursive: true });
      const temporary = `${target}.${token}.tmp`;
      await writeFile(temporary, data);
      staged.push({ target, temporary });
    }
    for (const entry of staged) {
      touched.add(entry.target);
      let exists = false;
      try { await stat(entry.target); exists = true; } catch (error) { if (error.code !== "ENOENT") throw error; }
      const backup = `${entry.target}.${token}.bak`;
      if (exists) {
        await rename(entry.target, backup);
        backups.push({ target: entry.target, backup });
      }
      if (replacements >= failAfter) throw new Error("Injected atomic replacement failure");
      await rename(entry.temporary, entry.target);
      replacements += 1;
    }
    await Promise.all(backups.map(({ backup }) => rm(backup, { force: true }).catch(() => {})));
  } catch (error) {
    for (const entry of [...staged].reverse()) await rm(entry.temporary, { force: true }).catch(() => {});
    for (const entry of [...staged].reverse().filter((item) => touched.has(item.target))) {
      const backup = backups.find((item) => item.target === entry.target);
      if (backup) {
        await rm(entry.target, { force: true }).catch(() => {});
        await rename(backup.backup, backup.target).catch(() => {});
      } else {
        await rm(entry.target, { force: true }).catch(() => {});
      }
    }
    throw error;
  }
}

export async function loadManifest(manifestPath) {
  return validateManifest(JSON.parse(await readFile(manifestPath, "utf8")));
}

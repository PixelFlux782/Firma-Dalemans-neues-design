import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";

const RATE_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT = 5;
const MAX_RATE_ENTRIES = 10_000;
const processSalt = randomBytes(32).toString("hex");

interface RateEntry { count: number; resetAt: number }

const rateEntries = new Map<string, RateEntry>();

export class RequestBodyError extends Error {
  constructor(readonly status: 400 | 413) {
    super(status === 413 ? "REQUEST_TOO_LARGE" : "INVALID_JSON");
  }
}

export async function readJsonBody(request: Request, maximumBytes: number): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new RequestBodyError(413);
  }

  if (!request.body) throw new RequestBodyError(400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maximumBytes) {
      await reader.cancel();
      throw new RequestBodyError(413);
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new RequestBodyError(400);
  }
}

function prune(now: number) {
  for (const [key, value] of rateEntries) {
    if (value.resetAt <= now) rateEntries.delete(key);
  }
  while (rateEntries.size > MAX_RATE_ENTRIES) {
    const oldest = rateEntries.keys().next().value as string | undefined;
    if (!oldest) break;
    rateEntries.delete(oldest);
  }
}

function clientKey(request: Request, route: string) {
  const configuredHeader = process.env.FORM_CLIENT_IP_HEADER?.trim().toLowerCase();
  let address = "unattributed";

  if (configuredHeader && /^[a-z0-9-]+$/.test(configuredHeader)) {
    const candidate = request.headers.get(configuredHeader)?.trim() ?? "";
    // Only a platform-normalized single IP is accepted. Forwarding chains are
    // deliberately ignored until the target proxy contract is documented.
    if (!candidate.includes(",") && isIP(candidate)) address = candidate;
  }

  const salt = process.env.FORM_RATE_LIMIT_HASH_SALT?.trim() || processSalt;
  return createHash("sha256").update(`${route}\0${salt}\0${address}`).digest("hex");
}

export function checkLocalRateLimit(request: Request, route: "contact" | "inquiry") {
  const now = Date.now();
  prune(now);
  const key = clientKey(request, route);
  const current = rateEntries.get(key);

  if (!current || current.resetAt <= now) {
    rateEntries.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return null;
  }

  current.count += 1;
  return current.count > RATE_LIMIT
    ? Math.max(1, Math.ceil((current.resetAt - now) / 1_000))
    : null;
}

export function logFormEvent(
  route: "contact" | "inquiry",
  event: string,
  level: "info" | "warn" | "error" = "error",
) {
  const entry = JSON.stringify({ component: "form-delivery", route, event });
  if (level === "info") console.info(entry);
  else if (level === "warn") console.warn(entry);
  else console.error(entry);
}

import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";

const RATE_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT = 5;
const MAX_RATE_ENTRIES = 10_000;
const processSalt = randomBytes(32).toString("hex");
const RATE_LIMIT_SCRIPT = `local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; return {count, redis.call('PTTL', KEYS[1])}`;
const CLAIM_SCRIPT = `local current = redis.call('GET', KEYS[1]); if current then return current; end; redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2]); return false`;
const RELEASE_SCRIPT = `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]); end; return 0`;

interface RateEntry { count: number; resetAt: number }

const rateEntries = new Map<string, RateEntry>();
const localIdempotency = new Map<string, { value: string; expiresAt: number }>();

export class FormProtectionUnavailable extends Error {
  constructor() {
    super("FORM_PROTECTION_UNAVAILABLE");
  }
}

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

function distributedConfig() {
  const url = (process.env.FORM_PROTECTION_REST_URL || process.env.UPSTASH_REDIS_REST_URL)?.trim().replace(/\/$/, "");
  const token = (process.env.FORM_PROTECTION_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)?.trim();
  if (url && token) return { url, token };
  if (url || token || process.env.NODE_ENV === "production") throw new FormProtectionUnavailable();
  return null;
}

async function redisCommand<T>(command: Array<string | number>): Promise<T> {
  const config = distributedConfig();
  if (!config) throw new FormProtectionUnavailable();
  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) throw new Error("STORE_HTTP_ERROR");
    const payload = await response.json() as { result?: T; error?: string };
    if (payload.error || !("result" in payload)) throw new Error("STORE_COMMAND_ERROR");
    return payload.result as T;
  } catch (error) {
    if (error instanceof FormProtectionUnavailable) throw error;
    throw new FormProtectionUnavailable();
  }
}

function localRateLimit(request: Request, route: "contact" | "inquiry") {
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

export async function checkRateLimit(request: Request, route: "contact" | "inquiry") {
  // Netlify's checked-in redirect rules enforce a distributed per-IP limit at
  // the edge. OpenNext route handlers do not expose Netlify's trusted
  // `context.ip`, so do not collapse all visitors into the "unattributed"
  // application key when no verified header contract was configured.
  const isNetlifyRuntime = process.env.NETLIFY === "true"
    || Boolean(process.env.URL && process.env.SITE_NAME && process.env.SITE_ID);
  if (isNetlifyRuntime && !process.env.FORM_CLIENT_IP_HEADER?.trim()) return null;
  const config = distributedConfig();
  if (!config) return localRateLimit(request, route);
  const result = await redisCommand<[number, number]>([
    "EVAL", RATE_LIMIT_SCRIPT, 1, `form:rate:${clientKey(request, route)}`, RATE_WINDOW_MS,
  ]);
  const [count, ttl] = result.map(Number);
  return count > RATE_LIMIT ? Math.max(1, Math.ceil(ttl / 1_000)) : null;
}

function idempotencyKey(route: "contact" | "inquiry", digest: string) {
  return `form:idempotency:${route}:${digest}`;
}

function pruneLocalIdempotency(now: number) {
  for (const [key, entry] of localIdempotency) {
    if (entry.expiresAt <= now) localIdempotency.delete(key);
  }
}

export async function claimIdempotency(
  route: "contact" | "inquiry",
  digest: string,
  ttlMs: number,
): Promise<string | null> {
  const key = idempotencyKey(route, digest);
  const config = distributedConfig();
  if (config) return redisCommand<string | null>(["EVAL", CLAIM_SCRIPT, 1, key, "pending", ttlMs]);

  const now = Date.now();
  pruneLocalIdempotency(now);
  const current = localIdempotency.get(key);
  if (current) return current.value;
  localIdempotency.set(key, { value: "pending", expiresAt: now + ttlMs });
  return null;
}

export async function storeIdempotencyResult(
  route: "contact" | "inquiry",
  digest: string,
  value: string,
  ttlMs: number,
) {
  const key = idempotencyKey(route, digest);
  const config = distributedConfig();
  if (config) {
    await redisCommand<string>(["SET", key, value, "PX", ttlMs]);
    return;
  }
  localIdempotency.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export async function releaseIdempotency(route: "contact" | "inquiry", digest: string) {
  const key = idempotencyKey(route, digest);
  const config = distributedConfig();
  if (config) {
    await redisCommand<number>(["EVAL", RELEASE_SCRIPT, 1, key, "pending"]);
    return;
  }
  if (localIdempotency.get(key)?.value === "pending") localIdempotency.delete(key);
}

export function isAllowedFormRequest(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return false;
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") return false;
  const origin = request.headers.get("origin");
  // Browser form submissions include Origin. Production rejects clients that
  // omit it so the allowlist cannot be bypassed by a bare server-side request.
  if (!origin) return process.env.NODE_ENV !== "production";

  const requestUrl = new URL(request.url);
  const allowed = new Set<string>([requestUrl.origin]);
  // Next.js may bind the local server as `localhost` while the browser uses
  // 127.0.0.1. The platform-normalized Host header represents the public host.
  const host = request.headers.get("host")?.trim();
  if (host && !/[,/\\\s]/.test(host)) allowed.add(`${requestUrl.protocol}//${host}`);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try { allowed.add(new URL(siteUrl).origin); } catch { /* invalid config is not trusted */ }
  }
  for (const value of process.env.FORM_ALLOWED_ORIGINS?.split(",") ?? []) {
    try { allowed.add(new URL(value.trim()).origin); } catch { /* invalid entries are ignored */ }
  }
  return allowed.has(origin);
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

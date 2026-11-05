import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { Redis } from "@upstash/redis";

export const RATE_WINDOW_MS = 15 * 60 * 1_000;
export const RATE_LIMIT = 5;
const REDIS_TIMEOUT_MS = 4_000;
const PENDING_WAIT_MS = 30_000;
const KEY_PREFIX = "dalemans:forms:v1";

type FormRoute = "contact" | "inquiry";
type ErrorType = "configuration" | "timeout" | "unavailable" | "pending" | "finalization";

interface RedisEval {
  eval<T>(script: string, keys: string[], args: (string | number)[]): Promise<T>;
}

const RATE_LIMIT_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
local ttl = redis.call("PTTL", KEYS[1])
if count == 1 or ttl < 0 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { count, ttl }
`;

const RESERVE_SCRIPT = `
local current = redis.call("GET", KEYS[1])
if not current then
  redis.call("SET", KEYS[1], ARGV[1], "PX", ARGV[2], "NX")
  return { 1, "", tonumber(ARGV[2]) }
end
if string.sub(current, 1, 2) == "s:" then
  return { 2, current, redis.call("PTTL", KEYS[1]) }
end
return { 3, "", redis.call("PTTL", KEYS[1]) }
`;

const COMPLETE_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  redis.call("SET", KEYS[1], ARGV[2], "PX", ARGV[3], "XX")
  return 1
end
return 0
`;

const RELEASE_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
`;

let cachedClient: { signature: string; redis: Redis } | undefined;

export class RequestBodyError extends Error {
  constructor(readonly status: 400 | 413) {
    super(status === 413 ? "REQUEST_TOO_LARGE" : "INVALID_JSON");
  }
}

export class FormProtectionError extends Error {
  constructor(readonly errorType: ErrorType, message: string) {
    super(message);
    this.name = "FormProtectionError";
  }
}

export class RateLimitError extends Error {
  constructor(readonly retryAfter: number) {
    super("RATE_LIMITED");
    this.name = "RateLimitError";
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

function redisConfiguration() {
  const url = process.env.FORM_PROTECTION_REST_URL?.trim()
    || process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.FORM_PROTECTION_REST_TOKEN?.trim()
    || process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    throw new FormProtectionError("configuration", "REDIS_NOT_CONFIGURED");
  }
  return { url, token };
}

function redisClient() {
  const config = redisConfiguration();
  const signature = createHash("sha256").update(`${config.url}\0${config.token}`).digest("hex");
  if (cachedClient?.signature === signature) return cachedClient.redis;
  const redis = new Redis({
    ...config,
    retry: { retries: 1, backoff: () => 100 },
    signal: () => AbortSignal.timeout(REDIS_TIMEOUT_MS),
    keepAlive: true,
  });
  cachedClient = { signature, redis };
  return redis;
}

function protectionError(error: unknown, fallback: Exclude<ErrorType, "configuration" | "pending" | "finalization"> = "unavailable") {
  if (error instanceof FormProtectionError) return error;
  const name = error instanceof Error ? error.name : "";
  const type = name === "AbortError" || name === "TimeoutError" ? "timeout" : fallback;
  return new FormProtectionError(type, type === "timeout" ? "REDIS_TIMEOUT" : "REDIS_UNAVAILABLE");
}

function clientDigest(request: Request, route: FormRoute) {
  const config = redisConfiguration();
  const configuredHeader = process.env.FORM_CLIENT_IP_HEADER?.trim().toLowerCase();
  let address = "unattributed";

  if (configuredHeader && /^[a-z0-9-]+$/.test(configuredHeader)) {
    const candidate = request.headers.get(configuredHeader)?.trim() ?? "";
    if (!candidate.includes(",") && isIP(candidate)) address = candidate;
  }

  // A stable secret fallback means raw IP addresses never become Redis keys.
  const salt = process.env.FORM_RATE_LIMIT_HASH_SALT?.trim() || config.token;
  return createHash("sha256").update(`${route}\0${salt}\0${address}`).digest("hex");
}

export function createFormProtectionStore(redis: RedisEval) {
  return {
    async rateLimit(key: string, windowMs = RATE_WINDOW_MS, limit = RATE_LIMIT) {
      try {
        const result = await redis.eval<[number, number]>(RATE_LIMIT_SCRIPT, [key], [windowMs]);
        const count = Number(result[0]);
        const ttl = Number(result[1]);
        return count > limit ? Math.max(1, Math.ceil(ttl / 1_000)) : null;
      } catch (error) {
        throw protectionError(error);
      }
    },

    async reserve<T>(key: string, owner: string, ttlMs: number) {
      try {
        const pending = `p:${owner}`;
        const result = await redis.eval<[number, string, number]>(RESERVE_SCRIPT, [key], [pending, ttlMs]);
        if (Number(result[0]) === 1) return { state: "reserved" as const };
        if (Number(result[0]) === 2) {
          const encoded = String(result[1]).slice(2);
          return { state: "complete" as const, result: JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T };
        }
        return { state: "pending" as const, ttlMs: Number(result[2]) };
      } catch (error) {
        throw protectionError(error);
      }
    },

    async complete<T>(key: string, owner: string, result: T, ttlMs: number) {
      const encoded = Buffer.from(JSON.stringify(result), "utf8").toString("base64url");
      try {
        const changed = await redis.eval<number>(COMPLETE_SCRIPT, [key], [`p:${owner}`, `s:${encoded}`, ttlMs]);
        if (Number(changed) !== 1) throw new FormProtectionError("finalization", "IDEMPOTENCY_OWNERSHIP_LOST");
      } catch (error) {
        if (error instanceof FormProtectionError) throw error;
        const classified = protectionError(error);
        throw new FormProtectionError(
          "finalization",
          classified.errorType === "timeout" ? "IDEMPOTENCY_FINALIZATION_TIMEOUT" : "IDEMPOTENCY_FINALIZATION_FAILED",
        );
      }
    },

    async release(key: string, owner: string) {
      try {
        await redis.eval<number>(RELEASE_SCRIPT, [key], [`p:${owner}`]);
      } catch (error) {
        throw protectionError(error);
      }
    },
  };
}

type ProtectionStore = ReturnType<typeof createFormProtectionStore>;

function defaultStore() {
  return createFormProtectionStore(redisClient());
}

export async function checkRateLimit(request: Request, route: FormRoute, store = defaultStore()) {
  const digest = clientDigest(request, route);
  return store.rateLimit(`${KEY_PREFIX}:rate:${route}:${digest}`);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runIdempotentResult<T>(
  route: FormRoute,
  digest: string,
  ttlMs: number,
  operation: () => Promise<T>,
  store: ProtectionStore = defaultStore(),
  waitMs = PENDING_WAIT_MS,
): Promise<{ result: T; replayed: boolean }> {
  const key = `${KEY_PREFIX}:idempotency:${route}:${digest}`;
  const owner = randomBytes(24).toString("base64url");
  const deadline = Date.now() + waitMs;
  let pause = 100;

  while (true) {
    const reservation = await store.reserve<T>(key, owner, ttlMs);
    if (reservation.state === "complete") return { result: reservation.result, replayed: true };
    if (reservation.state === "reserved") break;
    if (Date.now() >= deadline) throw new FormProtectionError("pending", "IDEMPOTENCY_PENDING");
    await delay(Math.min(pause, Math.max(1, deadline - Date.now())));
    pause = Math.min(1_000, pause * 2);
  }

  let result: T;
  try {
    result = await operation();
  } catch (error) {
    try {
      await store.release(key, owner);
    } catch (releaseError) {
      logFormEvent(route, "idempotency_release_failed", "error", protectionError(releaseError).errorType);
    }
    throw error;
  }

  // SMTP and Redis cannot commit together. Never release after a successful
  // operation; the full-TTL reservation prevents a likely duplicate resend.
  await store.complete(key, owner, result, ttlMs);
  return { result, replayed: false };
}

export async function runIdempotent<T>(
  route: FormRoute,
  digest: string,
  ttlMs: number,
  operation: () => Promise<T>,
  store: ProtectionStore = defaultStore(),
  waitMs = PENDING_WAIT_MS,
) {
  return (await runIdempotentResult(route, digest, ttlMs, operation, store, waitMs)).result;
}

export function logFormEvent(
  route: FormRoute,
  event: string,
  level: "info" | "warn" | "error" = "error",
  errorType?: string,
) {
  const entry = JSON.stringify({ component: "form-delivery", route, event, ...(errorType ? { errorType } : {}) });
  if (level === "info") console.info(entry);
  else if (level === "warn") console.warn(entry);
  else console.error(entry);
}

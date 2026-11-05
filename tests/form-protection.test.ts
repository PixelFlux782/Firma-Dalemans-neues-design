import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  checkRateLimit,
  createFormProtectionStore,
  RATE_LIMIT,
  runIdempotent,
} from "../src/lib/server/form-protection";

interface Entry { value: string; expiresAt: number }

class FakeRedis {
  entries = new Map<string, Entry>();
  failAll?: Error;
  failComplete?: Error;

  private entry(key: string) {
    const entry = this.entries.get(key);
    if (entry && entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry;
  }

  async eval<T>(script: string, keys: string[], args: (string | number)[]): Promise<T> {
    if (this.failAll) throw this.failAll;
    const key = keys[0];
    if (script.includes('INCR')) {
      const existing = this.entry(key);
      const count = existing ? Number(existing.value) + 1 : 1;
      const expiresAt = existing?.expiresAt ?? Date.now() + Number(args[0]);
      this.entries.set(key, { value: String(count), expiresAt });
      return [count, expiresAt - Date.now()] as T;
    }
    if (script.includes('string.sub')) {
      const existing = this.entry(key);
      if (!existing) {
        this.entries.set(key, { value: String(args[0]), expiresAt: Date.now() + Number(args[1]) });
        return [1, "", Number(args[1])] as T;
      }
      if (existing.value.startsWith("s:")) return [2, existing.value, existing.expiresAt - Date.now()] as T;
      return [3, "", existing.expiresAt - Date.now()] as T;
    }
    if (script.includes('ARGV[2]') && script.includes('SET')) {
      if (this.failComplete) throw this.failComplete;
      const existing = this.entry(key);
      if (existing?.value !== String(args[0])) return 0 as T;
      this.entries.set(key, { value: String(args[1]), expiresAt: Date.now() + Number(args[2]) });
      return 1 as T;
    }
    if (script.includes('DEL')) {
      const existing = this.entry(key);
      if (existing?.value !== String(args[0])) return 0 as T;
      this.entries.delete(key);
      return 1 as T;
    }
    throw new Error("UNKNOWN_SCRIPT");
  }
}

function store(redis = new FakeRedis()) {
  return { redis, protection: createFormProtectionStore(redis) };
}

describe("Redis-Formularschutz", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.FORM_PROTECTION_REST_URL;
    delete process.env.FORM_PROTECTION_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it.each(["contact", "inquiry"])("begrenzt %s atomar auf fünf Versuche pro Zeitfenster", async (route) => {
    const { protection } = store();
    for (let attempt = 0; attempt < RATE_LIMIT; attempt += 1) {
      await expect(protection.rateLimit(`rate:${route}`, 60_000, RATE_LIMIT)).resolves.toBeNull();
    }
    await expect(protection.rateLimit(`rate:${route}`, 60_000, RATE_LIMIT)).resolves.toBeGreaterThan(0);
  });

  it("liefert parallelen und späteren Wiederholungen dasselbe Ergebnis ohne Doppelversand", async () => {
    const { protection } = store();
    let mails = 0;
    const sendMail = async () => {
      mails += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { accepted: true, inquiryId: "DLMNS-TEST", customerConfirmation: "sent" } as const;
    };
    const calls = Array.from({ length: 8 }, () =>
      runIdempotent("inquiry", "same-request", 60_000, sendMail, protection, 2_000));
    const results = await Promise.all(calls);
    const repeated = await runIdempotent("inquiry", "same-request", 60_000, sendMail, protection, 100);

    expect(mails).toBe(1);
    expect(results.every((result) => result.inquiryId === "DLMNS-TEST")).toBe(true);
    expect(repeated.inquiryId).toBe("DLMNS-TEST");
  });

  it("gibt die Reservierung nach einem SMTP-Fehler für einen kontrollierten Neuversuch frei", async () => {
    const { protection } = store();
    const smtpFailure = Object.assign(new Error("SMTP_FAILED"), { code: "ECONNECTION" });
    await expect(runIdempotent("contact", "smtp-retry", 60_000, async () => {
      throw smtpFailure;
    }, protection, 100)).rejects.toBe(smtpFailure);

    await expect(runIdempotent("contact", "smtp-retry", 60_000, async () => ({ ok: true }), protection, 100))
      .resolves.toEqual({ ok: true });
  });

  it("meldet Redis-Ausfall und Timeout kontrolliert", async () => {
    const unavailable = store();
    unavailable.redis.failAll = new Error("network down");
    await expect(unavailable.protection.rateLimit("rate", 1_000, 1))
      .rejects.toMatchObject({ errorType: "unavailable" });

    const timeout = store();
    timeout.redis.failAll = Object.assign(new Error("timed out"), { name: "TimeoutError" });
    await expect(timeout.protection.rateLimit("rate", 1_000, 1))
      .rejects.toMatchObject({ errorType: "timeout" });
  });

  it("behält nach SMTP-Annahme bei fehlgeschlagener Redis-Bestätigung die Sperre bei", async () => {
    const { redis, protection } = store();
    redis.failComplete = new Error("confirmation unavailable");
    let mails = 0;
    const acceptedBySmtp = async () => {
      mails += 1;
      return { ok: true };
    };

    await expect(runIdempotent("contact", "accepted", 60_000, acceptedBySmtp, protection, 10))
      .rejects.toMatchObject({ errorType: "finalization" });
    await expect(runIdempotent("contact", "accepted", 60_000, acceptedBySmtp, protection, 1))
      .rejects.toMatchObject({ errorType: "pending" });
    expect(mails).toBe(1);
  });

  it("schlägt ohne Redis-Umgebungsvariablen geschlossen fehl", async () => {
    const request = new Request("https://dalemans.de/api/contact", { method: "POST" });
    await expect(checkRateLimit(request, "contact"))
      .rejects.toMatchObject({ errorType: "configuration" });
  });
});

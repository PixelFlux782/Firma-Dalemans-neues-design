import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ redis: vi.fn(), eval: vi.fn(), sendMail: vi.fn(), resolve: vi.fn(), deliver: vi.fn() }));
vi.mock("@upstash/redis", () => ({ Redis: class {
  constructor(config: unknown) { mocks.redis(config); }
  eval = mocks.eval;
} }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: mocks.sendMail }) } }));
vi.mock("@/lib/inquiry/server", async (original) => ({
  ...await original<typeof import("../src/lib/inquiry/server")>(),
  resolveInquiryItems: mocks.resolve,
  deliverInquiry: mocks.deliver,
}));

import { checkRateLimit } from "../src/lib/server/form-protection";
import { POST as contact } from "../src/app/api/contact/route";
import { POST as inquiry } from "../src/app/api/inquiry/route";

const custom = { url: "https://custom.invalid", token: "custom-test-token" };
const upstash = { url: "https://upstash.invalid", token: "upstash-test-token" };
const keys = ["FORM_PROTECTION_REST_URL", "FORM_PROTECTION_REST_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "FORM_RATE_LIMIT_HASH_SALT"];
function configure(pair: "custom" | "upstash", value = pair === "custom" ? custom : upstash) {
  const prefix = pair === "custom" ? "FORM_PROTECTION" : "UPSTASH_REDIS";
  vi.stubEnv(`${prefix}_REST_URL`, value.url);
  vi.stubEnv(`${prefix}_REST_TOKEN`, value.token);
}
function request(route: string, id = "isolated-submission-0001") {
  const body = route === "contact" ? {
    firstName: "Test", lastName: "Test", email: "test@example.test", subject: "Test",
    message: "Isolated configuration test", submissionId: id,
  } : {
    customerType: "private", idempotencyKey: id,
    contact: { firstName: "Test", lastName: "Test", email: "test@example.test", phone: "",
      street: "Testweg", houseNumber: "1", postalCode: "01234", city: "Testort", privacyAccepted: true },
    items: [{ productHandle: "test-product", variantId: "test-variant", quantity: 1 }],
  };
  return new Request(`https://isolated.invalid/api/${route}`, { method: "POST", body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of keys) vi.stubEnv(key, "");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mocks.eval.mockImplementation(async (script: string) => {
    if (script.includes("INCR")) return [1, 900_000];
    if (script.includes("string.sub")) return [1, "", 60_000];
    return 1;
  });
  mocks.sendMail.mockResolvedValue({ accepted: ["isolated@example.test"] });
  mocks.resolve.mockResolvedValue([]);
  mocks.deliver.mockResolvedValue({ accepted: true, inquiryId: "TEST", customerConfirmation: "sent" });
  for (const [key, value] of Object.entries({
    CONTACT_SMTP_HOST: "smtp.invalid", CONTACT_SMTP_PORT: "587", CONTACT_SMTP_SECURE: "false",
    CONTACT_SMTP_USER: "test", CONTACT_SMTP_PASSWORD: "test", CONTACT_FROM_EMAIL: "sender@example.test",
    CONTACT_TO_EMAIL: "isolated@example.test", CONTACT_MAIL_TEST_MODE: "false",
  })) vi.stubEnv(key, value);
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("Redis configuration selection without network", () => {
  it.each(["custom", "upstash"] as const)("accepts complete %s pair without additional required variable", async (pair) => {
    configure(pair);
    await expect(checkRateLimit(request("contact"), "contact")).resolves.toBeNull();
    expect(mocks.eval).toHaveBeenCalledOnce();
  });
  it("rejects missing configuration before Redis", async () => {
    await expect(checkRateLimit(request("contact"), "contact")).rejects.toMatchObject({ errorType: "configuration" });
    expect(mocks.eval).not.toHaveBeenCalled();
  });
  it.each(["custom", "upstash"] as const)("rejects either missing half of %s pair", async (pair) => {
    const prefix = pair === "custom" ? "FORM_PROTECTION" : "UPSTASH_REDIS";
    for (const half of ["URL", "TOKEN"]) {
      vi.stubEnv(`${prefix}_REST_URL`, ""); vi.stubEnv(`${prefix}_REST_TOKEN`, "");
      vi.stubEnv(`${prefix}_REST_${half}`, half === "URL" ? "https://partial.invalid" : "test-token");
      await expect(checkRateLimit(request("contact"), "contact")).rejects.toMatchObject({ errorType: "configuration" });
    }
    expect(mocks.eval).not.toHaveBeenCalled();
  });
  it("prefers complete custom pair when both pairs differ", async () => {
    vi.resetModules();
    configure("custom"); configure("upstash");
    const protection = await import("../src/lib/server/form-protection");
    await protection.checkRateLimit(request("contact"), "contact");
    expect(mocks.redis).toHaveBeenCalledWith(expect.objectContaining(custom));
  });
  it.each(["URL", "TOKEN"])("does not mix a partial custom pair with complete Upstash (%s)", async (half) => {
    configure("upstash");
    vi.stubEnv(`FORM_PROTECTION_REST_${half}`, half === "URL" ? custom.url : custom.token);
    await expect(checkRateLimit(request("contact"), "contact")).rejects.toMatchObject({ errorType: "configuration" });
    expect(mocks.eval).not.toHaveBeenCalled();
  });
});

describe.each([["contact", contact, 200], ["inquiry", inquiry, 201]] as const)("%s API with real protection and mocked I/O", (route, post, success) => {
  it("passes reservation, rate limit and completion before returning success", async () => {
    configure("custom");
    expect((await post(request(route))).status).toBe(success);
    expect(mocks.eval.mock.calls.map(([script]) => script.includes("INCR") ? "rate" : script.includes("string.sub") ? "reserve" : "complete")).toEqual(["reserve", "rate", "complete"]);
    expect(route === "contact" ? mocks.sendMail : mocks.deliver).toHaveBeenCalledOnce();
  });
  it("fails closed with sanitized configuration log before delivery", async () => {
    expect((await post(request(route))).status).toBe(503);
    expect(console.error).toHaveBeenCalledWith(JSON.stringify({ component: "form-delivery", route, event: "form_protection_failed", errorType: "configuration" }));
    expect(mocks.sendMail).not.toHaveBeenCalled(); expect(mocks.deliver).not.toHaveBeenCalled();
    expect(mocks.eval).not.toHaveBeenCalled();
  });
  it("returns 429 with Retry-After when rate limit is exceeded", async () => {
    configure("custom");
    mocks.eval.mockImplementation(async (script: string) => script.includes("INCR") ? [6, 900_000] : script.includes("string.sub") ? [1, "", 60_000] : 1);
    const response = await post(request(route));
    expect(response.status).toBe(429); expect(response.headers.get("Retry-After")).toBe("900");
    expect(mocks.sendMail).not.toHaveBeenCalled(); expect(mocks.deliver).not.toHaveBeenCalled();
  });
  it("returns 503 for Redis outage without leaking diagnostic details", async () => {
    configure("custom"); mocks.eval.mockRejectedValue(new Error("private-test-diagnostic"));
    const response = await post(request(route));
    expect(response.status).toBe(503); expect(await response.text()).not.toContain("private-test-diagnostic");
    expect(mocks.sendMail).not.toHaveBeenCalled(); expect(mocks.deliver).not.toHaveBeenCalled();
  });
});

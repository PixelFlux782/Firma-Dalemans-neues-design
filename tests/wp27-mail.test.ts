import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mail = vi.hoisted(() => ({ sendMail: vi.fn(), createTransport: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: mail.createTransport } }));
vi.mock("@/lib/commerce/service", () => ({ getProductByHandle: vi.fn() }));
const protection = vi.hoisted(() => ({ rate: vi.fn(), run: vi.fn() }));
vi.mock("@/lib/server/form-protection", async (original) => {
  const actual = await original<typeof import("../src/lib/server/form-protection")>();
  return { ...actual, checkRateLimit: protection.rate, runIdempotent: protection.run };
});

describe("WP27 isolated mail boundary (no network)", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    for (const [key, value] of Object.entries({
      CONTACT_SMTP_HOST: "smtp.invalid", CONTACT_SMTP_PORT: "587", CONTACT_SMTP_SECURE: "false",
      CONTACT_SMTP_USER: "test", CONTACT_SMTP_PASSWORD: "test", CONTACT_FROM_EMAIL: "sender@example.test",
      CONTACT_MAIL_TEST_MODE: "true", CONTACT_TEST_TO_EMAIL: "isolated@example.test",
      INQUIRY_MAIL_TEST_MODE: "true", INQUIRY_TEST_TO_EMAIL: "isolated@example.test",
    })) vi.stubEnv(key, value);
    mail.createTransport.mockReturnValue({ sendMail: mail.sendMail });
    mail.sendMail.mockResolvedValue({ accepted: ["isolated@example.test"] });
    protection.rate.mockResolvedValue(null);
    protection.run.mockImplementation(async (_route, _key, _ttl, send) => send());
  });

  const request = () => new Request("https://staging.invalid/api/contact", { method: "POST", body: JSON.stringify({
    firstName: "Test", lastName: "WP27", email: "customer@example.test", subject: "WP27",
    message: "Isolated release test only", submissionId: "wp27-isolated-000001",
  }) });

  it("contact sends only to isolated recipient with mandatory STARTTLS", async () => {
    const { POST } = await import("../src/app/api/contact/route");
    expect((await POST(request())).status).toBe(200);
    expect(mail.createTransport).toHaveBeenCalledWith(expect.objectContaining({ secure: false, requireTLS: true }));
    expect(mail.sendMail).toHaveBeenCalledOnce();
    expect(mail.sendMail.mock.calls[0][0].to).toBe("isolated@example.test");
  });

  it("returns 429 with retry header before SMTP", async () => {
    protection.rate.mockResolvedValue(60);
    const { POST } = await import("../src/app/api/contact/route");
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("returns 503 on Redis failure before SMTP", async () => {
    const { FormProtectionError } = await import("../src/lib/server/form-protection");
    protection.run.mockRejectedValue(new FormProtectionError("unavailable", "test"));
    const { POST } = await import("../src/app/api/contact/route");
    expect((await POST(request())).status).toBe(503);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("fails closed when test recipient is missing", async () => {
    vi.stubEnv("CONTACT_TEST_TO_EMAIL", "");
    const { POST } = await import("../src/app/api/contact/route");
    expect((await POST(request())).status).toBe(503);
    expect(mail.sendMail).not.toHaveBeenCalled();
  });

  it("reports SMTP failure as 502 without exposing details", async () => {
    mail.sendMail.mockRejectedValue(new Error("private diagnostic"));
    const { POST } = await import("../src/app/api/contact/route");
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private diagnostic");
  });

  it.each(["false", "true"])("inquiry isolates both mails (implicit TLS %s)", async (secure) => {
    vi.stubEnv("CONTACT_SMTP_SECURE", secure);
    vi.stubEnv("CONTACT_SMTP_PORT", secure === "true" ? "465" : "587");
    const { deliverInquiry } = await import("../src/lib/inquiry/server");
    const result = await deliverInquiry({ contact: { firstName: "Test", lastName: "WP27", organization: "", email: "customer@example.test", phone: "", street: "Testweg", houseNumber: "1", city: "Testort", postalCode: "01234", differentDeliveryAddress: false, deliveryFirstName: "", deliveryLastName: "", deliveryStreet: "", deliveryHouseNumber: "", deliveryPostalCode: "", deliveryCity: "", message: "Test", privacyAccepted: true }, customerType: "private", items: [], idempotencyKey: "wp27-isolated", website: "" }, [], "DLMNS-TEST");
    expect(result.customerConfirmation).toBe("sent");
    expect(mail.sendMail).toHaveBeenCalledTimes(2);
    expect(mail.sendMail.mock.calls.map(([message]) => message.to)).toEqual(["isolated@example.test", "isolated@example.test"]);
    expect(mail.createTransport).toHaveBeenCalledWith(expect.objectContaining({ secure: secure === "true", requireTLS: secure !== "true" }));
  });

  it("preserves internal acceptance when customer confirmation fails", async () => {
    mail.sendMail.mockResolvedValueOnce({ accepted: ["isolated@example.test"] }).mockRejectedValueOnce(new Error("test failure"));
    const { deliverInquiry } = await import("../src/lib/inquiry/server");
    const result = await deliverInquiry({ contact: { firstName: "Test", lastName: "WP27", organization: "", email: "customer@example.test", phone: "", street: "Testweg", houseNumber: "1", city: "Testort", postalCode: "01234", differentDeliveryAddress: false, deliveryFirstName: "", deliveryLastName: "", deliveryStreet: "", deliveryHouseNumber: "", deliveryPostalCode: "", deliveryCity: "", message: "Test", privacyAccepted: true }, customerType: "private", items: [], idempotencyKey: "wp27-isolated", website: "" }, [], "DLMNS-TEST");
    expect(result).toMatchObject({ accepted: true, customerConfirmation: "failed" });
    expect(mail.sendMail).toHaveBeenCalledTimes(2);
  });
});

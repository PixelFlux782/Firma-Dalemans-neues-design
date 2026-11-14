import { beforeEach, expect, it, vi } from "vitest";
import { parseInquiryContact, addressFields, deliveryFields } from "../src/lib/inquiry/contact";
vi.mock("server-only", () => ({}));
const mail = vi.hoisted(() => ({ sendMail: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => mail } }));
vi.mock("@/lib/commerce/service", () => ({ getProductByHandle: vi.fn() }));
import { validateInquiryBody, deliverInquiry, InquiryInputError } from "../src/lib/inquiry/server";
const contact = { firstName: " A ", lastName: " Test ", street: " Testweg ", houseNumber: " 1a ", postalCode: " 01234 ", city: " Testort ", organization: "", email: "test@example.test", phone: "", message: "", privacyAccepted: true, differentDeliveryAddress: false };
const body = { contact, customerType: "business", items: [{ productHandle: "test", variantId: "v1", quantity: 2, selectedAddons: [], technicalInquiry: "Details" }], idempotencyKey: "address-test-123456", website: "" };
beforeEach(() => {
  vi.clearAllMocks();
  for (const [key, value] of Object.entries({ CONTACT_SMTP_HOST: "smtp.invalid", CONTACT_SMTP_PORT: "587", CONTACT_SMTP_SECURE: "false", CONTACT_SMTP_USER: "test", CONTACT_SMTP_PASSWORD: "test", CONTACT_FROM_EMAIL: "sender@example.test", INQUIRY_MAIL_TEST_MODE: "true", INQUIRY_TEST_TO_EMAIL: "mock@example.test" })) vi.stubEnv(key, value);
  mail.sendMail.mockResolvedValue({ accepted: ["mock@example.test"] });
});
it("trims addresses, preserves zeroes and permits international postal codes", () => {
  expect(validateInquiryBody(body).contact).toMatchObject({ firstName: "A", postalCode: "01234" });
  expect(parseInquiryContact({ ...contact, postalCode: "SW1A 1AA" }).errors).toEqual({});
});
it.each(addressFields)("rejects missing, malformed and overlong %s on client and server", (name, _label, max) => {
  for (const value of ["   ", null, {}, "---", "a".repeat(max + 1)]) {
    const raw = { ...contact, [name]: value };
    expect(parseInquiryContact(raw).errors[name]).toBeTruthy();
    expect(() => validateInquiryBody({ ...body, contact: raw })).toThrow(InquiryInputError);
  }
});
it("requires all delivery fields only while enabled and discards stale data", () => {
  const raw = { ...contact, differentDeliveryAddress: true };
  for (const field of deliveryFields) expect(parseInquiryContact(raw).errors[field]).toBeTruthy();
  expect(validateInquiryBody({ ...body, contact: { ...contact, deliveryStreet: "STALE" } }).contact.deliveryStreet).toBe("");
});
it.each(["business", "private"])("renders both mail formats and preserves line details for %s", async (customerType) => {
  for (const differentDeliveryAddress of [false, true]) {
    const parsed = validateInquiryBody({ ...body, customerType, contact: { ...contact, differentDeliveryAddress, deliveryFirstName: "Ada", deliveryLastName: "Test", deliveryStreet: "Other <road>", deliveryHouseNumber: "2", deliveryPostalCode: "00123", deliveryCity: "Othercity" } });
    const line = { productName: "Product", articleNumber: "SKU1", variant: "Variant A", options: ["Color: blue"], addons: ["Addon"], quantity: 2, unitLabel: "Stueck", tier: "Tier", unitNet: { amount: "10", currencyCode: "EUR" }, totalNet: { amount: "20", currencyCode: "EUR" }, technicalInquiry: "Technical details" };
    await deliverInquiry(parsed, [line, { ...line, variant: "Variant B" }], "TEST");
    for (const [message] of mail.sendMail.mock.calls.slice(-2)) {
      for (const format of [message.text, message.html]) {
        for (const value of ["Rechnungsanschrift", "Testweg 1a", "01234 Testort", "SKU1", "Variant A", "Variant B", "Technical details", "Addon"]) expect(format).toContain(value);
        expect(format).toContain(differentDeliveryAddress ? "00123 Othercity" : "Lieferanschrift: wie Rechnungsanschrift");
      }
      if (differentDeliveryAddress) expect(message.html).toContain("Other &lt;road&gt;");
    }
  }
});

import { beforeEach, expect, it, vi } from "vitest";
import { localGliderProducts } from "../src/lib/commerce/providers/local-glider-products";
import { publicCommerceProducts } from "../src/lib/commerce/publication";
import { cartLineFromProduct } from "../src/lib/commerce/cart/lines";
import { buildSearchIndex } from "../src/lib/search/index";
import { finderInquiryMessage, standardGliderMatch, type StandardFinderInput } from "../src/lib/finder/standard";

vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ product: null as unknown, send: vi.fn() }));
vi.mock("@/lib/commerce/service", () => ({ getProductByHandle: vi.fn(async () => state.product) }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: state.send }) } }));
import { deliverInquiry, resolveInquiryItems, validateInquiryBody } from "../src/lib/inquiry/server";

beforeEach(() => { vi.clearAllMocks(); state.product = localGliderProducts[0]; });

it("publishes exactly five articles at the approved four-piece set prices", () => {
  expect(localGliderProducts.map((p) => [p.variants[0].sku, p.variants[0].price?.amount])).toEqual([
    ["GSTGL", "1.36"], ["A1021FG", "6.90"], ["ZGGF30", "16.00"], ["A1021NG", "8.00"], ["A1021NGK", "6.40"],
  ]);
  expect(new Set(localGliderProducts.map((p) => p.handle)).size).toBe(5);
  expect(localGliderProducts.every((p) => p.quantity.unit === "set" && p.quantity.unitLabel === "Garnitur (4 Stück)")).toBe(true);
  expect(JSON.stringify(localGliderProducts[0])).toContain("12°");
  expect(JSON.stringify(localGliderProducts[0])).not.toContain("15°");
  expect(localGliderProducts.some((p) => p.handle.includes("teppichboden"))).toBe(false);
  const documents = buildSearchIndex(localGliderProducts, [], []).filter((doc) => doc.type === "product");
  expect(documents).toHaveLength(5);
  expect(new Set(documents.map((doc) => doc.url)).size).toBe(5);
});

it("retains two distinct color variants with the same SKU through cart quantity changes", () => {
  const product = localGliderProducts[3];
  expect(product.variants.map((v) => v.selectedOptions.find((o) => o.name === "Farbe")?.value)).toEqual(["Natur", "Braun"]);
  for (const variant of product.variants) {
    expect(variant.sku).toBe("A1021NG");
    expect(cartLineFromProduct({ product, variant, quantity: 5 }).variantTitle).toContain(variant.title);
  }
});

it("rejects the historic colorless variant and ignores client prices", async () => {
  state.product = localGliderProducts[3];
  await expect(resolveInquiryItems([{ productHandle: "filzgleiter-mit-stift", variantId: "local-variant-glider-felt-nail", quantity: 5, selectedAddons: [] }])).rejects.toThrow();
  const product = localGliderProducts[3];
  const [line] = await resolveInquiryItems([{ productHandle: product.handle, variantId: product.variants[1].id, quantity: 5, selectedAddons: [], price: 0.01 } as never]);
  expect(line.unitNet?.amount).toBe("8.00");
  expect(line.totalNet?.amount).toBe("40.00");
  expect(line.options).toContain("Farbe: Braun");
});

it("allows trusted unpriced inquiry products without SKU and retains quantity validation", async () => {
  const product = structuredClone(localGliderProducts[0]);
  Object.assign(product.variants[0], { price: null, priceDataStatus: null, priceStatus: "on_request", sku: null, erpArticleNumber: null });
  state.product = product;
  const item = { productHandle: product.handle, variantId: product.variants[0].id, quantity: 3, selectedAddons: [], technicalInquiry: "Gestellform: Ovalrohr; Boden: Teppich; Maß: 25 × 15 mm" };
  const [resolved] = await resolveInquiryItems([item]);
  expect(resolved.unitNet).toBeNull();
  expect(resolved.technicalInquiry).toBe(item.technicalInquiry);
  expect(resolved.options).toContain("Winkel: 12° abgeschrägt");
  for (const quantity of [0, 1.5, 100001, NaN]) await expect(resolveInquiryItems([{ ...item, quantity }])).rejects.toThrow();
  await expect(resolveInquiryItems([{ ...item, selectedAddons: ["fake"] }])).rejects.toThrow();
});

it("never publishes DEV fixtures, including development", () => {
  const fixture = structuredClone(localGliderProducts[0]);
  fixture.variants[0].sku = "DEV-FAKE";
  expect(publicCommerceProducts([fixture], "development")).toEqual([]);
});

const input: StandardFinderInput = { frame: "steel", dimensions: "20", floor: "unknown", quantity: 20, model: "", mounting: "standard", angle: "12", height: "10", notes: "Foto vorhanden" };
it("recommends only confirmed fit and transfers all technical inquiry data", () => {
  expect(standardGliderMatch(input)?.sku).toBe("GSTGL");
  expect(standardGliderMatch({ ...input, angle: "15" })).toBeNull();
  expect(standardGliderMatch({ ...input, dimensions: "25" })).toBeNull();
  expect(standardGliderMatch({ ...input, model: "310c", mounting: "rivet" })).toBeNull();
  expect(standardGliderMatch({ ...input, model: "310", mounting: "rivet" })?.sku).toBe("ZGGF30");
  const message = finderInquiryMessage(input);
  for (const value of ["Stahlrohr", "20", "Unbekannt", "20 Stück", "4 Stück", "12", "10", "Foto vorhanden"]) expect(message).toContain(value);
  expect(message).not.toMatch(/DEV-|0,00/);
});

it("includes color and physical quantity in both emails and never renders missing prices as zero", async () => {
  for (const [key, value] of Object.entries({ CONTACT_SMTP_HOST: "invalid", CONTACT_SMTP_PORT: "587", CONTACT_SMTP_USER: "test", CONTACT_SMTP_PASSWORD: "test", CONTACT_SMTP_SECURE: "false", CONTACT_FROM_EMAIL: "sender@example.test", INQUIRY_TO_EMAIL: "internal@example.test" })) vi.stubEnv(key, value);
  state.send.mockResolvedValue({ accepted: ["test"] });
  const product = localGliderProducts[3]; state.product = product;
  const body = validateInquiryBody({ contact: { firstName: "Test", lastName: "Tester", street: "Testweg", houseNumber: "1a", postalCode: "01234", city: "Testort", email: "test@example.test", privacyAccepted: true }, customerType: "business", idempotencyKey: "glider-test-123456789", items: [{ productHandle: product.handle, variantId: product.variants[1].id, quantity: 5 }] });
  const lines = await resolveInquiryItems(body.items);
  lines[0].technicalInquiry = finderInquiryMessage(input) + "\n<script>alert(1)</script>";
  await deliverInquiry(body, lines);
  for (const [email] of state.send.mock.calls) {
    expect(email.text).toContain("Farbe: Braun"); expect(email.html).toContain("BRAUN");
    expect(email.text).toContain("20 Stück");
    expect(email.text).toContain("Foto vorhanden");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).not.toContain("<script>");
  }
  state.send.mockClear();
  await deliverInquiry(body, [{ ...lines[0], unitNet: null, totalNet: null }]);
  for (const [email] of state.send.mock.calls) { expect(email.text).toContain("Preis auf Anfrage"); expect(email.html).not.toContain("0,00"); }
  vi.unstubAllEnvs();
});

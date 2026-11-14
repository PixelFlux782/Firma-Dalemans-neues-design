import { expect, test } from "@playwright/test";
import { buildCommerceProductStructuredData } from "../src/lib/commerce/product-structured-data";
import type { CommerceProduct, CommerceProductVariant } from "../src/lib/commerce/types";

function variant(overrides: Partial<CommerceProductVariant> = {}): CommerceProductVariant {
  return { id: "variant-1", title: "Standard", availableForSale: true, sku: "SKU-1", selectedOptions: [], price: { amount: "49.90", currencyCode: "EUR" }, compareAtPrice: null, image: null, priceStatus: "fixed", priceDataStatus: "verified", availability: "in_stock", availabilityNote: null, finderAttributes: null, ...overrides };
}
function product(variants: CommerceProductVariant[]): CommerceProduct {
  return { id: "product-1", handle: "testprodukt", title: "Testprodukt", shortDescription: "Kurz", description: "Beschreibung", descriptionHtml: "<p>Beschreibung</p>", availableForSale: true, featuredImage: { url: "/test.jpg", altText: "Test", width: null, height: null }, images: [{ url: "/test.jpg", altText: "Test", width: null, height: null }], variants, priceRange: { min: variants[0]?.price ?? null, max: variants.at(-1)?.price ?? null }, priceStatus: "fixed", availability: "in_stock", availabilityNote: null, collectionHandles: [], specifications: [], compatibility: [], suitableFor: [], quantity: { unit: "piece", unitLabel: "Stück", minimum: 1, step: 1, note: null }, measureGuide: [], applicationNotes: [], notes: [], accessories: [], consultationNote: null, faq: [], seo: { title: null, description: null }, updatedAt: "2026-01-01T00:00:00.000Z" };
}

test("creates an Offer from a verified public EUR price", () => {
  const data = buildCommerceProductStructuredData(product([variant()]), "/produkte/artikel/testprodukt");
  expect(data?.["@type"]).toBe("Product");
  expect(data?.offers).toMatchObject({ "@type": "Offer", price: "59.38", priceCurrency: "EUR", availability: "https://schema.org/InStock" });
});
test("omits Product for inquiry-only, incomplete, or unverified price data", () => {
  expect(buildCommerceProductStructuredData(product([variant({ price: null, priceStatus: "on_request" })]), "/anfrage")).toBeNull();
  expect(buildCommerceProductStructuredData(product([variant({ priceDataStatus: "source_unreleased" })]), "/unverified")).toBeNull();
  expect(buildCommerceProductStructuredData(product([variant({ price: { amount: "0", currencyCode: "EUR" } })]), "/zero")).toBeNull();
});
test("keeps valid variants as separate Offers and omits uncertain availability", () => {
  const data = buildCommerceProductStructuredData(product([variant(), variant({ id: "variant-2", sku: "SKU-2", price: { amount: "59.90", currencyCode: "EUR" }, availability: "on_request" })]), "/produkte/artikel/testprodukt");
  expect(data?.offers).toHaveLength(2);
  expect((data?.offers as Array<Record<string, unknown>>)[1]).not.toHaveProperty("availability");
});

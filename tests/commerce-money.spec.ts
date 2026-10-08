import { expect, test } from "@playwright/test";
import { lowestProductUnitPrice } from "../src/lib/commerce/money";
import type { CommerceProduct, CommerceProductVariant } from "../src/lib/commerce/types";

function variant(id: string, price: string | null, tiers: Array<[string, number | null]> = []): CommerceProductVariant {
  return {
    id, title: id, availableForSale: true, sku: id, selectedOptions: [],
    price: price === null ? null : { amount: price, currencyCode: "EUR" }, compareAtPrice: null, image: null,
    priceStatus: price === null ? "unavailable" : "fixed", priceDataStatus: "verified", availability: "in_stock",
    availabilityNote: null, finderAttributes: null,
    priceTiers: tiers.map(([amount, minimumQuantity], index) => ({
      id: `${id}-${index}`, price: { amount, currencyCode: "EUR" }, minimumQuantity, maximumQuantity: null, label: null,
    })),
  };
}

function product(variants: CommerceProductVariant[]): CommerceProduct {
  return {
    id: "p", handle: "p", title: "Produkt", shortDescription: "", description: "", descriptionHtml: "",
    availableForSale: true, featuredImage: null, images: [], variants,
    priceRange: { min: { amount: "75.00", currencyCode: "EUR" }, max: { amount: "75.00", currencyCode: "EUR" } },
    priceStatus: "from", availability: "in_stock", availabilityNote: null, collectionHandles: [], specifications: [],
    compatibility: [], suitableFor: [], quantity: { unit: "piece", unitLabel: "Stück", minimum: 1, step: 1, note: null },
    measureGuide: [], applicationNotes: [], notes: [], accessories: [], consultationNote: null, faq: [],
    seo: { title: null, description: null }, updatedAt: "2026-10-08",
  };
}

test("findet die günstigste letzte oder mittlere Mengenstaffel mit ihrer Mindestmenge", () => {
  expect(lowestProductUnitPrice(product([variant("last", "75", [["69", 50], ["62.50", 100]])]))).toMatchObject({
    price: { amount: "62.50", currencyCode: "EUR" }, minimumQuantity: 100, variantId: "last",
  });
  expect(lowestProductUnitPrice(product([variant("middle", "75", [["60", 50], ["65", 100]])]))).toMatchObject({
    price: { amount: "60", currencyCode: "EUR" }, minimumQuantity: 50, variantId: "middle",
  });
});

test("berücksichtigt alle kaufbaren Varianten und ignoriert nicht kaufbare", () => {
  const unavailable = variant("unavailable", "20", [["10", 100]]);
  unavailable.availableForSale = false;
  expect(lowestProductUnitPrice(product([
    variant("first", "75", [["62.50", 100]]),
    variant("second", "70", [["55", 50]]),
    unavailable,
  ]))).toMatchObject({ price: { amount: "55" }, minimumQuantity: 50, variantId: "second" });
});

test("nutzt einen validen Basispreis ohne Staffeln und erfindet keine fehlenden Preise", () => {
  expect(lowestProductUnitPrice(product([variant("base", "75")]))).toMatchObject({
    price: { amount: "75" }, minimumQuantity: 1,
  });
  expect(lowestProductUnitPrice(product([variant("missing", null)]))).toBeNull();
  expect(lowestProductUnitPrice(product([variant("invalid", "NaN")]))).toBeNull();
});

test("vermischt keine Währungen", () => {
  const mixed = variant("mixed", "75", [["10", 100]]);
  mixed.priceTiers![0].price.currencyCode = "USD";
  expect(lowestProductUnitPrice(product([mixed]))).toMatchObject({ price: { amount: "75", currencyCode: "EUR" } });
});

test("Bild, Titel und Modell-Button verwenden mobil dieselbe Produkt-URL", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produkte/stapelstuehle");
  const card = page.locator("#modelle article").first();
  const links = card.locator("a");
  await expect(links).toHaveCount(3);
  const hrefs = await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")));
  expect(new Set(hrefs).size).toBe(1);
  await links.nth(0).focus();
  await expect(links.nth(0)).toBeFocused();
});

test("Produktdetail nennt Preis und passende Mindestmenge derselben Staffel", async ({ page }) => {
  await page.goto("/produkte/stapelstuehle/1021");
  const hint = page.getByTestId("lowest-tier-price");
  await expect(hint).toBeVisible();
  await expect(hint).toContainText(/^ab .+ \/ StückBei Abnahme von mindestens \d+ Stück$/);
});

import { expect, test } from "@playwright/test";
import { mapShopifyProduct } from "../src/lib/shopify/mappers/product";
import type { ShopifyProduct } from "../src/lib/shopify/types/storefront";

const shopifyProductFixture: ShopifyProduct = {
  id: "gid://shopify/Product/test-product",
  handle: "test-product",
  title: "Testprodukt",
  description: "Nur für den Mapper-Test.",
  descriptionHtml: "<p>Nur für den Mapper-Test.</p>",
  availableForSale: true,
  featuredImage: {
    url: "https://cdn.shopify.com/test-product.jpg",
    altText: "Testansicht",
    width: 1200,
    height: 900,
  },
  images: { nodes: [] },
  variants: {
    nodes: [
      {
        id: "gid://shopify/ProductVariant/test-variant",
        title: "Standard",
        availableForSale: true,
        sku: "TEST-1",
        selectedOptions: [{ name: "Ausführung", value: "Standard" }],
        price: { amount: "12.50", currencyCode: "EUR" },
        compareAtPrice: null,
        image: null,
      },
    ],
  },
  priceRange: {
    minVariantPrice: { amount: "12.50", currencyCode: "EUR" },
    maxVariantPrice: { amount: "12.50", currencyCode: "EUR" },
  },
  seo: { title: null, description: null },
  updatedAt: "2026-08-21T12:00:00Z",
};

test("Shopify-Produkte werden in das interne Commerce-Modell übersetzt", () => {
  const product = mapShopifyProduct(shopifyProductFixture);

  expect(product).toMatchObject({
    id: shopifyProductFixture.id,
    handle: "test-product",
    title: "Testprodukt",
    featuredImage: {
      altText: "Testansicht",
      width: 1200,
      height: 900,
    },
    priceRange: {
      min: { amount: "12.50", currencyCode: "EUR" },
      max: { amount: "12.50", currencyCode: "EUR" },
    },
  });
  expect(product.variants).toHaveLength(1);
  expect(product.variants[0]).toMatchObject({
    sku: "TEST-1",
    compareAtPrice: null,
    price: { amount: "12.50", currencyCode: "EUR" },
    priceStatus: "fixed",
    availability: "in_stock",
  });
});

test("Shop-Startseite lädt Collections ausschließlich als nutzbare Shop-Einstiege", async ({ page }) => {
  await page.goto("/shop");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Ausstattung, Ersatzteile und Zubehör",
  );
  await expect(page.getByRole("link", { name: "Produkte entdecken" })).toHaveAttribute(
    "href",
    "#collections",
  );
  await expect(page.getByRole("link", { name: "Gleiter & Bodenschutz ansehen" })).toHaveAttribute(
    "href",
    "/shop/gleiter-bodenschutz",
  );
  await expect(
    page.getByText(
      "Preise und Verfügbarkeit werden erst nach finaler Sortimentsprüfung verbindlich.",
    ),
  ).toBeVisible();
});

test("Collection-Seite zeigt Produkte, Breadcrumb und kanonische Metadaten", async ({ page }) => {
  await page.goto("/shop/gleiter-bodenschutz");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gleiter & Bodenschutz");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Shop");
  await expect(page.getByRole("link", { name: "Filzgleiter mit Stift ansehen" })).toHaveAttribute(
    "href",
    "/shop/produkt/filzgleiter-mit-stift",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/shop\/gleiter-bodenschutz$/,
  );
  await expect(page).toHaveTitle(/Gleiter & Bodenschutz/);
});

test("Produktdetailseite wird vollständig aus dem Commerce-Modell gerendert", async ({ page }) => {
  await page.goto("/shop/produkt/kunststoff-gestellgleiter");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kunststoff-Gestellgleiter");
  await expect(page.getByText("Technische Informationen")).toBeVisible();
  await expect(page.getByText("Kompatibilität", { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-price-status="on_request"]')).toContainText("Preis auf Anfrage");
  await expect(page.locator('[data-availability="on_request"]')).toContainText("Verfügbarkeit auf Anfrage");
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.some((entry) => entry.includes('"@type":"Product"'))).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/shop\/produkt\/kunststoff-gestellgleiter$/,
  );
});

test("Variantenwahl hält nur existierende Kombinationen aktiv", async ({ page }) => {
  await page.goto("/shop/produkt/kunststoff-gestellgleiter");

  await expect(page.getByTestId("selected-variant")).toContainText("Rund · Ø 18 mm");
  await page.getByRole("button", { name: "Ø 22 mm" }).click();
  await expect(page.getByTestId("selected-variant")).toContainText("Rund · Ø 22 mm");
  await expect(page.getByRole("button", { name: "Ø 22 mm" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Vierkant" }).click();
  await expect(page.getByTestId("selected-variant")).toContainText("Vierkant · 20 × 20 mm");
  await expect(page.getByRole("button", { name: "20 × 20 mm" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Ausführung persönlich klären" })).toHaveAttribute(
    "href",
    /variante=Vierkant(?:\+|%20)%C2%B7(?:\+|%20)20(?:\+|%20)%C3%97(?:\+|%20)20(?:\+|%20)mm/,
  );
});

test("leere Collection führt mit einem echten Empty State zur Beratung", async ({ page }) => {
  await page.goto("/shop/muster-beratung");

  await expect(page.getByTestId("collection-empty-state")).toBeVisible();
  await expect(page.getByText("Noch kein Produkt zur direkten Auswahl.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Bedarf persönlich klären" })).toHaveAttribute(
    "href",
    "/kontakt?anliegen=Muster%20und%20Beratung",
  );
});

test("unbekannte Commerce-Handles liefern 404", async ({ request }) => {
  expect((await request.get("/shop/unbekannte-collection")).status()).toBe(404);
  expect((await request.get("/shop/produkt/unbekanntes-produkt")).status()).toBe(404);
});

test("Shop, Collection und Produkt bleiben auf Mobilgeräten ohne horizontalen Überlauf", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });

  for (const route of [
    "/shop",
    "/shop/gleiter-bodenschutz",
    "/shop/produkt/kunststoff-gestellgleiter",
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
});

test("Shop bleibt auf Unterseiten in der Navigation aktiv", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/shop/produkt/filzgleiter-mit-stift");
  await expect(
    page
      .getByRole("navigation", { name: "Hauptnavigation", exact: true })
      .getByRole("link", { name: "Shop", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

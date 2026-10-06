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

test("Produktübersicht lädt Collections als nutzbare Sortimenteinstiege", async ({ page }) => {
  await page.goto("/produkte");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Langlebige Ausstattung für flexible Räume",
  );
  await expect(page.getByRole("link", { name: "Sortiment entdecken" })).toHaveAttribute(
    "href",
    "#sortiment",
  );
  await expect(page.locator('a[href="/produkte/sortiment/gleiter-bodenschutz"]')).toBeVisible();
});

test("Collection-Seite zeigt Produkte, Breadcrumb und kanonische Metadaten", async ({ page }) => {
  await page.goto("/produkte/sortiment/gleiter-bodenschutz");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gleiter & Bodenschutz");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Produkte");
  await expect(page.getByRole("link", { name: "Filzgleiter mit Stift ansehen" })).toHaveAttribute(
    "href",
    "/produkte/artikel/filzgleiter-mit-stift",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/produkte\/sortiment\/gleiter-bodenschutz$/,
  );
  await expect(page).toHaveTitle(/Gleiter & Bodenschutz/);
});

test("Produktdetailseite wird vollständig aus dem Commerce-Modell gerendert", async ({ page }) => {
  await page.goto("/produkte/artikel/kunststoff-gestellgleiter");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kunststoff-Gestellgleiter");
  await expect(page.getByText("Technische Daten")).toBeVisible();
  await expect(page.getByText("Kompatibilität", { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-price-status="on_request"]')).toContainText("Preis auf Anfrage");
  await expect(page.locator('[data-availability="on_request"]')).toContainText("Verfügbarkeit auf Anfrage");
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.some((entry) => entry.includes('"@type":"Product"'))).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/produkte\/artikel\/kunststoff-gestellgleiter$/,
  );
});

test("Alternativbilder tauschen auf Artikelseiten das große Produktbild", async ({ page }) => {
  await page.goto("/produkte/artikel/buchablage-nachruesten");

  const mainImage = page.locator(".product-visual__product img").first();
  await expect(mainImage).toHaveAttribute("alt", /Buchablage unter der Sitzfläche/);

  await page.getByRole("button", { name: /Bild 3:/ }).click();

  await expect(mainImage).toHaveAttribute("alt", /montierte Ansicht/);
});

test("Schreibtablar zeigt die drei neuen Alternativbilder", async ({ page }) => {
  await page.goto("/produkte/schreibtablare");

  const mainImage = page.locator(".product-visual__product img").first();
  await expect(page.getByRole("button", { name: /Bild 2: Stapelstuhl mit montiertem Schreibtablar von vorne/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Bild 3: Schreibtablar mit Gestell und Befestigung von unten/ })).toBeVisible();
  await page.getByRole("button", { name: /Bild 4: Holz-Schreibtablar mit eingelassener Stiftablage/ }).click();
  await expect(mainImage).toHaveAttribute("alt", "Holz-Schreibtablar mit eingelassener Stiftablage");
});

test("Buchablage zeigt Preis und SKU aus der aktuellen Preisliste", async ({ page }) => {
  await page.goto("/produkte/artikel/buchablage-nachruesten");

  await expect(page.getByText("27,50 €").first()).toBeVisible();
  await expect(page.getByText("BU1021C", { exact: true }).first()).toBeVisible();
});

test("Filzgleiter-Artikel verwendet neues Haupt- und Maßbild", async ({ page }) => {
  await page.goto("/produkte/artikel/filzgleiter-mit-stift");

  const mainImage = page.locator(".product-visual__product img").first();
  await expect(mainImage).toHaveAttribute("alt", /Weißer gerippter Möbelgleiter mit schräger Auflagefläche/);
  await page.getByRole("button", { name: /Bild 2: Weißer gerippter Möbelgleiter mit Maßangaben/ }).click();
  await expect(mainImage).toHaveAttribute("alt", /Weißer gerippter Möbelgleiter mit Maßangaben/);
});

test("Galeriebild wird beim nächsten Stapelstuhl-Variantenwechsel wieder durch das Variantenbild ersetzt", async ({ page }) => {
  await page.goto("/produkte/stapelstuehle/buende");

  const gallery = page.getByTestId("chair-gallery");
  const mainImage = gallery.locator(".product-visual__product img");
  await expect(mainImage).toHaveAttribute("alt", /ungepolstert/);

  await page.getByRole("radio", { name: /Sitzpolster/ }).check({ force: true });
  await expect(mainImage).toHaveAttribute("alt", /Sitzpolster, Stoffgruppe 2/);

  await gallery.getByRole("button", { name: /Mehrere gestapelte Stühle/ }).click();
  await expect(mainImage).toHaveAttribute("alt", /Mehrere gestapelte Stühle/);

  await page.getByRole("radio", { name: "Gruppe 3" }).check({ force: true });
  await expect(mainImage).toHaveAttribute("alt", /Sitzpolster, Stoffgruppe 3/);

  await gallery.getByRole("button", { name: /Mehrere gestapelte Stühle/ }).click();
  await page.getByRole("checkbox", { name: /Reihenverbindung/ }).check({ force: true });
  await expect(mainImage).toHaveAttribute("alt", /Sitzpolster, Stoffgruppe 3/);

  await page.getByText("Sitz + Rücken", { exact: true }).click();
  await expect(page.getByTestId("selected-chair-variant")).toContainText("Sitz- und Rückenpolster · Gruppe 3 · Mit Reihenverbindung");
  await expect(mainImage).toHaveAttribute("alt", /Sitz- und Rückenpolster, Stoffgruppe 3/);
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
  await expect(page.getByRole("link", { name: "Angebot anfragen" })).toHaveAttribute(
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

test("entfernte Ersatzteilseite und ihre Verweise sind nicht mehr vorhanden", async ({ request, page }) => {
  expect((await request.get("/produkte/ersatzteile-kleinteile")).status()).toBe(404);

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("/produkte/ersatzteile-kleinteile");

  await page.goto("/produkte/kategorien/transportwagen-zubehoer");
  await expect(page.locator('a[href="/produkte/ersatzteile-kleinteile"]')).toHaveCount(0);
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

test("Produkte bleiben auf Artikelseiten in der Navigation aktiv", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/produkte/artikel/filzgleiter-mit-stift");
  await expect(
    page
      .getByRole("navigation", { name: "Hauptnavigation", exact: true })
      .getByRole("link", { name: "Produkte", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

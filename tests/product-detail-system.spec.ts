import { expect, test } from "@playwright/test";
import { localProducts } from "../src/lib/commerce/providers/local-data";
import { canAddVariantToCart } from "../src/lib/commerce/cart/lines";
import { products } from "../src/lib/products";
import { productPath } from "../src/lib/product-routes";

test("aktualisiert bestehende Transportwagen ohne Produktdubletten aus Export_Flo", () => {
  const chairTrolleys = localProducts.filter((product) => product.handle === "stuhltransportwagen");
  const tableTrolleys = localProducts.filter((product) => product.handle === "tischtransportwagen");
  expect(chairTrolleys).toHaveLength(1);
  expect(tableTrolleys).toHaveLength(1);
  expect(chairTrolleys[0]).toMatchObject({
    id: "local-product-stuhltransportwagen",
    priceRange: { min: { amount: "180.32" }, max: { amount: "180.32" } },
  });
  expect(chairTrolleys[0].variants).toHaveLength(1);
  expect(chairTrolleys[0].variants[0]).toMatchObject({
    erpArticleNumber: "D720",
    price: { amount: "180.32" },
  });
  expect(tableTrolleys[0]).toMatchObject({ id: "local-product-tischtransportwagen" });
  expect(tableTrolleys[0].variants.map((variant) => [
    variant.title,
    variant.erpArticleNumber,
    variant.price?.amount,
  ])).toEqual([
    ["Eine Lenkachse", "D710-007", "435.00"],
    ["Zwei Lenkachsen", "D710-008", "455.30"],
  ]);
});

test("Tischtransportwagen wechselt Preis, Artikelnummer und Anfragevariante", async ({ page }) => {
  await page.goto("/produkte/artikel/tischtransportwagen");
  const selector = page.getByTestId("variant-selector");
  await expect(selector.getByRole("button")).toHaveCount(2);
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("435,00");
  await expect(page.getByTestId("selected-sku")).toContainText("D710-007");

  await selector.getByRole("button", { name: /Zwei Lenkachsen/ }).click();
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("455,30");
  await expect(page.getByTestId("selected-variant")).toContainText("Zwei Lenkachsen");
  await expect(page.getByTestId("selected-sku")).toContainText("D710-008");
  await expect(page.getByRole("link", { name: "Angebot anfragen" })).toHaveAttribute("href", /artikelnummer=D710-008/);

  await selector.getByRole("button", { name: /Eine Lenkachse/ }).click();
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("435,00");
  await expect(page.getByTestId("selected-sku")).toContainText("D710-007");
});

test("Stuhltransportwagen zeigt Preis und Artikelnummer auf Desktop und bleibt mobil nutzbar", async ({ page }) => {
  await page.goto("/produkte/artikel/stuhltransportwagen");
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("180,32");
  await expect(page.getByTestId("selected-sku")).toContainText("D720");
  await expect(page.locator(".product-visual__product img")).toBeVisible();

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/produkte/artikel/tischtransportwagen");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("alle vorhandenen Produktdetailrouten laden mit derselben Grundstruktur", async ({ page }) => {
  const commerce = localProducts;
  const failedImages: string[] = [];
  page.on("response", response => {
    if (response.url().includes("/_next/image") && response.status() >= 400) failedImages.push(response.url());
  });
  const commerceRoutes = commerce.map(product => {
    const productUnavailable = product.priceStatus === "unavailable"
      || product.availability === "out_of_stock";
    const selectedVariant = productUnavailable
      ? undefined
      : product.variants.find(variant =>
          variant.priceStatus !== "unavailable" && variant.availability !== "out_of_stock",
        );
    return {
      path: product.stackingChair
        ? `/produkte/stapelstuehle/${product.handle}`
        : `/produkte/artikel/${product.handle}`,
      purchaseState: !selectedVariant
        ? "unavailable" as const
        : canAddVariantToCart(selectedVariant)
          ? "cart" as const
          : "inquiry" as const,
    };
  });
  const commercePaths = new Set(commerceRoutes.map(route => route.path));
  const routes = [
    ...products
      .map(product => productPath(product.slug))
      .filter(path => !commercePaths.has(path))
      .map(path => ({ path, purchaseState: "legacy" as const })),
    ...commerceRoutes,
  ];
  for (const { path, purchaseState } of routes) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }), path).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: /Breadcrumb|Brotkrumen/i }), path).toBeVisible();
    if (purchaseState === "unavailable") {
      await expect(page.getByTestId("unavailable-product"), path).toBeVisible();
    } else if (purchaseState === "cart") {
      await expect(page.getByRole("button", { name: "In den Warenkorb", exact: true }), path).toBeVisible();
    } else if (purchaseState === "inquiry") {
      await expect(page.getByRole("link", { name: "Angebot anfragen", exact: true }), path).toBeVisible();
    }
  }
  expect(failedImages).toEqual([]);
});

test("kanonische Buchablage bleibt auf schmalem Mobilgerät bedienbar", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/produkte/artikel/buchablage-nachruesten");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buchablage zum Nachrüsten");
  await expect(page.getByRole("link", { name: "Persönlich beraten lassen" }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("alte Produktadressen liefern 301 und die Reihenverbinder-Beratung bleibt eigenständig", async ({ request, page }) => {
  const redirects: Record<string, string> = {
    "klapptisch-310c": "klapptisch-310c",
    "trapezklapptisch-310c": "trapez-klapptisch-310c",
    "seminar-klapptisch": "seminarklapptisch-210c",
    tischtransportwagen: "tischtransportwagen",
    stuhltransportwagen: "stuhltransportwagen",
    buchablage: "buchablage-nachruesten",
  };
  for (const [oldSlug, handle] of Object.entries(redirects)) {
    const response = await request.get(`/produkte/${oldSlug}`, { maxRedirects: 0 });
    expect(response.status(), oldSlug).toBe(301);
    expect(response.headers().location, oldSlug).toBe(`/produkte/artikel/${handle}`);
  }
  await page.goto("/produkte/reihenverbinder");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/produkte\/reihenverbinder$/);
  await expect(page.getByRole("link", { name: "Nachrüstprodukt ansehen" })).toHaveAttribute("href", "/produkte/artikel/reihenverbinder-kunststoff");
  await expect(page.getByRole("link", { name: /Stapelstuhl Modell 1021/ })).toHaveAttribute("href", "/produkte/stapelstuehle/1021?reihe=ja");
});

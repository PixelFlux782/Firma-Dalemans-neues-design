import { expect, test } from "@playwright/test";
import { localProducts } from "../src/lib/commerce/providers/local-data";
import { products } from "../src/lib/products";
import { productPath } from "../src/lib/product-routes";

test("alle vorhandenen Produktdetailrouten laden mit derselben Grundstruktur", async ({ page }) => {
  const commerce = localProducts;
  const failedImages: string[] = [];
  page.on("response", response => {
    if (response.url().includes("/_next/image") && response.status() >= 400) failedImages.push(response.url());
  });
  const paths = [
    ...products.map(product => productPath(product.slug)),
    ...commerce.map(product => product.stackingChair
      ? `/produkte/stapelstuehle/${product.handle}`
      : `/produkte/artikel/${product.handle}`),
  ];
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }), path).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: /Breadcrumb|Brotkrumen/i }), path).toBeVisible();
    await expect(page.locator("main .btn-primary").first(), path).toBeVisible();
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

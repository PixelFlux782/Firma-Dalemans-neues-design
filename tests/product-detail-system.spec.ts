import { expect, test } from "@playwright/test";
import { localProducts } from "../src/lib/commerce/providers/local-data";
import { products } from "../src/lib/products";

test("alle vorhandenen Produktdetailrouten laden mit derselben Grundstruktur", async ({ page }) => {
  const commerce = localProducts;
  const failedImages: string[] = [];
  page.on("response", response => {
    if (response.url().includes("/_next/image") && response.status() >= 400) failedImages.push(response.url());
  });
  const paths = [
    ...products.map(product => `/produkte/${product.slug}`),
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

test("ältere Produktroute bleibt auf schmalem Mobilgerät bedienbar", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/produkte/buchablage");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buchablage");
  await expect(page.getByRole("link", { name: "Angebot anfragen" }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

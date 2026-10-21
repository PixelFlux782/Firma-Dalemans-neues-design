import { expect, test } from "@playwright/test";
import { localGliderProducts } from "../src/lib/commerce/providers/local-glider-products";

const expectedRows = [
  ["GSTGL", "Kunststoffgleiter Standard", "1.36"],
  ["A1021FG", "Filzgelenkgleiter", "6.90"],
  ["A1021FG", "Gelenkgleiter für Teppichboden", "6.90"],
  ["ZGGF30", "Filz-Winkelgleiter", "16.00"],
  ["A1021NG", "Filz-Nagelgleiter", "8.00"],
  ["A1021NGK", "Kunststoff-Nagelgleiter", "6.40"],
] as const;

test("übernimmt alle sechs ODS-Zeilen ohne doppelte Produkt-IDs oder Handles", () => {
  expect(localGliderProducts).toHaveLength(6);
  expect(new Set(localGliderProducts.map((product) => product.id)).size).toBe(6);
  expect(new Set(localGliderProducts.map((product) => product.handle)).size).toBe(6);

  expect(localGliderProducts.map((product) => [
    product.variants[0]?.erpArticleNumber,
    product.title,
    product.variants[0]?.price?.amount,
  ])).toEqual(expectedRows);
  expect(localGliderProducts.every((product) => product.variants[0]?.priceDataStatus === "source_unreleased")).toBe(true);
  expect(localGliderProducts.every((product) => product.featuredImage?.url)).toBe(true);
});

test("Sortiment zeigt sechs eindeutige Karten mit funktionierenden Detailzielen", async ({ page }) => {
  await page.goto("/produkte/sortiment/gleiter-bodenschutz");
  const products = page.locator("#produkte article");
  await expect(products).toHaveCount(6);
  await expect(page.getByText("Simulierte Finder-Ausführungen")).toHaveCount(0);
  await expect(page.getByText("Development-Preis · unverbindlich")).toHaveCount(0);

  for (const product of localGliderProducts) {
    const link = page.getByRole("link", { name: `${product.title} ansehen` });
    await expect(link).toHaveAttribute("href", `/produkte/artikel/${product.handle}`);
    await expect(link.locator("img:not([aria-hidden])")).toHaveAttribute("src", /\S+/);
  }
});

test("nur Modell 1021 zeigt die eindeutig zugeordneten Gleiter", async ({ page }) => {
  await page.goto("/produkte/stapelstuehle/1021");
  const section = page.getByRole("heading", { name: "Passende Gleiter & Bodenschutz" }).locator("..");
  await expect(section).toContainText("Filzgelenkgleiter");
  await expect(section).not.toContainText("Gelenkgleiter für Teppichboden");
  await expect(section.getByRole("link", { name: "Filzgelenkgleiter ansehen" })).toHaveAttribute("href", "/produkte/artikel/filzgelenkgleiter-modell-1021");

  await page.goto("/produkte/stapelstuehle/buende");
  await expect(page.getByRole("heading", { name: "Passende Gleiter & Bodenschutz" })).toHaveCount(0);
});

test("Gleiter-Sortiment bleibt im mobilen Viewport vollständig bedienbar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produkte/sortiment/gleiter-bodenschutz");
  await expect(page.locator("#produkte article")).toHaveCount(6);
  await expect(page.getByRole("link", { name: "Kunststoff-Nagelgleiter ansehen" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

import { expect, test } from "@playwright/test";
import { localProducts } from "../src/lib/commerce/providers/local-data";
import { hasUnverifiedDevelopmentData, publicCommerceProducts } from "../src/lib/commerce/publication";

test("production commerce excludes every development SKU and fixture", () => {
  const developmentProducts = localProducts.filter(hasUnverifiedDevelopmentData);
  expect(developmentProducts.length).toBeGreaterThan(0);

  const published = publicCommerceProducts(localProducts, "production");
  expect(published.some(hasUnverifiedDevelopmentData)).toBe(false);
  expect(published.flatMap((product) => product.variants).some((variant) => variant.sku?.startsWith("DEV-"))).toBe(false);
});

test("Gleiter-Finder is public while development products remain blocked", async ({ page }) => {
  expect((await page.goto("/produkte/gleiter-finder"))?.status()).toBe(200);

  expect((await page.goto("/produkte/artikel/filzgleiter-fuer-rundrohr"))?.status()).toBe(404);

  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("gleiter-finder");
  expect(sitemap).not.toContain("filzgleiter-fuer-rundrohr");
});

test("privacy page reflects implemented storage and does not claim inactive services", async ({ page }) => {
  await page.goto("/datenschutz");
  await expect(page.getByRole("heading", { name: "Datenschutzerklärung" })).toBeVisible();
  await expect(page.getByText("dlmns-commerce-cart", { exact: false })).toBeVisible();
  await expect(page.getByText("dalemans-room-planner-projects-v1", { exact: false })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://dalemans.de/datenschutz');
  await expect(page.getByText("Sorry, die EU", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Google Analytics setzt", { exact: false })).toHaveCount(0);
});


test("plastic row connectors remain available in production as an inquiry product", async ({ page }) => {
  const product = publicCommerceProducts(localProducts, "production")
    .find((entry) => entry.handle === "reihenverbinder-kunststoff");
  expect(product).toBeDefined();
  expect(product?.variants).toHaveLength(1);
  expect(product?.variants[0].sku).toBeNull();
  expect(product?.priceStatus).toBe("on_request");

  const response = await page.goto("/produkte/artikel/reihenverbinder-kunststoff");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Reihenverbinder aus Kunststoff" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Angebot anfragen", exact: true })
    .or(page.getByRole("button", { name: "Zur Auswahl hinzufügen", exact: true }))).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://dalemans.de/produkte/artikel/reihenverbinder-kunststoff");
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/produkte/artikel/reihenverbinder-kunststoff");
});

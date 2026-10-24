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

test("disabled Gleiter-Finder and development products are not publicly routed", async ({ page }) => {
  expect((await page.goto("/produkte/gleiter-finder"))?.status()).toBe(404);

  expect((await page.goto("/produkte/artikel/filzgleiter-fuer-rundrohr"))?.status()).toBe(404);

  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("gleiter-finder");
  expect(sitemap).not.toContain("filzgleiter-fuer-rundrohr");
});

test("privacy page reflects implemented storage and does not claim inactive services", async ({ page }) => {
  await page.goto("/datenschutz");
  await expect(page.getByRole("heading", { name: "Datenschutzerklärung" })).toBeVisible();
  await expect(page.getByText("dlmns-commerce-cart", { exact: false })).toBeVisible();
  await expect(page.getByText("dalemans-room-planner-projects-v1", { exact: false })).toBeVisible();
  await expect(page.getByText("noch nicht fachjuristisch freigegeben", { exact: false })).toBeVisible();
  await expect(page.getByText("Sorry, die EU", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Google Analytics setzt", { exact: false })).toHaveCount(0);
});

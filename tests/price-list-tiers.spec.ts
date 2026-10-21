import { expect, test } from "@playwright/test";
import { localPriceListProducts } from "../src/lib/commerce/providers/local-price-list-products";
import { priceForQuantity } from "../src/lib/commerce/cart/lines";

test("Tischstaffeln wechseln exakt bei 15 und 21 Stück", () => {
  const product = localPriceListProducts.find((entry) => entry.handle === "klapptisch-310c")!;
  const variant = product.variants.find((entry) => entry.erpArticleNumber === "T310C127")!;
  expect([14, 15, 20, 21].map((quantity) => priceForQuantity(variant, quantity)?.amount))
    .toEqual(["355.93", "345.25", "345.25", "338.13"]);
  expect(variant.priceTiers?.map((tier) => [tier.minimumQuantity, tier.maximumQuantity, tier.label])).toEqual([
    [1, 14, "1–14 Stück"],
    [15, 20, "15–20 Stück"],
    [21, null, "ab 21 Stück"],
  ]);
});

test("verwendet die in der ODS ausgewiesenen Centbeträge ohne interne Zusatzstellen", () => {
  const variants = localPriceListProducts.flatMap((product) => product.variants);
  expect(variants.find((variant) => variant.erpArticleNumber === "T310CT147")?.priceTiers?.map((tier) => tier.price.amount))
    .toEqual(["432.16", "419.20", "410.55"]);
  expect(variants.find((variant) => variant.erpArticleNumber === "T210C126")?.priceTiers?.map((tier) => tier.price.amount))
    .toEqual(["252.75", "245.17", "240.11"]);
});

test("Netto-/Brutto-Umschaltung gilt auf Produktseite für Preis und Mengenstaffeln", async ({ page }) => {
  await page.goto("/produkte/artikel/klapptisch-310c");
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("355,93");
  const tiers = page.getByTestId("price-tiers");
  await expect(tiers).toContainText("345,25");
  await page.getByRole("button", { name: "Privatkunden · brutto" }).click();
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("423,56");
  await expect(tiers).toContainText("410,85");
  await expect(tiers).toContainText("brutto inkl. 19 % MwSt.");
});

import { expect, test } from "@playwright/test";
import { localGliderProducts } from "../src/lib/commerce/providers/local-glider-products";

test("Farbe ist Pflicht und bleibt nach Mengenänderung und Neuladen erhalten", async ({ page }) => {
  await page.goto("/produkte/artikel/filzgleiter-mit-stift");
  await expect(page.getByRole("button", { name: "Zur Auswahl hinzufügen" })).toHaveCount(0);
  await page.getByRole("button", { name: "Braun" }).click();
  await page.getByRole("button", { name: "Zur Auswahl hinzufügen" }).click();
  await page.getByLabel("Menge für Filz-Nagelgleiter", { exact: true }).fill("5");
  await expect(page.getByLabel("Menge für Filz-Nagelgleiter", { exact: true })).toHaveValue("5");
  await page.goto("/anfrage");
  await expect(page.getByText(/BRAUN/).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText(/BRAUN/).first()).toBeVisible();
});

test("Finder bietet Standardartikel und vollständige Sondergleiterberatung", async ({ page }) => {
  await page.goto("/produkte/gleiter-finder");
  await page.getByLabel("Gestellform").selectOption("steel");
  await page.getByLabel("Rohrmaße in mm", { exact: false }).fill("20");
  await page.getByLabel("Befestigung / vorhandene Ausführung").selectOption("standard");
  await page.getByLabel("Abschrägung in Grad").fill("12");
  await page.getByLabel("Gleiterhöhe in mm").fill("10");
  await expect(page.getByText("GSTGL", { exact: true })).toBeVisible();
  await page.getByLabel("Rohrmaße in mm", { exact: false }).fill("25 × 25");
  await page.getByLabel("Weitere Hinweise").fill("Brauche Ersatz für vorhandenes Gestell");
  await expect(page.getByRole("heading", { name: "Sondergleiter auf Anfrage" })).toBeVisible();
  await page.getByRole("link", { name: "Beratungsanfrage mit technischen Angaben" }).click();
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/25 × 25/);
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/Brauche Ersatz/);
});

test("Finderangaben bleiben über Produkt, Warenkorb und Anfrage-Request vollständig erhalten", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produkte/gleiter-finder");
  await page.getByLabel("Gestellform").selectOption("steel");
  await page.getByLabel("Rohrmaße in mm", { exact: false }).fill("20");
  await page.getByLabel("Befestigung / vorhandene Ausführung").selectOption("standard");
  await page.getByLabel("Abschrägung in Grad").fill("12");
  await page.getByLabel("Gleiterhöhe in mm").fill("10");
  await page.getByLabel("Benötigte Anzahl (Stück)").fill("20");
  await page.getByLabel("Weitere Hinweise").fill("Ersatz für Vereinsstühle");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("link", { name: "Produkt und Ausführung auswählen" }).click();
  await page.getByRole("button", { name: "Zur Auswahl hinzufügen" }).click();
  await expect(page.getByLabel("Menge für Kunststoffgleiter Standard", { exact: true })).toHaveValue("5");
  await page.goto("/anfrage");
  await expect(page.getByText(/Ersatz für Vereinsstühle/)).toBeVisible();
  let payload: { items: Array<{ technicalInquiry: string; quantity: number; variantId: string }> } | undefined;
  await page.route("**/api/inquiry", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accepted: true, inquiryId: "LOCAL-TEST", customerConfirmation: "sent" }) });
  });
  await page.locator('[name="firstName"]').fill("Test");
  await page.locator('[name="lastName"]').fill("Tester");
  await page.locator('[name="street"]').fill("Testweg");
  await page.locator('[name="houseNumber"]').fill("1a");
  await page.locator('[name="postalCode"]').fill("01234");
  await page.locator('[name="city"]').fill("Testort");
  await page.locator('[name="email"]').fill("test@example.test");
  await page.locator('[name="privacyAccepted"]').check();
  await page.getByRole("button", { name: /Unverbindliche Anfrage senden/ }).click();
  await expect(page.getByText(/LOCAL-TEST/)).toBeVisible();
  expect(payload?.items[0].quantity).toBe(5);
  expect(payload?.items[0].technicalInquiry).toContain("Ersatz für Vereinsstühle");
  expect(payload?.items[0].technicalInquiry).toContain("Stahlrohr");
  expect(payload?.items[0].technicalInquiry).toContain("20 Stück");
});

const expectedRows = [
  ["GSTGL", "Kunststoffgleiter Standard", "1.36"],
  ["A1021FG", "Filzgelenkgleiter", "6.90"],
  ["ZGGF30", "Filz-Winkelgleiter", "16.00"],
  ["A1021NG", "Filz-Nagelgleiter", "8.00"],
  ["A1021NGK", "Kunststoff-Nagelgleiter", "6.40"],
] as const;

test("übernimmt alle fünf ODS-Zeilen ohne doppelte Produkt-IDs oder Handles", () => {
  expect(localGliderProducts).toHaveLength(5);
  expect(new Set(localGliderProducts.map((product) => product.id)).size).toBe(5);
  expect(new Set(localGliderProducts.map((product) => product.handle)).size).toBe(5);

  expect(localGliderProducts.map((product) => [
    product.variants[0]?.erpArticleNumber,
    product.title,
    product.variants[0]?.price?.amount,
  ])).toEqual(expectedRows);
  expect(localGliderProducts.every((product) => product.variants[0]?.priceStatus === "fixed")).toBe(true);
  expect(localGliderProducts.every((product) => product.featuredImage?.url)).toBe(true);
});

test("Sortiment zeigt fünf eindeutige Karten mit funktionierenden Detailzielen", async ({ page }) => {
  await page.goto("/produkte/sortiment/gleiter-bodenschutz");
  const products = page.locator("#produkte article");
  await expect(products).toHaveCount(5);
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
  await expect(page.locator("#produkte article")).toHaveCount(5);
  await expect(page.getByRole("link", { name: "Kunststoff-Nagelgleiter ansehen" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

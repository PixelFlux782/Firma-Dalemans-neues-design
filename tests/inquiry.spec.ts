import { expect, test, type Page } from "@playwright/test";
import { cartLineFromProduct } from "../src/lib/commerce/cart/lines";
import { LOCAL_CART_STORAGE_KEY } from "../src/lib/commerce/cart/local";
import { localProducts } from "../src/lib/commerce/providers/local-data";

function inquiryCart() {
  const table = localProducts.find((product) => product.handle === "klapptisch-310c")!;
  const tableVariant = table.variants.find((variant) => variant.erpArticleNumber === "T310C127")!;
  const chair = localProducts.find((product) => product.handle === "1021")!;
  const chairVariant = chair.variants.find((variant) => variant.id.endsWith("none-no-row"))!;
  const lines = [
    cartLineFromProduct({ product: table, variant: tableVariant, quantity: 15 }),
    cartLineFromProduct({ product: chair, variant: chairVariant, quantity: 100, selectedAddonSkus: ["BU1021C"] }),
  ].map((line, index) => ({ ...line, id: `inquiry-test-${index}` }));
  return JSON.stringify({ version: 1, cartId: "inquiry-test-cart", lines });
}

async function openWithCart(page: Page) {
  const cart = inquiryCart();
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [LOCAL_CART_STORAGE_KEY, cart] as const);
  await page.goto("/anfrage");
  await expect(page.getByTestId("inquiry-form")).toBeVisible();
}

async function fillRequiredFields(page: Page) {
  await page.getByLabel(/Vorname/).first().fill("Erika");
  await page.getByLabel(/Nachname/).first().fill("Musterfrau");
  await page.locator('[name="street"]').fill("Testweg");
  await page.getByLabel(/Hausnummer/).first().fill("1a");
  await page.getByLabel(/PLZ/).first().fill("01234");
  await page.locator('[name="city"]').fill("Testort");
  await page.getByLabel(/E-Mail-Adresse/).fill("erika@example.test");
  await page.getByLabel(/Datenschutzhinweise/).check();
}

test.describe("produktive Angebotsanfrage", () => {
  test("zeigt mehrere Konfigurationen, Artikelnummern, Ausstattungen und Staffelpreise", async ({ page }) => {
    await openWithCart(page);
    await expect(page.getByRole("heading", { name: "Klapptisch Modell 310c" })).toBeVisible();
    await expect(page.getByText("Artikelnummer: T310C127")).toBeVisible();
    await expect(page.getByText("15–20 Stück")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stapelstuhl Modell 1021" })).toBeVisible();
    await expect(page.getByText(/Buchablage aus Stahlblech \(BU1021C\)/)).toBeVisible();
    await expect(page.getByText("100–249 Stück")).toBeVisible();
  });

  test("hält Privat- und Geschäftskundenanzeige synchron", async ({ page }) => {
    await openWithCart(page);
    await expect(page.getByRole("radio", { name: /Geschäftskunde/ })).toBeChecked();
    await page.getByRole("radio", { name: /^Privatkunde/ }).check();
    await expect(page.getByText("brutto inkl. 19 % MwSt.", { exact: true })).toBeVisible();
    await page.getByLabel("Geschäftskunde / Organisation").check();
    await expect(page.getByText("netto zzgl. MwSt.", { exact: true })).toBeVisible();
  });

  test("validiert Pflichtfelder, E-Mail und Anschrift ohne Request", async ({ page }) => {
    await openWithCart(page);
    let requests = 0;
    await page.route("**/api/inquiry", async (route) => { requests += 1; await route.abort(); });
    await page.getByRole("button", { name: "Unverbindliche Anfrage senden →" }).click();
    await expect(page.getByText("Bitte geben Sie Vorname ein.")).toBeVisible();
    await page.getByLabel(/Vorname/).first().fill("Erika");
    await page.getByLabel(/Nachname/).first().fill("Musterfrau");
    await page.getByLabel(/E-Mail-Adresse/).fill("keine-adresse");
    await page.getByLabel(/PLZ/).first().fill("   ");
    await expect(page.getByText("Bitte geben Sie eine gültige E-Mail-Adresse ein.")).toBeVisible();
    await expect(page.getByText("Bitte geben Sie PLZ ein.")).toBeVisible();
    expect(requests).toBe(0);
  });

  test("behält Formular und Warenkorb bei einem Annahmefehler", async ({ page }) => {
    await openWithCart(page);
    await page.route("**/api/inquiry", async (route) => route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ accepted: false, error: "Die Online-Übermittlung ist derzeit nicht eingerichtet." }),
    }));
    await fillRequiredFields(page);
    await page.getByRole("button", { name: "Unverbindliche Anfrage senden →" }).click();
    await expect(page.getByText("Die Online-Übermittlung ist derzeit nicht eingerichtet.")).toBeVisible();
    await expect(page.getByLabel(/Vorname/).first()).toHaveValue("Erika");
    const persisted = await page.evaluate((key) => localStorage.getItem(key), LOCAL_CART_STORAGE_KEY);
    expect(JSON.parse(persisted!).lines).toHaveLength(2);
  });

  test("verhindert Doppelklicks und leert erst nach bestätigter Annahme", async ({ page }) => {
    await openWithCart(page);
    let requests = 0;
    await page.route("**/api/inquiry", async (route) => {
      requests += 1;
      await new Promise((resolve) => setTimeout(resolve, 150));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ accepted: true, inquiryId: "DLMNS-2026-TEST123456", customerConfirmation: "sent" }),
      });
    });
    await fillRequiredFields(page);
    const submit = page.getByRole("button", { name: "Unverbindliche Anfrage senden →" });
    await submit.dblclick();
    await expect(page.getByText("DLMNS-2026-TEST123456")).toBeVisible();
    expect(requests).toBe(1);
    const persisted = await page.evaluate((key) => localStorage.getItem(key), LOCAL_CART_STORAGE_KEY);
    expect(JSON.parse(persisted!).lines).toHaveLength(0);
  });

  test("behandelt eine fehlgeschlagene Kundenbestätigung als bereits angenommene Anfrage", async ({ page }) => {
    await openWithCart(page);
    await page.route("**/api/inquiry", async (route) => route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ accepted: true, inquiryId: "DLMNS-2026-CONFIRM01", customerConfirmation: "failed" }),
    }));
    await fillRequiredFields(page);
    await page.getByRole("button", { name: "Unverbindliche Anfrage senden →" }).click();
    await expect(page.getByText(/Bestätigungs-E-Mail konnte nicht zugestellt werden/)).toBeVisible();
    await expect(page.getByText("DLMNS-2026-CONFIRM01")).toBeVisible();
  });
});

for (const customerType of ["business", "private"] as const) {
  for (const different of [false, true]) {
    test(`address payload ${customerType} delivery=${different}`, async ({ page }) => {
      await page.setViewportSize({ width: customerType === "private" ? 390 : 1280, height: 900 });
      await openWithCart(page);
      await page.locator(`[name="customerType"][value="${customerType}"]`).check();
      await fillRequiredFields(page);
      const toggle = page.getByLabel("Lieferadresse weicht von Rechnungsadresse ab");
      await toggle.check();
      const entries = { deliveryFirstName: "Ada", deliveryLastName: "Test", deliveryStreet: "Nebenweg", deliveryHouseNumber: "2", deliveryPostalCode: "00123", deliveryCity: "Teststadt" };
      for (const [name, value] of Object.entries(entries)) await page.locator(`[name="${name}"]`).fill(value);
      await toggle.uncheck();
      await expect(page.locator('[name="deliveryStreet"]')).toBeHidden();
      await toggle.check();
      await expect(page.locator('[name="deliveryStreet"]')).toHaveValue("Nebenweg");
      if (!different) await toggle.uncheck();
      await page.route("**/api/inquiry", async (route) => {
        const body = route.request().postDataJSON();
        expect(body.customerType).toBe(customerType);
        expect(body.contact.postalCode).toBe("01234");
        expect(body.contact.differentDeliveryAddress).toBe(different);
        expect(body.contact.deliveryStreet).toBe(different ? "Nebenweg" : "");
        expect(body.items).toHaveLength(2);
        expect(body.items[1].selectedAddons).toContain("BU1021C");
        await route.fulfill({ status: 503, json: { error: "Mockfehler" } });
      });
      await page.getByRole("button", { name: "Unverbindliche Anfrage senden \u2192" }).click();
      await expect(page.getByTestId("inquiry-form").getByRole("alert")).toContainText("Mockfehler");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `tmp/inquiry-address-${customerType}-${different}.png`, fullPage: true });
    });
  }
}

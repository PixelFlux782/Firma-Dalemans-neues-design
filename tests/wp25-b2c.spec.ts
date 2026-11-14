import { expect, test } from "@playwright/test";
import { cartLineFromProduct } from "../src/lib/commerce/cart/lines";
import { LOCAL_CART_STORAGE_KEY } from "../src/lib/commerce/cart/local";
import { localProducts } from "../src/lib/commerce/providers/local-data";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("dlmns-customer-price-mode")) localStorage.setItem("dlmns-customer-price-mode", "private");
  });
});

test("Gespeicherte Bruttoansicht, Staffel, Warenkorb und Kundentyp bleiben konsistent", async ({ page }) => {
  await page.goto("/produkte/artikel/klapptisch-310c");
  await expect(page.getByRole("button", { name: "Privatkunden · brutto" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("423,56");
  await page.getByLabel("Bestellmenge", { exact: true }).fill("15");
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("410,85");
  await expect(page.getByTestId("total-price")).toContainText("6.162,71");
  await expect(page.getByTestId("price-tiers")).toContainText("410,85");
  await page.getByRole("button", { name: "Zur Auswahl hinzufügen" }).click();
  const drawer = page.getByTestId("cart-drawer");
  await expect(drawer).toContainText("6.162,71");
  await expect(drawer).toContainText("Versand-");
  await drawer.getByRole("link", { name: "Angebot anfragen →" }).click();
  await expect(page.getByRole("radio", { name: /^Privatkunde/ })).toBeChecked();
  await expect(page.getByTestId("inquiry-form")).toContainText("6.162,71");
  await page.getByLabel("Geschäftskunde / Organisation").check();
  await expect(page.getByTestId("inquiry-form")).toContainText("5.178,75");
  await expect(page.getByRole("button", { name: "Geschäftskunden · netto" })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByLabel("Geschäftskunde / Organisation")).toBeChecked();
  await page.getByRole("radio", { name: /^Privatkunde/ }).check();
  await expect(page.getByTestId("inquiry-form")).toContainText("6.162,71");
});

test("Privatkundenanfrage übermittelt Kundenart und Variante ohne B2B-Zwang", async ({ page }) => {
  const product = localProducts.find(p => p.handle === "klapptisch-310c")!;
  const variant = product.variants.find(v => v.erpArticleNumber === "T310C127")!;
  const line = { ...cartLineFromProduct({ product, variant, quantity: 15 }), id: "wp25-line" };
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [LOCAL_CART_STORAGE_KEY, JSON.stringify({ version: 1, cartId: "wp25-cart", lines: [line] })]);
  await page.goto("/anfrage");
  await page.getByLabel(/Vorname/).fill("Erika");
  await page.getByLabel(/Nachname/).fill("Musterfrau");
  await page.getByLabel(/E-Mail-Adresse/).fill("erika@example.test");
  await page.getByLabel(/Datenschutzhinweise/).check();
  let submitted: Record<string, unknown> | undefined;
  await page.route("**/api/inquiry", async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ accepted: true, inquiryId: "WP25-PRIVATE", customerConfirmation: "sent" }) });
  });
  await page.getByRole("button", { name: "Unverbindliche Anfrage senden →" }).click();
  await expect(page.getByText("WP25-PRIVATE")).toBeVisible();
  expect(submitted).toMatchObject({ customerType: "private", contact: { organization: "" }, items: [{ variantId: variant.id, quantity: 15 }] });
  await expect(page.getByText(/keine Bestellung und keine Zahlung ausgelöst/)).toBeVisible();
});

for (const width of [360, 1440]) {
  test(`Rechtstexte und Formular sind zugänglich bei ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/agb", "/widerruf", "/impressum", "/datenschutz", "/kontakt"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
      if (path === "/widerruf") {
        await expect(page.getByRole("heading", { name: "5. Muster-Widerrufsformular" })).toBeVisible();
        await expect(page.getByText(/Entwurf zur rechtlichen Prüfung/)).toHaveCount(0);
      }
      if (path === "/impressum") await expect(page.getByText("Stefan Dalemans – Dalemans Sitzmöbel und Tische", { exact: true })).toBeVisible();
      await expect(page.locator('a[href*="ec.europa.eu/consumers/odr"]')).toHaveCount(0);
      if (path === "/widerruf" || path === "/kontakt") await page.screenshot({ path: `tmp/wp25-${path.slice(1)}-${width}.png`, fullPage: true });
    }
  });
}


test("B2C-Variantenwahl und Warenkorb-Mengenwechsel verwenden dieselben Preise", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produkte/artikel/tischtransportwagen");
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("517,65");
  await page.getByTestId("variant-selector").getByRole("button", { name: /Zwei Lenkachsen/ }).click();
  await expect(page.locator('[data-price-status="fixed"]')).toContainText("541,81");
  await page.getByRole("button", { name: "Zur Auswahl hinzufügen" }).click();
  const drawer = page.getByTestId("cart-drawer");
  await expect(drawer).toContainText("541,81");
  await drawer.getByRole("button", { name: /Menge .* erhöhen/ }).click();
  await expect(drawer.getByLabel(/Menge für/)).toHaveValue("2");
  await expect(drawer).toContainText("1.083,61");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "tmp/wp25-cart-390.png", fullPage: true });
  await drawer.getByRole("link", { name: "Angebot anfragen →" }).click();
  await expect(page.getByTestId("inquiry-form")).toContainText("1.083,61");
  const notice = page.getByRole("img", { name: /Offizielle EU-Mitteilung/ });
  await expect(notice).toBeVisible();
  await notice.scrollIntoViewIfNeeded();
  await notice.evaluate(async image => { await (image as HTMLImageElement).decode(); });
  expect(await notice.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "tmp/wp25-inquiry-390.png", fullPage: true });
});


test("Suchpreise folgen der gewählten Steueransicht", async ({ page }) => {
  await page.goto("/produkte/suche?q=310c");
  const result = page.locator('[data-search-result="local-product-klapptisch-310c"]');
  await expect(result).toContainText("brutto inkl. 19 % MwSt.");
  await expect(result).toContainText("402,37");
  await page.getByRole("button", { name: "Geschäftskunden · netto" }).click();
  await expect(result).toContainText("338,13");
  await expect(result).toContainText("netto zzgl. MwSt.");
  await expect(result).toContainText("21 Stück");
});

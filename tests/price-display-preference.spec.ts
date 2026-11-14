import { expect, test } from "@playwright/test";

const key = "dlmns-customer-price-mode";

for (const stored of [null, "private", "business"] as const) {
  test(`Preispräferenz: ${stored ?? "neuer Besucher"}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error") errors.push(message.text());
    });
    if (stored) {
      await page.addInitScript(({ key, stored }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, stored);
      }, { key, stored });
    }
    await page.goto("/produkte/artikel/klapptisch-310c");
    const business = page.getByRole("button", { name: "Geschäftskunden · netto" });
    const privateCustomer = page.getByRole("button", { name: "Privatkunden · brutto" });
    const initial = stored ?? "business";
    await expect(initial === "business" ? business : privateCustomer).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-price-status="fixed"]')).toContainText(initial === "business" ? "355,93" : "423,56");
    await expect.poll(() => page.evaluate(key => localStorage.getItem(key), key)).toBe(initial);
    await privateCustomer.click();
    await expect(page.locator('[data-price-status="fixed"]')).toContainText("423,56");
    await page.reload();
    await expect(privateCustomer).toHaveAttribute("aria-pressed", "true");
    await business.click();
    await page.getByRole("button", { name: "Zur Auswahl hinzufügen" }).click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toContainText("355,93");
    await expect(drawer).toContainText("netto zzgl. MwSt.");
    await drawer.getByRole("link", { name: "Angebot anfragen →" }).click();
    await expect(page.getByLabel("Geschäftskunde / Organisation")).toBeChecked();
    await expect(page.getByTestId("inquiry-form")).toContainText("355,93");
    await page.reload();
    await expect(business).toHaveAttribute("aria-pressed", "true");
    expect(errors.filter(message => /hydrat|didn't match|does not match/i.test(message))).toEqual([]);
  });
}

test("SSR zeigt bis zum Laden der Präferenz keine falschen Produktpreise", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/produkte/artikel/klapptisch-310c");
  const price = page.locator('[data-price-status="fixed"]');
  await expect(price).not.toContainText("355,93");
  await expect(price).not.toContainText("423,56");
  await expect(page.getByTestId("price-display-toggle")).toBeHidden();
  await context.close();
});

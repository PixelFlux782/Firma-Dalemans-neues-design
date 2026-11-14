import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { withdrawalText } from "../src/lib/consumer-information";

test("Freigegebene Quelldatei bleibt bytegenau unverändert", () => {
  expect(createHash("sha256").update(readFileSync("src/lib/consumer-information.ts")).digest("hex"))
    .toBe("f7d2b9fddd13d6ff395c11a36fdacd022a8ed37df1c1f5254a2ec6ee70030eef");
});

for (const width of [360, 768, 1440]) {
  test(`Widerruf vollständig, verlinkt und fehlerfrei bei ${width}px`, async ({ page, request }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.setViewportSize({ width, height: 900 });
    expect((await page.goto("/widerruf"))?.status()).toBe(200);
    const article = page.locator(".withdrawal-page article");
    const paragraphs = withdrawalText.trim().split(/\r?\n\s*\r?\n/);
    const rendered = await article.locator("h2, .space-y-7 > p").allTextContents();
    expect(rendered).toEqual(paragraphs.map(p => p.trim().replace(/^## /, "")));
    await expect(article.getByRole("note")).toHaveCount(0);
    await expect(article).not.toContainText(/TODO|Freigabestatus|Entwurf zur rechtlichen Prüfung/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const toc = page.getByRole("navigation", { name: "Inhaltsverzeichnis" });
    await expect(toc.locator("a")).toHaveCount(5);
    for (const link of await toc.locator("a").all()) {
      const href = await link.getAttribute("href");
      await expect(page.locator(`[id="${href!.slice(1)}"]`)).toHaveCount(1);
    }
    await toc.getByRole("link", { name: "5. Muster-Widerrufsformular" }).click();
    await expect(page.getByRole("heading", { name: "5. Muster-Widerrufsformular" })).toBeInViewport();
    for (const href of new Set(await article.locator('a[href^="/"]').evaluateAll(links => links.map(link => link.getAttribute("href")!)))) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
    await expect(page.locator('footer a[href="/widerruf"]')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `tmp/widerruf-release/${width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test("Druckansicht enthält das vollständige Formular ohne globale Höhenbegrenzung", async ({ page }) => {
  await page.goto("/widerruf");
  await page.emulateMedia({ media: "print" });
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("visible");
  await expect(page.getByRole("navigation", { name: "Inhaltsverzeichnis" })).toBeHidden();
  const formHeading = page.getByRole("heading", { name: "5. Muster-Widerrufsformular" });
  expect(await formHeading.evaluate(el => getComputedStyle(el).breakBefore)).toBe("page");
  await expect(page.getByText("(*) Unzutreffendes streichen.", { exact: true })).toBeVisible();
  await page.pdf({ path: "tmp/widerruf-release/widerruf.pdf", preferCSSPageSize: true, printBackground: true });
});

test("Kontakt- und Produktprozess führen zur Widerrufsseite", async ({ page }) => {
  await page.goto("/kontakt");
  await expect(page.locator('form a[href="/widerruf"]')).toBeVisible();
  await page.goto("/produkte/artikel/klapptisch-310c");
  await page.getByRole("button", { name: "Zur Auswahl hinzufügen" }).click();
  await page.getByTestId("cart-drawer").getByRole("link", { name: "Angebot anfragen →", exact: true }).click();
  await expect(page.getByTestId("inquiry-form").locator('a[href="/widerruf"]')).toBeVisible();
  await expect(page.getByTestId("inquiry-form")).toContainText("Es wird keine zahlungspflichtige Bestellung ausgelöst.");
});

import { expect, test } from "@playwright/test";

test("Raumplaner hat gültige Kernsemantik und bleibt im Desktop-Viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dalemans Raumplaner für Bestuhlungspläne");

  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await expect(editor).toBeVisible();
  const bounds = await editor.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);

  await expect(editor.getByRole("img", { name: "Dalemans Raumplaner" })).toBeVisible();
  for (const name of ["Bemaßungen", "Bereiche", "Tische", "Tischstühle", "Berechnete Sitzplätze"]) {
    await expect(editor.getByRole("group", { name })).toBeAttached();
  }
  await expect(editor.locator("svg [aria-selected]")).toHaveCount(0);
});

test("Raumplaner ist in der Sitemap enthalten", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/raumplaner");
});

test("Preisumschalter erfüllen mobil die 44-Pixel-Touch-Zielgröße", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produkte");

  for (const name of ["Geschäftskunden · netto", "Privatkunden · brutto"]) {
    const box = await page.getByRole("button", { name }).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

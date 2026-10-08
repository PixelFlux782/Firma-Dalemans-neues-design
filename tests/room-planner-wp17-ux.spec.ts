import { expect, test } from "@playwright/test";

test("WP17 UX führt bei 1440 × 900 durch Raum, Einrichtung und Ergebnis", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });

  await expect(editor.getByLabel("Planungsschritte").getByRole("button")).toHaveCount(3);
  await expect(editor.getByRole("button", { name: "Automatisch planen" })).toBeVisible();
  await expect(editor.getByLabel("Planungsergebnis")).toContainText("Sitzplätze");
  await expect(editor.getByLabel("Planungsergebnis")).toContainText("Tische");
  await expect(editor.getByLabel("Planungsergebnis")).toContainText("Prüfstatus");
  await expect(editor.getByLabel("Anordnungsart")).toHaveValue("rows");
  await expect(editor.getByLabel("Optimierungsziel Bestuhlung")).toHaveValue("balanced");
  await expect(editor.getByLabel("Optimierungsziel Tischplanung")).toHaveValue("complete");

  const bounds = await editor.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
});

test("WP17 UX aktualisiert Tischzahl und behält 2D/3D im selben Plan", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of [{ x: 120, y: 90 }, { x: 570, y: 90 }, { x: 570, y: 390 }, { x: 120, y: 390 }]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  await editor.getByRole("button", { name: "Tisch", exact: true }).click();
  await canvas.click({ position: { x: 390, y: 260 } });
  await expect(editor.getByLabel("Planungsergebnis")).toContainText(/1\s*Tische/);
  await editor.getByRole("button", { name: "3D", exact: true }).click();
  await expect(editor.getByLabel("3D-Raumansicht").locator("canvas")).toBeVisible();
  await expect(editor.getByLabel("Planungsergebnis")).toContainText(/1\s*Tische/);
});

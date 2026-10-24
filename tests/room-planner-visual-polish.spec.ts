import { expect, test } from "@playwright/test";

test("Dalemans Branding bleibt in 2D, 3D und Druckausgabe sichtbar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");

  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const brand = editor.getByLabel("Dalemans Raumplaner");
  await expect(brand).toBeVisible();
  await expect(brand.locator("img")).toHaveAttribute("src", /dalemans-logo\.webp/);

  await editor.getByRole("button", { name: "3D", exact: true }).click();
  await expect(editor.getByLabel("3D-Raumansicht").locator("canvas")).toBeVisible();
  await expect(editor.getByLabel("3D-Raumansicht").getByLabel("Dalemans Raumplaner")).toBeVisible();

  await editor.getByRole("button", { name: "2D", exact: true }).click();
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of [{ x: 190, y: 150 }, { x: 520, y: 150 }, { x: 520, y: 410 }, { x: 190, y: 410 }]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  const watermark = canvas.locator('[data-planner-watermark="true"]');
  await expect(watermark).toHaveCount(1);
  await expect(watermark).toHaveAttribute("opacity", "0.08");
  await expect(watermark).toHaveCSS("pointer-events", "none");
  await editor.getByRole("button", { name: "Plan ausgeben" }).click();

  const output = page.getByRole("region", { name: "Plan-Ausgabe" });
  await expect(output.getByLabel("Dalemans Raumplaner")).toBeVisible();
  await expect(output.getByRole("img", { name: /Grundriss/ }).locator('[data-planner-watermark="true"]')).toHaveCount(1);
  await expect(output.getByText("Plan erstellt mit unserem DLMNS Raumplaner")).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(output.getByLabel("Dalemans Raumplaner")).toBeVisible();
  await expect(output.getByText("Plan erstellt mit unserem DLMNS Raumplaner")).toBeVisible();
});

test("kompaktes 2D-Branding überlagert die Ansichtssteuerung nicht", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const brandBox = await editor.getByLabel("Dalemans Raumplaner").boundingBox();
  const modesBox = await editor.getByLabel("Ansichtsmodus").boundingBox();
  expect(brandBox).not.toBeNull();
  expect(modesBox).not.toBeNull();
  expect(brandBox!.x + brandBox!.width).toBeLessThan(modesBox!.x);
});

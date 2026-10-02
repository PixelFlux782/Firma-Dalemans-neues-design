import { expect, test } from "@playwright/test";
import { chairProducts } from "../src/lib/room-planner/chairSelection";

test("Raumplaner verbindet Stuhlmodell und Angebotsbedarf im gemeinsamen Editor", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await expect(editor.getByLabel("Stuhlmodell")).toBeVisible();
  await editor.getByLabel("Stuhlmodell").selectOption(chairProducts[1].id);
  await expect(editor.getByLabel("Stuhlmodell")).toHaveValue(chairProducts[1].id);
  await expect(editor.getByLabel("Bedarf")).toContainText("Empfohlene Gesamtmenge");
  await expect(editor.getByRole("link", { name: /Angebot für diese Bestuhlung anfordern/ })).toHaveAttribute("href", /kontakt/);
  await editor.getByRole("button", { name: "3D", exact: true }).click();
  await expect(editor.getByLabel("3D-Raumansicht")).toBeVisible();
  await expect(editor.getByLabel("Stuhlmodell")).toHaveValue(chairProducts[1].id);
});

test("Raumplaner behält Türen und Hindernisse beim Ansichtswechsel", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const canvas = editor.getByRole("img", { name: /Grundriss Zeichenfl/ });
  await canvas.click({ position: { x: 160, y: 140 } });
  await canvas.click({ position: { x: 420, y: 140 } });
  await canvas.click({ position: { x: 420, y: 360 } });
  await canvas.click({ position: { x: 160, y: 360 } });
  await canvas.click({ position: { x: 160, y: 140 } });
  await editor.getByLabel("Raum und Werkzeuge").getByRole("button", { name: /Tür in Seitenleiste/ }).click();
  await canvas.click({ position: { x: 280, y: 140 } });
  await expect(editor.getByRole("button", { name: /Rückgängig/ })).toBeEnabled();
  await editor.getByRole("button", { name: "3D", exact: true }).click();
  await expect(editor.getByLabel("3D-Raumansicht")).toBeVisible();
  await editor.getByRole("button", { name: "2D", exact: true }).click();
  await expect(canvas).toBeVisible();
  await expect(editor.getByRole("button", { name: /Rückgängig/ })).toBeEnabled();
});

import { expect, test } from "@playwright/test";
import { chairProducts } from "../src/lib/room-planner/chairSelection";

test("Raumplaner verbindet Stuhlmodell und Angebotsbedarf im gemeinsamen Editor", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await editor.getByRole("button", { name: "Erweiterte Planung", exact: true }).click();
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
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const left = Math.round(box!.width * 0.24);
  const right = Math.round(box!.width * 0.68);
  const top = Math.round(box!.height * 0.3);
  const bottom = Math.round(box!.height * 0.76);

  await canvas.click({ position: { x: left, y: top } });
  await canvas.click({ position: { x: right, y: top } });
  await canvas.click({ position: { x: right, y: bottom } });
  await canvas.click({ position: { x: left, y: bottom } });
  await canvas.click({ position: { x: left, y: top } });
  await editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Türen" }).click();
  await editor.getByRole("button", { name: "Werkzeugoptionen schließen" }).click();
  await canvas.click({ position: { x: Math.round((left + right) / 2), y: top } });
  await editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Hindernisse" }).click();
  await editor.getByRole("button", { name: "Werkzeugoptionen schließen" }).click();
  await canvas.click({ position: { x: Math.round((left + right) / 2), y: Math.round((top + bottom) / 2) } });
  await expect(canvas.locator("[data-object-id]")).toHaveCount(2);
  await expect(editor.getByRole("button", { name: /Rückgängig/ })).toBeEnabled();
  await editor.getByRole("button", { name: "3D", exact: true }).click();
  await expect(editor.getByLabel("3D-Raumansicht")).toBeVisible();
  await editor.getByRole("button", { name: "2D", exact: true }).click();
  await expect(canvas).toBeVisible();
  await expect(canvas.locator("[data-object-id]")).toHaveCount(2);
  await expect(editor.getByRole("button", { name: /Rückgängig/ })).toBeEnabled();
});

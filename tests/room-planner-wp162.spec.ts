import { expect, test } from "@playwright/test";

test("WP16.2 switches the same editor between 2D and 3D without changing history or save state", async ({ page }) => {
  await page.goto("/raumplaner");
  const canvas = page.getByRole("img", { name: /Grundriss Zeichenfl/ });
  await expect(canvas).toBeVisible();
  await expect(page.getByRole("button", { name: "2D", exact: true })).toHaveAttribute("aria-pressed", "true");
  await canvas.click({ position: { x: 220, y: 180 } });
  await expect(page.getByRole("button", { name: /Rückgängig/ })).toBeEnabled();
  await expect(page.getByLabel("Projektverwaltung").getByRole("status")).toHaveText("Gespeichert");
  const before = await page.evaluate(() => localStorage.getItem("dalemans-room-planner-projects-v1"));
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByLabel("3D-Raumansicht")).toBeVisible();
  await page.getByRole("button", { name: "Ansicht zurücksetzen" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("dalemans-room-planner-projects-v1"))).toBe(before);
  await expect(page.getByRole("button", { name: /Rückgängig/ })).toBeEnabled();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(canvas).toBeVisible();
  await expect(page.getByRole("button", { name: /Rückgängig/ })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("dalemans-room-planner-projects-v1"))).toBe(before);
  await canvas.click({ position: { x: 310, y: 180 } });
  await expect(canvas.locator("[data-point-id]")).toHaveCount(2);
  await page.getByRole("button", { name: /Rückgängig/ }).click();
  await expect(canvas.locator("[data-point-id]")).toHaveCount(1);
  await page.getByRole("button", { name: /Rückgängig/ }).click();
  await expect(canvas.locator("[data-point-id]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Rückgängig/ })).toBeDisabled();
});


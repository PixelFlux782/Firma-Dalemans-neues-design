import { expect, test } from "@playwright/test";

test("WP16.1 desktop workspace keeps planning, results and actions together", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const workspace = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await expect(workspace).toBeVisible();
  await expect(page.getByLabel("Raum und Werkzeuge")).toBeVisible();
  await expect(page.getByRole("img", { name: "Grundriss Zeichenfläche" })).toBeVisible();
  await expect(page.getByLabel("Eigenschaften")).toBeVisible();
  await expect(page.getByLabel("Stuhlmodell")).toBeVisible();
  await expect(page.getByLabel("Reserve in Prozent")).toHaveValue("5");
  await expect(page.getByLabel("Bedarf")).toContainText("Empfohlene Gesamtmenge");
  await expect(page.getByLabel("Regelprofil", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Angebot für diese Bestuhlung anfordern" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Stuhl konfigurieren / Produkt ansehen" })).toBeVisible();
  const bounds = await workspace.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.height).toBeLessThan(900);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
  const offer = await page.getByRole("link", { name: "Angebot für diese Bestuhlung anfordern" }).boundingBox();
  expect(offer).not.toBeNull();
  expect(offer!.y + offer!.height).toBeLessThanOrEqual(900);
});

test("WP16.1 reserve updates the existing inquiry and product handoff", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/raumplaner");
  await page.getByLabel("Reserve in Prozent").selectOption("10");
  await expect(page.getByLabel("Bedarf")).toContainText("Reserve 0");
  const inquiry = page.getByRole("link", { name: "Angebot für diese Bestuhlung anfordern" });
  await expect(inquiry).toHaveAttribute("href", /Reserve%3A\+10/);
  await expect(page.getByRole("link", { name: "Stuhl konfigurieren / Produkt ansehen" })).toHaveAttribute("href", /produkte/);
  await expect(page.getByRole("img", { name: "Grundriss Zeichenfläche" })).toBeVisible();
});

test("WP16.1 tools, history and project actions reuse the existing state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  await page.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Tür" }).click();
  await expect(page.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Tür" })).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Raum / Kontur" }).click();
  const canvas = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await canvas.click({ position: { x: 240, y: 190 } });
  await expect(page.getByRole("button", { name: "Rückgängig" })).toBeEnabled();
  await page.getByRole("button", { name: "Rückgängig" }).click();
  await expect(page.getByRole("button", { name: "Wiederholen" })).toBeEnabled();
  await page.getByRole("button", { name: "Wiederholen" }).click();
  await expect(page.getByRole("button", { name: "Rückgängig" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Speichern", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Neues Projekt" })).toBeVisible();
  await expect(page.getByRole("button", { name: "JSON exportieren" })).toBeVisible();
});

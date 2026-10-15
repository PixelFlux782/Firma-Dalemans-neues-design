import { expect, test, type Page, type TestInfo } from "@playwright/test";

type VisualCase = {
  name: string;
  mode: "l-shape" | "u-shape";
  size: "small" | "large";
  withChairs: boolean;
};

const cases: VisualCase[] = [
  { name: "small-l-shape", mode: "l-shape", size: "small", withChairs: false },
  { name: "large-l-shape", mode: "l-shape", size: "large", withChairs: false },
  { name: "small-u-shape", mode: "u-shape", size: "small", withChairs: false },
  { name: "large-u-shape", mode: "u-shape", size: "large", withChairs: false },
  { name: "l-shape-with-chairs", mode: "l-shape", size: "large", withChairs: true },
  { name: "u-shape-with-chairs", mode: "u-shape", size: "large", withChairs: true },
];

async function drawPolygon(page: Page, points: { x: number; y: number }[]) {
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of points) await canvas.click({ position });
  return { editor, canvas };
}

for (const visualCase of cases) {
  test(`WP18.2a visual ${visualCase.name}`, async ({ page }, testInfo: TestInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/raumplaner");
    await page.locator('[data-help-ready="true"]').waitFor();
    const skipOnboarding = page.getByRole("button", { name: "Überspringen" });
    if (await skipOnboarding.isVisible()) await skipOnboarding.click();
    const { editor, canvas } = await drawPolygon(page, [{ x: 80, y: 60 }, { x: 680, y: 60 }, { x: 680, y: 470 }, { x: 80, y: 470 }]);
    await canvas.locator("[data-point-id]").first().click();
    await editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Tische", exact: true }).click();
    await page.getByLabel("Tischwerkzeug").selectOption("tables");
    const zonePoints = visualCase.size === "small"
      ? [{ x: 245, y: 145 }, { x: 515, y: 145 }, { x: 515, y: 370 }, { x: 245, y: 370 }]
      : [{ x: 150, y: 115 }, { x: 610, y: 115 }, { x: 610, y: 410 }, { x: 150, y: 410 }];
    for (const position of zonePoints) await canvas.click({ position });
    await page.getByRole("button", { name: "Tischbereich abschließen" }).click();
    await page.getByRole("button", { name: "Bereich einrichten", exact: true }).first().click();
    await page.getByLabel("Anordnung im Tischbereich").selectOption(visualCase.mode);
    await page.getByLabel("Planungsziel im Tischbereich").selectOption("capacity");
    await page.getByLabel("Tischmodell für Tischbereich").selectOption("table-310c-120x70");
    await page.getByLabel("Mit Stühlen bestuhlen").setChecked(visualCase.withChairs);
    await page.getByRole("button", { name: "Vorschlag erstellen" }).click();
    await expect(canvas.locator("[data-table-id]").first()).toBeVisible();
    if (visualCase.withChairs) await expect(canvas.locator("[data-chair-id]").first()).toBeVisible();
    else await expect(canvas.locator("[data-chair-id]")).toHaveCount(0);
    await editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Auswahl", exact: true }).click();
    await page.keyboard.press("Escape");
    await canvas.click({ position: { x: 710, y: 450 } });
    await canvas.screenshot({ path: testInfo.outputPath(`${visualCase.name}.png`) });
    if (visualCase.name === "u-shape-with-chairs") {
      const tableCount = await canvas.locator("[data-table-id]").count();
      const chairCount = await canvas.locator("[data-chair-id]").count();
      await editor.getByRole("button", { name: "3D", exact: true }).click();
      await expect(editor.getByLabel("3D-Raumansicht")).toBeVisible();
      await editor.getByRole("button", { name: "2D", exact: true }).click();
      await expect(canvas.locator("[data-table-id]")).toHaveCount(tableCount);
      await expect(canvas.locator("[data-chair-id]")).toHaveCount(chairCount);
      await editor.getByRole("button", { name: "Plan ausgeben" }).click();
      const output = page.getByRole("region", { name: "Plan-Ausgabe" });
      await expect(output.locator('svg polygon[fill="#d9c49a"]')).toHaveCount(tableCount);
      await expect(output.locator('svg polygon[fill="#557a69"]')).toHaveCount(chairCount);
    }
  });
}

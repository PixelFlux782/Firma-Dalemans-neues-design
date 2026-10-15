import { expect, test, type Page, type TestInfo } from "@playwright/test";

type VisualCase = {
  name: string;
  modelId: "table-310c-trapez-140x70" | "table-310c-trapez-160x80";
  mode: "trapezoid-groups" | "trapezoid-islands" | "trapezoid-long";
  goal: "balanced" | "comfort";
  zone: { x: number; y: number }[];
};

const cases: VisualCase[] = [
  { name: "trapezoid-hexagon-pair", modelId: "table-310c-trapez-140x70", mode: "trapezoid-groups", goal: "comfort", zone: [{ x: 245, y: 165 }, { x: 485, y: 165 }, { x: 485, y: 340 }, { x: 245, y: 340 }] },
  { name: "trapezoid-six-table-island", modelId: "table-310c-trapez-140x70", mode: "trapezoid-islands", goal: "balanced", zone: [{ x: 190, y: 115 }, { x: 550, y: 115 }, { x: 550, y: 405 }, { x: 190, y: 405 }] },
  { name: "trapezoid-elongated-group", modelId: "table-310c-trapez-160x80", mode: "trapezoid-long", goal: "balanced", zone: [{ x: 210, y: 120 }, { x: 530, y: 120 }, { x: 530, y: 405 }, { x: 210, y: 405 }] },
];

async function drawPolygon(page: Page, points: { x: number; y: number }[]) {
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of points) await canvas.click({ position });
  return { editor, canvas };
}

for (const visualCase of cases) {
  test(`WP18.2b visual ${visualCase.name}`, async ({ page }, testInfo: TestInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/raumplaner");
    await page.locator('[data-help-ready="true"]').waitFor();
    const skipOnboarding = page.getByRole("button", { name: "Überspringen" });
    if (await skipOnboarding.isVisible()) await skipOnboarding.click();
    const { editor, canvas } = await drawPolygon(page, [{ x: 70, y: 55 }, { x: 690, y: 55 }, { x: 690, y: 485 }, { x: 70, y: 485 }]);
    await canvas.locator("[data-point-id]").first().click();
    await editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Tische", exact: true }).click();
    await page.getByLabel("Tischwerkzeug").selectOption("tables");
    for (const position of visualCase.zone) await canvas.click({ position });
    await page.getByRole("button", { name: "Tischbereich abschließen" }).click();
    await page.getByRole("button", { name: "Bereich einrichten", exact: true }).first().click();
    await page.getByLabel("Tischmodell für Tischbereich").selectOption(visualCase.modelId);
    await expect(page.getByLabel("Anordnung im Tischbereich").locator('option[value="trapezoid-auto"]')).toHaveCount(1);
    await page.getByLabel("Anordnung im Tischbereich").selectOption(visualCase.mode);
    await page.getByLabel("Planungsziel im Tischbereich").selectOption(visualCase.goal);
    await page.getByLabel("Mit Stühlen bestuhlen").setChecked(true);
    await page.getByRole("button", { name: "Vorschlag erstellen" }).click();
    await expect(canvas.locator("[data-table-id]").first()).toBeVisible();
    await expect(canvas.locator("[data-chair-id]").first()).toBeVisible();
    await editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Auswahl", exact: true }).click();
    await page.keyboard.press("Escape");
    await canvas.screenshot({ path: testInfo.outputPath(`${visualCase.name}.png`) });

    if (visualCase.mode === "trapezoid-islands") {
      const tableCount = await canvas.locator("[data-table-id]").count();
      const chairCount = await canvas.locator("[data-chair-id]").count();
      expect(tableCount).toBe(6);
      expect(chairCount).toBe(12);
      await editor.getByRole("button", { name: "3D", exact: true }).click();
      await expect(editor.getByLabel("3D-Raumansicht")).toBeVisible();
      await editor.getByRole("button", { name: "2D", exact: true }).click();
      await editor.getByRole("button", { name: "Plan ausgeben" }).click();
      const output = page.getByRole("region", { name: "Plan-Ausgabe" });
      await expect(output.locator('svg polygon[fill="#d9c49a"]')).toHaveCount(tableCount);
      await expect(output.locator('svg polygon[fill="#557a69"]')).toHaveCount(chairCount);
    }
  });
}

import { expect, test } from "@playwright/test";
import { emptyPlan, type RoomPlan } from "../src/lib/room-planner/objects";
import { fitTableLayout, TABLE_MODELS, transformTableLayout } from "../src/lib/room-planner/tables";

const rectangularRoom = (): RoomPlan => ({
  ...emptyPlan(),
  contour: {
    closed: true,
    points: [{ id: "a", x: -6, y: -5 }, { id: "b", x: 6, y: -5 }, { id: "c", x: 6, y: 5 }, { id: "d", x: -6, y: 5 }],
    walls: [{ id: "ab", startPointId: "a", endPointId: "b" }, { id: "bc", startPointId: "b", endPointId: "c" }, { id: "cd", startPointId: "c", endPointId: "d" }, { id: "da", startPointId: "d", endPointId: "a" }],
  },
});

test("automatic fitting keeps the requested arrangement complete", () => {
  const fitted = fitTableLayout({ preset: "grid", modelId: TABLE_MODELS[0].id, count: 8, spacing: 1.2, rotation: 0, withChairs: true, plan: rectangularRoom() }, "fit");
  const transformed = transformTableLayout(fitted.layout, fitted.transform);
  expect(transformed.tables).toHaveLength(8);
  expect(transformed.chairs).toHaveLength(8 * TABLE_MODELS[0].defaultSeats);
  expect(fitted.conflicts.size).toBe(0);
});

test("table arrangements are previewed before all tables are adopted", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of [{ x: 80, y: 70 }, { x: 560, y: 70 }, { x: 560, y: 410 }, { x: 80, y: 410 }]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  await editor.getByRole("button", { name: "Automatisch einpassen" }).click();
  await expect(canvas.locator("[data-draft-table-id]")).toHaveCount(6);
  await expect(editor.getByRole("button", { name: "Anordnung übernehmen" })).toBeEnabled();
  await editor.getByRole("button", { name: "Anordnung übernehmen" }).click();
  await expect(canvas.locator("[data-draft-table-id]")).toHaveCount(0);
  await expect(canvas.locator("[data-table-id]")).toHaveCount(6);
  await canvas.locator("[data-table-id]").first().click();
  await expect(canvas.locator("[data-resize-id]")).toHaveCount(4);
  await expect(canvas.locator("[data-rotate-id]")).toHaveCount(1);
  const properties = editor.getByLabel("Eigenschaften");
  const width = properties.getByLabel("Breite (m)");
  const before = await width.inputValue();
  const handle = canvas.locator("[data-resize-id]").nth(2);
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 24, box.y + box.height / 2 + 12, { steps: 4 }); await page.mouse.up();
  await expect.poll(() => width.inputValue()).not.toBe(before);
});

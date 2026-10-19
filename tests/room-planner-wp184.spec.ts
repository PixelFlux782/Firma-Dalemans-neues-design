import { expect, test, type Page } from "@playwright/test";
import { emptyPlan, type RoomPlan } from "../src/lib/room-planner/objects";
import { deleteFurnitureSelection, duplicateFurnitureSelection, furnitureSelectionBounds, normalizeFurnitureSelection, selectFurnitureInMarquee, transformFurnitureSelection } from "../src/lib/room-planner/furnitureSelection";
import { DEFAULT_SEATING_RULES } from "../src/lib/room-planner/seating";

const HELP_KEY = "dlmns-room-planner-help-v1";

function planFixture(): RoomPlan {
  const plan = emptyPlan();
  return {
    ...plan,
    contour: {
      closed: true,
      points: [{ id: "a", x: -8, y: -6 }, { id: "b", x: 8, y: -6 }, { id: "c", x: 8, y: 6 }, { id: "d", x: -8, y: 6 }],
      walls: [{ id: "ab", startPointId: "a", endPointId: "b" }, { id: "bc", startPointId: "b", endPointId: "c" }, { id: "cd", startPointId: "c", endPointId: "d" }, { id: "da", startPointId: "d", endPointId: "a" }],
    },
    tables: [
      { id: "table-a", modelId: "table-310c-120x70", x: -2, y: 0, rotation: 0, width: 1.2, depth: .7, groupId: "group-a", source: "manual" },
      { id: "table-b", modelId: "table-310c-trapez-140x70", x: 2, y: 0, rotation: 30, width: 1.4, depth: .7, source: "manual" },
    ],
    chairs: [{ id: "chair-a", x: -2, y: 1, rotation: 180, width: .5, depth: .55, groupId: "group-a", tableId: "table-a", source: "manual" }],
    tableGroups: [{ id: "group-a", tableIds: ["table-a"], chairIds: ["chair-a"] }],
    zones: [{ id: "zone-a", type: "tables", rotation: 0, geometry: { kind: "rectangle", x: 0, y: 0, width: 12, depth: 8 } }],
    seating: {
      blocks: [{ id: "block-a", seats: [{ id: "seat-a", x: 0, y: 2, rotation: 0, row: 0, index: 0 }], rowCount: 1, seatsPerRow: [1] }],
      seats: [{ id: "seat-a", x: 0, y: 2, rotation: 0, row: 0, index: 0 }],
      totalSeats: 1, totalRows: 1, longestRow: 1, hints: [], rules: { ...DEFAULT_SEATING_RULES }, orientation: "horizontal",
    },
  };
}

test("WP18.4 Auswahlmodell nutzt nur Möbel-IDs und echte rotierte Fußabdrücke", () => {
  const plan = planFixture();
  expect(selectFurnitureInMarquee(plan, { x: -3, y: -1 }, { x: 3, y: 3 }).sort()).toEqual(["chair-a", "seat-a", "table-a", "table-b"]);
  expect(selectFurnitureInMarquee(plan, { x: -2.2, y: -.2 }, { x: -1.8, y: .2 })).toEqual([]);
  expect(normalizeFurnitureSelection(plan, ["zone-a", "table-a", "missing", "table-a"])).toEqual(["table-a"]);
  const bounds = furnitureSelectionBounds(plan, ["table-a", "chair-a"]);
  expect(bounds?.center.x).toBeCloseTo(-2);
  expect(bounds?.center.y).toBeCloseTo(.4625);
});

test("WP18.4 transformiert eine Mehrfachauswahl genau einmal und atomar", () => {
  const plan = planFixture();
  const rotated = transformFurnitureSelection(plan, ["table-a", "chair-a", "seat-a"], { rotation: 90, center: { x: 0, y: 0 } });
  expect(rotated.tables?.find(item => item.id === "table-a")).toMatchObject({ x: 0, y: -2, rotation: 90 });
  expect(rotated.chairs?.find(item => item.id === "chair-a")).toMatchObject({ x: -1, y: -2, rotation: 270 });
  expect(rotated.seating?.seats[0]).toMatchObject({ x: -2, y: 0, rotation: 90 });
  expect(rotated.seating?.blocks[0].seats[0]).toEqual(rotated.seating?.seats[0]);
  expect(rotated.tables?.find(item => item.id === "table-b")).toEqual(plan.tables?.[1]);
});

test("WP18.4 dupliziert nur explizit gewählte Möbel und verdrahtet Beziehungen neu", () => {
  const plan = planFixture();
  let id = 0;
  const result = duplicateFurnitureSelection(plan, ["table-a", "chair-a", "seat-a"], kind => `${kind}-copy-${++id}`);
  const copiedTable = (result.plan.tables ?? []).at(-1)!;
  const copiedChair = (result.plan.chairs ?? []).at(-1)!;
  expect(new Set(result.selectedIds).size).toBe(3);
  expect(copiedTable.id).not.toBe("table-a");
  expect(copiedChair.tableId).toBe(copiedTable.id);
  expect(copiedChair.groupId).not.toBe("group-a");
  expect(result.plan.tableGroups?.at(-1)).toMatchObject({ tableIds: [copiedTable.id], chairIds: [copiedChair.id] });
  expect(result.plan.seating?.blocks).toHaveLength(2);

  const tableOnly = duplicateFurnitureSelection(plan, ["table-a"], kind => `${kind}-solo-${++id}`);
  expect(tableOnly.plan.chairs).toHaveLength(1);
  expect(tableOnly.selectedIds).toHaveLength(1);
  const deleted = deleteFurnitureSelection(plan, ["table-a"]);
  expect(deleted.chairs?.[0].tableId).toBeUndefined();
});

test("WP18.4 verarbeitet 100+ Möbel ohne quadratische Auswahlkopien", () => {
  const densePlan: RoomPlan = {
    ...planFixture(),
    tables: [],
    tableGroups: [],
    seating: undefined,
    chairs: Array.from({ length: 144 }, (_, index) => ({
      id: `dense-chair-${index}`,
      x: -6.6 + index % 12 * 1.1,
      y: -4.8 + Math.floor(index / 12) * .85,
      rotation: index % 4 * 15,
      width: .5,
      depth: .55,
      source: "manual" as const,
    })),
  };
  const started = performance.now();
  const selected = selectFurnitureInMarquee(densePlan, { x: -8, y: -6 }, { x: 8, y: 6 });
  const moved = transformFurnitureSelection(densePlan, selected, { dx: .1, dy: .1 });
  expect(selected).toHaveLength(144);
  expect(moved.chairs?.every((chair, index) => chair.x === Number((densePlan.chairs![index].x + .1).toFixed(3)))).toBe(true);
  expect(performance.now() - started).toBeLessThan(1_000);
});

async function openEditor(page: Page) {
  await page.addInitScript(([key]) => localStorage.setItem(key, JSON.stringify({ onboardingSeen: true, dismissed: [] })), [HELP_KEY]);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/raumplaner");
  return page.getByRole("region", { name: "2D-Grundrisseditor" });
}

async function drawRoom(page: Page) {
  const editor = await openEditor(page);
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of [{ x: 70, y: 65 }, { x: 720, y: 65 }, { x: 720, y: 500 }, { x: 70, y: 500 }]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  await page.keyboard.press("Escape");
  return { editor, canvas };
}

test("WP18.4 Rahmen- und Shift-Auswahl erfassen Möbel, aber keine Planungsflächen", async ({ page }) => {
  const { editor, canvas } = await drawRoom(page);
  for (const position of [{ x: 270, y: 220 }, { x: 390, y: 220 }, { x: 510, y: 220 }]) {
    await editor.getByRole("button", { name: "Stühle", exact: true }).click();
    await canvas.click({ position });
  }
  await editor.getByRole("button", { name: "Auswahl", exact: true }).click();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 220, box.y + 170);
  await page.mouse.down();
  await page.mouse.move(box.x + 560, box.y + 270, { steps: 6 });
  await page.mouse.up();
  await expect(editor.getByRole("toolbar", { name: "Aktionen für Mehrfachauswahl" })).toContainText("3 Möbel");
  await canvas.locator("[data-chair-id]").first().click({ modifiers: ["Shift"] });
  await expect(editor.getByRole("toolbar", { name: "Aktionen für Mehrfachauswahl" })).toContainText("2 Möbel");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  await page.keyboard.press("Escape");
  await expect(editor.getByRole("toolbar", { name: "Aktionen für Mehrfachauswahl" })).toHaveCount(0);
});

test("WP18.4 automatische Tischanordnung lässt sich auswählen, drehen und duplizieren", async ({ page }) => {
  const { editor, canvas } = await drawRoom(page);
  await editor.getByRole("button", { name: "Erweiterte Planung", exact: true }).click();
  await editor.getByText("Erweitert", { exact: true }).click();
  await editor.getByLabel("Stühle gleich mitplanen").check();
  await editor.getByRole("button", { name: "Tische berechnen · Automatisch einpassen" }).click();
  await expect(editor.getByRole("button", { name: "Anordnung übernehmen" })).toBeEnabled();
  await editor.getByRole("button", { name: "Anordnung übernehmen" }).click();
  const tablesBefore = await canvas.locator("[data-table-id]").count();
  const chairsBefore = await canvas.locator("[data-chair-id]").count();
  expect(tablesBefore).toBeGreaterThan(1);
  expect(chairsBefore).toBeGreaterThan(1);
  await editor.getByRole("button", { name: "Alle erzeugten Möbel auswählen" }).click();
  const actions = editor.getByRole("toolbar", { name: "Aktionen für Mehrfachauswahl" });
  await expect(actions).toContainText(`${tablesBefore + chairsBefore} Möbel`);
  await actions.getByRole("button", { name: "90° drehen" }).click();
  await actions.getByRole("button", { name: "Duplizieren" }).click();
  await expect(canvas.locator("[data-table-id]")).toHaveCount(tablesBefore * 2);
  await expect(canvas.locator("[data-chair-id]")).toHaveCount(chairsBefore * 2);
  await page.keyboard.press("Control+z");
  await expect(canvas.locator("[data-table-id]")).toHaveCount(tablesBefore);
  await page.keyboard.press("Control+Shift+z");
  await expect(canvas.locator("[data-table-id]")).toHaveCount(tablesBefore * 2);
});

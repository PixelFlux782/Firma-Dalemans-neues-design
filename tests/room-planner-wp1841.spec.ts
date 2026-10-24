import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";
import type { RoomPlan } from "../src/lib/room-planner/objects";

const HELP_KEY = "dlmns-room-planner-help-v1";
const DISMISSED_HELP = ["start-room", "draw-room", "door-aisle", "table-zone", "zone-setup", "free-seating", "table-snap", "edit-object"];
const INITIAL_SCALE = 45;
type Point = { x: number; y: number };

async function openEditor(page: Page) {
  await page.addInitScript(([key, dismissed]: [string, string[]]) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify({ onboardingSeen: true, dismissed }));
  }, [HELP_KEY, DISMISSED_HELP] as [string, string[]]);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  return { editor, canvas };
}

async function createFilledTableZone(page: Page, zone = { left: 190, top: 135, right: 625, bottom: 425 }) {
  const { editor, canvas } = await openEditor(page);
  for (const position of [{ x: 55, y: 55 }, { x: 690, y: 55 }, { x: 690, y: 515 }, { x: 55, y: 515 }]) {
    await canvas.click({ position });
  }
  await canvas.locator("[data-point-id]").first().click();

  await editor.getByRole("button", { name: "Tische", exact: true }).click();
  await editor.getByLabel("Tischwerkzeug").selectOption("tables");
  for (const position of [
    { x: zone.left, y: zone.top },
    { x: zone.right, y: zone.top },
    { x: zone.right, y: zone.bottom },
    { x: zone.left, y: zone.bottom },
  ]) await canvas.click({ position });
  await page.getByRole("button", { name: "Tischbereich abschließen" }).click();

  await editor.getByRole("button", { name: "Bereich einrichten", exact: true }).click();
  await editor.getByLabel("Anordnung im Tischbereich").selectOption("individual");
  await editor.getByLabel("Mit Stühlen bestuhlen").check();
  await editor.getByRole("button", { name: "Vorschlag erstellen" }).click();
  await expect(canvas.locator("[data-table-id]").first()).toBeVisible();
  await expect(canvas.locator("[data-chair-id]").first()).toBeVisible();
  await editor.getByRole("button", { name: "Auswahl", exact: true }).click();
  return { editor, canvas, zone };
}

async function screenshot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
}

async function drag(page: Page, start: Point, end: Point, steps = 8) {
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps });
  await page.mouse.up();
}

async function dragMarquee(
  page: Page,
  canvas: Locator,
  start: Point,
  end: Point,
  options: { shift?: boolean; during?: () => Promise<void> } = {},
) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Die Zeichenfläche hat keine sichtbare Bounding Box.");
  if (options.shift) await page.keyboard.down("Shift");
  await page.mouse.move(box.x + start.x, box.y + start.y);
  await page.mouse.down();
  await page.mouse.move(box.x + end.x, box.y + end.y, { steps: 8 });
  await expect(canvas.getByLabel("Auswahlrahmen")).toBeVisible();
  await options.during?.();
  await page.mouse.up();
  if (options.shift) await page.keyboard.up("Shift");
}

async function dragMarqueeAbsolute(page: Page, canvas: Locator, start: Point, end: Point) {
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await expect(canvas.getByLabel("Auswahlrahmen")).toBeVisible();
  await page.mouse.up();
}

async function selectedFurnitureIds(canvas: Locator) {
  return canvas.locator("[data-table-id], [data-chair-id]").evaluateAll((elements) => elements.flatMap((element) => {
    const tableId = element.getAttribute("data-table-id");
    const chairId = element.getAttribute("data-chair-id");
    if (element.getAttribute("data-selected") !== "true") return [];
    if (tableId) return [tableId];
    if (chairId) return [chairId];
    return [];
  }));
}

async function selectAllFurniture(page: Page, canvas: Locator, zone: { left: number; top: number; right: number; bottom: number }) {
  await dragMarquee(page, canvas, { x: zone.left - 35, y: zone.top - 35 }, { x: zone.right + 35, y: zone.bottom + 35 });
  const ids = await selectedFurnitureIds(canvas);
  const total = await canvas.locator("[data-table-id], [data-chair-id]").count();
  expect(ids).toHaveLength(total);
  expect(new Set(ids).size).toBe(ids.length);
  return ids;
}

async function exportPlan(page: Page): Promise<RoomPlan> {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON exportieren" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let text = "";
  for await (const chunk of stream) text += chunk.toString();
  return (JSON.parse(text) as { plan: RoomPlan }).plan;
}

function furniture(plan: RoomPlan) {
  return [...(plan.tables ?? []), ...(plan.chairs ?? [])];
}

function furnitureMap(plan: RoomPlan) {
  return new Map(furniture(plan).map((item) => [item.id, item]));
}

test("A – Rahmen-, Klick- und Shift-Auswahl funktionieren im befüllten Tischbereich", async ({ page }, testInfo) => {
  const { editor, canvas, zone } = await createFilledTableZone(page);

  const firstTable = canvas.locator("[data-table-id]").first();
  const firstChair = canvas.locator("[data-chair-id]").first();
  await firstTable.click();
  expect(await selectedFurnitureIds(canvas)).toEqual([await firstTable.getAttribute("data-table-id")]);
  await firstChair.click({ modifiers: ["Shift"] });
  await expect(editor.getByRole("toolbar", { name: "Aktionen für Mehrfachauswahl" })).toContainText("2 Möbel");
  await page.keyboard.press("Escape");

  await screenshot(page, testInfo, "01-vor-rahmen");
  await dragMarquee(
    page,
    canvas,
    { x: zone.left + 8, y: zone.top + 8 },
    { x: (zone.left + zone.right) / 2, y: (zone.top + zone.bottom) / 2 + 40 },
    { during: () => screenshot(page, testInfo, "02-waehrend-rahmen") },
  );

  const actions = editor.getByRole("toolbar", { name: "Aktionen für Mehrfachauswahl" });
  await expect(actions).toBeVisible();
  const initialIds = await selectedFurnitureIds(canvas);
  expect(initialIds.length).toBeGreaterThan(1);
  await expect(canvas.locator("[data-zone-id]")).toHaveAttribute("stroke", "#8a6a2f");
  await screenshot(page, testInfo, "03-nach-auswahl");

  await dragMarquee(
    page,
    canvas,
    { x: zone.left - 35, y: zone.top - 35 },
    { x: zone.right + 35, y: zone.bottom + 35 },
    { shift: true },
  );
  expect((await selectedFurnitureIds(canvas)).length).toBeGreaterThan(initialIds.length);
});

test("B – ausgewählte Möbel bewegen sich gemeinsam; Bereich, Kontur sowie Undo/Redo bleiben korrekt", async ({ page }, testInfo) => {
  const { canvas, zone } = await createFilledTableZone(page);
  const ids = await selectAllFurniture(page, canvas, zone);
  const before = await exportPlan(page);
  const beforeById = furnitureMap(before);
  const table = canvas.locator("[data-table-id][data-selected='true']").first();
  const tableBox = await table.boundingBox();
  if (!tableBox) throw new Error("Kein ausgewählter Tisch zum Ziehen gefunden.");
  await drag(page, { x: tableBox.x + tableBox.width / 2, y: tableBox.y + tableBox.height / 2 }, { x: tableBox.x + tableBox.width / 2 + 25, y: tableBox.y + tableBox.height / 2 + 20 });
  const moved = await exportPlan(page);
  const movedById = furnitureMap(moved);
  for (const id of ids) {
    const oldItem = beforeById.get(id)!;
    const nextItem = movedById.get(id)!;
    expect(nextItem.x - oldItem.x).toBeCloseTo(25 / INITIAL_SCALE, 2);
    expect(nextItem.y - oldItem.y).toBeCloseTo(20 / INITIAL_SCALE, 2);
  }
  expect(moved.contour).toEqual(before.contour);
  expect(moved.zones).toEqual(before.zones);
  expect(moved.objects).toEqual(before.objects);
  await screenshot(page, testInfo, "04-nach-verschieben");

  await page.keyboard.press("Control+z");
  const undone = await exportPlan(page);
  expect(undone.tables).toEqual(before.tables);
  expect(undone.chairs).toEqual(before.chairs);
  await page.keyboard.press("Control+Shift+z");
  const redone = await exportPlan(page);
  expect(redone.tables).toEqual(moved.tables);
  expect(redone.chairs).toEqual(moved.chairs);
});

test("C – Strg+D erzeugt unabhängige Möbel mit eindeutigen IDs", async ({ page }, testInfo) => {
  const { canvas, zone } = await createFilledTableZone(page, { left: 120, top: 175, right: 340, bottom: 355 });
  const sourceIds = await selectAllFurniture(page, canvas, zone);
  const before = await exportPlan(page);
  await page.keyboard.press("Control+d");
  const duplicated = await exportPlan(page);
  expect(furniture(duplicated)).toHaveLength(furniture(before).length * 2);
  expect(new Set(furniture(duplicated).map((item) => item.id)).size).toBe(furniture(duplicated).length);
  const duplicatedById = furnitureMap(duplicated);
  for (const source of furniture(before)) expect(duplicatedById.get(source.id)).toEqual(source);
  const copyIds = await selectedFurnitureIds(canvas);
  expect(copyIds).toHaveLength(sourceIds.length);
  expect(copyIds.every((id) => !sourceIds.includes(id))).toBe(true);
  await screenshot(page, testInfo, "05-nach-duplizieren");

  const selectedTable = canvas.locator("[data-table-id][data-selected='true']").first();
  const box = await selectedTable.boundingBox();
  if (!box) throw new Error("Keine ausgewählte Tischkopie zum Ziehen gefunden.");
  await drag(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, { x: box.x + box.width / 2 + 230, y: box.y + box.height / 2 });
  const copyMoved = await exportPlan(page);
  const copyMovedById = furnitureMap(copyMoved);
  for (const source of furniture(before)) expect(copyMovedById.get(source.id)).toEqual(source);
  expect(copyIds.some((id) => copyMovedById.get(id)?.x !== duplicatedById.get(id)?.x)).toBe(true);
});

test("D – der gemeinsame Rotationsgriff dreht Positionen und Winkel und bleibt in 3D konsistent", async ({ page }) => {
  const { editor, canvas, zone } = await createFilledTableZone(page);
  const ids = await selectAllFurniture(page, canvas, zone);
  const before = await exportPlan(page);
  const beforeById = furnitureMap(before);
  const selectionGroup = canvas.getByLabel("Mehrfachauswahl");
  const frame = await selectionGroup.locator("rect").boundingBox();
  const handle = await selectionGroup.locator("[data-furniture-rotate]").boundingBox();
  if (!frame || !handle) throw new Error("Gemeinsamer Rotationsgriff fehlt.");
  await drag(
    page,
    { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 },
    { x: frame.x + frame.width + 40, y: frame.y + frame.height / 2 },
    12,
  );
  const rotated = await exportPlan(page);
  const rotatedById = furnitureMap(rotated);
  for (const id of ids) {
    const oldItem = beforeById.get(id)!;
    const nextItem = rotatedById.get(id)!;
    expect(nextItem.rotation).toBe((oldItem.rotation + 90) % 360);
  }
  expect(ids.some((id) => {
    const oldItem = beforeById.get(id)!;
    const nextItem = rotatedById.get(id)!;
    return oldItem.x !== nextItem.x || oldItem.y !== nextItem.y;
  })).toBe(true);

  await editor.getByRole("button", { name: "3D", exact: true }).click();
  await expect(editor.getByLabel("3D-Raumansicht").locator("canvas")).toBeVisible();
  await editor.getByRole("button", { name: "2D", exact: true }).click();
  const afterViewSwitch = await exportPlan(page);
  expect(afterViewSwitch.tables).toEqual(rotated.tables);
  expect(afterViewSwitch.chairs).toEqual(rotated.chairs);
});

test("E – Möbelrahmen verschiebt weder Tischbereich, Raumkontur, Gang noch Hindernis", async ({ page }) => {
  const { editor, canvas, zone } = await createFilledTableZone(page);
  await editor.getByRole("button", { name: "Gänge", exact: true }).click();
  await canvas.click({ position: { x: 85, y: 460 } });
  await canvas.click({ position: { x: 155, y: 460 } });
  await editor.getByRole("button", { name: "Hindernisse", exact: true }).click();
  await canvas.click({ position: { x: 400, y: 485 } });
  await editor.getByRole("button", { name: "Auswahl", exact: true }).click();
  await selectAllFurniture(page, canvas, zone);
  const before = await exportPlan(page);
  const selectedTable = canvas.locator("[data-table-id][data-selected='true']").first();
  const box = await selectedTable.boundingBox();
  if (!box) throw new Error("Kein ausgewähltes Möbel gefunden.");
  await drag(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, { x: box.x + box.width / 2 + 15, y: box.y + box.height / 2 + 10 });
  const after = await exportPlan(page);
  expect(after.contour).toEqual(before.contour);
  expect(after.zones).toEqual(before.zones);
  expect(after.objects).toEqual(before.objects);
  expect(await canvas.locator("[data-zone-id]").count()).toBe(1);
  expect(await canvas.locator("[data-object-id]").count()).toBeGreaterThanOrEqual(2);
});

test("F – Rahmenauswahl funktioniert bei 50 %, 100 %, 150 % und verschobenem Canvas", async ({ page }) => {
  const { editor, canvas } = await createFilledTableZone(page);
  let currentZoom = 100;
  const setZoom = async (targetZoom: number) => {
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error("Zeichenfläche nicht sichtbar.");
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
    await page.mouse.wheel(0, -Math.log(targetZoom / currentZoom) / .0015);
    currentZoom = targetZoom;
    await expect(editor.getByText(`${targetZoom} %`, { exact: true }).first()).toBeVisible();
  };
  const selectVisibleZone = async () => {
    await page.keyboard.press("Escape");
    const zoneBox = await canvas.locator("[data-zone-id]").boundingBox();
    if (!zoneBox) throw new Error("Tischbereich nicht sichtbar.");
    await dragMarqueeAbsolute(page, canvas, { x: zoneBox.x + 2, y: zoneBox.y + 2 }, { x: zoneBox.x + zoneBox.width - 2, y: zoneBox.y + zoneBox.height - 2 });
    expect((await selectedFurnitureIds(canvas)).length).toBeGreaterThan(1);
  };

  await selectVisibleZone();
  await setZoom(50);
  await selectVisibleZone();
  await setZoom(150);
  await selectVisibleZone();
  await setZoom(100);

  await page.keyboard.press("Escape");
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) throw new Error("Zeichenfläche nicht sichtbar.");
  await page.keyboard.down("Space");
  await drag(page, { x: canvasBox.x + canvasBox.width / 2, y: canvasBox.y + canvasBox.height / 2 }, { x: canvasBox.x + canvasBox.width / 2 + 70, y: canvasBox.y + canvasBox.height / 2 + 35 });
  await page.keyboard.up("Space");
  await selectVisibleZone();
});

test("G – Escape verwirft eine laufende Gruppentransformation vollständig", async ({ page }) => {
  const { canvas, zone } = await createFilledTableZone(page);
  await selectAllFurniture(page, canvas, zone);
  const before = await exportPlan(page);
  const selectedTable = canvas.locator("[data-table-id][data-selected='true']").first();
  const box = await selectedTable.boundingBox();
  if (!box) throw new Error("Kein ausgewählter Tisch zum Abbruchtest gefunden.");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 20, { steps: 6 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  const after = await exportPlan(page);
  expect(after.tables).toEqual(before.tables);
  expect(after.chairs).toEqual(before.chairs);
  await expect(canvas.getByLabel("Auswahlrahmen")).toHaveCount(0);
});

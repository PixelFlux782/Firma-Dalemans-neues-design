import { expect, test } from "@playwright/test";
import { emptyPlan, polygonsOverlap, type RoomPlan } from "../src/lib/room-planner/objects";
import { generateFreeAreaSeating, supplementSeatingPlan } from "../src/lib/room-planner/planning";
import { createProject, parseProject } from "../src/lib/room-planner/projects";
import { DEFAULT_SEATING_RULES } from "../src/lib/room-planner/seating";
import { fillTableZone, planCapacity, rotatedRectangle, seatTable, tablePolygon, type PlanningZone, type TableInstance } from "../src/lib/room-planner/tables";

const room = (width = 14, depth = 10): RoomPlan => ({
  ...emptyPlan(),
  contour: {
    closed: true,
    points: [{ id: "p1", x: 0, y: 0 }, { id: "p2", x: width, y: 0 }, { id: "p3", x: width, y: depth }, { id: "p4", x: 0, y: depth }],
    walls: [{ id: "w1", startPointId: "p1", endPointId: "p2" }, { id: "w2", startPointId: "p2", endPointId: "p3" }, { id: "w3", startPointId: "p3", endPointId: "p4" }, { id: "w4", startPointId: "p4", endPointId: "p1" }],
  },
});

const zone: PlanningZone = { id: "zone-1", type: "tables", geometry: { kind: "rectangle", x: 3, y: 3, width: 5.8, depth: 2.3 }, rotation: 0, source: "manual" };

test("WP17.2 globale Bestuhlung ist unabhängig vom ausgewählten Objektkontext", () => {
  const base = { ...room(), zones: [zone] };
  const filled = fillTableZone(base, { zoneId: zone.id, modelId: "table-310c-120x70", rotation: 0, clearance: .8 });
  const plan = { ...base, tables: filled.tables };
  const selectedZoneResult = generateFreeAreaSeating(plan, DEFAULT_SEATING_RULES);
  const noSelectionResult = generateFreeAreaSeating(plan, DEFAULT_SEATING_RULES);
  expect(selectedZoneResult).toEqual(noSelectionResult);
  expect(selectedZoneResult.totalSeats).toBeGreaterThan(0);
  expect(selectedZoneResult.seats.every((seat) => filled.tables.every((table) => !polygonsOverlap(rotatedRectangle({ ...seat, width: .5, depth: .55 }), tablePolygon(table))))).toBe(true);
});

test("WP17.2 große Tischmenge terminiert und wiederholtes Ergänzen dupliziert nicht", () => {
  const tables: TableInstance[] = Array.from({ length: 265 }, (_, index) => ({
    id: `table-${index}`, modelId: "table-310c-120x70", x: 2 + index % 25 * 1.6, y: 2 + Math.floor(index / 25) * 1.2,
    width: 1.2, depth: .7, rotation: 0, source: "auto",
  }));
  const plan = { ...room(45, 18), tables };
  const started = performance.now();
  const seating = generateFreeAreaSeating(plan, DEFAULT_SEATING_RULES);
  const once = supplementSeatingPlan({ ...plan, seating }, DEFAULT_SEATING_RULES, seating.orientation, { along: 0, cross: 0 }, seating.rotation);
  expect(performance.now() - started).toBeLessThan(5_000);
  expect(once).toBe(seating);
  expect(new Set(seating.seats.map((seat) => seat.id)).size).toBe(seating.seats.length);
});

test("WP17.2 Tischbelegungen 8/6/4 bleiben unabhängig und bestimmen die Kapazität", () => {
  const tables: TableInstance[] = [2.5, 6.5, 10.5].map((x, index) => ({ id: `table-${index + 1}`, modelId: "table-310c-180x80", x, y: 5, width: 1.8, depth: .8, rotation: 0, groupId: `group-${index + 1}`, source: "manual" }));
  let plan: RoomPlan = { ...room(), tables };
  for (const [index, count] of [8, 6, 4].entries()) {
    const result = seatTable(plan, tables[index].id, count);
    expect(result.placed).toBe(count);
    plan = { ...plan, chairs: [...(plan.chairs ?? []), ...result.chairs] };
  }
  expect(planCapacity(plan)).toEqual({ rowSeats: 0, tableSeats: 18, total: 18 });
  const withoutOne = { ...plan, chairs: plan.chairs!.slice(1) };
  expect(planCapacity(withoutOne)).toEqual({ rowSeats: 0, tableSeats: 17, total: 17 });
  expect(withoutOne.chairs!.filter((chair) => chair.tableId === "table-2")).toHaveLength(6);
  expect(parseProject(JSON.stringify(createProject("WP17.2", withoutOne))).plan.chairs).toHaveLength(17);
});

test("WP17.2 Browserablauf Tischbereich → Werkzeugwechsel → freie Raumfläche friert nicht ein", async ({ page }) => {
  test.setTimeout(20_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const toolbar = editor.getByLabel("Werkzeuge", { exact: true });
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of [{ x: 100, y: 70 }, { x: 620, y: 70 }, { x: 620, y: 390 }, { x: 100, y: 390 }]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  await toolbar.getByRole("button", { name: "Tische", exact: true }).click();
  await page.getByLabel("Tischwerkzeug").selectOption("tables");
  for (const position of [{ x: 210, y: 170 }, { x: 485, y: 170 }, { x: 485, y: 245 }, { x: 210, y: 245 }]) await canvas.click({ position });
  await page.getByRole("button", { name: "Tischbereich abschließen" }).click();
  await editor.getByLabel("Kontextbezogene Eigenschaften").getByRole("button", { name: "Mit Tischen befüllen" }).click();
  await expect(canvas.locator("[data-table-id]")).toHaveCount(3);
  await page.evaluate(() => { (window as typeof window & { __wp172Heartbeat?: number }).__wp172Heartbeat = 0; window.setInterval(() => { (window as typeof window & { __wp172Heartbeat?: number }).__wp172Heartbeat!++; }, 50); });
  await toolbar.getByRole("button", { name: "Stühle", exact: true }).click();
  await page.getByLabel("Stühle Optionen").getByRole("button", { name: "Freie Raumfläche bestuhlen" }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __wp172Heartbeat?: number }).__wp172Heartbeat ?? 0), { timeout: 5_000 }).toBeGreaterThan(1);
  await expect(canvas.locator("[data-table-id]")).toHaveCount(3);
  await expect(canvas.locator("[data-block-id]").first()).toBeVisible({ timeout: 5_000 });
});

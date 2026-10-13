import { expect, test } from "@playwright/test";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";
import { emptyPlan, polygonInsideRoom, polygonsOverlap, type RoomPlan } from "../src/lib/room-planner/objects";
import { createProject, parseProject } from "../src/lib/room-planner/projects";
import { planTableZone } from "../src/lib/room-planner/tableZonePlanning";
import { planCapacity, polygonsInteriorOverlap, rotatedRectangle, tablePolygon, zonePolygon, type PlanningZone, type TableInstance } from "../src/lib/room-planner/tables";

const room = (width = 14, depth = 11): RoomPlan => ({
  ...emptyPlan(),
  contour: {
    closed: true,
    points: [{ id: "p1", x: 0, y: 0 }, { id: "p2", x: width, y: 0 }, { id: "p3", x: width, y: depth }, { id: "p4", x: 0, y: depth }],
    walls: [{ id: "w1", startPointId: "p1", endPointId: "p2" }, { id: "w2", startPointId: "p2", endPointId: "p3" }, { id: "w3", startPointId: "p3", endPointId: "p4" }, { id: "w4", startPointId: "p4", endPointId: "p1" }],
  },
});

const zone = (width = 11, depth = 8): PlanningZone => ({ id: "zone-wp182", type: "tables", geometry: { kind: "polygon", points: [{ x: 1.5, y: 1.5 }, { x: 1.5 + width, y: 1.5 }, { x: 1.5 + width, y: 1.5 + depth }, { x: 1.5, y: 1.5 + depth }] }, rotation: 0, source: "manual" });
const base = (width = 11, depth = 8): RoomPlan => ({ ...room(), zones: [zone(width, depth)] });
const apply = (plan: RoomPlan, result: ReturnType<typeof planTableZone>): RoomPlan => ({ ...plan, tables: result.tables, chairs: result.chairs, tableGroups: result.groups });

test("WP18.2 polygonaler Tischbereich erzeugt gemeinsam geplante Einzeltische und Stühle", () => {
  const plan = base();
  const result = planTableZone(plan, { zoneId: zone().id, modelId: "table-310c-150x70", mode: "individual", goal: "balanced", withChairs: true });
  expect(result.tables.length).toBeGreaterThan(0);
  expect(result.chairs.length).toBeGreaterThan(0);
  expect(result.groups).toHaveLength(result.tables.length);
  expect(result.tables.every((table) => polygonInsideRoom(tablePolygon(table), { points: zonePolygon(zone()).map((point, index) => ({ ...point, id: `z${index}` })), walls: zonePolygon(zone()).map((_, index) => ({ id: `w${index}`, startPointId: `z${index}`, endPointId: `z${(index + 1) % 4}` })), closed: true }))).toBe(true);
  expect(result.durationMs).toBeLessThan(1_000);
});

test("WP18.2 lange Tafeln docken kollisionsfrei und lassen gemeinsame Kanten unbestuhlt", () => {
  const result = planTableZone(base(), { zoneId: zone().id, modelId: "table-310c-120x70", mode: "long-tables", goal: "balanced", withChairs: true });
  expect(result.tables.length).toBeGreaterThanOrEqual(2);
  for (let first = 0; first < result.tables.length; first++) for (let second = first + 1; second < result.tables.length; second++) {
    expect(polygonsInteriorOverlap(tablePolygon(result.tables[first]), tablePolygon(result.tables[second]))).toBe(false);
  }
  for (const chair of result.chairs) {
    expect(result.tables.filter((table) => table.id !== chair.tableId).some((table) => polygonsOverlap(rotatedRectangle(chair), tablePolygon(table)))).toBe(false);
  }
  expect(result.groups.every((group) => group.tableIds.length === 1)).toBe(true);
});

for (const mode of ["l-shape", "u-shape"] as const) {
  test(`WP18.2 ${mode} entsteht aus einzeln editierbaren, real gedrehten Tischen`, () => {
    const result = planTableZone(base(), { zoneId: zone().id, modelId: "table-310c-120x70", mode, goal: "capacity", withChairs: true });
    expect(result.tables.length).toBeGreaterThanOrEqual(mode === "u-shape" ? 6 : 4);
    expect(new Set(result.tables.map((table) => table.rotation)).size).toBeGreaterThan(1);
    expect(result.groups).toHaveLength(result.tables.length);
    expect(result.groups.every((group) => group.tableIds.length === 1)).toBe(true);
  });
}

test("WP18.2 Planungsziele sind fachlich messbar verschieden", () => {
  const plan = base();
  const capacity = planTableZone(plan, { zoneId: zone().id, modelId: "table-310c-120x70", mode: "individual", goal: "capacity", withChairs: true });
  const balanced = planTableZone(plan, { zoneId: zone().id, modelId: "table-310c-120x70", mode: "individual", goal: "balanced", withChairs: true });
  const comfort = planTableZone(plan, { zoneId: zone().id, modelId: "table-310c-120x70", mode: "individual", goal: "comfort", withChairs: true });
  expect(capacity.tables.length).toBeGreaterThanOrEqual(balanced.tables.length);
  expect(balanced.tables.length).toBeGreaterThanOrEqual(comfort.tables.length);
  expect(new Set([capacity.tables[0]?.fillClearance, balanced.tables[0]?.fillClearance, comfort.tables[0]?.fillClearance]).size).toBe(3);
});

test("WP18.2 Trapeztische verwenden reale Polygone und erzeugen keine Innenüberlappung", () => {
  const result = planTableZone(base(), { zoneId: zone().id, modelId: "table-310c-trapez-160x80", mode: "long-tables", goal: "capacity", withChairs: true });
  expect(result.tables.length).toBeGreaterThanOrEqual(2);
  expect(result.chairs.length).toBeGreaterThan(0);
  for (let first = 0; first < result.tables.length; first++) for (let second = first + 1; second < result.tables.length; second++) expect(polygonsInteriorOverlap(tablePolygon(result.tables[first]), tablePolygon(result.tables[second]))).toBe(false);
});

test("WP18.2 enge unmögliche Form meldet Alternative statt unbrauchbarer U-Form", () => {
  const plan = base(2.2, 1.5);
  const result = planTableZone(plan, { zoneId: zone(2.2, 1.5).id, modelId: "table-310c-180x80", mode: "u-shape", goal: "comfort", withChairs: true });
  expect(result.tables).toHaveLength(0);
  expect(result.suggestedMode).toBe("individual");
  expect(result.message).toContain("Einzeltische");
});

test("WP18.2 schützt manuelle Objekte, ist wiederholbar und erzeugt keine Duplikate", () => {
  const manual: TableInstance = { id: "manual-table", modelId: "table-310c-120x70", x: 3, y: 3, width: 1.2, depth: .7, rotation: 0, zoneId: zone().id, source: "manual", edited: true };
  const plan = { ...base(), tables: [manual] };
  const first = planTableZone(plan, { zoneId: zone().id, modelId: "table-310c-120x70", mode: "individual", goal: "balanced", withChairs: true });
  expect(first.protectedTableIds).toContain(manual.id);
  const adopted = { ...plan, tables: [manual, ...first.tables], chairs: first.chairs, tableGroups: first.groups };
  const repeated = planTableZone(adopted, { zoneId: zone().id, modelId: "table-310c-120x70", mode: "individual", goal: "balanced", withChairs: true });
  expect(repeated.unchanged).toBe(false);
  expect(new Set(repeated.tables.map((table) => table.id)).size).toBe(repeated.tables.length);
  expect(repeated.protectedTableIds).toContain(manual.id);
});

test("WP18.2 identische erneute Ausführung bleibt ohne Änderung", () => {
  const plan = base();
  const first = planTableZone(plan, { zoneId: zone().id, modelId: "table-310c-120x70", mode: "individual", goal: "balanced", withChairs: true });
  const adopted = apply(plan, first);
  const repeated = planTableZone(adopted, { zoneId: zone().id, modelId: "table-310c-120x70", mode: "individual", goal: "balanced", withChairs: true });
  expect(repeated.unchanged).toBe(true);
  expect(repeated.replaceableTableIds).toHaveLength(first.tables.length);
  expect(new Set(repeated.tables.map((table) => table.id)).size).toBe(first.tables.length);
});

test("WP18.2 Übernahme bleibt atomar, JSON-kompatibel und zählt nur reale Sitzobjekte", () => {
  const original = base();
  const result = planTableZone(original, { zoneId: zone().id, modelId: "table-310c-120x70", mode: "long-tables", goal: "balanced", withChairs: true });
  const adopted = apply(original, result), history = commit(createHistory(original), adopted);
  expect(undo(history).present.tables).toHaveLength(0);
  expect(redo(undo(history)).present.chairs).toHaveLength(result.chairs.length);
  expect(planCapacity(adopted)).toEqual({ rowSeats: 0, tableSeats: result.chairs.length, total: result.chairs.length });
  const loaded = parseProject(JSON.stringify(createProject("WP18.2", adopted))).plan;
  expect(loaded.tables).toHaveLength(result.tables.length);
  expect(loaded.chairs).toHaveLength(result.chairs.length);
  expect(loaded.tables?.[0].autoLayout).toBe("long-tables");
});

test("WP18.2 UI: Bereich einrichten erzeugt mit einem Klick einen editierbaren Vorschlag", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of [{ x: 80, y: 60 }, { x: 680, y: 60 }, { x: 680, y: 470 }, { x: 80, y: 470 }]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  await editor.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Tische", exact: true }).click();
  await page.getByLabel("Tischwerkzeug").selectOption("tables");
  for (const position of [{ x: 170, y: 140 }, { x: 580, y: 140 }, { x: 580, y: 390 }, { x: 170, y: 390 }]) await canvas.click({ position });
  await page.getByRole("button", { name: "Tischbereich abschließen" }).click();
  await page.getByRole("button", { name: "Bereich einrichten", exact: true }).first().click();
  await page.getByLabel("Anordnung im Tischbereich").selectOption("long-tables");
  await page.getByRole("button", { name: "Vorschlag erstellen" }).click();
  await expect(canvas.locator("[data-table-id]").first()).toBeVisible();
  await expect(canvas.locator("[data-chair-id]").first()).toBeVisible();
});

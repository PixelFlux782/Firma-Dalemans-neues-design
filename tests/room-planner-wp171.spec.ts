import { expect, test } from "@playwright/test";
import { createProject, parseProject } from "../src/lib/room-planner/projects";
import { aislePolygon, emptyPlan, obstaclePolygon, polygonInsideRoom, polygonsOverlap, type RoomPlan } from "../src/lib/room-planner/objects";
import { DEFAULT_SEATING_RULES, generateSeatingPlan } from "../src/lib/room-planner/seating";
import { fillTableZone, moveZonePoint, tablePolygon, validateTables, validateZonePolygon, zonePolygon, type PlanningZone } from "../src/lib/room-planner/tables";

const rectangularRoom = (): RoomPlan => ({
  ...emptyPlan(),
  contour: {
    closed: true,
    points: [{ id: "p1", x: 0, y: 0 }, { id: "p2", x: 14, y: 0 }, { id: "p3", x: 14, y: 10 }, { id: "p4", x: 0, y: 10 }],
    walls: [{ id: "w1", startPointId: "p1", endPointId: "p2" }, { id: "w2", startPointId: "p2", endPointId: "p3" }, { id: "w3", startPointId: "p3", endPointId: "p4" }, { id: "w4", startPointId: "p4", endPointId: "p1" }],
  },
});

const polygonZone: PlanningZone = {
  id: "zone-polygon",
  type: "tables",
  geometry: { kind: "polygon", points: [{ x: 1, y: 1 }, { x: 13, y: 1 }, { x: 12, y: 9 }, { x: 2, y: 9 }] },
  rotation: 0,
  source: "manual",
};

test("WP17.1 validiert freie Polygonkonturen und verschiebt einzelne Eckpunkte", () => {
  expect(validateZonePolygon(polygonZone.geometry.kind === "polygon" ? polygonZone.geometry.points : [])).toEqual([]);
  expect(validateZonePolygon([{ x: 1, y: 1 }, { x: 5, y: 5 }, { x: 1, y: 5 }, { x: 5, y: 1 }])).toContain("Tischbereich überschneidet sich selbst.");
  expect(validateZonePolygon([{ x: 1, y: 1 }, { x: 2, y: 2 }])).toContain("Ein Tischbereich benötigt mindestens drei Eckpunkte.");
  const moved = moveZonePoint(polygonZone, 2, { x: 11, y: 8 });
  expect(moved.geometry.kind === "polygon" && moved.geometry.points[2]).toEqual({ x: 11, y: 8 });
  expect(zonePolygon(polygonZone)[2]).toEqual({ x: 12, y: 9 });
});

test("WP17.1 weist Tischbereiche außerhalb des Raums und über Ausschlussflächen zurück", () => {
  const outside: PlanningZone = { ...polygonZone, id: "outside", geometry: { kind: "polygon", points: [{ x: 12, y: 8 }, { x: 15, y: 8 }, { x: 15, y: 11 }] } };
  const obstacle = { id: "blocked", type: "obstacle" as const, obstacleType: "restricted" as const, x: 6, y: 5, width: 2, depth: 2, rotation: 0 };
  const plan = { ...rectangularRoom(), zones: [outside, polygonZone], objects: [obstacle] };
  const messages = validateTables(plan).map((issue) => issue.message);
  expect(messages.some((message) => message.includes("außerhalb"))).toBe(true);
  expect(messages.some((message) => message.includes("Sperrfläche"))).toBe(true);
});

test("WP17.1 speichert Polygonzonen und migriert rechteckige WP17-Projekte", () => {
  const current = createProject("Polygon", { ...rectangularRoom(), zones: [polygonZone] });
  expect(parseProject(JSON.stringify(current)).plan.zones?.[0]).toEqual(polygonZone);
  const legacyZone: PlanningZone = { id: "legacy", type: "tables", geometry: { kind: "rectangle", x: 5, y: 4, width: 4, depth: 3 }, rotation: 15, source: "manual" };
  const legacy = { ...createProject("Alt", { ...rectangularRoom(), zones: [legacyZone] }), schemaVersion: 2 };
  const parsed = parseProject(JSON.stringify(legacy));
  expect(parsed.schemaVersion).toBe(3);
  expect(parsed.plan.zones?.[0]).toEqual(legacyZone);
});

test("WP17.1 befüllt reproduzierbar, kollisionsfrei und ohne Duplikate", () => {
  const obstacle = { id: "obstacle", type: "obstacle" as const, obstacleType: "column" as const, x: 6, y: 5, width: 1.2, depth: 1.2, rotation: 0 };
  const aisle = { id: "aisle", type: "aisle" as const, start: { x: 1, y: 5 }, end: { x: 13, y: 5 }, width: .8, source: "manual" as const };
  const plan: RoomPlan = { ...rectangularRoom(), zones: [polygonZone], objects: [obstacle, aisle] };
  const first = fillTableZone(plan, { zoneId: polygonZone.id, modelId: "table-310c-120x70", rotation: 0, clearance: .5 });
  const second = fillTableZone(plan, { zoneId: polygonZone.id, modelId: "table-310c-120x70", rotation: 0, clearance: .5 });
  expect(first.tables.length).toBeGreaterThan(0);
  expect(second.tables).toEqual(first.tables);
  for (const table of first.tables) {
    expect(polygonInsideRoom(tablePolygon(table), plan.contour)).toBe(true);
    expect(polygonInsideRoom(tablePolygon(table), { closed: true, points: zonePolygon(polygonZone).map((point, index) => ({ id: `z${index}`, ...point })), walls: zonePolygon(polygonZone).map((_, index, points) => ({ id: `zw${index}`, startPointId: `z${index}`, endPointId: `z${(index + 1) % points.length}` })) })).toBe(true);
    expect(polygonsOverlap(tablePolygon(table), obstaclePolygon(obstacle))).toBe(false);
    expect(polygonsOverlap(tablePolygon(table), aislePolygon(aisle))).toBe(false);
  }
  const filledPlan = { ...plan, tables: first.tables };
  const repeated = fillTableZone(filledPlan, { zoneId: polygonZone.id, modelId: "table-310c-120x70", rotation: 0, clearance: .5 });
  expect(repeated.unchanged).toBe(true);
  expect(repeated.tables).toEqual(first.tables);
  const changedClearance = fillTableZone(filledPlan, { zoneId: polygonZone.id, modelId: "table-310c-120x70", rotation: 0, clearance: .8 });
  expect(changedClearance.unchanged).toBe(false);
  expect(changedClearance.replaceableTableIds).toEqual(first.tables.map((table) => table.id));
});

test("WP17.1 schützt manuell verschobene Tische und Polygonzonen vor Reihenbestuhlung", () => {
  const plan: RoomPlan = { ...rectangularRoom(), zones: [polygonZone] };
  const initial = fillTableZone(plan, { zoneId: polygonZone.id, modelId: "table-310c-120x70", rotation: 0, clearance: .5 });
  const protectedTable = { ...initial.tables[0], x: initial.tables[0].x + .1, edited: true };
  const result = fillTableZone({ ...plan, tables: [protectedTable] }, { zoneId: polygonZone.id, modelId: "table-310c-120x70", rotation: 90, clearance: .5 });
  expect(result.protectedTableIds).toContain(protectedTable.id);
  expect(result.replaceableTableIds).not.toContain(protectedTable.id);
  const seating = generateSeatingPlan(plan, DEFAULT_SEATING_RULES);
  expect(seating.seats.every((seat) => !pointInside(seat, zonePolygon(polygonZone)))).toBe(true);
});

test("WP17.1 UI zeichnet, befüllt und zeigt nur den gewählten Kontext", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const toolbar = editor.getByLabel("Werkzeuge", { exact: true });
  await expect(toolbar.getByRole("button")).toHaveCount(8);
  for (const label of ["Auswahl", "Raum", "Türen", "Gänge", "Stühle", "Tische", "Sperrflächen", "Hindernisse"]) await expect(toolbar.getByRole("button", { name: label, exact: true })).toBeVisible();
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of [{ x: 100, y: 70 }, { x: 620, y: 70 }, { x: 620, y: 390 }, { x: 100, y: 390 }]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  await toolbar.getByRole("button", { name: "Tische", exact: true }).click();
  await page.getByLabel("Tischwerkzeug").selectOption("tables");
  for (const position of [{ x: 220, y: 150 }, { x: 500, y: 150 }, { x: 530, y: 320 }, { x: 200, y: 320 }]) await canvas.click({ position });
  await page.getByRole("button", { name: "Tischbereich abschließen" }).click();
  await expect(canvas.locator("[data-zone-id]")).toHaveCount(1);
  const context = editor.getByLabel("Kontextbezogene Eigenschaften");
  await expect(context.getByRole("button", { name: "Mit Tischen befüllen" })).toBeVisible();
  await expect(context.getByLabel("Türrolle")).toHaveCount(0);
  await context.getByRole("button", { name: "Mit Tischen befüllen" }).click();
  await expect(canvas.locator("[data-table-id]").first()).toBeVisible();
  const count = await canvas.locator("[data-table-id]").count();
  await context.getByRole("button", { name: "Mit Tischen befüllen" }).click();
  await expect(canvas.locator("[data-table-id]")).toHaveCount(count);
  await editor.getByRole("button", { name: "3D", exact: true }).click();
  await expect(editor.getByLabel("3D-Raumansicht")).toBeVisible();
  await editor.getByRole("button", { name: "2D", exact: true }).click();
  await page.keyboard.press("Escape");
  await editor.getByRole("button", { name: "Plan ausgeben", exact: true }).click();
  await expect(page.getByRole("region", { name: "Plan-Ausgabe" }).locator("[data-output-zone-id]")).toHaveCount(1);
  await page.getByRole("button", { name: "Zurück zum Editor" }).click();
  await expect(editor).toBeVisible();
});

function pointInside(point: { x: number; y: number }, polygon: { x: number; y: number }[]) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[index], b = polygon[previous];
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

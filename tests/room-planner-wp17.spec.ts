import { expect, test } from "@playwright/test";
import { emptyPlan, type RoomPlan } from "../src/lib/room-planner/objects";
import { TABLE_MODELS, TABLE_PRESETS, generateTableLayout, moveTableGroup, planCapacity, tablePolygon, validateTables, zonePolygon, type PlanningZone } from "../src/lib/room-planner/tables";
import { createHistory, commit, redo, undo } from "../src/lib/room-planner/history";
import { createProject, normalizeProject, parseProject, PROJECT_SCHEMA_VERSION } from "../src/lib/room-planner/projects";

const room = (): RoomPlan => ({ ...emptyPlan(), contour: { closed: true, points: [{ id: "p1", x: -6, y: -5 }, { id: "p2", x: 6, y: -5 }, { id: "p3", x: 6, y: 5 }, { id: "p4", x: -6, y: 5 }], walls: [{ id: "w1", startPointId: "p1", endPointId: "p2" }, { id: "w2", startPointId: "p2", endPointId: "p3" }, { id: "w3", startPointId: "p3", endPointId: "p4" }, { id: "w4", startPointId: "p4", endPointId: "p1" }] } });
const zone: PlanningZone = { id: "zone-1", type: "tables", geometry: { kind: "rectangle", x: 0, y: 0, width: 10, depth: 8 }, rotation: 0 };

test("WP17 catalog describes all optimized table GLBs", () => {
  expect(TABLE_MODELS.map(model => model.modelPath)).toEqual(["/models/dalemans-tisch-210-low.glb", "/models/dalemans-tisch-310-low.glb", "/models/dalemans-tisch-trapez-low.glb"]);
  expect(TABLE_MODELS.every(model => model.width > 1 && model.depth > .5 && model.height > .5)).toBe(true);
  expect(TABLE_PRESETS).toHaveLength(14);
});

test("WP17 grid and bistro presets materialize normal editable objects", () => {
  const grid = generateTableLayout({ preset: "grid", modelId: TABLE_MODELS[0].id, count: 6, columns: 3, spacing: .7, rotation: 90, withChairs: false, zone }, "grid");
  expect(grid.tables).toHaveLength(6);
  expect(grid.tables.every(table => table.source === "preset" && table.rotation === 90)).toBe(true);
  const bistro = generateTableLayout({ preset: "bistro", modelId: TABLE_MODELS[1].id, count: 4, columns: 2, spacing: 1.2, rotation: 0, withChairs: true, chairsPerTable: 4, zone }, "bistro");
  expect(bistro.tables).toHaveLength(4);
  expect(bistro.chairs).toHaveLength(16);
  expect(bistro.groups).toHaveLength(4);
  expect(new Set(bistro.tables.map(table => table.rotation)).size).toBeGreaterThan(1);
});

test("WP17 table groups move and rotate while their objects stay separate", () => {
  const generated = generateTableLayout({ preset: "single", modelId: TABLE_MODELS[0].id, count: 1, spacing: 1, rotation: 0, withChairs: true, chairsPerTable: 6, zone }, "group");
  const plan = { ...room(), ...generated, tableGroups: generated.groups };
  const moved = moveTableGroup(plan, generated.groups[0].id, 2, -1, 90);
  expect(moved.tables?.[0].x).toBeCloseTo((plan.tables?.[0].x ?? 0) + 2);
  expect(moved.tables?.[0].rotation).toBe(90);
  expect(moved.chairs).toHaveLength(6);
  expect(moved.chairs?.every(chair => chair.groupId === generated.groups[0].id)).toBe(true);
});

test("WP17 collision checks flag wall, table, obstacle, aisle, and chair conflicts", () => {
  const base = generateTableLayout({ preset: "single", modelId: TABLE_MODELS[0].id, count: 1, spacing: 1, rotation: 0, withChairs: false, zone }, "collision").tables[0];
  const plan: RoomPlan = { ...room(), tables: [base, { ...base, id: "table-overlap" }, { ...base, id: "table-wall", x: 5.8 }], chairs: [{ id: "chair-hit", x: base.x, y: base.y, width: .5, depth: .55, rotation: 0, source: "manual" }], objects: [{ id: "obstacle-1", type: "obstacle", obstacleType: "column", x: base.x, y: base.y, width: .5, depth: .5, rotation: 0 }, { id: "aisle-1", type: "aisle", start: { x: -2, y: 0 }, end: { x: 2, y: 0 }, width: 1 }], zones: [zone], tableGroups: [] };
  const messages = validateTables(plan).map(issue => issue.message).join(" ");
  expect(messages).toContain("außerhalb"); expect(messages).toContain("kollidiert mit table-overlap"); expect(messages).toContain("Hindernis"); expect(messages).toContain("Gang"); expect(messages).toContain("Stuhl");
});

test("WP17 schema persists tables, chairs, zones and groups and migrates v1", () => {
  const generated = generateTableLayout({ preset: "single", modelId: TABLE_MODELS[0].id, count: 1, spacing: 1, rotation: 45, withChairs: true, zone }, "persist");
  const project = createProject("WP17", { ...room(), tables: generated.tables, chairs: generated.chairs, zones: [zone], tableGroups: generated.groups });
  const parsed = parseProject(JSON.stringify(project));
  expect(parsed.schemaVersion).toBe(PROJECT_SCHEMA_VERSION); expect(parsed.plan.tables).toEqual(project.plan.tables); expect(parsed.plan.zones).toEqual([zone]);
  const legacy = normalizeProject({ ...project, schemaVersion: 1, plan: { contour: room().contour, objects: [] } });
  expect(legacy.plan.tables).toEqual([]); expect(legacy.plan.zones).toEqual([]);
});

test("WP17 undo and redo preserve table operations and differentiated capacity", () => {
  const table = generateTableLayout({ preset: "single", modelId: TABLE_MODELS[0].id, count: 1, spacing: 1, rotation: 0, withChairs: true, chairsPerTable: 4, zone }, "history");
  const before = room(), after = { ...before, tables: table.tables, chairs: table.chairs, tableGroups: table.groups };
  const history = commit(createHistory(before), after);
  expect(undo(history).present.tables).toEqual([]); expect(redo(undo(history)).present.tables).toHaveLength(1);
  expect(planCapacity(after)).toEqual({ rowSeats: 0, tableSeats: 4, total: 4 });
  expect(tablePolygon(after.tables![0])).toHaveLength(4); expect(zonePolygon(zone)).toHaveLength(4);
});

test("WP17 editor places, selects, rotates, duplicates and deletes a table", async ({ page }) => {
  let tableModelRequests = 0;
  page.on("request", request => { if (request.url().endsWith("/models/dalemans-tisch-210-low.glb")) tableModelRequests += 1; });
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("/raumplaner");
  const canvas = page.getByRole("img", { name: /Grundriss Zeichenfläche/ });
  for (const position of [{x:140,y:110},{x:500,y:110},{x:500,y:380},{x:140,y:380}]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  await page.getByRole("button", { name: "Tisch", exact: true }).click(); await canvas.click({ position: { x: 390, y: 300 } });
  await expect(canvas.locator("[data-table-id]")).toHaveCount(1);
  await page.getByRole("button", { name: "Auswahl", exact: true }).click(); await canvas.locator("[data-table-id]").click();
  await page.getByLabel("Tischrotation").selectOption("90"); await expect(page.getByLabel("Tischrotation")).toHaveValue("90");
  await page.getByRole("button", { name: "Tisch duplizieren" }).click(); await expect(canvas.locator("[data-table-id]")).toHaveCount(2);
  await page.getByRole("button", { name: "3D", exact: true }).click(); await expect(page.getByLabel("3D-Raumansicht").locator("canvas")).toBeVisible();
  await expect.poll(() => tableModelRequests).toBe(1);
  await page.getByRole("button", { name: "2D", exact: true }).click(); await expect(canvas.locator("[data-table-id]")).toHaveCount(2);
  await page.getByRole("button", { name: "Tisch löschen" }).click(); await expect(canvas.locator("[data-table-id]")).toHaveCount(1);
});

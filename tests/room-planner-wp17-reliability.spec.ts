import { expect, test } from "@playwright/test";
import { createProject, parseProject } from "../src/lib/room-planner/projects";
import { emptyPlan, type RoomPlan } from "../src/lib/room-planner/objects";
import { replanningImpact, supplementSeatingPlan } from "../src/lib/room-planner/planning";
import { DEFAULT_SEATING_RULES, generateSeatingPlan, type SeatingPlan } from "../src/lib/room-planner/seating";
import { zonePolygon, type PlanningZone } from "../src/lib/room-planner/tables";

const room = (): RoomPlan => ({
  ...emptyPlan(),
  contour: {
    closed: true,
    points: [{ id: "p1", x: 0, y: 0 }, { id: "p2", x: 10, y: 0 }, { id: "p3", x: 10, y: 8 }, { id: "p4", x: 0, y: 8 }],
    walls: [{ id: "w1", startPointId: "p1", endPointId: "p2" }, { id: "w2", startPointId: "p2", endPointId: "p3" }, { id: "w3", startPointId: "p3", endPointId: "p4" }, { id: "w4", startPointId: "p4", endPointId: "p1" }],
  },
});
const tableZone: PlanningZone = { id: "tables-1", type: "tables", geometry: { kind: "rectangle", x: 5, y: 4, width: 4, depth: 3 }, rotation: 0, source: "manual" };

test("WP17 Tischbereich verdrängt Reihen und seine Entfernung gibt die Fläche wieder frei", () => {
  const open = generateSeatingPlan(room(), DEFAULT_SEATING_RULES);
  const reserved = generateSeatingPlan({ ...room(), zones: [tableZone] }, DEFAULT_SEATING_RULES);
  expect(reserved.totalSeats).toBeLessThan(open.totalSeats);
  expect(reserved.seats.every((seat) => !pointInTableZone(seat, tableZone))).toBe(true);
  const restored = generateSeatingPlan({ ...room(), zones: [] }, DEFAULT_SEATING_RULES);
  expect(restored.seats).toEqual(open.seats);
});

test("WP17 freie Fläche ergänzt deterministisch und bewahrt manuell angepasste Blöcke", () => {
  const generated = generateSeatingPlan({ ...room(), zones: [tableZone] }, DEFAULT_SEATING_RULES);
  const protectedBlock = { ...generated.blocks[0], source: "generated" as const, edited: true };
  const protectedSeating: SeatingPlan = { ...generated, blocks: [protectedBlock], seats: protectedBlock.seats, totalSeats: protectedBlock.seats.length, totalRows: protectedBlock.rowCount, longestRow: Math.max(...protectedBlock.seatsPerRow) };
  const plan = { ...room(), seating: protectedSeating, zones: [] };
  const first = supplementSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal");
  const second = supplementSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal");
  expect(first).toEqual(second);
  expect(first.totalSeats).toBeGreaterThan(protectedSeating.totalSeats);
  expect(first.blocks[0]).toEqual(protectedBlock);
  expect(first.blocks.slice(1).every((block) => block.source === "generated" && block.edited === false)).toBe(true);
});

test("WP17 wiederholtes Ergänzen erzeugt keine Duplikate", () => {
  const base = generateSeatingPlan({ ...room(), zones: [tableZone] }, DEFAULT_SEATING_RULES);
  const plan = { ...room(), seating: base, zones: [] };
  const once = supplementSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal");
  const twice = supplementSeatingPlan({ ...plan, seating: once }, DEFAULT_SEATING_RULES, "horizontal");
  expect(twice).toBe(once);
  expect(new Set(once.seats.map((seat) => seat.id)).size).toBe(once.seats.length);
});

test("WP17 Neuplanungsfolgen unterscheiden manuelle, bearbeitete und ersetzbare Elemente", () => {
  const seating = generateSeatingPlan(room(), DEFAULT_SEATING_RULES);
  seating.blocks = seating.blocks.map((block, index) => ({ ...block, source: index === 0 ? "manual" : "generated", edited: index === 1 }));
  const plan: RoomPlan = { ...room(), seating, objects: [
    { id: "auto", type: "aisle", source: "generated", start: { x: 1, y: 4 }, end: { x: 9, y: 4 }, width: 1 },
    { id: "edited", type: "aisle", source: "generated", edited: true, start: { x: 5, y: 1 }, end: { x: 5, y: 7 }, width: 1 },
  ] };
  const impact = replanningImpact(plan);
  expect(impact.seatsRemoved).toBe(seating.totalSeats);
  expect(impact.manualBlocks).toBeGreaterThanOrEqual(1);
  expect(impact.editedGeneratedBlocks).toBeGreaterThanOrEqual(1);
  expect(impact.generatedAislesReplaced).toBe(1);
});

test("WP17 JSON hält Tischbereich und Bearbeitungsherkunft kompatibel", () => {
  const project = createProject("WP17", { ...room(), zones: [tableZone], tables: [{ id: "table-1", modelId: "table-310c-120x70", x: 2, y: 2, width: 1.2, depth: .7, rotation: 0, source: "auto", edited: true }] });
  const parsed = parseProject(JSON.stringify(project));
  expect(parsed.plan.zones).toEqual([tableZone]);
  expect(parsed.plan.tables?.[0].edited).toBe(true);
});

test("WP17 Oberfläche zeigt genau sechs Primärwerkzeuge und zeichnet einen Tischbereich", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const toolbar = editor.getByLabel("Werkzeuge", { exact: true });
  await expect(toolbar.getByRole("button")).toHaveCount(6);
  for (const label of ["Auswahl", "Raum / Kontur", "Tür", "Gang", "Bereich", "Sperr-/Hindernis"]) await expect(toolbar.getByRole("button", { name: label, exact: true })).toBeVisible();
  const canvas = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  for (const position of [{ x: 120, y: 90 }, { x: 570, y: 90 }, { x: 570, y: 390 }, { x: 120, y: 390 }]) await canvas.click({ position });
  await canvas.locator("[data-point-id]").first().click();
  await toolbar.getByRole("button", { name: "Bereich", exact: true }).click();
  await canvas.click({ position: { x: 260, y: 190 } });
  await canvas.click({ position: { x: 430, y: 310 } });
  await expect(canvas.locator("[data-zone-id]")).toHaveCount(1);
  await editor.getByRole("button", { name: "Auswahl", exact: true }).click();
  await canvas.locator("[data-zone-id]").click();
  await expect(editor.getByLabel("Eigenschaften").getByText("Tischbereich", { exact: true })).toBeVisible();
  await editor.getByRole("button", { name: "Tischbereich löschen" }).click();
  await expect(canvas.locator("[data-zone-id]")).toHaveCount(0);
});

function pointInTableZone(point: { x: number; y: number }, zone: PlanningZone) {
  const polygon = zonePolygon(zone);
  const [a, , c] = polygon;
  return point.x > Math.min(a.x, c.x) && point.x < Math.max(a.x, c.x) && point.y > Math.min(a.y, c.y) && point.y < Math.max(a.y, c.y);
}

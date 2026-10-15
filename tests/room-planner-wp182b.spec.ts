import { expect, test } from "@playwright/test";
import { emptyPlan, polygonsOverlap, type RoomPlan } from "../src/lib/room-planner/objects";
import { planTableZone } from "../src/lib/room-planner/tableZonePlanning";
import { polygonsInteriorOverlap, rotatedRectangle, tableEdges, tableFootprintDepth, tableModel, tablePolygon, type PlanningZone, type TableInstance } from "../src/lib/room-planner/tables";

const zone = (width: number, depth: number): PlanningZone => ({ id: "trapezoid-zone", type: "tables", geometry: { kind: "rectangle", x: 7, y: 6, width, depth }, rotation: 0, source: "manual" });
const plan = (width = 10, depth = 8): RoomPlan => ({
  ...emptyPlan(),
  contour: {
    closed: true,
    points: [{ id: "p1", x: 0, y: 0 }, { id: "p2", x: 14, y: 0 }, { id: "p3", x: 14, y: 12 }, { id: "p4", x: 0, y: 12 }],
    walls: [{ id: "w1", startPointId: "p1", endPointId: "p2" }, { id: "w2", startPointId: "p2", endPointId: "p3" }, { id: "w3", startPointId: "p3", endPointId: "p4" }, { id: "w4", startPointId: "p4", endPointId: "p1" }],
  },
  zones: [zone(width, depth)],
});

const sharedLength = (first: TableInstance, second: TableInstance) => {
  let result = 0;
  for (const a of tableEdges(first)) for (const b of tableEdges(second)) {
    const dx = a.end.x - a.start.x, dy = a.end.y - a.start.y, length = Math.hypot(dx, dy), ux = dx / length, uy = dy / length;
    const lineDistance = (point: { x: number; y: number }) => Math.abs((point.x - a.start.x) * uy - (point.y - a.start.y) * ux);
    if (lineDistance(b.start) > .002 || lineDistance(b.end) > .002) continue;
    const project = (point: { x: number; y: number }) => (point.x - a.start.x) * ux + (point.y - a.start.y) * uy;
    result = Math.max(result, Math.min(length, Math.max(project(b.start), project(b.end))) - Math.max(0, Math.min(project(b.start), project(b.end))));
  }
  return Math.max(0, result);
};

function expectCollisionFree(tables: TableInstance[]) {
  for (let first = 0; first < tables.length; first++) for (let second = first + 1; second < tables.length; second++) {
    expect(polygonsInteriorOverlap(tablePolygon(tables[first]), tablePolygon(tables[second]))).toBe(false);
  }
}

for (const [modelId, height] of [["table-310c-trapez-140x70", .605], ["table-310c-trapez-160x80", .693]] as const) {
  test(`WP18.2b ${modelId} verwendet die reale senkrechte Trapezhöhe`, () => {
    const model = tableModel(modelId);
    expect(tableFootprintDepth({ modelId, width: model.width, depth: model.depth })).toBeCloseTo(height, 2);
    const polygon = tablePolygon({ id: "geometry", modelId, x: 0, y: 0, rotation: 0, width: model.width, depth: model.depth, source: "manual" });
    expect(Math.max(...polygon.map((point) => point.y)) - Math.min(...polygon.map((point) => point.y))).toBeCloseTo(height, 2);
    expect(tableEdges({ id: "edges", modelId, x: 0, y: 0, rotation: 0, width: model.width, depth: model.depth, source: "manual" }).filter((edge) => edge.kind === "end").every((edge) => Math.abs(edge.length - model.depth) < .002)).toBe(true);
  });
}

test("WP18.2b zwei Trapeze bilden eine exakte Sechseckgruppe mit sechs Außenplätzen", () => {
  const result = planTableZone(plan(4, 3), { zoneId: zone(4, 3).id, modelId: "table-310c-trapez-140x70", mode: "trapezoid-groups", goal: "comfort", withChairs: true });
  expect(result.tables).toHaveLength(2);
  expect(result.chairs).toHaveLength(6);
  expect(sharedLength(result.tables[0], result.tables[1])).toBeCloseTo(1.4, 2);
  expectCollisionFree(result.tables);
  for (const chair of result.chairs) expect(result.tables.some((table) => polygonsOverlap(rotatedRectangle(chair), tablePolygon(table)))).toBe(false);
});

test("WP18.2b große Tischinsel bildet einen geschlossenen Sechserring ohne Innenbestuhlung", () => {
  const result = planTableZone(plan(6, 6), { zoneId: zone(6, 6).id, modelId: "table-310c-trapez-140x70", mode: "trapezoid-islands", goal: "balanced", withChairs: true });
  expect(result.tables).toHaveLength(6);
  expect(result.chairs).toHaveLength(12);
  expect(result.message).toContain("hexagonale Tischinsel");
  expectCollisionFree(result.tables);
  expect(result.tables.reduce((sum, table, index) => sum + result.tables.slice(index + 1).filter((other) => sharedLength(table, other) > .5).length, 0)).toBe(6);
  const center = { x: 7, y: 6 };
  expect(result.chairs.every((chair) => Math.hypot(chair.x - center.x, chair.y - center.y) > Math.hypot(result.tables[0].x - center.x, result.tables[0].y - center.y))).toBe(true);
});

test("WP18.2b kompakte polygonale Insel kann die geometrisch mögliche Dreierform wählen", () => {
  const result = planTableZone(plan(2.6, 2.6), { zoneId: zone(2.6, 2.6).id, modelId: "table-310c-trapez-140x70", mode: "trapezoid-islands", goal: "comfort", withChairs: false });
  expect(result.tables).toHaveLength(3);
  expect(result.message).toContain("dreieckige Kombination");
  expectCollisionFree(result.tables);
  expect(result.tables.reduce((sum, table, index) => sum + result.tables.slice(index + 1).filter((other) => sharedLength(table, other) > .5).length, 0)).toBe(3);
});

test("WP18.2b längliche Anordnung kombiniert nur maßkompatible Rechteck- und Trapeztische", () => {
  const result = planTableZone(plan(5, 5), { zoneId: zone(5, 5).id, modelId: "table-310c-trapez-160x80", mode: "trapezoid-long", goal: "balanced", withChairs: true });
  expect(result.tables).toHaveLength(4);
  expect(result.tables.filter((table) => tableModel(table.modelId).shape === "trapezoid")).toHaveLength(2);
  expect(result.tables.filter((table) => table.modelId === "table-310c-160x80")).toHaveLength(2);
  expectCollisionFree(result.tables);
  expect(result.chairs.length).toBeGreaterThanOrEqual(8);
});

test("WP18.2b Kapazitätsziel erzeugt mehrere getrennte Sechseckgruppen in begrenzter Laufzeit", () => {
  const result = planTableZone(plan(10, 8), { zoneId: zone(10, 8).id, modelId: "table-310c-trapez-160x80", mode: "trapezoid-groups", goal: "capacity", withChairs: true });
  expect(result.tables.length).toBeGreaterThanOrEqual(4);
  expect(result.tables.length % 2).toBe(0);
  expect(result.durationMs).toBeLessThan(1000);
  expectCollisionFree(result.tables);
  expect(result.usableSeats).toBe(result.chairs.length);
});

test("WP18.2b Automatik vergleicht eine kleine, begrenzte Mustermenge", () => {
  const result = planTableZone(plan(7, 7), { zoneId: zone(7, 7).id, modelId: "table-310c-trapez-140x70", mode: "trapezoid-auto", goal: "balanced", withChairs: true });
  expect(result.tables.length).toBeGreaterThan(0);
  expect(result.evaluatedVariants).toBeGreaterThanOrEqual(4);
  expect(result.evaluatedVariants).toBeLessThan(30);
  expectCollisionFree(result.tables);
});

import { expect, test } from "@playwright/test";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";
import { emptyPlan, type RoomPlan } from "../src/lib/room-planner/objects";
import { createProject, parseProject } from "../src/lib/room-planner/projects";
import { findTableSnap, placeTable, polygonsInteriorOverlap, seatTable, tableEdges, tableModel, tablePolygon, type TableInstance } from "../src/lib/room-planner/tables";

const room = (width = 12, depth = 10): RoomPlan => ({
  ...emptyPlan(),
  contour: {
    closed: true,
    points: [{ id: "p1", x: 0, y: 0 }, { id: "p2", x: width, y: 0 }, { id: "p3", x: width, y: depth }, { id: "p4", x: 0, y: depth }],
    walls: [{ id: "w1", startPointId: "p1", endPointId: "p2" }, { id: "w2", startPointId: "p2", endPointId: "p3" }, { id: "w3", startPointId: "p3", endPointId: "p4" }, { id: "w4", startPointId: "p4", endPointId: "p1" }],
  },
});

const rectangle = (id: string, x: number, y: number, rotation = 0): TableInstance => ({ id, modelId: "table-310c-120x70", x, y, rotation, width: 1.2, depth: .7, source: "manual" });
const trapezoid = (rotation = 0): TableInstance => ({ id: `trap-${rotation}`, modelId: "table-310c-trapez-160x80", x: 6, y: 5, rotation, width: 1.6, depth: .8, source: "manual" });

test("WP18.1 Trapezdefinition hat lange Drei-Stuhl-Seite und kurze Gegenseite", () => {
  const table = trapezoid();
  const edges = tableEdges(table);
  expect(edges[0]).toMatchObject({ kind: "long" });
  expect(edges[0].length).toBeCloseTo(1.6);
  expect(edges[2]).toMatchObject({ kind: "short" });
  expect(edges[2].length).toBeCloseTo(.8);
  expect(tableModel(table.modelId).modelRotationOffset).toBe(0);
  expect(tablePolygon(table)).toHaveLength(4);
});

for (const rotation of [0, 90, 180, 270]) {
  test(`WP18.1 Trapezbestuhlung bleibt bei ${rotation}° an der langen Seite`, () => {
    const table = trapezoid(rotation);
    const result = seatTable({ ...room(), tables: [table] }, table.id, 4);
    expect(result.chairs).toHaveLength(4);
    const angle = -rotation * Math.PI / 180;
    const local = result.chairs.map((chair) => ({
      x: (chair.x - table.x) * Math.cos(angle) - (chair.y - table.y) * Math.sin(angle),
      y: (chair.x - table.x) * Math.sin(angle) + (chair.y - table.y) * Math.cos(angle),
    }));
    expect(local.filter((chair) => chair.y < -table.depth / 2)).toHaveLength(3);
  });
}

test("WP18.1 Trapezkapazität behandelt 4, 6 und 8 Plätze deterministisch", () => {
  const table = trapezoid();
  for (const [requested, placed] of [[4, 4], [6, 6], [8, 8]] as const) {
    const result = seatTable({ ...room(), tables: [table] }, table.id, requested);
    expect(result.placed).toBe(placed);
    expect(result.maximum).toBe(8);
  }
});

test("WP18.1 gespeicherte Trapeztische bleiben ohne Schemaänderung kompatibel", () => {
  const table = trapezoid(270);
  const loaded = parseProject(JSON.stringify(createProject("Trapez", { ...room(), tables: [table] }))).plan.tables![0];
  expect(loaded).toMatchObject({ modelId: table.modelId, width: 1.6, depth: .8, rotation: 270 });
  expect(tableEdges(loaded)[0].kind).toBe("long");
});

test("WP18.1 Rechtecktisch snappt nur innerhalb der zoomunabhängigen Schwelle", () => {
  const target = rectangle("target", 3, 5);
  const moving = rectangle("moving", 4.31, 5);
  const plan = { ...room(), tables: [target, moving] };
  const snap = findTableSnap(plan, moving.id, moving);
  expect(snap?.valid).toBe(true);
  expect(snap?.table.x).toBeCloseTo(4.2);
  expect(polygonsInteriorOverlap(tablePolygon(target), tablePolygon(snap!.table))).toBe(false);
  expect(findTableSnap(plan, moving.id, { ...moving, x: 4.43 })).toBeNull();
});

test("WP18.1 Alt-Verhalten kann Snapping auslassen", () => {
  const target = rectangle("target", 3, 5), moving = rectangle("moving", 4.31, 5);
  const plan = { ...room(), tables: [target, moving] };
  const withoutModifier = findTableSnap(plan, moving.id, moving);
  const withAltModifier = findTableSnap(plan, moving.id, moving, .22, true);
  expect(withoutModifier).not.toBeNull();
  expect(withAltModifier).toBeNull();
});

test("WP18.1 Snapping meldet Raum, Hindernis und Gang als Konflikt", () => {
  const target = rectangle("target", 3, 5), moving = rectangle("moving", 4.31, 5);
  const obstaclePlan: RoomPlan = { ...room(), tables: [target, moving], objects: [{ id: "column", type: "obstacle", obstacleType: "column", x: 4.2, y: 5, width: .4, depth: .4, rotation: 0 }] };
  expect(findTableSnap(obstaclePlan, moving.id, moving)).toMatchObject({ valid: false, conflict: "obstacle" });
  const aislePlan: RoomPlan = { ...room(), tables: [target, moving], objects: [{ id: "aisle", type: "aisle", start: { x: 4.2, y: 4 }, end: { x: 4.2, y: 6 }, width: .4 }] };
  expect(findTableSnap(aislePlan, moving.id, moving)).toMatchObject({ valid: false, conflict: "aisle" });
  const edgeTarget = rectangle("edge", 11.35, 5), edgeMoving = rectangle("edge-moving", 12.45, 5);
  expect(findTableSnap({ ...room(), tables: [edgeTarget, edgeMoving] }, edgeMoving.id, edgeMoving)).toMatchObject({ valid: false, conflict: "room" });
});

test("WP18.1 mehrere Tische bilden nacheinander eine Reihe und Undo/Redo bleibt atomar", () => {
  const first = rectangle("first", 3, 5), second = rectangle("second", 4.31, 5), third = rectangle("third", 5.52, 5);
  let plan: RoomPlan = { ...room(), tables: [first, second] };
  const secondSnap = findTableSnap(plan, second.id, second)!;
  plan = placeTable(plan, second.id, secondSnap.table);
  plan = { ...plan, tables: [...plan.tables!, third] };
  const thirdSnap = findTableSnap(plan, third.id, third)!;
  const snapped = placeTable(plan, third.id, thirdSnap.table);
  expect(snapped.tables!.map((table) => table.x)).toEqual([3, 4.2, 5.4]);
  const history = commit(createHistory(plan), snapped);
  expect(undo(history).present.tables![2].x).toBe(5.52);
  expect(redo(undo(history)).present.tables![2].x).toBe(5.4);
});

test("WP18.1 Trapeztische docken mit logisch gleichen langen Seiten an", () => {
  const target = trapezoid(0), moving = { ...trapezoid(0), id: "moving", y: 4.1 };
  const snap = findTableSnap({ ...room(), tables: [target, moving] }, moving.id, moving);
  expect(snap).toMatchObject({ valid: true });
  expect(snap!.targetEdge.kind).toBe("long");
  expect(snap!.movingEdge.kind).toBe("long");
  expect(polygonsInteriorOverlap(tablePolygon(target), tablePolygon(snap!.table))).toBe(false);
});

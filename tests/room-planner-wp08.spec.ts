import { expect, test } from "@playwright/test";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";
import { aislePolygon, obstaclePolygon, polygonInsideRoom, polygonsOverlap, type RoomPlan } from "../src/lib/room-planner/objects";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { DEFAULT_SEATING_RULES, generateSeatingPlan, seatPolygon } from "../src/lib/room-planner/seating";
import { generatePlanVariants } from "../src/lib/room-planner/variants";

function room(points: [number, number][] = [[0, 0], [12, 0], [12, 10], [0, 10]]): RoomPlan {
  const vertices = points.map(([x, y], index) => ({ id: `p${index}`, x, y }));
  return { contour: { closed: true, points: vertices, walls: vertices.map((point, index) => ({ id: `w${index}`, startPointId: point.id, endPointId: vertices[(index + 1) % vertices.length].id })) }, objects: [] };
}
const vertical = { id: "vertical", type: "aisle" as const, start: { x: 6, y: 0.7 }, end: { x: 6, y: 9.3 }, width: 1.2 };
const horizontal = { id: "horizontal", type: "aisle" as const, start: { x: 0.7, y: 5 }, end: { x: 11.3, y: 5 }, width: 1.2 };

test("freier Raum bildet einen Block; Mittelgang zwei und Kreuzgang vier Bereiche", () => {
  expect(generateSeatingPlan(room([[0, 0], [6, 0], [6, 8], [0, 8]])).blocks.length).toBe(1);
  const plan = room();
  plan.objects.push(vertical);
  const two = generateSeatingPlan(plan);
  expect(two.blocks.length).toBeGreaterThanOrEqual(2);
  expect(two.blocks.some((block) => block.seats.every((seat) => seat.x < 6))).toBe(true);
  expect(two.blocks.some((block) => block.seats.every((seat) => seat.x > 6))).toBe(true);
  plan.objects.push(horizontal);
  const four = generateSeatingPlan(plan);
  for (const [x, y] of [[3, 2], [9, 2], [3, 8], [9, 8]]) expect(four.blocks.some((block) => block.seats.some((seat) => Math.abs(seat.x - x) < 2 && Math.abs(seat.y - y) < 2))).toBe(true);
  for (const seat of four.seats) for (const aisle of [vertical, horizontal]) expect(polygonsOverlap(seatPolygon(seat.x, seat.y, four.rules, four.orientation, seat.rotation), aislePolygon(aisle))).toBe(false);
  expect(generateSeatingPlan(plan)).toEqual(four);
});

test("L-Raum und Sperrflächen bleiben kollisionsfrei", () => {
  const l = room([[0, 0], [12, 0], [12, 5], [5, 5], [5, 10], [0, 10]]);
  const seating = generateSeatingPlan(l);
  expect(seating.totalSeats).toBeGreaterThan(0);
  expect(seating.blocks.length).toBeGreaterThanOrEqual(2);
  for (const seat of seating.seats) expect(polygonInsideRoom(seatPolygon(seat.x, seat.y, seating.rules, seating.orientation, seat.rotation), l.contour)).toBe(true);
  const plan = room();
  plan.objects.push({ id: "obstacle", type: "obstacle", obstacleType: "column", x: 6, y: 5, width: 1.5, depth: 1.5, rotation: 15 },
    { id: "stage", type: "stage", x: 6, y: 1.5, width: 4, depth: 1, rotation: 0 },
    { id: "reserved", type: "reservedArea", x: 9, y: 7, width: 1.5, depth: 1.5, rotation: 0 });
  const result = generateSeatingPlan(plan);
  expect(result.blocks.length).toBeGreaterThanOrEqual(2);
  for (const seat of result.seats) for (const object of plan.objects) if (object.type !== "aisle" && object.type !== "front" && object.type !== "door") {
    expect(polygonsOverlap(seatPolygon(seat.x, seat.y, result.rules, result.orientation, seat.rotation), obstaclePolygon(object))).toBe(false);
  }
});

test("gedrehte Gesamtvariante behält gemeinsame Front, Regeln und Kandidatenlimit", () => {
  const plan = room();
  plan.objects.push(vertical, { id: "front", type: "front", x: 6, y: 0.4, width: 3, rotation: 12 });
  const first = generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE);
  expect(first).toEqual(generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE));
  expect(first.evaluatedCandidates).toBeLessThanOrEqual(48);
  const selected = first.variants[0] ?? first.fallback;
  expect(selected).toBeDefined();
  expect(selected!.seatingPlan.blocks.length).toBeGreaterThanOrEqual(2);
  expect(selected!.seatingPlan.blocks.every((block) => block.rotation === selected!.seatingPlan.rotation)).toBe(true);
  expect(selected!.analysis.routes.length).toBe(selected!.seatingPlan.totalSeats);
  expect(selected!.report.checks.length).toBeGreaterThan(0);
  const adopted = { plan: selected!.plan, seating: selected!.seatingPlan };
  const history = commit(createHistory({ plan, seating: generateSeatingPlan(plan) }), adopted);
  expect(undo(history).present.plan).toBe(plan);
  expect(redo(undo(history)).present.seating.blocks).toEqual(selected!.seatingPlan.blocks);
});

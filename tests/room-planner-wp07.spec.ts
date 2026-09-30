import { expect, test } from "@playwright/test";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";
import { aislePolygon, obstaclePolygon, polygonInsideRoom, polygonsOverlap, type RoomPlan } from "../src/lib/room-planner/objects";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { DEFAULT_SEATING_RULES, generateSeatingPlan, rotatePoint, seatPolygon } from "../src/lib/room-planner/seating";
import { generatePlanVariants } from "../src/lib/room-planner/variants";

function room(): RoomPlan {
  return { contour: { closed: true, points: [{ id: "a", x: 0, y: 0 }, { id: "b", x: 12, y: 0 }, { id: "c", x: 12, y: 10 }, { id: "d", x: 0, y: 10 }], walls: [
    { id: "top", startPointId: "a", endPointId: "b" }, { id: "right", startPointId: "b", endPointId: "c" },
    { id: "bottom", startPointId: "c", endPointId: "d" }, { id: "left", startPointId: "d", endPointId: "a" },
  ] }, objects: [] };
}

test("0° bleibt kompatibel; 30° transformiert das lokale Raster und Stuhlpolygone", () => {
  const plan = room(), offset = { along: 0, cross: 0 };
  const old = generateSeatingPlan(plan), zero = generateSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal", offset, 0);
  expect(zero.seats).toEqual(old.seats);
  const rotated = generateSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal", offset, 30);
  expect(rotated.totalSeats).toBeGreaterThan(0);
  expect(rotated.blocks.every((block) => block.rotation === 30 && block.rowPitch === DEFAULT_SEATING_RULES.rowPitch)).toBe(true);
  const first = rotated.seats[0];
  expect(first.rotation).toBe(30);
  const local = rotatePoint({ x: first.x - 6, y: first.y - 5 }, { x: 0, y: 0 }, -30);
  expect(rotatePoint(local, { x: 6, y: 5 }, 30).x).toBeCloseTo(first.x);
  expect(rotatePoint(local, { x: 6, y: 5 }, 30).y).toBeCloseTo(first.y);
  for (const seat of rotated.seats) expect(polygonInsideRoom(seatPolygon(seat.x, seat.y, rotated.rules, rotated.orientation, seat.rotation), plan.contour)).toBe(true);
  for (const angle of [15, 45, 73, 90]) {
    const seating = generateSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal", offset, angle);
    expect(seating.totalSeats).toBeGreaterThan(0);
    expect(seating.seats.every((seat) => seat.rotation === angle)).toBe(true);
  }
});

test("gedrehte Sitze meiden Bühne, Reservierung, Hindernis und manuellen Gang", () => {
  const plan = room();
  plan.objects = [
    { id: "stage", type: "stage", x: 4, y: 3, width: 2, depth: 1, rotation: 20 },
    { id: "reserved", type: "reservedArea", x: 8, y: 6, width: 2, depth: 2, rotation: 15 },
    { id: "column", type: "obstacle", obstacleType: "column", x: 3, y: 7, width: 1, depth: 1, rotation: 0 },
    { id: "aisle", type: "aisle", start: { x: 1, y: 1 }, end: { x: 1, y: 9 }, width: 1.2 },
  ];
  const seating = generateSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal", { along: 0, cross: 0 }, 30);
  expect(seating.totalSeats).toBeGreaterThan(0);
  for (const seat of seating.seats) {
    const polygon = seatPolygon(seat.x, seat.y, seating.rules, seating.orientation, seat.rotation);
    expect(polygonInsideRoom(polygon, plan.contour)).toBe(true);
    for (const object of plan.objects) if (object.type === "stage" || object.type === "reservedArea" || object.type === "obstacle") {
      expect(polygonsOverlap(polygon, obstaclePolygon(object))).toBe(false);
    }
    for (const object of plan.objects) if (object.type === "aisle") expect(polygonsOverlap(polygon, aislePolygon(object))).toBe(false);
  }
});

test("Frontwinkel bestimmt Kandidaten, alle durchlaufen Regeln und bleiben im Budget", () => {
  const plan = room();
  plan.objects.push({ id: "front", type: "front", x: 6, y: 0.4, width: 3, rotation: 30 });
  const first = generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE);
  expect(first).toEqual(generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE));
  expect(first.evaluatedCandidates).toBeGreaterThan(0);
  expect(first.evaluatedCandidates).toBeLessThanOrEqual(48);
  const chosen = first.variants[0] ?? first.fallback;
  expect(chosen).toBeDefined();
  expect(chosen!.seatingPlan.rotation).toBe(30);
  expect(chosen!.metrics.frontDeviation).toBe(0);
  expect(chosen!.report.checks.length).toBeGreaterThan(0);
  expect(chosen!.analysis.routes.length).toBe(chosen!.seatingPlan.totalSeats);
  const adopted = { ...chosen!.plan, objects: [...chosen!.plan.objects] };
  const history = commit(createHistory(plan), adopted);
  expect(adopted.objects[0]).toEqual(plan.objects[0]);
  expect(undo(history).present).toBe(plan);
  expect(redo(undo(history)).present).toBe(adopted);
  expect(chosen!.seatingPlan.blocks[0].rotation).toBe(30);
});

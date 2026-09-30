import { expect, test } from "@playwright/test";
import { generateAisleGroups, nearDuplicateAisle } from "../src/lib/room-planner/aisleGeneration";
import { analyzeEgress, buildEgressGraph } from "../src/lib/room-planner/egress/analyzeEgress";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";
import { aislePolygon, obstaclePolygon, polygonsOverlap, type AisleObject, type RoomPlan } from "../src/lib/room-planner/objects";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { generateSeatingPlan, seatPolygon } from "../src/lib/room-planner/seating";
import { generatePlanVariants } from "../src/lib/room-planner/variants";

function room(width = 16, length = 12): RoomPlan {
  const points = [[0, 0], [width, 0], [width, length], [0, length]].map(([x, y], i) => ({ id: `p${i}`, x, y }));
  return { contour: { closed: true, points, walls: points.map((p, i) => ({ id: `w${i}`, startPointId: p.id, endPointId: points[(i + 1) % 4].id })) }, objects: [] };
}
const aisle = (id: string, x: number, y1 = 0.7, y2 = 11.3): AisleObject => ({ id, type: "aisle", start: { x, y: y1 }, end: { x, y: y2 }, width: 1.2 });

test("breiter Raum liefert deterministischen Mittelgang und trennt Sitzblöcke kollisionsfrei", () => {
  const plan = room();
  const seating = generateSeatingPlan(plan);
  const first = generateAisleGroups(plan, seating, 1.2, 3);
  expect(first).toEqual(generateAisleGroups(plan, seating, 1.2, 3));
  const center = first.find((group) => group.length === 1 && group[0].id === "variant-center")![0];
  expect(center.source).toBe("generated");
  expect(center.start.x).toBeCloseTo(widthMid(plan), 0);
  const nextPlan = { ...plan, objects: [...plan.objects, center] };
  const nextSeating = generateSeatingPlan(nextPlan);
  expect(nextSeating.blocks.length).toBeGreaterThanOrEqual(2);
  for (const seat of nextSeating.seats) expect(polygonsOverlap(seatPolygon(seat.x, seat.y, nextSeating.rules, nextSeating.orientation, seat.rotation), aislePolygon(center))).toBe(false);
});
function widthMid(plan: RoomPlan) { return (plan.contour.points[0].x + plan.contour.points[1].x) / 2; }

test("manueller Gang bleibt bestehen und wird nicht dupliziert; Altplan ohne source bleibt gültig", () => {
  const plan = room();
  const manual = aisle("manual", 8);
  plan.objects.push(manual);
  const groups = generateAisleGroups(plan, generateSeatingPlan(plan), 1.2, 3);
  expect(groups.flat().every((candidate) => !nearDuplicateAisle(candidate, manual))).toBe(true);
  expect(manual.source).toBeUndefined();
  expect(generateSeatingPlan(plan).totalSeats).toBeGreaterThan(0);
});

test("gedrehte Kandidaten folgen der Bestuhlung und meiden Bühne und Sperrfläche", () => {
  const plan = room(18, 15);
  plan.objects.push({ id: "stage", type: "stage", x: 9, y: 1.4, width: 3, depth: 1, rotation: 0 },
    { id: "reserved", type: "reservedArea", x: 15, y: 11, width: 1.5, depth: 1.5, rotation: 0 });
  const seating = generateSeatingPlan(plan, undefined, "horizontal", { along: 0, cross: 0 }, 17);
  const groups = generateAisleGroups(plan, seating, 1.2, 3);
  expect(groups.length).toBeGreaterThan(0);
  expect(groups.flat().some((a) => Math.abs(Math.atan2(a.end.y - a.start.y, a.end.x - a.start.x) * 180 / Math.PI - 107) < 1)).toBe(true);
  for (const a of groups.flat()) for (const object of plan.objects) if (object.type === "stage" || object.type === "reservedArea")
    expect(polygonsOverlap(aislePolygon(a), obstaclePolygon(object))).toBe(false);
});

test("manuelle und generierte Gänge bilden gemeinsam einen Weg zum Ausgang", () => {
  const plan = room(12, 10);
  const manual = aisle("manual", 6, 0.7, 5);
  const generated: AisleObject = { id: "generated", type: "aisle", source: "generated", start: { x: 6, y: 4.9 }, end: { x: 6, y: 9.3 }, width: 1.2 };
  plan.objects.push(manual, generated, { id: "exit", type: "door", wallId: "w0", offset: 5.5, width: 1, role: "exit", clearWidth: 1 });
  const seating = generateSeatingPlan(plan);
  const analysis = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE);
  expect(buildEgressGraph(plan, seating).edges.some((e) => !e.aisleId)).toBe(true);
  expect(analysis.routes.some((route) => route.valid && route.aisleId === "generated" && route.exitDoorId === "exit")).toBe(true);
});

test("ohne Anbindung bleibt der Block unerreichbar; zwei Ausgänge werden modelliert", () => {
  const plan = room(12, 10);
  plan.objects.push(aisle("center", 6, 0.7, 9.3));
  const seating = generateSeatingPlan(plan);
  expect(analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE).seatsWithoutRoute).toBe(seating.totalSeats);
  plan.objects.push({ id: "exit-1", type: "door", wallId: "w0", offset: 5.5, width: 1, role: "exit", clearWidth: 1 },
    { id: "exit-2", type: "door", wallId: "w2", offset: 5.5, width: 1, role: "emergency_exit", clearWidth: 1 });
  const connected = analyzeEgress(plan, generateSeatingPlan(plan), BAVSTAETTV_REFERENCE);
  expect(connected.exitLoads).toHaveLength(2);
  expect(connected.seatsWithoutRoute).toBeLessThan(seating.totalSeats);
});

test("Variantenlimit, Übernahme sowie Undo und Redo umfassen generierte Gänge", () => {
  const plan = room(12, 10);
  plan.objects.push({ id: "exit", type: "door", wallId: "w0", offset: 5.5, width: 1, role: "exit", clearWidth: 1 });
  const result = generatePlanVariants(plan, undefined, BAVSTAETTV_REFERENCE);
  expect(result.evaluatedCandidates).toBeLessThanOrEqual(48);
  const withAisle = result.variants.find((v) => v.generatedAisles.length) ?? result.fallback;
  expect(withAisle).toBeDefined();
  expect(withAisle!.generatedAisles.length).toBeGreaterThan(0);
  expect(withAisle!.plan.objects).toContainEqual(withAisle!.generatedAisles[0]);
  const history = commit(createHistory(plan), withAisle!.plan);
  expect(undo(history).present).toBe(plan);
  expect(redo(undo(history)).present).toBe(withAisle!.plan);
});

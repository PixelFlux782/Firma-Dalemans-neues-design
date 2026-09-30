import { expect, test } from "@playwright/test";
import { appendPoint, closeRoom, emptyRoom } from "../src/lib/room-planner/geometry";
import { aislePolygon, obstaclePolygon, polygonsOverlap, type RoomPlan } from "../src/lib/room-planner/objects";
import { DEFAULT_SEATING_RULES, generateSeatingPlan, seatFits, seatPolygon } from "../src/lib/room-planner/seating";

const room = (coordinates: [number, number][]) => closeRoom(coordinates.reduce((shape, [x, y], index) => appendPoint(shape, { id: `p${index}`, x, y }), emptyRoom()));
const rectangle = room([[0, 0], [12, 0], [12, 8], [0, 8]]);
const base: RoomPlan = { contour: rectangle, objects: [] };
const rules = { ...DEFAULT_SEATING_RULES, maximumChairsPerRow: 12 };

test("empty rectangle creates reproducible rows, bounded blocks and seats", () => {
  const first = generateSeatingPlan(base, rules);
  expect(first.totalSeats).toBeGreaterThan(50);
  expect(first.totalRows).toBeGreaterThan(1);
  expect(first.blocks.length).toBeGreaterThan(1);
  expect(first.longestRow).toBeLessThanOrEqual(12);
  expect(first.hints.some((hint) => hint.includes("Gang wird empfohlen"))).toBe(true);
  expect(generateSeatingPlan(base, rules)).toEqual(first);
  expect(first.seats.every((seat) => seatFits(base, rules, "horizontal", seat.x, seat.y))).toBe(true);
});

test("concave polygon keeps every chair fully inside", () => {
  const plan = { contour: room([[0, 0], [10, 0], [10, 3], [4, 3], [4, 8], [0, 8]]), objects: [] };
  const result = generateSeatingPlan(plan, rules);
  expect(result.totalSeats).toBeGreaterThan(0);
  expect(result.seats.every((seat) => seatFits(plan, rules, "horizontal", seat.x, seat.y))).toBe(true);
  expect(result.seats.some((seat) => seat.x > 4 && seat.y > 3)).toBe(false);
});

test("obstacle and aisle exclude seats and split row blocks", () => {
  const obstacle = { id: "o", type: "obstacle" as const, obstacleType: "column" as const, x: 6, y: 4, width: 1.5, depth: 1.5, rotation: 30 };
  const aisle = { id: "a", type: "aisle" as const, start: { x: 6, y: 0.8 }, end: { x: 6, y: 7.2 }, width: 1.2 };
  const plan: RoomPlan = { ...base, objects: [obstacle, aisle] };
  const result = generateSeatingPlan(plan, rules);
  expect(result.totalSeats).toBeLessThan(generateSeatingPlan(base, rules).totalSeats);
  expect(result.blocks.length).toBeGreaterThanOrEqual(2);
  expect(result.hints.some((hint) => hint.includes("Gang unterbricht"))).toBe(true);
  expect(result.seats.every((seat) => {
    const polygon = seatPolygon(seat.x, seat.y, rules, "horizontal");
    return !polygonsOverlap(polygon, obstaclePolygon(obstacle)) && !polygonsOverlap(polygon, aislePolygon(aisle));
  })).toBe(true);
});

test("door clearance and vertical orientation are respected", () => {
  const plan: RoomPlan = { ...base, objects: [{ id: "d", type: "door", wallId: rectangle.walls[0].id, offset: 5, width: 2 }] };
  const result = generateSeatingPlan(plan, rules, "vertical");
  expect(result.totalSeats).toBeGreaterThan(0);
  expect(result.totalSeats).toBeLessThan(generateSeatingPlan(base, rules, "vertical").totalSeats);
  expect(result.seats.every((seat) => seat.rotation === 90 && seatFits(plan, rules, "vertical", seat.x, seat.y))).toBe(true);
  expect(result.hints.some((hint) => hint.includes("Türbereiche"))).toBe(true);
});

test("small or invalid rooms never produce partial seats", () => {
  const tiny: RoomPlan = { contour: room([[0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]]), objects: [] };
  expect(generateSeatingPlan(tiny, rules).totalSeats).toBe(0);
  expect(generateSeatingPlan(tiny, rules).hints.some((hint) => hint.includes("Keine gültige Bestuhlung"))).toBe(true);
  expect(generateSeatingPlan({ ...base, contour: emptyRoom() }, rules).totalSeats).toBe(0);
});

test("larger rooms can hold more than the former 300-chair limit", () => {
  const plan: RoomPlan = { contour: room([[0, 0], [24, 0], [24, 16], [0, 16]]), objects: [] };
  const result = generateSeatingPlan(plan, rules);
  expect(result.totalSeats).toBeGreaterThan(500);
  expect(result.totalSeats).toBeLessThanOrEqual(rules.maximumSeats);
  expect(result.blocks.every((block) => block.seatsPerRow.every((count) => count <= rules.maximumChairsPerRow))).toBe(true);
});

test("2D editor calculates and invalidates a seating result when rules change", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const surface = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await surface.scrollIntoViewIfNeeded();
  const box = (await surface.boundingBox())!;
  const click = async (x: number, y: number) => page.mouse.click(box.x + box.width / 2 + x * 45, box.y + box.height / 2 + y * 45);
  await click(-4, -3); await click(6, -3); await click(6, 5); await click(-4, 5); await click(-4, -3);
  await page.getByRole("button", { name: "Bestuhlung berechnen" }).click();
  await expect(page.getByText(/Sitzplätze · .* Sitzblöcke/)).toBeVisible();
  await expect(surface.getByLabel("Berechnete Sitzplätze").locator("path").first()).toBeVisible();
  await page.getByLabel("Max. Stühle pro Reihe").fill("8");
  await expect(page.getByText(/Sitzplätze · .* Sitzblöcke/)).toBeHidden();
  await page.getByRole("button", { name: "Bestuhlung berechnen" }).click();
  await expect(page.getByText(/Sitzplätze · .* Sitzblöcke/)).toBeVisible();
});

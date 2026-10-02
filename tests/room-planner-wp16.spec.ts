import { expect, test } from "@playwright/test";
import { calculateRecommendedDemand, changeChairSelection, chairProducts, DEFAULT_CHAIR_SELECTION, resolveChairShopTarget } from "../src/lib/room-planner/chairSelection";
import { createProject, defaultPlannerSettings, parseProject } from "../src/lib/room-planner/projects";
import { DEFAULT_SEATING_RULES } from "../src/lib/room-planner/seating";
import type { RoomPlan } from "../src/lib/room-planner/objects";

function plan(): RoomPlan {
  const seats = Array.from({ length: 21 }, (_, index) => ({ id: `seat-${index}`, x: index, y: 1, row: 0, index, rotation: 0 }));
  return { contour: { points: [], walls: [], closed: false }, objects: [], seating: { blocks: [{ id: "block-1", seats, rowCount: 1, seatsPerRow: [21] }], seats, totalSeats: 21, totalRows: 1, longestRow: 21, hints: [], orientation: "horizontal", rules: { ...DEFAULT_SEATING_RULES } } };
}

test("WP16 reserve follows the actual seats without changing the plan", () => {
  const current = plan();
  const before = JSON.stringify(current);
  expect(calculateRecommendedDemand(current, 5)).toEqual({ quantity: 21, reservePercent: 5, reserveQuantity: 2, recommendedQuantity: 23 });
  expect(JSON.stringify(current)).toBe(before);
  current.seating!.blocks[0].seats.pop();
  expect(calculateRecommendedDemand(current, 5)).toMatchObject({ quantity: 20, reserveQuantity: 1, recommendedQuantity: 21 });
  expect(calculateRecommendedDemand(current, 0).recommendedQuantity).toBe(20);
});

test("WP16 reserve persists and old projects use the default", () => {
  const current = plan();
  const points = [[0, 0], [30, 0], [30, 10], [0, 10]].map(([x, y], index) => ({ id: `point-${index}`, x, y }));
  current.contour = { closed: true, points, walls: points.map((point, index) => ({ id: `wall-${index}`, startPointId: point.id, endPointId: points[(index + 1) % points.length].id })) };
  const project = createProject("Angebot", current, { ...defaultPlannerSettings(), reservePercent: 10 });
  expect(parseProject(JSON.stringify(project)).settings.reservePercent).toBe(10);
  const oldProject = JSON.parse(JSON.stringify(project));
  delete oldProject.settings.reservePercent;
  expect(parseProject(JSON.stringify(oldProject)).settings.reservePercent).toBe(5);
});

test("WP16 shop target keeps the selected product and variant with recommended quantity", () => {
  const product = chairProducts[1];
  const variant = product.variants[2];
  const selected = changeChairSelection(plan(), { ...DEFAULT_CHAIR_SELECTION, productId: product.id, variantId: variant.id });
  const target = resolveChairShopTarget(selected, calculateRecommendedDemand(selected, 5).recommendedQuantity)!;
  expect(target.href).toContain(`/produkte/stapelstuehle/${product.handle}?`);
  expect(target.href).toContain("menge=23");
  expect(target.canAddToCart).toBe(false);
});

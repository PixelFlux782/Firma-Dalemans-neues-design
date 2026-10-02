import { expect, test } from "@playwright/test";
import { calculatePlanDemand, changeChairSelection, chairProducts, DEFAULT_CHAIR_SELECTION, resolveChairShopTarget } from "../src/lib/room-planner/chairSelection";
import { createProject, parseProject } from "../src/lib/room-planner/projects";
import { DEFAULT_SEATING_RULES } from "../src/lib/room-planner/seating";
import type { RoomPlan } from "../src/lib/room-planner/objects";

function plan(): RoomPlan {
  const seats = [0, 1, 2].map((index) => ({ id: `seat-${index}`, x: index, y: 1, row: 0, index, rotation: 0 }));
  return { contour: { points: [], walls: [], closed: false }, objects: [], seating: { blocks: [{ id: "block-1", seats, rowCount: 1, seatsPerRow: [3] }], seats, totalSeats: 3, totalRows: 1, longestRow: 3, hints: [], orientation: "horizontal", rules: { ...DEFAULT_SEATING_RULES } } };
}

test("WP15 demand, selection, shop mapping and project roundtrip", () => {
  const current = plan();
  const product = chairProducts[1];
  const variant = product.variants[2];
  expect(calculatePlanDemand(current).quantity).toBe(3);
  current.seating!.blocks[0].seats.pop();
  expect(calculatePlanDemand(current).quantity).toBe(2);
  current.seating!.blocks[0].seats.push({ id: "new", x: 4, y: 1, row: 0, index: 3, rotation: 0 });
  expect(calculatePlanDemand(current).quantity).toBe(3);
  const selected = changeChairSelection(current, { ...DEFAULT_CHAIR_SELECTION, productId: product.id, variantId: variant.id });
  expect(calculatePlanDemand(selected).quantity).toBe(3);
  const target = resolveChairShopTarget(selected)!;
  expect(target.href).toContain(`/produkte/stapelstuehle/${product.handle}?`);
  expect(target.href).toContain("menge=3");
  expect(target.canAddToCart).toBe(false);
  const points = [[0, 0], [12, 0], [12, 10], [0, 10]].map(([x, y], index) => ({ id: `point-${index}`, x, y }));
  selected.contour = { closed: true, points, walls: points.map((point, index) => ({ id: `wall-${index}`, startPointId: point.id, endPointId: points[(index + 1) % 4].id })) };
  const loaded = parseProject(JSON.stringify(createProject("WP15", selected)));
  expect(loaded.plan.chairSelection).toEqual(selected.chairSelection);
  expect(resolveChairShopTarget(loaded.plan)?.href).toBe(target.href);
});

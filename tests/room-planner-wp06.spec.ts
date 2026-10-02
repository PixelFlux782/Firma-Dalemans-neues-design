import { expect, test } from "@playwright/test";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";
import { obstaclePolygon, polygonsOverlap, type RoomPlan } from "../src/lib/room-planner/objects";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { DEFAULT_SEATING_RULES, seatPolygon } from "../src/lib/room-planner/seating";
import { generatePlanVariants } from "../src/lib/room-planner/variants";

function room(): RoomPlan {
  return { contour: { closed: true, points: [{ id: "a", x: 0, y: 0 }, { id: "b", x: 10, y: 0 }, { id: "c", x: 10, y: 8 }, { id: "d", x: 0, y: 8 }], walls: [
    { id: "top", startPointId: "a", endPointId: "b" }, { id: "right", startPointId: "b", endPointId: "c" },
    { id: "bottom", startPointId: "c", endPointId: "d" }, { id: "left", startPointId: "d", endPointId: "a" },
  ] }, objects: [
    { id: "exit", type: "door", wallId: "top", offset: 0.4, width: 1.2, role: "exit", clearWidth: 1.2 },
    { id: "manual-aisle", type: "aisle", start: { x: 1, y: 0.7 }, end: { x: 1, y: 7.3 }, width: 1.2 },
  ] };
}

test("Front steuert Varianten deterministisch; Sperrflächen und manuelle Objekte bleiben erhalten", () => {
  const base = room();
  const withoutFront = generatePlanVariants(base, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE);
  expect(withoutFront.evaluatedCandidates).toBeGreaterThan(0);
  const plan: RoomPlan = { ...base, objects: [...base.objects,
    { id: "front", type: "front", x: 5, y: 0.5, width: 3, rotation: 90 },
    { id: "stage", type: "stage", x: 5, y: 1.8, width: 2, depth: 1, rotation: 10 },
    { id: "reserved", type: "reservedArea", x: 7, y: 4, width: 1.5, depth: 1.5, rotation: 20, name: "Technik" },
  ] };
  const first = generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE);
  expect(first).toEqual(generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE));
  expect(first.evaluatedCandidates).toBeLessThanOrEqual(48);
  const variants = [...first.variants, ...(first.fallback ? [first.fallback] : [])];
  expect(variants.length).toBeGreaterThan(0);
  for (const variant of variants) {
    expect(variant.plan.objects.slice(0, plan.objects.length)).toEqual(plan.objects);
    expect(variant.metrics.frontDeviation).toBeDefined();
    expect(variant.report.counts.fail === 0 && variant.analysis.seatsWithoutRoute === 0).toBe(variant.feasible);
    for (const seat of variant.seatingPlan.seats) for (const object of plan.objects) {
      if (object.type === "stage" || object.type === "reservedArea") {
        expect(polygonsOverlap(seatPolygon(seat.x, seat.y, variant.seatingPlan.rules, variant.seatingPlan.orientation), obstaclePolygon(object))).toBe(false);
      }
    }
  }
  const frontOnly: RoomPlan = { ...base, objects: [{ id: "front", type: "front", x: 5, y: 0.5, width: 3, rotation: 90 }] };
  const facing = generatePlanVariants(frontOnly, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE);
  expect(facing.fallback?.seatingPlan.orientation).toBe("vertical");
  const turned: RoomPlan = { ...base, objects: [{ id: "front", type: "front", x: 5, y: 0.5, width: 3, rotation: 0 }] };
  expect(generatePlanVariants(turned, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE).fallback?.seatingPlan.orientation).toBe("horizontal");
  const adopted = { ...variants[0].plan, objects: [...variants[0].plan.objects] };
  const history = commit(createHistory(plan), adopted);
  expect(undo(history).present).toBe(plan);
  expect(redo(undo(history)).present).toBe(adopted);
});

test("Editor legt Front, Bühne und Reservierung an und macht jeden Schritt rückgängig", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  const click = (x: number, y: number) => svg.click({ position: { x, y } });
  const x = box!.width / 2, y = box!.height / 2;
  await click(x - 180, y - 140); await click(x + 180, y - 140); await click(x + 180, y + 140); await click(x - 180, y + 140); await click(x - 180, y - 140);
  for (const [name, dx, dy] of [["Front", 0, -85], ["Bühne", 0, -45], ["Sperrfläche", 90, 25]] as const) {
    await editor.getByRole("button", { name, exact: true }).click();
    await click(x + dx, y + dy);
  }
  await expect(svg.locator("[data-object-id]")).toHaveCount(3);
  await editor.getByRole("button", { name: "Rückgängig" }).click();
  await expect(svg.locator("[data-object-id]")).toHaveCount(2);
  await editor.getByRole("button", { name: "Wiederholen" }).click();
  await expect(svg.locator("[data-object-id]")).toHaveCount(3);
});

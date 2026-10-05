import { expect, test } from "@playwright/test";
import { closeRoom, appendPoint, movePoint, resizeWall } from "../src/lib/room-planner/geometry";
import { planMeasurements } from "../src/lib/room-planner/measurements";
import { emptyPlan, type RoomPlan } from "../src/lib/room-planner/objects";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";

function room(points: [number, number][]): RoomPlan {
  let contour = emptyPlan().contour;
  points.forEach(([x, y], index) => { contour = appendPoint(contour, { id: `p${index}`, x, y }); });
  return { contour: closeRoom(contour), objects: [] };
}

test("WP16.5 every rectangle and polygon edge has a live metric dimension", () => {
  const rectangle = room([[0, 0], [12, 0], [12, 20], [0, 20]]);
  expect(planMeasurements(rectangle).filter((m) => m.kind === "wall").map((m) => m.label)).toEqual(["12,00 m", "20,00 m", "12,00 m", "20,00 m"]);
  const polygon = room([[0, 0], [4, 0], [7, 3], [3, 7], [0, 5]]);
  expect(planMeasurements(polygon).filter((m) => m.kind === "wall")).toHaveLength(5);
  const changed = { ...rectangle, contour: movePoint(rectangle.contour, "p1", { x: 10, y: 0 }) };
  expect(planMeasurements(changed).find((m) => m.id === rectangle.contour.walls[0].id)?.label).toBe("10,00 m");
  const resized = resizeWall(rectangle.contour, rectangle.contour.walls[0].id, 11).room;
  expect(resized && planMeasurements({ ...rectangle, contour: resized })[0].label).toBe("11,00 m");
});

test("WP16.5 doors, aisles and obstacles use the source geometry", () => {
  const plan = room([[0, 0], [12, 0], [12, 20], [0, 20]]);
  plan.objects = [
    { id: "door", type: "door", wallId: plan.contour.walls[0].id, offset: 3, width: 1.2, role: "emergency_exit" },
    { id: "aisle", type: "aisle", start: { x: 2, y: 2 }, end: { x: 2, y: 14 }, width: 1.2 },
    { id: "obstacle", type: "obstacle", obstacleType: "column", x: 7, y: 5, width: 1.5, depth: .8, rotation: 0 },
    { id: "stage", type: "stage", x: 8, y: 16, width: 3, depth: 2, rotation: 0 },
    { id: "reserved", type: "reservedArea", x: 8, y: 10, width: 2, depth: 1, rotation: 0 },
  ];
  const values = planMeasurements(plan);
  expect(values.find((m) => m.id === "door")?.label).toBe("1,20 m");
  expect(values.filter((m) => m.kind === "aisle").map((m) => m.label)).toEqual(["12,00 m", "1,20 m"]);
  expect(values.filter((m) => m.id.startsWith("obstacle-")).map((m) => m.label)).toEqual(["1,50 m", "0,80 m"]);
  expect(values.filter((m) => m.id.startsWith("stage-")).map((m) => m.label)).toEqual(["3,00 m", "2,00 m"]);
  expect(values.filter((m) => m.id.startsWith("reserved-")).map((m) => m.label)).toEqual(["2,00 m", "1,00 m"]);
  expect(planMeasurements(plan, null, "door").filter((m) => m.id === "door-before" || m.id === "door-after").map((m) => m.label)).toEqual(["3,00 m", "7,80 m"]);
  expect(planMeasurements(plan, null, "obstacle").some((m) => m.id === "obstacle-wall-gap")).toBe(true);
  expect(planMeasurements(plan, null, "obstacle").some((m) => m.id === "obstacle-element-gap")).toBe(true);
});

test("WP16.5 undo and redo recalculate values without storing measurements", () => {
  const original = room([[0, 0], [12, 0], [12, 20], [0, 20]]);
  const updated = { ...original, contour: movePoint(original.contour, "p1", { x: 10, y: 0 }) };
  const history = commit(createHistory(original), updated);
  expect(planMeasurements(undo(history).present)[0].label).toBe("12,00 m");
  expect(planMeasurements(redo(undo(history)).present)[0].label).toBe("10,00 m");
  expect(JSON.stringify(updated)).not.toContain("measurement");
});

test("WP16.5 editor toggle and print view show technical dimensions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const canvas = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await canvas.click({ position: { x: 180, y: 140 } });
  await canvas.click({ position: { x: 500, y: 140 } });
  await canvas.click({ position: { x: 500, y: 400 } });
  await canvas.click({ position: { x: 180, y: 400 } });
  await canvas.locator("[data-point-id]").first().click();
  await expect(canvas.getByLabel("Bemaßungen").locator('[aria-label^="Wandlänge"]')).toHaveCount(4);
  const beforeZoom = await canvas.getByLabel("Bemaßungen").locator('[aria-label^="Wandlänge"]').allTextContents();
  await page.getByRole("button", { name: "Ansicht vergrößern" }).click();
  expect(await canvas.getByLabel("Bemaßungen").locator('[aria-label^="Wandlänge"]').allTextContents()).toEqual(beforeZoom);
  await page.getByRole("button", { name: "Bemaßungen ein-/ausblenden" }).click();
  await expect(canvas.getByLabel("Bemaßungen")).toHaveCount(0);
  await page.getByRole("button", { name: "Bemaßungen ein-/ausblenden" }).click();
  await page.getByRole("button", { name: "Plan ausgeben" }).click();
  await expect(page.getByRole("img", { name: /Grundriss mit Sitzen/ }).getByLabel("Bemaßungen").locator('[aria-label^="Wandlänge"]')).toHaveCount(4);
});

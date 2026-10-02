import { expect, test } from "@playwright/test";
import { appendPoint, closeRoom, emptyRoom, movePoint } from "../src/lib/room-planner/geometry";
import { aislePolygon, doorFits, doorSegment, obstaclePolygon, pointInPolygon, polygonInsideRoom, validateObjects, wallOffset, wallPoint, type RoomPlan } from "../src/lib/room-planner/objects";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";

const roomFrom = (points: [number, number][]) => closeRoom(points.reduce((room, [x, y], index) => appendPoint(room, { id: `p${index}`, x, y }), emptyRoom()));
const contour = roomFrom([[0, 0], [10, 0], [10, 8], [0, 8]]);
const wallId = contour.walls[0].id;

test("door positions stay tied to horizontal and slanted walls", () => {
  const door = { id: "d", type: "door" as const, wallId, offset: 2, width: 1 };
  expect(doorSegment(contour, door)).toEqual({ start: { x: 2, y: 0 }, end: { x: 3, y: 0 } });
  expect(wallOffset(contour, wallId, { x: 2, y: 0 })).toBe(2);
  expect(doorFits(contour, door)).toBe(true);
  expect(doorFits(contour, { ...door, offset: 9.5 })).toBe(false);
  const slanted = movePoint(contour, "p1", { x: 6, y: 8 });
  expect(wallPoint(slanted, wallId, 5)).toEqual({ x: 3, y: 4 });
  expect(doorFits(slanted, door)).toBe(true);
  expect(doorSegment(slanted, door)?.start).toEqual({ x: 1.2, y: 1.6 });
});

test("aisle and rotated obstacle geometry validates against room and overlap", () => {
  const aisle = { id: "a", type: "aisle" as const, start: { x: 2, y: 4 }, end: { x: 8, y: 4 }, width: 2 };
  expect(aislePolygon(aisle)).toEqual([{ x: 2, y: 5 }, { x: 8, y: 5 }, { x: 8, y: 3 }, { x: 2, y: 3 }]);
  expect(pointInPolygon({ x: 5, y: 4 }, contour.points)).toBe(true);
  expect(pointInPolygon({ x: 11, y: 4 }, contour.points)).toBe(false);
  const obstacle = { id: "o", type: "obstacle" as const, obstacleType: "column" as const, x: 5, y: 4, width: 2, depth: 2, rotation: 45 };
  expect(polygonInsideRoom(obstaclePolygon(obstacle), contour)).toBe(true);
  expect(polygonInsideRoom(obstaclePolygon({ ...obstacle, x: 0.5 }), contour)).toBe(false);
  const plan: RoomPlan = { contour, objects: [aisle, obstacle] };
  expect(validateObjects(plan)).toContainEqual({ objectId: "a", severity: "warning", message: "Gang überlagert ein Hindernis." });
  expect(validateObjects({ ...plan, objects: [{ ...aisle, end: { x: 11, y: 4 } }] })[0].severity).toBe("error");
  expect(validateObjects({ ...plan, objects: [{ ...obstacle, x: 0.5 }] })[0].severity).toBe("error");
  expect(validateObjects({ ...plan, objects: [{ ...obstacle, width: 0 }] })[0].severity).toBe("error");
});

test("plan history includes objects and contour as one state", () => {
  const initial: RoomPlan = { contour, objects: [] };
  const withDoor: RoomPlan = { ...initial, objects: [{ id: "d", type: "door", wallId, offset: 2, width: 1 }] };
  const history = commit(createHistory(initial), withDoor);
  expect(undo(history).present.objects).toHaveLength(0);
  expect(redo(undo(history)).present.objects).toHaveLength(1);
});

test("2D editor creates, edits, deletes and undoes objects", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const surface = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await surface.scrollIntoViewIfNeeded();
  const box = (await surface.boundingBox())!;
  const click = async (x: number, y: number) => page.mouse.click(box.x + box.width / 2 + x * 45, box.y + box.height / 2 + y * 45);
  await click(-4, -3); await click(6, -3); await click(6, 5); await click(-4, 5); await click(-4, -3);
  await page.getByRole("button", { name: "Tür", exact: true }).click();
  await click(0, -3);
  await expect(page.getByText("Position auf Wand (m)")).toBeVisible();
  await page.getByLabel("Breite (m)").fill("1.5");
  await page.getByRole("button", { name: "Hindernis", exact: true }).click();
  await click(0, 0);
  await expect(page.getByLabel("Hindernistyp", { exact: true })).toBeVisible();
  await page.getByLabel("Rotation (°)").fill("45");
  await page.getByRole("button", { name: "Gang", exact: true }).click();
  await click(-2, 2); await click(3, 2);
  await expect(page.getByText("Gang / Freihaltezone")).toBeVisible();
  await page.getByLabel("Breite (m)").fill("1.5");
  await page.getByRole("button", { name: "Auswahl", exact: true }).click();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 45, box.y + box.height / 2);
  await page.mouse.up();
  await expect(page.getByLabel("X (m)")).toHaveValue("1");
  await page.getByRole("button", { name: "Rückgängig" }).click();
  await click(0, 0);
  await expect(page.getByLabel("X (m)")).toHaveValue("0");
  await page.getByRole("button", { name: "Wiederholen" }).click();
  await click(1, 0);
  await expect(page.getByLabel("X (m)")).toHaveValue("1");
  await click(2, 2);
  await expect(page.getByText("Gang / Freihaltezone")).toBeVisible();
  await page.keyboard.press("Delete");
  await expect(page.getByText("Gang / Freihaltezone")).toBeHidden();
  await page.getByRole("button", { name: "Rückgängig" }).click();
  await expect(surface.locator("[data-object-id]").count()).resolves.toBeGreaterThan(0);
  await page.getByRole("button", { name: "Wiederholen" }).click();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator("canvas")).toBeVisible();
});

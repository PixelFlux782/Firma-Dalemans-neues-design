import { expect, test } from "@playwright/test";
import { appendPoint, closeRoom, emptyRoom, movePoint, orthogonalSnap, perimeter, polygonArea, snapPoint, validateRoom, wallLength } from "../src/lib/room-planner/geometry";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";

const roomFrom = (coordinates: [number, number][]) => closeRoom(coordinates.reduce((room, [x, y], index) => appendPoint(room, { id: `p${index}`, x, y }), emptyRoom()));

test("metric geometry: rectangle, concave room, wall and snapping", () => {
  const rectangle = roomFrom([[0, 0], [10, 0], [10, 8], [0, 8]]);
  expect(rectangle.closed).toBe(true);
  expect(rectangle.walls).toHaveLength(4);
  expect(polygonArea(rectangle.points)).toBe(80);
  expect(perimeter(rectangle)).toBe(36);
  const lShape = roomFrom([[0, 0], [6, 0], [6, 2], [2, 2], [2, 5], [0, 5]]);
  expect(polygonArea(lShape.points)).toBe(18);
  expect(wallLength({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  expect(snapPoint({ x: 1.26, y: -0.94 })).toEqual({ x: 1.3, y: -0.9 });
  expect(validateRoom(lShape)).toEqual([]);
  expect(polygonArea(roomFrom([[0, 0], [4, 0], [2, 3]]).points)).toBe(6);
  expect(orthogonalSnap({ id: "a", x: 0, y: 0 }, { x: 4, y: 0.6 }, true)).toEqual({ x: 4, y: 0 });
});

test("moving a shared corner updates connected walls and supports undo/redo", () => {
  const base = roomFrom([[0, 0], [4, 0], [4, 3], [0, 3]]);
  const moved = movePoint(base, "p1", { x: 5, y: 0 });
  expect(polygonArea(moved.points)).toBe(13.5);
  expect(perimeter(moved)).toBeGreaterThan(perimeter(base));
  let history = createHistory(emptyRoom());
  history = commit(history, appendPoint(history.present, { id: "a", x: 0, y: 0 }));
  expect(undo(history).present.points).toHaveLength(0);
  expect(redo(undo(history)).present.points).toHaveLength(1);
  history = commit(createHistory(base), moved);
  expect(undo(history).present).toEqual(base);
  expect(redo(undo(history)).present).toEqual(moved);
});

test("invalid polygon, zero wall and self intersection are reported", () => {
  const tooFew = { ...emptyRoom(), points: [{ id: "a", x: 0, y: 0 }, { id: "b", x: 1, y: 0 }], closed: true };
  expect(validateRoom(tooFew)).toContain("Ein Raum benötigt mindestens drei Eckpunkte.");
  const duplicate = roomFrom([[0, 0], [4, 0], [4, 0], [0, 3]]);
  expect(validateRoom(duplicate)).toContain("Eine Wand hat keine Länge.");
  const crossed = roomFrom([[0, 0], [4, 4], [0, 4], [4, 0]]);
  expect(validateRoom(crossed)).toContain("Raumkontur überschneidet sich selbst.");
  expect(validateRoom(crossed)).toContain("Die Raumkontur hat keine gültige Fläche.");
});

test("2D editor draws, closes, edits and undoes a room", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  await expect(page.getByRole("button", { name: "2D planen" })).toHaveAttribute("aria-pressed", "true");
  const surface = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await expect(surface).toBeVisible();
  await surface.scrollIntoViewIfNeeded();
  const box = await surface.boundingBox();
  expect(box).not.toBeNull();
  const { x, y, width, height } = box!;
  const click = async (mx: number, my: number) => page.mouse.click(x + width / 2 + mx * 45, y + height / 2 + my * 45);
  await click(-4, -3); await click(6, -3); await click(6, 5); await click(-4, 5); await click(-4, -3);
  await expect(page.getByText("Raumfläche: 80,00 m²")).toBeVisible();
  await page.getByRole("button", { name: "Auswahl" }).click();
  await page.mouse.move(x + width / 2 + 6 * 45, y + height / 2 - 3 * 45);
  await page.mouse.down();
  await page.mouse.move(x + width / 2 + 7 * 45, y + height / 2 - 3 * 45);
  await page.mouse.up();
  await expect(page.getByText("Raumfläche: 84,00 m²")).toBeVisible();
  await page.getByRole("button", { name: "Rückgängig" }).click();
  await expect(page.getByText("Raumfläche: 80,00 m²")).toBeVisible();
  await page.getByRole("button", { name: "Wiederholen" }).click();
  await expect(page.getByText("Raumfläche: 84,00 m²")).toBeVisible();
  await page.getByRole("button", { name: "Vergrößern" }).click();
  await expect(page.getByText("125 %")).toBeVisible();
  await expect(page.getByText("Raumfläche: 84,00 m²")).toBeVisible();
  await surface.scrollIntoViewIfNeeded();
  const zoomBox = await surface.boundingBox();
  await page.mouse.move(zoomBox!.x + zoomBox!.width / 2, zoomBox!.y + zoomBox!.height / 2);
  await page.mouse.wheel(0, -100);
  await expect(page.getByText("145 %")).toBeVisible();
  await expect(page.getByText("Raumfläche: 84,00 m²")).toBeVisible();
  await page.getByRole("button", { name: "3D ansehen" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "2D planen" }).click();
  await expect(page.getByText("Raumfläche: 84,00 m²")).toBeVisible();
  await page.getByRole("button", { name: "Planung zurücksetzen" }).click();
  await expect(page.getByText("Raumgrundriss zeichnen")).toBeVisible();
});

import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { chairDisplayAngle, planBounds } from "../src/lib/room-planner/visualization3d";
import type { RoomPlan } from "../src/lib/room-planner/objects";

test("WP16.4 model is genuinely simplified and retains a single textured mesh", () => {
  const inspect = (name: string) => {
    const bytes = readFileSync(`public/models/${name}`);
    const jsonLength = bytes.readUInt32LE(12);
    const model = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
    const primitive = model.meshes[0].primitives[0];
    return { triangles: model.accessors[primitive.indices].count / 3, meshes: model.meshes.length, textures: model.textures.length };
  };
  const original = inspect("dalemans-chair.glb");
  const runtime = inspect("dalemans-chair-low.glb");
  expect(runtime.triangles).toBeLessThan(original.triangles / 5);
  expect(runtime.meshes).toBe(1);
  expect(runtime.textures).toBe(original.textures);
});

test("WP16.4 bounds and chair display rotation leave the plan intact", () => {
  const plan: RoomPlan = { contour: { closed: true, points: [{ id: "a", x: -3, y: 2 }, { id: "b", x: 27, y: 2 }, { id: "c", x: 27, y: 12 }, { id: "d", x: -3, y: 12 }], walls: [] }, objects: [] };
  const before = JSON.stringify(plan);
  expect(planBounds(plan)).toEqual({ x: 12, z: 7, width: 30, depth: 10, span: 30 });
  expect(planBounds({ ...plan, contour: { ...plan.contour, points: plan.contour.points.map(point => ({ ...point, x: point.x / 10, y: point.y / 10 })) } }).span).toBe(4);
  expect(chairDisplayAngle(90)).toBeCloseTo(Math.PI / 2);
  expect(JSON.stringify(plan)).toBe(before);
});

async function prepareRoomWithSeats(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const canvas = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await canvas.click({ position: { x: 180, y: 140 } });
  await canvas.click({ position: { x: 500, y: 140 } });
  await canvas.click({ position: { x: 500, y: 400 } });
  await canvas.click({ position: { x: 180, y: 400 } });
  await canvas.locator("[data-point-id]").first().click();
  await page.locator('[data-planner-action="calculate-seating"]').click();
  await expect(page.getByText(/55 Sitzplätze/).first()).toBeVisible();
  return canvas;
}

test("WP16.4 loads the optimized chair in the 3D view", async ({ page }) => {
  const canvas = await prepareRoomWithSeats(page);
  const modelResponse = page.waitForResponse(response => response.url().endsWith("/models/dalemans-chair-low.glb"));
  await page.getByRole("button", { name: "3D", exact: true }).click();
  expect((await modelResponse).status()).toBe(200);
  await expect(page.getByLabel("3D-Raumansicht").locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(canvas.locator("[data-point-id]")).toHaveCount(4);
  await expect(page.getByText(/55 Sitzplätze/).first()).toBeVisible();
});

test("WP16.4 failed chair download preserves the editable 2D plan", async ({ page }) => {
  let modelRequested = false;
  await page.route("**/models/dalemans-chair-low.glb", route => { modelRequested = true; return route.abort(); });
  const canvas = await prepareRoomWithSeats(page);
  const count = await canvas.locator("[data-point-id]").count();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByLabel("3D-Raumansicht").locator("canvas")).toBeVisible();
  await expect.poll(() => modelRequested).toBe(true);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(canvas.locator("[data-point-id]")).toHaveCount(count);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByLabel("3D-Raumansicht").locator("canvas")).toBeVisible();
});

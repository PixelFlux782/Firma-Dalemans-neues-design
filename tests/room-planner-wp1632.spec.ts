import { expect, test } from "@playwright/test";
import { chairDisplayAngle } from "../src/lib/room-planner/visualization3d";
import { resizeWall, wallLength, type RoomGeometry } from "../src/lib/room-planner/geometry";

test("WP16.3.2 wall resizing keeps its start fixed and rejects broken contours", () => {
  const room: RoomGeometry = {
    closed: true,
    points: [{ id: "a", x: 0, y: 0 }, { id: "b", x: 4, y: 0 }, { id: "c", x: 4, y: 3 }, { id: "d", x: 0, y: 3 }],
    walls: [{ id: "ab", startPointId: "a", endPointId: "b" }, { id: "bc", startPointId: "b", endPointId: "c" }, { id: "cd", startPointId: "c", endPointId: "d" }, { id: "da", startPointId: "d", endPointId: "a" }],
  };
  const resized = resizeWall(room, "ab", 5).room!;
  expect(resized.points[0]).toEqual(room.points[0]);
  expect(wallLength(resized.points[0], resized.points[1])).toBeCloseTo(5);
  expect(room.points[1].x).toBe(4);
  expect(resizeWall(room, "ab", 0).room).toBeUndefined();
  expect(resizeWall(room, "ab", 0.00001).room).toBeUndefined();
});

test("WP16.3.2 3D chair offset changes display angle without changing plan rotation", () => {
  const seat = { rotation: 90 };
  expect(chairDisplayAngle(seat.rotation)).toBeCloseTo(Math.PI / 2);
  expect(chairDisplayAngle(0)).toBeCloseTo(Math.PI);
  expect(seat.rotation).toBe(90);
});

test("WP16.3.2 wall labels edit one geometry step, reject invalid lengths and support Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const canvas = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await canvas.click({ position: { x: 200, y: 180 } });
  await canvas.click({ position: { x: 380, y: 180 } });
  const point = canvas.locator("[data-point-id]").nth(1);
  const before = await point.getAttribute("cx");
  const dimension = canvas.getByRole("button", { name: /Wandlänge 4,00 m bearbeiten/ });
  await dimension.click();
  await expect(canvas.locator("[data-point-id]")).toHaveCount(2);
  const input = page.getByRole("textbox", { name: "Wandlänge in Metern" });
  await input.fill("0");
  await page.getByRole("button", { name: "Übernehmen" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /Wandlänge größer als 0/ })).toBeVisible();
  await expect(point).toHaveAttribute("cx", before!);
  await input.fill("5,00");
  await input.press("Escape");
  await expect(input).toHaveCount(0);
  await expect(point).toHaveAttribute("cx", before!);
  await dimension.click();
  await page.getByRole("textbox", { name: "Wandlänge in Metern" }).fill("5,00");
  await page.getByRole("button", { name: "Übernehmen" }).click();
  await expect(point).not.toHaveAttribute("cx", before!);
  await page.getByRole("button", { name: "Rückgängig" }).click();
  await expect(point).toHaveAttribute("cx", before!);
});

test("WP16.3.2 tool groups expose persistent options and keyboard help", async ({ page }) => {
  await page.goto("/raumplaner");
  const tools = page.getByLabel("Werkzeuge", { exact: true });
  const door = tools.getByRole("button", { name: "Tür" });
  await door.focus();
  await expect(page.getByRole("tooltip", { name: /Tür/ })).toBeVisible();
  await door.click();
  await expect(page.getByRole("group", { name: "Tür Optionen" })).toBeVisible();
  await page.getByLabel("Türtyp am Werkzeug").selectOption("emergency_exit");
  await page.getByLabel("Türbreite am Werkzeug").fill("1.4");
  await page.getByRole("button", { name: "Werkzeugoptionen schließen" }).click();
  await door.click();
  await expect(page.getByLabel("Türtyp am Werkzeug")).toHaveValue("emergency_exit");
  await expect(page.getByLabel("Türbreite am Werkzeug")).toHaveValue("1.4");
  await tools.getByRole("button", { name: "Hindernis" }).click();
  await expect(page.getByLabel("Hindernistyp am Werkzeug")).toBeVisible();
  await tools.getByRole("button", { name: "Gang" }).click();
  await expect(page.getByLabel("Gangbreite am Werkzeug")).toBeVisible();
});

test("WP16.3.2 repeated doors keep the chosen role and width", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const canvas = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await canvas.click({ position: { x: 200, y: 180 } });
  await canvas.click({ position: { x: 560, y: 180 } });
  await canvas.click({ position: { x: 560, y: 420 } });
  await canvas.click({ position: { x: 200, y: 420 } });
  await canvas.locator("[data-point-id]").first().click();
  await page.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Tür" }).click();
  await page.getByLabel("Türtyp am Werkzeug").selectOption("emergency_exit");
  await page.getByLabel("Türbreite am Werkzeug").fill("1.4");
  await page.getByRole("button", { name: "Werkzeugoptionen schließen" }).click();
  await canvas.click({ position: { x: 310, y: 180 } });
  await canvas.click({ position: { x: 450, y: 180 } });
  await expect(canvas.locator("[data-object-id]")).toHaveCount(2);
  await expect(page.getByLabel("Türrolle")).toHaveValue("emergency_exit");
  await expect(page.getByLabel("Eigenschaften").getByRole("spinbutton", { name: "Breite (m)", exact: true })).toHaveValue("1.4");
  await page.getByLabel("Werkzeuge", { exact: true }).getByRole("button", { name: "Auswahl" }).click();
  await canvas.click({ position: { x: 310, y: 180 } });
  await expect(page.getByLabel("Türrolle")).toHaveValue("emergency_exit");
});

test("WP16.3.2 sidebar puts blockers first and keeps demand details available", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/raumplaner");
  const canvas = page.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await canvas.click({ position: { x: 180, y: 140 } });
  await canvas.click({ position: { x: 500, y: 140 } });
  await canvas.click({ position: { x: 500, y: 400 } });
  await canvas.click({ position: { x: 180, y: 400 } });
  await canvas.locator("[data-point-id]").first().click();
  await page.locator('[data-planner-action="calculate-seating"]').click();
  await expect(page.getByLabel("Probleme")).toBeVisible();
  await expect(page.getByLabel("Probleme")).toContainText(/Problem/);
  const details = page.getByText("Bedarfsdetails anzeigen");
  await details.click();
  await expect(page.getByLabel("Bedarf")).toContainText("Die Reserve verändert den Raumplan nicht.");
});

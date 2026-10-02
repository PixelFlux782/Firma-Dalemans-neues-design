import { expect, test } from "@playwright/test";
import { createProject } from "../src/lib/room-planner/projects";
import { setDoorRole, type DoorObject, type RoomPlan } from "../src/lib/room-planner/objects";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { analyzeEgress } from "../src/lib/room-planner/egress/analyzeEgress";
import { evaluateRules } from "../src/lib/room-planner/rules/evaluateRules";
import { DEFAULT_SEATING_RULES, type SeatingPlan } from "../src/lib/room-planner/seating";
import { parseProject } from "../src/lib/room-planner/projects";

const points = [[0, 0], [12, 0], [12, 10], [0, 10]].map(([x, y], i) => ({ id: `point-${i}`, x, y }));
const seats = [{ id: "seat-1", x: 4, y: 4, rotation: 0, row: 1, index: 0 }];
const seating: SeatingPlan = { blocks: [{ id: "block-1", seats, rowCount: 1, seatsPerRow: [1], edited: true }], seats, totalSeats: 1, totalRows: 1, longestRow: 1, hints: [], rules: { ...DEFAULT_SEATING_RULES }, orientation: "horizontal" };
const door: DoorObject = { id: "door-1", type: "door", wallId: "wall-0", offset: 5, width: 1 };
const planWithDoor = (exit: DoorObject): RoomPlan => ({ contour: { closed: true, points, walls: points.map((point, i) => ({ id: `wall-${i}`, startPointId: point.id, endPointId: points[(i + 1) % points.length].id })) }, objects: [exit, { id: "aisle-1", type: "aisle", start: { x: 6, y: 0 }, end: { x: 6, y: 8 }, width: 1.2 }], seating });

test("new exit defaults to 1.20 m and preserves wider doors", () => {
  expect(setDoorRole(door, "emergency_exit")).toMatchObject({ width: 1.2, clearWidth: 1.2 });
  expect(setDoorRole({ ...door, width: 1.4 }, "exit")).toMatchObject({ width: 1.4, clearWidth: 1.4 });
  expect(setDoorRole({ ...door, role: "exit", width: 1.2, clearWidth: .9 }, "emergency_exit").clearWidth).toBe(.9);
});

test("manual and loaded narrow exits remain narrow and fail the existing rule", () => {
  const narrow = { ...setDoorRole(door, "emergency_exit"), clearWidth: .9 };
  for (const plan of [planWithDoor(narrow), parseProject(JSON.stringify(createProject("Legacy", planWithDoor(narrow)))).plan]) {
    expect((plan.objects[0] as DoorObject).clearWidth).toBe(.9);
    const report = evaluateRules(plan, seating, analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE), BAVSTAETTV_REFERENCE);
    expect(report.checks.find((check) => check.id === "door-1-capacity")?.status).toBe("fail");
  }
});

test("changing a normal door to an emergency exit applies the editable default", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await editor.getByLabel("Projektverwaltung").getByLabel("Projektdatei importieren").setInputFiles({ name: "door.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(createProject("Door", planWithDoor(door)))) });
  await editor.getByRole("button", { name: "Auswahl", exact: true }).click();
  const doorBox = await editor.getByRole("img", { name: "Grundriss Zeichenfläche" }).locator('[data-object-id="door-1"]').first().boundingBox();
  expect(doorBox).not.toBeNull();
  await page.mouse.click(doorBox!.x + doorBox!.width / 2, doorBox!.y + doorBox!.height / 2);
  await editor.getByLabel("Türrolle").selectOption("emergency_exit");
  await expect(editor.getByLabel("Lichte Breite (m)")).toHaveValue("1.2");
  await editor.getByLabel("Lichte Breite (m)").fill("0.9");
  await expect(editor.getByLabel("Lichte Breite (m)")).toHaveValue("0.9");
  await expect(editor.getByLabel("Prüfergebnisse").getByRole("button", { name: /Ausgang door-1:.*0\.90 m/ })).toHaveClass(/bg-red-50/);
});

test("editor is interactive after output and retains plan, viewport, selection and undo", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await editor.getByLabel("Projektverwaltung").getByLabel("Projektdatei importieren").setInputFiles({ name: "fixture.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(createProject("Lifecycle", planWithDoor(setDoorRole(door, "exit"))))) });
  await editor.getByRole("button", { name: "Auswahl", exact: true }).click();
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  await svg.locator('[data-object-id="aisle-1"]').first().click();
  await editor.getByRole("button", { name: "Ansicht vergrößern" }).click();
  const zoom = await editor.locator(".planner-tools span").first().textContent();
  const undoEnabled = await editor.getByRole("button", { name: "Rückgängig" }).isEnabled();
  await editor.getByRole("button", { name: "Plan ausgeben" }).click();
  await page.getByRole("region", { name: "Plan-Ausgabe" }).getByRole("button", { name: "Zurück zum Editor" }).click();
  await expect(editor.getByLabel("Aktueller Plan")).toContainText("1 Plätze");
  expect(await editor.getByRole("button", { name: "Rückgängig" }).isEnabled()).toBe(undoEnabled);
  await expect(editor.locator(".planner-tools span").first()).toHaveText(zoom ?? "");
  await expect(editor.getByLabel("Breite (m)").first()).toHaveValue("1.2");
  await editor.getByLabel("Breite (m)").first().fill("1.3");
  await editor.getByLabel("Breite (m)").first().press("Tab");
  await expect(editor.getByLabel("Breite (m)").first()).toHaveValue("1.3");
  await expect(editor.getByRole("button", { name: "Rückgängig" })).toBeEnabled();
});

import { expect, test } from "@playwright/test";
import { createProject } from "../src/lib/room-planner/projects";
import { DEFAULT_SEATING_RULES, type SeatingPlan } from "../src/lib/room-planner/seating";
import type { RoomPlan } from "../src/lib/room-planner/objects";

test("Plan-Ausgabe zeigt den aktuellen bearbeiteten Plan und verändert ihn nicht", async ({ page }) => {
  const points = [[0, 0], [12, 0], [12, 10], [0, 10]].map(([x, y], i) => ({ id: `point-${i}`, x, y }));
  const seats = [0, 2, 3].map((index) => ({ id: `seat-${index}`, x: 4 + index * .55, y: 4, rotation: 0, row: 1, index }));
  const seating: SeatingPlan = { blocks: [{ id: "block-1", seats, rowCount: 1, seatsPerRow: [3], edited: true }], seats, totalSeats: 3, totalRows: 1, longestRow: 3, hints: [], rules: { ...DEFAULT_SEATING_RULES }, orientation: "horizontal" };
  const plan: RoomPlan = { contour: { closed: true, points, walls: points.map((p, i) => ({ id: `wall-${i}`, startPointId: p.id, endPointId: points[(i + 1) % 4].id })) }, objects: [
    { id: "door-1", type: "door", wallId: "wall-0", offset: 5, width: 1.2, role: "exit", clearWidth: 1.1 },
    { id: "aisle-1", type: "aisle", start: { x: 7, y: 1 }, end: { x: 7, y: 9 }, width: .8, edited: true },
    { id: "obstacle-1", type: "obstacle", obstacleType: "column", x: 2, y: 2, width: .5, depth: .5, rotation: 0 },
    { id: "stage-1", type: "stage", x: 6, y: 8, width: 2, depth: 1, rotation: 0 },
    { id: "reserved-1", type: "reservedArea", x: 10, y: 8, width: 1, depth: 1, rotation: 0 },
    { id: "front-1", type: "front", x: 6, y: 7, width: 3, rotation: 0 },
  ], seating };
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await editor.getByLabel("Projektverwaltung").getByLabel("Projektdatei importieren").setInputFiles({ name: "wp13.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(createProject("Saal WP13", plan))) });
  await editor.getByRole("button", { name: "Plan ausgeben" }).click();
  const output = page.getByRole("region", { name: "Plan-Ausgabe" });
  await expect(output.getByRole("heading", { name: "Saal WP13" })).toBeVisible();
  const drawing = output.getByRole("img", { name: /Grundriss/ });
  await expect(drawing.locator("[data-seat-id]")).toHaveCount(3);
  await expect(drawing.locator('[data-seat-id="seat-1"]')).toHaveCount(0);
  await expect(drawing.locator('[data-seat-id="seat-3"]')).toHaveCount(1);
  for (const label of ["Ausgang", "Bühne", "Sperrfläche", "Hindernis", "Front"]) await expect(drawing.getByText(label)).toBeVisible();
  await expect(output.locator("dd").filter({ hasText: /^3$/ }).first()).toBeVisible();
  await expect(output).toContainText("Planungs-/Referenzprüfung");
  await expect(output.getByRole("button", { name: "Drucken / als PDF speichern" })).toBeVisible();
  await output.getByRole("button", { name: "Zurück zum Editor" }).click();
  await expect(editor.getByRole("button", { name: "Rückgängig" })).toBeDisabled();
  await expect(editor.getByLabel("Aktueller Plan")).toContainText("3 Plätze");
  await expect(editor.getByLabel("Planvarianten").getByText(/Kandidaten mit/)).toHaveCount(0);
});

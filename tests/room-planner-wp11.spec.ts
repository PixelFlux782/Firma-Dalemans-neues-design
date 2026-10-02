import { expect, test } from "@playwright/test";
import { analyzeCurrentPlan } from "../src/lib/room-planner/currentPlanAnalysis";
import { commit, createHistory, redo, undo } from "../src/lib/room-planner/history";
import type { RoomPlan } from "../src/lib/room-planner/objects";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { DEFAULT_SEATING_RULES, type SeatingPlan } from "../src/lib/room-planner/seating";
import { editRow, moveBlock, removeBlock, removeSeat, rotateBlock, rowsOf } from "../src/lib/room-planner/seatingEditing";

function fixture() {
  const points = [[0, 0], [12, 0], [12, 10], [0, 10]].map(([x, y], i) => ({ id: `p${i}`, x, y }));
  const seats = [0, 1, 2].map((index) => ({ id: `seat-${index}`, x: 4 + index * 0.55, y: 4, rotation: 0, row: 1, index }));
  const seating: SeatingPlan = { blocks: [{ id: "block-1", seats, rowCount: 1, seatsPerRow: [3], rotation: 0, rowPitch: 0.85, seatPitch: 0.55, source: "generated" }], seats, totalSeats: 3, totalRows: 1, longestRow: 3, hints: [], rules: { ...DEFAULT_SEATING_RULES }, orientation: "horizontal", rotation: 0 };
  const plan: RoomPlan = { contour: { closed: true, points, walls: points.map((point, i) => ({ id: `w${i}`, startPointId: point.id, endPointId: points[(i + 1) % 4].id })) }, objects: [], seating };
  return { plan, seating };
}

test("Blockbewegung bewahrt IDs, Abstände und Winkel und ist ein Undo-Schritt", () => {
  const { plan, seating } = fixture();
  const moved = moveBlock(plan, seating, "block-1", 1, 0.5).seating;
  expect(moved.blocks[0].id).toBe("block-1");
  expect(moved.seats.map((seat) => seat.id)).toEqual(seating.seats.map((seat) => seat.id));
  expect(moved.seats.map((seat) => seat.rotation)).toEqual([0, 0, 0]);
  expect(moved.seats[1].x - moved.seats[0].x).toBeCloseTo(0.55);
  const history = commit(createHistory(plan), { ...plan, seating: moved });
  expect(history.past).toHaveLength(1);
  expect(undo(history).present.seating).toBe(seating);
  expect(redo(undo(history)).present.seating).toBe(moved);
  expect(moved.blocks[0].edited).toBe(true);
});

test("Blockrotation nutzt Blockmittelpunkt und wird bei Kollision abgelehnt", () => {
  const { plan, seating } = fixture();
  const rotated = rotateBlock(plan, seating, "block-1", 90).seating;
  expect(rotated.blocks[0].id).toBe("block-1");
  expect(rotated.blocks[0].rotation).toBe(90);
  expect(rotated.seats[0].x).toBeCloseTo(rotated.seats[1].x);
  expect(rotated.seats[1].y - rotated.seats[0].y).toBeCloseTo(0.55);
  const blocked = { ...plan, objects: [{ id: "stage", type: "stage" as const, x: 4.55, y: 4.55, width: 1, depth: 1, rotation: 0 }] };
  expect(rotateBlock(blocked, seating, "block-1", 90).seating).toBe(seating);
});

test("Reihen sind deterministisch, Kürzen erhält übrige Sitze und Verlängern nutzt Rasterplätze", () => {
  const { plan, seating } = fixture();
  expect(rowsOf(seating.blocks[0])[0].seats.map((seat) => seat.index)).toEqual([0, 1, 2]);
  const shorter = editRow(plan, seating, "block-1", 1, "right", -2).seating;
  expect(shorter.seats.map((seat) => seat.id)).toEqual(["seat-0"]);
  expect(shorter.totalSeats).toBe(1);
  const longer = editRow(plan, shorter, "block-1", 1, "right", 2).seating;
  expect(longer.seats.map((seat) => seat.index).sort()).toEqual([0, 1, 2]);
  expect(longer.seats[0]).toEqual(shorter.seats[0]);
  expect(longer.totalSeats).toBe(3);
});

test("Reihenverlängerung in Hindernis und Blockbewegung über Raumgrenze werden verhindert", () => {
  const { plan, seating } = fixture();
  const blocked: RoomPlan = { ...plan, objects: [{ id: "obstacle", type: "obstacle", obstacleType: "restricted", x: 5.95, y: 4, width: 0.5, depth: 0.7, rotation: 0 }] };
  expect(editRow(blocked, seating, "block-1", 1, "right", 1).seating).toBe(seating);
  expect(moveBlock(plan, seating, "block-1", -5, 0).seating).toBe(seating);
});

test("Sitz und Block können entfernt werden; Summary und Analyse behalten Änderungen", () => {
  const { plan, seating } = fixture();
  const edited = removeSeat(seating, "seat-1");
  const current = { ...plan, seating: edited };
  const analysis = analyzeCurrentPlan(current, edited, BAVSTAETTV_REFERENCE);
  expect(analysis.summary.seatCount).toBe(2);
  expect(analysis.summary.unreachableSeatCount).toBe(2);
  expect(current.seating.seats.some((seat) => seat.id === "seat-1")).toBe(false);
  expect(removeBlock(edited, "block-1").totalSeats).toBe(0);
});

test("Gangänderung aktualisiert Breite, Kollisionshinweis und Erreichbarkeit ohne Sitze neu zu erzeugen", () => {
  const { plan, seating } = fixture();
  const aisle = { id: "aisle-1", type: "aisle" as const, source: "generated" as const, edited: true, start: { x: 5, y: 1 }, end: { x: 5, y: 9 }, width: 0.5 };
  const changed: RoomPlan = { ...plan, objects: [aisle] };
  const analysis = analyzeCurrentPlan(changed, seating, BAVSTAETTV_REFERENCE);
  expect(analysis.report.checks.find((check) => check.id === "aisle-1-width")?.status).toBe("fail");
  expect(analysis.collisionSeatIds.length).toBeGreaterThan(0);
  expect(analysis.summary.generatedAisleCount).toBe(1);
  expect(analysis.summary.seatCount).toBe(3);
  const removed = analyzeCurrentPlan({ ...changed, objects: [] }, seating, BAVSTAETTV_REFERENCE);
  expect(removed.summary.aisleCount).toBe(0);
  expect(removed.summary.unreachableSeatCount).toBe(3);
});

test("Ältere Pläne ohne gespeicherte Bestuhlung bleiben gültig", () => {
  const { plan } = fixture();
  const older: RoomPlan = { contour: plan.contour, objects: [] };
  expect(older.seating).toBeUndefined();
  expect(JSON.parse(JSON.stringify(older)).objects).toEqual([]);
});

for (const { end, count, indices } of [
  { end: "left" as const, count: -1, indices: [1, 2] },
  { end: "left" as const, count: -2, indices: [2] },
  { end: "right" as const, count: -1, indices: [0, 1] },
  { end: "right" as const, count: -2, indices: [0] },
]) test(`Reihe ${end} um ${count} kürzen bewahrt die richtigen Rasterpositionen`, () => {
  const { plan, seating } = fixture();
  const edited = editRow(plan, seating, "block-1", 1, end, count).seating;
  expect(rowsOf(edited.blocks[0])[0].seats.map((seat) => seat.index)).toEqual(indices);
  expect(edited.blocks[0].edited).toBe(true);
});

for (const end of ["left", "right"] as const) test(`Reihe am ${end} Ende ergänzen vergibt stabile eindeutige Sitz-ID`, () => {
  const { plan, seating } = fixture();
  const edited = editRow(plan, seating, "block-1", 1, end, 1).seating;
  expect(edited.totalSeats).toBe(4);
  expect(new Set(edited.seats.map((seat) => seat.id)).size).toBe(4);
  expect(edited.seats.filter((seat) => seat.id.startsWith("seat-"))).toEqual(seating.seats);
});

for (const { kind, object } of [
  { kind: "Bühne", object: { id: "stage", type: "stage" as const, x: 6.1, y: 4, width: 1, depth: 1, rotation: 0 } },
  { kind: "Sperrfläche", object: { id: "restricted", type: "obstacle" as const, obstacleType: "restricted" as const, x: 6.1, y: 4, width: 1, depth: 1, rotation: 0 } },
  { kind: "Gang", object: { id: "aisle", type: "aisle" as const, start: { x: 6.1, y: 1 }, end: { x: 6.1, y: 9 }, width: 0.8 } },
]) test(`Blockverschiebung in ${kind} wird abgelehnt`, () => {
  const { plan, seating } = fixture();
  expect(moveBlock({ ...plan, objects: [object] }, seating, "block-1", 1, 0).seating).toBe(seating);
});

test("Blockverschiebung in Türfreihaltung wird abgelehnt", () => {
  const { plan, seating } = fixture();
  const withDoor: RoomPlan = { ...plan, objects: [{ id: "door", type: "door", wallId: "w0", offset: 4, width: 1 }] };
  expect(moveBlock(withDoor, seating, "block-1", 0, -3).seating).toBe(seating);
});

test("Reihenverlängerung in Gang wird abgelehnt", () => {
  const { plan, seating } = fixture();
  const withAisle: RoomPlan = { ...plan, objects: [{ id: "aisle", type: "aisle", start: { x: 5.85, y: 1 }, end: { x: 5.85, y: 9 }, width: 0.5 }] };
  expect(editRow(withAisle, seating, "block-1", 1, "right", 1).seating).toBe(seating);
});

test("Reihenverlängerung über Raumkontur wird abgelehnt", () => {
  const { plan, seating } = fixture();
  expect(editRow(plan, seating, "block-1", 1, "right", 20).seating).toBe(seating);
});

test("Löschen eines mittleren Sitzes ändert nicht die Position der Nachbarn", () => {
  const { seating } = fixture();
  const edited = removeSeat(seating, "seat-1");
  expect(edited.seats).toEqual([seating.seats[0], seating.seats[2]]);
  expect(edited.blocks[0].seatsPerRow).toEqual([2]);
});

test("Löschen des letzten Sitzes entfernt den leeren Block", () => {
  const { seating } = fixture();
  const edited = seating.seats.reduce((current, seat) => removeSeat(current, seat.id), seating);
  expect(edited.blocks).toHaveLength(0);
  expect(edited.totalRows).toBe(0);
});

test("Manuelle Sitzänderung übersteht wiederholte Analyse unverändert", () => {
  const { plan, seating } = fixture();
  const edited = removeSeat(seating, "seat-0");
  const current = { ...plan, seating: edited };
  analyzeCurrentPlan(current, edited, BAVSTAETTV_REFERENCE);
  analyzeCurrentPlan(current, edited, BAVSTAETTV_REFERENCE);
  expect(current.seating).toBe(edited);
  expect(current.seating.seats.map((seat) => seat.id)).toEqual(["seat-1", "seat-2"]);
});

test("Gangverschiebung ändert die Kollisionsanalyse ohne Sitzraster neu zu erzeugen", () => {
  const { plan, seating } = fixture();
  const aisle = { id: "aisle", type: "aisle" as const, start: { x: 7, y: 1 }, end: { x: 7, y: 9 }, width: 0.5 };
  const clear = analyzeCurrentPlan({ ...plan, objects: [aisle] }, seating, BAVSTAETTV_REFERENCE);
  const moved = analyzeCurrentPlan({ ...plan, objects: [{ ...aisle, start: { x: 5, y: 1 }, end: { x: 5, y: 9 } }] }, seating, BAVSTAETTV_REFERENCE);
  expect(clear.collisionSeatIds).toHaveLength(0);
  expect(moved.collisionSeatIds.length).toBeGreaterThan(0);
  expect(moved.summary.seatCount).toBe(clear.summary.seatCount);
});

test("Gangbreite wird mit einem Undo-Schritt zurückgesetzt", () => {
  const { plan } = fixture();
  const original: RoomPlan = { ...plan, objects: [{ id: "aisle", type: "aisle", source: "generated", start: { x: 7, y: 1 }, end: { x: 7, y: 9 }, width: 1.2 }] };
  const changed: RoomPlan = { ...original, objects: [{ id: "aisle", type: "aisle", source: "generated", start: { x: 7, y: 1 }, end: { x: 7, y: 9 }, width: 0.5, edited: true }] };
  const history = commit(createHistory(original), changed);
  expect(history.past).toHaveLength(1);
  expect(undo(history).present.objects[0]).toEqual(original.objects[0]);
  expect(redo(undo(history)).present.objects[0]).toEqual(changed.objects[0]);
});

test("Übernommener Block lässt sich auswählen, verschieben, kürzen und rückgängig machen", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  const w = box!.width, h = box!.height, left = w / 2 - 225, top = h / 2 - 180;
  const click = (x: number, y: number) => svg.click({ position: { x, y } });
  await click(left, top); await click(left + 450, top); await click(left + 450, top + 360); await click(left, top + 360); await click(left, top);
  await editor.getByRole("button", { name: "Tür", exact: true }).click();
  await click(left + 45, top);
  await editor.getByLabel("Türrolle").selectOption("exit");
  await editor.getByLabel("Breite (m)", { exact: true }).fill("1.2");
  await editor.getByLabel("Lichte Breite (m)").fill("1.2");
  await editor.getByRole("button", { name: "Gang", exact: true }).click();
  await click(left + 45, top + 32); await click(left + 45, top + 328);
  await editor.getByRole("button", { name: "Planvarianten berechnen" }).click();
  const variants = editor.getByLabel("Planvarianten");
  await expect(variants.getByText(/Kandidaten mit dem gewählten Regelprofil geprüft/)).toBeVisible({ timeout: 30000 });
  for (const name of ["Kapazität", "Ausgewogen", "Komfort"]) {
    await variants.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    if (await variants.getByRole("button", { name: "Diese Variante übernehmen" }).count()) break;
  }
  await variants.getByRole("button", { name: "Diese Variante übernehmen" }).click();
  await editor.getByRole("button", { name: "Auswahl" }).click();
  const block = svg.locator("[data-block-id]").first();
  await block.click({ position: { x: 12, y: 12 } });
  const properties = editor.getByLabel("Eigenschaften");
  await expect(properties.getByText(/Sitzblock block-/)).toBeVisible();
  const before = await editor.getByLabel("Aktueller Plan").innerText();
  const bounds = await block.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.move(bounds!.x + 12, bounds!.y + 12);
  await page.mouse.down(); await page.mouse.move(bounds!.x + 21, bounds!.y + 12); await page.mouse.up();
  await expect(properties.getByText(/bearbeitet/)).toBeVisible();
  await properties.getByRole("button", { name: /Reihe 1 rechts kürzen/ }).click();
  await expect(editor.getByLabel("Aktueller Plan")).not.toHaveText(before);
  await editor.getByRole("button", { name: "Rückgängig" }).click();
  await expect.poll(() => editor.getByLabel("Aktueller Plan").innerText()).toBe(before);
  await block.click({ position: { x: 12, y: 12 } });
  await svg.locator("[data-seat-id]").first().click({ modifiers: ["Alt"] });
  await expect(properties.getByText(/^Sitz seat-/)).toBeVisible();
  await properties.getByRole("button", { name: "Sitz entfernen" }).click();
  await expect(editor.getByLabel("Aktueller Plan")).toContainText("79 Plätze");
  await editor.getByRole("button", { name: "Rückgängig" }).click();
  await expect(editor.getByLabel("Aktueller Plan")).toContainText("80 Plätze");
  const generatedAisle = svg.locator('polygon[data-object-id][fill="#df9a45"]').first();
  await generatedAisle.click();
  await expect(properties.getByText(/Quelle: automatisch/)).toBeVisible();
  await properties.getByLabel("Breite (m)").fill("0.2");
  await properties.getByLabel("Breite (m)").press("Tab");
  await expect(properties.getByText(/bearbeitet/)).toBeVisible();
  await expect(properties.getByText(/rechnerisch erforderlich/).first()).toBeVisible();
  await editor.getByRole("button", { name: "Rückgängig" }).click();
  await generatedAisle.click();
  await expect(properties.getByLabel("Breite (m)")).not.toHaveValue("0.2");
});

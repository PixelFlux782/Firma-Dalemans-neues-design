import { test, expect } from "@playwright/test";
import { createHistory, commit, undo, redo } from "../src/lib/room-planner/history";
import type { RoomPlan } from "../src/lib/room-planner/objects";
import { generateSeatingPlan, type SeatingPlan, type SeatPlacement } from "../src/lib/room-planner/seating";
import { analyzeEgress } from "../src/lib/room-planner/egress/analyzeEgress";
import { evaluateRules } from "../src/lib/room-planner/rules/evaluateRules";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { applyAisleSuggestion, suggestAisles } from "../src/lib/room-planner/suggestions/aisleSuggestions";

const rectangle = (width = 14, height = 8): RoomPlan => {
  const points = [{ id: "a", x: 0, y: 0 }, { id: "b", x: width, y: 0 }, { id: "c", x: width, y: height }, { id: "d", x: 0, y: height }];
  return { contour: { points, closed: true, walls: [
    { id: "top", startPointId: "a", endPointId: "b" }, { id: "right", startPointId: "b", endPointId: "c" },
    { id: "bottom", startPointId: "c", endPointId: "d" }, { id: "left", startPointId: "d", endPointId: "a" },
  ] }, objects: [] };
};
const aisle = (id: string, x: number, y1 = 0.7, y2 = 7.3) => ({ id, type: "aisle" as const, start: { x, y: y1 }, end: { x, y: y2 }, width: 1.2 });
const exit = (id: string, offset: number, clearWidth = 1.2) => ({ id, type: "door" as const, wallId: "top", offset, width: 1.2, role: "exit" as const, clearWidth });
const seat = (id: string, x: number, y: number, index: number): SeatPlacement => ({ id, x, y, row: 0, index, rotation: 0 });
function manualSeating(seats: SeatPlacement[]): SeatingPlan {
  const rules = { ...generateSeatingPlan(rectangle()).rules, rowPitch: 0.95 };
  return { blocks: [{ id: "block-1", seats, rowCount: 1, seatsPerRow: [seats.length] }], seats, totalSeats: seats.length, totalRows: 1, longestRow: seats.length, hints: [], rules, orientation: "horizontal" };
}

test("einseitiger und zweiseitiger Gang verwenden unterschiedliche Sitzgrenzen", () => {
  const seats = Array.from({ length: 16 }, (_, i) => seat(`seat-0-${i}`, 2.15 + i * 0.55, 3, i));
  const one = rectangle(); one.objects.push(aisle("left-aisle", 1.05), exit("exit-left", 0.45));
  const oneSeating = manualSeating(seats);
  const oneEgress = analyzeEgress(one, oneSeating, BAVSTAETTV_REFERENCE);
  expect(oneEgress.rowAccess[0].leftAisleId).toBe("left-aisle");
  expect(evaluateRules(one, oneSeating, oneEgress, BAVSTAETTV_REFERENCE).checks.find((c) => c.ruleId === "row-seats")?.status).toBe("fail");
  const two = { ...one, objects: [...one.objects, aisle("right-aisle", 12.3), exit("exit-right", 11.7)] };
  const twoEgress = analyzeEgress(two, oneSeating, BAVSTAETTV_REFERENCE);
  expect(twoEgress.rowAccess[0].rightAisleId).toBe("right-aisle");
  expect(evaluateRules(two, oneSeating, twoEgress, BAVSTAETTV_REFERENCE).checks.find((c) => c.ruleId === "row-seats")?.status).toBe("pass");
});

test("Rettungsweg folgt dem Gang und wählt deterministisch den näheren Ausgang", () => {
  const plan = rectangle(); plan.objects.push(aisle("aisle", 1.05), exit("exit-near", 0.45), { ...exit("exit-far", 0.45), wallId: "bottom" });
  const seating = manualSeating([seat("seat-0-0", 2.15, 2, 0)]);
  const first = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE);
  const second = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE);
  expect(first).toEqual(second);
  expect(first.routes[0].valid).toBe(true);
  expect(first.routes[0].exitDoorId).toBe("exit-near");
  expect(first.routes[0].distance).toBeGreaterThan(Math.hypot(2.15 - 1.05, 2));
  const noExit = { ...plan, objects: plan.objects.filter((object) => object.type !== "door") };
  expect(analyzeEgress(noExit, seating, BAVSTAETTV_REFERENCE).seatsWithoutRoute).toBe(1);
});

test("L-förmiger Gang ergibt längere Lauflinie als die Luftlinie", () => {
  const plan = rectangle();
  plan.objects.push(aisle("vertical", 1.05, 0.7, 6), { id: "horizontal", type: "aisle", start: { x: 1.05, y: 6 }, end: { x: 13.3, y: 6 }, width: 1.2 }, { ...exit("far-exit", 5.4), wallId: "right" });
  const seating = manualSeating([seat("seat-0-0", 2.15, 2, 0)]);
  const route = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE).routes[0];
  expect(route.valid).toBe(true);
  expect(route.distance).toBeGreaterThan(16);
  expect(route.distance).toBeGreaterThan(Math.hypot(14 - 2.15, 6 - 2));
  expect(route.path.some((p) => Math.abs(p.x - 1.05) < 0.01 && Math.abs(p.y - 6) < 0.01)).toBe(true);
});

test("Blockreihen und Ausgangslast werden anhand des Profils bewertet", () => {
  const seating = manualSeating([seat("seat-0-0", 2.15, 2, 0)]);
  seating.blocks[0].rowCount = 31;
  const plan = rectangle(); plan.objects.push(aisle("aisle", 1.05), exit("exit", 0.45, 0.8));
  const egress = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE);
  const report = evaluateRules(plan, seating, egress, BAVSTAETTV_REFERENCE);
  expect(report.checks.find((c) => c.ruleId === "block-rows")?.status).toBe("fail");
  expect(egress.exitLoads[0].persons).toBe(1);
  expect(egress.exitLoads[0].requiredWidth).toBe(1.2);
  expect(report.checks.find((c) => c.ruleId === "exit-capacity")?.status).toBe("fail");
});

test("Gang- und Ausgangsbreite steigen mit der zugeordneten Personenzahl", () => {
  const plan = rectangle(20, 20); plan.objects.push(aisle("aisle", 1.05, 0.7, 19.3), exit("exit", 0.45));
  const seating = generateSeatingPlan(plan);
  const egress = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE);
  expect(egress.exitLoads[0].persons).toBeGreaterThan(200);
  expect(egress.exitLoads[0].requiredWidth).toBe(2.4);
  expect(egress.aisleLoads[0].requiredWidth).toBe(2.4);
  expect(evaluateRules(plan, seating, egress, BAVSTAETTV_REFERENCE).checks.find((check) => check.ruleId === "aisle-width")?.status).toBe("fail");
});

test("Gangvorschlag meidet Hindernisse und Übernahme ist rückgängig", () => {
  const plan = rectangle(16, 8);
  plan.objects.push(exit("exit", 0.45));
  const seating = generateSeatingPlan(plan);
  const egress = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE);
  const report = evaluateRules(plan, seating, egress, BAVSTAETTV_REFERENCE);
  const suggestions = suggestAisles(plan, seating, BAVSTAETTV_REFERENCE, egress, report);
  expect(suggestions.length).toBeGreaterThan(0);
  expect(suggestions).toEqual(suggestAisles(plan, seating, BAVSTAETTV_REFERENCE, egress, report));
  const next = applyAisleSuggestion(plan, suggestions[0], "new-aisle");
  expect(next.objects.at(-1)?.type).toBe("aisle");
  const nextSeating = generateSeatingPlan(next);
  expect(analyzeEgress(next, nextSeating, BAVSTAETTV_REFERENCE).routes.some((route) => route.valid && route.aisleId === "new-aisle")).toBe(true);
  const history = commit(createHistory(plan), next);
  expect(undo(history).present).toBe(plan);
  expect(redo(undo(history)).present).toBe(next);
  const blocked = { ...plan, objects: [...plan.objects, { id: "obstacle", type: "obstacle" as const, obstacleType: "column" as const, x: (suggestions[0].start.x + suggestions[0].end.x) / 2, y: (suggestions[0].start.y + suggestions[0].end.y) / 2, width: 1.5, depth: 1.5, rotation: 0 }] };
  const blockedSeating = generateSeatingPlan(blocked);
  const blockedEgress = analyzeEgress(blocked, blockedSeating, BAVSTAETTV_REFERENCE);
  const blockedReport = evaluateRules(blocked, blockedSeating, blockedEgress, BAVSTAETTV_REFERENCE);
  expect(suggestAisles(blocked, blockedSeating, BAVSTAETTV_REFERENCE, blockedEgress, blockedReport).some((s) => s.start.x === suggestions[0].start.x && s.end.x === suggestions[0].end.x && s.start.y === suggestions[0].start.y && s.end.y === suggestions[0].end.y)).toBe(false);
});

test("größerer Raum bleibt bei der Analyse interaktiv", () => {
  const plan = rectangle(20, 20);
  plan.objects.push(exit("exit", 0.45));
  const seating = generateSeatingPlan(plan);
  expect(seating.totalSeats).toBeGreaterThanOrEqual(100);
  const started = performance.now();
  const egress = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE);
  const report = evaluateRules(plan, seating, egress, BAVSTAETTV_REFERENCE);
  suggestAisles(plan, seating, BAVSTAETTV_REFERENCE, egress, report);
  expect(performance.now() - started).toBeLessThan(5000);
});

test("Editor zeigt Profil, Ausgangsrolle und Prüfbericht", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await expect(editor.getByLabel("Regelprofil", { exact: true })).toHaveValue("bavstaettv-reference");
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  const click = async (x: number, y: number) => svg.click({ position: { x, y } });
  const w = box!.width, h = box!.height;
  await click(w / 2 - 180, h / 2 - 135);
  await click(w / 2 + 180, h / 2 - 135);
  await click(w / 2 + 180, h / 2 + 135);
  await click(w / 2 - 180, h / 2 + 135);
  await click(w / 2 - 180, h / 2 - 135);
  await editor.getByRole("button", { name: "Tür", exact: true }).click();
  await click(w / 2, h / 2 - 135);
  await editor.getByLabel("Türrolle").selectOption("exit");
  await expect(editor.getByLabel("Lichte Breite (m)")).toBeVisible();
  await editor.getByRole("button", { name: "Bestuhlung berechnen" }).click();
  await expect(editor.getByLabel("Prüfergebnisse")).toBeVisible();
  await expect(editor.getByText("Rettungswege", { exact: true })).toBeVisible();
});

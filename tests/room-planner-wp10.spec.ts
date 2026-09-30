import { expect, test } from "@playwright/test";
import { analyzeEgress } from "../src/lib/room-planner/egress/analyzeEgress";
import { commit, createHistory, undo } from "../src/lib/room-planner/history";
import type { RoomPlan } from "../src/lib/room-planner/objects";
import { evaluateRules } from "../src/lib/room-planner/rules/evaluateRules";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { generateSeatingPlan } from "../src/lib/room-planner/seating";
import { compareVariants, nearDuplicate } from "../src/lib/room-planner/variantComparison";
import { createVariantSummary, planFingerprint } from "../src/lib/room-planner/variantSummary";
import { generatePlanVariants } from "../src/lib/room-planner/variants";

function room(): RoomPlan {
  const points = [[0, 0], [12, 0], [12, 10], [0, 10]].map(([x, y], i) => ({ id: `p${i}`, x, y }));
  return { contour: { closed: true, points, walls: points.map((point, i) => ({ id: `w${i}`, startPointId: point.id, endPointId: points[(i + 1) % 4].id })) }, objects: [] };
}
function summary(plan: RoomPlan) {
  const seating = generateSeatingPlan(plan);
  const analysis = analyzeEgress(plan, seating, BAVSTAETTV_REFERENCE);
  return { seating, analysis, value: createVariantSummary(plan, seating, analysis, evaluateRules(plan, seating, analysis, BAVSTAETTV_REFERENCE)) };
}

test("Summary trennt Gangquellen und erklärt Erreichbarkeit, Regeln und Ausgänge", () => {
  const plan = room();
  plan.objects.push({ id: "manual", type: "aisle", start: { x: 4, y: 0.7 }, end: { x: 4, y: 9.3 }, width: 1.2 },
    { id: "generated", type: "aisle", source: "generated", start: { x: 8, y: 0.7 }, end: { x: 8, y: 9.3 }, width: 1.2 });
  const before = summary(plan);
  expect(before.value.seatCount).toBe(before.seating.totalSeats);
  expect(before.value.blockCount).toBe(before.seating.blocks.length);
  expect(before.value.manualAisleCount).toBe(1);
  expect(before.value.generatedAisleCount).toBe(1);
  expect(before.value.unreachableSeatCount).toBe(before.seating.totalSeats);
  expect(before.value.reachableSeatCount).toBe(0);
  expect(before.value.errors.length).toBeGreaterThan(0);
  expect(before.value.maxEgressDistance).toBeUndefined();
  plan.objects.push({ id: "exit-1", type: "door", wallId: "w0", offset: 3.5, width: 1, role: "exit", clearWidth: 1 },
    { id: "exit-2", type: "door", wallId: "w0", offset: 7.5, width: 1, role: "emergency_exit", clearWidth: 1 });
  const after = summary(plan);
  expect(after.value.exitCount).toBe(2);
  expect(after.value.usedExitCount).toBe(after.analysis.exitLoads.filter((load) => load.persons > 0).length);
  expect(after.value.reachableSeatCount + after.value.unreachableSeatCount).toBe(after.value.seatCount);
  expect(after.value.maxEgressDistance).toBeCloseTo(after.analysis.longestValidRoute, 2);
  expect(after.value.warnings.length).toBe(after.value.warnings.filter((item) => item.category === "warning").length);
});

test("Vergleich und Ähnlichkeit beruhen auf konkreten Messwerten", () => {
  const base = summary(room()).value;
  const current = { ...base, seatCount: base.seatCount + 14, blockCount: base.blockCount + 1, aisleArea: base.aisleArea + 4.2, maxEgressDistance: 18.4 };
  expect(compareVariants(base, current)).toContainEqual({ label: "Sitzplätze", value: 14, unit: "count" });
  expect(compareVariants(base, current)).toContainEqual({ label: "Gangfläche", value: 4.2, unit: "squareMetres" });
  expect(nearDuplicate(base, { ...base }, 0, 0)).toBe(true);
  expect(nearDuplicate(base, current, 0, 0)).toBe(false);
});

test("Plan-Fingerprint ignoriert gleiche Daten und erkennt relevante Änderungen; Preview bleibt ohne History-Eintrag", () => {
  const plan = room();
  const fingerprint = planFingerprint(plan);
  expect(planFingerprint({ ...plan, objects: [...plan.objects] })).toBe(fingerprint);
  expect(planFingerprint({ ...plan, objects: [{ id: "generated", type: "aisle", source: "generated", start: { x: 3, y: 1 }, end: { x: 3, y: 8 }, width: 1 }] })).toBe(fingerprint);
  const changed = { ...plan, contour: { ...plan.contour, points: plan.contour.points.map((point, i) => i === 0 ? { ...point, x: 0.5 } : point) } };
  expect(planFingerprint(changed)).not.toBe(fingerprint);
  const history = createHistory(plan);
  const preview = generateSeatingPlan(plan);
  expect(preview.totalSeats).toBeGreaterThan(0);
  expect(history.present).toBe(plan);
  expect(history.past).toHaveLength(0);
  const adopted = commit(history, changed);
  expect(adopted.past).toHaveLength(1);
  expect(undo(adopted).present).toBe(plan);
});

test("Varianten sind begrenzt, eindeutig und enthalten bereits berechnete Summaries", () => {
  const plan = room();
  plan.objects.push({ id: "exit", type: "door", wallId: "w0", offset: 5.5, width: 1, role: "exit", clearWidth: 1 });
  const result = generatePlanVariants(plan, undefined, BAVSTAETTV_REFERENCE);
  expect(result.evaluatedCandidates).toBeLessThanOrEqual(48);
  expect(result.variants.length).toBeLessThanOrEqual(5);
  for (const variant of result.variants) expect(variant.summary.seatCount).toBe(variant.seatingPlan.totalSeats);
  for (let i = 0; i < result.variants.length; i++) for (let j = i + 1; j < result.variants.length; j++) {
    const a = result.variants[i], b = result.variants[j];
    expect(nearDuplicate(a.summary, b.summary, a.seatingPlan.rotation ?? 0, b.seatingPlan.rotation ?? 0)).toBe(false);
  }
  expect(generatePlanVariants({ ...room(), contour: { ...room().contour, closed: false } }, undefined, BAVSTAETTV_REFERENCE).variants).toHaveLength(0);
});

test("Editor-Vorschau schreibt keinen Plan und Planänderungen markieren Varianten als veraltet", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  const left = box!.width / 2 - 160, top = box!.height / 2 - 130;
  const click = (x: number, y: number) => svg.click({ position: { x, y } });
  await click(left, top); await click(left + 320, top); await click(left + 320, top + 260); await click(left, top + 260); await click(left, top);
  const variants = editor.getByLabel("Planvarianten");
  await variants.getByRole("button", { name: "Planvarianten berechnen" }).click();
  await expect(variants.getByText(/Kandidaten mit dem gewählten Regelprofil geprüft/)).toBeVisible({ timeout: 30000 });
  await expect(variants.getByText(/Sitze erreichen einen Ausgang|Sitzen ohne Weg/).first()).toBeVisible();
  await editor.getByRole("button", { name: "Rückgängig" }).click();
  await expect(variants.getByText(/Varianten sind nach einer Plan- oder Einstellungsänderung veraltet/)).toBeVisible();
  await expect(editor.getByRole("button", { name: "Planvarianten berechnen" })).toBeDisabled();
});

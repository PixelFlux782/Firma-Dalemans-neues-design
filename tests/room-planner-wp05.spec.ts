import { test, expect } from "@playwright/test";
import type { RoomPlan } from "../src/lib/room-planner/objects";
import { DEFAULT_SEATING_RULES, generateSeatingPlan } from "../src/lib/room-planner/seating";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { generatePlanVariants } from "../src/lib/room-planner/variants";
import { commit, createHistory, undo } from "../src/lib/room-planner/history";

function room(): RoomPlan {
  const points = [{ id: "a", x: 0, y: 0 }, { id: "b", x: 10, y: 0 }, { id: "c", x: 10, y: 8 }, { id: "d", x: 0, y: 8 }];
  return { contour: { points, closed: true, walls: [
    { id: "top", startPointId: "a", endPointId: "b" }, { id: "right", startPointId: "b", endPointId: "c" },
    { id: "bottom", startPointId: "c", endPointId: "d" }, { id: "left", startPointId: "d", endPointId: "a" },
  ] }, objects: [
    { id: "manual-aisle", type: "aisle", start: { x: 1, y: 0.7 }, end: { x: 1, y: 7.3 }, width: 1.2 },
    { id: "exit", type: "door", wallId: "top", offset: 0.4, width: 1.2, role: "exit", clearWidth: 1.2 },
  ] };
}

test("Rasteroffset verschiebt Sitzkoordinaten deterministisch", () => {
  const plan = room();
  const first = generateSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal", { along: 0, cross: 0 });
  const shifted = generateSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal", { along: 0.5, cross: 0.5 });
  expect(shifted.seats[0]?.x).not.toBe(first.seats[0]?.x);
  expect(generateSeatingPlan(plan, DEFAULT_SEATING_RULES, "horizontal", { along: 0.5, cross: 0.5 })).toEqual(shifted);
});

test("Varianten sind begrenzt, reproduzierbar und bewahren Benutzervorgaben", () => {
  const plan = room();
  const config = { maximumCandidatePlans: 18, maximumGeneratedAisles: 3, gridOffsets: [0, 0.25, 0.5, 0.75] };
  const first = generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE, "automatic", config);
  const second = generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE, "automatic", config);
  const full = generatePlanVariants(plan, DEFAULT_SEATING_RULES, BAVSTAETTV_REFERENCE);
  expect(full.variants.map((variant) => variant.profileId)).toEqual(["capacity", "balanced", "comfort"]);
  expect(full.variants.some((variant) => variant.feasible)).toBe(true);
  expect(new Set(full.variants.map((variant) => JSON.stringify(variant.seatingPlan.seats.map((seat) => [seat.x, seat.y])))).size).toBe(3);
  expect(first).toEqual(second);
  expect(first.evaluatedCandidates).toBeLessThanOrEqual(config.maximumCandidatePlans);
  for (const variant of [...first.variants, ...(first.fallback ? [first.fallback] : [])]) {
    expect(variant.plan.contour).toBe(plan.contour);
    expect(variant.plan.objects.slice(0, plan.objects.length)).toEqual(plan.objects);
    expect(variant.seatingPlan.rules.rowPitch + 1e-7).toBeGreaterThanOrEqual(variant.seatingPlan.rules.chairDepth + BAVSTAETTV_REFERENCE.seating.minimumClearRowPassage!);
    expect(variant.report.counts.fail === 0 && variant.analysis.seatsWithoutRoute === 0).toBe(variant.feasible);
  }
  expect(plan.objects).toHaveLength(2);
  if (first.variants.length) {
    const adopted = { ...first.variants[0].plan };
    expect(undo(commit(createHistory(plan), adopted)).present).toBe(plan);
  }
});

test("Editor zeigt bei fehlendem Ausgang eine technische Annäherung ohne Übernahme", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  const click = (x: number, y: number) => svg.click({ position: { x, y } });
  const w = box!.width, h = box!.height;
  await click(w / 2 - 160, h / 2 - 120);
  await click(w / 2 + 160, h / 2 - 120);
  await click(w / 2 + 160, h / 2 + 120);
  await click(w / 2 - 160, h / 2 + 120);
  await click(w / 2 - 160, h / 2 - 120);
  await editor.getByRole("button", { name: "Planvarianten berechnen" }).click();
  await expect(editor.getByText("Keine Variante ohne technische Regelabweichung gefunden.", { exact: false })).toBeVisible();
  await expect(editor.getByText(/Beste Annäherung · technische Annäherung/)).toBeVisible();
  await expect(editor.getByRole("button", { name: "Diese Variante übernehmen" })).toHaveCount(0);
  await expect(editor.getByRole("button", { name: "Rückgängig" })).toBeEnabled();
});

test("Variantenübernahme und Undo stellen Bestuhlungsparameter gemeinsam wieder her", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  const click = (x: number, y: number) => svg.click({ position: { x, y } });
  const w = box!.width, h = box!.height;
  const left = w / 2 - 225, top = h / 2 - 180;
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
  await expect(variants.getByText("Vergleich", { exact: true })).toBeVisible({ timeout: 30000 });
  for (const name of ["Kapazität", "Ausgewogen", "Komfort"]) {
    const card = variants.getByRole("button", { name: new RegExp(`^${name}`) });
    await card.click();
    if (await variants.getByRole("button", { name: "Diese Variante übernehmen" }).count()) break;
  }
  await expect(variants.getByRole("button", { name: "Diese Variante übernehmen" })).toBeVisible();
  await variants.getByRole("button", { name: "Diese Variante übernehmen" }).click();
  await expect(editor.getByLabel("Reihenabstand in Metern")).not.toHaveValue("0.85");
  await editor.getByRole("button", { name: "Rückgängig" }).click();
  await expect(editor.getByLabel("Reihenabstand in Metern")).toHaveValue("0.85");
  await editor.getByRole("button", { name: "Wiederholen" }).click();
  await expect(editor.getByLabel("Reihenabstand in Metern")).not.toHaveValue("0.85");
});

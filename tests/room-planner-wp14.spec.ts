import { expect, test } from "@playwright/test";
import { calculatePlanDemand, changeChairSelection, chairProducts, DEFAULT_CHAIR_SELECTION } from "../src/lib/room-planner/chairSelection";
import { createProject, parseProject } from "../src/lib/room-planner/projects";
import { createHistory, commit, redo, undo } from "../src/lib/room-planner/history";
import { DEFAULT_SEATING_RULES } from "../src/lib/room-planner/seating";
import type { RoomPlan } from "../src/lib/room-planner/objects";

const plan = (): RoomPlan => {
  const seats = [0, 1, 2].map((index) => ({ id: `seat-${index}`, x: index, y: 1, row: 0, index, rotation: 0 }));
  return { contour: { points: [], walls: [], closed: false }, objects: [], seating: { blocks: [{ id: "block-1", seats, rowCount: 1, seatsPerRow: [3] }], seats, totalSeats: 3, totalRows: 1, longestRow: 3, hints: [], orientation: "horizontal", rules: { ...DEFAULT_SEATING_RULES } } };
};

test("WP14 selection maps to real shop variant and survives serialization", () => {
  const product = chairProducts[1], variant = product.variants[2];
  const selected = changeChairSelection(plan(), { productId: product.id, variantId: variant.id, width: .53, depth: .58 });
  const loaded = parseProject(JSON.stringify(createProject("Test", { ...selected, seating: undefined })));
  expect(loaded.plan.chairSelection).toEqual(selected.chairSelection);
  expect(calculatePlanDemand(loaded.plan).variant?.id).toBe(variant.id);
  const legacy = parseProject(JSON.stringify(createProject("Alt", { ...selected, chairSelection: undefined, seating: undefined })));
  expect(legacy.plan.chairSelection).toEqual(DEFAULT_CHAIR_SELECTION);
});

test("WP14 change preserves seats, updates geometry, and is one undo step", () => {
  const original = plan();
  const changed = changeChairSelection(original, { ...DEFAULT_CHAIR_SELECTION, width: .61, depth: .7 });
  const history = commit(createHistory(original), changed);
  expect(changed.seating?.seats).toEqual(original.seating?.seats);
  expect(changed.seating?.rules.chairWidth).toBe(.61);
  expect(changed.seating?.rules.chairDepth).toBe(.7);
  expect(undo(history).present).toBe(original);
  expect(redo(undo(history)).present).toBe(changed);
});

test("WP14 demand follows manual seat edits", () => {
  const current = plan();
  expect(calculatePlanDemand(current).quantity).toBe(3);
  current.seating!.blocks[0].seats.pop();
  expect(calculatePlanDemand(current).quantity).toBe(2);
  current.seating!.blocks[0].seats.push({ id: "added", x: 4, y: 1, row: 0, index: 3, rotation: 0 });
  expect(calculatePlanDemand(current).quantity).toBe(3);
});

test("WP14 editor preserves model changes in undo and prints current demand", async ({ page }) => {
  const points = [[0, 0], [12, 0], [12, 10], [0, 10]].map(([x, y], index) => ({ id: `point-${index}`, x, y }));
  const current = plan();
  current.contour = { closed: true, points, walls: points.map((point, index) => ({ id: `wall-${index}`, startPointId: point.id, endPointId: points[(index + 1) % 4].id })) };
  current.chairSelection = DEFAULT_CHAIR_SELECTION;
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  await editor.getByLabel("Projektverwaltung").getByLabel("Projektdatei importieren").setInputFiles({ name: "wp14.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(createProject("WP14", current))) });
  const selected = chairProducts[1];
  await editor.getByLabel("Stuhlmodell").selectOption(selected.id);
  await expect(editor.getByLabel("Bedarf")).toContainText(selected.title);
  await expect(editor.getByLabel("Bedarf")).toContainText(/3 St.hle/);
  await editor.getByRole("button", { name: /R.ckg.ngig/ }).click();
  await expect(editor.getByLabel("Stuhlmodell")).toHaveValue(DEFAULT_CHAIR_SELECTION.productId);
  await editor.getByRole("button", { name: "Wiederholen" }).click();
  await expect(editor.getByLabel("Stuhlmodell")).toHaveValue(selected.id);
  await editor.getByRole("button", { name: "Plan ausgeben" }).click();
  const output = page.getByRole("region", { name: "Plan-Ausgabe" });
  await expect(output).toContainText(selected.title);
  await expect(output).toContainText(/Ben.tigte St.hle/);
  await expect(output).toContainText("Planungsannahme");
});

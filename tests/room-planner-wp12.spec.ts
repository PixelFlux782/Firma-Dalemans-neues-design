import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { analyzeCurrentPlan } from "../src/lib/room-planner/currentPlanAnalysis";
import { createHistory, commit, undo } from "../src/lib/room-planner/history";
import type { RoomPlan } from "../src/lib/room-planner/objects";
import { createProject, defaultPlannerSettings, normalizeProject, parseProject, parseProjectStore, projectFileName, PROJECT_SCHEMA_VERSION } from "../src/lib/room-planner/projects";
import { BAVSTAETTV_REFERENCE } from "../src/lib/room-planner/rules/profiles";
import { DEFAULT_SEATING_RULES, type SeatingPlan } from "../src/lib/room-planner/seating";
import { editRow, moveBlock, removeSeat, rotateBlock } from "../src/lib/room-planner/seatingEditing";

function fixture() {
  const points = [[0, 0], [12, 0], [12, 10], [0, 10]].map(([x, y], index) => ({ id: `point-${index + 1}`, x, y }));
  const seats = [0, 1, 2].map((index) => ({ id: `seat-${index}`, x: 4 + index * 0.55, y: 4, rotation: 0, row: 1, index }));
  const seating: SeatingPlan = { blocks: [{ id: "block-1", seats, rowCount: 1, seatsPerRow: [3], rotation: 0, source: "generated", seatPitch: 0.55 }], seats, totalSeats: 3, totalRows: 1, longestRow: 3, hints: [], rules: { ...DEFAULT_SEATING_RULES }, orientation: "horizontal" };
  const plan: RoomPlan = { contour: { closed: true, points, walls: points.map((point, index) => ({ id: `wall-${index}`, startPointId: point.id, endPointId: points[(index + 1) % points.length].id })) }, objects: [], seating };
  return plan;
}
const roundTrip = (plan: RoomPlan) => parseProject(JSON.stringify(createProject("Saal A", plan)));

test("Projekt wird mit Version, Metadaten und vollständigem Plan serialisiert und geladen", () => {
  const original = createProject("Saal A", fixture());
  const loaded = parseProject(JSON.stringify(original));
  expect(loaded.id).toBe(original.id);
  expect(loaded.schemaVersion).toBe(PROJECT_SCHEMA_VERSION);
  expect(loaded.plan.contour).toEqual(original.plan.contour);
  expect(loaded.plan.seating?.totalSeats).toBe(3);
});

test("Entfernter Sitz bleibt nach dem Laden entfernt", () => {
  const plan = fixture();
  plan.seating = removeSeat(plan.seating!, "seat-1");
  expect(roundTrip(plan).plan.seating?.seats.map((seat) => seat.id)).toEqual(["seat-0", "seat-2"]);
});

test("Ergänzter Sitz bleibt nach dem Laden erhalten", () => {
  const plan = fixture();
  plan.seating = editRow(plan, plan.seating!, "block-1", 1, "right", 1).seating;
  expect(roundTrip(plan).plan.seating?.totalSeats).toBe(4);
  expect(roundTrip(plan).plan.seating?.seats.some((seat) => seat.index === 3)).toBe(true);
});

test("Verschobener und gedrehter Block behält Lage, Winkel und ID", () => {
  const plan = fixture();
  plan.seating = moveBlock(plan, plan.seating!, "block-1", 1, 0).seating;
  plan.seating = rotateBlock(plan, plan.seating!, "block-1", 90).seating;
  const loaded = roundTrip(plan).plan.seating!;
  expect(loaded.blocks[0].id).toBe("block-1");
  expect(loaded.blocks[0].rotation).toBe(90);
  expect(loaded.blocks[0].edited).toBe(true);
  expect(loaded.seats[0].x).toBeCloseTo(plan.seating.seats[0].x);
});

test("Bearbeiteter generierter Gang bleibt bearbeitet und maßhaltig", () => {
  const plan = fixture();
  plan.objects.push({ id: "aisle-1", type: "aisle", source: "generated", edited: true, start: { x: 7, y: 1 }, end: { x: 7, y: 9 }, width: 0.8 });
  expect(roundTrip(plan).plan.objects[0]).toEqual(plan.objects[0]);
});

test("Türen, Hindernis, Bühne, Front und Sperrfläche bleiben erhalten", () => {
  const plan = fixture();
  plan.objects.push(
    { id: "door-1", type: "door", wallId: "wall-0", offset: 5, width: 1.2, role: "exit", clearWidth: 1.1 },
    { id: "obstacle-1", type: "obstacle", obstacleType: "column", x: 2, y: 2, width: 0.5, depth: 0.5, rotation: 0 },
    { id: "stage-1", type: "stage", x: 6, y: 8, width: 2, depth: 1, rotation: 0 },
    { id: "front-1", type: "front", x: 6, y: 7, width: 3, rotation: 0 },
    { id: "restricted-1", type: "reservedArea", x: 10, y: 8, width: 1, depth: 1, rotation: 0 },
  );
  expect(roundTrip(plan).plan.objects).toEqual(plan.objects);
});

test("Regelrelevante Einstellungen bleiben erhalten", () => {
  const settings = { ...defaultPlannerSettings(), profileId: BAVSTAETTV_REFERENCE.id, orientation: "vertical" as const, gridOffset: { along: 0.25, cross: 0.5 }, seatingRules: { ...DEFAULT_SEATING_RULES, minimumSideClearance: 0, rowPitch: 1.1 } };
  const loaded = parseProject(JSON.stringify(createProject("Einstellungen", fixture(), settings)));
  expect(loaded.settings).toEqual(settings);
});

test("Ältere Version ohne Einstellungen erhält Defaults", () => {
  const legacy = { ...createProject("Alt", fixture()), schemaVersion: 0, settings: undefined };
  const loaded = normalizeProject(legacy);
  expect(loaded.schemaVersion).toBe(PROJECT_SCHEMA_VERSION);
  expect(loaded.settings).toEqual(defaultPlannerSettings());
});

test("Älterer Raumplan ohne Sitzmodell bleibt ladbar", () => {
  const source = fixture();
  const legacy = createProject("Grundriss", { contour: source.contour, objects: [] });
  expect(parseProject(JSON.stringify(legacy)).plan.seating).toBeUndefined();
});

test("Ungültiges JSON wird ohne Planänderung abgelehnt", () => {
  const original = fixture();
  expect(() => parseProject("{kaputt")).toThrow(/gültiges JSON/);
  expect(original.seating?.totalSeats).toBe(3);
});

test("Unbekannte Version und fehlender Plan werden abgelehnt", () => {
  const project = createProject("Saal", fixture());
  expect(() => normalizeProject({ ...project, schemaVersion: 99 })).toThrow(/Projektversion/);
  expect(() => normalizeProject({ ...project, plan: undefined })).toThrow(/Raumplan/);
});

test("Beschädigte Sitzdaten und Objektbezüge werden abgelehnt", () => {
  const project = createProject("Saal", fixture());
  const corruptSeat = structuredClone(project);
  corruptSeat.plan.seating!.blocks[0].seats[0].x = Number.NaN;
  expect(() => normalizeProject(corruptSeat)).toThrow(/Sitzplatz/);
  const corruptDoor = structuredClone(project);
  corruptDoor.plan.objects.push({ id: "door", type: "door", wallId: "missing", offset: 1, width: 1 });
  expect(() => normalizeProject(corruptDoor)).toThrow(/Objektbezüge/);
});

test("Lokaler Projektspeicher erhält aktive Auswahl und mehrere Projekte", () => {
  const first = createProject("Erster", fixture()), second = createProject("Zweiter");
  const store = parseProjectStore(JSON.stringify({ schemaVersion: PROJECT_SCHEMA_VERSION, activeProjectId: second.id, projects: [first, second] }));
  expect(store.projects.map((project) => project.name)).toEqual(["Erster", "Zweiter"]);
  expect(store.activeProjectId).toBe(second.id);
  expect(() => parseProjectStore("kein JSON")).toThrow();
});

test("Geladener Plan kann analysiert werden, ohne Sitze neu zu generieren", () => {
  const plan = fixture();
  plan.seating = removeSeat(plan.seating!, "seat-0");
  const loaded = roundTrip(plan).plan;
  const analyzed = analyzeCurrentPlan(loaded, loaded.seating!, BAVSTAETTV_REFERENCE);
  expect(analyzed.summary.seatCount).toBe(2);
  expect(loaded.seating?.seats.map((seat) => seat.id)).toEqual(["seat-1", "seat-2"]);
});

test("Neues Projekt startet mit eigener Undo-History", () => {
  const first = fixture();
  const changed = { ...first, objects: [{ id: "aisle", type: "aisle" as const, start: { x: 8, y: 1 }, end: { x: 8, y: 9 }, width: 1 }] };
  const oldHistory = commit(createHistory(first), changed);
  const loaded = roundTrip(fixture()).plan;
  const freshHistory = createHistory(loaded);
  expect(oldHistory.past).toHaveLength(1);
  expect(freshHistory.past).toHaveLength(0);
  expect(undo(freshHistory).present).toBe(loaded);
});

test("Export-Dateiname ist für JSON-Downloads geeignet", () => {
  expect(projectFileName("Saal / Entwurf 1")).toBe("Saal-Entwurf-1.json");
});

test("Browser speichert und lädt den Raum nach Neuladen ohne alte Undo-History", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const projects = editor.getByLabel("Projektverwaltung");
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  const box = await svg.boundingBox(); expect(box).toBeTruthy();
  const left = box!.width / 2 - 100, top = box!.height / 2 - 80;
  for (const [x, y] of [[left, top], [left + 200, top], [left + 200, top + 160], [left, top + 160], [left, top]]) await svg.click({ position: { x, y } });
  await projects.getByRole("button", { name: "Speichern", exact: true }).click();
  await expect(projects.getByRole("status")).toHaveText("Gespeichert");
  await page.reload();
  await expect(editor.getByText(/Raumfläche:/)).toBeVisible();
  await expect(editor.getByRole("button", { name: "Rückgängig" })).toBeDisabled();
  await projects.getByRole("button", { name: "Neues Projekt" }).click();
  await expect(editor.getByText("Raumgrundriss zeichnen")).toBeVisible();
  await projects.getByText(/Gespeicherte Projekte/).click();
  await projects.getByRole("button", { name: "Öffnen" }).first().click();
  await expect(editor.getByText(/Raumfläche:/)).toBeVisible();
});

test("Autosave sichert abgeschlossene Änderungen ohne zusätzlichen Undo-Schritt", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const projects = editor.getByLabel("Projektverwaltung");
  const svg = editor.getByRole("img", { name: "Grundriss Zeichenfläche" });
  const box = await svg.boundingBox(); expect(box).toBeTruthy();
  await svg.click({ position: { x: box!.width / 2 - 80, y: box!.height / 2 - 60 } });
  await expect(projects.getByRole("status")).toHaveText("Ungespeicherte Änderungen");
  await expect(projects.getByRole("status")).toHaveText("Gespeichert", { timeout: 10000 });
  await page.reload();
  await expect(editor.getByText("1 Eckpunkte")).toBeVisible();
  await expect(editor.getByRole("button", { name: "Rückgängig" })).toBeDisabled();
});

test("Speichern unter, Umbenennen, Duplizieren, Export und Import verwalten Projekte", async ({ page }) => {
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const projects = editor.getByLabel("Projektverwaltung");
  page.once("dialog", (dialog) => dialog.accept("Saal B"));
  await projects.getByRole("button", { name: "Speichern unter" }).click();
  await expect(projects.getByText("Saal B", { exact: true }).first()).toBeVisible();
  await projects.getByText(/Gespeicherte Projekte/).click();
  const activeRow = projects.locator("div.flex.flex-wrap.items-center.gap-2.rounded").filter({ hasText: "Saal B · geöffnet" });
  page.once("dialog", (dialog) => dialog.accept("Saal C"));
  await activeRow.getByRole("button", { name: "Umbenennen" }).click();
  await expect(projects.getByText("Saal C", { exact: true }).first()).toBeVisible();
  await projects.locator("div.flex.flex-wrap.items-center.gap-2.rounded").filter({ hasText: "Saal C · geöffnet" }).getByRole("button", { name: "Duplizieren" }).click();
  await expect(projects.getByText("Gespeicherte Projekte (3)")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await projects.getByRole("button", { name: "JSON exportieren" }).click();
  const download = await downloadPromise;
  const exported = await readFile(await download.path()!, "utf8");
  expect(parseProject(exported).name).toBe("Saal C");
  await projects.getByLabel("Projektdatei importieren").setInputFiles({ name: "saal-c.json", mimeType: "application/json", buffer: Buffer.from(exported) });
  await expect(projects.getByText("Gespeicherte Projekte (4)")).toBeVisible();
  const currentName = await projects.locator("strong").first().innerText();
  await projects.getByLabel("Projektdatei importieren").setInputFiles({ name: "defekt.json", mimeType: "application/json", buffer: Buffer.from("{kaputt") });
  await expect(projects.getByRole("alert")).toContainText("gültiges JSON");
  expect(await projects.locator("strong").first().innerText()).toBe(currentName);
  const importedRow = projects.locator("div.flex.flex-wrap.items-center.gap-2.rounded").filter({ hasText: "Saal C · geöffnet" });
  page.once("dialog", (dialog) => dialog.accept());
  await importedRow.getByRole("button", { name: "Löschen" }).click();
  await expect(projects.getByText("Gespeicherte Projekte (3)")).toBeVisible();
});

test("Importierter WP11-Plan bleibt nach Neuladen unverändert und wird neu geprüft", async ({ page }) => {
  const plan = fixture();
  plan.seating = removeSeat(plan.seating!, "seat-1");
  plan.objects.push({ id: "aisle-import", type: "aisle", source: "generated", edited: true, start: { x: 7, y: 1 }, end: { x: 7, y: 9 }, width: 0.5 });
  const project = createProject("WP11 Import", plan);
  await page.goto("/raumplaner");
  const editor = page.getByRole("region", { name: "2D-Grundrisseditor" });
  const projects = editor.getByLabel("Projektverwaltung");
  await projects.getByLabel("Projektdatei importieren").setInputFiles({ name: "wp11.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(project)) });
  await expect(editor.getByLabel("Aktueller Plan")).toContainText("2 Plätze");
  await expect(editor.getByLabel("Aktueller Plan")).toContainText("1 Gänge");
  await expect(editor.getByLabel("Aktueller Plan")).toContainText("2 Plätze ohne Weg");
  expect(await editor.getByLabel("Planvarianten").getByText(/Kandidaten mit/).count()).toBe(0);
  await page.reload();
  await expect(editor.getByLabel("Aktueller Plan")).toContainText("2 Plätze");
  await expect(editor.getByRole("button", { name: "Rückgängig" })).toBeDisabled();
  await editor.getByRole("button", { name: "Auswahl" }).click();
  await expect(editor.getByRole("img", { name: "Grundriss Zeichenfläche" }).locator("[data-block-id]")).toHaveCount(1);
});

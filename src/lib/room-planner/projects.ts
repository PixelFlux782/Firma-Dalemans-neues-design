import { DEFAULT_SEATING_RULES, type SeatPlacement, type SeatingBlock, type SeatingGridOffset, type SeatingOrientation, type SeatingRules } from "./seating";
import { emptyPlan, type RoomPlan } from "./objects";
import { DEFAULT_CHAIR_SELECTION, resolveChair } from "./chairSelection";
import type { OrientationPreference } from "./variants";
import { RULE_PROFILES } from "./rules/profiles";
import { TABLE_MODELS } from "./tables";

export const PROJECT_SCHEMA_VERSION = 2;
export const PROJECT_STORAGE_KEY = "dalemans-room-planner-projects-v1";
const MAX_PROJECT_BYTES = 4_000_000;
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const position = (value: unknown) => record(value) && finite(value.x) && finite(value.y);
const named = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.length <= 120;

export type PlannerSettings = {
  reservePercent: 0 | 2 | 5 | 10;
  seatingRules: SeatingRules;
  orientation: SeatingOrientation;
  gridOffset: SeatingGridOffset;
  orientationPreference: OrientationPreference;
  profileId: string;
  applicabilityConfirmed: boolean;
};
export type RoomPlannerProject = { id: string; name: string; createdAt: string; updatedAt: string; schemaVersion: number; plan: RoomPlan; settings: PlannerSettings };
export type ProjectStore = { schemaVersion: number; activeProjectId: string | null; projects: RoomPlannerProject[] };

export function defaultPlannerSettings(): PlannerSettings {
  return { reservePercent: 5, seatingRules: { ...DEFAULT_SEATING_RULES }, orientation: "horizontal", gridOffset: { along: 0, cross: 0 }, orientationPreference: "automatic", profileId: "bavstaettv-reference", applicabilityConfirmed: false };
}

function normalizeSettings(raw: unknown): PlannerSettings {
  const defaults = defaultPlannerSettings();
  if (!record(raw)) return defaults;
  const rules = record(raw.seatingRules) ? raw.seatingRules : {};
  const seatingRules = { ...defaults.seatingRules };
  for (const key of Object.keys(seatingRules) as (keyof SeatingRules)[]) {
    const value = rules[key];
    const clearance = key.startsWith("minimum");
    const count = key === "maximumChairsPerRow" || key === "maximumSeats" || key === "maximumCandidates";
    if (finite(value) && (clearance ? value >= 0 : value > 0) && (!count || Number.isInteger(value) && value <= (key === "maximumChairsPerRow" ? 1000 : 100_000))) seatingRules[key] = value;
  }
  const offset = record(raw.gridOffset) && finite(raw.gridOffset.along) && finite(raw.gridOffset.cross) && raw.gridOffset.along >= 0 && raw.gridOffset.along < 1 && raw.gridOffset.cross >= 0 && raw.gridOffset.cross < 1 ? { along: raw.gridOffset.along, cross: raw.gridOffset.cross } : defaults.gridOffset;
  return {
    reservePercent: [0, 2, 5, 10].includes(raw.reservePercent as number) ? raw.reservePercent as PlannerSettings["reservePercent"] : defaults.reservePercent,
    seatingRules,
    orientation: raw.orientation === "vertical" ? "vertical" : "horizontal",
    gridOffset: offset,
    orientationPreference: raw.orientationPreference === "horizontal" || raw.orientationPreference === "vertical" ? raw.orientationPreference : "automatic",
    profileId: RULE_PROFILES.some((profile) => profile.id === raw.profileId) ? raw.profileId as string : defaults.profileId,
    applicabilityConfirmed: raw.applicabilityConfirmed === true,
  };
}

function validObject(value: unknown): boolean {
  if (!record(value) || !named(value.id)) return false;
  if (value.type === "door") return named(value.wallId) && finite(value.offset) && finite(value.width) && value.width > 0 && (value.clearWidth === undefined || finite(value.clearWidth)) && (value.role === undefined || ["normal", "exit", "emergency_exit"].includes(String(value.role)));
  if (value.type === "aisle") return position(value.start) && position(value.end) && finite(value.width) && value.width > 0 && (value.source === undefined || ["manual", "generated"].includes(String(value.source))) && (value.edited === undefined || typeof value.edited === "boolean");
  if (value.type === "front") return finite(value.x) && finite(value.y) && finite(value.width) && finite(value.rotation) && value.width > 0;
  if (value.type === "stage" || value.type === "reservedArea" || value.type === "obstacle") return finite(value.x) && finite(value.y) && finite(value.width) && finite(value.depth) && finite(value.rotation) && value.width > 0 && value.depth > 0 && (value.type !== "obstacle" || ["column", "stage", "technical", "furniture", "restricted"].includes(String(value.obstacleType)));
  return false;
}

function normalizePlan(raw: unknown): RoomPlan {
  if (!record(raw) || !record(raw.contour) || !Array.isArray(raw.contour.points) || !Array.isArray(raw.contour.walls) || typeof raw.contour.closed !== "boolean" || !Array.isArray(raw.objects)) throw new Error("Die Projektdatei enthält keinen gültigen Raumplan.");
  if (raw.contour.points.length > 5000 || raw.contour.walls.length > 5000 || raw.objects.length > 5000 || !raw.contour.points.every((point: unknown) => record(point) && named(point.id) && position(point)) || !raw.contour.walls.every((wall: unknown) => record(wall) && named(wall.id) && named(wall.startPointId) && named(wall.endPointId)) || !raw.objects.every(validObject)) throw new Error("Die Projektdatei enthält beschädigte Geometrie oder Objekte.");
  const tableValid = (value: unknown) => record(value) && named(value.id) && named(value.modelId) && finite(value.x) && finite(value.y) && finite(value.rotation) && finite(value.width) && value.width > 0 && finite(value.depth) && value.depth > 0 && ["manual", "auto", "preset"].includes(String(value.source));
  const chairValid = (value: unknown) => record(value) && named(value.id) && finite(value.x) && finite(value.y) && finite(value.rotation) && finite(value.width) && value.width > 0 && finite(value.depth) && value.depth > 0 && ["manual", "auto", "preset"].includes(String(value.source));
  const zoneValid = (value: unknown) => record(value) && named(value.id) && ["seating", "tables", "free"].includes(String(value.type)) && record(value.geometry) && value.geometry.kind === "rectangle" && finite(value.geometry.x) && finite(value.geometry.y) && finite(value.geometry.width) && value.geometry.width > 0 && finite(value.geometry.depth) && value.geometry.depth > 0 && finite(value.rotation);
  const groupValid = (value: unknown) => record(value) && named(value.id) && Array.isArray(value.tableIds) && value.tableIds.every(named) && Array.isArray(value.chairIds) && value.chairIds.every(named);
  if (raw.tables !== undefined && (!Array.isArray(raw.tables) || raw.tables.length > 5000 || !raw.tables.every(tableValid)) || raw.chairs !== undefined && (!Array.isArray(raw.chairs) || raw.chairs.length > 20000 || !raw.chairs.every(chairValid)) || raw.zones !== undefined && (!Array.isArray(raw.zones) || raw.zones.length > 1000 || !raw.zones.every(zoneValid)) || raw.tableGroups !== undefined && (!Array.isArray(raw.tableGroups) || raw.tableGroups.length > 5000 || !raw.tableGroups.every(groupValid))) throw new Error("Die gespeicherte Tischplanung ist ungültig.");
  const legacyModels: Record<string, string> = { "table-210": "table-210c-140x70", "table-310": "table-310c-180x80", "table-trapez": "table-310c-trapez-160x80" };
  const normalizedTables = ((raw.tables ?? []) as NonNullable<RoomPlan["tables"]>).map((table) => {
    const model = TABLE_MODELS.find((item) => item.id === (legacyModels[table.modelId] ?? table.modelId));
    return model ? { ...table, modelId: model.id, width: model.width, depth: model.depth } : table;
  });
  const plan: RoomPlan = { ...(raw as unknown as RoomPlan), tables: normalizedTables, chairs: (raw.chairs ?? []) as RoomPlan["chairs"], zones: (raw.zones ?? []) as RoomPlan["zones"], tableGroups: (raw.tableGroups ?? []) as RoomPlan["tableGroups"] };
  const tableIds = (plan.tables ?? []).map(table => table.id), furnitureChairIds = (plan.chairs ?? []).map(chair => chair.id), zoneIds = (plan.zones ?? []).map(zone => zone.id);
  const allFurnitureIds = [...tableIds, ...furnitureChairIds, ...zoneIds];
  const furnitureGroupIds = (plan.tableGroups ?? []).map(group => group.id);
  const knownTableModels = new Set(TABLE_MODELS.map(model => model.id));
  if (new Set(allFurnitureIds).size !== allFurnitureIds.length || new Set(furnitureGroupIds).size !== furnitureGroupIds.length || (plan.tables ?? []).some(table => !knownTableModels.has(table.modelId)) || (plan.tableGroups ?? []).some(group => group.tableIds.some(id => !tableIds.includes(id)) || group.chairIds.some(id => !furnitureChairIds.includes(id)))) throw new Error("Die Tischplanung enthält doppelte IDs, unbekannte Modelle oder ungültige Gruppenbezüge.");
  const selected = record(raw.chairSelection) ? raw.chairSelection : null;
  const chairSelection = selected && typeof selected.productId === "string" && typeof selected.variantId === "string" && finite(selected.width) && selected.width > 0 && selected.width <= 2 && finite(selected.depth) && selected.depth > 0 && selected.depth <= 2 && resolveChair(selected as unknown as typeof DEFAULT_CHAIR_SELECTION).variant ? selected as unknown as typeof DEFAULT_CHAIR_SELECTION : DEFAULT_CHAIR_SELECTION;
  plan.chairSelection = chairSelection;
  if (plan.contour.closed && plan.contour.points.length < 3 || raw.seating !== undefined && !plan.contour.closed) throw new Error("Die Projektdatei enthält eine unvollständige Raumkontur.");
  const pointIds = new Set(plan.contour.points.map((point) => point.id));
  const wallIds = new Set(plan.contour.walls.map((wall) => wall.id));
  if (pointIds.size !== plan.contour.points.length || wallIds.size !== plan.contour.walls.length || new Set(plan.objects.map((object) => object.id)).size !== plan.objects.length || plan.contour.walls.some((wall) => !pointIds.has(wall.startPointId) || !pointIds.has(wall.endPointId)) || plan.objects.some((object) => object.type === "door" && !wallIds.has(object.wallId))) throw new Error("Die Projektdatei enthält ungültige Objektbezüge oder doppelte IDs.");
  if (raw.seating === undefined) return plan;
  if (!record(raw.seating) || !Array.isArray(raw.seating.blocks) || !record(raw.seating.rules) || !["horizontal", "vertical"].includes(String(raw.seating.orientation)) || raw.seating.blocks.length > 5000) throw new Error("Die gespeicherte Bestuhlung ist ungültig.");
  const seating = raw.seating as Record<string, unknown> & { blocks: unknown[] };
  const rules = { ...normalizeSettings({ seatingRules: seating.rules }).seatingRules, chairWidth: chairSelection.width, chairDepth: chairSelection.depth };
  const ids = new Set<string>();
  const blocks = seating.blocks.map((block: unknown) => {
    if (!record(block) || !named(block.id) || !Array.isArray(block.seats) || block.seats.length > rules.maximumSeats || block.rotation !== undefined && !finite(block.rotation) || block.source !== undefined && !["generated", "manual"].includes(String(block.source)) || block.edited !== undefined && typeof block.edited !== "boolean") throw new Error("Ein Sitzblock ist beschädigt.");
    const seats = block.seats.map((seat: unknown) => {
      if (!record(seat) || !named(seat.id) || ids.has(seat.id) || !position(seat) || !finite(seat.rotation) || !Number.isInteger(seat.row) || !Number.isInteger(seat.index)) throw new Error("Ein Sitzplatz ist beschädigt.");
      ids.add(seat.id);
      return seat as SeatPlacement;
    });
    const rows = [...new Set(seats.map((seat) => seat.row))];
    return { ...block, seats, rowCount: rows.length, seatsPerRow: rows.map((row) => seats.filter((seat) => seat.row === row).length) } as SeatingBlock;
  });
  const seats = blocks.flatMap((block) => block.seats);
  if (new Set(blocks.map((block) => block.id)).size !== blocks.length || seats.length > rules.maximumSeats) throw new Error("Die Bestuhlung enthält doppelte Blöcke oder überschreitet die technische Sitzplatzgrenze.");
  return { ...plan, seating: { ...seating, blocks, seats, totalSeats: seats.length, totalRows: blocks.reduce((sum, block) => sum + block.rowCount, 0), longestRow: Math.max(0, ...blocks.flatMap((block) => block.seatsPerRow)), hints: Array.isArray(seating.hints) ? seating.hints.filter((hint): hint is string => typeof hint === "string") : [], rules, orientation: seating.orientation as SeatingOrientation } };
}

export function normalizeProject(raw: unknown): RoomPlannerProject {
  if (!record(raw) || ![0, 1, PROJECT_SCHEMA_VERSION].includes(raw.schemaVersion as number)) throw new Error("Unbekannte Projektversion. Diese Datei kann nicht geladen werden.");
  if (!named(raw.id) || !named(raw.name) || typeof raw.createdAt !== "string" || !Number.isFinite(Date.parse(raw.createdAt)) || typeof raw.updatedAt !== "string" || !Number.isFinite(Date.parse(raw.updatedAt))) throw new Error("Die Projektdatei hat ungültige Metadaten.");
  return { id: raw.id, name: raw.name.trim() || "Unbenanntes Projekt", createdAt: raw.createdAt, updatedAt: raw.updatedAt, schemaVersion: PROJECT_SCHEMA_VERSION, plan: normalizePlan(raw.plan), settings: normalizeSettings(raw.settings) };
}

export function parseProject(text: string): RoomPlannerProject {
  if (new Blob([text]).size > MAX_PROJECT_BYTES) throw new Error("Die Projektdatei ist zu groß.");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error("Die Datei enthält kein gültiges JSON."); }
  return normalizeProject(value);
}

export function parseProjectStore(text: string): ProjectStore {
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error("Gespeicherte Projekte konnten nicht gelesen werden."); }
  if (!record(value) || ![1, PROJECT_SCHEMA_VERSION].includes(value.schemaVersion as number) || !Array.isArray(value.projects) || value.projects.length > 100) throw new Error("Der lokale Projektspeicher hat ein unbekanntes Format.");
  const projects = value.projects.map(normalizeProject);
  if (new Set(projects.map((project) => project.id)).size !== projects.length) throw new Error("Der lokale Projektspeicher enthält doppelte Projekt-IDs.");
  return { schemaVersion: PROJECT_SCHEMA_VERSION, activeProjectId: typeof value.activeProjectId === "string" && projects.some((project) => project.id === value.activeProjectId) ? value.activeProjectId : null, projects };
}

export function createProject(name: string, plan: RoomPlan = emptyPlan(), settings: PlannerSettings = defaultPlannerSettings()): RoomPlannerProject {
  const now = new Date().toISOString();
  return { id: globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: name.trim() || "Unbenanntes Projekt", createdAt: now, updatedAt: now, schemaVersion: PROJECT_SCHEMA_VERSION, plan, settings };
}

export function projectFileName(name: string): string {
  return `${name.normalize("NFKD").replace(/[^a-zA-Z0-9äöüÄÖÜß_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "raumplanung"}.json`;
}

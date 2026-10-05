import { aislePolygon, isBlockingObject, obstaclePolygon, polygonInsideRoom, polygonsOverlap, type Issue, type Position, type RoomPlan } from "./objects";

export type TableShape = "rectangular" | "round" | "square" | "trapezoid";
export type TableSource = "manual" | "auto" | "preset";

export type TableModel = {
  id: string;
  name: string;
  articleNumbers: readonly string[];
  modelPath: string;
  width: number;
  depth: number;
  height: number;
  shape: TableShape;
  defaultSeats: number;
  /** Measured GLB bounds, used to normalize model scale and its non-centered origin. */
  modelBounds: { width: number; depth: number; height: number; centerX: number; centerY: number; centerZ: number; floorY: number };
};

const MODEL_BOUNDS = {
  "210c": { width: 1.899253, depth: 0.847804, height: 0.863075, centerX: 0.950543, centerY: 0.428466, centerZ: -0.430974, floorY: -0.003072 },
  "310c": { width: 1.899243, depth: 0.879099, height: 0.935664, centerX: 0.875079, centerY: 0.432884, centerZ: -0.431824, floorY: -0.034948 },
  trapezoid: { width: 1.898275, depth: 0.858471, height: 0.941359, centerX: 0.968091, centerY: 0.42456, centerZ: -0.431777, floorY: -0.04612 },
} as const;

export const TABLE_MODELS: readonly TableModel[] = [
  { id: "table-310c-120x70", name: "Klapptisch 310c · 120 × 70 cm", articleNumbers: ["T310C127", "T310C127N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.2, depth: .7, height: .94, shape: "rectangular", defaultSeats: 4, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-120x80", name: "Klapptisch 310c · 120 × 80 cm", articleNumbers: ["T310C128", "T310C128N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.2, depth: .8, height: .94, shape: "rectangular", defaultSeats: 4, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-140x70", name: "Klapptisch 310c · 140 × 70 cm", articleNumbers: ["T310C147", "T310C147N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.4, depth: .7, height: .94, shape: "rectangular", defaultSeats: 4, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-140x80", name: "Klapptisch 310c · 140 × 80 cm", articleNumbers: ["T310C148", "T310C148N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.4, depth: .8, height: .94, shape: "rectangular", defaultSeats: 4, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-150x70", name: "Klapptisch 310c · 150 × 70 cm", articleNumbers: ["T310C157", "T310C157N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.5, depth: .7, height: .94, shape: "rectangular", defaultSeats: 6, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-150x75", name: "Klapptisch 310c · 150 × 75 cm", articleNumbers: ["T310C1575", "T310C1575N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.5, depth: .75, height: .94, shape: "rectangular", defaultSeats: 6, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-160x70", name: "Klapptisch 310c · 160 × 70 cm", articleNumbers: ["T310C167", "T310C167N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.6, depth: .7, height: .94, shape: "rectangular", defaultSeats: 6, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-160x80", name: "Klapptisch 310c · 160 × 80 cm", articleNumbers: ["T310C168", "T310C168N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.6, depth: .8, height: .94, shape: "rectangular", defaultSeats: 6, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-170x70", name: "Klapptisch 310c · 170 × 70 cm", articleNumbers: ["T310C177", "T310C177N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.7, depth: .7, height: .94, shape: "rectangular", defaultSeats: 6, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-170x80", name: "Klapptisch 310c · 170 × 80 cm", articleNumbers: ["T310C178", "T310C178N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.7, depth: .8, height: .94, shape: "rectangular", defaultSeats: 6, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-180x70", name: "Klapptisch 310c · 180 × 70 cm", articleNumbers: ["T310C187", "T310C187N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.8, depth: .7, height: .94, shape: "rectangular", defaultSeats: 6, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-310c-180x80", name: "Klapptisch 310c · 180 × 80 cm", articleNumbers: ["T310C188", "T310C188N"], modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.8, depth: .8, height: .94, shape: "rectangular", defaultSeats: 6, modelBounds: MODEL_BOUNDS["310c"] },
  { id: "table-210c-120x60", name: "Seminarklapptisch 210c · 120 × 60 cm", articleNumbers: ["T210C126"], modelPath: "/models/dalemans-tisch-210-low.glb", width: 1.2, depth: .6, height: .86, shape: "rectangular", defaultSeats: 4, modelBounds: MODEL_BOUNDS["210c"] },
  { id: "table-210c-140x70", name: "Seminarklapptisch 210c · 140 × 70 cm", articleNumbers: ["T210C147"], modelPath: "/models/dalemans-tisch-210-low.glb", width: 1.4, depth: .7, height: .86, shape: "rectangular", defaultSeats: 4, modelBounds: MODEL_BOUNDS["210c"] },
  { id: "table-310c-trapez-140x70", name: "Trapez-Klapptisch 310c · 140 × 70 cm", articleNumbers: ["T310CT147", "T310CT147N"], modelPath: "/models/dalemans-tisch-trapez-low.glb", width: 1.4, depth: .7, height: .94, shape: "trapezoid", defaultSeats: 4, modelBounds: MODEL_BOUNDS.trapezoid },
  { id: "table-310c-trapez-160x80", name: "Trapez-Klapptisch 310c · 160 × 80 cm", articleNumbers: ["T310CT168", "T310CT168N"], modelPath: "/models/dalemans-tisch-trapez-low.glb", width: 1.6, depth: .8, height: .94, shape: "trapezoid", defaultSeats: 5, modelBounds: MODEL_BOUNDS.trapezoid },
] as const;

export const DEFAULT_TABLE_MODEL_ID = TABLE_MODELS[0].id;
export const tableModel = (id: string) => TABLE_MODELS.find(model => model.id === id) ?? TABLE_MODELS[0];

export type TableInstance = { id: string; modelId: string; x: number; y: number; rotation: number; width: number; depth: number; groupId?: string; source: TableSource };
export type FurnitureChair = { id: string; x: number; y: number; rotation: number; width: number; depth: number; groupId?: string; source: TableSource };
export type TableGroup = { id: string; tableIds: string[]; chairIds: string[] };
export type PlanningZoneType = "seating" | "tables" | "free";
export type PlanningZone = { id: string; type: PlanningZoneType; geometry: { kind: "rectangle"; x: number; y: number; width: number; depth: number }; rotation: number; source?: "manual" | "preset" };

export const rotatedRectangle = (item: { x: number; y: number; width: number; depth: number; rotation?: number }): Position[] => {
  const angle = (item.rotation ?? 0) * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
    const x = sx * item.width / 2, y = sy * item.depth / 2;
    return { x: item.x + x * c - y * s, y: item.y + x * s + y * c };
  });
};
export const tablePolygon = (table: TableInstance) => rotatedRectangle(table);
export const zonePolygon = (zone: PlanningZone) => rotatedRectangle({ ...zone.geometry, rotation: zone.rotation });

export function validateTables(plan: RoomPlan): Issue[] {
  const tables = plan.tables ?? [], chairs = plan.chairs ?? [], issues: Issue[] = [];
  for (const table of tables) {
    const polygon = tablePolygon(table);
    if (!polygonInsideRoom(polygon, plan.contour)) issues.push({ objectId: table.id, severity: "error", message: "Tisch liegt teilweise außerhalb des Raums oder schneidet eine Wand." });
    const other = tables.find(candidate => candidate.id !== table.id && candidate.id > table.id && polygonsOverlap(polygon, tablePolygon(candidate)));
    if (other) issues.push({ objectId: table.id, severity: "warning", message: `Tisch kollidiert mit ${other.id}.` });
    const obstacle = plan.objects.find(object => isBlockingObject(object) && polygonsOverlap(polygon, obstaclePolygon(object)));
    if (obstacle) issues.push({ objectId: table.id, severity: "warning", message: "Tisch kollidiert mit Hindernis, Bühne oder Sperrfläche." });
    const aisle = plan.objects.find(object => object.type === "aisle" && polygonsOverlap(polygon, aislePolygon(object)));
    if (aisle) issues.push({ objectId: table.id, severity: "warning", message: "Tisch überlagert einen Gang." });
    const chair = chairs.find(item => polygonsOverlap(polygon, rotatedRectangle(item)));
    if (chair) issues.push({ objectId: table.id, severity: "warning", message: "Tisch kollidiert mit einem Stuhl." });
  }
  return issues;
}

export type TablePresetId = "single" | "rows" | "grid" | "banquet" | "u-shape" | "e-shape" | "t-shape" | "conference" | "bistro" | "islands" | "classroom" | "herringbone" | "long-tables" | "free-groups";
export const TABLE_PRESETS: readonly { id: TablePresetId; name: string }[] = [
  { id: "single", name: "Einzelne Tische" }, { id: "rows", name: "Reihen" }, { id: "grid", name: "Raster" }, { id: "banquet", name: "Bankett" },
  { id: "u-shape", name: "U-Form" }, { id: "e-shape", name: "E-Form" }, { id: "t-shape", name: "T-Form" }, { id: "conference", name: "Block / Konferenz" },
  { id: "bistro", name: "Bistro" }, { id: "islands", name: "Inseln / Tischgruppen" }, { id: "classroom", name: "Klassenraum" }, { id: "herringbone", name: "Fischgräte / diagonal" },
  { id: "long-tables", name: "Lange Tafeln" }, { id: "free-groups", name: "Freie Gruppen" },
] as const;

export type TableLayoutOptions = { preset: TablePresetId; modelId: string; count: number; spacing: number; rotation: number; withChairs: boolean; chairsPerTable?: number; columns?: number; center?: Position; plan?: RoomPlan };
export type GeneratedTableLayout = { tables: TableInstance[]; chairs: FurnitureChair[]; groups: TableGroup[] };

function chairRing(table: TableInstance, count: number, groupId: string, idPrefix: string): FurnitureChair[] {
  const result: FurnitureChair[] = [];
  const longSide = Math.max(1, Math.floor((count - 2) / 2));
  const local: { x: number; y: number; rotation: number }[] = [];
  for (let i = 0; i < longSide && local.length < count; i++) local.push({ x: -table.width / 2 + table.width * (i + 1) / (longSide + 1), y: -table.depth / 2 - 0.32, rotation: 0 });
  for (let i = 0; i < longSide && local.length < count; i++) local.push({ x: table.width / 2 - table.width * (i + 1) / (longSide + 1), y: table.depth / 2 + 0.32, rotation: 180 });
  if (local.length < count) local.push({ x: -table.width / 2 - 0.32, y: 0, rotation: 270 });
  if (local.length < count) local.push({ x: table.width / 2 + 0.32, y: 0, rotation: 90 });
  const a = table.rotation * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  local.slice(0, count).forEach((chair, index) => result.push({ id: `${idPrefix}-chair-${index + 1}`, x: table.x + chair.x * c - chair.y * s, y: table.y + chair.x * s + chair.y * c, rotation: (chair.rotation + table.rotation) % 360, width: 0.5, depth: 0.55, groupId, source: table.source }));
  return result;
}

export function generateTableLayout(options: TableLayoutOptions, idPrefix = `layout-${Date.now()}`): GeneratedTableLayout {
  const model = tableModel(options.modelId), count = Math.max(1, Math.floor(options.count)), spacing = Math.max(0, options.spacing);
  const center = options.center ?? { x: 0, y: 0 };
  const columns = Math.max(1, Math.floor(options.columns ?? Math.ceil(Math.sqrt(count))));
  const rows = Math.ceil(count / columns);
  const stepX = model.width + spacing, stepY = model.depth + spacing;
  const layout: { x: number; y: number; rotation?: number }[] = [];
  for (let i = 0; i < count; i++) {
    let column = i % columns, row = Math.floor(i / columns), rotation = options.rotation;
    if (options.preset === "rows" || options.preset === "classroom" || options.preset === "long-tables") { column = i; row = 0; }
    if (options.preset === "banquet") { column = i % Math.max(1, Math.min(columns, 3)); row = Math.floor(i / Math.max(1, Math.min(columns, 3))); }
    if (options.preset === "bistro" || options.preset === "free-groups") { const jitter = i % 2 ? spacing * .18 : -spacing * .12; layout.push({ x: center.x + (column - (columns - 1) / 2) * stepX + jitter, y: center.y + (row - (rows - 1) / 2) * stepY - jitter, rotation: rotation + (i % 2 ? 8 : -6) }); continue; }
    if (options.preset === "herringbone") rotation += row % 2 ? 45 : -45;
    if (options.preset === "u-shape") { const side = Math.floor((count + 2) / 3); if (i < side) { column = i; row = 0; } else if (i < side * 2) { column = 0; row = i - side + 1; rotation += 90; } else { column = side - 1; row = i - side * 2 + 1; rotation += 90; } }
    if (options.preset === "t-shape") { if (i < columns) { column = i; row = 0; } else { column = Math.floor(columns / 2); row = i - columns + 1; rotation += 90; } }
    if (options.preset === "e-shape") { const branch = Math.floor(i / columns); column = i % columns; row = branch * 2; if (i >= columns * 3) { column = 0; row = i - columns * 3 + 1; rotation += 90; } }
    if (options.preset === "conference") { const perSide = Math.ceil(count / 4), side = Math.floor(i / perSide), offset = i % perSide; if (side === 0) { column = offset; row = 0; } else if (side === 1) { column = columns - 1; row = offset; rotation += 90; } else if (side === 2) { column = offset; row = rows - 1; } else { column = 0; row = offset; rotation += 90; } }
    layout.push({ x: center.x + (column - (columns - 1) / 2) * stepX, y: center.y + (row - (rows - 1) / 2) * stepY, rotation });
  }
  let tables = layout.map((position, index): TableInstance => ({ id: `${idPrefix}-table-${index + 1}`, modelId: model.id, x: Number(position.x.toFixed(3)), y: Number(position.y.toFixed(3)), rotation: position.rotation ?? options.rotation, width: model.width, depth: model.depth, groupId: `${idPrefix}-group-${index + 1}`, source: "preset" }));
  if (options.plan) tables = tables.filter((table) => {
    const polygon = tablePolygon(table);
    return polygonInsideRoom(polygon, options.plan!.contour)
      && !options.plan!.objects.some((object) => isBlockingObject(object) && polygonsOverlap(polygon, obstaclePolygon(object)) || object.type === "aisle" && polygonsOverlap(polygon, aislePolygon(object)))
      && !(options.plan!.tables ?? []).some((other) => polygonsOverlap(polygon, tablePolygon(other)));
  });
  const chairs = options.withChairs ? tables.flatMap((table, index) => chairRing(table, options.chairsPerTable ?? model.defaultSeats, table.groupId!, `${idPrefix}-${index + 1}`)) : [];
  const groups = tables.map(table => ({ id: table.groupId!, tableIds: [table.id], chairIds: chairs.filter(chair => chair.groupId === table.groupId).map(chair => chair.id) }));
  return { tables, chairs, groups };
}

export function moveTableGroup(plan: RoomPlan, groupId: string, dx: number, dy: number, rotationDelta = 0): RoomPlan {
  const group = plan.tableGroups?.find(item => item.id === groupId); if (!group) return plan;
  const members = [...(plan.tables ?? []).filter(item => group.tableIds.includes(item.id)), ...(plan.chairs ?? []).filter(item => group.chairIds.includes(item.id))];
  const center = members.reduce((sum, item) => ({ x: sum.x + item.x / members.length, y: sum.y + item.y / members.length }), { x: 0, y: 0 });
  const transform = <T extends { id: string; x: number; y: number; rotation: number }>(item: T): T => {
    if (![...group.tableIds, ...group.chairIds].includes(item.id)) return item;
    const angle = rotationDelta * Math.PI / 180, x = item.x - center.x, y = item.y - center.y;
    return { ...item, x: Number((center.x + dx + x * Math.cos(angle) - y * Math.sin(angle)).toFixed(3)), y: Number((center.y + dy + x * Math.sin(angle) + y * Math.cos(angle)).toFixed(3)), rotation: (item.rotation + rotationDelta + 360) % 360 };
  };
  return { ...plan, tables: (plan.tables ?? []).map(transform), chairs: (plan.chairs ?? []).map(transform) };
}

export const planCapacity = (plan: RoomPlan) => ({ rowSeats: plan.seating?.seats.length ?? 0, tableSeats: (plan.chairs ?? []).length, total: (plan.seating?.seats.length ?? 0) + (plan.chairs ?? []).length });

export type TableDemandLine = { model: TableModel; quantity: number };
export function calculateTableDemand(plan: RoomPlan): TableDemandLine[] {
  const quantities = new Map<string, number>();
  for (const table of plan.tables ?? []) quantities.set(table.modelId, (quantities.get(table.modelId) ?? 0) + 1);
  return TABLE_MODELS.flatMap((model) => quantities.has(model.id) ? [{ model, quantity: quantities.get(model.id)! }] : []);
}

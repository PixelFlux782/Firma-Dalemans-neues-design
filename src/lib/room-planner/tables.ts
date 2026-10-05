import { aislePolygon, isBlockingObject, obstaclePolygon, pointInPolygon, polygonInsideRoom, polygonsOverlap, type Issue, type Position, type RoomPlan } from "./objects";

export type TableShape = "rectangular" | "round" | "square" | "trapezoid";
export type TableSource = "manual" | "auto" | "preset";

export type TableModel = {
  id: string;
  name: string;
  modelPath: string;
  width: number;
  depth: number;
  height: number;
  shape: TableShape;
  defaultSeats: number;
  /** Measured GLB bounds, used to normalize model scale and its non-centered origin. */
  modelBounds: { width: number; depth: number; height: number; centerX: number; centerY: number; centerZ: number; floorY: number };
};

export const TABLE_MODELS: readonly TableModel[] = [
  { id: "table-210", name: "DLMNS Tisch 210", modelPath: "/models/dalemans-tisch-210-low.glb", width: 1.9, depth: 0.85, height: 0.86, shape: "rectangular", defaultSeats: 6, modelBounds: { width: 1.899253, depth: 0.847804, height: 0.863075, centerX: 0.950543, centerY: 0.428466, centerZ: -0.430974, floorY: -0.003072 } },
  { id: "table-310", name: "DLMNS Tisch 310", modelPath: "/models/dalemans-tisch-310-low.glb", width: 1.9, depth: 0.88, height: 0.94, shape: "rectangular", defaultSeats: 6, modelBounds: { width: 1.899243, depth: 0.879099, height: 0.935664, centerX: 0.875079, centerY: 0.432884, centerZ: -0.431824, floorY: -0.034948 } },
  { id: "table-trapez", name: "DLMNS Trapeztisch", modelPath: "/models/dalemans-tisch-trapez-low.glb", width: 1.9, depth: 0.86, height: 0.94, shape: "trapezoid", defaultSeats: 5, modelBounds: { width: 1.898275, depth: 0.858471, height: 0.941359, centerX: 0.968091, centerY: 0.42456, centerZ: -0.431777, floorY: -0.04612 } },
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

export type TableLayoutOptions = { preset: TablePresetId; modelId: string; count: number; spacing: number; rotation: number; withChairs: boolean; chairsPerTable?: number; columns?: number; zone?: PlanningZone };
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
  const zone = options.zone;
  const center = zone ? { x: zone.geometry.x, y: zone.geometry.y } : { x: 0, y: 0 };
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
  if (zone) tables = tables.filter(table => tablePolygon(table).every(point => pointInPolygon(point, zonePolygon(zone))));
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

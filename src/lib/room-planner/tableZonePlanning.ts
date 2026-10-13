import {
  aislePolygon,
  doorSegment,
  isBlockingObject,
  obstaclePolygon,
  polygonInsideRoom,
  polygonsOverlap,
  type Position,
  type RoomPlan,
} from "./objects";
import {
  polygonsInteriorOverlap,
  rotatedRectangle,
  seatTable,
  tableEdges,
  tableModel,
  tablePolygon,
  validateZonePolygon,
  zoneCenter,
  zonePolygon,
  type FurnitureChair,
  type PlanningZone,
  type TableGroup,
  type TableInstance,
  type TableLayoutMode,
  type TableModel,
  type TablePlanningGoal,
} from "./tables";

export type TableZonePlanningOptions = {
  zoneId: string;
  modelId: string;
  mode: TableLayoutMode;
  goal: TablePlanningGoal;
  withChairs: boolean;
  rotation?: number;
};

export type TableZonePlanningResult = {
  tables: TableInstance[];
  chairs: FurnitureChair[];
  groups: TableGroup[];
  replaceableTableIds: string[];
  protectedTableIds: string[];
  unchanged: boolean;
  message: string;
  assumption: string;
  layoutMode: TableLayoutMode;
  planningGoal: TablePlanningGoal;
  evaluatedVariants: number;
  durationMs: number;
  usableSeats: number;
  problematicSeats: number;
  uncheckedSeats: number;
  suggestedMode?: TableLayoutMode;
};

type Proposal = {
  tables: TableInstance[];
  chairs: FurnitureChair[];
  groups: TableGroup[];
  requestedSeats: number;
  clearance: number;
  score: number;
};

const MAX_CANDIDATE_TABLES = 240;
const GOAL_CLEARANCE: Record<TablePlanningGoal, number> = { capacity: .35, balanced: .65, comfort: 1.05 };
const MODE_LABEL: Record<TableLayoutMode, string> = { individual: "Einzeltische", "long-tables": "Lange Tafeln", "l-shape": "L-Form", "u-shape": "U-Form" };
const GOAL_LABEL: Record<TablePlanningGoal, string> = { balanced: "Ausgewogen", capacity: "Mehr Sitzplätze", comfort: "Mehr Bewegungsfreiheit" };

const normalizeRotation = (value: number) => (value % 360 + 360) % 360;

function asRoom(points: Position[]) {
  const roomPoints = points.map((point, index) => ({ ...point, id: `zone-point-${index}` }));
  return {
    closed: true,
    points: roomPoints,
    walls: roomPoints.map((point, index) => ({ id: `zone-wall-${index}`, startPointId: point.id, endPointId: roomPoints[(index + 1) % roomPoints.length].id })),
  };
}

function rotateLocal(local: Position, center: Position, rotation: number): Position {
  const angle = rotation * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  return { x: center.x + local.x * c - local.y * s, y: center.y + local.x * s + local.y * c };
}

function localBounds(polygon: Position[], center: Position, rotation: number) {
  const angle = -rotation * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const local = polygon.map((point) => ({ x: (point.x - center.x) * c - (point.y - center.y) * s, y: (point.x - center.x) * s + (point.y - center.y) * c }));
  return {
    minX: Math.min(...local.map((point) => point.x)),
    maxX: Math.max(...local.map((point) => point.x)),
    minY: Math.min(...local.map((point) => point.y)),
    maxY: Math.max(...local.map((point) => point.y)),
  };
}

function doorClearance(plan: RoomPlan, id: string): Position[] {
  const door = plan.objects.find((object) => object.id === id && object.type === "door");
  if (!door || door.type !== "door") return [];
  const segment = doorSegment(plan.contour, door);
  if (!segment) return [];
  const center = { x: (segment.start.x + segment.end.x) / 2, y: (segment.start.y + segment.end.y) / 2 };
  return rotatedRectangle({ ...center, width: door.width + .4, depth: 1.2, rotation: Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * 180 / Math.PI });
}

function nextId(prefix: string, index: number, used: Set<string>) {
  let suffix = index, value = `${prefix}-${suffix}`;
  while (used.has(value)) value = `${prefix}-${++suffix}`;
  used.add(value);
  return value;
}

function createTableFactory(model: TableModel, zone: PlanningZone, goal: TablePlanningGoal, mode: TableLayoutMode, clearance: number, used: Set<string>) {
  let index = 0;
  return (position: Position, rotation: number): TableInstance => {
    const id = nextId(`${zone.id}-table`, ++index, used);
    return {
      id,
      modelId: model.id,
      x: Number(position.x.toFixed(3)),
      y: Number(position.y.toFixed(3)),
      rotation: normalizeRotation(rotation),
      width: model.width,
      depth: model.depth,
      groupId: `${id}-group`,
      zoneId: zone.id,
      fillClearance: clearance,
      autoLayout: mode,
      autoGoal: goal,
      source: "auto",
    };
  };
}

/** Aligns the moving table's left end with the target's right end using the same
 * physical edge representation as interactive WP18.1 snapping. */
function dockAtEnd(target: TableInstance, moving: TableInstance): TableInstance {
  const targetEdge = tableEdges(target)[1];
  const localEdge = tableEdges({ ...moving, x: 0, y: 0, rotation: 0 })[3];
  const targetAngle = Math.atan2(targetEdge.end.y - targetEdge.start.y, targetEdge.end.x - targetEdge.start.x);
  const localAngle = Math.atan2(localEdge.end.y - localEdge.start.y, localEdge.end.x - localEdge.start.x);
  const rotation = normalizeRotation((targetAngle + Math.PI - localAngle) * 180 / Math.PI);
  const movingEdge = tableEdges({ ...moving, x: 0, y: 0, rotation })[3];
  return {
    ...moving,
    x: Number((targetEdge.midpoint.x - movingEdge.midpoint.x).toFixed(3)),
    y: Number((targetEdge.midpoint.y - movingEdge.midpoint.y).toFixed(3)),
    rotation,
  };
}

function individualLayout(zone: PlanningZone, polygon: Position[], model: TableModel, rotation: number, clearance: number, chairDepth: number, phase: number, make: ReturnType<typeof createTableFactory>) {
  const center = zoneCenter(zone), bounds = localBounds(polygon, center, rotation);
  const chairReach = chairDepth + .12;
  const stepX = model.width + 2 * chairReach + clearance;
  const stepY = model.depth + 2 * chairReach + clearance;
  const result: TableInstance[] = [];
  for (let y = bounds.minY + stepY / 2 + phase * stepY / 3; y <= bounds.maxY - stepY / 2 + 1e-8 && result.length < MAX_CANDIDATE_TABLES; y += stepY) {
    for (let x = bounds.minX + stepX / 2 + phase * stepX / 3; x <= bounds.maxX - stepX / 2 + 1e-8 && result.length < MAX_CANDIDATE_TABLES; x += stepX) {
      result.push(make(rotateLocal({ x, y }, center, rotation), rotation));
    }
  }
  return result;
}

function longTableLayout(zone: PlanningZone, polygon: Position[], model: TableModel, rotation: number, clearance: number, chairDepth: number, goal: TablePlanningGoal, make: ReturnType<typeof createTableFactory>) {
  const center = zoneCenter(zone), bounds = localBounds(polygon, center, rotation);
  const chairReach = chairDepth + .12;
  const approximateAdvance = model.shape === "trapezoid" ? (model.width + Math.min(model.width, model.depth)) / 2 : model.width;
  const availableWidth = bounds.maxX - bounds.minX - 2 * chairReach;
  const rowLimit = goal === "capacity" ? 12 : goal === "balanced" ? 7 : 4;
  const perRow = Math.min(rowLimit, Math.max(0, Math.floor(availableWidth / Math.max(.2, approximateAdvance))));
  const rowStep = model.depth + 2 * chairReach + clearance;
  const rowCount = Math.min(20, Math.max(0, Math.floor((bounds.maxY - bounds.minY) / rowStep)));
  if (perRow < 2 || rowCount < 1) return [];
  const result: TableInstance[] = [];
  for (let row = 0; row < rowCount && result.length + perRow <= MAX_CANDIDATE_TABLES; row++) {
    const first = make({ x: 0, y: 0 }, rotation);
    const chain = [first];
    while (chain.length < perRow) chain.push(dockAtEnd(chain.at(-1)!, make({ x: 0, y: 0 }, rotation)));
    const chainCenter = chain.reduce((sum, table) => ({ x: sum.x + table.x / chain.length, y: sum.y + table.y / chain.length }), { x: 0, y: 0 });
    const target = rotateLocal({ x: 0, y: (row - (rowCount - 1) / 2) * rowStep }, center, rotation);
    chain.forEach((table) => result.push({ ...table, x: Number((table.x - chainCenter.x + target.x).toFixed(3)), y: Number((table.y - chainCenter.y + target.y).toFixed(3)) }));
  }
  return result;
}

function cornerLayout(zone: PlanningZone, polygon: Position[], model: TableModel, rotation: number, chairDepth: number, goal: TablePlanningGoal, mode: "l-shape" | "u-shape", make: ReturnType<typeof createTableFactory>) {
  const center = zoneCenter(zone), bounds = localBounds(polygon, center, rotation), chairReach = chairDepth + .12;
  const reduction = goal === "capacity" ? 0 : goal === "balanced" ? 1 : 2;
  const horizontalCount = Math.min(10, Math.floor((bounds.maxX - bounds.minX - 2 * chairReach) / model.width) - reduction);
  const verticalCount = Math.min(8, Math.floor((bounds.maxY - bounds.minY - model.depth - 2 * chairReach) / model.width) - reduction);
  if (horizontalCount < 2 || verticalCount < 2) return [];
  const baseY = -(verticalCount * model.width) / 4;
  const result = Array.from({ length: horizontalCount }, (_, index) => make(rotateLocal({ x: (index - (horizontalCount - 1) / 2) * model.width, y: baseY }, center, rotation), rotation));
  const left = -(horizontalCount - 1) * model.width / 2, right = -left;
  for (let index = 0; index < verticalCount; index++) {
    const y = baseY + model.depth / 2 + model.width / 2 + index * model.width;
    result.push(make(rotateLocal({ x: left, y }, center, rotation), rotation + 90));
    if (mode === "u-shape") result.push(make(rotateLocal({ x: right, y }, center, rotation), rotation + 90));
  }
  return result.slice(0, MAX_CANDIDATE_TABLES);
}

function score(goal: TablePlanningGoal, tableCount: number, seats: number, requested: number, clearance: number) {
  const missing = Math.max(0, requested - seats);
  if (goal === "capacity") return seats * 100 + tableCount * 12 - missing * 5;
  if (goal === "comfort") return seats * 24 + tableCount * 3 + clearance * 80 - missing * 16;
  return seats * 70 + tableCount * 8 + clearance * 25 - missing * 12;
}

function tableFits(table: TableInstance, plan: RoomPlan, zoneRoom: ReturnType<typeof asRoom>, fixedTables: TableInstance[], fixedChairs: FurnitureChair[], forbidden: Position[][], accepted: TableInstance[]) {
  const polygon = tablePolygon(table);
  return polygonInsideRoom(polygon, plan.contour)
    && polygonInsideRoom(polygon, zoneRoom)
    && !forbidden.some((area) => area.length >= 3 && polygonsOverlap(polygon, area))
    && !fixedTables.some((other) => polygonsInteriorOverlap(polygon, tablePolygon(other)))
    && !fixedChairs.some((chair) => polygonsOverlap(polygon, rotatedRectangle(chair)))
    && !accepted.some((other) => polygonsInteriorOverlap(polygon, tablePolygon(other)));
}

function evaluate(plan: RoomPlan, zone: PlanningZone, mode: TableLayoutMode, goal: TablePlanningGoal, generated: TableInstance[], fixedTables: TableInstance[], fixedChairs: FurnitureChair[], forbidden: Position[][], withChairs: boolean, clearance: number): Proposal | null {
  const zoneRoom = asRoom(zonePolygon(zone));
  const accepted: TableInstance[] = [];
  for (const table of generated) {
    if (tableFits(table, plan, zoneRoom, fixedTables, fixedChairs, forbidden, accepted)) accepted.push(table);
    else if (mode === "l-shape" || mode === "u-shape") return null;
  }
  if (!accepted.length || mode === "long-tables" && accepted.length < 2) return null;
  let chairs: FurnitureChair[] = [], requestedSeats = 0;
  const groups: TableGroup[] = [];
  let chairPlan: RoomPlan = { ...plan, tables: [...fixedTables, ...accepted], chairs: fixedChairs };
  for (const table of accepted) {
    const requested = tableModel(table.modelId).defaultSeats;
    requestedSeats += withChairs ? requested : 0;
    const result = withChairs ? seatTable(chairPlan, table.id, requested) : undefined;
    const placed = result?.chairs ?? [];
    chairs = [...chairs, ...placed];
    chairPlan = { ...chairPlan, chairs: [...(chairPlan.chairs ?? []), ...placed] };
    groups.push({ id: table.groupId!, tableIds: [table.id], chairIds: placed.map((chair) => chair.id) });
  }
  return { tables: accepted, chairs, groups, requestedSeats, clearance, score: score(goal, accepted.length, chairs.length, requestedSeats, clearance) };
}

/**
 * Bounded deterministic search. It evaluates at most six geometry candidates,
 * never runs the full rule/egress pipeline inside the search, and returns only
 * ordinary RoomPlan tables, chairs and existing furniture groups.
 */
export function planTableZone(plan: RoomPlan, options: TableZonePlanningOptions): TableZonePlanningResult {
  const started = globalThis.performance?.now?.() ?? Date.now();
  const zone = (plan.zones ?? []).find((candidate) => candidate.id === options.zoneId && candidate.type === "tables");
  const model = tableModel(options.modelId), clearance = GOAL_CLEARANCE[options.goal];
  const assumption = `${GOAL_LABEL[options.goal]}: ${clearance.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m zusätzlicher Abstand zwischen getrennten Tischgruppen; reale Tisch- und Stuhlgrundflächen werden gemeinsam geprüft.`;
  const base = {
    tables: [] as TableInstance[], chairs: [] as FurnitureChair[], groups: [] as TableGroup[], replaceableTableIds: [] as string[], protectedTableIds: [] as string[],
    unchanged: false, message: "", assumption, layoutMode: options.mode, planningGoal: options.goal, evaluatedVariants: 0, durationMs: 0,
    usableSeats: 0, problematicSeats: 0, uncheckedSeats: 0,
  };
  const done = (result: Omit<TableZonePlanningResult, "durationMs"> & { durationMs?: number }): TableZonePlanningResult => ({ ...result, durationMs: Number(((globalThis.performance?.now?.() ?? Date.now()) - started).toFixed(1)) });
  if (!zone) return done({ ...base, message: "Der Tischbereich wurde nicht gefunden." });
  const polygon = zonePolygon(zone), geometryErrors = zone.geometry.kind === "polygon" ? validateZonePolygon(polygon) : [];
  if (geometryErrors.length || !polygonInsideRoom(polygon, plan.contour)) return done({ ...base, message: geometryErrors[0] ?? "Der Tischbereich liegt nicht vollständig im Raum." });

  const linked = (plan.tables ?? []).filter((table) => table.zoneId === zone.id);
  const editedChairGroups = new Set((plan.chairs ?? []).filter((chair) => chair.edited).map((chair) => chair.groupId).filter((id): id is string => !!id));
  const replaceable = linked.filter((table) => table.source === "auto" && !table.edited && (!table.groupId || !editedChairGroups.has(table.groupId)));
  const protectedTables = linked.filter((table) => !replaceable.includes(table));
  const replaceableIds = new Set(replaceable.map((table) => table.id));
  const fixedTables = (plan.tables ?? []).filter((table) => !replaceableIds.has(table.id));
  const removedGroups = new Set(replaceable.map((table) => table.groupId).filter((id): id is string => !!id));
  const fixedChairs = (plan.chairs ?? []).filter((chair) => !chair.groupId || !removedGroups.has(chair.groupId));
  const currentChairs = (plan.chairs ?? []).filter((chair) => !!chair.groupId && removedGroups.has(chair.groupId));
  if (replaceable.length && !protectedTables.length && replaceable.every((table) => table.modelId === model.id && table.autoLayout === options.mode && table.autoGoal === options.goal && table.fillClearance === clearance) && options.withChairs === !!currentChairs.length) {
    return done({ ...base, tables: replaceable, chairs: currentChairs, groups: (plan.tableGroups ?? []).filter((group) => replaceable.some((table) => group.tableIds.includes(table.id))), replaceableTableIds: replaceable.map((table) => table.id), unchanged: true, usableSeats: currentChairs.length, uncheckedSeats: currentChairs.length, message: "Dieser Tischbereich ist bereits mit derselben Anordnung eingerichtet." });
  }

  const forbidden = [
    ...plan.objects.filter(isBlockingObject).map(obstaclePolygon),
    ...plan.objects.filter((object) => object.type === "aisle").map((object) => object.type === "aisle" ? aislePolygon(object) : []),
    ...plan.objects.filter((object) => object.type === "door").map((object) => doorClearance(plan, object.id)),
  ];
  const rotations = [...new Set([normalizeRotation(options.rotation ?? 0), normalizeRotation((options.rotation ?? 0) + 90)])];
  const phases = options.mode === "individual" ? [0, 1, 2] : [0];
  const proposals: Proposal[] = [];
  for (const rotation of rotations) for (const phase of phases) {
    const used = new Set([...fixedTables.map((table) => table.id), ...fixedChairs.map((chair) => chair.id)]);
    const make = createTableFactory(model, zone, options.goal, options.mode, clearance, used);
    const chairDepth = plan.chairSelection?.depth ?? .55;
    const generated = options.mode === "individual"
      ? individualLayout(zone, polygon, model, rotation, clearance, chairDepth, phase, make)
      : options.mode === "long-tables"
        ? longTableLayout(zone, polygon, model, rotation, clearance, chairDepth, options.goal, make)
        : cornerLayout(zone, polygon, model, rotation, chairDepth, options.goal, options.mode, make);
    const proposal = evaluate(plan, zone, options.mode, options.goal, generated, fixedTables, fixedChairs, forbidden, options.withChairs, clearance);
    if (proposal) proposals.push(proposal);
  }
  const evaluatedVariants = rotations.length * phases.length;
  const best = proposals.sort((a, b) => b.score - a.score || b.chairs.length - a.chairs.length || b.tables.length - a.tables.length || a.tables[0].id.localeCompare(b.tables[0].id))[0];
  if (!best) {
    const suggestedMode = options.mode === "individual" ? undefined : "individual";
    return done({ ...base, replaceableTableIds: replaceable.map((table) => table.id), protectedTableIds: protectedTables.map((table) => table.id), evaluatedVariants, suggestedMode, message: `Die ${MODE_LABEL[options.mode]} passt mit diesem Tischmodell nicht sinnvoll in den Bereich.${suggestedMode ? " Einzeltische sind hier voraussichtlich geeigneter." : " Bitte Bereich vergrößern oder kleineres Modell wählen."}` });
  }
  const omittedSeats = Math.max(0, best.requestedSeats - best.chairs.length);
  return done({
    ...base,
    tables: best.tables,
    chairs: best.chairs,
    groups: best.groups,
    replaceableTableIds: replaceable.map((table) => table.id),
    protectedTableIds: protectedTables.map((table) => table.id),
    evaluatedVariants,
    usableSeats: best.chairs.length,
    uncheckedSeats: best.chairs.length,
    message: `${MODE_LABEL[options.mode]}: ${best.tables.length} ${best.tables.length === 1 ? "Tisch" : "Tische"} und ${best.chairs.length} tatsächlich angelegte Tischplätze.${omittedSeats ? ` ${omittedSeats} mögliche Plätze wurden wegen Geometrie, Kollision oder Zugang nicht angelegt.` : ""} Sicherheits- und Rettungswegdetails der Tischplätze sind ungeprüft und fachlich zu bewerten.`,
  });
}

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
  TABLE_MODELS,
  polygonsInteriorOverlap,
  rotatedRectangle,
  seatTable,
  tableEdges,
  tableFootprintDepth,
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
  pattern?: TrapezoidPattern;
};

type TrapezoidPattern = "pair" | "ring" | "triangle" | "elongated";
type PatternCandidate = { tables: TableInstance[]; pattern?: TrapezoidPattern };

const MAX_CANDIDATE_TABLES = 240;
/** Maximum geometric deviation accepted for auto-generated shared table edges. */
export const AUTO_TABLE_CONTACT_TOLERANCE = .002;
const GOAL_CLEARANCE: Record<TablePlanningGoal, number> = { capacity: .35, balanced: .65, comfort: 1.05 };
const MODE_LABEL: Record<TableLayoutMode, string> = { individual: "Einzeltische", "long-tables": "Lange Tafeln", "l-shape": "L-Form", "u-shape": "U-Form", "trapezoid-auto": "Passende Trapez-Stellform", "trapezoid-groups": "Trapez-Einzelgruppen", "trapezoid-islands": "Große Trapez-Tischinseln", "trapezoid-long": "Längliche Trapez-Anordnung" };
const GOAL_LABEL: Record<TablePlanningGoal, string> = { balanced: "Ausgewogen", capacity: "Mehr Sitzplätze", comfort: "Mehr Bewegungsfreiheit" };
const PATTERN_LABEL: Record<TrapezoidPattern, string> = { pair: "Sechseckgruppen", ring: "hexagonale Tischinsel", triangle: "dreieckige Kombination", elongated: "verlängerte Tafel" };

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
  return (position: Position, rotation: number, selectedModel = model): TableInstance => {
    const id = nextId(`${zone.id}-table`, ++index, used);
    return {
      id,
      modelId: selectedModel.id,
      x: Number(position.x.toFixed(6)),
      y: Number(position.y.toFixed(6)),
      rotation: normalizeRotation(rotation),
      width: selectedModel.width,
      depth: selectedModel.depth,
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
    x: Number((targetEdge.midpoint.x - movingEdge.midpoint.x).toFixed(6)),
    y: Number((targetEdge.midpoint.y - movingEdge.midpoint.y).toFixed(6)),
    rotation,
  };
}

/** Aligns any two real polygon edges. The reversed direction makes the table
 * interiors lie on opposite sides of the common boundary. */
function dockEdges(target: TableInstance, targetEdgeIndex: number, moving: TableInstance, movingEdgeIndex: number): TableInstance {
  const targetEdge = tableEdges(target)[targetEdgeIndex];
  const localEdge = tableEdges({ ...moving, x: 0, y: 0, rotation: 0 })[movingEdgeIndex];
  const targetAngle = Math.atan2(targetEdge.end.y - targetEdge.start.y, targetEdge.end.x - targetEdge.start.x);
  const localAngle = Math.atan2(localEdge.end.y - localEdge.start.y, localEdge.end.x - localEdge.start.x);
  const rotation = normalizeRotation((targetAngle + Math.PI - localAngle) * 180 / Math.PI);
  const movingEdge = tableEdges({ ...moving, x: 0, y: 0, rotation })[movingEdgeIndex];
  return { ...moving, x: targetEdge.midpoint.x - movingEdge.midpoint.x, y: targetEdge.midpoint.y - movingEdge.midpoint.y, rotation };
}

function translateTables(tables: TableInstance[], target: Position): TableInstance[] {
  const center = tables.reduce((sum, table) => ({ x: sum.x + table.x / tables.length, y: sum.y + table.y / tables.length }), { x: 0, y: 0 });
  return tables.map((table) => ({ ...table, x: Number((table.x - center.x + target.x).toFixed(6)), y: Number((table.y - center.y + target.y).toFixed(6)), rotation: Number(table.rotation.toFixed(6)) }));
}

function trapezoidPair(center: Position, rotation: number, make: ReturnType<typeof createTableFactory>): TableInstance[] {
  const first = make(center, rotation);
  const second = dockEdges(first, 0, make(center, rotation + 180), 0);
  return translateTables([first, second], center);
}

function trapezoidRing(center: Position, rotation: number, model: TableModel, make: ReturnType<typeof createTableFactory>): TableInstance[] {
  const radius = tableFootprintDepth({ modelId: model.id, width: model.width, depth: model.depth }) * 1.5;
  return Array.from({ length: 6 }, (_, index) => {
    const angle = rotation + index * 60, radians = angle * Math.PI / 180;
    return make({ x: center.x + Math.cos(radians) * radius, y: center.y + Math.sin(radians) * radius }, angle + 90, model);
  });
}

function trapezoidTriangle(center: Position, rotation: number, make: ReturnType<typeof createTableFactory>): TableInstance[] {
  const first = make({ x: 0, y: 0 }, rotation);
  const second = dockEdges(first, 1, make({ x: 0, y: 0 }, rotation + 120), 2);
  const delta = 120 * Math.PI / 180, c = Math.cos(delta), s = Math.sin(delta);
  const determinant = (1 - c) * (1 - c) + s * s;
  const origin = { x: ((1 - c) * second.x - s * second.y) / determinant, y: (s * second.x + (1 - c) * second.y) / determinant };
  const x = second.x - origin.x, y = second.y - origin.y;
  const third = make({ x: origin.x + x * c - y * s, y: origin.y + x * s + y * c }, rotation + 240);
  return translateTables([first, second, third], center);
}

function compatibleRectangle(model: TableModel): TableModel | undefined {
  const shortEdge = model.trapezoidShortEdge ?? model.depth;
  return TABLE_MODELS.find((candidate) => candidate.shape === "rectangular" && Math.abs(candidate.width - model.width) < 1e-6 && Math.abs(candidate.depth - shortEdge) < 1e-6);
}

function elongatedTrapezoidGroup(center: Position, rotation: number, model: TableModel, make: ReturnType<typeof createTableFactory>): TableInstance[] {
  const middle = compatibleRectangle(model);
  if (!middle) return [];
  const local = [
    make({ x: 0, y: -middle.depth / 2 }, 0, middle),
    make({ x: 0, y: middle.depth / 2 }, 0, middle),
  ];
  const footprint = tableFootprintDepth({ modelId: model.id, width: model.width, depth: model.depth });
  local.push(make({ x: 0, y: middle.depth + footprint / 2 }, 0), make({ x: 0, y: -middle.depth - footprint / 2 }, 180));
  return translateTables(local.map((table) => {
    const radians = rotation * Math.PI / 180, c = Math.cos(radians), s = Math.sin(radians);
    return { ...table, x: center.x + table.x * c - table.y * s, y: center.y + table.x * s + table.y * c, rotation: normalizeRotation(table.rotation + rotation) };
  }), center);
}

function trapezoidGroupCandidates(zone: PlanningZone, polygon: Position[], model: TableModel, rotation: number, clearance: number, chairDepth: number, goal: TablePlanningGoal, make: ReturnType<typeof createTableFactory>): PatternCandidate[] {
  const center = zoneCenter(zone), bounds = localBounds(polygon, center, rotation);
  const footprint = tableFootprintDepth({ modelId: model.id, width: model.width, depth: model.depth });
  const reach = chairDepth + .12;
  const maxColumns = Math.max(1, Math.min(6, Math.floor((bounds.maxX - bounds.minX) / (model.width + 2 * reach + clearance))));
  const maxRows = Math.max(1, Math.min(5, Math.floor((bounds.maxY - bounds.minY) / (2 * footprint + 2 * reach + clearance))));
  const goalLimit = goal === "capacity" ? maxColumns * maxRows : goal === "balanced" ? Math.min(4, maxColumns * maxRows) : 1;
  const candidates: PatternCandidate[] = [];
  for (let count = goalLimit; count >= 1; count--) {
    const columns = Math.min(maxColumns, Math.ceil(Math.sqrt(count * maxColumns / Math.max(1, maxRows))));
    const rows = Math.ceil(count / columns), tables: TableInstance[] = [];
    const stepX = model.width + 2 * reach + clearance, stepY = 2 * footprint + 2 * reach + clearance;
    for (let index = 0; index < count; index++) {
      const local = { x: (index % columns - (columns - 1) / 2) * stepX, y: (Math.floor(index / columns) - (rows - 1) / 2) * stepY };
      tables.push(...trapezoidPair(rotateLocal(local, center, rotation), rotation, make));
    }
    candidates.push({ tables, pattern: "pair" });
  }
  return candidates;
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
    chain.forEach((table) => result.push({ ...table, x: Number((table.x - chainCenter.x + target.x).toFixed(6)), y: Number((table.y - chainCenter.y + target.y).toFixed(6)) }));
  }
  return result;
}

type CornerCounts = { horizontal: number; vertical: number };

function sharedBoundaryLength(first: TableInstance, second: TableInstance, tolerance = AUTO_TABLE_CONTACT_TOLERANCE) {
  let longest = 0;
  for (const firstEdge of tableEdges(first)) for (const secondEdge of tableEdges(second)) {
    longest = Math.max(longest, edgeSharedBoundaryLength(firstEdge, secondEdge, tolerance));
  }
  return Math.max(0, longest);
}

function edgeSharedBoundaryLength(firstEdge: ReturnType<typeof tableEdges>[number], secondEdge: ReturnType<typeof tableEdges>[number], tolerance = AUTO_TABLE_CONTACT_TOLERANCE) {
  const dx = firstEdge.end.x - firstEdge.start.x, dy = firstEdge.end.y - firstEdge.start.y;
  const length = Math.hypot(dx, dy), ux = dx / length, uy = dy / length;
  const secondDx = secondEdge.end.x - secondEdge.start.x, secondDy = secondEdge.end.y - secondEdge.start.y;
  const secondLength = Math.hypot(secondDx, secondDy);
  if (Math.abs(ux * secondDy / secondLength - uy * secondDx / secondLength) > tolerance) return 0;
  const lineDistance = (point: Position) => Math.abs((point.x - firstEdge.start.x) * uy - (point.y - firstEdge.start.y) * ux);
  if (lineDistance(secondEdge.start) > tolerance || lineDistance(secondEdge.end) > tolerance) return 0;
  const project = (point: Position) => (point.x - firstEdge.start.x) * ux + (point.y - firstEdge.start.y) * uy;
  const projections = [project(secondEdge.start), project(secondEdge.end)];
  return Math.max(0, Math.min(length, Math.max(...projections)) - Math.max(0, Math.min(...projections)));
}

function hasCompleteCornerContacts(tables: TableInstance[], contactLength: number) {
  let contacts = 0;
  for (let first = 0; first < tables.length; first++) for (let second = first + 1; second < tables.length; second++) {
    const shared = sharedBoundaryLength(tables[first], tables[second]);
    if (shared > AUTO_TABLE_CONTACT_TOLERANCE) {
      if (Math.abs(shared - contactLength) > AUTO_TABLE_CONTACT_TOLERANCE) return false;
      contacts++;
    }
  }
  return contacts === tables.length - 1;
}

/**
 * Returns complete L/U structures from largest to smallest. Reducing both counts
 * independently is intentional: a polygon or an obstacle can constrain only one
 * axis. No candidate ever contains a shortened or missing leg.
 */
function cornerCountCandidates(polygon: Position[], center: Position, model: TableModel, rotation: number, chairDepth: number, goal: TablePlanningGoal, mode: "l-shape" | "u-shape"): CornerCounts[] {
  const bounds = localBounds(polygon, center, rotation), chairReach = chairDepth + .12;
  const goalReduction = goal === "capacity" ? 0 : goal === "balanced" ? 1 : 2;
  const maximumHorizontal = Math.min(10, Math.floor((bounds.maxX - bounds.minX - 2 * chairReach) / model.width) - goalReduction);
  const maximumVertical = Math.min(8, Math.floor((bounds.maxY - bounds.minY - model.depth - 2 * chairReach) / model.width) - goalReduction);
  const candidates: CornerCounts[] = [];
  for (let horizontal = maximumHorizontal; horizontal >= 2; horizontal--) {
    for (let vertical = maximumVertical; vertical >= 2; vertical--) candidates.push({ horizontal, vertical });
  }
  return candidates.sort((first, second) => {
    const firstTables = first.horizontal + first.vertical * (mode === "u-shape" ? 2 : 1);
    const secondTables = second.horizontal + second.vertical * (mode === "u-shape" ? 2 : 1);
    return secondTables - firstTables || second.vertical - first.vertical || second.horizontal - first.horizontal;
  });
}

/**
 * Builds one shared geometric target before deriving table centers from it.
 * The head occupies the full top edge. Each rotated leg starts exactly at its
 * lower contact edge and its outside is flush with the head's outside.
 */
function cornerLayout(zone: PlanningZone, polygon: Position[], model: TableModel, rotation: number, counts: CornerCounts, mode: "l-shape" | "u-shape", make: ReturnType<typeof createTableFactory>) {
  const center = zoneCenter(zone), bounds = localBounds(polygon, center, rotation);
  const localCenter = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
  const headWidth = counts.horizontal * model.width;
  const footprintDepth = model.depth + counts.vertical * model.width;
  const headY = localCenter.y - footprintDepth / 2 + model.depth / 2;
  const leftLegX = localCenter.x - headWidth / 2 + model.depth / 2;
  const rightLegX = localCenter.x + headWidth / 2 - model.depth / 2;
  const result: TableInstance[] = [];

  for (let index = 0; index < counts.horizontal; index++) {
    const x = localCenter.x - headWidth / 2 + model.width * (index + .5);
    result.push(make(rotateLocal({ x, y: headY }, center, rotation), rotation));
  }
  for (let index = 0; index < counts.vertical; index++) {
    const y = headY + model.depth / 2 + model.width * (index + .5);
    result.push(make(rotateLocal({ x: leftLegX, y }, center, rotation), rotation + 90));
    if (mode === "u-shape") result.push(make(rotateLocal({ x: rightLegX, y }, center, rotation), rotation + 90));
  }
  const limited = result.slice(0, MAX_CANDIDATE_TABLES);
  return hasCompleteCornerContacts(limited, model.depth) ? limited : [];
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
    && !fixedTables.some((other) => polygonsInteriorOverlap(polygon, tablePolygon(other), AUTO_TABLE_CONTACT_TOLERANCE))
    && !fixedChairs.some((chair) => polygonsOverlap(polygon, rotatedRectangle(chair)))
    && !accepted.some((other) => polygonsInteriorOverlap(polygon, tablePolygon(other), AUTO_TABLE_CONTACT_TOLERANCE));
}

function seatTrapezoidExterior(plan: RoomPlan, zone: PlanningZone, tables: TableInstance[], fixedChairs: FurnitureChair[], forbidden: Position[][], pattern: TrapezoidPattern) {
  const chairSize = { width: plan.chairSelection?.width ?? .5, depth: plan.chairSelection?.depth ?? .55 };
  const zoneRoom = asRoom(zonePolygon(zone));
  const chairs: FurnitureChair[] = [];
  let requested = 0;
  for (const table of tables) {
    for (const edge of tableEdges(table)) {
      const internal = tables.some((other) => other.id !== table.id && tableEdges(other).some((otherEdge) => edgeSharedBoundaryLength(edge, otherEdge) >= edge.length - AUTO_TABLE_CONTACT_TOLERANCE));
      if (internal || pattern === "ring" && edge.kind !== "long") continue;
      const slots = edge.kind === "long" ? 2 : 1;
      requested += slots;
      const dx = edge.end.x - edge.start.x, dy = edge.end.y - edge.start.y, length = Math.hypot(dx, dy);
      const outward = { x: dy / length, y: -dx / length }, inward = { x: -outward.x, y: -outward.y };
      for (let slot = 0; slot < slots; slot++) {
        const along = (slot + .5) / slots;
        const candidate: FurnitureChair = {
          id: `${table.id}-chair-e${edge.index}-${slot + 1}`,
          x: edge.start.x + dx * along + outward.x * (chairSize.depth / 2 + .1),
          y: edge.start.y + dy * along + outward.y * (chairSize.depth / 2 + .1),
          rotation: normalizeRotation(Math.atan2(inward.x, -inward.y) * 180 / Math.PI),
          width: chairSize.width,
          depth: chairSize.depth,
          groupId: table.groupId,
          tableId: table.id,
          source: "auto",
        };
        const polygon = rotatedRectangle(candidate);
        if (polygonInsideRoom(polygon, plan.contour)
          && polygonInsideRoom(polygon, zoneRoom)
          && !forbidden.some((area) => area.length >= 3 && polygonsOverlap(polygon, area))
          && !tables.some((other) => polygonsOverlap(polygon, tablePolygon(other)))
          && !fixedChairs.some((other) => polygonsOverlap(polygon, rotatedRectangle(other)))
          && !chairs.some((other) => polygonsOverlap(polygon, rotatedRectangle(other)))) chairs.push(candidate);
      }
    }
  }
  return { chairs, requested };
}

function evaluate(plan: RoomPlan, zone: PlanningZone, mode: TableLayoutMode, goal: TablePlanningGoal, generated: TableInstance[], fixedTables: TableInstance[], fixedChairs: FurnitureChair[], forbidden: Position[][], withChairs: boolean, clearance: number, pattern?: TrapezoidPattern): Proposal | null {
  const zoneRoom = asRoom(zonePolygon(zone));
  const accepted: TableInstance[] = [];
  for (const table of generated) {
    if (tableFits(table, plan, zoneRoom, fixedTables, fixedChairs, forbidden, accepted)) accepted.push(table);
    else if (mode === "l-shape" || mode === "u-shape" || mode.startsWith("trapezoid-")) return null;
  }
  if (!accepted.length || mode === "long-tables" && accepted.length < 2) return null;
  let chairs: FurnitureChair[] = [], requestedSeats = 0;
  const groups: TableGroup[] = [];
  if (withChairs && pattern) {
    const exterior = seatTrapezoidExterior(plan, zone, accepted, fixedChairs, forbidden, pattern);
    chairs = exterior.chairs;
    requestedSeats = exterior.requested;
    for (const table of accepted) groups.push({ id: table.groupId!, tableIds: [table.id], chairIds: chairs.filter((chair) => chair.tableId === table.id).map((chair) => chair.id) });
  } else {
    let chairPlan: RoomPlan = { ...plan, tables: [...fixedTables, ...accepted], chairs: fixedChairs };
    for (const table of accepted) {
      const requested = tableModel(table.modelId).defaultSeats;
      requestedSeats += withChairs ? requested : 0;
      const result = withChairs ? seatTable(chairPlan, table.id, tableModel(table.modelId).shape === "trapezoid" ? 6 : requested) : undefined;
      const placed = result?.chairs ?? [];
      chairs = [...chairs, ...placed];
      chairPlan = { ...chairPlan, chairs: [...(chairPlan.chairs ?? []), ...placed] };
      groups.push({ id: table.groupId!, tableIds: [table.id], chairIds: placed.map((chair) => chair.id) });
    }
  }
  return { tables: accepted, chairs, groups, requestedSeats, clearance, score: score(goal, accepted.length, chairs.length, requestedSeats, clearance), pattern };
}

/**
 * Bounded deterministic search. It evaluates a finite set of complete geometry
 * candidates, never runs the full rule/egress pipeline, and returns only
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
  if (options.mode.startsWith("trapezoid-") && model.shape !== "trapezoid") {
    return done({ ...base, suggestedMode: "individual", message: `${MODE_LABEL[options.mode]} benötigt ein Trapeztischmodell.` });
  }
  if ((options.mode === "l-shape" || options.mode === "u-shape") && model.shape !== "rectangular") {
    return done({ ...base, suggestedMode: "individual", message: `${MODE_LABEL[options.mode]} benötigt für bündige 90°-Anschlüsse ein rechteckiges Tischmodell. Für Trapeztische steht die passende Stellform bereit.` });
  }

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
  const chairDepth = plan.chairSelection?.depth ?? .55;
  let evaluatedVariants = 0;
  for (const rotation of rotations) {
    if (options.mode.startsWith("trapezoid-")) {
      const candidates: PatternCandidate[] = [];
      if (options.mode === "trapezoid-auto" || options.mode === "trapezoid-groups") {
        const used = new Set([...fixedTables.map((table) => table.id), ...fixedChairs.map((chair) => chair.id)]);
        candidates.push(...trapezoidGroupCandidates(zone, polygon, model, rotation, clearance, chairDepth, options.goal, createTableFactory(model, zone, options.goal, options.mode, clearance, used)));
      }
      if (options.mode === "trapezoid-auto" || options.mode === "trapezoid-islands") {
        for (const pattern of ["ring", "triangle"] as const) {
          const used = new Set([...fixedTables.map((table) => table.id), ...fixedChairs.map((chair) => chair.id)]);
          const make = createTableFactory(model, zone, options.goal, options.mode, clearance, used);
          candidates.push({ tables: pattern === "ring" ? trapezoidRing(zoneCenter(zone), rotation, model, make) : trapezoidTriangle(zoneCenter(zone), rotation, make), pattern });
        }
      }
      if (options.mode === "trapezoid-auto" || options.mode === "trapezoid-long") {
        const used = new Set([...fixedTables.map((table) => table.id), ...fixedChairs.map((chair) => chair.id)]);
        const make = createTableFactory(model, zone, options.goal, options.mode, clearance, used);
        candidates.push({ tables: elongatedTrapezoidGroup(zoneCenter(zone), rotation, model, make), pattern: "elongated" });
      }
      for (const candidate of candidates) {
        const proposal = evaluate(plan, zone, options.mode, options.goal, candidate.tables, fixedTables, fixedChairs, forbidden, options.withChairs, clearance, candidate.pattern);
        evaluatedVariants++;
        if (proposal) proposals.push(proposal);
      }
      continue;
    }
    if (options.mode === "l-shape" || options.mode === "u-shape") {
      const counts = cornerCountCandidates(polygon, zoneCenter(zone), model, rotation, chairDepth, options.goal, options.mode);
      for (const count of counts) {
        const used = new Set([...fixedTables.map((table) => table.id), ...fixedChairs.map((chair) => chair.id)]);
        const make = createTableFactory(model, zone, options.goal, options.mode, clearance, used);
        const generated = cornerLayout(zone, polygon, model, rotation, count, options.mode, make);
        const proposal = evaluate(plan, zone, options.mode, options.goal, generated, fixedTables, fixedChairs, forbidden, options.withChairs, clearance);
        evaluatedVariants++;
        if (proposal) proposals.push(proposal);
      }
      continue;
    }
    for (const phase of phases) {
      const used = new Set([...fixedTables.map((table) => table.id), ...fixedChairs.map((chair) => chair.id)]);
      const make = createTableFactory(model, zone, options.goal, options.mode, clearance, used);
      const generated = options.mode === "individual"
        ? individualLayout(zone, polygon, model, rotation, clearance, chairDepth, phase, make)
        : longTableLayout(zone, polygon, model, rotation, clearance, chairDepth, options.goal, make);
      const proposal = evaluate(plan, zone, options.mode, options.goal, generated, fixedTables, fixedChairs, forbidden, options.withChairs, clearance);
      evaluatedVariants++;
      if (proposal) proposals.push(proposal);
    }
  }
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
    message: `${MODE_LABEL[options.mode]}${best.pattern ? ` – ${PATTERN_LABEL[best.pattern]}` : ""}: ${best.tables.length} ${best.tables.length === 1 ? "Tisch" : "Tische"} und ${best.chairs.length} tatsächlich angelegte Tischplätze.${omittedSeats ? ` ${omittedSeats} mögliche Plätze wurden wegen Geometrie, Kollision oder Zugang nicht angelegt.` : ""} Sicherheits- und Rettungswegdetails der Tischplätze sind ungeprüft und fachlich zu bewerten.`,
  });
}

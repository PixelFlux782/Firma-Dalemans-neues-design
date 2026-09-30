import { aislePolygon, doorSegment, isBlockingObject, obstaclePolygon, pointInPolygon, polygonsOverlap, type AisleObject, type DoorObject, type Position, type RoomPlan } from "../objects";
import { seatPolygon, type SeatPlacement, type SeatingPlan } from "../seating";
import type { RuleProfile } from "../rules/profiles";

export type EgressNode = { id: string; type: "aisle" | "junction" | "exit"; point: Position };
export type EgressEdge = { from: string; to: string; length: number; width?: number; aisleId?: string };
export type EgressGraph = { nodes: EgressNode[]; edges: EgressEdge[] };
export type EscapeRouteResult = { originId: string; blockId: string; exitDoorId?: string; distance: number; path: Position[]; nodeIds?: string[]; valid: boolean; aisleId?: string; side?: "left" | "right"; seatsToAisle?: number };
export type RowAccess = { blockId: string; row: number; seatIds: string[]; leftAisleId?: string; rightAisleId?: string; leftNodeId?: string; rightNodeId?: string };
export type ExitLoad = { doorId: string; persons: number; clearWidth: number; requiredWidth?: number };
export type AisleLoad = { aisleId: string; persons: number; width: number; requiredWidth?: number };
export type EgressAnalysis = { graph: EgressGraph; routes: EscapeRouteResult[]; rowAccess: RowAccess[]; exitLoads: ExitLoad[]; aisleLoads: AisleLoad[]; longestValidRoute: number; longestRouteSeatId?: string; seatsWithoutRoute: number; narrowestAisle?: number };

const EPS = 1e-7;
const dist = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.y - b.y);
const cross = (a: Position, b: Position) => a.x * b.y - a.y * b.x;
const sub = (a: Position, b: Position) => ({ x: a.x - b.x, y: a.y - b.y });
const pointOn = (a: Position, b: Position, t: number): Position => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const projection = (p: Position, a: Position, b: Position) => Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (dist(a, b) ** 2 || 1)));
const key = (p: Position) => `${p.x.toFixed(6)}:${p.y.toFixed(6)}`;
function intersections(a: Position, b: Position, c: Position, d: Position): [number, number] | null {
  const r = sub(b, a), s = sub(d, c), denominator = cross(r, s);
  if (Math.abs(denominator) < EPS) return null;
  const t = cross(sub(c, a), s) / denominator, u = cross(sub(c, a), r) / denominator;
  return t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS ? [Math.max(0, Math.min(1, t)), Math.max(0, Math.min(1, u))] : null;
}
function segmentClear(a: Position, b: Position, plan: RoomPlan, seating: SeatingPlan, ignoreSeatIds: Set<string> = new Set()): boolean {
  if (!pointInPolygon(pointOn(a, b, 0.5), plan.contour.points)) return false;
  const obstacles = plan.objects.filter(isBlockingObject).map(obstaclePolygon);
  const chairRadius = Math.hypot(seating.rules.chairWidth, seating.rules.chairDepth) / 2;
  const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x), minY = Math.min(a.y, b.y), maxY = Math.max(a.y, b.y);
  const seats = seating.seats.filter((s) => !ignoreSeatIds.has(s.id) && s.x + chairRadius >= minX && s.x - chairRadius <= maxX && s.y + chairRadius >= minY && s.y - chairRadius <= maxY);
  const polygons = [...obstacles, ...seats.map((s) => seatPolygon(s.x, s.y, seating.rules, seating.orientation, s.rotation))];
  return !polygons.some((polygon) => pointInPolygon(pointOn(a, b, 0.25), polygon) || pointInPolygon(pointOn(a, b, 0.5), polygon) || pointInPolygon(pointOn(a, b, 0.75), polygon) || polygon.some((p, i) => intersections(a, b, p, polygon[(i + 1) % polygon.length])));
}
export function buildEgressGraph(plan: RoomPlan, seating: SeatingPlan): EgressGraph {
  const obstacles = plan.objects.filter(isBlockingObject).map(obstaclePolygon);
  const aisles = plan.objects.filter((o): o is AisleObject => o.type === "aisle" && !obstacles.some((polygon) => polygonsOverlap(aislePolygon(o), polygon)));
  const exits = plan.objects.filter((o): o is DoorObject => o.type === "door" && (o.role === "exit" || o.role === "emergency_exit"));
  const nodes: EgressNode[] = [], edges: EgressEdge[] = [];
  const cuts = new Map(aisles.map((a) => [a.id, [0, 1]]));
  for (const aisle of aisles) {
    for (const seat of seating.seats) {
      const t = projection(seat, aisle.start, aisle.end);
      if (dist(seat, pointOn(aisle.start, aisle.end, t)) <= aisle.width / 2 + seating.rules.chairWidth / 2 + seating.rules.defaultAisleWidth) cuts.get(aisle.id)!.push(t);
    }
    for (const door of exits) {
      const segment = doorSegment(plan.contour, door);
      if (segment) cuts.get(aisle.id)!.push(projection(pointOn(segment.start, segment.end, 0.5), aisle.start, aisle.end));
    }
  }
  for (let i = 0; i < aisles.length; i++) for (let j = i + 1; j < aisles.length; j++) {
    if (!polygonsOverlap(aislePolygon(aisles[i]), aislePolygon(aisles[j]))) continue;
    const hit = intersections(aisles[i].start, aisles[i].end, aisles[j].start, aisles[j].end);
    if (hit) { cuts.get(aisles[i].id)!.push(hit[0]); cuts.get(aisles[j].id)!.push(hit[1]); }
  }
  const byPoint = new Map<string, string>();
  const addNode = (point: Position, type: EgressNode["type"], id?: string) => {
    const existing = !id && byPoint.get(key(point));
    if (existing) return existing;
    const nodeId = id ?? `node-${nodes.length + 1}`;
    nodes.push({ id: nodeId, type, point });
    if (!id) byPoint.set(key(point), nodeId);
    return nodeId;
  };
  for (const aisle of aisles) {
    const ordered = [...new Set(cuts.get(aisle.id)!.map((t) => Number(t.toFixed(8))))].sort((a, b) => a - b);
    for (let i = 0; i < ordered.length; i++) {
      const point = pointOn(aisle.start, aisle.end, ordered[i]);
      const id = addNode(point, ordered[i] > 0 && ordered[i] < 1 ? "junction" : "aisle");
      if (i) {
        const previous = pointOn(aisle.start, aisle.end, ordered[i - 1]);
        edges.push({ from: addNode(previous, "aisle"), to: id, length: dist(previous, point), width: aisle.width, aisleId: aisle.id });
      }
    }
  }
  for (const door of exits) {
    const segment = doorSegment(plan.contour, door);
    if (!segment) continue;
    const midpoint = pointOn(segment.start, segment.end, 0.5);
    const exitId = addNode(midpoint, "exit", `exit-${door.id}`);
    for (const aisle of aisles) {
      const t = projection(midpoint, aisle.start, aisle.end), point = pointOn(aisle.start, aisle.end, t);
      if (dist(point, midpoint) > Math.max(aisle.width / 2 + door.width / 2, seating.rules.minimumDoorClearance) + EPS) continue;
      if (!segmentClear(point, midpoint, plan, seating)) continue;
      const nearby = nodes.filter((n) => n.id !== exitId && n.type !== "exit" && dist(n.point, point) <= aisle.width / 2 + EPS).sort((a, b) => dist(a.point, point) - dist(b.point, point) || a.id.localeCompare(b.id))[0];
      if (nearby) edges.push({ from: nearby.id, to: exitId, length: dist(nearby.point, midpoint), width: Math.min(aisle.width, door.clearWidth ?? door.width) });
    }
  }
  return { nodes, edges };
}

function shortestPaths(graph: EgressGraph, exitId: string): Map<string, { distance: number; next?: string }> {
  const adjacency = new Map(graph.nodes.map((n) => [n.id, [] as { id: string; length: number }[]]));
  for (const edge of graph.edges) { adjacency.get(edge.from)?.push({ id: edge.to, length: edge.length }); adjacency.get(edge.to)?.push({ id: edge.from, length: edge.length }); }
  const result = new Map<string, { distance: number; next?: string }>([[exitId, { distance: 0 }]]), pending = new Set([exitId]);
  while (pending.size) {
    const current = [...pending].sort((a, b) => result.get(a)!.distance - result.get(b)!.distance || a.localeCompare(b))[0];
    pending.delete(current);
    for (const edge of adjacency.get(current) ?? []) {
      const candidate = result.get(current)!.distance + edge.length;
      if (candidate + EPS < (result.get(edge.id)?.distance ?? Infinity)) { result.set(edge.id, { distance: candidate, next: current }); pending.add(edge.id); }
    }
  }
  return result;
}

export function analyzeEgress(plan: RoomPlan, seating: SeatingPlan, profile: RuleProfile): EgressAnalysis {
  const graph = buildEgressGraph(plan, seating);
  const obstacles = plan.objects.filter(isBlockingObject).map(obstaclePolygon);
  const aisles = plan.objects.filter((o): o is AisleObject => o.type === "aisle" && !obstacles.some((polygon) => polygonsOverlap(aislePolygon(o), polygon)));
  const exits = plan.objects.filter((o): o is DoorObject => o.type === "door" && (o.role === "exit" || o.role === "emergency_exit"));
  const shortest = new Map(exits.map((door) => [door.id, shortestPaths(graph, `exit-${door.id}`)]));
  const rowAccess: RowAccess[] = [], routes: EscapeRouteResult[] = [];
  const angle = (seating.rotation ?? (seating.orientation === "horizontal" ? 0 : 90)) * Math.PI / 180;
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const along = (s: SeatPlacement) => seating.rotation === undefined && seating.orientation === "vertical" ? s.y : s.x * direction.x + s.y * direction.y;
  const seatHalf = seating.rules.chairWidth / 2;
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  for (const block of seating.blocks) {
    const rows = new Map<number, SeatPlacement[]>();
    for (const seat of block.seats) rows.set(seat.row, [...(rows.get(seat.row) ?? []), seat]);
    for (const [row, unordered] of rows) {
      const seats = unordered.sort((a, b) => along(a) - along(b));
      const access: RowAccess = { blockId: block.id, row, seatIds: seats.map((s) => s.id) };
      const choices: { side: "left" | "right"; aisle: AisleObject; node: EgressNode; point: Position; outward: Position; distance: number }[] = [];
      for (const side of ["left", "right"] as const) {
        const seat = side === "left" ? seats[0] : seats.at(-1)!;
        const sign = side === "left" ? -1 : 1;
        const outward: Position = { x: seat.x + sign * seatHalf * direction.x, y: seat.y + sign * seatHalf * direction.y };
        for (const aisle of aisles) {
          const t = projection(outward, aisle.start, aisle.end), point = pointOn(aisle.start, aisle.end, t);
          const gap = dist(outward, point) - aisle.width / 2;
          if (gap > seating.rules.defaultAisleWidth + EPS) continue;
          if (sign * ((point.x - outward.x) * direction.x + (point.y - outward.y) * direction.y) < -EPS) continue;
          if (!segmentClear(outward, point, plan, seating, new Set([seat.id]))) continue;
          const node = graph.nodes.filter((n) => n.type !== "exit" && dist(n.point, point) <= aisle.width / 2 + EPS).sort((a, b) => dist(a.point, point) - dist(b.point, point) || a.id.localeCompare(b.id))[0];
          if (node) choices.push({ side, aisle, node, point, outward, distance: dist(outward, point) + dist(point, node.point) + seatHalf });
        }
        const best = choices.filter((c) => c.side === side).sort((a, b) => a.distance - b.distance || a.aisle.id.localeCompare(b.aisle.id))[0];
        if (best) { if (side === "left") { access.leftAisleId = best.aisle.id; access.leftNodeId = best.node.id; } else { access.rightAisleId = best.aisle.id; access.rightNodeId = best.node.id; } }
      }
      rowAccess.push(access);
      for (const seat of seats) {
        const options = choices.flatMap((choice) => exits.map((door) => {
          const pathInfo = shortest.get(door.id)?.get(choice.node.id);
          return pathInfo ? { choice, door, distance: Math.abs(along(seat) - along(choice.side === "left" ? seats[0] : seats.at(-1)!)) + choice.distance + pathInfo.distance } : null;
        }).filter((x): x is NonNullable<typeof x> => x !== null));
        options.sort((a, b) => a.distance - b.distance || a.door.id.localeCompare(b.door.id) || a.choice.aisle.id.localeCompare(b.choice.aisle.id));
        const best = options[0];
        if (!best) { routes.push({ originId: seat.id, blockId: block.id, distance: Infinity, path: [], valid: false }); continue; }
        const endSeat = best.choice.side === "left" ? seats[0] : seats.at(-1)!;
        const path: Position[] = [{ x: seat.x, y: seat.y }, { x: endSeat.x, y: endSeat.y }, best.choice.outward, best.choice.point];
        const nodeIds: string[] = [];
        let nodeId: string | undefined = best.choice.node.id;
        while (nodeId) { const node = nodeById.get(nodeId); if (node) path.push(node.point); nodeIds.push(nodeId); nodeId = shortest.get(best.door.id)?.get(nodeId)?.next; }
        const count = best.choice.side === "left" ? seats.indexOf(seat) + 1 : seats.length - seats.indexOf(seat);
        routes.push({ originId: seat.id, blockId: block.id, exitDoorId: best.door.id, distance: best.distance, path, nodeIds, valid: true, aisleId: best.choice.aisle.id, side: best.choice.side, seatsToAisle: count });
      }
    }
  }
  const valid = routes.filter((route) => route.valid);
  const longest = [...valid].sort((a, b) => b.distance - a.distance || a.originId.localeCompare(b.originId))[0];
  const exitLoads = exits.map((door) => {
    const persons = valid.filter((route) => route.exitDoorId === door.id).length;
    const { widthUnit, personsPerWidthUnit, minimumExitWidth } = profile.egress;
    const requiredWidth = widthUnit && personsPerWidthUnit && persons ? Math.max(minimumExitWidth ?? 0, Math.ceil(persons / personsPerWidthUnit) * widthUnit) : minimumExitWidth;
    return { doorId: door.id, persons, clearWidth: door.clearWidth ?? door.width, requiredWidth };
  });
  const edgeLoads = new Map<number, number>();
  for (const route of valid) for (let i = 1; i < (route.nodeIds?.length ?? 0); i++) {
    const a = route.nodeIds![i - 1], b = route.nodeIds![i];
    const index = graph.edges.findIndex((edge) => edge.from === a && edge.to === b || edge.from === b && edge.to === a);
    if (index >= 0) edgeLoads.set(index, (edgeLoads.get(index) ?? 0) + 1);
  }
  const aisleLoads = aisles.map((aisle) => {
    const accessPersons = valid.filter((route) => route.aisleId === aisle.id).length;
    const persons = Math.max(accessPersons, ...graph.edges.map((edge, index) => edge.aisleId === aisle.id ? edgeLoads.get(index) ?? 0 : 0));
    const { widthUnit, personsPerWidthUnit } = profile.egress;
    const requiredWidth = widthUnit && personsPerWidthUnit && persons ? Math.ceil(persons / personsPerWidthUnit) * widthUnit : undefined;
    return { aisleId: aisle.id, persons, width: aisle.width, requiredWidth };
  });
  return { graph, routes, rowAccess, exitLoads, aisleLoads, longestValidRoute: longest?.distance ?? 0, longestRouteSeatId: longest?.originId, seatsWithoutRoute: routes.length - valid.length, narrowestAisle: aisles.length ? Math.min(...aisles.map((a) => a.width)) : undefined };
}

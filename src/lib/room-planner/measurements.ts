import { formatMeters, wallLength } from "./geometry";
import { aislePolygon, doorSegment, isBlockingObject, obstaclePolygon, pointInPolygon, polygonsOverlap, wallEndpoints, type Position, type RoomPlan } from "./objects";
import { seatPolygon, type SeatingPlan } from "./seating";

export type Measurement = { id: string; kind: "wall" | "door" | "aisle" | "object" | "block" | "detail"; a: Position; b: Position; label: string; side: number; offset: number; priority: number; selected?: boolean };
const midpoint = (a: Position, b: Position): Position => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const segment = (id: string, kind: Measurement["kind"], a: Position, b: Position, label: string, side = -1, offset = .35, priority = 1, selected = false): Measurement => ({ id, kind, a, b, label, side, offset, priority, selected });
function nearestWallGap(plan: RoomPlan, id: string, vertices: Position[]): Measurement | null {
  let best: { a: Position; b: Position; length: number } | null = null;
  for (const vertex of vertices) for (const wall of plan.contour.walls) {
    const ends = wallEndpoints(plan.contour, wall.id);
    if (!ends) continue;
    const dx = ends.b.x - ends.a.x, dy = ends.b.y - ends.a.y, divisor = dx * dx + dy * dy;
    if (divisor < 1e-8) continue;
    const t = Math.max(0, Math.min(1, ((vertex.x - ends.a.x) * dx + (vertex.y - ends.a.y) * dy) / divisor));
    const foot = { x: ends.a.x + dx * t, y: ends.a.y + dy * t };
    const length = wallLength(vertex, foot);
    if (length > .01 && (!best || length < best.length)) best = { a: vertex, b: foot, length };
  }
  return best ? segment(`${id}-wall-gap`, "detail", best.a, best.b, formatMeters(best.length), -1, .2, 0, true) : null;
}
function nearestElementGap(shapes: { id: string; points: Position[] }[], selectedId: string): Measurement | null {
  const source = shapes.find((shape) => shape.id === selectedId);
  if (!source || source.points.length < 2) return null;
  let best: { a: Position; b: Position; length: number } | null = null;
  const edges = (points: Position[]) => points.map((p, index) => [p, points[(index + 1) % points.length]] as const).slice(0, points.length === 2 ? 1 : undefined);
  const compare = (vertices: Position[], outline: Position[], reverse: boolean) => {
    for (const p of vertices) for (const [a, b] of edges(outline)) {
      const dx = b.x - a.x, dy = b.y - a.y, divisor = dx * dx + dy * dy;
      if (divisor < 1e-8) continue;
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / divisor));
      const q = { x: a.x + dx * t, y: a.y + dy * t };
      const length = wallLength(p, q);
      if (length > .01 && (!best || length < best.length)) best = { a: reverse ? q : p, b: reverse ? p : q, length };
    }
  };
  for (const target of shapes) {
    if (target.id === selectedId || target.points.length < 2) continue;
    if (source.points.length > 2 && target.points.length > 2 && polygonsOverlap(source.points, target.points)) continue;
    compare(source.points, target.points, false);
    compare(target.points, source.points, true);
  }
  const found = best as { a: Position; b: Position; length: number } | null;
  return found ? segment(`${selectedId}-element-gap`, "detail", found.a, found.b, formatMeters(found.length), 1, .25, 0, true) : null;
}

// Measurements are derived from the plan. They never store or mutate a second copy of geometry.
export function planMeasurements(plan: RoomPlan, seating: SeatingPlan | null | undefined = plan.seating, selectedId?: string): Measurement[] {
  const result: Measurement[] = [];
  const shapes: { id: string; points: Position[] }[] = [];
  const room = plan.contour;
  for (const wall of room.walls) {
    const ends = wallEndpoints(room, wall.id);
    if (!ends) continue;
    const { a, b } = ends;
    const dx = b.x - a.x, dy = b.y - a.y, length = wallLength(a, b);
    if (length < 1e-8) continue;
    const m = midpoint(a, b), normal = { x: -dy / length, y: dx / length };
    const probe = { x: m.x + normal.x * Math.min(.08, length / 5), y: m.y + normal.y * Math.min(.08, length / 5) };
    const side = room.closed && pointInPolygon(probe, room.points) ? -1 : 1;
    result.push(segment(wall.id, "wall", a, b, formatMeters(length), side, .48, 3, selectedId === wall.id));
  }
  for (const object of plan.objects) {
    const selected = selectedId === object.id;
    if (object.type === "door") {
      const opening = doorSegment(room, object);
      if (!opening) continue;
      shapes.push({ id: object.id, points: [opening.start, opening.end] });
      const wall = wallEndpoints(room, object.wallId);
      const wallDimension = result.find((m) => m.id === object.wallId);
      result.push(segment(object.id, "door", opening.start, opening.end, formatMeters(object.width), -(wallDimension?.side ?? -1), .34, 2, selected));
      if (selected && wall) {
        if (object.offset > .05) result.push(segment(`${object.id}-before`, "detail", wall.a, opening.start, formatMeters(object.offset), -(wallDimension?.side ?? -1), .8, 0, true));
        const remaining = wallLength(wall.a, wall.b) - object.offset - object.width;
        if (remaining > .05) result.push(segment(`${object.id}-after`, "detail", opening.end, wall.b, formatMeters(remaining), -(wallDimension?.side ?? -1), .8, 0, true));
      }
    } else if (object.type === "aisle") {
      const corners = aislePolygon(object);
      if (corners.length !== 4) continue;
      shapes.push({ id: object.id, points: corners });
      result.push(segment(`${object.id}-length`, "aisle", corners[0], corners[1], formatMeters(wallLength(object.start, object.end)), -1, .18, 2, selected));
      result.push(segment(`${object.id}-width`, "aisle", corners[1], corners[2], formatMeters(object.width), -1, .18, 2, selected));
      if (selected) { const gap = nearestWallGap(plan, object.id, corners); if (gap) result.push(gap); }
    } else if (isBlockingObject(object)) {
      const corners = obstaclePolygon(object);
      shapes.push({ id: object.id, points: corners });
      result.push(segment(`${object.id}-width`, "object", corners[0], corners[1], formatMeters(object.width), -1, .22, 2, selected));
      result.push(segment(`${object.id}-depth`, "object", corners[1], corners[2], formatMeters(object.depth), -1, .22, 2, selected));
      if (selected) { const gap = nearestWallGap(plan, object.id, corners); if (gap) result.push(gap); }
    }
  }
  if (seating) for (const block of seating.blocks) {
    if (!block.seats.length) continue;
    const selected = selectedId === block.id;
    const points = block.seats.flatMap((seat) => seatPolygon(seat.x, seat.y, seating.rules, seating.orientation, seat.rotation));
    const angle = (block.rotation ?? block.seats[0].rotation ?? (seating.orientation === "vertical" ? 90 : 0)) * Math.PI / 180;
    const c = Math.cos(angle), s = Math.sin(angle);
    const local = points.map((p) => ({ x: p.x * c + p.y * s, y: -p.x * s + p.y * c }));
    const left = Math.min(...local.map((p) => p.x)), right = Math.max(...local.map((p) => p.x));
    const top = Math.min(...local.map((p) => p.y)), bottom = Math.max(...local.map((p) => p.y));
    const world = (x: number, y: number) => ({ x: x * c - y * s, y: x * s + y * c });
    shapes.push({ id: block.id, points: [world(left, top), world(right, top), world(right, bottom), world(left, bottom)] });
    result.push(segment(`${block.id}-width`, "block", world(left, top), world(right, top), formatMeters(right - left), -1, .2, 1, selected));
    result.push(segment(`${block.id}-depth`, "block", world(right, top), world(right, bottom), formatMeters(bottom - top), 1, .2, 1, selected));
    if (selected) {
      const pitch = block.rowPitch ?? seating.rules.rowPitch;
      result.push(segment(`${block.id}-pitch`, "detail", world(left, bottom), world(right, bottom), `Reihenabstand ${formatMeters(pitch)}`, 1, .45, 0, true));
      const gap = nearestWallGap(plan, block.id, points); if (gap) result.push(gap);
    }
  }
  if (selectedId) { const gap = nearestElementGap(shapes, selectedId); if (gap) result.push(gap); }
  return result;
}

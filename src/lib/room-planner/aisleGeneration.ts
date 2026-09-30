import { aislePolygon, doorSegment, isBlockingObject, obstaclePolygon, polygonInsideRoom, polygonsOverlap, type AisleObject, type DoorObject, type Position, type RoomPlan } from "./objects";
import type { SeatingPlan } from "./seating";

const EPS = 0.02;
const distance = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.y - b.y);
const projection = (p: Position, a: Position, b: Position) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  return Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
};
const nearest = (p: Position, aisle: AisleObject): Position => {
  const t = projection(p, aisle.start, aisle.end);
  return { x: aisle.start.x + (aisle.end.x - aisle.start.x) * t, y: aisle.start.y + (aisle.end.y - aisle.start.y) * t };
};

export function nearDuplicateAisle(candidate: AisleObject, existing: AisleObject): boolean {
  const a = { x: candidate.end.x - candidate.start.x, y: candidate.end.y - candidate.start.y };
  const b = { x: existing.end.x - existing.start.x, y: existing.end.y - existing.start.y };
  const alignment = Math.abs((a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y) || 1));
  if (alignment < 0.98) return false;
  const tolerance = Math.min(candidate.width, existing.width) / 2;
  const endsCovered = [candidate.start, candidate.end].every((p) => distance(p, nearest(p, existing)) <= tolerance);
  return endsCovered || [existing.start, existing.end].every((p) => distance(p, nearest(p, candidate)) <= tolerance);
}

export function generateAisleGroups(plan: RoomPlan, seating: SeatingPlan, width: number, maximum: number): AisleObject[][] {
  if (!seating.seats.length || maximum < 1) return [];
  const rotation = (seating.rotation ?? (seating.orientation === "horizontal" ? 0 : 90)) * Math.PI / 180;
  const c = Math.cos(rotation), s = Math.sin(rotation);
  const along = (p: Position) => p.x * c + p.y * s;
  const cross = (p: Position) => -p.x * s + p.y * c;
  const world = (a: number, b: number): Position => ({ x: a * c - b * s, y: a * s + b * c });
  const seatsA = seating.seats.map(along), seatsC = seating.seats.map(cross);
  const minA = Math.min(...seatsA), maxA = Math.max(...seatsA);
  const minC = Math.min(...seatsC), maxC = Math.max(...seatsC);
  const roomA = plan.contour.points.map(along), roomC = plan.contour.points.map(cross);
  const margin = width / 2 + EPS;
  const clampA = (v: number) => Math.max(Math.min(...roomA) + margin, Math.min(Math.max(...roomA) - margin, v));
  const clampC = (v: number) => Math.max(Math.min(...roomC) + margin, Math.min(Math.max(...roomC) - margin, v));
  const side = seating.rules.chairWidth / 2 + width / 2 + seating.rules.minimumSideClearance;
  const make = (id: string, a1: number, b1: number, a2: number, b2: number): AisleObject => ({ id: `variant-${id}`, type: "aisle", source: "generated", start: world(clampA(a1), clampC(b1)), end: world(clampA(a2), clampC(b2)), width });
  const longitudinal = (id: string, a: number) => make(id, a, minC - seating.rules.rowPitch / 2, a, maxC + seating.rules.rowPitch / 2);
  const center = longitudinal("center", (minA + maxA) / 2);
  const left = longitudinal("left", minA - side), right = longitudinal("right", maxA + side);
  const crossAisle = make("cross", minA - side, (minC + maxC) / 2, maxA + side, (minC + maxC) / 2);
  const candidates: AisleObject[][] = [[center], [center, crossAisle], [left, right], [left], [right], [crossAisle], [center, left], [center, right]];
  const blocks = seating.blocks.filter((block) => block.seats.length).map((block) => ({
    id: block.id, minA: Math.min(...block.seats.map(along)), maxA: Math.max(...block.seats.map(along)),
    minC: Math.min(...block.seats.map(cross)), maxC: Math.max(...block.seats.map(cross)),
  })).sort((a, b) => a.minA - b.minA || a.id.localeCompare(b.id));
  for (let i = 0; i < blocks.length - 1; i++) {
    const first = blocks[i], second = blocks[i + 1];
    if (second.minA <= first.maxA || Math.min(first.maxC, second.maxC) < Math.max(first.minC, second.minC)) continue;
    candidates.push([longitudinal(`blocks-${first.id}-${second.id}`, (first.maxA + second.minA) / 2)]);
  }
  const exits = plan.objects.filter((o): o is DoorObject => o.type === "door" && (o.role === "exit" || o.role === "emergency_exit"));
  for (const door of exits) {
    const segment = doorSegment(plan.contour, door);
    if (!segment) continue;
    const midpoint = { x: (segment.start.x + segment.end.x) / 2, y: (segment.start.y + segment.end.y) / 2 };
    candidates.push([longitudinal(`exit-${door.id}`, along(midpoint))]);
  }
  const existing = plan.objects.filter((o): o is AisleObject => o.type === "aisle");
  const blockers = plan.objects.filter(isBlockingObject).map(obstaclePolygon);
  const clear = (aisle: AisleObject) => {
    const polygon = aislePolygon(aisle);
    return polygonInsideRoom(polygon, plan.contour) && !blockers.some((blocker) => polygonsOverlap(polygon, blocker));
  };
  const trim = (aisle: AisleObject): AisleObject | null => {
    if (clear(aisle)) return aisle;
    const length = distance(aisle.start, aisle.end);
    const pieces = Math.max(1, Math.ceil(length / (width / 4)));
    const at = (i: number): Position => ({ x: aisle.start.x + (aisle.end.x - aisle.start.x) * i / pieces, y: aisle.start.y + (aisle.end.y - aisle.start.y) * i / pieces });
    let run = -1, bestStart = -1, bestEnd = -1;
    for (let i = 0; i <= pieces; i++) {
      const ok = i < pieces && clear({ ...aisle, start: at(i), end: at(i + 1) });
      if (ok && run < 0) run = i;
      if (!ok && run >= 0) {
        if (i - run > bestEnd - bestStart) { bestStart = run; bestEnd = i; }
        run = -1;
      }
    }
    return bestStart >= 0 && distance(at(bestStart), at(bestEnd)) >= width ? { ...aisle, start: at(bestStart), end: at(bestEnd) } : null;
  };
  const valid = (aisle: AisleObject) => {
    return !existing.some((manual) => nearDuplicateAisle(aisle, manual));
  };
  const seen = new Set<string>();
  return candidates.map((group) => group.map(trim)).filter((group): group is AisleObject[] => group.every((aisle) => aisle !== null))
    .filter((group) => group.length <= maximum && group.every(valid) && !group.some((aisle, i) => group.slice(0, i).some((other) => nearDuplicateAisle(aisle, other))))
    .filter((group) => { const key = group.map((a) => `${a.start.x.toFixed(2)}:${a.start.y.toFixed(2)}:${a.end.x.toFixed(2)}:${a.end.y.toFixed(2)}`).join("|"); if (seen.has(key)) return false; seen.add(key); return true; });
}

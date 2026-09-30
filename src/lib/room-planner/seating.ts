import { validateRoom } from "./geometry";
import { aislePolygon, doorSegment, obstaclePolygon, pointInPolygon, polygonInsideRoom, polygonsOverlap, validateObjects, type Position, type RoomPlan } from "./objects";

export type SeatingOrientation = "horizontal" | "vertical";
export type SeatingGridOffset = { along: number; cross: number };
export type SeatingRules = {
  chairWidth: number;
  chairDepth: number;
  rowPitch: number;
  minimumSideClearance: number;
  minimumWallClearance: number;
  minimumObstacleClearance: number;
  minimumDoorClearance: number;
  maximumChairsPerRow: number;
  defaultAisleWidth: number;
  maximumSeats: number;
  maximumCandidates: number;
};
export const DEFAULT_SEATING_RULES: Readonly<SeatingRules> = Object.freeze({
  chairWidth: 0.5, chairDepth: 0.55, rowPitch: 0.85,
  minimumSideClearance: 0.05, minimumWallClearance: 0.3,
  minimumObstacleClearance: 0.3, minimumDoorClearance: 1.2,
  maximumChairsPerRow: 12, defaultAisleWidth: 1.2,
  maximumSeats: 5000, maximumCandidates: 30000,
});
export type SeatPlacement = { id: string; x: number; y: number; rotation: number; row: number; index: number };
export type SeatingBlock = { id: string; seats: SeatPlacement[]; rowCount: number; seatsPerRow: number[] };
export type SeatingPlan = {
  blocks: SeatingBlock[];
  seats: SeatPlacement[];
  totalSeats: number;
  totalRows: number;
  longestRow: number;
  hints: string[];
  rules: SeatingRules;
  orientation: SeatingOrientation;
};

const EPS = 1e-8;
const distance = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.y - b.y);
const segmentDistance = (p: Position, a: Position, b: Position) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
};
const edges = (polygon: Position[]) => polygon.map((point, index) => [point, polygon[(index + 1) % polygon.length]] as const);
function polygonDistance(a: Position[], b: Position[]): number {
  if (polygonsOverlap(a, b)) return 0;
  return boundaryDistance(a, b);
}
function boundaryDistance(a: Position[], b: Position[]): number {
  let minimum = Infinity;
  for (const [p, q] of edges(a)) for (const [r, s] of edges(b)) {
    minimum = Math.min(minimum, segmentDistance(p, r, s), segmentDistance(q, r, s), segmentDistance(r, p, q), segmentDistance(s, p, q));
  }
  return minimum;
}
function segmentPolygonDistance(a: Position, b: Position, polygon: Position[]): number {
  if (pointInPolygon(a, polygon) || pointInPolygon(b, polygon)) return 0;
  return Math.min(...edges(polygon).map(([p, q]) => {
    const cross = (u: Position, v: Position, w: Position) => (v.x - u.x) * (w.y - u.y) - (v.y - u.y) * (w.x - u.x);
    if (cross(a, b, p) * cross(a, b, q) <= 0 && cross(p, q, a) * cross(p, q, b) <= 0
      && Math.max(Math.min(a.x, b.x), Math.min(p.x, q.x)) <= Math.min(Math.max(a.x, b.x), Math.max(p.x, q.x)) + EPS
      && Math.max(Math.min(a.y, b.y), Math.min(p.y, q.y)) <= Math.min(Math.max(a.y, b.y), Math.max(p.y, q.y)) + EPS) return 0;
    return Math.min(segmentDistance(a, p, q), segmentDistance(b, p, q), segmentDistance(p, a, b), segmentDistance(q, a, b));
  }));
}
export function seatPolygon(x: number, y: number, rules: SeatingRules, orientation: SeatingOrientation): Position[] {
  const halfX = (orientation === "horizontal" ? rules.chairWidth : rules.chairDepth) / 2;
  const halfY = (orientation === "horizontal" ? rules.chairDepth : rules.chairWidth) / 2;
  return [{ x: x - halfX, y: y - halfY }, { x: x + halfX, y: y - halfY }, { x: x + halfX, y: y + halfY }, { x: x - halfX, y: y + halfY }];
}
type Exclusions = { obstacles: Position[][]; aisles: Position[][]; doors: { start: Position; end: Position }[] };
function exclusions(plan: RoomPlan): Exclusions {
  return {
    obstacles: plan.objects.filter((o) => o.type === "obstacle").map(obstaclePolygon),
    aisles: plan.objects.filter((o) => o.type === "aisle").map(aislePolygon),
    doors: plan.objects.filter((o) => o.type === "door").map((o) => doorSegment(plan.contour, o)).filter((o): o is { start: Position; end: Position } => o !== null),
  };
}
export function seatFits(plan: RoomPlan, rules: SeatingRules, orientation: SeatingOrientation, x: number, y: number): boolean {
  return fits(plan, exclusions(plan), rules, orientation, x, y);
}
function fits(plan: RoomPlan, excluded: Exclusions, rules: SeatingRules, orientation: SeatingOrientation, x: number, y: number): boolean {
  const seat = seatPolygon(x, y, rules, orientation);
  if (!polygonInsideRoom(seat, plan.contour)) return false;
  if (boundaryDistance(seat, plan.contour.points) + EPS < rules.minimumWallClearance) return false;
  if (excluded.obstacles.some((polygon) => polygonDistance(seat, polygon) + EPS < rules.minimumObstacleClearance || polygonsOverlap(seat, polygon))) return false;
  if (excluded.aisles.some((polygon) => polygonsOverlap(seat, polygon))) return false;
  if (excluded.doors.some(({ start, end }) => segmentPolygonDistance(start, end, seat) + EPS < rules.minimumDoorClearance)) return false;
  return true;
}
function validRules(rules: SeatingRules): boolean {
  return [rules.chairWidth, rules.chairDepth, rules.rowPitch, rules.minimumSideClearance, rules.minimumWallClearance, rules.minimumObstacleClearance, rules.minimumDoorClearance, rules.maximumChairsPerRow, rules.defaultAisleWidth, rules.maximumSeats, rules.maximumCandidates].every(Number.isFinite)
    && rules.chairWidth > 0 && rules.chairDepth > 0 && rules.rowPitch >= rules.chairDepth
    && rules.minimumSideClearance >= 0 && rules.minimumWallClearance >= 0 && rules.minimumObstacleClearance >= 0 && rules.minimumDoorClearance >= 0
    && Number.isInteger(rules.maximumChairsPerRow) && rules.maximumChairsPerRow > 0 && rules.defaultAisleWidth > 0
    && Number.isInteger(rules.maximumSeats) && rules.maximumSeats > 0 && Number.isInteger(rules.maximumCandidates) && rules.maximumCandidates > 0;
}
const empty = (rules: SeatingRules, orientation: SeatingOrientation, hints: string[]): SeatingPlan => ({ blocks: [], seats: [], totalSeats: 0, totalRows: 0, longestRow: 0, hints, rules, orientation });

export function generateSeatingPlan(plan: RoomPlan, rules: SeatingRules = DEFAULT_SEATING_RULES, orientation: SeatingOrientation = "horizontal", offset: SeatingGridOffset = { along: 0, cross: 0 }): SeatingPlan {
  if (!validRules(rules) || !["horizontal", "vertical"].includes(orientation)) return empty(rules, orientation, ["Bestuhlungsparameter sind ungültig."]);
  if (!plan.contour.closed || validateRoom(plan.contour).length || validateObjects(plan).some((issue) => issue.severity === "error")) return empty(rules, orientation, ["Raum oder Objekte sind ungültig. Bestuhlung kann nicht berechnet werden."]);
  const points = plan.contour.points;
  const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y)), maxY = Math.max(...points.map((p) => p.y));
  const alongSize = rules.chairWidth;
  const crossSize = rules.chairDepth;
  const alongStep = alongSize + rules.minimumSideClearance;
  const alongMin = orientation === "horizontal" ? minX : minY;
  const alongMax = orientation === "horizontal" ? maxX : maxY;
  const crossMin = orientation === "horizontal" ? minY : minX;
  const crossMax = orientation === "horizontal" ? maxY : maxX;
  if (![offset.along, offset.cross].every((value) => Number.isFinite(value) && value >= 0 && value < 1)) return empty(rules, orientation, ["Rasteroffset ist ungültig."]);
  const columns = Math.max(0, Math.floor((alongMax - alongMin - alongSize - offset.along * alongStep + EPS) / alongStep) + 1);
  const rows = Math.max(0, Math.floor((crossMax - crossMin - crossSize - offset.cross * rules.rowPitch + EPS) / rules.rowPitch) + 1);
  if (columns * rows > rules.maximumCandidates) return empty(rules, orientation, ["Raum ist für die konfigurierte Berechnungsgrenze zu groß. Maße oder Abstände anpassen."]);
  const excluded = exclusions(plan);
  const hints: string[] = [];
  const blocks: SeatingBlock[] = [];
  const seats: SeatPlacement[] = [];
  let previous: { first: number; last: number; block: SeatingBlock }[] = [];
  let limitReported = false;
  let interrupted = false;
  let stopped = false;
  for (let row = 0; row < rows && !stopped; row++) {
    const cross = crossMin + crossSize / 2 + (row + offset.cross) * rules.rowPitch;
    const runs: { first: number; last: number }[] = [];
    let runStart = -1;
    for (let column = 0; column <= columns; column++) {
      const along = alongMin + alongSize / 2 + (column + offset.along) * alongStep;
      const x = orientation === "horizontal" ? along : cross;
      const y = orientation === "horizontal" ? cross : along;
      const allowed = column < columns && fits(plan, excluded, rules, orientation, x, y);
      if (allowed && runStart < 0) runStart = column;
      if (!allowed && runStart >= 0) { runs.push({ first: runStart, last: column - 1 }); runStart = -1; }
    }
    if (runs.length > 1 && excluded.aisles.length) interrupted = true;
    const current: typeof previous = [];
    const occupied = new Set<string>();
    for (const run of runs) {
      const count = run.last - run.first + 1;
      if (count > rules.maximumChairsPerRow && !limitReported) {
        hints.push(`Bis zu ${count} zusammenhängende Sitzplätze wären in einer Reihe möglich. Das Reihenlimit beträgt ${rules.maximumChairsPerRow}; ein zusätzlicher Gang wird empfohlen.`);
        limitReported = true;
      }
      for (let first = run.first; first <= run.last; first += rules.maximumChairsPerRow) {
        const last = Math.min(run.last, first + rules.maximumChairsPerRow - 1);
        const match = previous.find((item) => !occupied.has(item.block.id) && Math.min(item.last, last) >= Math.max(item.first, first));
        const block = match?.block ?? { id: `block-${blocks.length + 1}`, seats: [], rowCount: 0, seatsPerRow: [] };
        if (!match) blocks.push(block);
        occupied.add(block.id);
        let placed = 0;
        for (let column = first; column <= last; column++) {
          if (seats.length >= rules.maximumSeats) { stopped = true; break; }
          const along = alongMin + alongSize / 2 + (column + offset.along) * alongStep;
          const x = orientation === "horizontal" ? along : cross;
          const y = orientation === "horizontal" ? cross : along;
          const seat = { id: `seat-${row}-${column}`, x, y, rotation: orientation === "horizontal" ? 0 : 90, row, index: column };
          block.seats.push(seat); seats.push(seat); placed++;
        }
        if (placed) { block.rowCount++; block.seatsPerRow.push(placed); current.push({ first, last: first + placed - 1, block }); }
        if (stopped) break;
      }
      if (stopped) break;
    }
    previous = current;
  }
  if (interrupted) hints.push("Ein Gang unterbricht Sitzreihen und trennt Sitzblöcke.");
  if (excluded.doors.length) hints.push("Türbereiche mit Freihalteabstand wurden von der Bestuhlung ausgenommen.");
  if (stopped) hints.push(`Die technische Obergrenze von ${rules.maximumSeats} Sitzplätzen wurde erreicht.`);
  if (!seats.length) hints.push("Keine gültige Bestuhlung möglich; der nutzbare Bereich ist zu klein oder vollständig freizuhalten.");
  return { blocks, seats, totalSeats: seats.length, totalRows: new Set(seats.map((seat) => seat.row)).size, longestRow: Math.max(0, ...blocks.flatMap((block) => block.seatsPerRow)), hints, rules, orientation };
}

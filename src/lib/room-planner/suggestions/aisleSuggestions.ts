import { aislePolygon, doorSegment, isBlockingObject, obstaclePolygon, polygonInsideRoom, polygonsOverlap, type AisleObject, type DoorObject, type Position, type RoomPlan } from "../objects";
import { generateSeatingPlan, type SeatingPlan } from "../seating";
import { analyzeEgress, type EgressAnalysis } from "../egress/analyzeEgress";
import { evaluateRules, type RuleReport } from "../rules/evaluateRules";
import type { RuleProfile } from "../rules/profiles";

export type AisleSuggestion = { id: string; reason: string; width: number; start: Position; end: Position; resolvesRuleIds: string[]; removedSeatIds: string[]; newSeatCount: number; score: number };
const EPS = 1e-7;
const MAX_CANDIDATE_BLOCKS = 6;
const MAX_VISIBLE_SUGGESTIONS = 5;
const RESOLVED_FAILURE_WEIGHT = 1000;
const ACCESS_GAIN_WEIGHT = 10;

export function applyAisleSuggestion(plan: RoomPlan, suggestion: AisleSuggestion, id: string): RoomPlan {
  const aisle: AisleObject = { id, type: "aisle", start: suggestion.start, end: suggestion.end, width: suggestion.width };
  return { ...plan, objects: [...plan.objects, aisle] };
}

export function suggestAisles(plan: RoomPlan, seating: SeatingPlan, profile: RuleProfile, egress: EgressAnalysis, report: RuleReport): AisleSuggestion[] {
  const width = profile.aisles.minimumWidth ?? seating.rules.defaultAisleWidth;
  const candidates: { id: string; reason: string; start: Position; end: Position }[] = [];
  const horizontal = seating.orientation === "horizontal";
  const along = (p: Position) => horizontal ? p.x : p.y;
  const cross = (p: Position) => horizontal ? p.y : p.x;
  const point = (a: number, c: number): Position => horizontal ? { x: a, y: c } : { x: c, y: a };
  const snap = (n: number) => Math.round(n * 100) / 100;
  const roomMinA = Math.min(...plan.contour.points.map(along)), roomMaxA = Math.max(...plan.contour.points.map(along));
  const roomMinC = Math.min(...plan.contour.points.map(cross)), roomMaxC = Math.max(...plan.contour.points.map(cross));
  const clampA = (n: number) => snap(Math.max(roomMinA + width / 2 + 0.01, Math.min(roomMaxA - width / 2 - 0.01, n)));
  const clampC = (n: number) => snap(Math.max(roomMinC + width / 2 + 0.01, Math.min(roomMaxC - width / 2 - 0.01, n)));
  const exits = plan.objects.filter((o): o is DoorObject => o.type === "door" && (o.role === "exit" || o.role === "emergency_exit"));
  for (const door of exits) {
    const segment = doorSegment(plan.contour, door);
    if (!segment) continue;
    const midpoint = { x: (segment.start.x + segment.end.x) / 2, y: (segment.start.y + segment.end.y) / 2 };
    const coordinate = snap(along(midpoint));
    if (coordinate < roomMinA + width / 2 || coordinate > roomMaxA - width / 2) continue;
    candidates.push({ id: `exit-${door.id}`, reason: `Gang in Richtung Ausgang ${door.id}`, start: point(coordinate, clampC(roomMinC)), end: point(coordinate, clampC(roomMaxC)) });
  }
  for (const block of [...seating.blocks].sort((a, b) => b.seats.length - a.seats.length || a.id.localeCompare(b.id)).slice(0, MAX_CANDIDATE_BLOCKS)) {
    if (!block.seats.length) continue;
    const affected = report.blocks.find((b) => b.blockId === block.id);
    if (!affected?.checks.some((check) => check.status === "fail" && ["row-access", "row-seats", "block-rows", "travel-distance", "reachable-exit"].includes(check.ruleId))) continue;
    const minA = Math.min(...block.seats.map(along)), maxA = Math.max(...block.seats.map(along));
    const minC = Math.min(...block.seats.map(cross)), maxC = Math.max(...block.seats.map(cross));
    const extension = seating.rules.rowPitch / 2 + width / 2;
    const startC = clampC(minC - extension), endC = clampC(maxC + extension);
    const middle = snap((minA + maxA) / 2);
    candidates.push({ id: `${block.id}-middle`, reason: `${block.id}: zusätzlicher Mittelgang`, start: point(middle, startC), end: point(middle, endC) });
    for (const side of ["left", "right"] as const) {
      const coordinate = snap((side === "left" ? minA : maxA) + (side === "left" ? -1 : 1) * (seating.rules.chairWidth / 2 + width / 2 + seating.rules.minimumSideClearance));
      candidates.push({ id: `${block.id}-${side}`, reason: `${block.id}: zusätzlicher ${side === "left" ? "linker" : "rechter"} Seitengang`, start: point(coordinate, startC), end: point(coordinate, endC) });
    }
    if (affected.checks.some((check) => check.ruleId === "block-rows" && check.status === "fail")) {
      const middleC = snap((minC + maxC) / 2);
      candidates.push({ id: `${block.id}-cross`, reason: `${block.id}: zusätzlicher Quergang`, start: point(clampA(minA - extension), middleC), end: point(clampA(maxA + extension), middleC) });
    }
  }
  const failureCounts = (checks: RuleReport["checks"]) => checks.filter((check) => check.status === "fail").reduce((counts, check) => counts.set(check.ruleId, (counts.get(check.ruleId) ?? 0) + 1), new Map<string, number>());
  const baselineFailures = failureCounts(report.checks);
  const baselineUnreachable = egress.seatsWithoutRoute;
  const accessDeficit = (analysis: EgressAnalysis) => analysis.rowAccess.filter((row) => !row.leftAisleId && !row.rightAisleId).reduce((sum, row) => sum + row.seatIds.length, 0);
  const baselineAccessDeficit = accessDeficit(egress);
  const suggestions: AisleSuggestion[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const signature = `${candidate.start.x}:${candidate.start.y}:${candidate.end.x}:${candidate.end.y}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    const aisle: AisleObject = { id: `suggestion-${candidate.id}`, type: "aisle", start: candidate.start, end: candidate.end, width };
    const polygon = aislePolygon(aisle);
    if (!polygonInsideRoom(polygon, plan.contour) || plan.objects.some((o) => isBlockingObject(o) && polygonsOverlap(polygon, obstaclePolygon(o)))) continue;
    const proposed = { ...plan, objects: [...plan.objects, aisle] };
    const nextSeating = generateSeatingPlan(proposed, seating.rules, seating.orientation);
    if (!nextSeating.totalSeats) continue;
    const nextEgress = analyzeEgress(proposed, nextSeating, profile);
    const connectedToExit = nextEgress.routes.some((route) => route.valid && route.aisleId === aisle.id);
    const connectedToNetwork = plan.objects.some((object) => object.type === "aisle" && polygonsOverlap(polygon, aislePolygon(object)));
    if (exits.length ? !connectedToExit : !connectedToNetwork) continue;
    const nextReport = evaluateRules(proposed, nextSeating, nextEgress, profile);
    const remainingFailures = failureCounts(nextReport.checks);
    const resolvesRuleIds = [...baselineFailures.keys()].filter((ruleId) => (remainingFailures.get(ruleId) ?? 0) < (baselineFailures.get(ruleId) ?? 0));
    const nextSeatIds = new Set(nextSeating.seats.map((seat) => seat.id));
    const removedSeatIds = seating.seats.filter((seat) => !nextSeatIds.has(seat.id)).map((seat) => seat.id);
    const improvement = baselineUnreachable - nextEgress.seatsWithoutRoute;
    const reducedFailures = [...baselineFailures].reduce((sum, [ruleId, count]) => sum + Math.max(0, count - (remainingFailures.get(ruleId) ?? 0)), 0);
    const accessImprovement = baselineAccessDeficit - accessDeficit(nextEgress);
    const score = reducedFailures * RESOLVED_FAILURE_WEIGHT + (improvement + accessImprovement) * ACCESS_GAIN_WEIGHT - removedSeatIds.length;
    if (score <= EPS) continue;
    suggestions.push({ id: aisle.id, reason: candidate.reason, width, start: candidate.start, end: candidate.end, resolvesRuleIds, removedSeatIds, newSeatCount: nextSeating.totalSeats, score });
  }
  return suggestions.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, MAX_VISIBLE_SUGGESTIONS);
}

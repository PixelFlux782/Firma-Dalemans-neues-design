import { isBlockingObject, obstaclePolygon, polygonsOverlap, type RoomPlan } from "./objects";
import type { SeatingPlan } from "./seating";
import type { EgressAnalysis } from "./egress/analyzeEgress";
import type { RuleCheckResult, RuleReport } from "./rules/evaluateRules";

export type VariantNotice = { id: string; category: "error" | "warning" | "hint"; message: string; affectedIds: string[] };
export type VariantSummary = {
  seatCount: number; blockCount: number; aisleCount: number; manualAisleCount: number; generatedAisleCount: number;
  reachableSeatCount: number; unreachableSeatCount: number; unreachableBlockCount: number;
  exitCount: number; usedExitCount: number; exitLoads: { doorId: string; seats: number }[];
  maxEgressDistance?: number; averageEgressDistance?: number;
  errors: VariantNotice[]; warnings: VariantNotice[]; hints: VariantNotice[];
  usableArea?: number; seatingArea?: number; aisleArea: number; utilization?: number;
};

const round = (value: number) => Number(value.toFixed(3));
const area = (points: { x: number; y: number }[]) => Math.abs(points.reduce((sum, point, index) => { const next = points[(index + 1) % points.length]; return sum + point.x * next.y - next.x * point.y; }, 0)) / 2;
const notice = (check: RuleCheckResult): VariantNotice => ({ id: check.id, category: check.status === "fail" ? "error" : "warning", message: check.message, affectedIds: check.affectedIds });

/** Utilization is chair footprint area divided by contour area less nonoverlapping blocking polygons.
 * It is omitted where the blocked area cannot be subtracted reliably. Aisles are reported separately.
 */
export function createVariantSummary(plan: RoomPlan, seating: SeatingPlan, analysis: EgressAnalysis, report: RuleReport): VariantSummary {
  const aisles = plan.objects.filter((object) => object.type === "aisle");
  const routes = analysis.routes.filter((route) => route.valid);
  const unreachableBlocks = new Set(analysis.routes.filter((route) => !route.valid).map((route) => route.blockId));
  const blockers = plan.objects.filter(isBlockingObject).map(obstaclePolygon);
  const blockersOverlap = blockers.some((polygon, index) => blockers.slice(index + 1).some((other) => polygonsOverlap(polygon, other)));
  const contourArea = plan.contour.closed ? area(plan.contour.points) : 0;
  const usableArea = !blockersOverlap && contourArea > 0 ? round(contourArea - blockers.reduce((sum, polygon) => sum + area(polygon), 0)) : undefined;
  const seatingArea = round(seating.totalSeats * seating.rules.chairWidth * seating.rules.chairDepth);
  return {
    seatCount: seating.totalSeats, blockCount: seating.blocks.length, aisleCount: aisles.length,
    manualAisleCount: aisles.filter((aisle) => aisle.source !== "generated").length,
    generatedAisleCount: aisles.filter((aisle) => aisle.source === "generated").length,
    reachableSeatCount: seating.totalSeats - analysis.seatsWithoutRoute, unreachableSeatCount: analysis.seatsWithoutRoute,
    unreachableBlockCount: seating.blocks.filter((block) => unreachableBlocks.has(block.id) && !analysis.routes.some((route) => route.blockId === block.id && route.valid)).length,
    exitCount: plan.objects.filter((object) => object.type === "door" && object.role && object.role !== "normal").length,
    usedExitCount: analysis.exitLoads.filter((load) => load.persons > 0).length,
    exitLoads: analysis.exitLoads.map((load) => ({ doorId: load.doorId, seats: load.persons })),
    maxEgressDistance: routes.length ? round(Math.max(...routes.map((route) => route.distance))) : undefined,
    averageEgressDistance: routes.length ? round(routes.reduce((sum, route) => sum + route.distance, 0) / routes.length) : undefined,
    errors: report.checks.filter((check) => check.status === "fail").map(notice),
    warnings: report.checks.filter((check) => check.status === "warning").map(notice),
    hints: seating.hints.map((message, index) => ({ id: `seating-hint-${index}`, category: "hint", message, affectedIds: [] })),
    usableArea: usableArea !== undefined && usableArea > 0 ? usableArea : undefined, seatingArea,
    aisleArea: round(aisles.reduce((sum, aisle) => sum + Math.hypot(aisle.end.x - aisle.start.x, aisle.end.y - aisle.start.y) * aisle.width, 0)),
    utilization: usableArea !== undefined && usableArea > 0 && seatingArea <= usableArea ? round(seatingArea / usableArea) : undefined,
  };
}

/** Generated aisles belong to variants; all other plan inputs invalidate the result when changed. */
export function planFingerprint(plan: RoomPlan): string {
  return JSON.stringify({ contour: plan.contour, objects: plan.objects.filter((object) => object.type !== "aisle" || object.source !== "generated").sort((a, b) => a.id.localeCompare(b.id)) });
}

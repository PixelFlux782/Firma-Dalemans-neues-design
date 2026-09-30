import { aislePolygon, isBlockingObject, obstaclePolygon, polygonInsideRoom, polygonsOverlap, type AisleObject, type Position, type RoomFront, type RoomPlan } from "./objects";
import { analyzeEgress, type EgressAnalysis } from "./egress/analyzeEgress";
import { evaluateRules, type RuleReport } from "./rules/evaluateRules";
import type { RuleProfile } from "./rules/profiles";
import { DEFAULT_SEATING_RULES, generateSeatingPlan, type SeatingGridOffset, type SeatingOrientation, type SeatingPlan, type SeatingRules } from "./seating";
import { suggestAisles } from "./suggestions/aisleSuggestions";

export type PlanningProfile = {
  id: "capacity" | "balanced" | "comfort";
  name: string;
  description: string;
  seating: { rowPitchMultiplier: number; preferredMaximumSeatsPerRow: number };
  optimization: { capacity: number; egress: number; comfort: number; simplicity: number; exitBalance: number };
};
export const PLANNING_PROFILES: readonly PlanningProfile[] = [
  { id: "capacity", name: "Kapazität", description: "Mehr Plätze innerhalb der aktiven technischen Regeln.", seating: { rowPitchMultiplier: 1, preferredMaximumSeatsPerRow: 10 }, optimization: { capacity: 5, egress: 1, comfort: 0, simplicity: 1, exitBalance: 1 } },
  { id: "balanced", name: "Ausgewogen", description: "Sitzplatzzahl und Wege gemeinsam berücksichtigen.", seating: { rowPitchMultiplier: 1.15, preferredMaximumSeatsPerRow: 10 }, optimization: { capacity: 3, egress: 3, comfort: 1, simplicity: 2, exitBalance: 2 } },
  { id: "comfort", name: "Komfort", description: "Größerer Reihenabstand und kleinere Sitzgruppen.", seating: { rowPitchMultiplier: 1.3, preferredMaximumSeatsPerRow: 8 }, optimization: { capacity: 1, egress: 3, comfort: 4, simplicity: 1, exitBalance: 2 } },
];
export type VariantConfig = { maximumCandidatePlans: number; maximumGeneratedAisles: number; gridOffsets: readonly number[] };
export const DEFAULT_VARIANT_CONFIG: Readonly<VariantConfig> = Object.freeze({ maximumCandidatePlans: 48, maximumGeneratedAisles: 3, gridOffsets: [0, 0.25, 0.5, 0.75] });
export type OrientationPreference = "automatic" | SeatingOrientation;
export type VariantMetrics = {
  seatCount: number; blockCount: number; rowCount: number; aisleCount: number; generatedAisleCount: number; totalAisleArea: number;
  longestEgressRoute?: number; averageEgressRoute?: number; exitsUsed: number; maximumExitLoad?: number;
  passedChecks: number; warnings: number; failures: number; averageRowLength?: number; rowPitch: number; frontDeviation?: number;
};
export type PlanVariant = {
  id: string; profileId: PlanningProfile["id"]; plan: RoomPlan; seatingPlan: SeatingPlan; analysis: EgressAnalysis; report: RuleReport;
  generatedAisles: AisleObject[]; gridOffset: SeatingGridOffset; metrics: VariantMetrics; feasible: boolean; reasons: string[];
};
export type VariantResult = { variants: PlanVariant[]; fallback?: PlanVariant; evaluatedCandidates: number };

type Seed = { profile: PlanningProfile; orientation: SeatingOrientation; offset: SeatingGridOffset; rules: SeatingRules; seating: SeatingPlan };
const round = (value: number) => Number(value.toFixed(4));
function rulesFor(base: SeatingRules, rule: RuleProfile, profile: PlanningProfile): SeatingRules {
  return {
    ...base,
    chairWidth: Math.max(base.chairWidth, rule.seating.minimumSeatWidth ?? 0),
    rowPitch: round(Math.max(base.rowPitch * profile.seating.rowPitchMultiplier, base.chairDepth + (rule.seating.minimumClearRowPassage ?? 0))),
    maximumChairsPerRow: Math.max(1, Math.min(base.maximumChairsPerRow, profile.seating.preferredMaximumSeatsPerRow)),
    defaultAisleWidth: Math.max(base.defaultAisleWidth, rule.aisles.minimumWidth ?? 0),
  };
}
function aisleTemplates(plan: RoomPlan, seating: SeatingPlan, width: number, maximum: number): AisleObject[][] {
  if (!seating.seats.length || maximum < 1) return [];
  const horizontal = seating.orientation === "horizontal";
  const along = (p: Position) => horizontal ? p.x : p.y;
  const cross = (p: Position) => horizontal ? p.y : p.x;
  const point = (a: number, c: number): Position => horizontal ? { x: a, y: c } : { x: c, y: a };
  const roomAlong = plan.contour.points.map(along), roomCross = plan.contour.points.map(cross);
  const minA = Math.min(...roomAlong), maxA = Math.max(...roomAlong), minC = Math.min(...roomCross), maxC = Math.max(...roomCross);
  const margin = width / 2 + 0.02;
  if (maxA - minA <= width + 0.04 || maxC - minC <= width + 0.04) return [];
  const seatAlong = seating.seats.map(along), seatCross = seating.seats.map(cross);
  const minSeatA = Math.min(...seatAlong), maxSeatA = Math.max(...seatAlong);
  const clampA = (v: number) => Math.max(minA + margin, Math.min(maxA - margin, v));
  const clampC = (v: number) => Math.max(minC + margin, Math.min(maxC - margin, v));
  const make = (id: string, start: Position, end: Position): AisleObject => ({ id: `variant-${id}`, type: "aisle", start, end, width });
  const c1 = clampC(Math.min(...seatCross) - seating.rules.rowPitch / 2), c2 = clampC(Math.max(...seatCross) + seating.rules.rowPitch / 2);
  const longitudinal = (id: string, a: number) => make(id, point(clampA(a), c1), point(clampA(a), c2));
  const sideGap = seating.rules.chairWidth / 2 + width / 2 + seating.rules.minimumSideClearance;
  const left = longitudinal("left", minSeatA - sideGap), right = longitudinal("right", maxSeatA + sideGap);
  const center = longitudinal("center", (minSeatA + maxSeatA) / 2);
  const crossC = clampC((Math.min(...seatCross) + Math.max(...seatCross)) / 2);
  const crossAisle = make("cross", point(clampA(minSeatA - sideGap), crossC), point(clampA(maxSeatA + sideGap), crossC));
  const valid = (aisle: AisleObject) => polygonInsideRoom(aislePolygon(aisle), plan.contour)
    && !plan.objects.some((object) => isBlockingObject(object) && polygonsOverlap(aislePolygon(aisle), obstaclePolygon(object)));
  return [[center], [left], [right], [left, right], [crossAisle], [center, left], [center, right], [center, crossAisle]]
    .filter((group) => group.length <= maximum && group.every(valid));
}
function metrics(plan: RoomPlan, seating: SeatingPlan, analysis: EgressAnalysis, report: RuleReport, generated: AisleObject[]): VariantMetrics {
  const routes = analysis.routes.filter((route) => route.valid);
  const aisleObjects = plan.objects.filter((object): object is AisleObject => object.type === "aisle");
  return {
    seatCount: seating.totalSeats, blockCount: seating.blocks.length, rowCount: seating.totalRows, aisleCount: aisleObjects.length,
    generatedAisleCount: generated.length, totalAisleArea: round(aisleObjects.reduce((sum, aisle) => sum + Math.hypot(aisle.end.x - aisle.start.x, aisle.end.y - aisle.start.y) * aisle.width, 0)),
    longestEgressRoute: routes.length ? analysis.longestValidRoute : undefined,
    averageEgressRoute: routes.length ? round(routes.reduce((sum, route) => sum + route.distance, 0) / routes.length) : undefined,
    exitsUsed: analysis.exitLoads.filter((load) => load.persons > 0).length,
    maximumExitLoad: Math.max(0, ...analysis.exitLoads.map((load) => load.persons)),
    passedChecks: report.counts.pass, warnings: report.counts.warning, failures: report.counts.fail,
    averageRowLength: seating.totalRows ? round(seating.totalSeats / seating.totalRows) : undefined, rowPitch: seating.rules.rowPitch,
  };
}
function signature(variant: PlanVariant): string {
  const seats = variant.seatingPlan.seats.map((seat) => `${round(seat.x)}:${round(seat.y)}`).join("|");
  const aisles = variant.generatedAisles.map((a) => `${round(a.start.x)}:${round(a.start.y)}:${round(a.end.x)}:${round(a.end.y)}`).sort().join("|");
  return `${variant.seatingPlan.orientation}/${seats}/${aisles}`;
}
function utility(v: PlanVariant, profile: PlanningProfile, preference: OrientationPreference): number {
  const m = v.metrics, w = profile.optimization;
  const distance = m.longestEgressRoute ?? 100;
  const average = m.averageEgressRoute ?? 100;
  const exitImbalance = m.seatCount && m.exitsUsed > 1 ? (m.maximumExitLoad ?? 0) / m.seatCount : 0;
  return w.capacity * m.seatCount - w.egress * (distance + average) - w.comfort * (m.averageRowLength ?? 0)
    - w.simplicity * (m.generatedAisleCount * 3 + m.blockCount) - w.exitBalance * exitImbalance * 20
    + (preference !== "automatic" && v.seatingPlan.orientation === preference ? 2 : 0);
}
function frontDeviation(front: RoomFront | undefined, orientation: SeatingOrientation): number | undefined {
  if (!front) return undefined;
  const angle = ((front.rotation % 180) + 180) % 180;
  const target = orientation === "horizontal" ? 0 : 90;
  const difference = Math.abs(angle - target);
  return Math.min(difference, 180 - difference);
}
function faceFront(seating: SeatingPlan, front: RoomFront | undefined): SeatingPlan {
  if (!front || !seating.seats.length) return seating;
  const average = seating.seats.reduce((sum, seat) => sum + (seating.orientation === "horizontal" ? seat.y : seat.x), 0) / seating.seats.length;
  const frontCoordinate = seating.orientation === "horizontal" ? front.y : front.x;
  const rotation = seating.orientation === "horizontal"
    ? (frontCoordinate < average || frontCoordinate === average && Math.cos(front.rotation * Math.PI / 180) >= 0 ? 0 : 180)
    : (frontCoordinate < average || frontCoordinate === average && Math.sin(front.rotation * Math.PI / 180) < 0 ? 90 : 270);
  const seats = seating.seats.map((seat) => ({ ...seat, rotation }));
  const byId = new Map(seats.map((seat) => [seat.id, seat]));
  return { ...seating, seats, blocks: seating.blocks.map((block) => ({ ...block, seats: block.seats.map((seat) => byId.get(seat.id)!) })) };
}
function explain(variant: PlanVariant, balanced?: PlanVariant): string[] {
  const m = variant.metrics;
  const reasons = [`${m.seatCount} Plätze bei ${m.rowPitch.toFixed(2)} m Reihenabstand`, `${m.generatedAisleCount} zusätzliche Gänge; ${m.blockCount} Sitzblöcke`];
  if (m.longestEgressRoute !== undefined) reasons.push(`Längster modellierter Weg ${m.longestEgressRoute.toFixed(1)} m`);
  if (balanced && balanced.id !== variant.id) {
    const delta = m.seatCount - balanced.metrics.seatCount;
    if (delta) reasons.push(`${delta > 0 ? "+" : ""}${delta} Plätze gegenüber Ausgewogen`);
  }
  if (m.failures) reasons.push(`${m.failures} offene Regelabweichungen`);
  return reasons;
}
export function generatePlanVariants(plan: RoomPlan, baseRules: SeatingRules = DEFAULT_SEATING_RULES, rule: RuleProfile, preference: OrientationPreference = "automatic", config: VariantConfig = DEFAULT_VARIANT_CONFIG): VariantResult {
  const front = plan.objects.find((object): object is RoomFront => object.type === "front");
  const limit = Math.max(1, Math.floor(config.maximumCandidatePlans));
  const offsets = config.gridOffsets.filter((value) => Number.isFinite(value) && value >= 0 && value < 1).slice(0, 4);
  if (!offsets.length || !plan.contour.closed) return { variants: [], evaluatedCandidates: 0 };
  const seeds: Seed[] = [];
  for (const profile of PLANNING_PROFILES) for (const orientation of ["horizontal", "vertical"] as const) {
    const rules = rulesFor(baseRules, rule, profile);
    for (const along of offsets) for (const cross of offsets) {
      const offset = { along, cross };
      const seating = generateSeatingPlan(plan, rules, orientation, offset);
      if (seating.totalSeats) seeds.push({ profile, orientation, offset, rules, seating });
    }
  }
  const shortlisted = PLANNING_PROFILES.flatMap((profile) => (["horizontal", "vertical"] as const).flatMap((orientation) =>
    seeds.filter((seed) => seed.profile.id === profile.id && seed.orientation === orientation)
      .sort((a, b) => b.seating.totalSeats - a.seating.totalSeats || a.offset.along - b.offset.along || a.offset.cross - b.offset.cross).slice(0, 1)));
  const candidates: { seed: Seed; generated: AisleObject[] }[] = shortlisted.map((seed) => ({ seed, generated: [] }));
  const templates = shortlisted.map((seed) => aisleTemplates(plan, seed.seating, Math.max(seed.rules.defaultAisleWidth, rule.aisles.minimumWidth ?? 0), config.maximumGeneratedAisles));
  for (let index = 0; index < Math.max(0, ...templates.map((groups) => groups.length)); index++) {
    shortlisted.forEach((seed, seedIndex) => { if (templates[seedIndex][index]) candidates.push({ seed, generated: templates[seedIndex][index] }); });
  }
  // WP04 suggestions are evaluated once per orientation and can complement geometric templates.
  for (const orientation of ["horizontal", "vertical"] as const) {
    const seed = shortlisted.find((item) => item.profile.id === "balanced" && item.orientation === orientation);
    if (!seed) continue;
    const egress = analyzeEgress(plan, seed.seating, rule);
    const report = evaluateRules(plan, seed.seating, egress, rule);
    for (const suggestion of suggestAisles(plan, seed.seating, rule, egress, report).slice(0, 2)) {
      candidates.push({ seed, generated: [{ id: `variant-suggestion-${suggestion.id}`, type: "aisle", start: suggestion.start, end: suggestion.end, width: suggestion.width }] });
    }
  }
  const evaluated: PlanVariant[] = [];
  const seenCandidates = new Set<string>();
  const reserve = Math.min(12, Math.max(0, limit - shortlisted.length));
  const queue = candidates.slice(0, limit - reserve);
  for (const candidate of queue) {
    if (evaluated.length >= limit) break;
    const key = `${candidate.seed.profile.id}/${candidate.seed.orientation}/${candidate.seed.offset.along}/${candidate.generated.map((a) => a.id).join("+")}`;
    if (seenCandidates.has(key)) continue;
    seenCandidates.add(key);
    const candidatePlan = candidate.generated.length ? { ...plan, objects: [...plan.objects, ...candidate.generated] } : plan;
    const seating = faceFront(candidate.generated.length ? generateSeatingPlan(candidatePlan, candidate.seed.rules, candidate.seed.orientation, candidate.seed.offset) : candidate.seed.seating, front);
    if (!seating.totalSeats) continue;
    const analysis = analyzeEgress(candidatePlan, seating, rule);
    const report = evaluateRules(candidatePlan, seating, analysis, rule);
    const metric = { ...metrics(candidatePlan, seating, analysis, report, candidate.generated), frontDeviation: frontDeviation(front, seating.orientation) };
    evaluated.push({ id: `variant-${evaluated.length + 1}`, profileId: candidate.seed.profile.id, plan: candidatePlan, seatingPlan: seating, analysis, report, generatedAisles: candidate.generated,
      gridOffset: candidate.seed.offset, metrics: metric, feasible: report.counts.fail === 0 && analysis.seatsWithoutRoute === 0, reasons: [] });
  }
  // One additional suggestion per promising incomplete plan. Each step is bounded by the shared candidate and aisle limits.
  const refinable = PLANNING_PROFILES.flatMap((profile) => evaluated.filter((variant) => variant.profileId === profile.id && !variant.feasible && variant.generatedAisles.length < config.maximumGeneratedAisles)
    .sort((a, b) => a.metrics.failures - b.metrics.failures || b.metrics.seatCount - a.metrics.seatCount || a.id.localeCompare(b.id)).slice(0, 2));
  for (const source of refinable) {
    if (evaluated.length >= limit) break;
    const suggestions = suggestAisles(source.plan, source.seatingPlan, rule, source.analysis, source.report);
    for (const suggestion of suggestions.slice(0, 2)) {
      if (evaluated.length >= limit) break;
      const generated: AisleObject = { id: `variant-refined-${source.id}-${suggestion.id}`, type: "aisle", start: suggestion.start, end: suggestion.end, width: suggestion.width };
      const proposed = { ...source.plan, objects: [...source.plan.objects, generated] };
      const seating = faceFront(generateSeatingPlan(proposed, source.seatingPlan.rules, source.seatingPlan.orientation, source.gridOffset), front);
      if (!seating.totalSeats) continue;
      const analysis = analyzeEgress(proposed, seating, rule);
      const report = evaluateRules(proposed, seating, analysis, rule);
      const generatedAisles = [...source.generatedAisles, generated];
      const metric = { ...metrics(proposed, seating, analysis, report, generatedAisles), frontDeviation: frontDeviation(front, seating.orientation) };
      evaluated.push({ id: `variant-${evaluated.length + 1}`, profileId: source.profileId, plan: proposed, seatingPlan: seating, analysis, report, generatedAisles,
        gridOffset: source.gridOffset, metrics: metric, feasible: report.counts.fail === 0 && analysis.seatsWithoutRoute === 0, reasons: [] });
    }
  }
  const unique = [...new Map(evaluated.map((variant) => [signature(variant), variant])).values()];
  const feasible = unique.filter((variant) => variant.feasible);
  const selected: PlanVariant[] = [];
  const selectedIds = new Set<string>();
  if (feasible.length) for (const profile of PLANNING_PROFILES) {
    const eligible = unique.filter((v) => v.profileId === profile.id && !selectedIds.has(v.id));
    const frontOrder = (a: PlanVariant, b: PlanVariant) => front && preference === "automatic" ? (a.metrics.frontDeviation ?? 90) - (b.metrics.frontDeviation ?? 90) : 0;
    const choice = eligible.filter((v) => v.feasible).sort((a, b) => frontOrder(a, b) || utility(b, profile, preference) - utility(a, profile, preference) || a.id.localeCompare(b.id))[0]
      ?? eligible.sort((a, b) => a.metrics.failures - b.metrics.failures || utility(b, profile, preference) - utility(a, profile, preference) || a.id.localeCompare(b.id))[0];
    if (choice) { selectedIds.add(choice.id); selected.push(choice); }
  }
  const balanced = selected.find((v) => v.profileId === "balanced");
  const variants = selected.map((variant) => ({ ...variant, reasons: explain(variant, balanced) }));
  const fallback = variants.length ? undefined : unique.sort((a, b) => (front && preference === "automatic" ? (a.metrics.frontDeviation ?? 90) - (b.metrics.frontDeviation ?? 90) : 0) || a.metrics.failures - b.metrics.failures || b.metrics.seatCount - a.metrics.seatCount || a.id.localeCompare(b.id))[0];
  return { variants, fallback: fallback && { ...fallback, reasons: explain(fallback) }, evaluatedCandidates: evaluated.length };
}

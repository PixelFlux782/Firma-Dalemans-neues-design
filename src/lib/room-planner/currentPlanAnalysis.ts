import { analyzeEgress } from "./egress/analyzeEgress";
import { aislePolygon, polygonsOverlap, type RoomPlan } from "./objects";
import { evaluateRules } from "./rules/evaluateRules";
import type { RuleProfile } from "./rules/profiles";
import { seatPolygon, type SeatingPlan } from "./seating";
import { seatProblems } from "./seatingEditing";
import { createVariantSummary } from "./variantSummary";

export function analyzeCurrentPlan(plan: RoomPlan, seating: SeatingPlan, profile: RuleProfile) {
  const egress = analyzeEgress(plan, seating, profile);
  const report = evaluateRules(plan, seating, egress, profile);
  const summary = createVariantSummary(plan, seating, egress, report);
  const geometrySeatIds = seatProblems(plan, seating, seating.seats);
  const aisleSeatIds = plan.objects.filter((object) => object.type === "aisle").flatMap((aisle) => seating.seats.filter((seat) => polygonsOverlap(aislePolygon(aisle), seatPolygon(seat.x, seat.y, seating.rules, seating.orientation, seat.rotation))).map((seat) => seat.id));
  const collisionSeatIds = [...new Set([...geometrySeatIds, ...aisleSeatIds])];
  if (collisionSeatIds.length) summary.errors.push({ id: "manual-seat-collisions", category: "error", message: `${collisionSeatIds.length} Sitzplätze kollidieren mit Raum, Gang, Objekt oder anderen Sitzen.`, affectedIds: collisionSeatIds });
  return { egress, report, summary, collisionSeatIds };
}

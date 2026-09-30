import type { AisleObject, RoomPlan } from "../objects";
import type { SeatingPlan } from "../seating";
import type { EgressAnalysis } from "../egress/analyzeEgress";
import type { RuleProfile } from "./profiles";

export type RuleCheckResult = { id: string; ruleId: string; status: "pass" | "warning" | "fail" | "not_applicable"; message: string; affectedIds: string[]; actualValue?: number; requiredValue?: number };
export type BlockCheck = { blockId: string; rowCount: number; maximumSeatsToAisle: number; leftAisle: boolean; rightAisle: boolean; frontAisle: boolean; backAisle: boolean; reachableExit: boolean; maximumTravelDistance?: number; checks: RuleCheckResult[] };
export type RuleReport = { checks: RuleCheckResult[]; blocks: BlockCheck[]; counts: Record<RuleCheckResult["status"], number> };

export function evaluateRules(plan: RoomPlan, seating: SeatingPlan, egress: EgressAnalysis, profile: RuleProfile): RuleReport {
  const checks: RuleCheckResult[] = [];
  const add = (id: string, ruleId: string, status: RuleCheckResult["status"], message: string, affectedIds: string[] = [], actualValue?: number, requiredValue?: number) => checks.push({ id, ruleId, status, message, affectedIds, actualValue, requiredValue });
  const { minimumSeatWidth, minimumClearRowPassage, maximumRowsPerBlock, maximumSeatsOneSideOfAisle, maximumSeatsBetweenAisles } = profile.seating;
  const passage = seating.rules.rowPitch - seating.rules.chairDepth;
  add("seat-width", "seat-width", minimumSeatWidth === undefined ? "not_applicable" : seating.rules.chairWidth + 1e-7 >= minimumSeatWidth ? "pass" : "fail", minimumSeatWidth === undefined ? "Sitzbreite nicht anwendbar." : `Sitzbreite ${seating.rules.chairWidth.toFixed(2)} m; Profilwert ${minimumSeatWidth.toFixed(2)} m.`, [], seating.rules.chairWidth, minimumSeatWidth);
  add("row-passage", "row-passage", minimumClearRowPassage === undefined ? "not_applicable" : passage + 1e-7 >= minimumClearRowPassage ? "pass" : "fail", minimumClearRowPassage === undefined ? "Reihendurchgang nicht anwendbar." : `Rechnerischer lichter Reihendurchgang ${passage.toFixed(2)} m; Profilwert ${minimumClearRowPassage.toFixed(2)} m. Vor Ort bestätigen.`, [], passage, minimumClearRowPassage);
  const blocks: BlockCheck[] = [];
  for (const block of seating.blocks) {
    const blockChecks: RuleCheckResult[] = [];
    const rows = egress.rowAccess.filter((row) => row.blockId === block.id);
    const routes = egress.routes.filter((route) => route.blockId === block.id);
    const sideRows = rows.filter((row) => row.leftAisleId || row.rightAisleId);
    const maxToAisle = Math.max(0, ...routes.map((route) => route.seatsToAisle ?? 0));
    const rowLimitStatus = maximumRowsPerBlock === undefined ? "not_applicable" : block.rowCount <= maximumRowsPerBlock ? "pass" : "fail";
    blockChecks.push({ id: `${block.id}-rows`, ruleId: "block-rows", status: rowLimitStatus, message: maximumRowsPerBlock === undefined ? `${block.id}: Reihenlimit nicht anwendbar.` : `${block.id}: ${block.rowCount} Reihen; Profilwert ${maximumRowsPerBlock}.`, affectedIds: [block.id], actualValue: block.rowCount, requiredValue: maximumRowsPerBlock });
    const inaccessible = rows.filter((row) => !row.leftAisleId && !row.rightAisleId);
    blockChecks.push({ id: `${block.id}-access`, ruleId: "row-access", status: inaccessible.length ? "fail" : "pass", message: inaccessible.length ? `${block.id}: ${inaccessible.length} Reihen ohne erreichbaren Seitengang.` : `${block.id}: alle Reihen erreichen einen Seitengang.`, affectedIds: [block.id, ...inaccessible.flatMap((row) => row.seatIds)] });
    const tooMany = rows.filter((row) => {
      const limit = row.leftAisleId && row.rightAisleId ? maximumSeatsBetweenAisles : maximumSeatsOneSideOfAisle;
      return limit !== undefined && row.seatIds.length > limit;
    });
    const disabled = maximumSeatsOneSideOfAisle === undefined && maximumSeatsBetweenAisles === undefined;
    blockChecks.push({ id: `${block.id}-row-seats`, ruleId: "row-seats", status: disabled ? "not_applicable" : tooMany.length ? "fail" : inaccessible.length ? "warning" : "pass", message: disabled ? `${block.id}: Sitzanzahl je Ganglage nicht anwendbar.` : tooMany.length ? `${block.id}: ${tooMany.length} Reihen überschreiten die Sitzanzahl für ihre tatsächliche Ganglage.` : inaccessible.length ? `${block.id}: Sitzanzahl erst nach Gangzugang bewertbar.` : `${block.id}: Sitzanzahl je Ganglage im Profilwert.`, affectedIds: [block.id, ...tooMany.flatMap((row) => row.seatIds)], actualValue: Math.max(0, ...rows.map((row) => row.seatIds.length)), requiredValue: sideRows.some((row) => row.leftAisleId && row.rightAisleId) ? maximumSeatsBetweenAisles : maximumSeatsOneSideOfAisle });
    const missing = routes.filter((route) => !route.valid);
    blockChecks.push({ id: `${block.id}-exit`, ruleId: "reachable-exit", status: missing.length ? "fail" : "pass", message: missing.length ? `${block.id}: ${missing.length} Plätze ohne modellierte Route zu einem markierten Ausgang.` : `${block.id}: alle Plätze erreichen einen markierten Ausgang.`, affectedIds: [block.id, ...missing.map((route) => route.originId)], actualValue: missing.length, requiredValue: 0 });
    const longest = Math.max(0, ...routes.filter((route) => route.valid).map((route) => route.distance));
    const maxDistance = profile.egress.maximumTravelDistance;
    blockChecks.push({ id: `${block.id}-distance`, ruleId: "travel-distance", status: maxDistance === undefined ? "not_applicable" : !routes.some((route) => route.valid) ? "warning" : longest > maxDistance + 1e-7 ? "fail" : "pass", message: maxDistance === undefined ? `${block.id}: Lauflänge nicht anwendbar.` : !routes.some((route) => route.valid) ? `${block.id}: Lauflänge ohne Ausgangsroute nicht bestimmbar.` : `${block.id}: längste modellierte Lauflinie ${longest.toFixed(2)} m; Profilwert ${maxDistance.toFixed(2)} m.`, affectedIds: [block.id], actualValue: longest, requiredValue: maxDistance });
    checks.push(...blockChecks);
    const angle = (seating.rotation ?? (seating.orientation === "horizontal" ? 0 : 90)) * Math.PI / 180;
    const along = (seat: { x: number; y: number }) => seat.x * Math.cos(angle) + seat.y * Math.sin(angle);
    const cross = (seat: { x: number; y: number }) => -seat.x * Math.sin(angle) + seat.y * Math.cos(angle);
    const minCross = Math.min(...block.seats.map(cross)), maxCross = Math.max(...block.seats.map(cross));
    const minAlong = Math.min(...block.seats.map(along)), maxAlong = Math.max(...block.seats.map(along));
    const nearbyCrossAisles = plan.objects.filter((o): o is AisleObject => o.type === "aisle" && Math.abs(along(o.end) - along(o.start)) > Math.abs(cross(o.end) - cross(o.start)) && Math.max(along(o.start), along(o.end)) >= minAlong && Math.min(along(o.start), along(o.end)) <= maxAlong);
    const nearEdge = (edge: number) => nearbyCrossAisles.some((aisle) => Math.abs((cross(aisle.start) + cross(aisle.end)) / 2 - edge) <= aisle.width / 2 + seating.rules.rowPitch);
    blocks.push({ blockId: block.id, rowCount: block.rowCount, maximumSeatsToAisle: maxToAisle, leftAisle: rows.some((row) => !!row.leftAisleId), rightAisle: rows.some((row) => !!row.rightAisleId), frontAisle: nearEdge(minCross), backAisle: nearEdge(maxCross), reachableExit: missing.length === 0, maximumTravelDistance: longest || undefined, checks: blockChecks });
  }
  const aisles = plan.objects.filter((o) => o.type === "aisle");
  const minAisle = profile.aisles.minimumWidth;
  for (const aisle of aisles) {
    const load = egress.aisleLoads.find((item) => item.aisleId === aisle.id);
    const required = Math.max(minAisle ?? 0, load?.requiredWidth ?? 0);
    add(`${aisle.id}-width`, "aisle-width", !required ? "not_applicable" : aisle.width + 1e-7 >= required ? "pass" : "fail", !required ? `Gang ${aisle.id}: Breitenregel nicht anwendbar.` : `Gang ${aisle.id}: ${load?.persons ?? 0} zugeordnete Personen; Breite ${aisle.width.toFixed(2)} m, rechnerisch erforderlich ${required.toFixed(2)} m.`, [aisle.id], aisle.width, required || undefined);
  }
  if (!aisles.length) add("aisles-missing", "aisle-width", "warning", "Keine Gänge eingezeichnet; Gangzugang und Rettungswege sind nicht nachweisbar.");
  for (const load of egress.exitLoads) add(`${load.doorId}-capacity`, "exit-capacity", load.requiredWidth === undefined ? "not_applicable" : load.clearWidth + 1e-7 >= load.requiredWidth ? "pass" : "fail", load.requiredWidth === undefined ? `Ausgang ${load.doorId}: Kapazitätsregel nicht anwendbar.` : `Ausgang ${load.doorId}: ${load.persons} zugeordnete Personen; lichte Breite ${load.clearWidth.toFixed(2)} m, rechnerisch erforderlich ${load.requiredWidth.toFixed(2)} m.`, [load.doorId], load.clearWidth, load.requiredWidth);
  if (!egress.exitLoads.length) add("exits-missing", "reachable-exit", "fail", "Kein für Rettungswege nutzbarer Ausgang markiert.");
  const counts = { pass: 0, warning: 0, fail: 0, not_applicable: 0 };
  for (const check of checks) counts[check.status]++;
  return { checks, blocks, counts };
}

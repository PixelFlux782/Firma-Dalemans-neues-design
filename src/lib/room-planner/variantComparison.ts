import type { VariantSummary } from "./variantSummary";

export type VariantDifference = { label: string; value: number; unit: "count" | "metres" | "squareMetres" };
export function compareVariants(base: VariantSummary, current: VariantSummary): VariantDifference[] {
  const result: VariantDifference[] = [];
  const add = (label: string, value: number, unit: VariantDifference["unit"]) => { if (Math.abs(value) >= (unit === "count" ? 1 : 0.05)) result.push({ label, value: Number(value.toFixed(1)), unit }); };
  add("Sitzplätze", current.seatCount - base.seatCount, "count");
  add("Sitzblöcke", current.blockCount - base.blockCount, "count");
  add("Gänge", current.aisleCount - base.aisleCount, "count");
  add("nicht erreichbare Plätze", current.unreachableSeatCount - base.unreachableSeatCount, "count");
  if (current.maxEgressDistance !== undefined && base.maxEgressDistance !== undefined) add("längster Weg", current.maxEgressDistance - base.maxEgressDistance, "metres");
  add("Gangfläche", current.aisleArea - base.aisleArea, "squareMetres");
  add("Fehler", current.errors.length - base.errors.length, "count");
  add("Warnungen", current.warnings.length - base.warnings.length, "count");
  return result;
}

export function characteristic(summary: VariantSummary, peers: VariantSummary[]): string | undefined {
  if (peers.length < 2) return undefined;
  if (summary.seatCount > Math.max(...peers.filter((peer) => peer !== summary).map((peer) => peer.seatCount)) + 2) return "Mehr Sitzplätze";
  const distances = peers.map((peer) => peer.maxEgressDistance).filter((value): value is number => value !== undefined);
  if (summary.maxEgressDistance !== undefined && distances.length === peers.length && summary.maxEgressDistance < Math.min(...peers.filter((peer) => peer !== summary).map((peer) => peer.maxEgressDistance!)) - 0.5) return "Kürzere modellierte Wege";
  if (summary.aisleArea > Math.max(...peers.filter((peer) => peer !== summary).map((peer) => peer.aisleArea)) + 1) return "Mehr Gangfläche";
  return undefined;
}

export function nearDuplicate(a: VariantSummary, b: VariantSummary, angleA: number, angleB: number): boolean {
  const angleDifference = Math.abs(((angleA - angleB + 90) % 180 + 180) % 180 - 90);
  return Math.abs(a.seatCount - b.seatCount) <= Math.max(2, a.seatCount * 0.015)
    && a.blockCount === b.blockCount && a.generatedAisleCount === b.generatedAisleCount
    && Math.abs(a.aisleArea - b.aisleArea) < 1 && angleDifference < 2
    && (a.maxEgressDistance === undefined && b.maxEgressDistance === undefined || a.maxEgressDistance !== undefined && b.maxEgressDistance !== undefined && Math.abs(a.maxEgressDistance - b.maxEgressDistance) < 0.5);
}

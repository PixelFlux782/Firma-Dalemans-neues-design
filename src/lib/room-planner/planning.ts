import type { RoomPlan } from "./objects";
import { polygonsOverlap } from "./objects";
import { generateSeatingPlan, seatPolygon, type SeatPlacement, type SeatingGridOffset, type SeatingOrientation, type SeatingPlan, type SeatingRules } from "./seating";
import { rowsOf } from "./seatingEditing";

export type ReplanningImpact = {
  seatsRemoved: number;
  protectedBlocks: number;
  editedGeneratedBlocks: number;
  manualBlocks: number;
  generatedAislesReplaced: number;
};

export function markGeneratedSeating(seating: SeatingPlan): SeatingPlan {
  return { ...seating, blocks: seating.blocks.map((block) => ({ ...block, source: "generated" as const, edited: false })) };
}

/** Global fast path used by the primary "free area" action. It deliberately uses
 * only the RoomPlan and its exclusions and does not inspect editor selection/tool
 * state or run the substantially more expensive variant/egress pipeline. */
export function generateFreeAreaSeating(plan: RoomPlan, rules: SeatingRules, offset: SeatingGridOffset = { along: 0, cross: 0 }): SeatingPlan {
  const input = { ...plan, seating: undefined };
  const horizontal = generateSeatingPlan(input, rules, "horizontal", offset);
  const vertical = generateSeatingPlan(input, rules, "vertical", offset);
  return markGeneratedSeating(vertical.totalSeats > horizontal.totalSeats ? vertical : horizontal);
}

export function replanningImpact(plan: RoomPlan): ReplanningImpact {
  const blocks = plan.seating?.blocks ?? [];
  const manualBlocks = blocks.filter((block) => block.source === "manual").length;
  const editedGeneratedBlocks = blocks.filter((block) => block.source !== "manual" && block.edited).length;
  return {
    seatsRemoved: plan.seating?.seats.length ?? 0,
    protectedBlocks: manualBlocks + editedGeneratedBlocks,
    editedGeneratedBlocks,
    manualBlocks,
    generatedAislesReplaced: plan.objects.filter((object) => object.type === "aisle" && object.source === "generated" && !object.edited).length,
  };
}

const uniqueId = (prefix: string, id: string, used: Set<string>) => {
  let candidate = `${prefix}-${id}`;
  let suffix = 2;
  while (used.has(candidate)) candidate = `${prefix}-${id}-${suffix++}`;
  used.add(candidate);
  return candidate;
};

/**
 * Adds seats only where the current plan is still free. Existing blocks, including
 * manually edited generated blocks, are kept byte-for-byte. The operation is
 * deterministic for identical inputs and returns the original seating object when
 * there is nothing to add.
 */
export function supplementSeatingPlan(
  plan: RoomPlan,
  rules: SeatingRules,
  orientation: SeatingOrientation,
  offset: SeatingGridOffset = { along: 0, cross: 0 },
  rotation?: number,
): SeatingPlan {
  const existing = plan.seating;
  const proposal = generateSeatingPlan({ ...plan, seating: undefined }, rules, orientation, offset, rotation);
  if (!existing) return markGeneratedSeating(proposal);

  const usedSeatIds = new Set(existing.seats.map((seat) => seat.id));
  const usedBlockIds = new Set(existing.blocks.map((block) => block.id));
  const addedBlocks: SeatingPlan["blocks"] = [];
  const cellSize = Math.max(rules.chairWidth, rules.chairDepth) + rules.minimumSideClearance;
  const key = (seat: SeatPlacement) => `${Math.floor(seat.x / cellSize)}:${Math.floor(seat.y / cellSize)}`;
  const occupied = new Map<string, SeatPlacement[]>();
  const remember = (seat: SeatPlacement) => { const id = key(seat); occupied.set(id, [...(occupied.get(id) ?? []), seat]); };
  existing.seats.forEach(remember);
  const conflicts = (seat: SeatPlacement) => {
    const cx = Math.floor(seat.x / cellSize), cy = Math.floor(seat.y / cellSize);
    const nearby: SeatPlacement[] = [];
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) nearby.push(...(occupied.get(`${x}:${y}`) ?? []));
    const polygon = seatPolygon(seat.x, seat.y, rules, orientation, seat.rotation);
    return nearby.some((other) => polygonsOverlap(polygon, seatPolygon(other.x, other.y, rules, orientation, other.rotation)));
  };

  for (const block of proposal.blocks) {
    const accepted: SeatPlacement[] = [];
    for (const seat of block.seats) {
      const candidate = { ...seat, id: uniqueId("supplement", seat.id, usedSeatIds) };
      if (!conflicts(candidate)) {
        accepted.push(candidate);
        remember(candidate);
      }
    }
    if (!accepted.length) continue;
    const id = uniqueId("supplement", block.id, usedBlockIds);
    const normalized = { ...block, id, seats: accepted, source: "generated" as const, edited: false };
    const rows = rowsOf(normalized);
    addedBlocks.push({ ...normalized, rowCount: rows.length, seatsPerRow: rows.map((row) => row.seats.length) });
  }

  if (!addedBlocks.length) return existing;
  const blocks = [...existing.blocks, ...addedBlocks];
  const seats = blocks.flatMap((block) => block.seats);
  return {
    ...existing,
    blocks,
    seats,
    totalSeats: seats.length,
    totalRows: blocks.reduce((sum, block) => sum + rowsOf(block).length, 0),
    longestRow: Math.max(0, ...blocks.flatMap((block) => rowsOf(block).map((row) => row.seats.length))),
    hints: [...existing.hints, `Freie Fläche ergänzt: ${seats.length - existing.seats.length} zusätzliche Sitzplätze.`],
  };
}

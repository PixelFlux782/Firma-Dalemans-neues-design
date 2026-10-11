import type { RoomPlan } from "./objects";
import { generateSeatingPlan, type SeatPlacement, type SeatingGridOffset, type SeatingOrientation, type SeatingPlan, type SeatingRules } from "./seating";
import { rowsOf, seatProblems } from "./seatingEditing";

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
  let accumulated: SeatingPlan = existing;

  for (const block of proposal.blocks) {
    const accepted: SeatPlacement[] = [];
    for (const seat of block.seats) {
      const candidate = { ...seat, id: uniqueId("supplement", seat.id, usedSeatIds) };
      if (!seatProblems(plan, accumulated, [candidate]).length) {
        accepted.push(candidate);
        accumulated = { ...accumulated, seats: [...accumulated.seats, candidate] };
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

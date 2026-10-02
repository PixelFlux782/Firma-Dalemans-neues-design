import { polygonsOverlap, type Position, type RoomPlan } from "./objects";
import { rotatePoint, seatFits, seatPolygon, type SeatPlacement, type SeatingBlock, type SeatingPlan } from "./seating";

export type SeatingEdit = { seating: SeatingPlan; message?: string };
const unchanged = (seating: SeatingPlan, message: string): SeatingEdit => ({ seating, message });

export function rowsOf(block: SeatingBlock): { id: number; seats: SeatPlacement[] }[] {
  return [...new Set(block.seats.map((seat) => seat.row))].sort((a, b) => a - b)
    .map((id) => ({ id, seats: block.seats.filter((seat) => seat.row === id).sort((a, b) => a.index - b.index) }));
}

function rebuild(seating: SeatingPlan, blocks: SeatingBlock[]): SeatingPlan {
  const normalized = blocks.filter((block) => block.seats.length).map((block) => ({ ...block, rowCount: rowsOf(block).length, seatsPerRow: rowsOf(block).map((row) => row.seats.length) }));
  const seats = normalized.flatMap((block) => block.seats);
  return { ...seating, blocks: normalized, seats, totalSeats: seats.length, totalRows: normalized.reduce((count, block) => count + block.rowCount, 0), longestRow: Math.max(0, ...normalized.flatMap((block) => block.seatsPerRow)) };
}

function replaceBlock(seating: SeatingPlan, blockId: string, change: (block: SeatingBlock) => SeatingBlock | null): SeatingPlan {
  return rebuild(seating, seating.blocks.flatMap((block) => { if (block.id !== blockId) return [block]; const changed = change(block); return changed ? [changed] : []; }));
}

export function seatProblems(plan: RoomPlan, seating: SeatingPlan, candidates: SeatPlacement[], ignoredIds: Set<string> = new Set()): string[] {
  const other = seating.seats.filter((seat) => !ignoredIds.has(seat.id) && !candidates.some((candidate) => candidate.id === seat.id));
  const issues: string[] = [];
  const conflicts = (a: SeatPlacement, b: SeatPlacement) => {
    const distance = Math.hypot(a.x - b.x, a.y - b.y);
    if (distance >= seating.rules.chairWidth + seating.rules.chairDepth) return false;
    const overlap = polygonsOverlap(seatPolygon(a.x, a.y, seating.rules, seating.orientation, a.rotation), seatPolygon(b.x, b.y, seating.rules, seating.orientation, b.rotation));
    if (overlap) return true;
    if (Math.abs(((a.rotation - b.rotation) % 180 + 180) % 180) > 1e-6) return false;
    const radians = a.rotation * Math.PI / 180, dx = b.x - a.x, dy = b.y - a.y;
    const along = Math.abs(dx * Math.cos(radians) + dy * Math.sin(radians));
    const across = Math.abs(-dx * Math.sin(radians) + dy * Math.cos(radians));
    return across < seating.rules.chairDepth - 1e-8 && along < seating.rules.chairWidth + seating.rules.minimumSideClearance - 1e-8;
  };
  for (const seat of candidates) {
    if (!seatFits(plan, seating.rules, seating.orientation, seat.x, seat.y, seat.rotation)) { issues.push(seat.id); continue; }
    if (other.some((neighbor) => conflicts(seat, neighbor))) issues.push(seat.id);
  }
  for (let i = 0; i < candidates.length; i++) for (let j = i + 1; j < candidates.length; j++) {
    if (conflicts(candidates[i], candidates[j])) issues.push(candidates[i].id, candidates[j].id);
  }
  return [...new Set(issues)];
}

export function moveBlock(plan: RoomPlan, seating: SeatingPlan, blockId: string, dx: number, dy: number): SeatingEdit {
  const block = seating.blocks.find((item) => item.id === blockId);
  if (!block || !Number.isFinite(dx) || !Number.isFinite(dy)) return unchanged(seating, "Sitzblock nicht gefunden.");
  const seats = block.seats.map((seat) => ({ ...seat, x: Number((seat.x + dx).toFixed(4)), y: Number((seat.y + dy).toFixed(4)) }));
  if (seatProblems(plan, seating, seats, new Set(block.seats.map((seat) => seat.id))).length) return unchanged(seating, "Sitzblock kollidiert mit Raumgrenze, Objekt, Gang oder anderen Sitzen.");
  return { seating: replaceBlock(seating, blockId, (item) => ({ ...item, seats, origin: item.origin ? { x: item.origin.x + dx, y: item.origin.y + dy } : undefined, edited: true })) };
}

export function rotateBlock(plan: RoomPlan, seating: SeatingPlan, blockId: string, angle: number): SeatingEdit {
  const block = seating.blocks.find((item) => item.id === blockId);
  if (!block || !Number.isFinite(angle)) return unchanged(seating, "Ungültiger Drehwinkel.");
  const center: Position = { x: block.seats.reduce((sum, seat) => sum + seat.x, 0) / block.seats.length, y: block.seats.reduce((sum, seat) => sum + seat.y, 0) / block.seats.length };
  const previous = block.rotation ?? block.seats[0]?.rotation ?? 0;
  const seats = block.seats.map((seat) => ({ ...seat, ...rotatePoint({ x: seat.x - center.x, y: seat.y - center.y }, center, angle - previous), rotation: seat.rotation + angle - previous }));
  if (seatProblems(plan, seating, seats, new Set(block.seats.map((seat) => seat.id))).length) return unchanged(seating, "Drehung kollidiert mit Raumgrenze, Objekt, Gang oder anderen Sitzen.");
  return { seating: replaceBlock(seating, blockId, (item) => ({ ...item, seats, rotation: angle, origin: center, edited: true })) };
}

export function removeBlock(seating: SeatingPlan, blockId: string): SeatingPlan { return rebuild(seating, seating.blocks.filter((block) => block.id !== blockId)); }
export function removeSeat(seating: SeatingPlan, seatId: string): SeatingPlan {
  return rebuild(seating, seating.blocks.map((block) => block.seats.some((seat) => seat.id === seatId) ? { ...block, edited: true, seats: block.seats.filter((seat) => seat.id !== seatId) } : block));
}

export function editRow(plan: RoomPlan, seating: SeatingPlan, blockId: string, rowId: number, end: "left" | "right", count: number): SeatingEdit {
  const block = seating.blocks.find((item) => item.id === blockId);
  const row = block && rowsOf(block).find((item) => item.id === rowId);
  if (!block || !row || !Number.isInteger(count) || !count) return unchanged(seating, "Reihe nicht gefunden.");
  if (count < 0) {
    const remove = new Set((end === "left" ? row.seats.slice(0, -count) : row.seats.slice(count)).map((seat) => seat.id));
    return { seating: rebuild(seating, seating.blocks.map((item) => item.id === blockId ? { ...item, edited: true, seats: item.seats.filter((seat) => !remove.has(seat.id)) } : item)) };
  }
  const edge = end === "left" ? row.seats[0] : row.seats.at(-1)!;
  const pitch = block.seatPitch ?? seating.rules.chairWidth + seating.rules.minimumSideClearance;
  const radians = edge.rotation * Math.PI / 180;
  const sign = end === "left" ? -1 : 1;
  const added = Array.from({ length: count }, (_, index) => {
    const slot = edge.index + sign * (index + 1);
    return { ...edge, id: `${blockId}-row-${rowId}-slot-${slot}`, index: slot, x: edge.x + sign * (index + 1) * pitch * Math.cos(radians), y: edge.y + sign * (index + 1) * pitch * Math.sin(radians) };
  });
  if (seating.totalSeats + count > seating.rules.maximumSeats || added.some((seat) => seating.seats.some((other) => other.id === seat.id)) || seatProblems(plan, seating, added).length) return unchanged(seating, "Am Reihenende ist für weitere Sitze kein gültiger Platz.");
  return { seating: rebuild(seating, seating.blocks.map((item) => item.id === blockId ? { ...item, edited: true, seats: [...item.seats, ...added] } : item)) };
}

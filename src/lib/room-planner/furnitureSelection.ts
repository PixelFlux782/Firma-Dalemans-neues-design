import { aislePolygon, doorSegment, isBlockingObject, obstaclePolygon, polygonInsideRoom, polygonsOverlap, type Position, type RoomPlan } from "./objects";
import { polygonsInteriorOverlap, rotatedRectangle, tablePolygon } from "./tables";

export type FurnitureKind = "table" | "chair" | "seat";
export type FurnitureFootprint = { id: string; kind: FurnitureKind; points: Position[] };
export type SelectionTransform = { dx?: number; dy?: number; rotation?: number; center?: Position };
export type DuplicateIdFactory = (kind: FurnitureKind | "group" | "block") => string;

const round = (value: number) => {
  const result = Number(value.toFixed(3));
  return Object.is(result, -0) ? 0 : result;
};
const normalizeAngle = (value: number) => Number(((value % 360 + 360) % 360).toFixed(3));

export function furnitureFootprints(plan: RoomPlan): FurnitureFootprint[] {
  const rules = plan.seating?.rules;
  return [
    ...(plan.tables ?? []).map((table) => ({ id: table.id, kind: "table" as const, points: tablePolygon(table) })),
    ...(plan.chairs ?? []).map((chair) => ({ id: chair.id, kind: "chair" as const, points: rotatedRectangle(chair) })),
    ...(plan.seating?.seats ?? []).map((seat) => ({
      id: seat.id,
      kind: "seat" as const,
      points: rotatedRectangle({ ...seat, width: rules?.chairWidth ?? .5, depth: rules?.chairDepth ?? .55 }),
    })),
  ];
}

export function normalizeFurnitureSelection(plan: RoomPlan, ids: Iterable<string>): string[] {
  const available = new Set(furnitureFootprints(plan).map((item) => item.id));
  return [...new Set(ids)].filter((id) => available.has(id));
}

export function selectFurnitureInMarquee(plan: RoomPlan, a: Position, b: Position): string[] {
  const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y), maxY = Math.max(a.y, b.y);
  return furnitureFootprints(plan)
    .filter(({ points }) => points.every((point) => point.x >= minX - 1e-8 && point.x <= maxX + 1e-8 && point.y >= minY - 1e-8 && point.y <= maxY + 1e-8))
    .map(({ id }) => id);
}

export function furnitureSelectionBounds(plan: RoomPlan, ids: Iterable<string>): { minX: number; minY: number; maxX: number; maxY: number; center: Position } | null {
  const selected = new Set(ids);
  const points = furnitureFootprints(plan).filter((item) => selected.has(item.id)).flatMap((item) => item.points);
  if (!points.length) return null;
  const minX = Math.min(...points.map((point) => point.x)), maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y)), maxY = Math.max(...points.map((point) => point.y));
  return { minX, minY, maxX, maxY, center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 } };
}

export function transformFurnitureSelection(plan: RoomPlan, ids: Iterable<string>, transform: SelectionTransform): RoomPlan {
  const selected = new Set(normalizeFurnitureSelection(plan, ids));
  if (!selected.size) return plan;
  const center = transform.center ?? furnitureSelectionBounds(plan, selected)?.center;
  if (!center) return plan;
  const dx = transform.dx ?? 0, dy = transform.dy ?? 0, rotation = transform.rotation ?? 0;
  const radians = rotation * Math.PI / 180, c = Math.cos(radians), s = Math.sin(radians);
  const changedPosition = (item: { x: number; y: number }) => {
    const x = item.x - center.x, y = item.y - center.y;
    return { x: round(center.x + dx + x * c - y * s), y: round(center.y + dy + x * s + y * c) };
  };
  const change = <T extends { id: string; x: number; y: number; rotation: number }>(item: T): T => {
    if (!selected.has(item.id)) return item;
    return { ...item, ...changedPosition(item), rotation: normalizeAngle(item.rotation + rotation) };
  };
  const seating = plan.seating ? (() => {
    const blocks = plan.seating!.blocks.map((block) => {
      const selectedSeats = block.seats.filter((seat) => selected.has(seat.id));
      if (!selectedSeats.length) return block;
      const allSelected = selectedSeats.length === block.seats.length;
      return {
        ...block,
        seats: block.seats.map(change),
        origin: allSelected && block.origin ? changedPosition(block.origin) : undefined,
        rotation: allSelected && block.rotation !== undefined ? normalizeAngle(block.rotation + rotation) : undefined,
        edited: true,
      };
    });
    return { ...plan.seating!, blocks, seats: blocks.flatMap((block) => block.seats) };
  })() : undefined;
  return {
    ...plan,
    tables: (plan.tables ?? []).map((table) => selected.has(table.id) ? { ...change(table), edited: true } : table),
    chairs: (plan.chairs ?? []).map((chair) => selected.has(chair.id) ? { ...change(chair), edited: true } : chair),
    ...(seating ? { seating } : {}),
  };
}

function doorClearance(plan: RoomPlan): Position[][] {
  return plan.objects.flatMap((object) => {
    if (object.type !== "door") return [];
    const segment = doorSegment(plan.contour, object);
    if (!segment) return [];
    const center = { x: (segment.start.x + segment.end.x) / 2, y: (segment.start.y + segment.end.y) / 2 };
    return [rotatedRectangle({ ...center, width: object.width + .4, depth: 1.2, rotation: Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * 180 / Math.PI })];
  });
}

/** Returns only selected IDs whose proposed footprint conflicts. Contacts inside
 * the selected set are intentionally ignored because the group is rigid. */
export function furnitureSelectionConflicts(plan: RoomPlan, ids: Iterable<string>): Set<string> {
  const selected = new Set(normalizeFurnitureSelection(plan, ids));
  const footprints = furnitureFootprints(plan);
  const fixed = footprints.filter((item) => !selected.has(item.id));
  const obstacles = plan.objects.filter(isBlockingObject).map(obstaclePolygon);
  const aisles = plan.objects.filter((object) => object.type === "aisle").map(aislePolygon);
  const doors = doorClearance(plan);
  const conflicts = new Set<string>();
  for (const item of footprints) {
    if (!selected.has(item.id)) continue;
    if (!polygonInsideRoom(item.points, plan.contour)
      || obstacles.some((polygon) => polygonsOverlap(item.points, polygon))
      || aisles.some((polygon) => polygonsOverlap(item.points, polygon))
      || doors.some((polygon) => polygonsOverlap(item.points, polygon))
      || fixed.some((other) => polygonsInteriorOverlap(item.points, other.points))) conflicts.add(item.id);
  }
  return conflicts;
}

export function deleteFurnitureSelection(plan: RoomPlan, ids: Iterable<string>): RoomPlan {
  const selected = new Set(normalizeFurnitureSelection(plan, ids));
  if (!selected.size) return plan;
  const tables = (plan.tables ?? []).filter((item) => !selected.has(item.id));
  const chairs = (plan.chairs ?? []).filter((item) => !selected.has(item.id)).map((item) => item.tableId && selected.has(item.tableId) ? { ...item, tableId: undefined, edited: true } : item);
  const tableIds = new Set(tables.map((item) => item.id)), chairIds = new Set(chairs.map((item) => item.id));
  const tableGroups = (plan.tableGroups ?? []).map((group) => ({ ...group, tableIds: group.tableIds.filter((id) => tableIds.has(id)), chairIds: group.chairIds.filter((id) => chairIds.has(id)) })).filter((group) => group.tableIds.length || group.chairIds.length);
  const seating = plan.seating ? (() => {
    const blocks = plan.seating!.blocks.map((block) => {
      const seats = block.seats.filter((seat) => !selected.has(seat.id));
      const rows = [...new Set(seats.map((seat) => seat.row))];
      return { ...block, seats, rowCount: rows.length, seatsPerRow: rows.map((row) => seats.filter((seat) => seat.row === row).length), edited: seats.length !== block.seats.length || block.edited };
    }).filter((block) => block.seats.length);
    const seats = blocks.flatMap((block) => block.seats);
    return { ...plan.seating!, blocks, seats, totalSeats: seats.length, totalRows: blocks.reduce((sum, block) => sum + new Set(block.seats.map((seat) => seat.row)).size, 0), longestRow: Math.max(0, ...blocks.flatMap((block) => [...new Set(block.seats.map((seat) => seat.row))].map((row) => block.seats.filter((seat) => seat.row === row).length))) };
  })() : undefined;
  return { ...plan, tables, chairs, tableGroups, ...(seating ? { seating } : {}) };
}

export function duplicateFurnitureSelection(plan: RoomPlan, ids: Iterable<string>, createId: DuplicateIdFactory, offset = { x: .35, y: .35 }): { plan: RoomPlan; selectedIds: string[] } {
  const selected = new Set(normalizeFurnitureSelection(plan, ids));
  if (!selected.size) return { plan, selectedIds: [] };
  const idMap = new Map<string, string>();
  const duplicatedIds: string[] = [];
  const tables: NonNullable<RoomPlan["tables"]> = (plan.tables ?? []).filter((item) => selected.has(item.id)).map((item) => {
    const id = createId("table"); idMap.set(item.id, id);
    duplicatedIds.push(id);
    return { ...item, id, x: round(item.x + offset.x), y: round(item.y + offset.y), groupId: undefined, source: "manual" as const, edited: true };
  });
  const chairs: NonNullable<RoomPlan["chairs"]> = (plan.chairs ?? []).filter((item) => selected.has(item.id)).map((item) => {
    const id = createId("chair"); idMap.set(item.id, id);
    duplicatedIds.push(id);
    return { ...item, id, x: round(item.x + offset.x), y: round(item.y + offset.y), groupId: undefined, tableId: item.tableId ? idMap.get(item.tableId) : undefined, source: "manual" as const, edited: true };
  });
  const tableGroups = (plan.tableGroups ?? []).flatMap((group) => {
    const mappedTables = group.tableIds.flatMap((id) => idMap.get(id) ?? []), mappedChairs = group.chairIds.flatMap((id) => idMap.get(id) ?? []);
    if (!mappedTables.length && !mappedChairs.length) return [];
    const id = createId("group");
    tables.forEach((table) => { if (mappedTables.includes(table.id)) table.groupId = id; });
    chairs.forEach((chair) => { if (mappedChairs.includes(chair.id)) chair.groupId = id; });
    return [{ id, tableIds: mappedTables, chairIds: mappedChairs }];
  });
  const seating = plan.seating ? (() => {
    const addedBlocks = plan.seating!.blocks.flatMap((block) => {
      const sourceSeats = block.seats.filter((seat) => selected.has(seat.id));
      if (!sourceSeats.length) return [];
      const allSelected = sourceSeats.length === block.seats.length;
      const seats = sourceSeats.map((seat) => { const id = createId("seat"); idMap.set(seat.id, id); duplicatedIds.push(id); return { ...seat, id, x: round(seat.x + offset.x), y: round(seat.y + offset.y) }; });
      return [{ ...block, id: createId("block"), seats, origin: allSelected && block.origin ? { x: round(block.origin.x + offset.x), y: round(block.origin.y + offset.y) } : undefined, rotation: allSelected ? block.rotation : undefined, rowCount: new Set(seats.map((seat) => seat.row)).size, seatsPerRow: [...new Set(seats.map((seat) => seat.row))].map((row) => seats.filter((seat) => seat.row === row).length), source: "manual" as const, edited: true }];
    });
    const addedSeats = addedBlocks.flatMap((block) => block.seats);
    const blocks = [...plan.seating!.blocks, ...addedBlocks], allSeats = [...plan.seating!.seats, ...addedSeats];
    return { ...plan.seating!, blocks, seats: allSeats, totalSeats: allSeats.length, totalRows: blocks.reduce((sum, block) => sum + block.rowCount, 0), longestRow: Math.max(plan.seating!.longestRow, ...addedBlocks.flatMap((block) => block.seatsPerRow), 0) };
  })() : undefined;
  return {
    plan: { ...plan, tables: [...(plan.tables ?? []), ...tables], chairs: [...(plan.chairs ?? []), ...chairs], tableGroups: [...(plan.tableGroups ?? []), ...tableGroups], ...(seating ? { seating } : {}) },
    selectedIds: duplicatedIds,
  };
}

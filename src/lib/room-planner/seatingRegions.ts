import { aislePolygon, isBlockingObject, obstaclePolygon, pointInPolygon, type Position, type RoomPlan } from "./objects";

export type SeatingRegion = { id: string; minAlong: number; maxAlong: number; minCross: number; maxCross: number; contains: (point: Position) => boolean };
export const SEATING_REGION_LIMITS = Object.freeze({ minimumSeats: 2, minimumAlong: 0.5, minimumCross: 0.55, maximumCells: 4096 });

// An arrangement of actual polygon edges in the seating coordinate system. Cells are
// connected only across free edges, so a full aisle separates components without
// requiring special cases for horizontal, vertical, or rotated plans.
export function seatingRegions(plan: RoomPlan, toLocal: (point: Position) => Position): SeatingRegion[] {
  const room = plan.contour.points.map(toLocal);
  const wholeRoom: SeatingRegion = {
    id: "region-1", minAlong: Math.min(...room.map((point) => point.x)), maxAlong: Math.max(...room.map((point) => point.x)),
    minCross: Math.min(...room.map((point) => point.y)), maxCross: Math.max(...room.map((point) => point.y)), contains: () => true,
  };
  const roomWidth = Math.max(...room.map((point) => point.x)) - Math.min(...room.map((point) => point.x));
  const roomHeight = Math.max(...room.map((point) => point.y)) - Math.min(...room.map((point) => point.y));
  const exclusions = plan.objects.flatMap((object) => {
    if (isBlockingObject(object)) return [obstaclePolygon(object).map(toLocal)];
    if (object.type !== "aisle") return [];
    const polygon = aislePolygon(object).map(toLocal);
    const start = toLocal(object.start), end = toLocal(object.end);
    const dx = end.x - start.x, dy = end.y - start.y;
    const extent = Math.abs(dx) >= Math.abs(dy) ? roomWidth : roomHeight;
    if (Math.hypot(dx, dy) < extent * 0.6) return [polygon];
    const length = Math.hypot(dx, dy), extension = Math.hypot(roomWidth, roomHeight);
    const ux = dx / length, uy = dy / length, nx = -uy * object.width / 2, ny = ux * object.width / 2;
    const a = { x: start.x - ux * extension, y: start.y - uy * extension };
    const b = { x: end.x + ux * extension, y: end.y + uy * extension };
    return [[{ x: a.x + nx, y: a.y + ny }, { x: b.x + nx, y: b.y + ny }, { x: b.x - nx, y: b.y - ny }, { x: a.x - nx, y: a.y - ny }]];
  });
  const orthogonalContour = room.every((point, index) => {
    const next = room[(index + 1) % room.length];
    return Math.abs(point.x - next.x) < 1e-7 || Math.abs(point.y - next.y) < 1e-7;
  });
  const splitContourBands = !exclusions.length && orthogonalContour && room.length > 4;
  if (!exclusions.length && !splitContourBands) return [wholeRoom];
  const polygons = [room, ...exclusions].filter((polygon) => polygon.length >= 3);
  const coordinates = (key: "x" | "y") => [...new Set(polygons.flatMap((polygon) => polygon.map((point) => Number(point[key].toFixed(7)))))].sort((a, b) => a - b);
  const xs = coordinates("x"), ys = coordinates("y");
  const nx = xs.length - 1, ny = ys.length - 1;
  if (!nx || !ny || nx * ny > SEATING_REGION_LIMITS.maximumCells) return [wholeRoom];
  const free = new Set<number>();
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    const center = { x: (xs[x] + xs[x + 1]) / 2, y: (ys[y] + ys[y + 1]) / 2 };
    if (pointInPolygon(center, room) && !exclusions.some((polygon) => pointInPolygon(center, polygon))) free.add(y * nx + x);
  }
  const regions: SeatingRegion[] = [];
  while (free.size) {
    const start = Math.min(...free), queue = [start], cells = new Set<number>([start]);
    free.delete(start);
    for (let head = 0; head < queue.length; head++) {
      const cell = queue[head], x = cell % nx, y = Math.floor(cell / nx);
      for (const neighbor of [x > 0 ? cell - 1 : -1, x + 1 < nx ? cell + 1 : -1, !splitContourBands && y > 0 ? cell - nx : -1, !splitContourBands && y + 1 < ny ? cell + nx : -1]) {
        if (free.delete(neighbor)) { cells.add(neighbor); queue.push(neighbor); }
      }
    }
    const xIndices = queue.map((cell) => cell % nx), yIndices = queue.map((cell) => Math.floor(cell / nx));
    const minAlong = xs[Math.min(...xIndices)], maxAlong = xs[Math.max(...xIndices) + 1];
    const minCross = ys[Math.min(...yIndices)], maxCross = ys[Math.max(...yIndices) + 1];
    if (maxAlong - minAlong < SEATING_REGION_LIMITS.minimumAlong || maxCross - minCross < SEATING_REGION_LIMITS.minimumCross) continue;
    regions.push({ id: `region-${regions.length + 1}`, minAlong, maxAlong, minCross, maxCross, contains: (point) => {
      const x = xs.findIndex((value, index) => index < nx && point.x >= value - 1e-8 && point.x < xs[index + 1] - 1e-8);
      const y = ys.findIndex((value, index) => index < ny && point.y >= value - 1e-8 && point.y < ys[index + 1] - 1e-8);
      return x >= 0 && y >= 0 && cells.has(y * nx + x);
    } });
  }
  return regions.sort((a, b) => a.minCross - b.minCross || a.minAlong - b.minAlong);
}

export type Point2D = { id: string; x: number; y: number };
export type RoomWall = { id: string; startPointId: string; endPointId: string };
export type RoomGeometry = { points: Point2D[]; walls: RoomWall[]; closed: boolean };

export const SNAP_METERS = 0.1;
export const emptyRoom = (): RoomGeometry => ({ points: [], walls: [], closed: false });
export const snap = (value: number, step = SNAP_METERS) => Math.round(value / step) * step;
export const snapPoint = (point: Pick<Point2D, "x" | "y">) => ({ x: Number(snap(point.x).toFixed(2)), y: Number(snap(point.y).toFixed(2)) });
export const wallLength = (a: Pick<Point2D, "x" | "y">, b: Pick<Point2D, "x" | "y">) => Math.hypot(b.x - a.x, b.y - a.y);
export const pointById = (room: RoomGeometry, id: string) => room.points.find((point) => point.id === id);
export const polygonArea = (points: Point2D[]) => Math.abs(points.reduce((sum, point, index) => {
  const next = points[(index + 1) % points.length];
  return sum + point.x * next.y - next.x * point.y;
}, 0)) / 2;
export const perimeter = (room: RoomGeometry) => room.walls.reduce((sum, wall) => {
  const a = pointById(room, wall.startPointId);
  const b = pointById(room, wall.endPointId);
  return sum + (a && b ? wallLength(a, b) : 0);
}, 0);

export function appendPoint(room: RoomGeometry, point: Point2D): RoomGeometry {
  if (room.closed) return room;
  const previous = room.points.at(-1);
  return {
    points: [...room.points, point],
    walls: previous ? [...room.walls, { id: `wall-${previous.id}-${point.id}`, startPointId: previous.id, endPointId: point.id }] : room.walls,
    closed: false,
  };
}

export function closeRoom(room: RoomGeometry): RoomGeometry {
  if (room.closed || room.points.length < 3) return room;
  const first = room.points[0];
  const last = room.points.at(-1)!;
  return { ...room, closed: true, walls: [...room.walls, { id: `wall-${last.id}-${first.id}`, startPointId: last.id, endPointId: first.id }] };
}

export function movePoint(room: RoomGeometry, id: string, position: Pick<Point2D, "x" | "y">): RoomGeometry {
  return { ...room, points: room.points.map((point) => point.id === id ? { ...point, ...position } : point) };
}

const cross = (a: Point2D, b: Point2D, c: Point2D) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const onSegment = (a: Point2D, b: Point2D, p: Point2D) =>
  Math.abs(cross(a, b, p)) < 1e-9 && p.x >= Math.min(a.x, b.x) - 1e-9 && p.x <= Math.max(a.x, b.x) + 1e-9 && p.y >= Math.min(a.y, b.y) - 1e-9 && p.y <= Math.max(a.y, b.y) + 1e-9;
function intersects(a: Point2D, b: Point2D, c: Point2D, d: Point2D) {
  const abC = cross(a, b, c), abD = cross(a, b, d), cdA = cross(c, d, a), cdB = cross(c, d, b);
  return (abC * abD < 0 && cdA * cdB < 0) || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
}

export function validateRoom(room: RoomGeometry): string[] {
  const errors: string[] = [];
  if (room.closed && room.points.length < 3) errors.push("Ein Raum benötigt mindestens drei Eckpunkte.");
  if (room.points.some((point, index) => room.points.slice(index + 1).some((other) => wallLength(point, other) < 1e-9))) errors.push("Eckpunkte liegen übereinander.");
  const segments = room.walls.map((wall) => ({ a: pointById(room, wall.startPointId), b: pointById(room, wall.endPointId) }));
  if (segments.some(({ a, b }) => !a || !b || wallLength(a, b) < 1e-9)) errors.push("Eine Wand hat keine Länge.");
  for (let i = 0; i < segments.length; i++) for (let j = i + 1; j < segments.length; j++) {
    const adjacent = Math.abs(i - j) === 1 || (room.closed && i === 0 && j === segments.length - 1);
    if (!adjacent) {
      const first = segments[i], second = segments[j];
      if (first.a && first.b && second.a && second.b && intersects(first.a, first.b, second.a, second.b)) {
        errors.push("Raumkontur überschneidet sich selbst.");
        i = segments.length;
        break;
      }
    }
  }
  if (room.closed && polygonArea(room.points) < 1e-9) errors.push("Die Raumkontur hat keine gültige Fläche.");
  return errors;
}

export function orthogonalSnap(origin: Point2D, target: Pick<Point2D, "x" | "y">, shift: boolean) {
  if (!shift) return target;
  return Math.abs(target.x - origin.x) >= Math.abs(target.y - origin.y)
    ? { x: target.x, y: origin.y } : { x: origin.x, y: target.y };
}

export const formatMeters = (value: number) => `${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;

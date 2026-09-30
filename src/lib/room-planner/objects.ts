import { pointById, wallLength, type Point2D, type RoomGeometry, type RoomWall } from "./geometry";

export type Position = { x: number; y: number };
export type DoorObject = { id: string; type: "door"; wallId: string; offset: number; width: number; role?: "normal" | "exit" | "emergency_exit"; clearWidth?: number; openingDirection?: "inside" | "outside"; hingeSide?: "left" | "right" };
export type ObstacleObject = { id: string; type: "obstacle"; obstacleType: "column" | "stage" | "technical" | "furniture" | "restricted"; x: number; y: number; width: number; depth: number; rotation: number };
export type RoomFront = { id: string; type: "front"; x: number; y: number; width: number; rotation: number };
export type Stage = { id: string; type: "stage"; x: number; y: number; width: number; depth: number; rotation: number };
export type ReservedArea = { id: string; type: "reservedArea"; x: number; y: number; width: number; depth: number; rotation: number; name?: string };
export type AisleObject = { id: string; type: "aisle"; start: Position; end: Position; width: number; source?: "manual" | "generated" };
export type RoomObject = DoorObject | ObstacleObject | AisleObject | RoomFront | Stage | ReservedArea;
export type BlockingObject = ObstacleObject | Stage | ReservedArea;
export const isBlockingObject = (object: RoomObject): object is BlockingObject => object.type === "obstacle" || object.type === "stage" || object.type === "reservedArea";
export type RoomPlan = { contour: RoomGeometry; objects: RoomObject[] };
export type Issue = { objectId: string; severity: "error" | "warning"; message: string };
export const emptyPlan = (): RoomPlan => ({ contour: { points: [], walls: [], closed: false }, objects: [] });

const EPS = 1e-8;
export function wallEndpoints(room: RoomGeometry, wallId: string): { a: Point2D; b: Point2D; wall: RoomWall } | null {
  const wall = room.walls.find((item) => item.id === wallId);
  const a = wall && pointById(room, wall.startPointId), b = wall && pointById(room, wall.endPointId);
  return wall && a && b ? { wall, a, b } : null;
}
// Door offset is metres from the wall's start point. Rotation is degrees clockwise in screen/world coordinates.
export function wallPoint(room: RoomGeometry, wallId: string, offset: number): Position | null {
  const ends = wallEndpoints(room, wallId);
  if (!ends) return null;
  const length = wallLength(ends.a, ends.b);
  return length > EPS ? { x: ends.a.x + (ends.b.x - ends.a.x) * offset / length, y: ends.a.y + (ends.b.y - ends.a.y) * offset / length } : null;
}
export function wallOffset(room: RoomGeometry, wallId: string, point: Position): number | null {
  const ends = wallEndpoints(room, wallId);
  if (!ends) return null;
  const dx = ends.b.x - ends.a.x, dy = ends.b.y - ends.a.y;
  const length = Math.hypot(dx, dy);
  return length > EPS ? ((point.x - ends.a.x) * dx + (point.y - ends.a.y) * dy) / length : null;
}
export function doorFits(room: RoomGeometry, door: DoorObject): boolean {
  const ends = wallEndpoints(room, door.wallId);
  return !!ends && Number.isFinite(door.width) && Number.isFinite(door.offset) && door.width > 0 && door.offset >= -EPS && door.offset + door.width <= wallLength(ends.a, ends.b) + EPS;
}
export function doorSegment(room: RoomGeometry, door: DoorObject): { start: Position; end: Position } | null {
  const start = wallPoint(room, door.wallId, door.offset), end = wallPoint(room, door.wallId, door.offset + door.width);
  return start && end ? { start, end } : null;
}
export function obstaclePolygon(object: BlockingObject): Position[] {
  const angle = object.rotation * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
    const x = sx * object.width / 2, y = sy * object.depth / 2;
    return { x: object.x + x * c - y * s, y: object.y + x * s + y * c };
  });
}
export function frontSegment(front: RoomFront): { start: Position; end: Position } {
  const angle = front.rotation * Math.PI / 180;
  const dx = Math.cos(angle) * front.width / 2, dy = Math.sin(angle) * front.width / 2;
  return { start: { x: front.x - dx, y: front.y - dy }, end: { x: front.x + dx, y: front.y + dy } };
}
export function aislePolygon(object: AisleObject): Position[] {
  const dx = object.end.x - object.start.x, dy = object.end.y - object.start.y, length = Math.hypot(dx, dy);
  if (length < EPS) return [];
  const nx = -dy * object.width / (2 * length), ny = dx * object.width / (2 * length);
  return [{ x: object.start.x + nx, y: object.start.y + ny }, { x: object.end.x + nx, y: object.end.y + ny }, { x: object.end.x - nx, y: object.end.y - ny }, { x: object.start.x - nx, y: object.start.y - ny }];
}
const cross = (a: Position, b: Position, c: Position) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
export function pointInPolygon(point: Position, polygon: Position[]): boolean {
  if (polygon.length < 3 || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i];
    if (Math.abs(cross(a, b, point)) < EPS && point.x >= Math.min(a.x, b.x) - EPS && point.x <= Math.max(a.x, b.x) + EPS && point.y >= Math.min(a.y, b.y) - EPS && point.y <= Math.max(a.y, b.y) + EPS) return true;
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
function properIntersection(a: Position, b: Position, c: Position, d: Position) {
  return cross(a, b, c) * cross(a, b, d) < -EPS && cross(c, d, a) * cross(c, d, b) < -EPS;
}
function polygonEdges(polygon: Position[]) { return polygon.map((point, index) => [point, polygon[(index + 1) % polygon.length]] as const); }
export function polygonInsideRoom(polygon: Position[], room: RoomGeometry): boolean {
  if (!room.closed || polygon.length < 3 || !polygon.every((point) => pointInPolygon(point, room.points))) return false;
  return !polygonEdges(polygon).some(([a, b]) => polygonEdges(room.points).some(([c, d]) => properIntersection(a, b, c, d)));
}
export function polygonsOverlap(a: Position[], b: Position[]): boolean {
  return a.some((point) => pointInPolygon(point, b)) || b.some((point) => pointInPolygon(point, a)) || polygonEdges(a).some(([p, q]) => polygonEdges(b).some(([r, s]) => properIntersection(p, q, r, s)));
}
export function validateObjects(plan: RoomPlan): Issue[] {
  const issues: Issue[] = [];
  for (const object of plan.objects) {
    const error = (message: string) => issues.push({ objectId: object.id, severity: "error", message });
    if (object.type === "door") {
      if (!wallEndpoints(plan.contour, object.wallId)) error("Tür: Zugehörige Wand fehlt.");
      else if (!doorFits(plan.contour, object)) error("Tür: Breite oder Position überschreitet die Wand.");
      if (object.role && object.role !== "normal" && (!Number.isFinite(object.clearWidth) || !object.clearWidth || object.clearWidth <= 0 || object.clearWidth > object.width + EPS)) error("Ausgang: Lichte Breite muss größer als 0 und höchstens so groß wie die Türbreite sein.");
    } else if (isBlockingObject(object)) {
      if (![object.x, object.y, object.width, object.depth, object.rotation].every(Number.isFinite) || object.width <= 0 || object.depth <= 0) error("Hindernis: Maße und Position müssen gültig sein; Breite und Tiefe größer als 0.");
      else if (!polygonInsideRoom(obstaclePolygon(object), plan.contour)) error("Hindernis liegt teilweise außerhalb des Raums oder schneidet eine Wand.");
    } else if (object.type === "front") {
      if (![object.x, object.y, object.width, object.rotation].every(Number.isFinite) || object.width <= 0) error("Front: Position, Breite und Rotation müssen gültig sein.");
      else if (!pointInPolygon({ x: object.x, y: object.y }, plan.contour.points)) error("Front liegt außerhalb des Raums.");
      if (plan.objects.filter((other) => other.type === "front").length > 1) error("Es darf nur eine Front geben.");
    } else {
      if (![object.start.x, object.start.y, object.end.x, object.end.y, object.width].every(Number.isFinite) || object.width <= 0 || wallLength(object.start, object.end) < EPS) error("Gang: Breite und Länge müssen größer als 0 sein.");
      else if (!polygonInsideRoom(aislePolygon(object), plan.contour)) error("Gang liegt teilweise außerhalb des Raums.");
      if (plan.objects.some((other) => isBlockingObject(other) && polygonsOverlap(aislePolygon(object), obstaclePolygon(other)))) issues.push({ objectId: object.id, severity: "warning", message: "Gang überlagert eine Sperrfläche." });
    }
  }
  return issues;
}

import type { MouseEvent } from "react";
import { planMeasurements } from "@/lib/room-planner/measurements";
import type { Position, RoomPlan } from "@/lib/room-planner/objects";
import type { SeatingPlan } from "@/lib/room-planner/seating";

type Props = { plan: RoomPlan; seating?: SeatingPlan | null; selectedId?: string; project: (point: Position) => Position; pixelsPerMeter: number; showRoom?: boolean; showObjects?: boolean; showDistances?: boolean; print?: boolean; onWallClick?: (wallId: string, at: Position) => void };
type Box = { left: number; top: number; right: number; bottom: number };
const overlaps = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

export default function MeasurementLayer({ plan, seating, selectedId, project, pixelsPerMeter, showRoom = true, showObjects = true, showDistances = false, print: printing = false, onWallClick }: Props) {
  const used: Box[] = [];
  const data = planMeasurements(plan, seating, selectedId).filter((item) => item.kind === "wall" ? showRoom : item.kind === "detail" ? showDistances && !printing : showObjects);
  const measurements = data.sort((a, b) => b.priority - a.priority || Number(!!b.selected) - Number(!!a.selected)).flatMap((item) => {
    const a = project(item.a), b = project(item.b);
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
    if (length < 1) return [];
    const normal = { x: -dy / length * item.side, y: dx / length * item.side };
    const tangent = { x: dx / length, y: dy / length };
    const font = printing ? 11 : 12;
    const textWidth = item.label.length * font * .56 + 12;
    const base = printing ? Math.max(15, item.offset * pixelsPerMeter) : Math.max(18, Math.min(48, item.offset * pixelsPerMeter));
    for (let attempt = 0; attempt < 5; attempt++) {
      const distance = base + attempt * 17;
      const center = { x: (a.x + b.x) / 2 + normal.x * distance, y: (a.y + b.y) / 2 + normal.y * distance };
      const box = { left: center.x - textWidth / 2 - 2, right: center.x + textWidth / 2 + 2, top: center.y - 9, bottom: center.y + 9 };
      if (used.some((other) => overlaps(box, other))) continue;
      used.push(box);
      return [{ item, a, b, center, normal, tangent, distance, textWidth, font }];
    }
    // Print must retain required object dimensions even in a dense plan.
    if (item.kind !== "wall" && !printing) return [];
    const distance = base + (printing ? 34 : 85);
    return [{ item, a, b, center: { x: (a.x + b.x) / 2 + normal.x * distance, y: (a.y + b.y) / 2 + normal.y * distance }, normal, tangent, distance, textWidth, font }];
  });
  return <g aria-label="Bemaßungen">{measurements.map(({ item, a, b, center, normal, tangent, distance, textWidth, font }) => {
    const start = { x: a.x + normal.x * distance, y: a.y + normal.y * distance };
    const end = { x: b.x + normal.x * distance, y: b.y + normal.y * distance };
    const color = item.selected ? "#a4572b" : item.kind === "wall" ? "#324b3a" : "#315f65";
    const activate = onWallClick && item.kind === "wall" ? (event: MouseEvent<SVGGElement>) => { event.stopPropagation(); onWallClick(item.id, center); } : undefined;
    const mark = (point: Position) => <line x1={point.x - tangent.x * 4 - normal.x * 4} y1={point.y - tangent.y * 4 - normal.y * 4} x2={point.x + tangent.x * 4 + normal.x * 4} y2={point.y + tangent.y * 4 + normal.y * 4} stroke={color} strokeWidth="1.2" />;
    return <g key={item.id} role={activate ? "button" : undefined} aria-label={`${item.kind === "wall" ? "Wandlänge" : "Maß"} ${item.label}${activate ? " bearbeiten" : ""}`} tabIndex={activate ? 0 : undefined} onPointerDown={activate ? (event) => event.stopPropagation() : undefined} onClick={activate} onKeyDown={activate ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onWallClick?.(item.id, center); } } : undefined} pointerEvents={activate ? "auto" : "none"} className={activate ? "cursor-pointer" : undefined}>
      <line x1={a.x} y1={a.y} x2={start.x + normal.x * 5} y2={start.y + normal.y * 5} stroke={color} strokeWidth=".8" opacity=".68" />
      <line x1={b.x} y1={b.y} x2={end.x + normal.x * 5} y2={end.y + normal.y * 5} stroke={color} strokeWidth=".8" opacity=".68" />
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth="1" />
      {mark(start)}{mark(end)}
      <rect x={center.x - textWidth / 2} y={center.y - 9} width={textWidth} height="18" rx="4" fill={printing ? "#fff" : "#fdfcf8"} stroke={color} strokeOpacity=".22" />
      <text x={center.x} y={center.y + font * .35} textAnchor="middle" fontSize={font} fontWeight="600" fill={color} pointerEvents="none">{item.label}</text>
    </g>;
  })}</g>;
}

import type { RoomPlan } from "./objects";

// The chair model's back is on local -Z, opposite the seating rotation used in 2D.
export const chairDisplayAngle = (planRotationDegrees: number) => -planRotationDegrees * Math.PI / 180 + Math.PI;

export function planBounds(plan: RoomPlan) {
  const points = plan.contour.points;
  if (!points.length) return { x: 0, z: 0, width: 12, depth: 12, span: 12 };
  const xs = points.map(point => point.x), zs = points.map(point => point.y);
  const width = Math.max(...xs) - Math.min(...xs), depth = Math.max(...zs) - Math.min(...zs);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2, width, depth, span: Math.max(4, width, depth) };
}

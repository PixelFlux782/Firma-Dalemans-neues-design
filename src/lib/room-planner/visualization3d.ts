// The proxy chair's back is on local -Z, opposite the seating rotation used in 2D.
export const chairDisplayAngle = (planRotationDegrees: number) => -planRotationDegrees * Math.PI / 180 + Math.PI;

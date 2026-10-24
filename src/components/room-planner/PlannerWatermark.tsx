type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  className?: string;
};

/** Shared, non-interactive branding layer for screen and print plan drawings. */
export default function PlannerWatermark({ x, y, width, height, className = "" }: Props) {
  return <image
    data-planner-watermark="true"
    aria-hidden="true"
    className={className}
    href="/images/branding/dalemans-logo.webp"
    x={x}
    y={y}
    width={width}
    height={height}
    opacity="0.08"
    preserveAspectRatio="xMidYMid meet"
    pointerEvents="none"
    style={{ pointerEvents: "none" }}
  />;
}

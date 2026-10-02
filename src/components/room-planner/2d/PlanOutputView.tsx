"use client";

import { aislePolygon, doorSegment, frontSegment, isBlockingObject, obstaclePolygon, type Position, type RoomPlan } from "@/lib/room-planner/objects";
import { formatMeters } from "@/lib/room-planner/geometry";
import { seatPolygon } from "@/lib/room-planner/seating";
import { calculatePlanDemand, calculateRecommendedDemand } from "@/lib/room-planner/chairSelection";
import type { analyzeCurrentPlan } from "@/lib/room-planner/currentPlanAnalysis";

type ReturnTypeAnalysis = ReturnType<typeof analyzeCurrentPlan>;
type Props = { plan: RoomPlan; name: string; issuedAt: Date; profileName: string; analysis: ReturnTypeAnalysis | null; reservePercent: number; inquiryHref: string; shopHref?: string; onClose: () => void };
const polygon = (points: Position[]) => points.map((p) => `${p.x},${p.y}`).join(" ");

export default function PlanOutputView({ plan, name, issuedAt, profileName, analysis, reservePercent, inquiryHref, shopHref, onClose }: Props) {
  const seating = plan.seating;
  const demand = calculatePlanDemand(plan);
  const recommended = calculateRecommendedDemand(plan, reservePercent);
  const points = [...plan.contour.points, ...plan.objects.flatMap((object) => object.type === "aisle" ? aislePolygon(object) : isBlockingObject(object) ? obstaclePolygon(object) : object.type === "front" ? Object.values(frontSegment(object)) : object.type === "door" ? Object.values(doorSegment(plan.contour, object) ?? {}) : []), ...(seating?.seats ?? [])];
  const minX = points.length ? Math.min(...points.map((p) => p.x)) : 0, maxX = points.length ? Math.max(...points.map((p) => p.x)) : 1;
  const minY = points.length ? Math.min(...points.map((p) => p.y)) : 0, maxY = points.length ? Math.max(...points.map((p) => p.y)) : 1;
  const width = maxX - minX, height = maxY - minY, margin = Math.max(width, height) * .08 + .5;
  const roomWidth = plan.contour.points.length ? Math.max(...plan.contour.points.map((p) => p.x)) - Math.min(...plan.contour.points.map((p) => p.x)) : 0;
  const roomHeight = plan.contour.points.length ? Math.max(...plan.contour.points.map((p) => p.y)) - Math.min(...plan.contour.points.map((p) => p.y)) : 0;
  const exitCount = plan.objects.filter((o) => o.type === "door" && (o.role === "exit" || o.role === "emergency_exit")).length;
  const routes = Array.isArray(analysis?.egress?.routes) ? analysis.egress.routes : [];
  const unreachable = typeof analysis?.egress?.seatsWithoutRoute === "number" ? analysis.egress.seatsWithoutRoute : undefined;
  const checks = Array.isArray(analysis?.report?.checks) ? analysis.report.checks : [];
  const important = checks.filter((check) => check.status === "fail" || check.status === "warning");
  const legend = [["Sitz", "#405b49"], ["Gang", "#5596a0"], ["Tür", "#347b7a"], ["Ausgang", "#13714a"], ["Hindernis", "#bb7558"], ["Bühne", "#aa7854"], ["Sperrfläche", "#957bb4"], ["Front", "#235e89"], ...(routes?.some((r) => r.valid && r.path?.length > 1) ? [["Rettungsweg", "#d97706"]] : [])];
  return <section className="plan-output" aria-label="Plan-Ausgabe">
    <div className="plan-output-actions"><button type="button" onClick={onClose}>Zurück zum Editor</button><button type="button" onClick={() => window.print()}>Drucken / als PDF speichern</button><a href={inquiryHref}>Angebot für diese Bestuhlung anfordern</a>{shopHref && <a href={shopHref}>Stuhl konfigurieren</a>}</div>
    <header><p>Raumplan · Planungsansicht</p><h1>{name}</h1><p>Ausgabe: {issuedAt.toLocaleString("de-DE")}</p></header>
    <div className="plan-output-sheet"><div className="plan-output-drawing">
      <svg role="img" aria-label="Grundriss mit Sitzen, Gängen, Objekten und Ausgängen" viewBox={`${minX - margin} ${minY - margin} ${width + 2 * margin} ${height + 2 * margin}`} preserveAspectRatio="xMidYMid meet">
        {plan.contour.closed && <polygon points={polygon(plan.contour.points)} fill="#edf2e9" stroke="#314c3a" strokeWidth=".05" />}
        {plan.objects.filter((o) => o.type === "aisle").map((o) => o.type === "aisle" && <polygon key={o.id} points={polygon(aislePolygon(o))} fill="#a9d2d8" stroke="#357682" strokeWidth=".025" />)}
        {plan.objects.filter(isBlockingObject).map((o) => <g key={o.id}><polygon points={polygon(obstaclePolygon(o))} fill={o.type === "stage" || o.type === "obstacle" && o.obstacleType === "stage" ? "#aa7854" : o.type === "reservedArea" || o.type === "obstacle" && o.obstacleType === "restricted" ? "#957bb4" : "#bb7558"} stroke="#694d43" strokeWidth=".025" /><text x={o.x} y={o.y} textAnchor="middle" dominantBaseline="middle" fontSize=".24" fill="white">{o.type === "stage" || o.type === "obstacle" && o.obstacleType === "stage" ? "Bühne" : o.type === "reservedArea" || o.type === "obstacle" && o.obstacleType === "restricted" ? "Sperrfläche" : "Hindernis"}</text></g>)}
        {seating?.seats.map((seat) => <polygon key={seat.id} data-seat-id={seat.id} points={polygon(seatPolygon(seat.x, seat.y, seating.rules, seating.orientation, seat.rotation))} fill="#405b49" stroke="white" strokeWidth=".012" />)}
        {seating?.blocks.map((block, i) => block.seats.length > 0 && <text key={block.id} x={block.seats.reduce((n, s) => n + s.x, 0) / block.seats.length} y={block.seats.reduce((n, s) => n + s.y, 0) / block.seats.length} textAnchor="middle" fontSize=".25" fontWeight="bold" fill="#172d20" stroke="white" strokeWidth=".06" paintOrder="stroke">{block.id || `Block ${i + 1}`}</text>)}
        {routes?.filter((r) => r.valid && r.path?.length > 1).map((r) => <polyline key={r.originId} points={polygon(r.path)} fill="none" stroke="#d97706" strokeWidth=".035" strokeOpacity=".35" />)}
        {plan.objects.filter((o) => o.type === "front").map((o) => { if (o.type !== "front") return null; const s = frontSegment(o); return <g key={o.id}><line x1={s.start.x} y1={s.start.y} x2={s.end.x} y2={s.end.y} stroke="#235e89" strokeWidth=".12" /><text x={o.x} y={o.y - .2} textAnchor="middle" fontSize=".25" fill="#235e89">Front</text></g>; })}
        {plan.objects.filter((o) => o.type === "door").map((o) => { if (o.type !== "door") return null; const s = doorSegment(plan.contour, o); if (!s) return null; const exit = o.role === "exit" || o.role === "emergency_exit"; const x = (s.start.x + s.end.x) / 2, y = (s.start.y + s.end.y) / 2; return <g key={o.id}><line x1={s.start.x} y1={s.start.y} x2={s.end.x} y2={s.end.y} stroke="#fff" strokeWidth=".14" /><line x1={s.start.x} y1={s.start.y} x2={s.end.x} y2={s.end.y} stroke={exit ? "#13714a" : "#347b7a"} strokeWidth=".08" /><text x={x} y={y - .18} textAnchor="middle" fontSize=".25" fill={exit ? "#13714a" : "#347b7a"}>{exit ? "Ausgang" : "Tür"}</text></g>; })}
      </svg>
      <p>Raumausdehnung: {formatMeters(roomWidth)} × {formatMeters(roomHeight)} · Maßangaben in Metern · Zeichnung proportional eingepasst, kein fester Druckmaßstab</p>
    </div><div className="plan-output-details"><h2>Ihre Bestuhlung</h2><p>{recommended.quantity} geplante Sitzplätze · Projekt: {name}</p><dl>{[["Stuhlmodell", demand.product?.title ?? "Unbekannt"], ["Variante", demand.variant?.title ?? "Unbekannt"], ["Stuhlmaße", `${formatMeters(demand.selection.width)} × ${formatMeters(demand.selection.depth)} (Planungsannahme)`], ["Grundbedarf", recommended.quantity], [`Reserve (${reservePercent} %)`, recommended.reserveQuantity], ["Empfohlene Gesamtmenge", recommended.recommendedQuantity]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}{[["Sitzplätze", seating?.seats.length ?? 0], ["Sitzblöcke", seating?.blocks.length ?? 0], ["Gänge", plan.objects.filter((o) => o.type === "aisle").length], ["Markierte Ausgänge", exitCount], ["Erreichbare Sitzplätze", unreachable === undefined ? "nicht berechnet" : Math.max(0, (seating?.seats.length ?? 0) - unreachable)], ["Nicht erreichbare Sitzplätze", unreachable ?? "nicht berechnet"], ["Längster Rettungsweg", analysis?.egress?.longestRouteSeatId ? formatMeters(analysis.egress.longestValidRoute) : "nicht bestimmbar"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>Reserve ist eine Bedarfsempfehlung und verändert keine Sitzplätze.</p>
      <h2>Regelstatus</h2><p>Planungs-/Referenzprüfung anhand des Regelprofils „{profileName}“.</p><p>{analysis?.report ? `${checks.filter((c) => c.status === "fail").length} Fehler · ${checks.filter((c) => c.status === "warning").length} Warnungen · ${checks.filter((c) => c.status === "not_applicable").length} Hinweise` : "Keine aktuelle Regelanalyse verfügbar."}</p><ul>{important.map((check) => <li key={check.id}>{check.message}</li>)}</ul>
      <h2>Legende</h2><div className="plan-output-legend">{legend.map(([label, color]) => <span key={label}><i style={{ background: color }} />{label}</span>)}</div></div></div>
  </section>;
}

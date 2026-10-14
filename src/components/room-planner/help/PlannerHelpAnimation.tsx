import type { PlannerHelpAnimation as AnimationName } from "./plannerHelpContent";

const Pointer = ({ className = "" }: { className?: string }) => <g className={`planner-help-pointer ${className}`}><circle cx="0" cy="0" r="6" fill="#fff" stroke="#405b49" strokeWidth="2" /><path d="M4 5l8 9" stroke="#405b49" strokeWidth="3" strokeLinecap="round" /></g>;

export default function PlannerHelpAnimation({ variant, active = true }: { variant: AnimationName; active?: boolean }) {
  return <svg data-animation={variant} data-active={active ? "true" : "false"} className={`planner-help-animation ${active ? "is-active" : ""}`} viewBox="0 0 240 112" role="img" aria-label={labels[variant]}>
    <rect x="1" y="1" width="238" height="110" rx="12" fill="#f7f6f1" stroke="#d8d0be" />
    {variant === "room" && <g className="anim-room"><path d="M45 80L58 30 174 25 198 78Z" fill="#91a99a" fillOpacity=".18" stroke="#405b49" strokeWidth="3" strokeDasharray="310" /><g fill="#bd7647" stroke="#fff" strokeWidth="2"><circle cx="45" cy="80" r="5"/><circle cx="58" cy="30" r="5"/><circle cx="174" cy="25" r="5"/><circle cx="198" cy="78" r="5"/></g><Pointer /></g>}
    {variant === "door-aisle" && <g className="anim-door"><path d="M35 25H205V88H35Z" fill="none" stroke="#405b49" strokeWidth="5"/><path d="M92 25v30M92 25l28 16" stroke="#347b7a" strokeWidth="4"/><path d="M70 70H174" stroke="#5596a0" strokeWidth="13" opacity=".35"/><path d="M70 70H174" stroke="#357682" strokeWidth="2" strokeDasharray="6 5"/><Pointer /></g>}
    {variant === "table-zone" && <g className="anim-zone"><polygon points="48,77 65,29 176,24 199,73 135,91" fill="#d7b56d" fillOpacity=".25" stroke="#8a6a2f" strokeWidth="3" strokeDasharray="260"/><g fill="#bd7647"><circle cx="48" cy="77" r="5"/><circle cx="65" cy="29" r="5"/><circle cx="176" cy="24" r="5"/><circle cx="199" cy="73" r="5"/><circle cx="135" cy="91" r="5"/></g><Pointer /></g>}
    {variant === "zone-setup" && <g className="anim-setup"><polygon points="35,20 205,20 195,94 45,94" fill="#d7b56d" fillOpacity=".2" stroke="#8a6a2f" strokeWidth="2" strokeDasharray="7 5"/><rect x="75" y="8" width="90" height="20" rx="10" fill="#405b49"/><text x="120" y="22" textAnchor="middle" fontSize="9" fill="white">Bereich einrichten</text>{[55,105,155].map(x=><g key={x} className="help-furniture"><rect x={x} y="48" width="30" height="18" rx="2" fill="#d9c49a" stroke="#725b36"/><circle cx={x+7} cy="40" r="4" fill="#557a69"/><circle cx={x+23} cy="40" r="4" fill="#557a69"/><circle cx={x+7} cy="75" r="4" fill="#557a69"/><circle cx={x+23} cy="75" r="4" fill="#557a69"/></g>)}</g>}
    {variant === "free-seating" && <g className="anim-seating"><path d="M25 18H215V95H25Z" fill="#91a99a" fillOpacity=".12" stroke="#405b49" strokeWidth="3"/><rect x="86" y="35" width="68" height="42" rx="4" fill="#d7b56d" fillOpacity=".35" stroke="#8a6a2f" strokeDasharray="5 4"/>{[38,55,76,164,185,202].map((x,i)=><g key={x} className="help-seat-row" style={{animationDelay:`${i*.12}s`}}>{[36,54,72].map(y=><circle key={y} cx={x} cy={y} r="5" fill="#405b49"/>)}</g>)}</g>}
    {variant === "table-snap" && <g className="anim-snap"><rect x="44" y="38" width="58" height="36" rx="3" fill="#d9c49a" stroke="#725b36" strokeWidth="2"/><rect className="help-moving-table" x="151" y="38" width="58" height="36" rx="3" fill="#d9c49a" stroke="#725b36" strokeWidth="2"/><path className="help-snap-edge" d="M103 37V75" stroke="#2f7d5b" strokeWidth="6" strokeLinecap="round"/><Pointer className="help-snap-pointer"/></g>}
    {variant === "edit" && <g className="anim-edit"><rect className="help-edit-object" x="82" y="37" width="72" height="38" rx="4" fill="#d9c49a" stroke="#bd7647" strokeWidth="3"/><circle cx="82" cy="37" r="5" fill="white" stroke="#bd7647"/><circle cx="154" cy="75" r="5" fill="white" stroke="#bd7647"/><path d="M118 28v-12" stroke="#bd7647" strokeWidth="2"/><circle className="help-rotate" cx="118" cy="13" r="6" fill="white" stroke="#bd7647" strokeWidth="2"/><path d="M31 92h44" stroke="#405b49" strokeWidth="2"/><path d="M36 86l-7 6 7 6" fill="none" stroke="#405b49" strokeWidth="2"/><text x="80" y="96" fontSize="9" fill="#405b49">Rückgängig</text><Pointer /></g>}
  </svg>;
}

const labels: Record<AnimationName, string> = {
  room: "Eckpunkte setzen und Raumkontur schließen",
  "door-aisle": "Tür an einer Wand platzieren und Gang zwischen zwei Punkten zeichnen",
  "table-zone": "Polygonalen Tischbereich zeichnen und schließen",
  "zone-setup": "Tischbereich auswählen und automatisch mit Tischen und Stühlen einrichten",
  "free-seating": "Freie Raumfläche außerhalb eines Tischbereichs bestuhlen",
  "table-snap": "Zweiten Tisch an eine kompatible Tischkante ziehen und einrasten",
  edit: "Objekt auswählen, verschieben, drehen und Änderung rückgängig machen",
};

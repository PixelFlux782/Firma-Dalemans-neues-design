export type PlannerHelpAnimation = "room" | "door-aisle" | "table-zone" | "zone-setup" | "free-seating" | "table-snap" | "edit";

export type PlannerHelpId = "start-room" | "draw-room" | "door-aisle" | "table-zone" | "zone-setup" | "free-seating" | "table-snap" | "edit-object";

export type PlannerHelpEntry = {
  id: PlannerHelpId;
  title: string;
  description: string;
  tool?: string;
  animation: PlannerHelpAnimation;
  note?: string;
};

export const PLANNER_HELP_CONTENT: Record<PlannerHelpId, PlannerHelpEntry> = {
  "start-room": { id: "start-room", title: "Raum zeichnen", description: "Beginne damit, deinen Raum zu zeichnen. Setze die Eckpunkte und klicke zum Schließen wieder auf den ersten Punkt.", tool: "wall", animation: "room" },
  "draw-room": { id: "draw-room", title: "Raumkontur zeichnen", description: "Klicke nacheinander auf die Eckpunkte. Schließe die Kontur mit einem Klick auf den ersten Punkt.", tool: "wall", animation: "room" },
  "door-aisle": { id: "door-aisle", title: "Tür oder Gang anlegen", description: "Türen platzierst du mit einem Klick auf eine Wand. Einen Gang zeichnest du mit Start- und Endpunkt.", tool: "door", animation: "door-aisle" },
  "table-zone": { id: "table-zone", title: "Tischbereich zeichnen", description: "Setze mindestens drei Eckpunkte und schließe den Bereich über „Tischbereich abschließen“.", tool: "table", animation: "table-zone" },
  "zone-setup": { id: "zone-setup", title: "Tischbereich einrichten", description: "Mit „Bereich einrichten“ füllst du diesen Bereich automatisch mit Tischen und passenden Stühlen.", tool: "table", animation: "zone-setup" },
  "free-seating": { id: "free-seating", title: "Freie Fläche bestuhlen", description: "„Freie Raumfläche bestuhlen“ ergänzt Stuhlreihen außerhalb vorhandener Tischbereiche.", tool: "chair", animation: "free-seating" },
  "table-snap": { id: "table-snap", title: "Tische magnetisch verbinden", description: "Ziehe einen Tisch an eine passende Kante. Die markierte Kante rastet automatisch ein.", tool: "table", animation: "table-snap", note: "Halte Alt gedrückt, um das Einrasten auszuschalten." },
  "edit-object": { id: "edit-object", title: "Objekte bearbeiten", description: "Ziehe die Auswahl zum Verschieben. Größe, Drehung und weitere Aktionen erscheinen direkt am Objekt.", tool: "select", animation: "edit" },
};

export const PLANNER_ONBOARDING = [
  { title: "Raum zeichnen", description: "Zeichne zuerst deinen Raum. Klicke dazu nacheinander auf die Eckpunkte.", helpId: "draw-room" as const, tool: "wall" },
  { title: "Raum vorbereiten", description: "Markiere Türen, Gänge und Flächen, die frei bleiben sollen.", helpId: "door-aisle" as const, tool: "door" },
  { title: "Bestuhlung planen", description: "Lass freie Flächen automatisch bestuhlen oder zeichne einen Tischbereich.", helpId: "table-zone" as const, tool: "table" },
  { title: "Anpassen und ausgeben", description: "Du kannst jedes Element verschieben und deinen Plan anschließend in 3D ansehen oder ausgeben.", helpId: "edit-object" as const, tool: "select" },
];

export const PLANNER_HELP_STORAGE_KEY = "dlmns-room-planner-help-v1";

export type PlannerHelpPreferences = { onboardingSeen?: boolean; onboardingSkipped?: boolean; dismissed?: PlannerHelpId[] };

export function readHelpPreferences(): PlannerHelpPreferences {
  try {
    const value = localStorage.getItem(PLANNER_HELP_STORAGE_KEY);
    return value ? JSON.parse(value) as PlannerHelpPreferences : {};
  } catch { return {}; }
}

export function writeHelpPreferences(preferences: PlannerHelpPreferences) {
  try { localStorage.setItem(PLANNER_HELP_STORAGE_KEY, JSON.stringify(preferences)); } catch { /* Hilfe darf den Editor nie blockieren. */ }
}

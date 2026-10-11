export type FabricGroup = 2 | 3 | 4;

export interface FabricColor {
  code: string;
  name: string;
}

export interface FabricCollection {
  id: string;
  group: FabricGroup;
  name: string;
  materialType: string;
  composition?: string;
  martindale?: string;
  properties: string[];
  care?: string;
  fireSafety?: string[];
  colors: FabricColor[];
  colorCardUrl: string;
  colorCardPublicationStatus: "approved" | "rights-review";
  informationAsOf: string;
}

const currentAsOf = "Oktober 2026";

export const FABRIC_COLLECTIONS: readonly FabricCollection[] = [
  {
    id: "bondai",
    group: 2,
    name: "Bondai",
    materialType: "Crêpe-Webstoff",
    composition: "100 % Polyester",
    martindale: "150.000 Scheuertouren",
    properties: ["Für Büro- und Objekteinsatz", "OEKO-TEX®"],
    care: "Pflege gemäß aktuellem Datenblatt; Reinigungsmittel zuerst an unauffälliger Stelle prüfen.",
    fireSafety: ["EN 1021-1 & 2", "Weitere Prüfungen abhängig vom Polsteraufbau"],
    colors: [
      { code: "28033", name: "Schwarz" },
      { code: "28010", name: "Grau" },
      { code: "24011", name: "Rot" },
      { code: "24017", name: "Weinrot" },
      { code: "26071", name: "Royal" },
    ],
    colorCardUrl: "/materials/fabrics/bondai.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "radio",
    group: 3,
    name: "Radio",
    materialType: "Objekt-Webstoff",
    composition: "100 % Polyester FR",
    martindale: "80.000 Scheuertouren",
    properties: ["Einfarbig oder leicht kontrastiert", "OEKO-TEX®"],
    fireSafety: ["DIN 4102 B1", "EN 1021-1 & 2", "Klassifizierung teils abhängig vom Polsteraufbau"],
    colors: [],
    colorCardUrl: "/materials/fabrics/radio.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "pisa",
    group: 3,
    name: "Pisa",
    materialType: "Polsterkunstleder",
    composition: "PVC-Beschichtung auf Polyester-/Viskose-Jersey",
    martindale: "> 300.000 Touren",
    properties: ["Desinfektionsmittelbeständig gemäß Prüfliste", "Schmutzunempfindlich", "Phthalatfrei"],
    fireSafety: ["DIN EN 1021-1 & 2", "UNI 9175 Klasse 1.IM"],
    colors: [
      { code: "3046", name: "Schwarz" }, { code: "3157", name: "Anthrazit" },
      { code: "3129", name: "Perlgrau" }, { code: "3113", name: "Schoko" },
      { code: "3139", name: "Kirschrot" }, { code: "3166", name: "Mango" },
      { code: "3169", name: "Kornblume" }, { code: "3171", name: "Mittelblau" },
      { code: "3338", name: "Agave" }, { code: "3343", name: "Orchidee" },
    ],
    colorCardUrl: "/materials/fabrics/pisa.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "xtreme",
    group: 3,
    name: "Xtreme",
    materialType: "Recycelter Objekt-Webstoff",
    composition: "100 % recyceltes Polyester (Post-Consumer)",
    martindale: "mind. 100.000 Scheuertouren",
    properties: ["Dehnbar", "Chlorbleichebeständig gemäß Herstellerangabe", "EU Ecolabel"],
    care: "Regelmäßig absaugen; feucht abwischen oder geeignetes Polstershampoo verwenden. Waschbar bis 60 °C gemäß Herstellerangabe.",
    fireSafety: ["DIN 4102 B1", "EN 1021-1 & 2", "Prüfungen gelten für den Stoff bzw. angegebenen Aufbau"],
    colors: [
      { code: "3009", name: "Havana" }, { code: "3145", name: "Padang" },
      { code: "3045", name: "Taboo" }, { code: "3077", name: "Appledore" },
      { code: "3100", name: "Ocean" },
    ],
    colorCardUrl: "/materials/fabrics/xtreme.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "x2",
    group: 3,
    name: "X2",
    materialType: "Recycelter Objekt-Webstoff",
    composition: "75 % Post-Consumer- und 25 % textilrecyceltes Polyester",
    martindale: "mind. 100.000 Scheuertouren",
    properties: ["100 % Recyclingfasern", "Chlorbleichebeständig gemäß Herstellerangabe", "EU Ecolabel"],
    care: "Regelmäßig absaugen; feucht abwischen oder geeignetes Polstershampoo verwenden. Waschbar bis 60 °C gemäß Herstellerangabe.",
    fireSafety: ["DIN 4102 B1", "EN 1021-1 & 2", "Prüfungen gelten für den Stoff bzw. angegebenen Aufbau"],
    colors: [],
    colorCardUrl: "/materials/fabrics/x2.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "king-flex",
    group: 3,
    name: "King Flex",
    materialType: "Trevira-CS-Webstoff",
    composition: "100 % Polyester Trevira CS",
    martindale: "100.000 Scheuertouren",
    properties: ["Für Büro- und Objekteinsatz", "OEKO-TEX®", "EU Ecolabel"],
    fireSafety: ["DIN 4102 B1", "EN 1021-1 & 2", "Klassifizierung teils abhängig vom Polsteraufbau"],
    colors: [
      { code: "38033", name: "Schwarz" }, { code: "38010", name: "Anthrazit" },
      { code: "39289", name: "Schwarz/Grau meliert" }, { code: "38044", name: "Hellgrau" },
      { code: "34008", name: "Rot" }, { code: "34009", name: "Weinrot" },
      { code: "36026", name: "Hellblau" }, { code: "36071", name: "Blau" },
    ],
    colorCardUrl: "/materials/fabrics/king-flex.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "king-l",
    group: 3,
    name: "King L",
    materialType: "Trevira-CS-Webstoff",
    composition: "100 % Polyester Trevira CS",
    martindale: "70.000 Scheuertouren",
    properties: ["Klare, regelmäßige Struktur", "OEKO-TEX®", "EU Ecolabel"],
    fireSafety: ["DIN 4102 B1", "EN 1021-1 & 2", "Klassifizierung teils abhängig vom Polsteraufbau"],
    colors: [
      { code: "38034", name: "Schwarz" }, { code: "38510", name: "Anthrazit melange" },
      { code: "39706", name: "Grün melange" }, { code: "39704", name: "Hellgrün melange" },
      { code: "36580", name: "Blau/Schwarz" }, { code: "36072", name: "Blau" },
      { code: "34027", name: "Rot" }, { code: "35004", name: "Lila" },
    ],
    colorCardUrl: "/materials/fabrics/king-l.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "era",
    group: 3,
    name: "Era",
    materialType: "Zweifarbiger Objekt-Webstoff",
    composition: "100 % Polyester",
    martindale: "mind. 100.000 Scheuertouren",
    properties: ["In beide Richtungen dehnbar", "Akustisch durchlässig", "Chlorbleichebeständig gemäß Herstellerangabe"],
    care: "Regelmäßig absaugen; feucht abwischen oder geeignetes Polstershampoo verwenden. Waschbar bis 60 °C gemäß Herstellerangabe.",
    fireSafety: ["EN 1021-1 & 2", "DIN 4102 B1 nur mit ausdrücklich bestellter FR-Ausrüstung"],
    colors: [
      { code: "CSE14", name: "Schwarz" }, { code: "CSE13", name: "Present / Grau" },
      { code: "CSE10", name: "Everlasting" }, { code: "CSE18", name: "Event / Grün" },
      { code: "CSE17", name: "Phase / Pink" },
    ],
    colorCardUrl: "/materials/fabrics/era.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "advantage",
    group: 3,
    name: "Advantage",
    materialType: "Objekt-Webstoff",
    composition: "60 % Polypropylen, 30 % Schurwolle, 10 % Viskose",
    martindale: "mind. 60.000 Scheuertouren",
    properties: ["Einfarbig und meliert", "Für schweren Objekteinsatz"],
    care: "Regelmäßig absaugen; feucht abwischen oder geeignetes Polstershampoo verwenden.",
    fireSafety: ["EN 1021-1 & 2", "BS 7176 Low Hazard"],
    colors: [],
    colorCardUrl: "/materials/fabrics/advantage.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "pulfero",
    group: 3,
    name: "Pulfero",
    materialType: "Ableitfähiges Polsterkunstleder",
    composition: "Beschichtetes textiles Trägermaterial",
    martindale: "> 50.000 Touren",
    properties: ["Elektrostatisch ableitfähig nach DIN EN 1149-1", "Desinfektionsmittelbeständig gemäß Prüfliste", "Phthalatfrei"],
    fireSafety: ["DIN EN 1021-1 & 2"],
    colors: [{ code: "3672", name: "Schwarz" }],
    colorCardUrl: "/materials/fabrics/pulfero.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "pure",
    group: 4,
    name: "Pure",
    materialType: "Recycelter Polster-Webstoff",
    composition: "100 % recyceltes Polyamid",
    martindale: "500.000 Scheuertouren",
    properties: ["Atmungsaktiv", "Recyclingfähig", "OEKO-TEX®"],
    fireSafety: ["DIN EN 1021-1 & 2"],
    colors: [],
    colorCardUrl: "/materials/fabrics/pure.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
  {
    id: "mini",
    group: 4,
    name: "Mini",
    materialType: "Trevira-CS-Webstoff",
    composition: "100 % Polyester Trevira CS",
    martindale: "100.000 Scheuertouren",
    properties: ["Einfarbig und meliert", "OEKO-TEX®", "EU Ecolabel"],
    fireSafety: ["DIN 4102 B1", "EN 1021-1 & 2", "Klassifizierung teils abhängig vom Polsteraufbau"],
    colors: [
      { code: "48033", name: "Schwarz" }, { code: "48011", name: "Grau" },
      { code: "48504", name: "Grau melange" }, { code: "46004", name: "Blau" },
      { code: "47522", name: "Grün" },
    ],
    colorCardUrl: "/materials/fabrics/mini.pdf",
    colorCardPublicationStatus: "rights-review",
    informationAsOf: currentAsOf,
  },
] as const;

export function fabricsForGroup(group: FabricGroup) {
  return FABRIC_COLLECTIONS.filter((collection) => collection.group === group);
}

export function fabricById(id: string | null | undefined) {
  return FABRIC_COLLECTIONS.find((collection) => collection.id === id) ?? null;
}

export const FABRIC_GROUP_SUMMARIES: Record<FabricGroup, string> = {
  2: "Klassischer Objektstoff Bondai",
  3: "Breite Auswahl aus Webstoffen und Kunstleder",
  4: "Pure und Mini für besondere Materialprofile",
};

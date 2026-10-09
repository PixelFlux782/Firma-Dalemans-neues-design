/**
 * Editorial single source of truth for the public advisory content.
 * Internal source documents and provenance stay in /context and are never served.
 */
export type TableDimension = Readonly<{
  length: number;
  width: number;
  ratioTwoToOne: boolean;
}>;

export const factualCompanyStatements = {
  allCurrentChairFamiliesSuitableForRegularMoves: true,
  replaceableParts: ["Stuhlgleiter", "Buchablagen"],
  tableStorage: "flach liegend, trocken und bei normalen Innenraumtemperaturen",
  avoidPermanentUv: true,
} as const;

export const modelSpecific = {
  heavyUseChairExamples: [
    { label: "Coburg", href: "/produkte/stapelstuehle/coburg" },
    { label: "Nürnberg", href: "/produkte/stapelstuehle/nuernberg" },
  ],
  table210: {
    label: "Seminar-Klapptisch 210c",
    href: "/produkte/artikel/seminarklapptisch-210c",
    topThicknessMm: 25,
    hasEdgeDoubling: false,
    largestAdvertisedFormatCm: { length: 140, width: 70 },
  },
} as const;

export const recommendations = {
  longSitting: "Sitz- und Rückenpolster häufig sinnvoll; Sitzempfinden mit einem Musterstuhl prüfen",
  rowSeating: "passende Reihenverbindung möglichst bei der Modellauswahl mitplanen",
  tableLegs: {
    rows: "K1",
    frequentEndSeating: "K3",
  },
  tableCleaning: "feucht, nicht nass reinigen",
  fabricCleaning: "geeigneten Textil- oder Teppich-Trockenschaum nur nach Pflegehinweis verwenden",
} as const;

export const estimatedValues = {
  chairWidthCm: { withoutRowConnector: 51, withRowConnector: 53 },
  chairStackCount: 15,
  tableStackCount: { storage: 15, suitableCart: 10 },
  tableWeightKg: { min: 23, max: 32 },
  tableHeightMm: 738,
  typicalTopThicknessMm: 19,
  foldedTableHeightCm: { lengthBelow160: 10, lengthFrom160: 8 },
} as const;

export const standardTableDimensions = [
  { length: 120, width: 70, ratioTwoToOne: false },
  { length: 120, width: 80, ratioTwoToOne: false },
  { length: 140, width: 70, ratioTwoToOne: true },
  { length: 140, width: 80, ratioTwoToOne: false },
  { length: 150, width: 70, ratioTwoToOne: false },
  { length: 150, width: 75, ratioTwoToOne: true },
  { length: 160, width: 70, ratioTwoToOne: false },
  { length: 160, width: 80, ratioTwoToOne: true },
  { length: 170, width: 70, ratioTwoToOne: false },
  { length: 170, width: 80, ratioTwoToOne: false },
  { length: 180, width: 70, ratioTwoToOne: false },
  { length: 180, width: 80, ratioTwoToOne: false },
] as const satisfies readonly TableDimension[];

export const verificationNeeded = {
  gsCertificatesByChairModel: true,
  b1CertificateByFabricAndUpholsteryAssembly: true,
  chairWidthsByModel: true,
  cartLoadsAndStackSafetyByModel: true,
  table210VariantMatrix: true,
  staticTableLoad: true,
  aftermarketRowConnectorCompatibility: true,
} as const;

export const regulatory = {
  rowConnectorRequirement:
    "Ob Reihenverbinder vorgeschrieben sind, hängt von Nutzung, Ort und genehmigtem Bestuhlungsplan ab.",
  planningScope:
    "Der Raumplaner dient der Orientierung und ersetzt keine genehmigte Fach- oder Fluchtwegplanung.",
} as const;

export const dimensionLabel = (dimension: TableDimension) =>
  `${dimension.length} × ${dimension.width} cm`;

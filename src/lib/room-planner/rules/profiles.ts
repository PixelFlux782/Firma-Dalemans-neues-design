export type RuleProfile = {
  id: string;
  name: string;
  jurisdiction?: string;
  source?: { title: string; section?: string; version?: string; url?: string };
  applicability: { description: string; requiresManualConfirmation: boolean };
  seating: {
    minimumSeatWidth?: number;
    minimumClearRowPassage?: number;
    maximumRowsPerBlock?: number;
    maximumSeatsOneSideOfAisle?: number;
    maximumSeatsBetweenAisles?: number;
  };
  aisles: { minimumWidth?: number };
  egress: { maximumTravelDistance?: number; minimumExitWidth?: number; personsPerWidthUnit?: number; widthUnit?: number };
};

export const BAVSTAETTV_REFERENCE: RuleProfile = {
  id: "bavstaettv-reference",
  name: "Bayern VStättV – Referenz",
  jurisdiction: "Bayern",
  source: {
    title: "Bayerische Versammlungsstättenverordnung (VStättV)",
    section: "§§ 1, 7 und 10",
    version: "Fassung 02.11.2007; Text gilt ab 01.09.2018. Aktuelle Fassung und Anwendbarkeit fachlich prüfen.",
    url: "https://www.gesetze-bayern.de/Content/Document/BayVStaettV",
  },
  applicability: {
    description: "Technisches Referenzprofil. Die Anwendbarkeit hängt von Gebäude und Nutzung ab; Räume für Gottesdienste sind vom Anwendungsbereich ausgenommen.",
    requiresManualConfirmation: true,
  },
  seating: {
    minimumSeatWidth: 0.5,
    minimumClearRowPassage: 0.4,
    maximumRowsPerBlock: 30,
    maximumSeatsOneSideOfAisle: 10,
    maximumSeatsBetweenAisles: 20,
  },
  aisles: { minimumWidth: 1.2 },
  egress: { maximumTravelDistance: 30, minimumExitWidth: 1.2, widthUnit: 1.2, personsPerWidthUnit: 200 },
};

export const RULE_PROFILES: readonly RuleProfile[] = [BAVSTAETTV_REFERENCE];

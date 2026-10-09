import type { KnowledgeCategory, KnowledgeEntry } from "@/lib/knowledge/types";

export const knowledgeCategories = [
  {
    id: "stoffe-polster",
    slug: "stoffe-polster",
    title: "Stoffe & Polster",
    shortTitle: "Stoffe & Polster",
    description:
      "Zentrale Informationen zu Stoffgruppen, Materialien, Eigenschaften und Pflege.",
    topics: ["Stoffgruppen", "Materialien", "Eigenschaften", "Pflege", "Vergleich"],
  },
  {
    id: "tischplatten-oberflaechen",
    slug: "tischplatten-oberflaechen",
    title: "Tischplatten & Oberflächen",
    shortTitle: "Platten & Oberflächen",
    description:
      "Orientierung zu Tischplatten, Oberflächen, Pflege und passenden Einsatzmöglichkeiten.",
    topics: ["Tischplatten", "Oberflächen", "Eigenschaften", "Pflege", "Einsatz"],
  },
  {
    id: "tischkanten",
    slug: "tischkanten",
    title: "Tischkanten",
    shortTitle: "Tischkanten",
    description:
      "Ein vorbereiteter Wissensbereich für bestätigte Kantenvarianten, Verarbeitung und Details.",
    topics: ["Varianten", "Materialien", "Verarbeitung", "Details", "Verwendung"],
  },
  {
    id: "tische-konstruktion",
    slug: "tische-konstruktion",
    title: "Tische & Konstruktion",
    shortTitle: "Tische & Konstruktion",
    description:
      "Hintergrundwissen zu Mechanismen, Gestellen, Konstruktion, Transport und Lagerung.",
    topics: ["Klappmechanismen", "Gestelle", "Konstruktion", "Transport", "Sonderformen"],
  },
] as const satisfies readonly KnowledgeCategory[];

const fabricGroupEntries = ["1", "2", "3", "4"].map((group): KnowledgeEntry => ({
  id: `fabric-group-${group}`,
  slug: `stoffgruppe-${group}`,
  category: "stoffe-polster",
  title: `Stoffgruppe ${group}`,
  shortDescription: `Grundlegende Orientierung und künftig alle bestätigten Angaben zur Stoffgruppe ${group}.`,
  description:
    `Diese Seite bündelt die verlässlichen Informationen zur Stoffgruppe ${group}. Technische Eigenschaften, Materialangaben und Pflegehinweise werden ergänzt, sobald sie bestätigt vorliegen.`,
  status: "in-progress",
  sections: [
    {
      id: "informationsstand",
      heading: "Aktueller Informationsstand",
      paragraphs: [
        `Die Stoffgruppe ${group} ist als zentrale Wissensquelle angelegt. Noch nicht bestätigte Angaben werden bewusst nicht dargestellt.`,
        "Künftig können dieselben freigegebenen Inhalte hier ausführlich und direkt bei der passenden Produktauswahl kompakt angezeigt werden.",
      ],
    },
  ],
  relations: {
    optionIds: [`fabric-group-${group}`],
  },
}));

export const knowledgeEntries: readonly KnowledgeEntry[] = fabricGroupEntries;

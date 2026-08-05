import type { ProductCategoryId } from "@/lib/products";

const asset = (path: string) => encodeURI(path);

export interface ProductCategory {
  id: ProductCategoryId;
  name: string;
  image: string;
  intro: string;
  description: string;
  highlights: string[];
  useCases: string[];
}

export const productCategories: ProductCategory[] = [
  {
    id: "stapelstuehle",
    name: "Stapelstühle",
    image: asset("/neue bilder/Stapelstühle/mit beschichtung-sortiment.png"),
    intro:
      "Vielseitige Bestuhlung für Gottesdienste, Mehrzweckräume und Veranstaltungen mit hoher Frequenz.",
    description:
      "Unsere Stapelstühle verbinden belastbare Konstruktionen, gutes Stapelverhalten und eine klare Formensprache. Sie eignen sich für Räume, die schnell umgestellt werden müssen und dabei dauerhaft ordentlich und gepflegt wirken sollen.",
    highlights: [
      "platzsparend stapelbar für flexible Raumkonzepte",
      "robuste Ausführungen für häufig genutzte Bestuhlungen",
      "geeignet für Gemeinden, Seminarräume und Veranstaltungsflächen",
    ],
    useCases: ["Gottesdienste", "Schulungen", "Vorträge", "Mehrzweckhallen"],
  },
  {
    id: "klapptische",
    name: "Klapptische",
    image: asset("/images/curated/Tische/Klapptisch_Stapeltisch_t310ccolor_02.webp"),
    intro:
      "Schnell aufgebaut, stabil im Einsatz und nach der Veranstaltung wieder kompakt verstaut.",
    description:
      "Unsere Klapptische sind auf den Alltag in Gemeindezentren, Festsälen und Vereinsräumen ausgelegt. Ob Kaffeebereich, Seminar, Buffet oder Konferenz: Sie schaffen verlässliche Flächen mit durchdachter Konstruktion und hochwertigen Materialien.",
    highlights: [
      "stabile Konstruktionen für häufiges Auf- und Abbauen",
      "Oberflächen und Kanten passend zur Beanspruchung auswählbar",
      "verschiedene Formate für kleine und große Räume",
    ],
    useCases: ["Gemeindecafés", "Feiern", "Tagungen", "Buffetbereiche"],
  },
  {
    id: "transportwagen-zubehoer",
    name: "Transportwagen, Zubehör und Ersatzteile",
    image: asset("/images/curated/Zubehör/Stapelstuhl_Stuhltransportwagen_02.webp"),
    intro:
      "Möbel einfach bewegen, platzsparend lagern und bestehende Ausstattung sinnvoll ergänzen.",
    description:
      "Von Transportwagen über Buchablagen und Reihenverbinder bis zu Gleitern und Ersatzteilen: Wir unterstützen Sie dabei, Ihre Ausstattung im Alltag praktisch zu nutzen und langfristig zu erhalten.",
    highlights: [
      "Transportlösungen für Stühle und Tische",
      "Zubehör für Ordnung, Reihenbildung und Werterhalt",
      "praktische Entlastung beim Auf- und Abbau",
    ],
    useCases: ["Lagerung", "Saalumbau", "Veranstaltungslogistik", "Hausmeisterteams"],
  },
];

export function getProductCategoryById(id: ProductCategoryId) {
  return productCategories.find((category) => category.id === id);
}


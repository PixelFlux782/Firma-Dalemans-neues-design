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
    image: asset("/pictures/Produkte/Stühle/1021c-01.jpg"),
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
    image: asset("/pictures/Produkte/Tische/Klapptisch_Stapeltisch_t310ccolor_02.jpg"),
    intro:
      "Schnell aufgebaut, stabil im Einsatz und nach der Veranstaltung wieder kompakt verstaut.",
    description:
      "Unsere Klapptische sind auf den Alltag in Gemeindezentren, Festsälen und Vereinsräumen ausgelegt. Ob Kaffeebereich, Seminar, Buffet oder Konferenz: Sie schaffen verlässliche Flächen mit durchdachter Konstruktion und hochwertigen Materialien.",
    highlights: [
      "stabile Konstruktionen für häufiges Auf- und Abbauen",
      "HPL-Oberflächen und belastbare Kanten für den täglichen Einsatz",
      "verschiedene Formate für kleine und große Räume",
    ],
    useCases: ["Gemeindecafés", "Feiern", "Tagungen", "Buffetbereiche"],
  },
  {
    id: "gemeindestuehle-bankettmoebel",
    name: "Gemeindestühle & Bankettmöbel",
    image: asset(
      "/pictures/Produkte/Stühle/Stapelstuhl_Stapelstuhle_Stapelstuehle_Buende_01.jpg",
    ),
    intro:
      "Komfortable Lösungen für Säle, Feste und repräsentative Veranstaltungen mit einheitlichem Gesamtbild.",
    description:
      "Wenn neben Funktion auch Atmosphäre zählt, bieten Gemeindestühle und Bankettmöbel die passende Balance aus Komfort, Wertigkeit und praktischer Handhabung. Besonders bei Reihenbestuhlung, Feiern und wiederkehrenden Veranstaltungen entsteht so ein stimmiger Gesamteindruck.",
    highlights: [
      "ansprechender Auftritt für Feiern und festliche Räume",
      "praktische Lösungen für Ergänzungs- und Reservebestuhlung",
      "geeignet für Reihenbestuhlung und größere Personenzahlen",
    ],
    useCases: ["Gemeindesäle", "Bankette", "Konferenzen", "Festveranstaltungen"],
  },
  {
    id: "transportwagen-zubehoer",
    name: "Transportwagen & Zubehör",
    image: asset("/pictures/Produkte/Zubehör/TransportwagenundZubehör.png"),
    intro:
      "Die praktische Ergänzung für schnelle Abläufe, sichere Lagerung und einfaches Handling im Alltag.",
    description:
      "Mit passenden Transportwagen und Zubehör wird aus guter Ausstattung ein wirklich effizienter Ablauf. Diese Produkte unterstützen saubere Lagerung, geordnete Reihenbildung, bodenschonende Nutzung und schnelle Umbauten im laufenden Betrieb.",
    highlights: [
      "Transportlösungen für Stühle und Tische",
      "Zubehör für Ordnung, Reihenbildung und Werterhalt",
      "spürbare Entlastung beim Auf- und Abbau",
    ],
    useCases: ["Lagerung", "Saalumbau", "Veranstaltungslogistik", "Hausmeisterteams"],
  },
];

export function getProductCategoryById(id: ProductCategoryId) {
  return productCategories.find((category) => category.id === id);
}


import type {
  CommerceCollection,
  CommerceFinderAttributes,
  CommerceImage,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";
import {
  developmentFinderFixtures,
  type DevelopmentFinderProductFixture,
} from "@/lib/finder/development-fixtures";

// Local development fixtures only. Finder products carry explicitly marked
// test prices so cart totals can be exercised; none are final sales prices.

const updatedAt = "2026-08-21T12:00:00.000Z";

function image(url: string, altText: string): CommerceImage {
  return { url, altText, width: null, height: null };
}

function requestVariant(
  id: string,
  title: string,
  sku: string,
  selectedOptions: CommerceProductVariant["selectedOptions"],
  finderAttributes: CommerceFinderAttributes | null = null,
): CommerceProductVariant {
  return {
    id: `local-variant-${id}`,
    title,
    sku,
    selectedOptions,
    price: null,
    compareAtPrice: null,
    priceStatus: "on_request",
    priceDataStatus: null,
    availableForSale: false,
    availability: "on_request",
    availabilityNote: "Verfügbarkeit und Lieferzeit klären wir für die gewählte Ausführung.",
    image: null,
    finderAttributes,
  };
}

const feltGliderImage = image(
  "/images/curated/Zubehör/zubehör-filzgleiter.webp",
  "Filzgleiter mit hellem Kunststoffkörper und Befestigungsstift",
);

const frameGliderImage = image(
  "/images/curated/Zubehör/zubehör-stopfen.webp",
  "Schwarze Kunststoffgleiter für ein Stuhlgestell",
);

const rowConnectorImage = image(
  "/images/curated/Zubehör/reihenverbinder-kunststoff.webp",
  "Schwarze Reihenverbinder aus Kunststoff",
);

const bookRackImage = image(
  "/images/curated/Zubehör/zubehör-buchablage-an-stuhl.webp",
  "Buchablage unter der Sitzfläche eines Holzschalenstuhls",
);

const trolleyImage = image(
  "/images/curated/Zubehör/Stapelstuhl_Stuhltransportwagen_02.webp",
  "Stuhltransportwagen mit gestapelten Holzschalenstühlen",
);

function developmentFinderProduct(
  fixture: DevelopmentFinderProductFixture,
): CommerceProduct {
  const productImage = fixture.glidingSurfaceLabel === "Filz"
    ? feltGliderImage
    : frameGliderImage;
  const itemType = fixture.variants[0].attributes.itemTypes[0];
  const itemLabel = itemType === "table" ? "Tische" : "Stühle";
  const developmentUnitPrice = fixture.glidingSurfaceLabel === "Filz"
    ? { amount: "0.42", currencyCode: "EUR" }
    : { amount: "0.28", currencyCode: "EUR" };
  const packSize = fixture.variants[0].attributes.packSize ?? 1;

  return {
    id: `local-product-${fixture.handle}`,
    handle: fixture.handle,
    title: fixture.title,
    shortDescription: `Simulierte Finder-Ausführungen für ${itemLabel} – Auswahl nach Rohrform, Außenmaß und Boden.`,
    description: `${fixture.title} werden im Gleiter-Finder anhand von Gestellform, gemessenem Außenmaß und hauptsächlichem Boden zugeordnet. Alle technischen Werte dieses lokalen Sortiments sind noch nicht fachlich verifiziert.`,
    descriptionHtml: `<p>${fixture.title} werden anhand von Gestellform, Außenmaß und Boden zugeordnet.</p>`,
    availableForSale: true,
    featuredImage: productImage,
    images: [productImage],
    variants: fixture.variants.map((variant) => ({
      ...requestVariant(
        variant.id,
        variant.title,
        variant.sku,
        [
          { name: "Nennmaß", value: variant.title.replace(/^.*? /, "") },
          { name: "Gleitfläche", value: fixture.glidingSurfaceLabel },
        ],
        variant.attributes,
      ),
      availableForSale: true,
      price: developmentUnitPrice,
      priceStatus: "fixed" as const,
      priceDataStatus: "development" as const,
      availability: "in_stock" as const,
      availabilityNote: "Für den lokalen Warenkorb technisch verfügbar; Preis und Bestand sind Development-Daten.",
    })),
    priceRange: { min: developmentUnitPrice, max: developmentUnitPrice },
    priceStatus: "fixed",
    availability: "in_stock",
    availabilityNote: "Technische Development-Verfügbarkeit – noch keine verbindliche Lieferzusage.",
    collectionHandles: ["gleiter-bodenschutz"],
    specifications: [
      { name: "Zuordnung", value: "nach Rohrform, Außenmaß und Boden" },
      { name: "Gleitfläche", value: fixture.glidingSurfaceLabel },
      { name: "Mengeneinheit", value: "Pack" },
    ],
    compatibility: ["Gestelle innerhalb des ausgewiesenen Entwicklungs-Passbereichs"],
    suitableFor: [itemLabel, "Finder- und Mengentests"],
    quantity: {
      unit: "piece",
      unitLabel: "Stück",
      minimum: packSize,
      step: packSize,
      note: "Der Finder berechnet Bedarf, optionale Reserve und bestellbare Packungsmenge getrennt.",
    },
    measureGuide: [
      "Rohrform bestimmen.",
      "Außenmaß mit einem Messschieber erfassen.",
      "Hauptsächlichen Boden auswählen.",
    ],
    applicationNotes: ["Vor einer späteren Verkaufsfreigabe müssen alle Werte durch echte Produktdaten ersetzt werden."],
    notes: ["Simulierte Development-Daten – nicht als verifizierte Dalemans-Produktdaten verwenden."],
    accessories: [],
    consultationNote: "Bei einem Übergangsmaß beide Ausführungen prüfen oder persönlich beraten lassen.",
    faq: [],
    seo: {
      title: fixture.title,
      description: `${fixture.title} nach Form, Maß und Boden auswählen – Shop und Produktdaten befinden sich in Vorbereitung.`,
    },
    updatedAt,
  };
}

const developmentFinderProducts = developmentFinderFixtures.map(
  developmentFinderProduct,
);

export const localProducts: CommerceProduct[] = [
  ...developmentFinderProducts,
  {
    id: "local-product-filzgleiter-mit-stift",
    handle: "filzgleiter-mit-stift",
    title: "Filzgleiter mit Stift",
    shortDescription: "Für Stuhlbeine aus Holz – passend nach Stiftmaß, Boden und Nutzung auswählen.",
    description:
      "Der Filzgleiter wird über einen Stift am Stuhlbein befestigt und kann empfindliche, glatte Böden im täglichen Betrieb schützen. Vor der Auswahl müssen Stuhlbein, vorhandene Bohrung und Einsatzbereich geprüft werden.",
    descriptionHtml:
      "<p>Der Filzgleiter wird über einen Stift am Stuhlbein befestigt und kann empfindliche, glatte Böden im täglichen Betrieb schützen.</p>",
    availableForSale: false,
    featuredImage: feltGliderImage,
    images: [feltGliderImage],
    variants: [
      requestVariant("felt-3-grey", "3 mm · Filz grau", "DEV-FG-3-GR", [
        { name: "Stiftmaß", value: "3 mm" },
        { name: "Gleitfläche", value: "Filz grau" },
      ]),
      requestVariant("felt-4-grey", "4 mm · Filz grau", "DEV-FG-4-GR", [
        { name: "Stiftmaß", value: "4 mm" },
        { name: "Gleitfläche", value: "Filz grau" },
      ]),
      requestVariant("felt-5-grey", "5 mm · Filz grau", "DEV-FG-5-GR", [
        { name: "Stiftmaß", value: "5 mm" },
        { name: "Gleitfläche", value: "Filz grau" },
      ]),
    ],
    priceRange: { min: null, max: null },
    priceStatus: "unavailable",
    availability: "unknown",
    availabilityNote: "Preis und Verfügbarkeit folgen nach finaler Sortimentsprüfung.",
    collectionHandles: ["gleiter-bodenschutz"],
    specifications: [
      { name: "Befestigung", value: "Stiftmontage" },
      { name: "Gleitfläche", value: "Filz" },
      { name: "Mengeneinheit", value: "Pack" },
    ],
    compatibility: [
      "Stuhlbeine aus Holz mit geeigneter Aufnahme",
      "Zuordnung nach vorhandener Bohrung und Stiftmaß",
    ],
    suitableFor: ["Parkett", "Laminat", "andere glatte Hartböden nach Prüfung"],
    quantity: {
      unit: "pack",
      unitLabel: "Pack",
      minimum: 1,
      step: 1,
      note: "In der Regel werden vier Gleiter pro Stuhl benötigt. Eine kleine Reserve kann bei größeren Beständen sinnvoll sein.",
    },
    measureGuide: [
      "Vorhandenen Gleiter vorsichtig entfernen.",
      "Stiftdurchmesser beziehungsweise vorhandene Bohrung messen.",
      "Bodenart und Stuhlbein fotografieren, wenn die Zuordnung unklar bleibt.",
    ],
    applicationNotes: [
      "Gleiter regelmäßig auf Verschleiß und festen Sitz prüfen.",
      "Verschmutzte Filzflächen können empfindliche Böden beeinträchtigen.",
    ],
    notes: ["Die Variantenbezeichnungen sind lokale Entwicklungsdaten und werden vor einem Verkaufsstart geprüft."],
    accessories: [
      { handle: "kunststoff-gestellgleiter", title: "Kunststoff-Gestellgleiter" },
    ],
    consultationNote:
      "Ein Foto des Stuhlbeins, das genaue Maß und die Bodenart helfen bei der sicheren Zuordnung.",
    faq: [
      {
        question: "Wie finde ich das passende Stiftmaß?",
        answer:
          "Messen Sie den vorhandenen Stift oder die Aufnahme möglichst mit einem Messschieber. Bei Unsicherheit prüfen wir Foto und Maß gemeinsam.",
      },
    ],
    seo: {
      title: "Filzgleiter mit Stift für Stühle",
      description: "Filzgleiter nach Stiftmaß und Boden auswählen – mit persönlicher Hilfe bei unklarer Zuordnung.",
    },
    updatedAt,
  },
  {
    id: "local-product-kunststoff-gestellgleiter",
    handle: "kunststoff-gestellgleiter",
    title: "Kunststoff-Gestellgleiter",
    shortDescription: "Gleiter für Stahlrohrgestelle – Auswahl anhand von Rohrform, Außenmaß und Einbausituation.",
    description:
      "Kunststoffgleiter können vorhandene Stahlrohrstühle funktional ergänzen oder verschlissene Bauteile ersetzen. Entscheidend sind Rohrform, exaktes Maß und die Konstruktion des Gestells.",
    descriptionHtml:
      "<p>Kunststoffgleiter für vorhandene Stahlrohrstühle werden anhand von Rohrform, Maß und Einbausituation zugeordnet.</p>",
    availableForSale: false,
    featuredImage: frameGliderImage,
    images: [frameGliderImage],
    variants: [
      requestVariant("frame-round-18", "Rund · Ø 18 mm", "DEV-KG-R18", [
        { name: "Rohrform", value: "Rund" },
        { name: "Rohrmaß", value: "Ø 18 mm" },
        { name: "Ausführung", value: "Kunststoff" },
      ]),
      requestVariant("frame-round-20", "Rund · Ø 20 mm", "DEV-KG-R20", [
        { name: "Rohrform", value: "Rund" },
        { name: "Rohrmaß", value: "Ø 20 mm" },
        { name: "Ausführung", value: "Kunststoff" },
      ]),
      requestVariant("frame-round-22", "Rund · Ø 22 mm", "DEV-KG-R22", [
        { name: "Rohrform", value: "Rund" },
        { name: "Rohrmaß", value: "Ø 22 mm" },
        { name: "Ausführung", value: "Kunststoff" },
      ]),
      requestVariant("frame-square-20", "Vierkant · 20 × 20 mm", "DEV-KG-V20", [
        { name: "Rohrform", value: "Vierkant" },
        { name: "Rohrmaß", value: "20 × 20 mm" },
        { name: "Ausführung", value: "Kunststoff" },
      ]),
      requestVariant("frame-rectangular-30-15", "Rechteck · 30 × 15 mm", "DEV-KG-RE3015", [
        { name: "Rohrform", value: "Rechteck" },
        { name: "Rohrmaß", value: "30 × 15 mm" },
        { name: "Ausführung", value: "Kunststoff" },
      ]),
      requestVariant("frame-oval-30-15", "Oval · 30 × 15 mm", "DEV-KG-O3015", [
        { name: "Rohrform", value: "Oval" },
        { name: "Rohrmaß", value: "30 × 15 mm" },
        { name: "Ausführung", value: "Kunststoff" },
      ]),
      requestVariant("frame-cantilever-30-15", "Freischwinger · 30 × 15 mm", "DEV-KG-F3015", [
        { name: "Rohrform", value: "Freischwinger / Sonderform" },
        { name: "Rohrmaß", value: "30 × 15 mm" },
        { name: "Ausführung", value: "Kunststoff" },
      ]),
    ],
    priceRange: { min: null, max: null },
    priceStatus: "on_request",
    availability: "on_request",
    availabilityNote: "Lieferbarkeit prüfen wir passend zur benötigten Ausführung.",
    collectionHandles: ["gleiter-bodenschutz"],
    specifications: [
      { name: "Material", value: "Kunststoff" },
      { name: "Zuordnung", value: "nach Rohrform und Rohrmaß" },
      { name: "Mengeneinheit", value: "Pack" },
    ],
    compatibility: ["Stahlrohrgestelle mit passender Rohrgeometrie", "Bestehende Aufnahme muss vorab geprüft werden"],
    suitableFor: ["Gemeinde- und Veranstaltungssäle", "Bestandsbestuhlung", "Nachrüstung und Ersatz"],
    quantity: {
      unit: "pack",
      unitLabel: "Pack",
      minimum: 1,
      step: 1,
      note: "Die benötigte Anzahl richtet sich nach Gestell und Stuhlbestand.",
    },
    measureGuide: [
      "Rohrform bestimmen: rund, oval oder vierkantig.",
      "Außenmaß des Rohres mit einem Messschieber erfassen.",
      "Einbausituation und vorhandenen Gleiter von mehreren Seiten fotografieren.",
    ],
    applicationNotes: ["Sitz des Gleiters nach der Montage prüfen."],
    notes: ["Maßvarianten und Artikelnummern sind lokale Entwicklungsdaten."],
    accessories: [{ handle: "filzgleiter-mit-stift", title: "Filzgleiter mit Stift" }],
    consultationNote:
      "Bei bestehenden Bestuhlungen reicht die Modellbezeichnung häufig nicht aus – bitte Foto und Rohrmaß bereithalten.",
    faq: [],
    seo: {
      title: "Kunststoff-Gestellgleiter für Stahlrohrstühle",
      description: "Gestellgleiter nach Rohrform und Maß auswählen. Dalemans unterstützt bei der Zuordnung zum vorhandenen Stuhl.",
    },
    updatedAt,
  },
  {
    id: "local-product-reihenverbinder-kunststoff",
    handle: "reihenverbinder-kunststoff",
    title: "Reihenverbinder aus Kunststoff",
    shortDescription: "Für eine geordnete Reihenbestuhlung – Eignung am vorhandenen Stahlrohrgestell prüfen.",
    description:
      "Der Reihenverbinder verbindet benachbarte Stahlrohrstühle miteinander. Ob eine Ausführung passt, hängt von Gestellform, Rohrmaß und Abstand der Stuhlbeine ab.",
    descriptionHtml:
      "<p>Reihenverbinder für Stahlrohrstühle werden passend zu Gestellform, Rohrmaß und Stuhlabstand ausgewählt.</p>",
    availableForSale: false,
    featuredImage: rowConnectorImage,
    images: [rowConnectorImage],
    variants: [
      requestVariant("connector-standard", "Standardausführung", "DEV-RV-STD", [
        { name: "Ausführung", value: "Standard" },
      ]),
      requestVariant("connector-wide", "Ausführung für größeren Abstand", "DEV-RV-WEIT", [
        { name: "Ausführung", value: "Größerer Abstand" },
      ]),
    ],
    priceRange: { min: null, max: null },
    priceStatus: "on_request",
    availability: "on_request",
    availabilityNote: "Die passende Ausführung wird vor der Bestellung geprüft.",
    collectionHandles: ["reihenverbinder-nachruestung"],
    specifications: [
      { name: "Material", value: "Kunststoff" },
      { name: "Anwendung", value: "Verbindung benachbarter Stuhlgestelle" },
      { name: "Mengeneinheit", value: "Stück" },
    ],
    compatibility: ["Stahlrohrstühle nach Maß- und Gestellprüfung"],
    suitableFor: ["Reihenbestuhlung", "Gemeindesäle", "Veranstaltungsräume"],
    quantity: {
      unit: "piece",
      unitLabel: "Stück",
      minimum: 1,
      step: 1,
      note: "Die erforderliche Anzahl richtet sich nach Reihenlänge und Bestuhlungskonzept.",
    },
    measureGuide: [
      "Rohrdurchmesser und Abstand der zu verbindenden Gestellseiten messen.",
      "Foto von Gestell und gewünschter Verbindungssituation aufnehmen.",
    ],
    applicationNotes: ["Vor dem Einsatz ist die sichere Verbindung am konkreten Stuhlmodell zu prüfen."],
    notes: ["Ausführungsnamen sind lokale Entwicklungsdaten."],
    accessories: [{ handle: "buchablage-nachruesten", title: "Buchablage zum Nachrüsten" }],
    consultationNote: "Senden Sie uns ein Foto der Stühle und die relevanten Gestellmaße.",
    faq: [],
    seo: {
      title: "Reihenverbinder für Stahlrohrstühle",
      description: "Reihenverbinder für vorhandene Bestuhlungen – mit Prüfung von Gestell, Maß und Stuhlabstand.",
    },
    updatedAt,
  },
  {
    id: "local-product-buchablage-nachruesten",
    handle: "buchablage-nachruesten",
    title: "Buchablage zum Nachrüsten",
    shortDescription: "Klappbare Ablage unter der Sitzfläche, deren Eignung für den vorhandenen Stuhl geprüft wird.",
    description:
      "Die Buchablage schafft Platz für Gesangbuch, Unterlagen oder persönliche Dinge. Bei geeigneten Stahlrohrstühlen bleibt sie am Stuhl und klappt beim Stapeln weg.",
    descriptionHtml:
      "<p>Die Buchablage ergänzt geeignete Stahlrohrstühle um eine praktische Ablage unter der Sitzfläche.</p>",
    availableForSale: false,
    featuredImage: bookRackImage,
    images: [bookRackImage],
    variants: [
      requestVariant("book-rack-standard", "Passend nach Modellprüfung", "DEV-BA-STD", [
        { name: "Ausführung", value: "Nach Modellprüfung" },
      ]),
    ],
    priceRange: { min: null, max: null },
    priceStatus: "on_request",
    availability: "on_request",
    availabilityNote: "Die Eignung wird anhand des vorhandenen Stuhlmodells geprüft.",
    collectionHandles: ["reihenverbinder-nachruestung"],
    specifications: [
      { name: "Position", value: "unter der Sitzfläche" },
      { name: "Funktion", value: "klappbar" },
      { name: "Mengeneinheit", value: "Stück" },
    ],
    compatibility: ["Geeignete Stahlrohrstühle nach Modell- und Gestellprüfung"],
    suitableFor: ["Kirchen", "Gemeinderäume", "Vortrags- und Seminarräume"],
    quantity: { unit: "piece", unitLabel: "Stück", minimum: 1, step: 1, note: "Üblicherweise eine Ablage pro Stuhl." },
    measureGuide: ["Stuhlmodell und Gestell fotografieren.", "Freiraum unter der Sitzfläche dokumentieren."],
    applicationNotes: ["Montage und Stapelfunktion müssen am konkreten Stuhl geprüft werden."],
    notes: [],
    accessories: [{ handle: "reihenverbinder-kunststoff", title: "Reihenverbinder aus Kunststoff" }],
    consultationNote: "Mit einem Foto von Vorder-, Seiten- und Unteransicht können wir die Eignung besser einschätzen.",
    faq: [
      {
        question: "Bleibt der Stuhl mit Buchablage stapelbar?",
        answer:
          "Bei geeigneten Stuhlmodellen klappt die Ablage beim Stapeln weg. Ob das bei Ihrem Bestand funktioniert, prüfen wir vorab.",
      },
    ],
    seo: {
      title: "Buchablage für Stühle nachrüsten",
      description: "Klappbare Buchablage für geeignete Stahlrohrstühle – mit persönlicher Kompatibilitätsprüfung.",
    },
    updatedAt,
  },
  {
    id: "local-product-stuhltransportwagen",
    handle: "stuhltransportwagen",
    title: "Stuhltransportwagen",
    shortDescription: "Transporthilfe für größere Stuhlbestände – abgestimmt auf Stuhltyp, Stapelmaß und Wege.",
    description:
      "Ein passender Stuhltransportwagen erleichtert Auf- und Abbau sowie die Lagerung. Die Ausführung wird auf den vorhandenen Stuhlbestand und die räumlichen Wege abgestimmt.",
    descriptionHtml:
      "<p>Der Stuhltransportwagen unterstützt geordnete Abläufe bei Aufbau, Transport und Lagerung.</p>",
    availableForSale: false,
    featuredImage: trolleyImage,
    images: [trolleyImage],
    variants: [
      requestVariant("trolley-check", "Passend zum Stuhlbestand", "DEV-STW-CHECK", [
        { name: "Ausführung", value: "Nach Bestandsprüfung" },
      ]),
    ],
    priceRange: { min: null, max: null },
    priceStatus: "on_request",
    availability: "on_request",
    availabilityNote: "Ausführung und Lieferzeit werden projektbezogen geklärt.",
    collectionHandles: ["transport-lagerung"],
    specifications: [
      { name: "Einsatz", value: "Transport gestapelter Stühle" },
      { name: "Zuordnung", value: "nach Stuhltyp und Stapelmaß" },
      { name: "Mengeneinheit", value: "Stück" },
    ],
    compatibility: ["Stuhlbestände nach Modell- und Stapelprüfung"],
    suitableFor: ["Saalumbauten", "Veranstaltungsräume", "Lagerung und interner Transport"],
    quantity: { unit: "piece", unitLabel: "Stück", minimum: 1, step: 1, note: null },
    measureGuide: ["Stuhlmodell, Stückzahl und Stapelhöhe dokumentieren.", "Türbreiten, Schwellen und Transportwege berücksichtigen."],
    applicationNotes: ["Zulässige Beladung und sichere Handhabung richten sich nach der finalen Ausführung."],
    notes: [],
    accessories: [],
    consultationNote: "Für die Auswahl helfen Angaben zu Stuhlmodell, Bestandsmenge, Lagerort und Transportweg.",
    faq: [],
    seo: {
      title: "Stuhltransportwagen für Bestandsbestuhlung",
      description: "Stuhltransportwagen passend zu Stuhltyp, Stapelmaß und Transportwegen auswählen.",
    },
    updatedAt,
  },
];

export const localCollectionRecords: Array<Omit<CommerceCollection, "products">> = [
  {
    id: "local-collection-gleiter-bodenschutz",
    handle: "gleiter-bodenschutz",
    title: "Gleiter & Bodenschutz",
    shortDescription: "Kleine Bauteile, die Stuhl, Boden und tägliche Abläufe langfristig unterstützen.",
    description:
      "Filz- und Gestellgleiter für vorhandene Bestuhlungen. Die sichere Auswahl erfolgt anhand von Befestigung, Rohrform, Maß, Boden und Nutzung.",
    image: feltGliderImage,
    seo: {
      title: "Gleiter & Bodenschutz für Stühle",
      description: "Stuhlgleiter und Filzgleiter passend zu Maß, Gestell und Boden auswählen – mit persönlicher Unterstützung.",
    },
  },
  {
    id: "local-collection-reihenverbinder-nachruestung",
    handle: "reihenverbinder-nachruestung",
    title: "Reihenverbinder & Nachrüstung",
    shortDescription: "Bestehende Stühle sinnvoll ergänzen – von der Reihenbildung bis zur Buchablage.",
    description:
      "Zubehör für geordnete Bestuhlung und praktische Nachrüstung. Vor der Auswahl prüfen wir Stuhlmodell, Gestell und Einbausituation.",
    image: bookRackImage,
    seo: {
      title: "Reihenverbinder & Nachrüstung für Stühle",
      description: "Reihenverbinder und Buchablagen für vorhandene Bestuhlungen mit persönlicher Kompatibilitätsprüfung.",
    },
  },
  {
    id: "local-collection-transport-lagerung",
    handle: "transport-lagerung",
    title: "Transport & Lagerung",
    shortDescription: "Ausstattung sicher bewegen, aufbauen und nach der Nutzung wieder geordnet lagern.",
    description:
      "Transportlösungen werden auf Möbeltyp, Bestandsmenge, Stapelmaß und räumliche Wege abgestimmt.",
    image: trolleyImage,
    seo: {
      title: "Transport & Lagerung für Bestuhlungen",
      description: "Transportwagen und praktische Lösungen für Aufbau, interne Wege und Lagerung von Bestuhlungen.",
    },
  },
  {
    id: "local-collection-muster-beratung",
    handle: "muster-beratung",
    title: "Muster & Beratung",
    shortDescription: "Wenn Maß, Material oder Kompatibilität noch nicht sicher sind, klären wir den Bedarf gemeinsam.",
    description:
      "Mustersets werden vorbereitet. Bis dahin unterstützen wir persönlich bei der Zuordnung vorhandener Modelle und Maße.",
    image: null,
    seo: {
      title: "Muster & persönliche Produktberatung",
      description: "Persönliche Hilfe bei unklaren Maßen, Materialien und der Kompatibilität von Ersatzteilen und Zubehör.",
    },
  },
];

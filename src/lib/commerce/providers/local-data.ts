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
import { localStackingChairProducts } from "@/lib/commerce/providers/local-stacking-chairs";
import { localBistrotischProduct, localPriceListProducts } from "@/lib/commerce/providers/local-price-list-products";
import { localGliderProducts } from "@/lib/commerce/providers/local-glider-products";

// Local development fixtures only. Finder products carry explicitly marked
// test prices so cart totals can be exercised; none are final sales prices.

const updatedAt = "2026-08-21T12:00:00.000Z";

function image(url: string, altText: string): CommerceImage {
  return { url: encodeURI(url), altText, width: null, height: null };
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
    erpArticleNumber: null,
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

function priceListVariant(
  id: string,
  title: string,
  erpArticleNumber: string,
  amount: number,
  selectedOptions: CommerceProductVariant["selectedOptions"],
): CommerceProductVariant {
  return {
    id: `local-variant-${id}`,
    title,
    sku: erpArticleNumber,
    erpArticleNumber,
    selectedOptions,
    price: { amount: amount.toFixed(2), currencyCode: "EUR" },
    compareAtPrice: null,
    priceStatus: "fixed",
    priceDataStatus: "verified",
    availableForSale: false,
    availability: "on_request",
    availabilityNote: "Verfügbarkeit und Lieferzeit klären wir für die gewählte Ausführung.",
    image: null,
    finderAttributes: null,
  };
}

const feltGliderImage = image(
  "/neue bilder/Zubehör/stopfen-sortiment.png",
  "Sortiment verschiedener Möbelgleiter und Gestellstopfen",
);

const whitePlasticPlugImage = image(
  "/neue bilder/Zubehör/zubehoer_stopfen_weiß_a.png",
  "Weißer Kunststoffstopfen mit geripptem Steckschaft und schräger Auflagefläche",
);

const whitePlasticPlugDetailImage = image(
  "/neue bilder/Zubehör/zubehör-stopfen-weiß.png",
  "Weißer Kunststoffstopfen mit Maßangaben",
);

const frameGliderImage = image(
  "/images/curated/Zubehör/zubehör-stopfen.webp",
  "Schwarze Kunststoffgleiter für ein Klapptischgestell",
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

const tableTrolleyImage = image(
  "/images/curated/Zubehör/Tischtransportwagen_02.webp",
  "Tischtransportwagen für zusammengeklappte Tische",
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
    description: `Mit Gestellform, gemessenem Außenmaß und hauptsächlich genutztem Boden ordnen wir ${fixture.title} im Gleiter-Finder zu. Die technischen Werte dieses lokalen Sortiments sind noch nicht fachlich verifiziert.`,
    descriptionHtml: `<p>Mit Gestellform, Außenmaß und Boden ordnen wir ${fixture.title} zu.</p>`,
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
    searchAliases: fixture.handle === "filzgleiter-fuer-rundrohr"
      ? ["Development Rundgleiter"]
      : [],
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

const localProductsBase: CommerceProduct[] = [
  ...localStackingChairProducts,
  ...localPriceListProducts,
  localBistrotischProduct,
  ...developmentFinderProducts,
  {
    id: "local-product-filzgleiter-mit-stift",
    handle: "filzgleiter-mit-stift",
    title: "Kunststoffstopfen weiß",
    shortDescription: "Weißer Kunststoffstopfen für Rundrohre – passend nach Rohrmaß und Einbausituation auswählen.",
    description:
      "Der weiße Kunststoffstopfen wird in ein geeignetes Rundrohr eingesetzt. Vor der Auswahl müssen Rohrmaß und Einbausituation geprüft werden.",
    descriptionHtml:
      "<p>Der weiße Kunststoffstopfen wird in ein geeignetes Rundrohr eingesetzt. Entscheidend sind das genaue Rohrmaß und die Einbausituation.</p>",
    availableForSale: false,
    featuredImage: whitePlasticPlugImage,
    images: [whitePlasticPlugImage, whitePlasticPlugDetailImage],
    variants: [
      {
        ...requestVariant("plastic-plug-white", "Weiß", "DEV-KS-WEISS", [
          { name: "Farbe", value: "Weiß" },
        ]),
        availability: "in_stock",
        availabilityNote: "Kurzfristig lieferbar.",
      },
    ],
    priceRange: { min: null, max: null },
    priceStatus: "on_request",
    availability: "in_stock",
    availabilityNote: "Kurzfristig lieferbar.",
    collectionHandles: ["gleiter-bodenschutz"],
    specifications: [
      { name: "Material", value: "Kunststoff" },
      { name: "Farbe", value: "Weiß" },
      { name: "Befestigung", value: "Steckmontage" },
      { name: "Mengeneinheit", value: "Pack" },
    ],
    compatibility: [
      "Rundrohre mit passendem Innenmaß",
      "Rohrmaß und Einbausituation müssen vorab geprüft werden",
    ],
    suitableFor: ["Stahlrohrgestelle", "Bestandsbestuhlung", "Nachrüstung und Ersatz"],
    quantity: {
      unit: "pack",
      unitLabel: "Pack",
      minimum: 1,
      step: 1,
      note: "Die benötigte Anzahl richtet sich nach Gestell und Stuhlbestand.",
    },
    measureGuide: [
      "Vorhandenen Stopfen vorsichtig entfernen.",
      "Innenmaß des Rundrohres möglichst mit einem Messschieber erfassen.",
      "Rohr und Einbausituation fotografieren, wenn die Zuordnung unklar bleibt.",
    ],
    applicationNotes: [
      "Stopfen regelmäßig auf Verschleiß und festen Sitz prüfen.",
    ],
    notes: ["Die Variantenbezeichnungen sind lokale Entwicklungsdaten und werden vor einem Verkaufsstart geprüft."],
    accessories: [
      { handle: "kunststoff-gestellgleiter", title: "Kunststoff-Gestellgleiter" },
    ],
    consultationNote:
      "Ein Foto des Rundrohres und das genaue Innenmaß helfen bei der sicheren Zuordnung.",
    faq: [
      {
        question: "Wie finde ich das passende Rohrmaß?",
        answer:
          "Messen Sie das Innenmaß des Rundrohres möglichst mit einem Messschieber. Bei Unsicherheit prüfen wir Foto und Maß gemeinsam.",
      },
    ],
    seo: {
      title: "Kunststoffstopfen weiß für Rundrohre",
      description: "Weißen Kunststoffstopfen passend zum Rundrohr auswählen – mit persönlicher Hilfe bei unklarer Zuordnung.",
    },
    updatedAt,
  },
  {
    id: "local-product-kunststoff-gestellgleiter",
    handle: "kunststoff-gestellgleiter",
    title: "Kunststoff-Gestellgleiter",
    shortDescription: "Diese Gleiter sind für Klapptische.",
    description:
      "Kunststoffgleiter für Klapptische ersetzen verschlissene Bauteile am Gestell. Entscheidend sind Rohrform, exaktes Maß und die Konstruktion des Tischgestells.",
    descriptionHtml:
      "<p>Wir ordnen Kunststoffgleiter für Klapptische anhand von Rohrform, Maß und Einbausituation zu.</p>",
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
    compatibility: ["Klapptischgestelle mit passender Rohrgeometrie", "Bestehende Aufnahme muss vorab geprüft werden"],
    suitableFor: ["Klapptische", "Gemeinde- und Veranstaltungssäle", "Nachrüstung und Ersatz"],
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
    accessories: [{ handle: "filzgleiter-mit-stift", title: "Kunststoffstopfen weiß" }],
    consultationNote:
      "Bei bestehenden Klapptischen reicht die Modellbezeichnung häufig nicht aus – bitte Foto und Rohrmaß bereithalten.",
    faq: [],
    seo: {
      title: "Kunststoff-Gestellgleiter für Klapptische",
      description: "Gestellgleiter nach Rohrform und Maß auswählen. Wir helfen Ihnen bei der Zuordnung zum vorhandenen Klapptisch.",
    },
    updatedAt,
  },
  {
    id: "local-product-reihenverbinder-kunststoff",
    handle: "reihenverbinder-kunststoff",
    title: "Reihenverbinder aus Kunststoff",
    shortDescription: "Zum Nachrüsten: Sie haben Ihre Stapelstühle ursprünglich ohne Reihenverbindung bestellt? Für geeignete vorhandene Stühle bieten wir diese Kunststofflösung an. Bei neuen Stapelstühlen empfehlen wir grundsätzlich die fest montierte Reihenverbindung aus Metall.",
    description:
      "Unsere Empfehlung: Planen Sie die Reihenverbindung möglichst bereits bei der Bestellung Ihrer Stapelstühle ein. Die fest montierte Metalllösung ist unsere bevorzugte Wahl für eine dauerhafte Reihenbestuhlung. Für die nachträgliche Ausstattung vorhandener Stühle bieten wir passende Reihenverbinder aus Kunststoff an. Ob eine Ausführung passt, hängt von Stuhlmodell, Gestellform, Rohrmaß und Abstand der Stuhlbeine ab.",
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
      title: "Kunststoff-Reihenverbinder zum Nachrüsten",
      description: "Nachrüstbare Kunststoff-Reihenverbinder für geeignete Stahlrohrstühle – Gestell, Rohrmaß und Stuhlabstand vorab prüfen.",
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
    images: [
      bookRackImage,
      image("/neue bilder/Zubehör/Buchabl03.JPG", "Buchablage zum Nachrüsten – Detailansicht"),
      image("/neue bilder/Zubehör/Buchabl06.JPG", "Buchablage zum Nachrüsten – montierte Ansicht"),
      image("/neue bilder/Zubehör/Buchabl07.JPG", "Buchablage zum Nachrüsten – weitere Ansicht"),
    ],
    variants: [
      priceListVariant("book-rack-standard", "Passend nach Modellprüfung", "BU1021C", 27.50, [
        { name: "Ausführung", value: "Nach Modellprüfung" },
      ]),
    ],
    priceRange: {
      min: { amount: "27.50", currencyCode: "EUR" },
      max: { amount: "27.50", currencyCode: "EUR" },
    },
    priceStatus: "fixed",
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
    quantity: { unit: "piece", unitLabel: "Stück", minimum: 1, step: 1, note: "Üblicherweise eine Buchablage pro ausgestattetem Stuhl." },
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
    id: "local-product-tischtransportwagen",
    handle: "tischtransportwagen",
    title: "Tischtransportwagen",
    shortDescription: "Transportwagen für Klapptische, abgestimmt auf Tischmaß, Stückzahl und Transportwege.",
    description: "Der Tischtransportwagen erleichtert Lagerung und Saalumbauten. Auflagefläche, Haltebügel und Rollen stimmen wir auf Ihre Tische und Wege ab.",
    descriptionHtml: "<p>Transportwagen für die geordnete Lagerung und den internen Transport von Klapptischen.</p>",
    availableForSale: false,
    featuredImage: tableTrolleyImage,
    images: [tableTrolleyImage],
    variants: [
      priceListVariant("table-trolley-one-steering-axle", "Eine Lenkachse", "D710-007", 435, [
        { name: "Lenkachse", value: "Eine Lenkachse" },
      ]),
      priceListVariant("table-trolley-two-steering-axles", "Zwei Lenkachsen", "D710-008", 455.30, [
        { name: "Lenkachse", value: "Zwei Lenkachsen" },
      ]),
    ],
    priceRange: {
      min: { amount: "435.00", currencyCode: "EUR" },
      max: { amount: "455.30", currencyCode: "EUR" },
    },
    priceStatus: "fixed",
    availability: "on_request",
    availabilityNote: "Ausführung und Lieferzeit klären wir passend zu Ihrem Projekt.",
    collectionHandles: ["transport-lagerung"],
    specifications: [
      { name: "Einsatz", value: "Transport und Lagerung von Klapptischen" },
      { name: "Zuordnung", value: "nach Tischmaß und Bestandsmenge" },
      { name: "Maximale Beladung", value: "10 Tische" },
      { name: "Mengeneinheit", value: "Stück" },
    ],
    compatibility: ["Klapptische nach Maß- und Bestandsprüfung"],
    suitableFor: ["Saalumbauten", "Veranstaltungsräume", "Lagerung und interner Transport"],
    quantity: { unit: "piece", unitLabel: "Stück", minimum: 1, step: 1, note: null },
    measureGuide: ["Tischmaße und Stückzahl dokumentieren.", "Türbreiten, Schwellen und Transportwege berücksichtigen."],
    applicationNotes: [
      "Auflagefläche, Haltebügel und Rollen stimmen wir auf die Tische und Wege ab.",
      "Unsere Tischtransportwagen sind für maximal 10 passende Klapptische ausgelegt. Bitte überschreiten Sie diese Anzahl nicht.",
    ],
    notes: [],
    accessories: [],
    variantAdvisories: [
      {
        variantId: "local-variant-table-trolley-two-steering-axles",
        title: "Zwei Lenkachsen – besonders flexibel beim Rangieren",
        paragraphs: [
          "Mit zwei Lenkachsen lässt sich der Tischtransportwagen auch seitlich bewegen und platzsparend in Nischen abstellen. Das ist besonders praktisch, wenn wenig Platz zur Verfügung steht.",
          "Allerdings verhält sich der Wagen beim Schieben ähnlich wie ein Einkaufswagen: Alle vier Räder können einschwenken. Dadurch ist er besonders bei voller Beladung schwieriger geradeaus zu steuern.",
          "Für längere Transportwege empfehlen wir Ihnen daher, auch die Alternative mit einer Lenkachse zu berücksichtigen.",
        ],
        advantage: "Seitliches Rangieren und platzsparendes Abstellen in Nischen möglich.",
        disadvantage: "Bei voller Beladung schwieriger zu steuern, da beide Achsen lenkbar sind.",
      },
    ],
    optionalAccessories: [
      {
        title: "Zweiter Schiebegriff",
        availabilityLabel: "Auf Anfrage",
        description: [
          "Für unsere Tischtransportwagen mit zwei Lenkachsen bieten wir auf Anfrage einen zusätzlichen Schiebegriff an. Damit können Sie den Wagen von beiden Seiten aus führen und besser kontrollieren.",
          "Bitte beachten Sie: Der zweite Griff erleichtert zwar das Führen des Wagens, kann das Be- und Entladen der Tische jedoch etwas umständlicher machen.",
        ],
        compatibleVariantIds: ["local-variant-table-trolley-two-steering-axles"],
      },
    ],
    consultationNote: "Für die Auswahl helfen Tischmaße, Bestandsmenge, Lagerort und Transportweg.",
    faq: [],
    seo: {
      title: "Tischtransportwagen für Klapptische",
      description: "Tischtransportwagen passend zu Tischmaß, Bestand und Transportwegen auswählen und Angebot anfragen.",
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
    variants: [priceListVariant("chair-trolley", "Stuhltransportwagen", "D720", 180.32, [])],
    priceRange: {
      min: { amount: "180.32", currencyCode: "EUR" },
      max: { amount: "180.32", currencyCode: "EUR" },
    },
    priceStatus: "fixed",
    availability: "on_request",
    availabilityNote: "Ausführung und Lieferzeit klären wir passend zu Ihrem Projekt.",
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

const replacedGliderHandles = new Set(["filzgleiter-mit-stift", "kunststoff-gestellgleiter"]);

export const localProducts: CommerceProduct[] = [
  ...localProductsBase
    .filter((product) => !replacedGliderHandles.has(product.handle))
    .map((product) => product.variants.some((variant) => variant.priceDataStatus === "development")
      ? { ...product, collectionHandles: product.collectionHandles.filter((handle) => handle !== "gleiter-bodenschutz") }
      : product),
  ...localGliderProducts,
];

export const localCollectionRecords: Array<Omit<CommerceCollection, "products">> = [
  {
    id: "local-collection-bistrotische",
    handle: "bistrotische",
    title: "Bistrotische",
    shortDescription: "Kompakte Tischlösungen für Cafébereiche, Begegnungszonen und Stehempfänge.",
    description: "Bistrotische für Foyers, Gemeindecafés und Aufenthaltsbereiche. Ausführungen und Maße klären wir in der Beratung.",
    image: localBistrotischProduct.featuredImage,
    seo: { title: "Bistrotische", description: "Bistrotische für Foyers, Gemeindecafés und Stehempfänge persönlich auswählen." },
  },
  {
    id: "local-collection-stapelstuehle",
    handle: "stapelstuehle",
    title: "Stapelstühle",
    shortDescription: "Fünf Modelle, verständlich konfiguriert nach Polsterung, Stoffgruppe und Reihenverbindung.",
    description: "Stapelstühle für Gemeinden, Kirchen, Kommunen und flexibel genutzte Räume – mit persönlicher Beratung, Musterstuhl und Raumplanung.",
    image: localStackingChairProducts[0]?.featuredImage ?? null,
    seo: {
      title: "Stapelstühle für flexible Räume",
      description: "Fünf Stapelstuhlmodelle vergleichen, Polsterung und Reihenverbindung wählen und persönlich zu Menge, Musterstuhl und Raumplanung beraten lassen.",
    },
  },
  {
    id: "local-collection-klapptische",
    handle: "klapptische",
    title: "Klapptische",
    shortDescription: "Klapptische, Seminartische und Trapeztische mit mengenabhängigen Preisen.",
    description: "Tischfamilien und Maße aus der aktuellen Preisliste, gruppiert nach Modell und Bauform.",
    image: localPriceListProducts.find((product) => product.handle === "klapptisch-310c")?.featuredImage ?? null,
    seo: { title: "Klapptische", description: "Klapptische nach Modell, Tischmaß und Kantenart auswählen." },
  },
  {
    id: "local-collection-klappstuehle",
    handle: "klappstuehle",
    title: "Klappstühle",
    shortDescription: "Vier kompakte Klappstuhlmodelle, jeweils im Viererpack.",
    description: "Unsere Klappstuhlmodelle für flexible Zusatzbestuhlung. Preise und Lieferzeit klären wir persönlich mit Ihnen.",
    image: null,
    seo: { title: "Klappstühle", description: "Klappstuhlmodelle für flexible Räume anfragen." },
  },
  {
    id: "local-collection-rednerpulte",
    handle: "rednerpulte",
    title: "Rednerpulte",
    shortDescription: "Rednerpulte aus Acrylglas oder massiver Furnierplatte.",
    description: "Drei Rednerpult-Ausführungen aus der aktuellen Preisliste.",
    image: localPriceListProducts.find((product) => product.handle === "rednerpult-typ-a")?.featuredImage ?? null,
    seo: { title: "Rednerpulte", description: "Rednerpulte aus Acrylglas und Furnierplatte." },
  },
  {
    id: "local-collection-gleiter-bodenschutz",
    handle: "gleiter-bodenschutz",
    title: "Gleiter & Bodenschutz",
    shortDescription: "Kleine Bauteile, die Stuhl, Boden und tägliche Abläufe langfristig unterstützen.",
    description:
      "Filz- und Gestellgleiter für vorhandene Bestuhlungen. Wir wählen die passende Ausführung anhand von Befestigung, Rohrform, Maß, Boden und Nutzung aus.",
    image: feltGliderImage,
    seo: {
      title: "Gleiter & Bodenschutz für Stühle",
      description: "Stuhlgleiter und Filzgleiter passend zu Maß, Gestell und Boden auswählen – mit persönlicher Unterstützung.",
    },
  },
  {
    id: "local-collection-reihenverbinder-nachruestung",
    handle: "reihenverbinder-nachruestung",
    title: "Buchablage & Nachrüstung",
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
      "Wir stimmen Transportlösungen auf Möbeltyp, Bestandsmenge, Stapelmaß und räumliche Wege ab.",
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
    image: image("/neue bilder/Stoffe-Farben/Textilproben.png", "Textilproben für die Auswahl von Stoffen und Farben"),
    seo: {
      title: "Muster & persönliche Produktberatung",
      description: "Persönliche Hilfe bei unklaren Maßen, Materialien und der Kompatibilität von Ersatzteilen und Zubehör.",
    },
  },
];

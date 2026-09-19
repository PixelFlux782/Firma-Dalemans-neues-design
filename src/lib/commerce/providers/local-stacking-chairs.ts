import type {
  CommerceImage,
  CommerceMoney,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";
import {
  CHAIR_OPTION_NAMES,
  CHAIR_OPTION_VALUES,
  type ChairConfiguration,
  type ChairFabricGroup,
} from "@/lib/commerce/stacking-chairs";

const updatedAt = "2026-08-27T00:00:00.000Z";

const configurations: ChairConfiguration[] = [
  { upholstery: "none", rowConnector: false },
  { upholstery: "none", rowConnector: true },
  ...([2, 3, 4] as ChairFabricGroup[]).flatMap((fabricGroup) => [
    { upholstery: "seat" as const, fabricGroup, rowConnector: false },
    { upholstery: "seat" as const, fabricGroup, rowConnector: true },
  ]),
  ...([2, 3, 4] as ChairFabricGroup[]).flatMap((fabricGroup) => [
    { upholstery: "seat-back" as const, fabricGroup, rowConnector: false },
    { upholstery: "seat-back" as const, fabricGroup, rowConnector: true },
  ]),
];

type PriceRow = readonly [number, number, number];

interface LocalChairRecord {
  modelCode: string;
  handle: string;
  prices: readonly PriceRow[];
  erpArticleNumbers: readonly string[];
  featuredImage: CommerceImage | null;
  images: CommerceImage[];
  shortDescription: string;
  description: string;
  editorialStatus: "reference" | "data-only";
  searchAliases?: string[];
}

function image(url: string, altText: string): CommerceImage {
  return { url: encodeURI(url), altText, width: null, height: null };
}

function money(amount: number): CommerceMoney {
  return { amount: amount.toFixed(2), currencyCode: "EUR" };
}

function variantTitle(configuration: ChairConfiguration) {
  const parts: string[] = [CHAIR_OPTION_VALUES.upholstery[configuration.upholstery]];
  if (configuration.fabricGroup) parts.push(`Gruppe ${configuration.fabricGroup}`);
  parts.push(CHAIR_OPTION_VALUES.rowConnector[String(configuration.rowConnector) as "true" | "false"]);
  return parts.join(" · ");
}

function variantIdPart(configuration: ChairConfiguration) {
  return [
    configuration.upholstery,
    configuration.fabricGroup ? `g${configuration.fabricGroup}` : null,
    configuration.rowConnector ? "row" : "no-row",
  ].filter(Boolean).join("-");
}

function buildVariant(
  handle: string,
  configuration: ChairConfiguration,
  prices: PriceRow,
  erpArticleNumber: string,
): CommerceProductVariant {
  const tiers = prices.map((amount, index) => ({
    id: `source-tier-${index + 1}`,
    price: money(amount),
    minimumQuantity: index === 0 ? 1 : index === 1 ? 101 : 251,
    maximumQuantity: index === 0 ? 100 : index === 1 ? 250 : null,
    label: index === 0 ? "1–100 Stück" : index === 1 ? "101–250 Stück" : "ab 251 Stück",
  }));
  return {
    id: `local-chair-${handle}-${variantIdPart(configuration)}`,
    title: variantTitle(configuration),
    availableForSale: false,
    sku: null,
    erpArticleNumber,
    selectedOptions: [
      {
        name: CHAIR_OPTION_NAMES.upholstery,
        value: CHAIR_OPTION_VALUES.upholstery[configuration.upholstery],
      },
      ...(configuration.fabricGroup
        ? [{ name: CHAIR_OPTION_NAMES.fabricGroup, value: `Gruppe ${configuration.fabricGroup}` }]
        : []),
      {
        name: CHAIR_OPTION_NAMES.rowConnector,
        value: CHAIR_OPTION_VALUES.rowConnector[String(configuration.rowConnector) as "true" | "false"],
      },
    ],
    price: money(prices[0]),
    compareAtPrice: null,
    image: null,
    priceStatus: "from",
    priceDataStatus: "verified",
    availability: "on_request",
    availabilityNote: "Ausführung, Menge und Lieferzeit klären wir persönlich.",
    finderAttributes: null,
    priceTiers: tiers,
  };
}

const chairRecords: LocalChairRecord[] = [
  {
    modelCode: "1021",
    handle: "1021",
    prices: [
      [67.13, 66.05, 64.44], [70.755, 69.675, 68.065],
      [84.25, 82.9, 80.88], [87.875, 86.525, 84.505],
      [87.5, 86.1, 84], [91.125, 89.725, 87.625],
      [88.88, 87.45, 85.32], [92.505, 91.075, 88.945],
      [97.13, 95.57, 93.24], [100.755, 99.195, 96.865],
      [101.25, 99.63, 97.2], [104.875, 103.255, 100.825],
      [102.5, 100.86, 98.4], [106.125, 104.485, 102.025],
    ],
    erpArticleNumbers: ["A1021ACO", "A1021ACO", "A1021BCO2", "A1021BCO2", "A1021BCO3", "A1021BCO3", "A1021BCO4", "A1021BCO4", "A1021CCO2", "A1021CCO2", "A1021CCO3", "A1021CCO3", "A1021CCO4", "A1021CCO4"],
    featuredImage: image(
      "/images/curated/Stapelstühle/1021c.webp",
      "Stapelstuhl Modell 1021 mit Holzschale und Sitzpolster",
    ),
    images: [
      image("/images/curated/Stapelstühle/1021c.webp", "Stapelstuhl Modell 1021 mit Sitzpolster und Grifföffnung"),
      image("/images/curated/Stapelstühle/1021.webp", "Stapelstuhl Modell 1021 in gepolsterter Ausführung"),
      image("/images/curated/Stapelstühle/1021a.webp", "Stapelstuhl Modell 1021 mit Holzrücken und Sitzpolster"),
      image("/images/curated/Stapelstühle/1021b.webp", "Stapelstuhl Modell 1021 mit geschlossenem gepolstertem Rücken"),
    ],
    shortDescription: "Bewährter Stapelstuhl für Gemeinden, Säle und Veranstaltungsräume mit hoher Beanspruchung.",
    description: "Modell 1021 ist auf häufiges Stellen, Stapeln und Umräumen in Gemeinde- und Veranstaltungsräumen ausgerichtet. Polsterung und Reihenverbindung lassen sich passend zur geplanten Nutzung konfigurieren.",
    editorialStatus: "reference",
    searchAliases: ["1021c", "Stapelstuhl 1021c"],
  },
  {
    modelCode: "Bünde",
    handle: "buende",
    prices: [
      [68.38, 67.28, 65.64], [72.005, 70.905, 69.265],
      [86.75, 85.36, 83.28], [90.375, 88.985, 86.905],
      [92.5, 91.02, 88.8], [96.125, 94.645, 92.425],
      [94.63, 93.11, 90.84], [98.255, 96.735, 94.465],
      [99.63, 98.03, 95.64], [103.255, 101.655, 99.265],
      [106.25, 104.55, 102], [109.875, 108.175, 105.625],
      [108.25, 106.52, 103.92], [111.875, 110.145, 107.545],
    ],
    erpArticleNumbers: ["ABUNDACO", "ABUNDACO", "ABUNDBCO2", "ABUNDBCO2", "ABUNDBCO3", "ABUNDBCO3", "ABUNDBCO4", "ABUNDBCO4", "ABUNDCCO2", "ABUNDCCO2", "ABUNDCCO3", "ABUNDCCO3", "ABUNDCCO4", "ABUNDCCO4"],
    featuredImage: image(
      "/images/curated/Stapelstühle/bünde.webp",
      "Stapelstuhl Modell Bünde mit gepolsterter Sitz- und Rückenfläche",
    ),
    images: [
      image("/images/curated/Stapelstühle/bünde.webp", "Stapelstuhl Modell Bünde in gepolsterter Ausführung"),
      image("/images/curated/Stapelstühle/Stapelstuhl_Stapelstuhle_Stapelstuehle_Buende_01.webp", "Mehrere gestapelte Stühle des Modells Bünde"),
    ],
    shortDescription: "Ausführung für geordnete Reihenbestuhlung in Gemeinde- und Veranstaltungsräumen.",
    description: "Das Modell Bünde ist in der aktuellen Preisliste mit denselben Polster- und Reihenverbindungsoptionen wie die übrigen Stapelstuhlmodelle geführt.",
    editorialStatus: "data-only",
    searchAliases: ["Buende"],
  },
  {
    modelCode: "Coburg",
    handle: "coburg",
    prices: [
      [72.5, 71.34, 69.6], [76.125, 74.965, 73.225],
      [92.5, 91.02, 88.8], [96.125, 94.645, 92.425],
      [96.25, 94.71, 92.4], [99.875, 98.335, 96.025],
      [98.75, 97.17, 94.8], [102.375, 100.795, 98.425],
      [110, 108.24, 105.6], [113.625, 111.865, 109.225],
      [115, 113.16, 110.4], [118.625, 116.785, 114.025],
      [117.5, 115.62, 112.8], [121.125, 119.245, 116.425],
    ],
    erpArticleNumbers: ["ACOBUACO", "ACOBUACO", "ACOBUBCO2", "ACOBUBCO2", "ACOBUBCO3", "ACOBUBCO3", "ACOBUBCO4", "ACOBUBCO4", "ACOBUCCO2", "ACOBUCCO2", "ACOBUCCO3", "ACOBUCCO3", "ACOBUCCO4", "ACOBUCCO4"],
    featuredImage: null,
    images: [],
    shortDescription: "In 14 Polster- und Reihenverbindungsvarianten in der aktuellen Preisliste geführt.",
    description: "Für Modell Coburg liegen Preis- und Variantendaten vor. Individuelle Produkttexte und eindeutig zugeordnete Bilder sind noch nicht hinterlegt.",
    editorialStatus: "data-only",
  },
  {
    modelCode: "Nürnberg",
    handle: "nuernberg",
    prices: [
      [75, 73.8, 72], [78.625, 77.425, 75.625],
      [97.5, 95.94, 93.6], [101.125, 99.565, 97.225],
      [101.25, 99.63, 97.2], [104.875, 103.255, 100.825],
      [103.75, 102.09, 99.6], [107.375, 105.715, 103.225],
      [115, 113.16, 110.4], [118.625, 116.785, 114.025],
      [120, 118.08, 115.2], [123.625, 121.705, 118.825],
      [122.5, 120.54, 117.6], [126.125, 124.165, 121.225],
    ],
    erpArticleNumbers: ["ANURNACO", "ANURNACO", "ANURNBCO2", "ANURNBCO2", "ANURNBCO3", "ANURNBCO3", "ANURNBCO4", "ANURNBCO4", "ANURNCCO2", "ANURNCCO2", "ANURNCCO3", "ANURNCCO3", "ANURNCCO4", "ANURNCCO4"],
    featuredImage: null,
    images: [],
    shortDescription: "In 14 Polster- und Reihenverbindungsvarianten in der aktuellen Preisliste geführt.",
    description: "Für Modell Nürnberg liegen Preis- und Variantendaten vor. Individuelle Produkttexte und eindeutig zugeordnete Bilder sind noch nicht hinterlegt.",
    editorialStatus: "data-only",
    searchAliases: ["Nuernberg"],
  },
  {
    modelCode: "Erfurt",
    handle: "erfurt",
    prices: [
      [80, 78.72, 76.8], [83.625, 82.345, 80.425],
      [105, 103.32, 100.8], [108.625, 106.945, 104.425],
      [108.75, 107.01, 104.4], [112.375, 110.635, 108.025],
      [111.25, 109.47, 106.8], [114.875, 113.095, 110.425],
    ],
    erpArticleNumbers: ["AERFUACO", "AERFUACO", "AERFUBCO2", "AERFUBCO2", "AERFUBCO3", "AERFUBCO3", "AERFUBCO4", "AERFUBCO4"],
    featuredImage: null,
    images: [],
    shortDescription: "In 14 Polster- und Reihenverbindungsvarianten in der aktuellen Preisliste geführt.",
    description: "Für Modell Erfurt liegen Preis- und Variantendaten vor. Individuelle Produkttexte und eindeutig zugeordnete Bilder sind noch nicht hinterlegt.",
    editorialStatus: "data-only",
  },
];

function buildChairProduct(record: LocalChairRecord): CommerceProduct {
  if (record.prices.length !== record.erpArticleNumbers.length) {
    throw new Error(`Expected matching price and ERP rows for chair model ${record.modelCode}.`);
  }

  const variants = configurations.slice(0, record.prices.length).map((configuration, index) =>
    buildVariant(record.handle, configuration, record.prices[index], record.erpArticleNumbers[index]),
  );
  const prices = variants
    .map((variant) => Number(variant.price?.amount))
    .filter(Number.isFinite);

  return {
    id: `local-chair-${record.handle}`,
    handle: record.handle,
    title: `Stapelstuhl Modell ${record.modelCode}`,
    shortDescription: record.shortDescription,
    description: record.description,
    descriptionHtml: `<p>${record.description}</p>`,
    availableForSale: false,
    featuredImage: record.featuredImage,
    images: record.images,
    variants,
    priceRange: {
      min: money(Math.min(...prices)),
      max: money(Math.max(...prices)),
    },
    priceStatus: "from",
    availability: "on_request",
    availabilityNote: "Kauf und verbindliche Mengenstaffel werden nach persönlicher Klärung freigegeben.",
    collectionHandles: ["stapelstuehle"],
    specifications: [
      { name: "Polsterung", value: "ungepolstert, Sitzpolster oder Sitz- und Rückenpolster" },
      { name: "Stoffgruppen", value: "Gruppe 2, 3 oder 4 bei gepolsterten Ausführungen" },
      { name: "Reihenverbindung", value: "mit oder ohne Reihenverbindung" },
    ],
    compatibility: [],
    suitableFor: ["Gemeinden", "Kirchen", "Kommunen", "flexibel genutzte Räume"],
    searchAliases: record.searchAliases,
    quantity: {
      unit: "piece",
      unitLabel: "Stück",
      minimum: 1,
      step: 1,
      note: "Preisstaffel: 1–100, 101–250 und ab 251 Stück.",
    },
    measureGuide: [],
    applicationNotes: [],
    notes: [
      "Drei mengenabhängige Preiswerte wurden aus dem Arbeitsblatt Export_Flo übernommen.",
    ],
    accessories: [],
    consultationNote: "Polsterung, Stoffgruppe, Reihenverbindung, Menge und Raumplanung klären wir persönlich.",
    faq: record.editorialStatus === "reference" ? [
      {
        question: "In welchen Polstervarianten ist Modell 1021 erhältlich?",
        answer: "Die Preisliste führt das Modell ungepolstert, mit Sitzpolster sowie mit Sitz- und Rückenpolster.",
      },
      {
        question: "Ist Modell 1021 mit Reihenverbindung erhältlich?",
        answer: "Ja. Jede Grundausführung ist laut Preisliste mit und ohne Reihenverbindung geführt.",
      },
      {
        question: "Gibt es Mengenpreise?",
        answer: "Ja. Die Staffelbereiche sind 1–100, 101–250 und ab 251 Stück.",
      },
    ] : [],
    seo: {
      title: `Stapelstuhl Modell ${record.modelCode}`,
      description: record.shortDescription,
    },
    updatedAt,
    stackingChair: {
      modelCode: record.modelCode,
      source: "Export_Flo",
      sourcePriceTierMeaning: "documented",
      editorialStatus: record.editorialStatus,
    },
  };
}

export const localStackingChairProducts = chairRecords.map(buildChairProduct);

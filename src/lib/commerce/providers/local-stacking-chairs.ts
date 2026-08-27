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
): CommerceProductVariant {
  const tiers = prices.map((amount, index) => ({
    id: `source-tier-${index + 1}`,
    price: money(amount),
    minimumQuantity: null,
    maximumQuantity: null,
    label: null,
  }));
  const lowestPrice = Math.min(...prices);

  return {
    id: `local-chair-${handle}-${variantIdPart(configuration)}`,
    title: variantTitle(configuration),
    availableForSale: false,
    sku: null,
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
    price: money(lowestPrice),
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
      [67.13, 66.05, 64.44], [70.76, 69.68, 68.07],
      [87.01, 85.93, 84.32], [90.64, 89.56, 87.95],
      [90.88, 89.80, 88.19], [94.51, 93.43, 91.82],
      [91.88, 90.80, 89.19], [95.51, 94.43, 92.82],
      [106.13, 105.05, 103.44], [109.76, 108.68, 107.07],
      [111.63, 110.55, 108.94], [115.26, 114.18, 112.57],
      [113.01, 111.93, 110.32], [116.64, 111.93, 110.32],
    ],
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
      [69.63, 68.51, 66.84], [73.26, 72.14, 70.47],
      [89.51, 88.39, 86.72], [93.14, 92.02, 90.35],
      [93.38, 92.26, 90.59], [97.01, 95.89, 94.22],
      [94.38, 93.26, 91.59], [98.01, 96.89, 95.22],
      [108.63, 107.51, 105.84], [112.26, 111.14, 109.47],
      [114.13, 113.01, 111.34], [117.76, 116.64, 114.97],
      [115.51, 114.39, 112.72], [119.14, 114.39, 112.72],
    ],
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
      [71.13, 69.99, 68.28], [74.76, 73.62, 71.91],
      [91.01, 89.87, 88.16], [94.64, 93.50, 91.79],
      [94.88, 93.74, 92.03], [98.51, 97.37, 95.66],
      [95.88, 94.74, 93.03], [99.51, 98.37, 96.66],
      [110.13, 108.99, 107.28], [113.76, 112.62, 110.91],
      [115.63, 114.49, 112.78], [119.26, 118.12, 116.41],
      [117.01, 115.87, 114.16], [120.64, 115.87, 114.16],
    ],
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
      [67.88, 66.79, 65.16], [71.51, 70.42, 68.79],
      [87.76, 86.67, 85.04], [91.39, 90.30, 88.67],
      [91.63, 90.54, 88.91], [95.26, 94.17, 92.54],
      [92.63, 91.54, 89.91], [96.26, 95.17, 93.54],
      [106.88, 105.79, 104.16], [110.51, 109.42, 107.79],
      [112.38, 111.29, 109.66], [116.01, 114.92, 113.29],
      [113.76, 112.67, 111.04], [117.39, 112.67, 111.04],
    ],
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
      [69.75, 68.63, 66.96], [73.38, 72.26, 70.59],
      [89.63, 88.51, 86.84], [93.26, 92.14, 90.47],
      [93.50, 92.38, 90.71], [97.13, 96.01, 94.34],
      [94.50, 93.38, 91.71], [98.13, 97.01, 95.34],
      [108.75, 107.63, 105.96], [112.38, 111.26, 109.59],
      [114.25, 113.13, 111.46], [117.88, 116.76, 115.09],
      [115.63, 114.51, 112.84], [119.26, 114.51, 112.84],
    ],
    featuredImage: null,
    images: [],
    shortDescription: "In 14 Polster- und Reihenverbindungsvarianten in der aktuellen Preisliste geführt.",
    description: "Für Modell Erfurt liegen Preis- und Variantendaten vor. Individuelle Produkttexte und eindeutig zugeordnete Bilder sind noch nicht hinterlegt.",
    editorialStatus: "data-only",
  },
];

function buildChairProduct(record: LocalChairRecord): CommerceProduct {
  if (record.prices.length !== configurations.length) {
    throw new Error(`Expected 14 price rows for chair model ${record.modelCode}.`);
  }

  const variants = configurations.map((configuration, index) =>
    buildVariant(record.handle, configuration, record.prices[index]),
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
      note: "Die Mengenbereiche der drei Preisstufen sind in der Quelle noch nicht dokumentiert.",
    },
    measureGuide: [],
    applicationNotes: [],
    notes: [
      "Drei Preiswerte je Variante wurden unverändert aus der Preisliste übernommen; ihre Mengenstaffeln sind noch nicht benannt.",
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
        answer: "Die Preisliste enthält drei Preise je Ausführung. Die zugehörigen Mengenbereiche sind noch nicht dokumentiert und werden deshalb persönlich geklärt.",
      },
    ] : [],
    seo: {
      title: `Stapelstuhl Modell ${record.modelCode}`,
      description: record.shortDescription,
    },
    updatedAt,
    stackingChair: {
      modelCode: record.modelCode,
      source: "Preisliste_Stapelstuhl.ods",
      sourcePriceTierMeaning: "undocumented",
      editorialStatus: record.editorialStatus,
    },
  };
}

export const localStackingChairProducts = chairRecords.map(buildChairProduct);

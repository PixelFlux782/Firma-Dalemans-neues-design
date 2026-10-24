import type {
  CommerceImage,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";

const updatedAt = "2026-10-21T17:13:15.000Z";
const collectionHandles = ["gleiter-bodenschutz"];
const setLabel = "Garnitur (4 Stück)";

function image(fileName: string, altText: string): CommerceImage {
  return {
    url: encodeURI(`/neue bilder/Zubehör/${fileName}`),
    altText,
    width: null,
    height: null,
  };
}

function variant(id: string, articleNumber: string): CommerceProductVariant {
  return {
    id: `local-variant-glider-${id}`,
    title: setLabel,
    sku: articleNumber,
    erpArticleNumber: articleNumber,
    selectedOptions: [{ name: "Mengeneinheit", value: setLabel }],
    price: null,
    compareAtPrice: null,
    priceStatus: "on_request",
    priceDataStatus: null,
    availableForSale: false,
    availability: "on_request",
    availabilityNote: "Verfügbarkeit, Lieferzeit und Verkaufspreis klären wir persönlich.",
    image: null,
    finderAttributes: null,
  };
}

interface GliderProductInput {
  id: string;
  handle: string;
  title: string;
  articleNumber: string;
  description: string;
  images: CommerceImage[];
  specifications: CommerceProduct["specifications"];
  compatibility?: string[];
  suitableFor: string[];
  searchAliases?: string[];
  notes?: string[];
}

function gliderProduct(input: GliderProductInput): CommerceProduct {
  return {
    id: `local-product-${input.id}`,
    handle: input.handle,
    title: input.title,
    shortDescription: input.description,
    description: input.description,
    descriptionHtml: `<p>${input.description}</p>`,
    availableForSale: false,
    featuredImage: input.images[0] ?? null,
    images: input.images,
    variants: [variant(input.id, input.articleNumber)],
    priceRange: { min: null, max: null },
    priceStatus: "on_request",
    availability: "on_request",
    availabilityNote: "Verfügbarkeit, Lieferzeit und Verkaufspreis klären wir persönlich.",
    collectionHandles,
    specifications: [
      { name: "Artikelnummer", value: input.articleNumber },
      ...input.specifications,
      { name: "Mengeneinheit", value: setLabel },
      { name: "Preis und Verfügbarkeit", value: "persönliche Anfrage erforderlich" },
    ],
    compatibility: input.compatibility ?? [],
    suitableFor: input.suitableFor,
    searchAliases: input.searchAliases,
    quantity: {
      unit: "set",
      unitLabel: setLabel,
      minimum: 1,
      step: 1,
      note: "Eine Garnitur enthält laut Datentabelle vier Stück.",
    },
    measureGuide: [],
    applicationNotes: [],
    notes: [
      "Preis und Verfügbarkeit werden vor einem Angebot persönlich geprüft.",
      ...(input.notes ?? []),
    ],
    accessories: [],
    consultationNote: "Bitte Artikelnummer und vorhandenes Möbelmodell bei der Anfrage angeben.",
    faq: [],
    seo: { title: input.title, description: input.description },
    updatedAt,
  };
}

const standardImages = [
  image("zubehoer_stopfen_weiß_a.png", "Transparenter Kunststoffgleiter für 20-mm-Stahlrohr"),
  image("zubehör-stopfen-weiß.png", "Kunststoffgleiter Standard in zweiter Ansicht"),
];

export const localGliderProducts: CommerceProduct[] = [
  gliderProduct({
    id: "plastic-standard",
    handle: "kunststoff-gestellgleiter",
    title: "Kunststoffgleiter Standard",
    articleNumber: "GSTGL",
    description: "Kunststoff-Stuhlgleiter für 20-mm-Stahlrohr, 15° abgeschrägt, mit 10 mm Gleiterhöhe in transparenter Ausführung.",
    images: standardImages,
    specifications: [
      { name: "Material", value: "Kunststoff" },
      { name: "Rohr", value: "Stahlrohr, 20 mm" },
      { name: "Winkel", value: "15° abgeschrägt" },
      { name: "Gleiterhöhe", value: "10 mm" },
      { name: "Farbe", value: "transparent" },
    ],
    suitableFor: ["Stühle mit passendem 20-mm-Stahlrohr"],
    searchAliases: ["Kunststoff-Gestellgleiter", "Gestellgleiter", "Kunststoffstopfen"],
  }),
  gliderProduct({
    id: "felt-joint-1021",
    handle: "filzgelenkgleiter-modell-1021",
    title: "Filzgelenkgleiter",
    articleNumber: "A1021FG",
    description: "Filzgleiter für Stapelstuhl Modell 1021 mit 20-mm-Gestell.",
    images: [image("gummistopfen-schwarz.png", "Schwarzer Gelenkgleiter mit Filzgleitfläche")],
    specifications: [
      { name: "Gleitfläche", value: "Filz" },
      { name: "Gestellmaß", value: "20 mm" },
    ],
    compatibility: ["Stapelstuhl Modell 1021"],
    suitableFor: ["Stapelstuhl Modell 1021", "empfindliche Hartböden"],
    notes: ["Die Artikelnummer A1021FG ist in der Datentabelle auch dem Gelenkgleiter für Teppichboden zugeordnet."],
  }),
  gliderProduct({
    id: "carpet-joint-1021",
    handle: "gelenkgleiter-fuer-teppichboden",
    title: "Gelenkgleiter für Teppichboden",
    articleNumber: "A1021FG",
    description: "Gelenkgleiter mit Metallgleitfläche als Aufpreis-Ausführung für Teppichboden.",
    images: [image("Hochwertiger schwarzer Möbelgleiter auf Steinoberfläche.png", "Schwarzer Gelenkgleiter mit Metallgleitfläche")],
    specifications: [{ name: "Gleitfläche", value: "Metall" }, { name: "Bodeneignung", value: "Teppichboden" }],
    compatibility: [],
    suitableFor: ["Teppichboden"],
    notes: ["Die Artikelnummer A1021FG ist in der Datentabelle auch dem Filzgelenkgleiter für Modell 1021 zugeordnet."],
  }),
  gliderProduct({
    id: "felt-angle-310",
    handle: "filz-winkelgleiter",
    title: "Filz-Winkelgleiter",
    articleNumber: "ZGGF30",
    description: "Filz-Winkelgelenkgleiter für Klapptisch Modell 310, inklusive Blindniete 4,0 × 10,0 AL/ST, zum Austausch.",
    images: [image("Schwarzer Möbelgleiter mit Filzpolster.png", "Schwarzer Filz-Winkelgleiter für Klapptisch Modell 310")],
    specifications: [
      { name: "Gleitfläche", value: "Filz" },
      { name: "Befestigung", value: "Blindniete 4,0 × 10,0 AL/ST" },
    ],
    compatibility: ["Klapptisch Modell 310"],
    suitableFor: ["Klapptisch Modell 310"],
    notes: ["Zum Austausch muss die alte Blindniete ausgebohrt und eine neue gesetzt werden."],
  }),
  gliderProduct({
    id: "felt-nail",
    handle: "filzgleiter-mit-stift",
    title: "Filz-Nagelgleiter",
    articleNumber: "A1021NG",
    description: "Filzgleiter zum Einschlagen mit Dorn, 20 mm Durchmesser, in Natur oder Braun.",
    images: [image("zubehör-filzgleiter.png", "Naturfarbener Filz-Nagelgleiter mit Dorn")],
    specifications: [
      { name: "Gleitfläche", value: "Filz" },
      { name: "Befestigung", value: "Dorn zum Einschlagen" },
      { name: "Durchmesser", value: "20 mm" },
      { name: "Farbe", value: "natur oder braun" },
    ],
    suitableFor: ["Möbel mit geeigneter Aufnahme zum Einschlagen"],
  }),
  gliderProduct({
    id: "plastic-nail",
    handle: "kunststoff-nagelgleiter",
    title: "Kunststoff-Nagelgleiter",
    articleNumber: "A1021NGK",
    description: "Nagelgleiter zum Einschlagen mit Kunststoff-Gleitfläche und 20 mm Durchmesser.",
    images: [image("Minimalistischer weißer Möbelgleiter auf Naturstein.png", "Weißer Kunststoff-Nagelgleiter mit Dorn")],
    specifications: [
      { name: "Gleitfläche", value: "Kunststoff" },
      { name: "Befestigung", value: "zum Einschlagen" },
      { name: "Durchmesser", value: "20 mm" },
    ],
    suitableFor: ["Möbel mit geeigneter Aufnahme zum Einschlagen"],
  }),
];

export const chairGliderCompatibility: Record<string, readonly string[]> = {
  "1021": ["filzgelenkgleiter-modell-1021"],
};

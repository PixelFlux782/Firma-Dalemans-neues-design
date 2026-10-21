import type { CommerceImage, CommerceMoney, CommerceProduct, CommerceProductVariant } from "@/lib/commerce/types";
import { getProductBySlug } from "@/lib/products";

const updatedAt = "2026-10-21T00:00:00.000Z";
const eur = (amount: number): CommerceMoney => ({ amount: amount.toFixed(2), currencyCode: "EUR" });
const image = (url: string, altText: string): CommerceImage => ({ url: encodeURI(url), altText, width: null, height: null });

type PricedRow = readonly [erp: string, title: string, first: number, second: number, third: number];

function pricedVariant(prefix: string, row: PricedRow): CommerceProductVariant {
  const [erpArticleNumber, title, first, second, third] = row;
  return {
    id: `local-variant-${prefix}-${erpArticleNumber}`,
    title,
    erpArticleNumber,
    sku: null,
    selectedOptions: title.split(" · ").map((value, index) => ({ name: index === 0 ? "Tischmaß" : "Kantenart", value })),
    price: eur(first),
    compareAtPrice: null,
    priceStatus: "fixed",
    priceDataStatus: "verified",
    availableForSale: true,
    availability: "in_stock",
    availabilityNote: null,
    image: null,
    finderAttributes: null,
    priceTiers: [
      { id: `${prefix}-${erpArticleNumber}-1-14`, price: eur(first), minimumQuantity: 1, maximumQuantity: 14, label: "1–14 Stück" },
      { id: `${prefix}-${erpArticleNumber}-15-20`, price: eur(second), minimumQuantity: 15, maximumQuantity: 20, label: "15–20 Stück" },
      { id: `${prefix}-${erpArticleNumber}-21`, price: eur(third), minimumQuantity: 21, maximumQuantity: null, label: "ab 21 Stück" },
    ],
  };
}

function requestVariant(prefix: string, erpArticleNumber: string, title: string): CommerceProductVariant {
  return {
    id: `local-variant-${prefix}-${erpArticleNumber}`,
    title,
    erpArticleNumber,
    sku: null,
    selectedOptions: [{ name: "Modell", value: title }],
    price: null,
    compareAtPrice: null,
    priceStatus: "on_request",
    priceDataStatus: "verified",
    availableForSale: false,
    availability: "on_request",
    availabilityNote: "Preis und Lieferzeit auf Anfrage.",
    image: null,
    finderAttributes: null,
  };
}

function unavailableVariant(prefix: string, erpArticleNumber: string, title: string): CommerceProductVariant {
  return {
    ...requestVariant(prefix, erpArticleNumber, title),
    priceStatus: "unavailable",
    availability: "out_of_stock",
    availabilityNote: "In der aktuellen Preisliste ist kein numerischer Verkaufspreis hinterlegt.",
  };
}

function fixedInquiryVariant(prefix: string, erpArticleNumber: string, title: string, amount: number): CommerceProductVariant {
  return {
    ...requestVariant(prefix, erpArticleNumber, title),
    price: eur(amount),
    priceStatus: "fixed",
    priceDataStatus: "verified",
  };
}

function product(input: {
  handle: string; title: string; description: string; collection: string;
  variants: CommerceProductVariant[]; featuredImage: CommerceImage | null;
  images?: CommerceImage[]; specifications?: CommerceProduct["specifications"];
  suitableFor?: string[]; consultationNote?: string;
}): CommerceProduct {
  const prices = input.variants.flatMap((variant) => variant.price ? [Number(variant.price.amount)] : []);
  const fixed = prices.length > 0;
  const allUnavailable = input.variants.length > 0 && input.variants.every((variant) =>
    variant.priceStatus === "unavailable" || variant.availability === "out_of_stock",
  );
  const availableForSale = input.variants.some((variant) => variant.availableForSale);
  return {
    id: `local-product-${input.handle}`,
    handle: input.handle,
    title: input.title,
    shortDescription: input.description,
    description: input.description,
    descriptionHtml: `<p>${input.description}</p>`,
    availableForSale,
    featuredImage: input.featuredImage,
    images: input.images ?? (input.featuredImage ? [input.featuredImage] : []),
    variants: input.variants,
    priceRange: { min: fixed ? eur(Math.min(...prices)) : null, max: fixed ? eur(Math.max(...prices)) : null },
    priceStatus: fixed
      ? input.variants.length === 1 && input.variants[0]?.priceStatus === "fixed" ? "fixed" : "from"
      : allUnavailable ? "unavailable" : "on_request",
    availability: availableForSale ? "in_stock" : allUnavailable ? "out_of_stock" : "on_request",
    availabilityNote: availableForSale
      ? "Mengenpreis wird im Warenkorb automatisch berücksichtigt."
      : allUnavailable
        ? "In der aktuellen Preisliste ist kein numerischer Verkaufspreis hinterlegt."
        : "Preis und Lieferzeit auf Anfrage.",
    collectionHandles: [input.collection],
    specifications: input.specifications ?? [], compatibility: [], suitableFor: input.suitableFor ?? ["Gemeinden", "Veranstaltungsräume"],
    quantity: { unit: "piece", unitLabel: "Stück", minimum: 1, step: 1, note: null },
    measureGuide: [], applicationNotes: [], notes: [], accessories: [], faq: [],
    consultationNote: input.consultationNote ?? "Bei Sondermaßen oder Ausstattungsfragen beraten wir persönlich.",
    seo: { title: input.title, description: input.description }, updatedAt,
  };
}

const table310Image = image("/images/curated/Tische/Klapptisch_Stapeltisch_t310ccolor_02.webp", "Klapptisch Modell 310c");
const table310Images = [
  table310Image,
  image("/neue bilder/Gestelle/Gestelltypen/Klapptisch_Gestell_K1-optimiert.webp", "Klapptisch-Gestell K1 für Reihenaufstellungen beim Klapptisch Modell 310c"),
  image("/neue bilder/Gestelle/Gestelltypen/T_Klapptisch_Gestell_K3_Standard-optimiert.webp", "Klapptisch-Gestell K3 für mehr Beinfreiheit an den Stirnseiten beim Klapptisch Modell 310c"),
];
const seminarImage = image("/images/curated/Tische/T210cdetail.webp", "Seminarklapptisch Modell 210c");
const trapezoidImage = image("/images/curated/Tische/Trapezklapptisch_Klapptische_trapez_klappbar.webp", "Trapez-Klapptisch Modell 310c");

const lecternAImages = [
  image("/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA_1.png", "Rednerpult aus Plexiglas und Acrylglas, Typ A"),
  image("/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA.png", "Rednerpult Typ A aus Plexiglas und Acrylglas, weitere Ansicht"),
];
const lecternEImages = [
  image("/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypE_1.png", "Rednerpult aus Plexiglas und Acrylglas, Typ E"),
  image("/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypE.png", "Rednerpult Typ E aus Plexiglas und Acrylglas, weitere Ansicht"),
];
const lecternAhImages = [
  image("/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypAH_1.png", "Rednerpult Typ AH aus massiver Furnierplatte"),
  image("/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypAH_2.png", "Rednerpult Typ AH aus massiver Furnierplatte, weitere Ansicht"),
];

const table310Rows: PricedRow[] = [
  ["T310C127", "120 × 70 cm · ABS", 355.93, 345.25, 338.13], ["T310C128", "120 × 80 cm · ABS", 364.63, 353.69, 346.40],
  ["T310C147", "140 × 70 cm · ABS", 384.02, 372.50, 364.82], ["T310C148", "140 × 80 cm · ABS", 386.98, 375.37, 367.63],
  ["T310C157", "150 × 70 cm · ABS", 385.99, 374.41, 366.69], ["T310C1575", "150 × 75 cm · ABS", 388.79, 377.13, 369.35],
  ["T310C167", "160 × 70 cm · ABS", 388.13, 376.49, 368.72], ["T310C168", "160 × 80 cm · ABS", 389.61, 377.92, 370.13],
  ["T310C177", "170 × 70 cm · ABS", 390.92, 379.19, 371.37], ["T310C178", "170 × 80 cm · ABS", 402.09, 390.03, 381.99],
  ["T310C187", "180 × 70 cm · ABS", 390.92, 379.19, 371.37], ["T310C188", "180 × 80 cm · ABS", 403.09, 391.00, 382.94],
  ["T310C127N", "120 × 70 cm · Buche natur", 386.65, 375.05, 367.32], ["T310C128N", "120 × 80 cm · Buche natur", 396.18, 384.29, 376.37],
  ["T310C147N", "140 × 70 cm · Buche natur", 419.67, 407.08, 398.69], ["T310C148N", "140 × 80 cm · Buche natur", 423.13, 410.44, 401.97],
  ["T310C157N", "150 × 70 cm · Buche natur", 421.98, 409.32, 400.88], ["T310C1575N", "150 × 75 cm · Buche natur", 425.26, 412.50, 404.00],
  ["T310C167N", "160 × 70 cm · Buche natur", 424.44, 411.71, 403.22], ["T310C168N", "160 × 80 cm · Buche natur", 426.25, 413.46, 404.94],
  ["T310C177N", "170 × 70 cm · Buche natur", 427.89, 415.05, 406.50], ["T310C178N", "170 × 80 cm · Buche natur", 440.87, 427.64, 418.83],
  ["T310C187N", "180 × 70 cm · Buche natur", 427.89, 415.05, 406.50], ["T310C188N", "180 × 80 cm · Buche natur", 440.87, 427.64, 418.83],
];

export const localPriceListProducts: CommerceProduct[] = [
  product({ handle: "klapptisch-310c", title: "Klapptisch Modell 310c", description: "Rechteckiger Klapptisch in zwölf Tischmaßen mit ABS- oder Buchekante. Prinzipiell kann jede Zwischengröße gefertigt werden. Es gilt dann der Preis der nächst höheren Größe. Besonders praktisch sind die 2:1-Maße: Zwei Tischbreiten entsprechen einer Tischlänge und lassen sich bündig zu Tischblöcken kombinieren.", collection: "klapptische", featuredImage: table310Image, images: table310Images, consultationNote: "Wir wählen das Gestell anhand der geplanten Aufstellung und der Nutzung der Stirnseiten aus und prüfen die passende Ausführung für Ihr Tischmaß.", variants: table310Rows.map((row) => pricedVariant("310c", row)) }),
  product({ handle: "seminarklapptisch-210c", title: "Seminarklapptisch Modell 210c", description: "Seminarklapptisch mit 25-mm-Platte, lichtgrauer Oberfläche und ABS-Kante.", collection: "klapptische", featuredImage: seminarImage, variants: [
    pricedVariant("210c", ["T210C126", "120 × 60 cm · ABS", 252.75, 245.17, 240.11]),
    pricedVariant("210c", ["T210C147", "140 × 70 cm · ABS", 280, 271.6, 266]),
  ] }),
  product({ handle: "trapez-klapptisch-310c", title: "Trapez-Klapptisch Modell 310c", description: "Nur bei uns: Ein durchdachter und sinnvoller Mechanismus klappt die Füße parallel zur Längsrichtung ein. Dadurch stehen im zusammengeklappten Zustand keine Gestellteile aus dem Tisch heraus.", collection: "klapptische", featuredImage: trapezoidImage, variants: [
    pricedVariant("310ct", ["T310CT147", "140 × 70 cm · ABS", 432.16, 419.20, 410.55]),
    pricedVariant("310ct", ["T310CT168", "160 × 80 cm · ABS", 448.92, 435.45, 426.47]),
    pricedVariant("310ct", ["T310CT147N", "140 × 70 cm · Buche natur", 493.12, 478.33, 468.46]),
    pricedVariant("310ct", ["T310CT168N", "160 × 80 cm · Buche natur", 498.7, 483.74, 473.77]),
  ] }),
  product({ handle: "klappstuehle", title: "Klappstühle", description: "Vier Klappstuhlmodelle in Verpackungseinheiten zu vier Stück; aktuell ohne hinterlegten Verkaufspreis.", collection: "klappstuehle", featuredImage: null, variants: [
    unavailableVariant("klappstuhl", "LSBAS1", "BAS 1 · VPE 4 Stück"), unavailableVariant("klappstuhl", "LS193", "L 193 · VPE 4 Stück"),
    unavailableVariant("klappstuhl", "LS189", "L 189 · VPE 4 Stück"), unavailableVariant("klappstuhl", "LS190", "L 190 · VPE 4 Stück"),
  ] }),
  product({
    handle: "rednerpult-typ-a", title: "Rednerpult aus Plexiglas/Acrylglas, Typ A",
    description: "Transparentes Rednerpult aus Plexiglas beziehungsweise Acrylglas in der Ausführung Typ A.",
    collection: "rednerpulte", featuredImage: lecternAImages[0], images: lecternAImages,
    variants: [fixedInquiryVariant("rednerpult-a", "D705A", "Typ A", 1249.1515)],
    specifications: [{ name: "Material", value: "Plexiglas/Acrylglas" }],
    consultationNote: "Maße, Ausstattung, Lieferzeit und Einsatz klären wir persönlich.",
  }),
  product({
    handle: "rednerpult-typ-e", title: "Rednerpult aus Plexiglas/Acrylglas, Typ E",
    description: "Transparentes Rednerpult aus Plexiglas beziehungsweise Acrylglas in der Ausführung Typ E.",
    collection: "rednerpulte", featuredImage: lecternEImages[0], images: lecternEImages,
    variants: [fixedInquiryVariant("rednerpult-e", "D705E", "Typ E", 1743.2293)],
    specifications: [{ name: "Material", value: "Plexiglas/Acrylglas" }],
    consultationNote: "Maße, Ausstattung, Lieferzeit und Einsatz klären wir persönlich.",
  }),
  product({
    handle: "rednerpult-typ-ah", title: "Rednerpult Typ AH aus massiver Furnierplatte, 16 mm",
    description: "Rednerpult Typ AH aus einer massiven Furnierplatte mit 16 mm Materialstärke.",
    collection: "rednerpulte", featuredImage: lecternAhImages[0], images: lecternAhImages,
    variants: [fixedInquiryVariant("rednerpult-ah", "D705AH", "Typ AH", 1048.1707)],
    specifications: [
      { name: "Material", value: "massive Furnierplatte" },
      { name: "Materialstärke", value: "16 mm" },
    ],
    consultationNote: "Maße, Ausstattung, Lieferzeit und Einsatz klären wir persönlich.",
  }),
];

const bistrotisch = getProductBySlug("bistrotisch");
if (!bistrotisch) throw new Error("Bistrotisch fehlt im redaktionellen Katalog");

export const localBistrotischProduct: CommerceProduct = {
  ...product({
    handle: bistrotisch.slug,
    title: bistrotisch.title,
    description: bistrotisch.description,
    collection: "bistrotische",
    featuredImage: { url: bistrotisch.image, altText: bistrotisch.imageAlt ?? bistrotisch.title, width: null, height: null },
    variants: [{
      id: "local-variant-bistrotisch-anfrage",
      title: "Ausführung auf Anfrage",
      erpArticleNumber: null,
      sku: null,
      selectedOptions: [],
      price: null,
      compareAtPrice: null,
      priceStatus: "on_request",
      priceDataStatus: "verified",
      availableForSale: false,
      availability: "on_request",
      availabilityNote: "Ausführung, Preis und Lieferzeit auf Anfrage.",
      image: null,
      finderAttributes: null,
    }],
  }),
  shortDescription: bistrotisch.shortDescription,
  specifications: bistrotisch.details?.map((value) => ({ name: "Ausführung", value })) ?? [],
  suitableFor: bistrotisch.suitableFor,
  applicationNotes: bistrotisch.variants ?? [],
  consultationNote: bistrotisch.note ?? bistrotisch.shortDescription,
  seo: { title: bistrotisch.title, description: bistrotisch.shortDescription },
};

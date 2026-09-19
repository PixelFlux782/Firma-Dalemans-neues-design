import type { CommerceImage, CommerceMoney, CommerceProduct, CommerceProductVariant } from "@/lib/commerce/types";

const updatedAt = "2026-09-19T00:00:00.000Z";
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
    availabilityNote: "Preisstaffel aus der aktuellen Preisliste; Lieferzeit auf Anfrage.",
    image: null,
    finderAttributes: null,
    priceTiers: [
      { id: `${prefix}-${erpArticleNumber}-1-15`, price: eur(first), minimumQuantity: 1, maximumQuantity: 15, label: "1–15 Stück" },
      { id: `${prefix}-${erpArticleNumber}-16-20`, price: eur(second), minimumQuantity: 16, maximumQuantity: 20, label: "16–20 Stück" },
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

function quotedVariant(prefix: string, erpArticleNumber: string, title: string, amount: number): CommerceProductVariant {
  return {
    ...requestVariant(prefix, erpArticleNumber, title),
    price: eur(amount),
    priceStatus: "from",
  };
}

function product(input: {
  handle: string; title: string; description: string; collection: string;
  variants: CommerceProductVariant[]; featuredImage: CommerceImage | null;
}): CommerceProduct {
  const prices = input.variants.flatMap((variant) => variant.price ? [Number(variant.price.amount)] : []);
  const fixed = prices.length > 0;
  return {
    id: `local-product-${input.handle}`,
    handle: input.handle,
    title: input.title,
    shortDescription: input.description,
    description: input.description,
    descriptionHtml: `<p>${input.description}</p>`,
    availableForSale: input.variants.some((variant) => variant.availableForSale),
    featuredImage: input.featuredImage,
    images: input.featuredImage ? [input.featuredImage] : [],
    variants: input.variants,
    priceRange: { min: fixed ? eur(Math.min(...prices)) : null, max: fixed ? eur(Math.max(...prices)) : null },
    priceStatus: fixed ? "from" : "on_request",
    availability: fixed ? "in_stock" : "on_request",
    availabilityNote: fixed ? "Mengenpreis wird im Warenkorb automatisch berücksichtigt." : "Preis und Lieferzeit auf Anfrage.",
    collectionHandles: [input.collection],
    specifications: [], compatibility: [], suitableFor: ["Gemeinden", "Veranstaltungsräume"],
    quantity: { unit: "piece", unitLabel: "Stück", minimum: 1, step: 1, note: fixed ? "Der Einzelpreis richtet sich nach der Bestellmenge." : null },
    measureGuide: [], applicationNotes: [], notes: [], accessories: [], faq: [],
    consultationNote: "Bei Sondermaßen oder Ausstattungsfragen beraten wir persönlich.",
    seo: { title: input.title, description: input.description }, updatedAt,
  };
}

const table310Image = image("/images/curated/Tische/Klapptisch_Stapeltisch_t310ccolor_02.webp", "Klapptisch Modell 310c");
const seminarImage = image("/images/curated/Tische/T210cdetail.webp", "Seminarklapptisch Modell 210c");
const trapezoidImage = image("/images/curated/Tische/Trapezklapptisch_Klapptische_trapez_klappbar.webp", "Trapez-Klapptisch Modell 310c");

const table310Rows: PricedRow[] = [
  ["T310C127", "120 × 70 cm · ABS", 355.93, 345.2521, 338.1335], ["T310C128", "120 × 80 cm · ABS", 364.63, 353.6911, 346.3985],
  ["T310C147", "140 × 70 cm · ABS", 384.02, 372.4994, 364.819], ["T310C148", "140 × 80 cm · ABS", 386.98, 375.3706, 367.631],
  ["T310C157", "150 × 70 cm · ABS", 385.99, 374.4103, 366.6905], ["T310C1575", "150 × 75 cm · ABS", 388.79, 377.1263, 369.3505],
  ["T310C167", "160 × 70 cm · ABS", 388.13, 376.4861, 368.7235], ["T310C168", "160 × 80 cm · ABS", 389.61, 377.9217, 370.1295],
  ["T310C177", "170 × 70 cm · ABS", 390.92, 379.1924, 371.374], ["T310C178", "170 × 80 cm · ABS", 402.09, 390.0273, 381.9855],
  ["T310C187", "180 × 70 cm · ABS", 390.92, 379.1924, 371.374], ["T310C188", "180 × 80 cm · ABS", 403.09, 390.9973, 382.9355],
  ["T310C127N", "120 × 70 cm · Buche natur", 386.65, 375.0505, 367.3175], ["T310C128N", "120 × 80 cm · Buche natur", 396.18, 384.2946, 376.371],
  ["T310C147N", "140 × 70 cm · Buche natur", 419.67, 407.0799, 398.6865], ["T310C148N", "140 × 80 cm · Buche natur", 423.13, 410.4361, 401.9735],
  ["T310C157N", "150 × 70 cm · Buche natur", 421.98, 409.3206, 400.881], ["T310C1575N", "150 × 75 cm · Buche natur", 425.26, 412.5022, 403.997],
  ["T310C167N", "160 × 70 cm · Buche natur", 424.44, 411.7068, 403.218], ["T310C168N", "160 × 80 cm · Buche natur", 426.25, 413.4625, 404.9375],
  ["T310C177N", "170 × 70 cm · Buche natur", 427.89, 415.0533, 406.4955], ["T310C178N", "170 × 80 cm · Buche natur", 440.87, 427.6439, 418.8265],
  ["T310C187N", "180 × 70 cm · Buche natur", 427.89, 415.0533, 406.4955], ["T310C188N", "180 × 80 cm · Buche natur", 440.87, 427.6439, 418.8265],
];

export const localPriceListProducts: CommerceProduct[] = [
  product({ handle: "klapptisch-310c", title: "Klapptisch Modell 310c", description: "Rechteckiger Klapptisch in zwölf Tischmaßen mit ABS- oder Buchekante.", collection: "klapptische", featuredImage: table310Image, variants: table310Rows.map((row) => pricedVariant("310c", row)) }),
  product({ handle: "seminarklapptisch-210c", title: "Seminarklapptisch Modell 210c", description: "Seminarklapptisch mit 25-mm-Platte, lichtgrauer Oberfläche und ABS-Kante.", collection: "klapptische", featuredImage: seminarImage, variants: [
    pricedVariant("210c", ["T210C126", "120 × 60 cm · ABS", 252.75, 245.1675, 240.1125]),
    pricedVariant("210c", ["T210C147", "140 × 70 cm · ABS", 280, 271.6, 266]),
  ] }),
  product({ handle: "trapez-klapptisch-310c", title: "Trapez-Klapptisch Modell 310c", description: "Eigenständige Trapeztisch-Familie mit ABS- oder Buchekante.", collection: "klapptische", featuredImage: trapezoidImage, variants: [
    pricedVariant("310ct", ["T310CT147", "140 × 70 cm · ABS", 432.16, 419.1952, 410.552]),
    pricedVariant("310ct", ["T310CT168", "160 × 80 cm · ABS", 448.92, 435.4524, 426.474]),
    pricedVariant("310ct", ["T310CT147N", "140 × 70 cm · Buche natur", 493.12, 478.3264, 468.464]),
    pricedVariant("310ct", ["T310CT168N", "160 × 80 cm · Buche natur", 498.7, 483.739, 473.765]),
  ] }),
  product({ handle: "klappstuehle", title: "Klappstühle", description: "Vier Klappstuhlmodelle in Verpackungseinheiten zu vier Stück; Preise auf Anfrage.", collection: "klappstuehle", featuredImage: null, variants: [
    requestVariant("klappstuhl", "LSBAS1", "BAS 1 · VPE 4 Stück"), requestVariant("klappstuhl", "LS193", "L 193 · VPE 4 Stück"),
    requestVariant("klappstuhl", "LS189", "L 189 · VPE 4 Stück"), requestVariant("klappstuhl", "LS190", "L 190 · VPE 4 Stück"),
  ] }),
  product({ handle: "rednerpulte", title: "Rednerpulte", description: "Rednerpulte aus Acrylglas oder massiver Furnierplatte.", collection: "rednerpulte", featuredImage: image("/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA.png", "Rednerpult aus Acrylglas Typ A"), variants: [
    quotedVariant("rednerpult", "D705A", "Typ A · Acrylglas", 1249.1515),
    quotedVariant("rednerpult", "D705E", "Typ E · Acrylglas", 1743.2293),
    quotedVariant("rednerpult", "D705AH", "Typ AH · Furnierplatte", 1048.1707),
  ] }),
];

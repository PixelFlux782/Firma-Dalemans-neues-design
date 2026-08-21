import type {
  CommerceCollection,
  CommerceFinderAttributes,
  CommerceMoney,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";
import { normalizeSearchText } from "@/lib/search/normalize";
import { supportSearchEntries, type SupportSearchEntry } from "@/lib/search/support-documents";
import type { SearchDocument, SearchField, SearchFieldName } from "@/lib/search/types";

type SearchCollection = Pick<
  CommerceCollection,
  "id" | "handle" | "title" | "shortDescription" | "description" | "image"
>;

function field(name: SearchFieldName, value: string | null | undefined): SearchField | null {
  if (!value?.trim()) return null;
  return { name, value, normalized: normalizeSearchText(value) };
}

function fields(
  name: SearchFieldName,
  values: Array<string | null | undefined>,
): SearchField[] {
  return values.map((value) => field(name, value)).filter((value): value is SearchField => Boolean(value));
}

function priceLabel(status: CommerceProduct["priceStatus"], money: CommerceMoney | null): string {
  if (status === "on_request") return "Preis auf Anfrage";
  if (status === "unavailable" || !money) return "Preis folgt";
  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
  return status === "from" ? `ab ${formatted}` : formatted;
}

const frameShapeLabels: Record<CommerceFinderAttributes["frameShape"], string> = {
  round: "rund Rundrohr",
  square: "vierkant Vierkantrohr",
  rectangular: "rechteck Rechteckrohr",
  oval: "oval Ovalrohr",
  cantilever: "Freischwinger Kufe",
};

const mountingLabels: Record<CommerceFinderAttributes["mountingType"], string> = {
  internal_insert: "Innengleiter Einsatz Stopfen",
  external_cap: "Außenkappe Fußkappe",
  clip_on: "Klemmgleiter",
  runner: "Kufengleiter",
};

function finderText(attributes: CommerceFinderAttributes | null): string {
  if (!attributes) return "";
  const { diameter, width, height } = attributes.nominalDimensions;
  const dimensions = diameter !== undefined
    ? [`${diameter} mm`, `Durchmesser ${diameter}`]
    : width !== undefined && height !== undefined
      ? [`${width} x ${height} mm`, `${width} mal ${height} mm`, `Breite ${width} Höhe ${height}`]
      : [];
  const floors = Object.entries(attributes.floorSuitability)
    .filter(([, match]) => match !== "unsuitable")
    .map(([floor]) => floor.replace("tile_stone", "Fliesen Stein").replace("mixed", "Mischboden"));

  return [
    frameShapeLabels[attributes.frameShape],
    mountingLabels[attributes.mountingType],
    ...dimensions,
    attributes.glidingSurface === "felt" ? "Filz Filzgleiter" : "Kunststoff Kunststoffgleiter",
    ...attributes.itemTypes.map((item) => item === "chair" ? "Stuhl Stühle" : "Tisch Tische"),
    ...floors,
  ].join(" ");
}

function variantSearchable(variant: CommerceProductVariant): string {
  return [
    variant.title,
    variant.sku,
    ...variant.selectedOptions.flatMap((option) => [option.name, option.value]),
    finderText(variant.finderAttributes),
  ].filter(Boolean).join(" ");
}

function productDocument(product: CommerceProduct): SearchDocument {
  const aliases = product.searchAliases ?? [];
  const variantLabels = product.variants.map((variant) => ({
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    searchable: normalizeSearchText(variantSearchable(variant)),
  }));
  const hasDevelopmentData = product.variants.some(
    (variant) => variant.priceDataStatus === "development"
      || variant.finderAttributes?.dataStatus === "development",
  );

  return {
    type: "product",
    id: product.id,
    title: product.title,
    url: `/shop/produkt/${product.handle}`,
    description: product.shortDescription,
    image: product.featuredImage,
    priceStatus: product.priceStatus,
    priceLabel: priceLabel(product.priceStatus, product.priceRange.min),
    aliases,
    variantLabels,
    dataStatus: hasDevelopmentData ? "development" : null,
    featuredWhenEmpty: false,
    fields: [
      field("title", product.title),
      field("handle", product.handle),
      ...fields("alias", aliases),
      ...fields("variant", product.variants.map(variantSearchable)),
      ...fields("sku", product.variants.map((variant) => variant.sku)),
      ...fields("compatibility", product.compatibility),
      ...fields("technical", product.specifications.flatMap((specification) => [specification.name, specification.value, `${specification.name} ${specification.value}`])),
      ...fields("application", [...product.suitableFor, ...product.applicationNotes]),
      ...fields("finder", product.variants.map((variant) => finderText(variant.finderAttributes))),
      field("description", product.shortDescription),
      field("description", product.description),
    ].filter((value): value is SearchField => Boolean(value)),
  };
}

function collectionDocument(collection: SearchCollection): SearchDocument {
  return {
    type: "collection",
    id: collection.id,
    title: collection.title,
    url: `/shop/${collection.handle}`,
    description: collection.shortDescription,
    image: collection.image,
    priceStatus: null,
    priceLabel: null,
    aliases: [],
    variantLabels: [],
    dataStatus: null,
    featuredWhenEmpty: false,
    fields: [
      field("title", collection.title),
      field("handle", collection.handle),
      field("description", collection.shortDescription),
      field("description", collection.description),
    ].filter((value): value is SearchField => Boolean(value)),
  };
}

function supportDocument(entry: SupportSearchEntry): SearchDocument {
  return {
    type: "help",
    id: `help-${entry.id}`,
    title: entry.title,
    url: entry.url,
    description: entry.description,
    image: null,
    priceStatus: null,
    priceLabel: null,
    aliases: entry.aliases,
    variantLabels: [],
    dataStatus: null,
    featuredWhenEmpty: Boolean(entry.featuredWhenEmpty),
    fields: [
      field("title", entry.title),
      ...fields("alias", entry.aliases),
      ...fields("keywords", entry.keywords),
      field("description", entry.description),
    ].filter((value): value is SearchField => Boolean(value)),
  };
}

export function buildSearchIndex(
  products: readonly CommerceProduct[],
  collections: readonly SearchCollection[],
  supportEntries: readonly SupportSearchEntry[] = supportSearchEntries,
): SearchDocument[] {
  return [
    ...products.map(productDocument),
    ...collections.map(collectionDocument),
    ...supportEntries.map(supportDocument),
  ];
}

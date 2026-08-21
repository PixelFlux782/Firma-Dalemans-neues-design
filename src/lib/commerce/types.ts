export interface CommerceMoney {
  amount: string;
  currencyCode: string;
}

export type CommerceDataStatus = "verified" | "development";

export type CommercePriceStatus =
  | "fixed"
  | "from"
  | "on_request"
  | "unavailable";

export type CommerceAvailabilityStatus =
  | "in_stock"
  | "out_of_stock"
  | "on_request"
  | "unknown";

export type CommerceQuantityUnit = "piece" | "set" | "pair" | "pack";

export type CommerceFinderItemType = "chair" | "table";

export type CommerceFinderFrameShape =
  | "round"
  | "square"
  | "rectangular"
  | "oval"
  | "cantilever";

export type CommerceFinderFloorType =
  | "parquet"
  | "laminate"
  | "vinyl"
  | "tile_stone"
  | "carpet"
  | "mixed";

export interface CommerceFinderDimensionRange {
  min: number;
  max: number;
}

export type CommerceFinderMountingType =
  | "internal_insert"
  | "external_cap"
  | "clip_on"
  | "runner";

export type CommerceFinderFloorMatch =
  | "preferred"
  | "compatible"
  | "unsuitable";

export type CommerceFinderDataStatus = "verified" | "development";

/**
 * Provider-neutral, machine-readable finder data. A future Shopify mapper can
 * populate this shape from variant metafields or metaobjects.
 */
export interface CommerceFinderAttributes {
  itemTypes: CommerceFinderItemType[];
  frameShape: CommerceFinderFrameShape;
  mountingType: CommerceFinderMountingType;
  nominalDimensions: {
    diameter?: number;
    width?: number;
    height?: number;
  };
  dimensionRanges: {
    diameter?: CommerceFinderDimensionRange;
    width?: CommerceFinderDimensionRange;
    height?: CommerceFinderDimensionRange;
  };
  floorSuitability: Record<CommerceFinderFloorType, CommerceFinderFloorMatch>;
  glidingSurface: "felt" | "plastic" | "other";
  glidersPerItem: Partial<Record<CommerceFinderItemType, number>>;
  packSize: number | null;
  dataStatus: CommerceFinderDataStatus;
}

export interface CommerceImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface CommerceSelectedOption {
  name: string;
  value: string;
}

export interface CommerceProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  sku: string | null;
  selectedOptions: CommerceSelectedOption[];
  price: CommerceMoney | null;
  compareAtPrice: CommerceMoney | null;
  image: CommerceImage | null;
  priceStatus: CommercePriceStatus;
  priceDataStatus: CommerceDataStatus | null;
  availability: CommerceAvailabilityStatus;
  availabilityNote: string | null;
  finderAttributes: CommerceFinderAttributes | null;
}

export interface CommerceSpecification {
  name: string;
  value: string;
}

export interface CommerceQuantity {
  unit: CommerceQuantityUnit;
  unitLabel: string;
  minimum: number;
  step: number;
  note: string | null;
}

export interface CommerceFaqItem {
  question: string;
  answer: string;
}

export interface CommerceProductReference {
  handle: string;
  title: string;
}

export interface CommerceProduct {
  id: string;
  handle: string;
  title: string;
  shortDescription: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: CommerceImage | null;
  images: CommerceImage[];
  variants: CommerceProductVariant[];
  priceRange: {
    min: CommerceMoney | null;
    max: CommerceMoney | null;
  };
  priceStatus: CommercePriceStatus;
  availability: CommerceAvailabilityStatus;
  availabilityNote: string | null;
  collectionHandles: string[];
  specifications: CommerceSpecification[];
  compatibility: string[];
  suitableFor: string[];
  quantity: CommerceQuantity;
  measureGuide: string[];
  applicationNotes: string[];
  notes: string[];
  accessories: CommerceProductReference[];
  consultationNote: string | null;
  faq: CommerceFaqItem[];
  seo: {
    title: string | null;
    description: string | null;
  };
  updatedAt: string;
}

export interface CommerceCollection {
  id: string;
  handle: string;
  title: string;
  shortDescription: string;
  description: string;
  image: CommerceImage | null;
  products: CommerceProduct[];
  seo: {
    title: string | null;
    description: string | null;
  };
}

export interface CommerceProvider {
  getCollections(): Promise<CommerceCollection[]>;
  getCollectionByHandle(handle: string): Promise<CommerceCollection | null>;
  getProducts(): Promise<CommerceProduct[]>;
  getProductsByCollection(collectionHandle: string): Promise<CommerceProduct[]>;
  getProductByHandle(handle: string): Promise<CommerceProduct | null>;
}

export interface CommerceFinderCartContext {
  itemCount: number;
  requiredQuantity: number;
  reserveQuantity: number;
  recommendedQuantity: number;
  orderQuantity: number;
}

export type CommerceCartLineSource = "product" | "glider_finder";

export interface CartInputLine {
  productId: string;
  productHandle: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  image: CommerceImage | null;
  quantity: number;
  unitPrice: CommerceMoney | null;
  priceStatus: CommercePriceStatus;
  priceDataStatus: CommerceDataStatus | null;
  packSize: number | null;
  unitLabel: string;
  minimumQuantity: number;
  quantityStep: number;
  availability: CommerceAvailabilityStatus;
  source: CommerceCartLineSource;
  finderContext?: CommerceFinderCartContext;
}

export interface CartUpdateLine {
  lineId: string;
  quantity: number;
}

export interface CommerceCartLine extends Omit<CartInputLine, "quantity"> {
  id: string;
  quantity: number;
  lineTotal: CommerceMoney | null;
}

export interface CommerceCartTotals {
  subtotalAmount: CommerceMoney | null;
  pricedLineCount: number;
  unpricedLineCount: number;
}

export interface CommerceCart {
  id: string | null;
  totalQuantity: number;
  lines: CommerceCartLine[];
  totals: CommerceCartTotals;
}

export interface CommerceCartProvider {
  getCart(): Promise<CommerceCart> | CommerceCart;
  addLines(lines: CartInputLine[]): Promise<CommerceCart> | CommerceCart;
  updateLines(lines: CartUpdateLine[]): Promise<CommerceCart> | CommerceCart;
  removeLines(lineIds: string[]): Promise<CommerceCart> | CommerceCart;
  clearCart(): Promise<CommerceCart> | CommerceCart;
}

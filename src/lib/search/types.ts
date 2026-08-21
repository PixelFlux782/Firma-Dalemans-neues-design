import type { CommerceDataStatus, CommerceImage, CommercePriceStatus } from "@/lib/commerce/types";

export type SearchEntityType = "product" | "collection" | "help" | "knowledge";

export type SearchFieldName =
  | "title"
  | "handle"
  | "alias"
  | "variant"
  | "sku"
  | "compatibility"
  | "technical"
  | "application"
  | "finder"
  | "description"
  | "keywords";

export interface SearchField {
  name: SearchFieldName;
  value: string;
  normalized: string;
}

export interface SearchDocument {
  type: SearchEntityType;
  id: string;
  title: string;
  url: string;
  description: string;
  image: CommerceImage | null;
  priceStatus: CommercePriceStatus | null;
  priceLabel: string | null;
  fields: SearchField[];
  aliases: string[];
  variantLabels: Array<{ id: string; title: string; sku: string | null; searchable: string }>;
  dataStatus: CommerceDataStatus | null;
  featuredWhenEmpty: boolean;
}

export type SearchMatchKind =
  | "exact_sku"
  | "exact_title"
  | "title_prefix"
  | "title_partial"
  | "alias"
  | "variant"
  | "synonym"
  | "collection"
  | "structured"
  | "description"
  | "keyword";

export interface SearchResult {
  document: SearchDocument;
  score: number;
  matchKind: SearchMatchKind;
  matchedVariant: { id: string; title: string; sku: string | null } | null;
}

export interface SearchGroups {
  products: SearchResult[];
  collections: SearchResult[];
  help: SearchResult[];
  knowledge: SearchResult[];
}

export interface SearchResponse {
  query: string;
  normalizedQuery: string;
  total: number;
  tooShort: boolean;
  groups: SearchGroups;
}

export interface SearchLimits {
  products: number;
  collections: number;
  help: number;
  knowledge: number;
}

export interface SearchOptions {
  limits?: Partial<SearchLimits>;
  minimumQueryLength?: number;
  dataPolicy?: "all" | "verified_only";
}

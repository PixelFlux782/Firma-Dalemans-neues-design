import "server-only";
import { getCollections, getProducts } from "@/lib/commerce/service";
import { buildSearchIndex } from "@/lib/search/index";
import { searchIndex } from "@/lib/search/search";
import type { SearchDocument, SearchOptions, SearchResponse } from "@/lib/search/types";

let indexPromise: Promise<SearchDocument[]> | null = null;

export function getSearchIndex(): Promise<SearchDocument[]> {
  indexPromise ??= Promise.all([getProducts(), getCollections()])
    .then(([products, collections]) => buildSearchIndex(products, collections))
    .catch((error) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

export async function searchCommerce(query: string, options?: SearchOptions): Promise<SearchResponse> {
  return searchIndex(await getSearchIndex(), query, options);
}

import { normalizeSearchText } from "@/lib/search/normalize";
import { compareSearchResults, rankSearchDocument } from "@/lib/search/rank";
import type { SearchDocument, SearchGroups, SearchLimits, SearchOptions, SearchResponse, SearchResult } from "@/lib/search/types";

const DEFAULT_LIMITS: SearchLimits = {
  products: 5,
  collections: 3,
  help: 2,
  knowledge: 3,
};

function emptyGroups(): SearchGroups {
  return { products: [], collections: [], help: [], knowledge: [] };
}

function groupResults(results: SearchResult[], limits: SearchLimits): SearchGroups {
  const groups = emptyGroups();
  for (const result of results) {
    if (result.document.type === "product" && groups.products.length < limits.products) groups.products.push(result);
    if (result.document.type === "collection" && groups.collections.length < limits.collections) groups.collections.push(result);
    if (result.document.type === "help" && groups.help.length < limits.help) groups.help.push(result);
    if (result.document.type === "knowledge" && groups.knowledge.length < limits.knowledge) groups.knowledge.push(result);
  }
  return groups;
}

export function searchIndex(
  documents: readonly SearchDocument[],
  query: string,
  options: SearchOptions = {},
): SearchResponse {
  const normalizedQuery = normalizeSearchText(query);
  const minimumQueryLength = options.minimumQueryLength ?? 2;
  const limits = { ...DEFAULT_LIMITS, ...options.limits };
  const eligibleDocuments = documents.filter((document) =>
    options.dataPolicy !== "verified_only" || document.dataStatus !== "development",
  );

  if (!normalizedQuery) {
    const featured = eligibleDocuments
      .filter((document) => document.featuredWhenEmpty)
      .map((document) => ({
        document,
        score: 0,
        matchKind: "keyword" as const,
        matchedVariant: null,
      }));
    const groups = groupResults(featured, limits);
    return { query, normalizedQuery, total: featured.length, tooShort: false, groups };
  }

  if (normalizedQuery.replace(/\s/g, "").length < minimumQueryLength) {
    return { query, normalizedQuery, total: 0, tooShort: true, groups: emptyGroups() };
  }

  const ranked = eligibleDocuments
    .map((document) => rankSearchDocument(document, query))
    .filter((result): result is SearchResult => Boolean(result))
    .sort(compareSearchResults);

  return {
    query,
    normalizedQuery,
    total: ranked.length,
    tooShort: false,
    groups: groupResults(ranked, limits),
  };
}

import { compactSearchText, normalizeSearchText, tokenizeSearchText } from "@/lib/search/normalize";
import { expandSynonyms } from "@/lib/search/synonyms";
import type { SearchDocument, SearchMatchKind, SearchResult } from "@/lib/search/types";

const matchPriority: Record<SearchMatchKind, number> = {
  exact_sku: 1000,
  exact_title: 900,
  alias: 840,
  title_prefix: 760,
  title_partial: 680,
  variant: 620,
  synonym: 560,
  collection: 510,
  keyword: 480,
  structured: 420,
  description: 180,
};

function containsPhrase(value: string, normalizedQuery: string, compactQuery: string): boolean {
  return value.includes(normalizedQuery) || value.replace(/\s/g, "").includes(compactQuery);
}

function coversAllTokens(value: string, tokens: string[]): boolean {
  const compactValue = value.replace(/\s/g, "");
  const valueTokens = new Set(value.split(" "));
  return tokens.every((token) =>
    valueTokens.has(token) || (token.length >= 4 && compactValue.includes(token)),
  );
}

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let left = 0;
  let right = 0;
  let edits = 0;
  while (left < a.length && right < b.length) {
    if (a[left] === b[right]) {
      left += 1;
      right += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) left += 1;
    else if (b.length > a.length) right += 1;
    else {
      left += 1;
      right += 1;
    }
  }
  return edits + (left < a.length || right < b.length ? 1 : 0) <= 1;
}

function hasSimpleTypoMatchInFields(
  fields: SearchDocument["fields"],
  queryTokens: string[],
): boolean {
  if (!queryTokens.some((token) => token.length >= 5)) return false;
  const documentTokens = fields.flatMap((entry) => entry.normalized.split(" "));
  return queryTokens.every((queryToken) =>
    queryToken.length < 5
      ? documentTokens.includes(queryToken)
      : documentTokens.some((documentToken) => editDistanceAtMostOne(queryToken, documentToken)),
  );
}

export function rankSearchDocument(document: SearchDocument, query: string): SearchResult | null {
  const normalizedQuery = normalizeSearchText(query);
  const compactQuery = compactSearchText(query);
  const queryTokens = tokenizeSearchText(query);
  if (!normalizedQuery) return null;

  const title = document.fields.find((entry) => entry.name === "title")?.normalized ?? "";
  const skuFields = document.fields.filter((entry) => entry.name === "sku");
  const aliasFields = document.fields.filter((entry) => entry.name === "alias");
  const variantFields = document.fields.filter((entry) => entry.name === "variant");
  const structuredFields = document.fields.filter((entry) =>
    ["finder", "technical", "compatibility", "application"].includes(entry.name),
  );
  const keywordFields = document.fields.filter((entry) => entry.name === "keywords");
  const descriptionFields = document.fields.filter((entry) => entry.name === "description");
  const matchedVariant = document.variantLabels.find((variant) =>
    containsPhrase(variant.searchable, normalizedQuery, compactQuery)
      || coversAllTokens(variant.searchable, queryTokens),
  ) ?? null;

  let matchKind: SearchMatchKind | null = null;
  let score = 0;
  const considerMatch = (kind: SearchMatchKind, bonus = 0) => {
    const candidate = matchPriority[kind] + bonus;
    if (candidate > score) {
      score = candidate;
      matchKind = kind;
    }
  };

  if (skuFields.some((entry) => entry.normalized === normalizedQuery)) considerMatch("exact_sku");
  if (title === normalizedQuery || title.replace(/\s/g, "") === compactQuery) considerMatch("exact_title");
  if (aliasFields.some((entry) => entry.normalized === normalizedQuery || entry.normalized.replace(/\s/g, "") === compactQuery)) considerMatch("alias");
  if (title.startsWith(normalizedQuery) || title.replace(/\s/g, "").startsWith(compactQuery)) considerMatch("title_prefix");
  if (containsPhrase(title, normalizedQuery, compactQuery)) considerMatch("title_partial");
  if (variantFields.some((entry) => containsPhrase(entry.normalized, normalizedQuery, compactQuery) || coversAllTokens(entry.normalized, queryTokens))) considerMatch("variant");

  const synonymTerms = expandSynonyms(query);
  const synonymFields = document.fields.filter((entry) => ["title", "handle", "variant", "keywords"].includes(entry.name));
  if (synonymTerms.some((term) => synonymFields.some((entry) => containsPhrase(entry.normalized, term, term.replace(/\s/g, ""))))) considerMatch("synonym");

  if (document.type === "collection" && document.fields.some((entry) => containsPhrase(entry.normalized, normalizedQuery, compactQuery))) considerMatch("collection");
  if (keywordFields.some((entry) => containsPhrase(entry.normalized, normalizedQuery, compactQuery) || coversAllTokens(entry.normalized, queryTokens))) considerMatch("keyword");
  if (structuredFields.some((entry) => containsPhrase(entry.normalized, normalizedQuery, compactQuery) || coversAllTokens(entry.normalized, queryTokens))) considerMatch("structured");
  if (descriptionFields.some((entry) => containsPhrase(entry.normalized, normalizedQuery, compactQuery) || coversAllTokens(entry.normalized, queryTokens))) considerMatch("description");
  if (!matchKind && hasSimpleTypoMatchInFields(document.fields.filter((entry) => entry.name === "title"), queryTokens)) considerMatch("description", 160);
  if (!matchKind && hasSimpleTypoMatchInFields(document.fields, queryTokens)) considerMatch("description", 80);

  if (!matchKind) return null;
  return {
    document,
    score,
    matchKind,
    matchedVariant: matchedVariant
      ? { id: matchedVariant.id, title: matchedVariant.title, sku: matchedVariant.sku }
      : null,
  };
}

export function compareSearchResults(left: SearchResult, right: SearchResult): number {
  if (left.score !== right.score) return right.score - left.score;
  const typeOrder = { product: 0, collection: 1, help: 2, knowledge: 3 } as const;
  if (left.document.type !== right.document.type) {
    return typeOrder[left.document.type] - typeOrder[right.document.type];
  }
  const titleOrder = left.document.title.localeCompare(right.document.title, "de");
  return titleOrder || left.document.id.localeCompare(right.document.id);
}

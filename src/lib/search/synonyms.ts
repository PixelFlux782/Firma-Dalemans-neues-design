import { compactSearchText, normalizeSearchText } from "@/lib/search/normalize";

export const DEVELOPMENT_SYNONYM_GROUPS = [
  ["Stuhlgleiter", "Möbelgleiter", "Gleiter", "Fußgleiter", "Fußkappe", "Stuhlkappe", "Rohrgleiter"],
  ["Filzgleiter", "Filz"],
  ["Reihenverbinder", "Stuhlverbinder"],
  ["Transportwagen", "Stuhlwagen"],
  ["Buchablage", "Ablage"],
] as const;

const synonymMap = new Map<string, Set<string>>();

for (const group of DEVELOPMENT_SYNONYM_GROUPS) {
  const normalizedGroup = group.flatMap((term) => [
    normalizeSearchText(term),
    compactSearchText(term),
  ]);
  for (const term of normalizedGroup) {
    const values = synonymMap.get(term) ?? new Set<string>();
    normalizedGroup.forEach((value) => values.add(value));
    synonymMap.set(term, values);
  }
}

export function expandSynonyms(query: string): string[] {
  const normalized = normalizeSearchText(query);
  const compact = compactSearchText(query);
  const terms = new Set<string>();

  for (const candidate of [normalized, compact, ...normalized.split(" ")]) {
    synonymMap.get(candidate)?.forEach((term) => terms.add(term));
  }

  terms.delete(normalized);
  terms.delete(compact);
  return [...terms];
}

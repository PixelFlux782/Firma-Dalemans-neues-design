import { knowledgeCategories, knowledgeEntries } from "@/lib/knowledge/data";
import type { KnowledgeCategorySlug } from "@/lib/knowledge/types";

export * from "@/lib/knowledge/types";
export * from "@/lib/knowledge/guides";
export * from "@/lib/knowledge/fabric-cards";
export { knowledgeCategories, knowledgeEntries };

export function getKnowledgeCategory(slug: string) {
  return knowledgeCategories.find((category) => category.slug === slug);
}

export function getKnowledgeEntriesByCategory(category: KnowledgeCategorySlug) {
  return knowledgeEntries.filter((entry) => entry.category === category);
}

export function getKnowledgeEntry(category: string, slug: string) {
  return knowledgeEntries.find(
    (entry) => entry.category === category && entry.slug === slug,
  );
}

/** Stable-ID lookup for future product and variant integrations. */
export function getKnowledgeEntryById(id: string) {
  return knowledgeEntries.find((entry) => entry.id === id);
}

export function getKnowledgeEntriesByOptionId(optionId: string) {
  return knowledgeEntries.filter((entry) => entry.relations?.optionIds?.includes(optionId));
}

export function getRelatedKnowledgeEntries(entryId: string) {
  const entry = getKnowledgeEntryById(entryId);
  if (!entry?.relatedEntryIds?.length) return [];
  return entry.relatedEntryIds
    .map(getKnowledgeEntryById)
    .filter((related): related is NonNullable<typeof related> => Boolean(related));
}

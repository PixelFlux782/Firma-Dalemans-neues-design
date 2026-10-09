export const knowledgeCategorySlugs = [
  "stoffe-polster",
  "tischplatten-oberflaechen",
  "tischkanten",
  "tische-konstruktion",
] as const;

export type KnowledgeCategorySlug = (typeof knowledgeCategorySlugs)[number];
export type KnowledgeEntryStatus = "published" | "in-progress";

export interface KnowledgeImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface KnowledgeSection {
  id: string;
  heading: string;
  paragraphs: readonly string[];
  image?: KnowledgeImage;
}

export interface KnowledgeProperty {
  label: string;
  value: string;
}

export interface KnowledgeRelations {
  productIds?: readonly string[];
  variantIds?: readonly string[];
  optionIds?: readonly string[];
}

export interface KnowledgeEntry {
  id: string;
  slug: string;
  category: KnowledgeCategorySlug;
  title: string;
  shortDescription: string;
  description: string;
  status?: KnowledgeEntryStatus;
  heroImage?: KnowledgeImage;
  images?: readonly KnowledgeImage[];
  sections: readonly KnowledgeSection[];
  technicalProperties?: readonly KnowledgeProperty[];
  careInstructions?: readonly string[];
  relatedEntryIds?: readonly string[];
  relations?: KnowledgeRelations;
}

export interface KnowledgeCategory {
  id: KnowledgeCategorySlug;
  slug: KnowledgeCategorySlug;
  title: string;
  shortTitle: string;
  description: string;
  topics: readonly string[];
}

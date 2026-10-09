export const knowledgeCategorySlugs = [
  "stoffe-polster",
  "tischplatten-oberflaechen",
  "tischkanten",
  "tische-konstruktion",
] as const;

export type KnowledgeCategorySlug = (typeof knowledgeCategorySlugs)[number];
export type KnowledgeEntryStatus = "published" | "in-progress";

export type GuideStatus = "published" | "draft";

export interface GuideSection {
  id: string;
  heading: string;
  paragraphs: readonly string[];
  list?: readonly string[];
}

export interface GuideFaqItem {
  question: string;
  answer: string;
}

export interface GuideRelatedLink {
  href: string;
  label: string;
  description: string;
}

/** Public editorial model for the first production-ready guides. */
export interface GuideArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  updatedAt: string;
  body: readonly GuideSection[];
  faq: readonly GuideFaqItem[];
  relatedLinks: readonly GuideRelatedLink[];
  status: GuideStatus;
}

export type FabricCardStatus = "available" | "pending" | "unavailable";

export interface FabricCard {
  group: 2 | 3 | 4;
  title: string;
  publicUrl?: string;
  lastVerifiedAt?: string;
  status: FabricCardStatus;
}

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
  href?: string;
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

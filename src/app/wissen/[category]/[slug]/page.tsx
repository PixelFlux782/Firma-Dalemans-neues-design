import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KnowledgeArticle from "@/components/knowledge/KnowledgeArticle";
import { StructuredData } from "@/components/StructuredData";
import {
  getKnowledgeCategory,
  getKnowledgeEntry,
  getRelatedKnowledgeEntries,
  knowledgeEntries,
} from "@/lib/knowledge";
import { absoluteUrl, buildMetadata, siteName } from "@/lib/seo";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export function generateStaticParams() {
  return knowledgeEntries.map((entry) => ({ category: entry.category, slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const entry = getKnowledgeEntry(category, slug);
  if (!entry) return {};
  return buildMetadata({
    title: `${entry.title} – Wissen & Materialien`,
    description: entry.shortDescription,
    path: `/wissen/${entry.category}/${entry.slug}`,
    image: entry.heroImage?.src ?? null,
    keywords: [entry.title, "Materialwissen", "Stoffe und Polster"],
  });
}

export default async function KnowledgeArticlePage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const entry = getKnowledgeEntry(categorySlug, slug);
  const category = getKnowledgeCategory(categorySlug);
  if (!entry || !category) notFound();

  const path = `/wissen/${entry.category}/${entry.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.shortDescription,
    url: absoluteUrl(path),
    author: { "@type": "Organization", name: siteName },
    publisher: { "@type": "Organization", name: siteName },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <KnowledgeArticle
        entry={entry}
        category={category}
        relatedEntries={getRelatedKnowledgeEntries(entry.id)}
      />
    </>
  );
}

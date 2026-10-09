import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import KnowledgePreview from "@/components/knowledge/KnowledgePreview";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  getKnowledgeCategory,
  getKnowledgeEntriesByCategory,
  knowledgeCategories,
} from "@/lib/knowledge";
import { buildMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return knowledgeCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getKnowledgeCategory((await params).category);
  if (!category) return {};
  return buildMetadata({
    title: `${category.title} – Wissen & Materialien`,
    description: category.description,
    path: `/wissen/${category.slug}`,
    keywords: [...category.topics],
  });
}

export default async function KnowledgeCategoryPage({ params }: Props) {
  const category = getKnowledgeCategory((await params).category);
  if (!category) notFound();
  const entries = getKnowledgeEntriesByCategory(category.id);

  return (
    <div className="page-stack">
      <header className="rounded-5xl border border-white/60 bg-white/80 px-7 py-9 shadow-premium backdrop-blur-sm sm:px-9 md:px-12 md:py-14">
        <Breadcrumbs
          currentPath={`/wissen/${category.slug}`}
          items={[
            { label: "Start", href: "/" },
            { label: "Wissen", href: "/wissen" },
            { label: category.title },
          ]}
        />
        <p className="section-eyebrow mt-9">Wissenskategorie</p>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.025em] text-premium-ink md:text-5xl">{category.title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-premium-muted md:text-lg">{category.description}</p>
      </header>

      <section aria-labelledby="category-articles">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-eyebrow">Orientierung</p>
            <h2 id="category-articles" className="section-title mt-5">Wissen in diesem Bereich</h2>
          </div>
          <Link href="/wissen" className="inline-flex min-h-11 items-center text-sm font-medium text-premium-forest underline-offset-4 hover:underline">← Alle Wissenskategorien</Link>
        </div>

        {entries.length ? (
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => <KnowledgePreview key={entry.id} entry={entry} />)}
          </div>
        ) : (
          <div className="mt-9 rounded-4xl border border-premium-beige/70 bg-premium-warm/60 px-7 py-9 md:px-10 md:py-11">
            <p className="section-eyebrow">In Vorbereitung</p>
            <h3 className="mt-4 font-display text-2xl font-medium text-premium-ink">Dieser Wissensbereich ist bereits angelegt.</h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-premium-muted">Bestätigte Inhalte werden hier schrittweise ergänzt. Bis dahin beraten wir Sie gern persönlich zu Ihrem konkreten Vorhaben.</p>
            <Link href={`/kontakt?anliegen=${encodeURIComponent(`Beratung zu ${category.title}`)}`} className="btn-primary mt-7">Frage stellen</Link>
          </div>
        )}
      </section>

      <section className="rounded-4xl border border-premium-beige/70 bg-white/55 p-7 md:p-10" aria-labelledby="planned-topics">
        <p className="section-eyebrow">Thematisch vorbereitet</p>
        <h2 id="planned-topics" className="mt-4 font-display text-2xl font-medium text-premium-ink">Diese Inhalte finden hier ihren Platz</h2>
        <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {category.topics.map((topic) => (
            <li key={topic} className="flex items-center gap-3 border-b border-premium-beige/70 py-3 text-sm text-premium-muted">
              <span className="size-1.5 rounded-full bg-premium-leaf" aria-hidden />{topic}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

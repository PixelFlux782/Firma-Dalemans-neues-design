import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import KnowledgePreview from "@/components/knowledge/KnowledgePreview";
import type { KnowledgeCategory, KnowledgeEntry } from "@/lib/knowledge";

interface KnowledgeArticleProps {
  entry: KnowledgeEntry;
  category: KnowledgeCategory;
  relatedEntries?: readonly KnowledgeEntry[];
}

export default function KnowledgeArticle({
  entry,
  category,
  relatedEntries = [],
}: KnowledgeArticleProps) {
  const path = `/wissen/${entry.category}/${entry.slug}`;

  return (
    <article className="page-stack">
      <header className="overflow-hidden rounded-5xl border border-white/60 bg-white/80 shadow-premium backdrop-blur-sm">
        <div className="px-7 py-9 sm:px-9 md:px-12 md:py-14">
          <Breadcrumbs
            currentPath={path}
            items={[
              { label: "Start", href: "/" },
              { label: "Wissen", href: "/wissen" },
              { label: category.title, href: `/wissen/${category.slug}` },
              { label: entry.title },
            ]}
          />
          <div className={`mt-9 grid gap-9 ${entry.heroImage ? "lg:grid-cols-[1.05fr_.95fr] lg:items-center" : ""}`}>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="section-eyebrow">{category.title}</p>
                {entry.status === "in-progress" ? (
                  <span className="rounded-full bg-premium-warm px-3 py-1 text-xs font-medium text-premium-muted">
                    Inhalt im Aufbau
                  </span>
                ) : null}
              </div>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.025em] text-premium-ink md:text-5xl">
                {entry.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-premium-muted md:text-lg">
                {entry.description}
              </p>
            </div>
            {entry.heroImage ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-4xl bg-premium-warm">
                <Image src={entry.heroImage.src} alt={entry.heroImage.alt} fill className="object-cover" sizes="(min-width: 1024px) 42vw, 100vw" priority />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div className="space-y-12">
          {entry.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 border-t border-premium-beige/80 pt-8 first:border-t-0 first:pt-0">
              <h2 className="font-display text-2xl font-medium text-premium-ink md:text-3xl">{section.heading}</h2>
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="max-w-3xl text-base leading-8 text-premium-muted">{paragraph}</p>
                ))}
              </div>
              {section.image ? (
                <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-3xl bg-premium-warm">
                  <Image src={section.image.src} alt={section.image.alt} fill className="object-cover" sizes="(min-width: 1024px) 60vw, 100vw" />
                </div>
              ) : null}
            </section>
          ))}

          {entry.technicalProperties?.length ? (
            <section aria-labelledby="technical-information">
              <h2 id="technical-information" className="font-display text-2xl font-medium text-premium-ink md:text-3xl">Technische Informationen</h2>
              <dl className="mt-6 divide-y divide-premium-beige/70 border-y border-premium-beige/70">
                {entry.technicalProperties.map((property) => (
                  <div key={property.label} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-6">
                    <dt className="text-sm font-semibold text-premium-ink">{property.label}</dt>
                    <dd className="text-sm leading-6 text-premium-muted">{property.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {entry.careInstructions?.length ? (
            <section aria-labelledby="care-information" className="rounded-4xl bg-premium-warm/70 p-7 md:p-9">
              <h2 id="care-information" className="font-display text-2xl font-medium text-premium-ink">Pflegehinweise</h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-premium-muted">
                {entry.careInstructions.map((instruction) => <li key={instruction}>{instruction}</li>)}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Beratung und Navigation">
          <div className="rounded-3xl border border-premium-beige/70 bg-premium-warm/60 p-6">
            <p className="section-eyebrow">Persönlich klären</p>
            <h2 className="mt-3 font-display text-xl font-medium text-premium-ink">Sie haben eine konkrete Frage?</h2>
            <p className="mt-3 text-sm leading-6 text-premium-muted">Wir beraten Sie passend zu Produkt, Einsatz und gewünschter Ausstattung.</p>
            <Link href={`/kontakt?anliegen=${encodeURIComponent(`Beratung zu ${entry.title}`)}`} className="btn-primary mt-6 w-full px-5 text-center">Beratung anfragen</Link>
          </div>
          <Link href={`/wissen/${category.slug}`} className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-premium-forest underline-offset-4 hover:underline">
            ← Zurück zu {category.shortTitle}
          </Link>
        </aside>
      </div>

      {relatedEntries.length ? (
        <section aria-labelledby="related-knowledge">
          <p className="section-eyebrow">Weiterlesen</p>
          <h2 id="related-knowledge" className="mt-4 font-display text-3xl font-medium text-premium-ink">Verwandte Wissensartikel</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {relatedEntries.map((related) => <KnowledgePreview key={related.id} entry={related} compact />)}
          </div>
        </section>
      ) : null}
    </article>
  );
}

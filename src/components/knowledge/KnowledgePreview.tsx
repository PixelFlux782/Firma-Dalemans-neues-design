import Link from "next/link";
import Image from "next/image";
import type { KnowledgeEntry } from "@/lib/knowledge";

interface KnowledgePreviewProps {
  entry: KnowledgeEntry;
  compact?: boolean;
  className?: string;
  headingLevel?: 2 | 3;
}

export default function KnowledgePreview({
  entry,
  compact = false,
  className = "",
  headingLevel = 2,
}: KnowledgePreviewProps) {
  const href = `/wissen/${entry.category}/${entry.slug}`;
  const Heading = `h${headingLevel}` as const;

  return (
    <article
      className={`group rounded-3xl border border-premium-beige/70 bg-white/70 shadow-[0_8px_28px_rgba(20,18,16,.04)] ${
        compact ? "p-5" : "p-6 md:p-7"
      } ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="section-eyebrow">Wissensartikel</p>
        {entry.status === "in-progress" ? (
          <span className="rounded-full bg-premium-warm px-3 py-1 text-[0.65rem] font-medium tracking-wide text-premium-muted">
            Wird ergänzt
          </span>
        ) : null}
      </div>
      {entry.heroImage ? (
        <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-2xl bg-premium-warm">
          <Image
            src={entry.heroImage.src}
            alt={entry.heroImage.alt}
            fill
            sizes={compact ? "380px" : "520px"}
            className="object-cover"
          />
        </div>
      ) : null}
      <Heading className={`${compact ? "mt-3 text-xl" : "mt-4 text-2xl"} font-display font-medium text-premium-ink`}>
        <Link
          href={href}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4"
        >
          {entry.title}
        </Link>
      </Heading>
      <p className={`${compact ? "mt-3 text-sm leading-6" : "mt-4 text-sm leading-7"} text-premium-muted`}>
        {entry.shortDescription}
      </p>
      {entry.technicalProperties?.length ? (
        <dl className="mt-5 divide-y divide-premium-beige/70 border-y border-premium-beige/70 text-sm">
          {entry.technicalProperties.map((property) => (
            <div key={property.label} className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] gap-4 py-2.5">
              <dt className="text-premium-muted">{property.label}</dt>
              <dd className="font-medium text-premium-ink">{property.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {entry.careInstructions?.length ? (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-premium-ink">Pflegehinweise</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-premium-muted">
            {entry.careInstructions.map((instruction) => <li key={instruction}>• {instruction}</li>)}
          </ul>
        </div>
      ) : null}
      {entry.status === "in-progress" && !entry.technicalProperties?.length && !entry.careInstructions?.length ? (
        <p className="mt-5 rounded-2xl bg-premium-warm/75 px-4 py-3 text-xs leading-5 text-premium-muted">
          Bestätigte Detailangaben zu Material, technischen Eigenschaften und Pflege liegen derzeit noch nicht vor.
        </p>
      ) : null}
      <Link
        href={href}
        aria-label={`Mehr erfahren: ${entry.title}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-premium-forest underline-offset-4 transition group-hover:text-premium-bronze hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
      >
        Mehr erfahren <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

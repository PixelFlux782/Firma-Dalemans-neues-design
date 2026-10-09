import Link from "next/link";
import type { KnowledgeEntry } from "@/lib/knowledge";

interface KnowledgePreviewProps {
  entry: KnowledgeEntry;
  compact?: boolean;
  className?: string;
}

export default function KnowledgePreview({
  entry,
  compact = false,
  className = "",
}: KnowledgePreviewProps) {
  const href = `/wissen/${entry.category}/${entry.slug}`;

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
      <h2 className={`${compact ? "mt-3 text-xl" : "mt-4 text-2xl"} font-display font-medium text-premium-ink`}>
        <Link
          href={href}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4"
        >
          {entry.title}
        </Link>
      </h2>
      <p className={`${compact ? "mt-3 text-sm leading-6" : "mt-4 text-sm leading-7"} text-premium-muted`}>
        {entry.shortDescription}
      </p>
      <Link
        href={href}
        aria-label={`${entry.title} öffnen`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-premium-forest underline-offset-4 transition group-hover:text-premium-bronze hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
      >
        Mehr erfahren <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

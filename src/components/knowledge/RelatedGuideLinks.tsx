import Link from "next/link";
import type { RelatedGuideLink } from "@/lib/knowledge/advisory-integration";

export default function RelatedGuideLinks({ guides }: { guides: readonly RelatedGuideLink[] }) {
  if (!guides.length) return null;

  return (
    <section aria-labelledby="product-guides-title">
      <p className="section-eyebrow">Wissen zum Produkt</p>
      <h2 id="product-guides-title" className="section-title mt-4">Passende Entscheidungen gut vorbereiten.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {guides.map((guide) => (
          <Link key={guide.slug} href={guide.href} className="group rounded-3xl border border-premium-beige/70 bg-white/70 p-6 shadow-[0_8px_28px_rgba(20,18,16,.04)] transition hover:-translate-y-0.5 hover:border-premium-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
            <h3 className="font-display text-xl font-medium text-premium-ink">{guide.title}</h3>
            <p className="mt-3 text-sm leading-7 text-premium-muted">{guide.description}</p>
            <span className="mt-5 inline-flex text-sm font-semibold text-premium-forest">Ratgeber lesen <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden>→</span></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

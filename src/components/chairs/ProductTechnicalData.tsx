import type { CommerceSpecification } from "@/lib/commerce/types";

export default function ProductTechnicalData({ items }: { items: CommerceSpecification[] }) {
  if (!items.length) return null;

  return (
    <section className="grid gap-9 border-y border-premium-beige/80 py-12 md:py-16 lg:grid-cols-[.72fr_1.28fr] lg:gap-16" aria-labelledby="technical-data-heading">
      <div>
        <p className="section-eyebrow">Technische Daten</p>
        <h2 id="technical-data-heading" className="section-title-functional mt-4">Nur, was gesichert vorliegt.</h2>
        <p className="mt-4 text-sm leading-7 text-premium-muted">Maße, Gewicht und Stapelzahl werden ergänzt, sobald verifizierte Produktunterlagen vorliegen.</p>
      </div>
      <dl className="divide-y divide-premium-beige/80 border-t border-premium-beige/80">
        {items.map((item) => (
          <div key={item.name} className="grid gap-2 py-5 sm:grid-cols-[.72fr_1.28fr] sm:gap-6">
            <dt className="text-sm font-semibold text-premium-ink">{item.name}</dt>
            <dd className="text-sm leading-7 text-premium-muted">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

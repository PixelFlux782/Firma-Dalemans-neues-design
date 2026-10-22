import CommerceProductCard from "@/components/commerce/CommerceProductCard";
import type { CommerceProduct } from "@/lib/commerce/types";

export default function CompatibleGliders({ products }: { products: readonly CommerceProduct[] }) {
  if (!products.length) return null;

  return (
    <section className="rounded-[2rem] border border-premium-beige/70 bg-premium-warm/45 px-7 py-9 sm:px-10 lg:px-12" aria-labelledby="compatible-gliders-title">
      <p className="section-eyebrow">Zubehör</p>
      <h2 id="compatible-gliders-title" className="section-title-functional mt-4">Passende Gleiter &amp; Bodenschutz</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-premium-muted">Diese Ausführungen sind in der bereitgestellten Produktdatentabelle ausdrücklich dem Modell 1021 zugeordnet.</p>
      <div className="mt-8 grid gap-7 sm:grid-cols-2">
        {products.map((product) => <CommerceProductCard key={product.id} product={product} compact buttonLabel="Produkt ansehen" />)}
      </div>
    </section>
  );
}

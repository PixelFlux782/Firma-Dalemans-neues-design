import Link from "next/link";
import CommerceMedia from "@/components/commerce/CommerceMedia";
import type { CommerceProduct } from "@/lib/commerce/types";

export default function CompatibleGliders({ products }: { products: readonly CommerceProduct[] }) {
  if (!products.length) return null;

  return (
    <section className="rounded-[2rem] border border-premium-beige/70 bg-premium-warm/45 px-7 py-9 sm:px-10 lg:px-12" aria-labelledby="compatible-gliders-title">
      <p className="section-eyebrow">Zubehör</p>
      <h2 id="compatible-gliders-title" className="section-title-functional mt-4">Passende Gleiter &amp; Bodenschutz</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-premium-muted">Diese Ausführungen sind in der bereitgestellten Produktdatentabelle ausdrücklich dem Modell 1021 zugeordnet.</p>
      <div className="mt-8 grid gap-7 sm:grid-cols-2">
        {products.map((product) => {
          const articleNumber = product.variants[0]?.erpArticleNumber;
          return <article key={product.id} className="grid min-w-0 grid-cols-[7rem_1fr] gap-5 border-t border-premium-beige/80 pt-5 sm:grid-cols-[8rem_1fr]">
            <Link href={`/produkte/artikel/${product.handle}`} aria-label={`${product.title} ansehen`} className="overflow-hidden rounded-2xl">
              <CommerceMedia image={product.featuredImage} fallbackLabel={product.title} aspectRatio="1 / 1" imageInset="4%" sizes="128px" />
            </Link>
            <div className="min-w-0 self-center">
              <h3 className="font-display text-xl font-medium leading-tight text-premium-ink">
                <Link href={`/produkte/artikel/${product.handle}`} className="underline-offset-4 hover:text-premium-bronze hover:underline">{product.title}</Link>
              </h3>
              {articleNumber ? <p className="mt-2 text-xs font-medium text-premium-charcoal">Art.-Nr. {articleNumber}</p> : null}
              <Link href={`/produkte/artikel/${product.handle}`} className="mt-3 inline-flex text-sm font-semibold text-premium-forest underline-offset-4 hover:underline">Produktdetails <span className="ml-2" aria-hidden>→</span></Link>
            </div>
          </article>;
        })}
      </div>
    </section>
  );
}

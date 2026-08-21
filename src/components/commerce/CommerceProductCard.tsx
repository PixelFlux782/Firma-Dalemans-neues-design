import Link from "next/link";
import CommerceMedia from "@/components/commerce/CommerceMedia";
import CommercePrice from "@/components/commerce/CommercePrice";
import type { CommerceProduct } from "@/lib/commerce/types";

export default function CommerceProductCard({
  product,
  priority = false,
}: {
  product: CommerceProduct;
  priority?: boolean;
}) {
  const hasDevelopmentPrice = product.variants.some(
    (variant) => variant.priceDataStatus === "development",
  );

  return (
    <article className="group min-w-0 border-t border-premium-beige/80 pt-5">
      <Link
        href={`/shop/produkt/${product.handle}`}
        className="block overflow-hidden rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4 focus-visible:ring-offset-premium-canvas"
        aria-label={`${product.title} ansehen`}
      >
        <CommerceMedia
          image={product.featuredImage}
          fallbackLabel={product.title}
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
          className="transition duration-700 ease-out group-hover:scale-[1.015]"
        />
      </Link>
      <div className="px-1 pb-2 pt-6">
        <CommercePrice
          status={product.priceStatus}
          price={product.priceRange.min}
          maxPrice={product.priceRange.max}
          className="mb-3"
        />
        {hasDevelopmentPrice ? (
          <p className="mb-3 text-[.68rem] font-semibold uppercase tracking-[0.12em] text-premium-bronze">
            Development-Preis · unverbindlich
          </p>
        ) : null}
        <h2 className="font-display text-2xl font-medium leading-tight tracking-[-0.02em] text-premium-ink">
          <Link
            href={`/shop/produkt/${product.handle}`}
            className="rounded-sm underline-offset-4 transition hover:text-premium-bronze hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
          >
            {product.title}
          </Link>
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-premium-muted">
          {product.shortDescription}
        </p>
        <Link
          href={`/shop/produkt/${product.handle}`}
          className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 transition hover:text-premium-bronze hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
        >
          Details &amp; Ausführungen <span className="ml-2" aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

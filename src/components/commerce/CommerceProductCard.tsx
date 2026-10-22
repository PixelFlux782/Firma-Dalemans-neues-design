import Link from "next/link";
import CommerceMedia from "@/components/commerce/CommerceMedia";
import CommercePrice from "@/components/commerce/CommercePrice";
import { lowestProductUnitPrice } from "@/lib/commerce/money";
import type { CommerceProduct } from "@/lib/commerce/types";
import { commerceProductPath } from "@/lib/product-routes";

interface Props {
  product: CommerceProduct;
  priority?: boolean;
  href?: string;
  title?: string;
  compact?: boolean;
  buttonLabel?: string;
}

export default function CommerceProductCard({ product, priority = false, href: hrefOverride, title, compact = false, buttonLabel }: Props) {
  const hasDevelopmentPrice = product.variants.some((variant) => variant.priceDataStatus === "development");
  const hasUnreleasedSourcePrice = product.variants.some((variant) => variant.priceDataStatus === "source_unreleased");
  const articleNumbers = [...new Set(product.variants.map((variant) => variant.erpArticleNumber).filter(Boolean))];
  const lowestPrice = lowestProductUnitPrice(product);
  const href = hrefOverride ?? commerceProductPath(product);
  const displayTitle = title ?? product.title;
  const isAccessory = product.collectionHandles.some((handle) => ["gleiter-bodenschutz", "reihenverbinder-nachruestung", "transport-lagerung"].includes(handle));
  const ctaLabel = buttonLabel ?? (isAccessory ? "Produkt ansehen" : "Modell ansehen");

  return (
    <article className="group flex h-full min-w-0 max-w-full flex-col overflow-hidden border-t border-premium-beige/80 pt-5">
      <Link href={href} className="block overflow-hidden rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4 focus-visible:ring-offset-premium-canvas" aria-label={`${displayTitle} ansehen`}>
        <CommerceMedia image={product.featuredImage} fallbackLabel={displayTitle} priority={priority} sizes={compact ? "(min-width: 640px) 22vw, 100vw" : "(min-width: 1024px) 36vw, (min-width: 640px) 50vw, 100vw"} aspectRatio="5 / 4" imageInset="4%" className="transition duration-700 ease-out group-hover:scale-[1.015]" />
      </Link>
      <div className="flex flex-1 flex-col px-1 pb-2 pt-6">
        {hasDevelopmentPrice ? <p className="mb-3 text-[.68rem] font-semibold uppercase tracking-[0.12em] text-premium-bronze">Development-Preis · unverbindlich</p> : null}
        {hasUnreleasedSourcePrice ? <p className="mb-3 text-[.68rem] font-semibold uppercase tracking-[0.12em] text-premium-bronze">Tabellenpreis · nicht als Verkaufspreis freigegeben</p> : null}
        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
          <h2 className={`min-w-0 break-words font-display font-medium leading-tight tracking-[-0.02em] text-premium-ink ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}><Link href={href} className="rounded-sm underline-offset-4 transition hover:text-premium-bronze hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">{displayTitle}</Link></h2>
          <CommercePrice status={lowestPrice ? (hasUnreleasedSourcePrice ? "fixed" : "from") : product.priceStatus} price={lowestPrice?.price ?? null} minimumQuantity={lowestPrice?.minimumQuantity} unitLabel={product.quantity.unitLabel} className="shrink-0" />
        </div>
        {articleNumbers.length && compact ? <p className="mt-2 text-xs font-medium text-premium-charcoal">Art.-Nr. {articleNumbers.join(" / ")}</p> : null}
        <p className="mt-4 max-w-xl flex-1 text-sm leading-7 text-premium-muted">{product.shortDescription}</p>
        <Link href={href} className="btn-primary mt-6 w-fit px-6 py-2.5 text-sm">{ctaLabel}</Link>
      </div>
    </article>
  );
}

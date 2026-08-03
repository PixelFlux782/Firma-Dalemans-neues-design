import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const usesContainedProductImage =
    product.categoryId === "stapelstuehle" ||
    product.categoryId === "klapptische" ||
    product.categoryId === "transportwagen-zubehoer";

  return (
    <article className="premium-card premium-card-hover image-depth group flex h-full flex-col">
      <div
        className={
          usesContainedProductImage
            ? "relative aspect-[4/3] overflow-hidden bg-premium-warm/40 p-3 md:p-4"
            : "relative h-60 overflow-hidden md:h-64"
        }
      >
        <Image
          src={product.image}
          alt={
            product.imageAlt ??
            `${product.title} für ${product.suitableFor.slice(0, 2).join(" und ")}`
          }
          fill
        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw"
          className={
            usesContainedProductImage
              ? "object-contain p-3 md:p-4"
              : "object-cover"
          }
        />
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="section-eyebrow text-[0.65rem]">{product.categoryName}</p>
        <h3 className="mt-3 font-display text-xl font-medium tracking-[-0.02em] text-premium-ink md:text-2xl">
          {product.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-premium-muted">
          {product.shortDescription}
        </p>

        <p className="sr-only">
          Geeignet für
        </p>
        <p className="sr-only">
          {product.suitableFor.slice(0, 3).join(" · ")}
        </p>

        <ul className="mt-4 space-y-1.5 border-t border-premium-warm pt-4 text-sm text-premium-charcoal/90">
          {product.highlights.slice(0, 2).map((item) => (
            <li key={item} className="flex gap-2 leading-[1.75]">
              <span className="text-premium-sand" aria-hidden>
                —
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={`/produkte/${product.slug}`}
            className="btn-primary px-5 py-2.5 text-sm group-hover:shadow-premium-glow"
          >
            Details ansehen
          </Link>
          <Link
            href={`/kontakt?produkt=${encodeURIComponent(product.title)}`}
            className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
          >
            Anfragen
          </Link>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="premium-card premium-card-hover image-depth group flex h-full flex-col">
      <div className="relative h-60 overflow-hidden md:h-64">
        <Image
          src={product.image}
          alt={`${product.title} für ${product.suitableFor.slice(0, 2).join(" und ")}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <p className="section-eyebrow text-[0.65rem]">{product.categoryName}</p>
        <h3 className="mt-3 font-display text-xl font-medium tracking-[-0.02em] text-premium-ink md:text-2xl">
          {product.title}
        </h3>
        <p className="mt-4 flex-1 text-sm leading-[1.75] text-premium-muted">
          {product.shortDescription}
        </p>

        <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-premium-bronze">
          Geeignet für
        </p>
        <p className="mt-2 text-sm leading-7 text-premium-charcoal/85">
          {product.suitableFor.slice(0, 3).join(" · ")}
        </p>

        <ul className="mt-5 space-y-2 border-t border-premium-warm pt-5 text-sm text-premium-charcoal/90">
          {product.highlights.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-2 leading-[1.75]">
              <span className="text-premium-sand" aria-hidden>
                —
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/produkte/${product.slug}`}
            className="btn-primary px-5 py-2.5 text-sm group-hover:shadow-premium-glow"
          >
            Details ansehen
          </Link>
          <Link
            href="/kontakt"
            className="btn-secondary px-5 py-2.5 text-sm"
          >
            Anfragen
          </Link>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="premium-card premium-card-hover image-zoom-hover group flex h-full flex-col">
      <div className="overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="h-60 w-full object-cover md:h-64"
        />
      </div>

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <p className="section-eyebrow text-[0.65rem]">{product.categoryName}</p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-premium-ink md:text-2xl">
          {product.title}
        </h3>
        <p className="mt-4 flex-1 text-sm leading-7 text-premium-muted">
          {product.shortDescription}
        </p>

        <ul className="mt-5 space-y-2 border-t border-premium-warm pt-5 text-sm text-premium-charcoal/90">
          {product.highlights.slice(0, 2).map((item) => (
            <li key={item} className="flex gap-2 leading-7">
              <span className="text-premium-sand" aria-hidden>
                —
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <Link
            href={`/produkte/${product.slug}`}
            className="btn-primary px-5 py-2.5 text-sm group-hover:shadow-premium-glow"
          >
            Produkt ansehen
          </Link>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import PremiumImagePlaceholder from "@/components/PremiumImagePlaceholder";
import type { ProductCategory } from "@/lib/product-categories";
import { categoryPlaceholders } from "@/lib/category-placeholders";

interface CategoryShowcaseCardProps {
  category: ProductCategory;
  index: number;
}

export default function CategoryShowcaseCard({
  category,
  index,
}: CategoryShowcaseCardProps) {
  const placeholder = categoryPlaceholders[category.id];
  const delayClass =
    index === 1
      ? "animate-fade-up-delay-1"
      : index === 2
        ? "animate-fade-up-delay-2"
        : index === 3
          ? "animate-fade-up-delay-3"
          : "";

  return (
    <Link
      href={`/produkte/kategorien/${category.id}`}
      className={`premium-card premium-card-hover image-zoom-hover group flex flex-col animate-fade-up ${delayClass}`}
    >
      <div className="overflow-hidden">
        <PremiumImagePlaceholder
          label={placeholder.label}
          todoNote={placeholder.todo}
          variant="card"
          className="rounded-none"
        />
      </div>

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <h3 className="text-xl font-semibold tracking-tight text-premium-ink md:text-2xl">
          {category.name}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-premium-muted">
          {category.intro}
        </p>
        {category.highlights[0] ? (
          <p className="mt-4 text-sm text-premium-charcoal/80">
            {category.highlights[0]}
          </p>
        ) : null}
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-premium-gold transition group-hover:gap-3">
          Lösungen entdecken
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

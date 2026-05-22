import Link from "next/link";
import type { ProductCategory } from "@/lib/product-categories";

interface CategoryShowcaseCardProps {
  category: ProductCategory;
  index: number;
}

export default function CategoryShowcaseCard({
  category,
  index,
}: CategoryShowcaseCardProps) {
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
      className={`premium-card premium-card-hover image-depth group flex flex-col animate-fade-up ${delayClass} ${
        index % 2 === 1 ? "md:mt-8" : ""
      }`}
    >
      <div className="overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="h-60 w-full object-cover md:h-64"
        />
      </div>

      <div className="flex flex-1 flex-col p-8 md:p-9 lg:p-10">
        <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink md:text-[1.65rem]">
          {category.name}
        </h3>
        <p className="mt-4 flex-1 text-sm leading-[1.75] text-premium-muted">
          {category.intro}
        </p>
        {category.highlights[0] ? (
          <p className="mt-5 text-sm leading-[1.75] text-premium-charcoal/75">
            {category.highlights[0]}
          </p>
        ) : null}
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-premium-bronze transition duration-300 group-hover:gap-3">
          Lösungen entdecken
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

interface FilterOption { id: string; label: string }

export default function ProductCatalog({ products, filters }: { products: Product[]; filters: FilterOption[] }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const visibleProducts = activeFilter === "all" ? products : products.filter((product) => product.overviewGroup === activeFilter);
  const countFor = (id: string) => id === "all" ? products.length : products.filter((product) => product.overviewGroup === id).length;

  return <>
    <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0" aria-label="Produkte filtern">
      <div className="flex min-w-max gap-2" role="group">
        {filters.map((filter) => {
          const selected = activeFilter === filter.id;
          return <button key={filter.id} type="button" aria-pressed={selected} onClick={() => setActiveFilter(filter.id)} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-forest focus-visible:ring-offset-2 ${selected ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white/80 text-premium-charcoal hover:border-premium-leaf"}`}>
            {filter.label} <span className={selected ? "text-white/70" : "text-premium-muted"}>{countFor(filter.id)}</span>
          </button>;
        })}
      </div>
    </div>
    <p className="mt-5 text-sm text-premium-muted" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? "Produkt" : "Produkte"} angezeigt</p>
    <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {visibleProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
    </div>
  </>;
}

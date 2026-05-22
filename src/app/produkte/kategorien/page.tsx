import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import CtaBanner from "@/components/ui/CtaBanner";
import PremiumImagePlaceholder from "@/components/PremiumImagePlaceholder";
import { categoryPlaceholders } from "@/lib/category-placeholders";
import { productCategories } from "@/lib/product-categories";
import { getProductsByCategory } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Produktkategorien",
  description:
    "Alle Produktkategorien von Dalemans im Überblick: Stapelstühle, Klapptische, Gemeindestühle, Bankettmöbel sowie Transportwagen und Zubehör.",
  path: "/produkte/kategorien",
  keywords: [
    "Produktkategorien",
    "Stapelstühle",
    "Klapptische",
    "Gemeindestühle",
    "Zubehör",
  ],
});

export default function ProductCategoriesPage() {
  return (
    <div className="space-y-20 md:space-y-28">
      <PageHero
        eyebrow="Kategorien"
        title="Das Sortiment nach Raumbedarf geordnet"
        lead="Wählen Sie den Bereich, der zu Ihrer Nutzung passt — von flexibler Bestuhlung bis zu festlichen Sälen und effizienter Logistik."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Produkte", href: "/produkte" },
          { label: "Kategorien" },
        ]}
        actions={
          <>
            <Link href="/kontakt" className="btn-primary text-center">
              Beratung anfragen
            </Link>
            <Link href="/produkte" className="btn-secondary text-center">
              Zur Produktübersicht
            </Link>
          </>
        }
      />

      <section className="space-y-8">
        {productCategories.map((category) => {
          const categoryProducts = getProductsByCategory(category.id);
          const placeholder = categoryPlaceholders[category.id];

          return (
            <article
              key={category.id}
              className="premium-card premium-card-hover overflow-hidden"
            >
              <div className="grid lg:grid-cols-[minmax(280px,0.95fr)_1.05fr]">
                <div className="image-zoom-hover overflow-hidden">
                  <PremiumImagePlaceholder
                    label={placeholder.label}
                    todoNote={placeholder.todo}
                    variant="editorial"
                    className="min-h-[240px] rounded-none lg:min-h-full"
                  />
                </div>

                <div className="flex flex-col p-8 md:p-10">
                  <p className="section-eyebrow text-[0.65rem]">
                    {categoryProducts.length} Produkte
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-premium-ink md:text-3xl">
                    {category.name}
                  </h2>
                  <p className="mt-4 flex-1 text-sm leading-7 text-premium-muted md:text-base md:leading-8">
                    {category.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {categoryProducts.slice(0, 4).map((product) => (
                      <span
                        key={product.slug}
                        className="rounded-full border border-premium-beige/60 bg-premium-canvas/80 px-3 py-1.5 text-xs text-premium-muted"
                      >
                        {product.title}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8">
                    <Link
                      href={`/produkte/kategorien/${category.id}`}
                      className="btn-primary"
                    >
                      Kategorie öffnen
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <CtaBanner
        title="Unsicher, welche Kategorie passt?"
        lead="Beschreiben Sie Ihren Raum und Ihre Nutzung — wir empfehlen Modelle, Zubehör und ein stimmiges Gesamtkonzept."
        primaryHref="/kontakt"
        primaryLabel="Beratung anfragen"
        secondaryHref="/produkte"
        secondaryLabel="Alle Produkte"
      />
    </div>
  );
}

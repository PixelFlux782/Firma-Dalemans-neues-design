import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { categoryPlaceholders } from "@/lib/category-placeholders";
import { getProductCategoryById } from "@/lib/product-categories";
import { getProductsByCategory, type ProductCategoryId } from "@/lib/products";

interface ProductCategoryOverviewProps {
  categoryId: ProductCategoryId;
}

export default function ProductCategoryOverview({
  categoryId,
}: ProductCategoryOverviewProps) {
  const category = getProductCategoryById(categoryId);

  if (!category) {
    return null;
  }

  const categoryProducts = getProductsByCategory(category.id);
  const placeholder = categoryPlaceholders[category.id];

  return (
    <div className="page-stack">
      <CinematicPageHero
        eyebrow={category.name}
        title={`Lösungen für ${category.name.toLowerCase()}`}
        lead={category.description}
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Produkte", href: "/produkte" },
          { label: "Kategorien", href: "/produkte/kategorien" },
          { label: category.name },
        ]}
        mediaAriaLabel={placeholder.ariaLabel}
        mood={placeholder.mood}
        actions={
          <>
            <Link href="/kontakt" className="btn-hero-primary text-center">
              Diese Kategorie anfragen
            </Link>
            <Link
              href="/produkte/kategorien"
              className="btn-hero-secondary text-center"
            >
              Alle Kategorien
            </Link>
          </>
        }
        visual={
          <img
            src={category.image}
            alt={category.name}
            className="min-h-[220px] w-full object-cover sm:min-h-[260px] md:min-h-[280px]"
          />
        }
      />

      <HomeSection>
        <SectionHeader
          eyebrow="Überblick"
          title="Was diese Lösungswelt auszeichnet"
          lead="Kompakte Orientierung zu Umfang, Merkmalen und typischen Einsatzbereichen — ruhig strukturiert statt als Produktkatalog."
          align="editorial"
        />

        <div className="section-grid-top grid gap-5 md:grid-cols-3 lg:gap-6">
          <article className="premium-card premium-card-hover animate-fade-up p-7 md:p-8">
            <span
              className="mb-4 block h-px w-8 bg-gradient-to-r from-premium-bronze/50 to-transparent"
              aria-hidden
            />
            <p className="section-eyebrow text-[0.65rem]">Umfang</p>
            <p className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-premium-ink">
              {categoryProducts.length}
            </p>
            <p className="mt-3 text-sm leading-[1.75] text-premium-muted">
              Modelle mit eigener Detailseite — persönlich beraten und auf Ihre
              Nutzung abgestimmt.
            </p>
          </article>

          <article className="premium-card premium-card-hover animate-fade-up animate-fade-up-delay-1 rounded-4xl border border-premium-beige/50 bg-gradient-to-br from-premium-warm to-premium-canvas/80 p-7 md:p-8">
            <span
              className="mb-4 block h-px w-8 bg-gradient-to-r from-premium-bronze/50 to-transparent"
              aria-hidden
            />
            <p className="section-eyebrow text-[0.65rem]">Merkmale</p>
            <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-premium-muted">
              {category.highlights.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="premium-card premium-card-hover animate-fade-up animate-fade-up-delay-2 rounded-4xl bg-premium-ink p-7 text-premium-canvas md:p-8">
            <span
              className="mb-4 block h-px w-8 bg-gradient-to-r from-premium-sand/60 to-transparent"
              aria-hidden
            />
            <p className="section-eyebrow text-[0.65rem] text-premium-sand">
              Einsatzbereiche
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-white/75">
              {category.useCases.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Modelle"
          title="Produkte in dieser Kategorie"
          lead="Alle Modelle mit Detailseiten, Einsatzgebieten und direktem Kontakt zur Beratung."
          href="/kontakt"
          linkLabel="Beratung zur Auswahl"
          align="editorial"
        />

        <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {categoryProducts.map((product, index) => (
            <div
              key={product.slug}
              className={[
                "animate-fade-up",
                index === 1 && "animate-fade-up-delay-1",
                index === 2 && "animate-fade-up-delay-2",
                index === 3 && "animate-fade-up-delay-3",
                index === 4 && "animate-fade-up-delay-1",
                index === 5 && "animate-fade-up-delay-2",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </HomeSection>

      <PremiumCtaSection
        eyebrow="Beratung"
        title={`Planen Sie Bestuhlung mit ${category.name}?`}
        lead="Wir helfen bei Modellauswahl, Stückzahlen, Zubehör und Raumwirkung — persönlich und auf Ihre Nutzung abgestimmt."
        primaryHref="/kontakt"
        primaryLabel="Projekt besprechen"
        secondaryHref="/produkte"
        secondaryLabel="Weitere Produkte"
      />
    </div>
  );
}

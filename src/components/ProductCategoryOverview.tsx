import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/home/SectionHeader";
import PageHero from "@/components/ui/PageHero";
import CtaBanner from "@/components/ui/CtaBanner";
import InfoPanel from "@/components/ui/InfoPanel";
import PremiumImagePlaceholder from "@/components/PremiumImagePlaceholder";
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
    <div className="space-y-20 md:space-y-28">
      <PageHero
        eyebrow={category.name}
        title={`Lösungen für ${category.name.toLowerCase()}`}
        lead={category.description}
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Produkte", href: "/produkte" },
          { label: "Kategorien", href: "/produkte/kategorien" },
          { label: category.name },
        ]}
        actions={
          <>
            <Link href="/kontakt" className="btn-primary text-center">
              Diese Kategorie anfragen
            </Link>
            <Link
              href="/produkte/kategorien"
              className="btn-secondary text-center"
            >
              Alle Kategorien
            </Link>
          </>
        }
        visual={
          <PremiumImagePlaceholder
            label={placeholder.label}
            todoNote={placeholder.todo}
            variant="editorial"
            className="min-h-[320px]"
          />
        }
      />

      <section className="grid gap-6 md:grid-cols-3">
        <InfoPanel title="Produktanzahl" variant="warm">
          <p className="text-3xl font-semibold tracking-tight text-premium-ink">
            {categoryProducts.length}
          </p>
          <p className="mt-2">
            Modelle in dieser Kategorie mit eigener Detailseite und Beratung.
          </p>
        </InfoPanel>

        <InfoPanel title="Wichtige Merkmale">
          <ul className="space-y-3">
            {category.highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-premium-sand" aria-hidden>
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </InfoPanel>

        <InfoPanel title="Typische Einsatzbereiche" variant="dark">
          <ul className="space-y-3">
            {category.useCases.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-premium-sand" aria-hidden>
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </InfoPanel>
      </section>

      <section className="space-y-10 md:space-y-12">
        <SectionHeader
          eyebrow="Modelle"
          title="Produkte in dieser Kategorie"
          lead="Alle Modelle mit Detailseiten, Einsatzgebieten und direktem Kontakt zur Beratung."
          href="/kontakt"
          linkLabel="Beratung zur Auswahl"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <CtaBanner
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

import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryShowcaseCard from "@/components/home/CategoryShowcaseCard";
import SectionHeader from "@/components/home/SectionHeader";
import PageHero from "@/components/ui/PageHero";
import CtaBanner from "@/components/ui/CtaBanner";
import PremiumImagePlaceholder from "@/components/PremiumImagePlaceholder";
import { productCategories } from "@/lib/product-categories";
import { getProductsByCategory, products } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

const featuredProducts = products.slice(0, 6);

export const metadata: Metadata = buildMetadata({
  title: "Produkte",
  description:
    "Entdecken Sie das Sortiment von Dalemans mit Stapelstühlen, Klapptischen, Gemeindestühlen, Bankettmöbeln sowie Transportwagen und Zubehör.",
  path: "/produkte",
  keywords: [
    "Produkte Dalemans",
    "Stapelstühle",
    "Klapptische",
    "Gemeindestühle",
    "Transportwagen",
  ],
});

export default function ProductsPage() {
  return (
    <div className="space-y-20 md:space-y-28">
      <PageHero
        eyebrow="Produktübersicht"
        title="Möbel und Raumlösungen für flexible Begegnungsorte"
        lead="Stapelstühle, Klapptische, Gemeindestühle und Zubehör — klar gegliedert, damit Sie schnell die passende Lösung für Nutzung, Raumgröße und Atmosphäre finden."
        breadcrumbs={[{ label: "Start", href: "/" }, { label: "Produkte" }]}
        actions={
          <>
            <Link href="/produkte/kategorien" className="btn-primary text-center">
              Kategorien ansehen
            </Link>
            <Link href="/kontakt" className="btn-secondary text-center">
              Beratung anfragen
            </Link>
          </>
        }
        visual={
          <PremiumImagePlaceholder
            label="Sortiment — Raumübersicht"
            todoNote="TODO: Premium-Produktübersicht Bild"
            variant="editorial"
          />
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productCategories.map((category) => {
          const count = getProductsByCategory(category.id).length;

          return (
            <Link
              key={category.id}
              href={`/produkte/kategorien/${category.id}`}
              className="premium-card premium-card-hover p-6"
            >
              <p className="section-eyebrow text-[0.65rem]">{category.name}</p>
              <p className="mt-3 text-sm leading-7 text-premium-muted">
                {category.intro}
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-premium-subtle">
                {count} Modelle
              </p>
            </Link>
          );
        })}
      </section>

      <section className="space-y-10 md:space-y-12">
        <SectionHeader
          eyebrow="Lösungswelten"
          title="Vier Bereiche — ein durchdachtes Gesamtkonzept"
          lead="Editorial inszeniert: jede Kategorie mit Nutzen, Einsatzbereichen und direktem Einstieg."
          href="/produkte/kategorien"
          linkLabel="Alle Kategorien"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {productCategories.map((category, index) => (
            <CategoryShowcaseCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      </section>

      <section className="space-y-10 md:space-y-12">
        <SectionHeader
          eyebrow="Ausgewählte Lösungen"
          title="Produkte, die im Raum überzeugen"
          lead="Beispielmodelle aus dem Sortiment — mit Details, Einsatzgebieten und persönlicher Beratung."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <CtaBanner
        title="Gemeinsam die passende Lösung für Ihren Raum finden"
        lead="Wir stimmen Produkte, Zubehör und Einsatzbereiche auf Ihre Nutzung ab — ruhig, persönlich und mit Blick auf Raumwirkung."
        primaryHref="/kontakt"
        primaryLabel="Projekt besprechen"
        secondaryHref="/produkte/kategorien"
        secondaryLabel="Kategorien öffnen"
        dark={false}
      />
    </div>
  );
}

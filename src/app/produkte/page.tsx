import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryShowcaseCard from "@/components/home/CategoryShowcaseCard";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
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
    <div className="page-stack">
      <CinematicPageHero
        eyebrow="Produktübersicht"
        title="Stapelstühle, Klapptische und Zubehör nach Einsatz geordnet"
        lead="Finden Sie schnell passende Modelle für Gemeindesaal, Seminarraum, Verein oder Veranstaltung: mit Einsatzbereichen, Vorteilen und direktem Weg zur Beratung."
        breadcrumbs={[{ label: "Start", href: "/" }, { label: "Produkte" }]}
        mediaAriaLabel="Sortiment — atmosphärische Raumkomposition"
        mood="stone-arch"
        actions={
          <>
            <Link href="/produkte/kategorien" className="btn-hero-primary text-center">
              Kategorien ansehen
            </Link>
            <Link href="/kontakt" className="btn-hero-secondary text-center">
              Beratung anfragen
            </Link>
          </>
        }
        visual={
          <Image
            src={encodeURI("/pictures/Produkte/Stühle/1021c-01.jpg")}
            alt="Stapelstuhl als Ausgangspunkt der DLMNS Produktauswahl"
            width={760}
            height={500}
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="min-h-[240px] w-full object-cover sm:min-h-[300px] md:min-h-[360px]"
          />
        }
      />

      <HomeSection>
        <SectionHeader
          eyebrow="Schnellwahl"
          title="Vier Lösungswelten — ein Gesamtkonzept"
          lead="Kompakte Orientierung nach Kategorie — mit direktem Einstieg in Modelle und Einsatzbereiche."
          align="editorial"
        />

        <div className="section-grid-top grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {productCategories.map((category, index) => {
            const count = getProductsByCategory(category.id).length;

            return (
              <Link
                key={category.id}
                href={`/produkte/kategorien/${category.id}`}
                className={[
                  "premium-card premium-card-hover animate-fade-up p-7 md:p-8",
                  index === 1 && "animate-fade-up-delay-1",
                  index === 2 && "animate-fade-up-delay-2",
                  index === 3 && "animate-fade-up-delay-3",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className="mb-4 block h-px w-8 bg-gradient-to-r from-premium-bronze/50 to-transparent"
                  aria-hidden
                />
                <p className="section-eyebrow text-[0.65rem]">{category.name}</p>
                <p className="mt-3 text-sm leading-[1.75] text-premium-muted">
                  {category.intro}
                </p>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-premium-subtle">
                  {count} Modelle
                </p>
              </Link>
            );
          })}
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Lösungswelten"
          title="Vier Bereiche — ein durchdachtes Gesamtkonzept"
          lead="Jede Kategorie mit Nutzen, Einsatzbereichen und direktem Einstieg in passende Modelle."
          href="/produkte/kategorien"
          linkLabel="Alle Kategorien"
          align="editorial"
        />

        <div className="section-grid-top grid gap-8 md:grid-cols-2 lg:gap-10">
          {productCategories.map((category, index) => (
            <CategoryShowcaseCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Ausgewählte Lösungen"
          title="Produkte, die im Raum überzeugen"
          lead="Beispielmodelle aus dem Sortiment — mit Details, Einsatzgebieten und persönlicher Beratung."
        />

        <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product, i) => (
            <div
              key={product.slug}
              className={`animate-fade-up ${i === 1 ? "animate-fade-up-delay-1" : i === 2 ? "animate-fade-up-delay-2" : i === 3 ? "animate-fade-up-delay-3" : i === 4 ? "animate-fade-up-delay-1" : i === 5 ? "animate-fade-up-delay-2" : ""}`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </HomeSection>

      <PremiumCtaSection
        eyebrow="Beratung"
        title="Gemeinsam die passende Lösung für Ihren Raum finden"
        lead="Wir stimmen Produkte, Zubehör und Einsatzbereiche auf Ihre Nutzung ab — ruhig, persönlich und mit Blick auf Raumwirkung."
        primaryHref="/kontakt"
        primaryLabel="Projekt besprechen"
        secondaryHref="/produkte/kategorien"
        secondaryLabel="Kategorien öffnen"
      />
    </div>
  );
}

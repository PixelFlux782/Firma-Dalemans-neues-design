import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CategoryShowcaseCard from "@/components/home/CategoryShowcaseCard";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { productCategories } from "@/lib/product-categories";
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
    <div className="page-stack">
      <CinematicPageHero
        eyebrow="Kategorien"
        title="Das Sortiment nach Raumbedarf geordnet"
        lead="Wählen Sie den Bereich, der zu Ihrer Nutzung passt — von flexibler Bestuhlung bis zu festlichen Sälen und effizienter Logistik."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Produkte", href: "/produkte" },
          { label: "Kategorien" },
        ]}
        mediaAriaLabel="Produktkategorien — atmosphärische Raumkomposition"
        mood="stone-arch"
        actions={
          <>
            <Link href="/kontakt" className="btn-hero-primary text-center">
              Beratung anfragen
            </Link>
            <Link href="/produkte" className="btn-hero-secondary text-center">
              Zur Produktübersicht
            </Link>
          </>
        }
        visual={
          <Image
            src={encodeURI("/pictures/Produkte/Stühle/Stapelstuhl_Stapelstuhle_Stapelstuehle_Buende_01.jpg")}
            alt="Stapelstühle als DLMNS Kategorieauswahl"
            width={760}
            height={500}
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="min-h-[240px] w-full object-cover sm:min-h-[300px] md:min-h-[360px]"
          />
        }
      />

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Lösungswelten"
          title="Vier Bereiche — ein durchdachtes Gesamtkonzept"
          lead="Jede Kategorie mit Nutzen, Einsatzbereichen und direktem Einstieg in die Modelle."
          href="/produkte"
          linkLabel="Zur Produktübersicht"
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

      <PremiumCtaSection
        eyebrow="Beratung"
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

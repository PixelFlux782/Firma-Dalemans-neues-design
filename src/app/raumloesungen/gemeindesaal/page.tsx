import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { StructuredData } from "@/components/StructuredData";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { products } from "@/lib/products";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

const fittingProducts = ["klapptisch-310c", "stuhltransportwagen"]
  .map((slug) => products.find((product) => product.slug === slug))
  .filter(Boolean);

const planningPoints = [
  "Bestuhlungsarten: Gottesdienst, Vortrag, Essen, Gruppenarbeit",
  "Stapel- und Lagerflächen für Stühle, Tische und Wagen",
  "Reihenverbindung, Buchablage, Gleiter und Bodenschutz",
  "Umbauwege für Ehrenamt, Hausmeisterteam oder Veranstaltungsdienst",
  "Erweiterbarkeit bei wachsenden Besucherzahlen",
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Gemeindesaal Ausstattung planen",
  provider: {
    "@type": "LocalBusiness",
    name: "Dalemans Stapelstühle & Klapptische",
    url: absoluteUrl("/"),
  },
  areaServed: "DE",
  serviceType: "Raumlösung für Gemeindesaal",
  url: absoluteUrl("/raumloesungen/gemeindesaal"),
};

export const metadata: Metadata = buildMetadata({
  title: "Gemeindesaal einrichten mit Stapelstühlen und Klapptischen",
  description:
    "Raumlösung für Gemeindesäle: Stapelstühle, Gemeindestühle, Klapptische, Zubehör, Transportwagen und Beratung für flexible Nutzung.",
  path: "/raumloesungen/gemeindesaal",
  image: "/pictures/Über uns/Realisierte-11.jpg",
  keywords: [
    "Gemeindesaal einrichten",
    "Gemeindestühle",
    "Stapelstühle Gemeindesaal",
    "Klapptische Gemeinde",
    "Kirchenstuhl",
  ],
});

export default function GemeindesaalPage() {
  return (
    <div className="page-stack">
      <StructuredData data={structuredData} />

      <CinematicPageHero
        eyebrow="Raumlösung"
        title="Gemeindesaal einrichten: Bestuhlung, Tische und Zubehör als System."
        lead="Für Gottesdienst, Feiern, Seminare und Begegnung braucht ein Gemeindesaal Möbel, die gut aussehen, lange halten und schnell umgebaut werden können."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Räume & Planung", href: "/raeume-planung" },
          { label: "Gemeindesaal" },
        ]}
        breadcrumbPath="/raumloesungen/gemeindesaal"
        mediaAriaLabel="Gemeindesaal mit flexibler Bestuhlung"
        mood="stone-arch"
        actions={
          <>
            <Link href="/kontakt" className="btn-hero-primary text-center">
              Gemeindesaal besprechen
            </Link>
            <Link href="/produkte" className="btn-hero-secondary text-center">
              Produkte ansehen
            </Link>
          </>
        }
        visual={
          <Image
            src={encodeURI("/pictures/Über uns/Realisierte-11.jpg")}
            alt="Realisierte Bestuhlung für Gemeindesaal"
            width={760}
            height={500}
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="min-h-[240px] w-full object-cover md:min-h-[300px]"
          />
        }
      />

      <HomeSection>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">Planungslogik</p>
            <h2 className="section-title mt-5 text-balance">
              Nicht nur Stühle kaufen, sondern Abläufe klären.
            </h2>
            <p className="section-lead mt-6">
              Gute Gemeindemöbel müssen Gottesdienst, Alltag, Feiern und Lagerung
              zusammenbringen. Deshalb beraten wir zu Stückzahlen, Reihenbild,
              Tischformen, Zubehör und Transport.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {planningPoints.map((point) => (
              <div key={point} className="premium-card p-6">
                <span className="block h-px w-8 bg-premium-sand" aria-hidden />
                <p className="mt-4 text-sm leading-7 text-premium-muted">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Passende Produkte"
          title="Bewährte Einstiegskombinationen für Gemeindesäle"
          lead="Stapelstuhl, Klapptisch und Transportlösung bilden oft die stabile Basis."
          align="editorial"
        />
        <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <article className="premium-card overflow-hidden">
            <Image src={encodeURI("/images/curated/Stapelstühle/1021c.webp")} alt="Stapelstuhl Modell 1021" width={720} height={620} sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw" className="h-72 w-full bg-premium-warm/60 object-contain p-5" />
            <div className="p-6">
              <p className="section-eyebrow">Stapelstühle</p>
              <h3 className="mt-3 font-display text-2xl font-medium text-premium-ink">Fünf Modelle vergleichen</h3>
              <p className="mt-3 text-sm leading-7 text-premium-muted">Polsterung, Stoffgruppe und Reihenverbindung passend zum Raum konfigurieren.</p>
              <Link href="/produkte/stapelstuehle" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest">Stapelstühle ansehen →</Link>
            </div>
          </article>
          {fittingProducts.map((product) =>
            product ? <ProductCard key={product.slug} product={product} /> : null,
          )}
        </div>
      </HomeSection>

      <PremiumCtaSection
        title="Planen wir Ihren Gemeindesaal konkret."
        lead="Raumgröße, gewünschte Personenzahl und vorhandene Möbel reichen für eine erste Einschätzung."
        primaryHref="/kontakt"
        primaryLabel="Beratung anfragen"
        secondaryHref="/produkte/stapelstuehle"
        secondaryLabel="Stapelstühle ansehen"
      />
    </div>
  );
}

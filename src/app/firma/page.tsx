import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { absoluteUrl, buildMetadata, siteName } from "@/lib/seo";

const strengths = [
  {
    title: "Familienbetrieb mit Haltung",
    text:
      "Persönliche Verantwortung, direkte Ansprechpartner und ehrliche Beratung statt anonymer Abwicklung.",
  },
  {
    title: "Über 50 Jahre Erfahrung",
    text:
      "Langjährige Praxis in der Möbelwelt — mit tiefem Verständnis für Gemeinden, Vereine und Veranstaltungsorte.",
  },
  {
    title: "Sonderlösungen mit System",
    text:
      "Individuelle Entwicklung mit 3D-CAD, abgestimmt auf reale Räume und konkrete Nutzungsszenarien.",
  },
  {
    title: "Fokus auf Alltagstauglichkeit",
    text:
      "Robuste Möbel, einfache Handhabung, gute Stapelbarkeit — für verlässliche Nutzung über viele Jahre.",
  },
] as const;

const milestones = [
  {
    title: "Gegründet von Hubert Dalemans",
    text:
      "Aus handwerklich geprägter Arbeit entstand ein spezialisierter Anbieter für Stapelstühle, Klapptische und Gemeindemobiliar.",
  },
  {
    title: "Heute geführt von Stefan Dalemans",
    text:
      "Die nächste Generation führt das Unternehmen weiter — nahbar, verbindlich und lösungsorientiert.",
  },
  {
    title: "Verwurzelung im Gemeindebereich",
    text:
      "Besondere Nähe zu Freikirchen und Gemeinden prägt unser Verständnis für den Alltag und festliche Anlässe.",
  },
] as const;

const clientBenefits = [
  "Robuste Konstruktionen für häufige Nutzung",
  "Stapelbare und klappbare Lösungen für flexible Räume",
  "Zubehör für geordnete Reihen und einfacheren Transport",
  "Individuelle Abstimmung auf Raumgröße und Nutzung",
  "Persönliche Beratung statt unübersichtlicher Massenkataloge",
] as const;

export const metadata: Metadata = buildMetadata({
  title: "Firma Dalemans",
  description:
    "Erfahren Sie mehr über Dalemans als Familienunternehmen mit langjähriger Erfahrung, persönlicher Beratung und Sonderlösungen für Gemeinden und Veranstaltungsräume.",
  path: "/firma",
  keywords: [
    "Dalemans",
    "Familienunternehmen",
    "Gemeindemobiliar",
    "Sonderlösungen",
    "3D CAD",
  ],
});

const firmaStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: siteName,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/pictures/Über uns/dalemans_logo1.png"),
      image: absoluteUrl("/pictures/Über uns/Passbild_Stefan_F_edit.jpg"),
      description:
        "Dalemans ist ein Familienunternehmen für Stapelstühle, Klapptische, Gemeindestühle, Bankettmöbel sowie individuelle Lösungen für Gemeinden, Säle und Veranstaltungsräume.",
      email: "info@dalemans.de",
      telephone: "+49 9342 9153-53",
      vatID: "DE161952944",
      foundingDate: "1965",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bollenwaldstraße 108a",
        postalCode: "63743",
        addressLocality: "Aschaffenburg",
        addressCountry: "DE",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: "+49 9342 9153-53",
          email: "info@dalemans.de",
          areaServed: "DE",
          availableLanguage: ["de"],
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: "+49 170 5555331",
          email: "info@dalemans.de",
          areaServed: "DE",
          availableLanguage: ["de"],
        },
      ],
      knowsAbout: [
        "Stapelstühle",
        "Klapptische",
        "Gemeindestühle",
        "Bankettmöbel",
        "Transportwagen",
        "Sonderlösungen",
      ],
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: absoluteUrl("/"),
      name: siteName,
      publisher: {
        "@id": absoluteUrl("/#organization"),
      },
    },
    {
      "@type": "AboutPage",
      "@id": absoluteUrl("/firma#webpage"),
      url: absoluteUrl("/firma"),
      name: "Firma Dalemans",
      description:
        "Informationen über Dalemans als Familienunternehmen mit langjähriger Erfahrung, persönlicher Beratung und individuellen Lösungen.",
      isPartOf: {
        "@id": absoluteUrl("/#website"),
      },
      about: {
        "@id": absoluteUrl("/#organization"),
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: absoluteUrl("/pictures/Über uns/Werkstatt-23.jpg"),
      },
    },
  ],
};

export default function FirmaPage() {
  return (
    <div className="page-stack">
      <StructuredData data={firmaStructuredData} />

      <CinematicPageHero
        eyebrow="Über Dalemans"
        title="Ein Familienunternehmen für langlebige Räume und ehrliche Beratung"
        lead="Über Jahrzehnte gewachsene Erfahrung, Nähe zu Gemeinden und Kirchen sowie der Anspruch, praktische und verlässliche Raumlösungen zu liefern — nicht beliebige Standardware."
        breadcrumbs={[{ label: "Start", href: "/" }, { label: "Firma" }]}
        mediaAriaLabel="Familienunternehmen — emotionale Markenkomposition"
        mood="espresso-lounge"
        actions={
          <>
            <Link href="/kontakt" className="btn-hero-primary text-center">
              Kontakt aufnehmen
            </Link>
            <Link href="/produkte" className="btn-hero-secondary text-center">
              Produkte ansehen
            </Link>
          </>
        }
        visual={
          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src={encodeURI("/pictures/Über uns/Passbild_Stefan_F_edit.jpg")}
              alt="Stefan Dalemans"
              className="min-h-[200px] w-full object-cover object-top md:min-h-[240px]"
            />
            <img
              src={encodeURI("/pictures/Über uns/Werkstatt-23.jpg")}
              alt="Werkstatt und Produktion bei Dalemans"
              className="min-h-[200px] w-full object-cover md:min-h-[240px]"
            />
          </div>
        }
      />

      <HomeSection>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {strengths.map((item, index) => (
            <article
              key={item.title}
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
              <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-[1.75] text-premium-muted">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </HomeSection>

      <section className="relative overflow-hidden rounded-6xl bg-premium-espresso text-premium-canvas shadow-premium-xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_50%,rgba(196,165,116,0.12),transparent_55%)]"
          aria-hidden
        />
        <div className="grid lg:grid-cols-2">
          <div className="relative flex flex-col justify-center px-8 py-14 md:px-14 md:py-20 lg:px-16">
            <p className="section-eyebrow text-premium-sand">Individuelle Lösungen</p>
            <h2 className="font-display mt-5 text-3xl font-medium leading-[1.12] tracking-[-0.02em] md:text-4xl lg:text-[2.75rem]">
              Nicht nur Handel — Entwicklung und Planung
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-[1.8] text-white/72 md:text-base">
              Für besondere Anforderungen entstehen Sonderlösungen mit 3D-CAD,
              abgestimmt auf konkrete Nutzung — Lagerung, Transport, Reihenordnung
              und ein stimmiges Gesamtbild.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="image-depth overflow-hidden rounded-4xl shadow-premium">
                <img
                  src={encodeURI("/pictures/Über uns/CAD-Entwicklung1zu1.png")}
                  alt="CAD Entwicklung und Sonderlösungen"
                  className="h-40 w-full object-cover md:h-44"
                />
              </div>
              <div className="image-depth overflow-hidden rounded-4xl shadow-premium">
                <img
                  src={encodeURI("/pictures/Über uns/Technische-03.jpg")}
                  alt="Technische Entwicklung bei Dalemans"
                  className="h-40 w-full object-cover md:h-44"
                />
              </div>
            </div>
            <div className="mt-10">
              <Link href="/kontakt" className="btn-on-dark text-center">
                Projekt besprechen
              </Link>
            </div>
          </div>

          <div className="image-depth relative min-h-[360px] overflow-hidden lg:min-h-[520px]">
            <img
              src={encodeURI("/pictures/Über uns/Werkstatt-24.jpg")}
              alt="Werkstatt und Entwicklung bei Dalemans"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-premium-espresso via-premium-espresso/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-premium-espresso/30 lg:to-premium-espresso"
              aria-hidden
            />
          </div>
        </div>
      </section>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Unternehmensgeschichte"
          title="Gewachsen über Generationen"
          lead="Von den Wurzeln bis zur heutigen Beratung — mit Konstanten: Qualität, Nähe und Raumverständnis."
          align="editorial"
        />

        <div className="section-grid-top grid gap-6 md:grid-cols-3 lg:gap-8">
          {milestones.map((item, index) => (
            <article
              key={item.title}
              className={[
                "premium-card premium-card-hover animate-fade-up p-7 md:p-8",
                index === 1 && "animate-fade-up-delay-1",
                index === 2 && "animate-fade-up-delay-2",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className="mb-4 block h-px w-8 bg-gradient-to-r from-premium-bronze/50 to-transparent"
                aria-hidden
              />
              <h3 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.75] text-premium-muted">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col justify-center lg:py-4">
            <p className="section-eyebrow">Was Kunden wichtig ist</p>
            <h2 className="section-title mt-5 text-balance">
              Möbel, die im Alltag funktionieren
            </h2>
            <p className="section-lead mt-6">
              Belastbare, erprobte Lösungen für Stapelstühle, Klapptische und
              Zubehör — entscheidend ist, dass Produkte im echten Betrieb
              zuverlässig bleiben.
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-[1.75] text-premium-muted">
              {clientBenefits.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5">
            <div className="image-depth overflow-hidden rounded-5xl shadow-premium">
              <img
                src={encodeURI("/pictures/Über uns/Realisierte-11.jpg")}
                alt="Realisierte Bestuhlung von Dalemans"
                className="h-[220px] w-full object-cover md:h-[260px]"
              />
            </div>
            <div className="image-depth overflow-hidden rounded-5xl shadow-premium">
              <img
                src={encodeURI("/pictures/Über uns/Realisierte-05.jpg")}
                alt="Bestuhlungsprojekt von Dalemans"
                className="h-[220px] w-full object-cover md:h-[260px]"
              />
            </div>
          </div>
        </div>
      </HomeSection>

      <PremiumCtaSection
        eyebrow="Persönliche Beratung"
        title="Lernen wir Ihren Raum kennen"
        lead="Ob Neubestuhlung oder Erweiterung — wir beraten persönlich zu Produkten, Sonderlösungen und Raumwirkung."
        primaryHref="/kontakt"
        primaryLabel="Projekt besprechen"
        secondaryHref="/produkte"
        secondaryLabel="Sortiment entdecken"
      />
    </div>
  );
}

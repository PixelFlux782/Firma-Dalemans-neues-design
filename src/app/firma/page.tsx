import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import SectionHeader from "@/components/home/SectionHeader";
import PageHero from "@/components/ui/PageHero";
import CtaBanner from "@/components/ui/CtaBanner";
import InfoPanel from "@/components/ui/InfoPanel";
import PremiumImagePlaceholder from "@/components/PremiumImagePlaceholder";
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
    <div className="space-y-20 md:space-y-28">
      <StructuredData data={firmaStructuredData} />

      <PageHero
        eyebrow="Über Dalemans"
        title="Ein Familienunternehmen für langlebige Räume und ehrliche Beratung"
        lead="Über Jahrzehnte gewachsene Erfahrung, Nähe zu Gemeinden und Kirchen sowie der Anspruch, praktische und verlässliche Raumlösungen zu liefern — nicht beliebige Standardware."
        breadcrumbs={[{ label: "Start", href: "/" }, { label: "Firma" }]}
        actions={
          <>
            <Link href="/kontakt" className="btn-primary text-center">
              Kontakt aufnehmen
            </Link>
            <Link href="/produkte" className="btn-secondary text-center">
              Produkte ansehen
            </Link>
          </>
        }
        visual={
          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src={encodeURI("/pictures/Über uns/Passbild_Stefan_F_edit.jpg")}
              alt="Stefan Dalemans"
              className="min-h-[280px] w-full rounded-4xl object-cover object-top shadow-premium"
            />
            <img
              src={encodeURI("/pictures/Über uns/Werkstatt-23.jpg")}
              alt="Werkstatt und Produktion bei Dalemans"
              className="min-h-[280px] w-full rounded-4xl object-cover shadow-premium"
            />
          </div>
        }
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {strengths.map((item) => (
          <article key={item.title} className="premium-card p-6 md:p-7">
            <h2 className="text-lg font-semibold tracking-tight text-premium-ink">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-premium-muted">
              {item.text}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-5xl bg-premium-ink text-premium-canvas shadow-premium-lg">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-12 md:px-12 md:py-16">
            <p className="section-eyebrow text-premium-sand">
              Individuelle Lösungen
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Nicht nur Handel — Entwicklung und Planung
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/75 md:text-base md:leading-8">
              Für besondere Anforderungen entstehen Sonderlösungen mit 3D-CAD,
              abgestimmt auf konkrete Nutzung — Lagerung, Transport, Reihenordnung
              und ein stimmiges Gesamtbild.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <img
                src={encodeURI("/pictures/Über uns/CAD-Entwicklung1zu1.png")}
                alt="CAD Entwicklung und Sonderlösungen"
                className="h-40 w-full rounded-4xl object-cover"
              />
              <img
                src={encodeURI("/pictures/Über uns/Technische-03.jpg")}
                alt="Technische Entwicklung bei Dalemans"
                className="h-40 w-full rounded-4xl object-cover"
              />
            </div>
          </div>
          <div className="image-zoom-hover min-h-[320px] lg:min-h-[480px]">
            <PremiumImagePlaceholder
              label="Entwicklung & Sonderbau"
              todoNote="TODO: Premium-Bild Werkstatt / Entwicklung"
              variant="editorial"
              className="min-h-full rounded-none"
            />
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <SectionHeader
          eyebrow="Unternehmensgeschichte"
          title="Gewachsen über Generationen"
          lead="Von den Wurzeln bis zur heutigen Beratung — mit Konstanten: Qualität, Nähe und Raumverständnis."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {milestones.map((item) => (
            <article key={item.title} className="premium-card p-6 md:p-7">
              <h3 className="text-lg font-semibold tracking-tight text-premium-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-premium-muted">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-5xl border border-premium-beige/50 bg-gradient-to-br from-premium-warm via-premium-canvas to-white shadow-premium">
        <div className="grid gap-10 p-8 md:p-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="section-eyebrow">Was Kunden wichtig ist</p>
            <h2 className="section-title mt-4">
              Möbel, die im Alltag funktionieren
            </h2>
            <p className="section-lead mt-5">
              Belastbare, erprobte Lösungen für Stapelstühle, Klapptische und
              Zubehör — entscheidend ist, dass Produkte im echten Betrieb
              zuverlässig bleiben.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-premium-muted">
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

          <div className="grid gap-4">
            <div className="image-zoom-hover overflow-hidden rounded-4xl shadow-premium">
              <img
                src={encodeURI("/pictures/Über uns/Realisierte-11.jpg")}
                alt="Realisierte Bestuhlung von Dalemans"
                className="h-[220px] w-full object-cover md:h-[240px]"
              />
            </div>
            <div className="image-zoom-hover overflow-hidden rounded-4xl shadow-premium">
              <img
                src={encodeURI("/pictures/Über uns/Realisierte-05.jpg")}
                alt="Bestuhlungsprojekt von Dalemans"
                className="h-[220px] w-full object-cover md:h-[240px]"
              />
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
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

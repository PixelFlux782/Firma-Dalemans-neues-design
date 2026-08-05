import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { company, organizationStructuredData } from "@/lib/company";

const strengths = [
  {
    title: "Familienbetrieb mit Haltung",
    text:
      "Persönliche Verantwortung, direkte Ansprechpartner und ehrliche Beratung statt anonymer Abwicklung.",
  },
  {
    title: "Mehr als 30 Jahre Erfahrung",
    text:
      "Seit 1994 begleiten wir Gemeinden, Vereine und Veranstaltungsorte mit persönlicher Beratung und praktischer Planung.",
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
      ...organizationStructuredData,
      image: absoluteUrl("/pictures/Über uns/Passbild_Stefan_F_edit.jpg"),
    },
    {
      "@type": "WebSite",
      "@id": company.websiteId,
      url: absoluteUrl("/"),
      name: company.brandName,
      publisher: {
        "@id": company.organizationId,
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
        "@id": company.websiteId,
      },
      about: {
        "@id": company.organizationId,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: absoluteUrl("/neue bilder/Produktion-Lager/Schalenlager-Montage2.png"),
      },
    },
  ],
};

export default function FirmaPage() {
  return (
    <div className="page-stack">
      <StructuredData data={firmaStructuredData} />

      <section className="products-hero relative -mx-5 min-h-[650px] overflow-hidden sm:-mx-6 md:mx-0 md:min-h-[560px]">
        <div className="products-hero-media absolute inset-0 grid grid-cols-[1.4fr_.6fr]" aria-hidden="true">
          <div className="relative">
            <Image
              src={encodeURI("/neue bilder/Produktion-Lager/Schalenlager-Montage2.png")}
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 850px, 70vw"
              className="object-cover object-[78%_center]"
            />
          </div>
          <div className="relative">
            <Image
              src={encodeURI("/pictures/Über uns/Passbild_Stefan_F_edit.jpg")}
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 366px, 30vw"
              className="object-cover object-top"
            />
          </div>
        </div>
        <div className="products-hero-shade pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-20 flex min-h-[650px] items-end px-5 pb-14 pt-20 sm:px-8 md:min-h-[560px] md:items-center md:px-12 md:py-16 lg:px-16">
          <div className="max-w-[42rem] md:w-[61%]">
            <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Firma" }]} />
            <p className="section-eyebrow mt-7">Über Dalemans</p>
            <h1 className="mt-3 max-w-[17ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Ein Familienunternehmen für langlebige Räume und ehrliche Beratung</h1>
            <p className="mt-4 max-w-[38rem] text-base leading-7 text-premium-muted">1994 von Hubert Dalemans gegründet und heute von Stefan Dalemans geführt: persönliche Beratung, praktische Planung und verlässliche Lösungen für flexible Räume.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kontakt" className="btn-primary px-6 py-3">Kontakt aufnehmen</Link>
              <Link href="/produkte" className="btn-secondary px-6 py-3">Produkte ansehen</Link>
            </div>
          </div>
        </div>
      </section>

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
              Wir entwickeln, planen und vertreiben unsere Modelle. Die Fertigung
              erfolgt in unserem Auftrag gemeinsam mit langjährigen spezialisierten
              Partnerbetrieben. In der eigenen Werkstatt entstehen außerdem
              Anpassungen, Reparaturen und Sonderlösungen.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="image-depth overflow-hidden rounded-4xl shadow-premium">
                <Image
                  src={encodeURI("/neue bilder/Sonderlösungen/Räume-u-Planung.png")}
                  alt="Planung individueller Räume und Sonderlösungen"
                  width={360}
                  height={240}
                  sizes="(min-width: 1024px) 20vw, 50vw"
                  className="h-40 w-full object-cover md:h-44"
                />
              </div>
              <div className="image-depth overflow-hidden rounded-4xl shadow-premium">
                <Image
                  src={encodeURI("/pictures/Über uns/Technische-03.jpg")}
                  alt="Technische Entwicklung bei Dalemans"
                  width={360}
                  height={240}
                  sizes="(min-width: 1024px) 20vw, 50vw"
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
            <Image
              src={encodeURI("/neue bilder/Sonderlösungen/runder-tisch.png")}
              alt="Runder Tisch als individuell geplante Sonderlösung"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
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
          eyebrow="Werkstatt und Partnerfertigung"
          title="Qualität entsteht im Zusammenspiel"
          lead="Wir entwickeln, planen und vertreiben unsere Modelle. Die Fertigung erfolgt in unserem Auftrag gemeinsam mit spezialisierten Partnerbetrieben. Anpassungen, Reparaturen und viele Sonderlösungen begleiten wir über unsere eigene Werkstatt."
          align="editorial"
        />
        <div className="section-grid-top grid gap-5 md:grid-cols-3">
          {[
            { src: "/images/curated/Produktion-Lager/Polster-Montage.webp", alt: "Handarbeit bei der Montage eines Stuhlpolsters" },
            { src: "/images/curated/Produktion-Lager/Schalenlager-Montage.webp", alt: "Stuhlschalen und Bauteile in einem Montagebereich" },
          ].map((image) => (
            <figure key={image.src} className="premium-card overflow-hidden">
              <Image src={encodeURI(image.src)} alt={image.alt} width={720} height={480} sizes="(min-width: 768px) 31vw, 100vw" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="px-6 py-4 text-sm leading-6 text-premium-muted">{image.alt}</figcaption>
            </figure>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Unternehmensgeschichte"
          title="Seit 1994 persönlich begleitet"
          lead="Von der Gründung durch Hubert Dalemans bis zur heutigen Führung durch Stefan Dalemans: persönlich, verlässlich und nah an der Nutzung im Raum."
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
              <Image
                src={encodeURI("/neue bilder/referenz1.png")}
                alt="In eine Bühne integrierter Stauraum für gepolsterte Stühle"
                width={720}
                height={360}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-[220px] w-full object-cover md:h-[260px]"
              />
            </div>
            <div className="image-depth overflow-hidden rounded-5xl shadow-premium">
              <Image
                src={encodeURI("/neue bilder/referenz2.png")}
                alt="Kirchenraum mit farbiger Bestuhlung entlang der Seitenwände"
                width={720}
                height={360}
                sizes="(min-width: 1024px) 40vw, 100vw"
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

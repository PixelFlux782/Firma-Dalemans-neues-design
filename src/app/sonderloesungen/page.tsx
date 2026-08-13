import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductVisual from "@/components/ProductVisual";
import { StructuredData } from "@/components/StructuredData";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

const steps = [
  {
    title: "Skizze",
    text: "Anforderung, Raummaß, Bestand oder Sonderwunsch werden sauber erfasst.",
    image: "/pictures/Über uns/Skizze01.jpg",
  },
  {
    title: "Planung",
    text: "Aus der Idee wird eine technische Lösung mit CAD, Maßlogik und Materialbezug.",
    image: "/pictures/Über uns/CAD-Entwicklung1zu1.png",
  },
  {
    title: "Umsetzung",
    text: "Die Lösung wird praktisch gedacht: Nutzung, Lagerung, Transport und Alltagstauglichkeit.",
    image: "/neue bilder/planung-schritt-3.png",
  },
] as const;

const useCases = [
  "Klapptische in Sondermaß oder Sonderform",
  "Anpassungen für vorhandene Bestände",
  "Transportwagen passend zu Stuhl- oder Tischmaß",
  "Zubehör für Reihen, Buchablage, Gleiter und Lagerung",
  "Planung für schwierige Raumzuschnitte",
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Sonderlösungen für Stapelstühle, Klapptische und Zubehör",
  provider: {
    "@type": "LocalBusiness",
    name: "Dalemans Stapelstühle & Klapptische",
    url: absoluteUrl("/"),
  },
  url: absoluteUrl("/sonderloesungen"),
  serviceType: "CAD Planung und Sonderlösung für Gemeindemobiliar",
};

export const metadata: Metadata = buildMetadata({
  title: "Sonderlösungen und CAD-Planung für Klapptische und Zubehör",
  description:
    "Dalemans plant Sonderlösungen für Klapptische, Stapelstühle, Transportwagen, Zubehör und schwierige Raummaße von Skizze über CAD bis Umsetzung.",
  path: "/sonderloesungen",
  image: "/pictures/Über uns/CAD-Entwicklung1zu1.png",
  keywords: [
    "Klapptisch Sondermaß",
    "Sonderlösungen Gemeindemobiliar",
    "CAD Planung Möbel",
    "Transportwagen Sonderlösung",
  ],
});

export default function SonderloesungenPage() {
  return (
    <div className="page-stack">
      <StructuredData data={structuredData} />

      <section className="products-hero relative -mx-5 min-h-[650px] overflow-hidden sm:-mx-6 md:mx-0 md:min-h-[560px]">
        <div className="products-hero-media absolute inset-0">
          <Image
            src={encodeURI("/images/curated/Sonderlösungen/runder-tisch.webp")}
            alt="Große runde Tischanlage als individuell geplante Sonderlösung"
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="products-hero-shade pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-20 flex min-h-[650px] items-end px-5 pb-14 pt-20 sm:px-8 md:min-h-[560px] md:items-center md:px-12 md:py-16 lg:px-16">
          <div className="max-w-[42rem] md:w-[61%]">
            <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Sonderlösungen" }]} currentPath="/sonderloesungen" />
            <p className="section-eyebrow mt-7">Sonderlösungen</p>
            <h1 className="mt-3 max-w-[17ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Wenn Standard nicht reicht: Sondermaße, CAD und praktische Umsetzung.</h1>
            <p className="mt-4 max-w-[38rem] text-base leading-7 text-premium-muted">Dalemans verbindet alte Sonderlösungs-Kompetenz mit heutiger Planung: von der Skizze über CAD bis zu Zubehör, Tischlösung oder Transportlogik.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kontakt" className="btn-primary px-6 py-3">Sonderlösung besprechen</Link>
              <Link href="/produkte/kategorien/klapptische" className="btn-secondary px-6 py-3">Klapptische ansehen</Link>
            </div>
          </div>
        </div>
      </section>

      <HomeSection>
        <SectionHeader
          eyebrow="Ablauf"
          title="Von der Idee zur belastbaren Lösung"
          lead="Der Prozess bleibt ruhig und nachvollziehbar: erst verstehen, dann planen, dann praktisch lösen."
          align="editorial"
        />
        <div className="section-grid-top grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="premium-card image-depth overflow-hidden">
              <Image
                src={encodeURI(step.image)}
                alt={`${step.title} einer Sonderlösung`}
                width={520}
                height={360}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="h-56 w-full object-cover"
              />
              <div className="p-7">
                <p className="section-eyebrow text-[0.65rem]">Schritt {index + 1}</p>
                <h2 className="mt-3 font-display text-2xl font-medium text-premium-ink">
                  {step.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-premium-muted">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <SectionHeader
          eyebrow="Konstruktive Beispiele"
          title="Besondere Anforderung, passende technische Idee"
          lead="Standardprodukte reichen nicht für jede Raumsituation aus. Die Beispiele zeigen eine kompakte Tischentwicklung und eine individuelle Tischform, ohne daraus eine pauschale Verfügbarkeit abzuleiten."
          align="editorial"
        />
        <div className="section-grid-top grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <figure>
            <ProductVisual src="/images/curated/Sonderlösungen/Kleinst_Klapptisch_Entwicklung02.webp" alt="Entwicklung eines kompakten Klapptisches" sizes="(min-width: 1024px) 55vw, 100vw" aspectRatio="3 / 2" imageInset="5%" backgroundTone="canvas" />
            <figcaption className="px-6 py-5 text-sm leading-7 text-premium-muted">Eine konstruktive Idee wird mit Blick auf Nutzung, Handhabung und Lagerung geprüft.</figcaption>
          </figure>
          <figure>
            <ProductVisual src="/images/curated/Gestelle/Gestell-hero.webp" alt="Metallgestell als Grundlage einer individuellen Möbelkonstruktion" sizes="(min-width: 1024px) 38vw, 100vw" aspectRatio="3 / 2" imageInset="5%" backgroundTone="canvas" />
            <figcaption className="px-6 py-5 text-sm leading-7 text-premium-muted">Bauteile und Gestelle werden passend zur konkreten Aufgabe betrachtet.</figcaption>
          </figure>
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">Typische Fälle</p>
            <h2 className="section-title mt-5 text-balance">
              Sonderlösung heißt: genauer zum Raum passen.
            </h2>
            <p className="section-lead mt-6">
              Nicht jedes Projekt braucht eine Neuentwicklung. Aber wenn Maße,
              Bestand, Lagerung oder Ablauf besonders sind, lohnt sich Planung
              vor dem Kauf.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {useCases.map((item) => (
              <div key={item} className="rounded-3xl border border-premium-beige/60 bg-white/70 p-6">
                <p className="text-sm font-medium leading-7 text-premium-charcoal">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </HomeSection>

      <PremiumCtaSection
        title="Haben Sie Maße, Fotos oder eine alte Skizze?"
        lead="Schicken Sie uns den aktuellen Stand. Wir prüfen, welche Standardlösung passt und wo eine Sonderlösung sinnvoll ist."
        primaryHref="/kontakt"
        primaryLabel="Sonderlösung anfragen"
        secondaryHref="/produkte/kategorien/transportwagen-zubehoer"
        secondaryLabel="Zubehör ansehen"
        reassurance="Wir prüfen zuerst, ob eine Standardlösung genügt und wo eine Sonderlösung wirklich sinnvoll ist."
        showDirectContact
      />
    </div>
  );
}

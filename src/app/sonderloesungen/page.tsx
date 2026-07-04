import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import CinematicPageHero from "@/components/home/CinematicPageHero";
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
    image: "/pictures/Über uns/Werkstatt-24.jpg",
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
    name: "DLMNS Stapelstühle & Klapptische",
    url: absoluteUrl("/"),
  },
  url: absoluteUrl("/sonderloesungen"),
  serviceType: "CAD Planung und Sonderlösung für Gemeindemobiliar",
};

export const metadata: Metadata = buildMetadata({
  title: "Sonderlösungen und CAD-Planung für Klapptische und Zubehör",
  description:
    "DLMNS plant Sonderlösungen für Klapptische, Stapelstühle, Transportwagen, Zubehör und schwierige Raummaße von Skizze über CAD bis Umsetzung.",
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

      <CinematicPageHero
        eyebrow="Sonderlösungen"
        title="Wenn Standard nicht reicht: Sondermaße, CAD und praktische Umsetzung."
        lead="DLMNS verbindet alte Sonderlösungs-Kompetenz mit heutiger Planung: von der Skizze über CAD bis zu Zubehör, Tischlösung oder Transportlogik."
        breadcrumbs={[{ label: "Start", href: "/" }, { label: "Sonderlösungen" }]}
        mediaAriaLabel="CAD Planung und Werkstatt für Sonderlösungen"
        mood="bronze-glow"
        actions={
          <>
            <Link href="/kontakt" className="btn-hero-primary text-center">
              Sonderlösung besprechen
            </Link>
            <Link href="/produkte/kategorien/klapptische" className="btn-hero-secondary text-center">
              Klapptische ansehen
            </Link>
          </>
        }
        visual={
          <img
            src={encodeURI("/pictures/Über uns/CAD-Entwicklung1zu1.png")}
            alt="CAD Planung für Sonderlösungen"
            className="min-h-[240px] w-full object-cover md:min-h-[300px]"
          />
        }
      />

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
              <img
                src={encodeURI(step.image)}
                alt={`${step.title} einer Sonderlösung`}
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
      />
    </div>
  );
}

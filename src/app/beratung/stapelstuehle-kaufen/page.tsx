import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { StructuredData } from "@/components/StructuredData";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { getProductsByCategory } from "@/lib/products";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

const stapelstuehle = getProductsByCategory("stapelstuehle").slice(0, 3);

const criteria = [
  {
    title: "Gestell und Verarbeitung",
    text: "Bei hoher Frequenz zählen geschweißte, robuste Konstruktionen und saubere Verarbeitung mehr als der niedrigste Einzelpreis.",
  },
  {
    title: "Stapelbarkeit und Lagerung",
    text: "Ein guter Stapelstuhl muss nicht nur sitzen, sondern sich schnell bewegen, stapeln und sicher lagern lassen.",
  },
  {
    title: "Reihen und Zubehör",
    text: "Reihenverbinder, Buchablagen, Gleiter und Transportwagen entscheiden im Alltag oft über Ordnung und Tempo.",
  },
  {
    title: "Raumwirkung",
    text: "Farbe, Form und Reihenbild prägen, ob ein Gemeindesaal ruhig, einladend und gepflegt wirkt.",
  },
] as const;

const faq = [
  {
    question: "Welche Stapelstühle eignen sich für Gemeinden?",
    answer:
      "Für Gemeinden eignen sich robuste, gut stapelbare Modelle mit passenden Reihenverbindern, Gleitern und optionaler Buchablage. Entscheidend sind Nutzungshäufigkeit, Lagerung und Raumwirkung.",
  },
  {
    question: "Was ist beim Kauf vieler Stapelstühle wichtig?",
    answer:
      "Wichtig sind langlebige Verarbeitung, sichere Stapelung, Transportwagen, Ersatzteil- und Zubehörlogik sowie eine Beratung zur passenden Stückzahl.",
  },
  {
    question: "Kann vorhandenes Zubehör nachgerüstet werden?",
    answer:
      "Viele Lösungen wie Reihenverbinder, Gleiter oder Buchablagen können je nach Stuhltyp und Gestellmaß nachgerüstet oder passend geplant werden.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
  url: absoluteUrl("/beratung/stapelstuehle-kaufen"),
};

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle kaufen für Gemeinden, Kirchen und Säle",
  description:
    "Kaufberatung für Stapelstühle: robuste Gemeindestühle, Kirchenstühle, Reihenbestuhlung, Zubehör, Transportwagen und persönliche Beratung.",
  path: "/beratung/stapelstuehle-kaufen",
  image: "/pictures/Produkte/Stühle/1021c-01.jpg",
  keywords: [
    "Stapelstühle kaufen",
    "Stapelstühle für Gemeinden",
    "Kirchenstuhl",
    "Gemeindestuhl",
    "Stapelstuhl Saal",
  ],
});

export default function StapelstuehleKaufenPage() {
  return (
    <div className="page-stack">
      <StructuredData data={structuredData} />

      <CinematicPageHero
        eyebrow="Kaufberatung"
        title="Stapelstühle kaufen: worauf Gemeinden und Säle achten sollten."
        lead="Wer viele Stühle anschafft, kauft nicht nur Sitzplätze. Es geht um Haltbarkeit, Lagerung, Reihen, Zubehör und einen Raum, der jahrelang zuverlässig funktioniert."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Beratung" },
          { label: "Stapelstühle kaufen" },
        ]}
        mediaAriaLabel="Robuste Stapelstühle für Kaufberatung"
        mood="stone-arch"
        actions={
          <>
            <Link href="/kontakt" className="btn-hero-primary text-center">
              Auswahl besprechen
            </Link>
            <Link href="/produkte/kategorien/stapelstuehle" className="btn-hero-secondary text-center">
              Stapelstühle ansehen
            </Link>
          </>
        }
        visual={
          <img
            src={encodeURI("/pictures/Produkte/Stühle/1021c-01.jpg")}
            alt="Stapelstuhl für Gemeinde, Kirche und Saal"
            className="min-h-[240px] w-full object-cover md:min-h-[300px]"
          />
        }
      />

      <HomeSection>
        <SectionHeader
          eyebrow="Entscheidungskriterien"
          title="Vier Fragen vor der Anschaffung"
          lead="Die beste Wahl entsteht aus Nutzung, Stückzahl, Lagerung und gewünschter Raumwirkung."
          align="editorial"
        />
        <div className="section-grid-top grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {criteria.map((item) => (
            <article key={item.title} className="premium-card p-7">
              <h2 className="font-display text-xl font-medium text-premium-ink">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-premium-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Modelle"
          title="Robuste Stapelstühle als Startpunkt"
          lead="Diese Modelle führen in die Kategorie. Die konkrete Auswahl klären wir nach Raum, Nutzung und Bestand."
          align="editorial"
        />
        <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {stapelstuehle.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <SectionHeader
          eyebrow="FAQ"
          title="Häufige Fragen vor dem Kauf"
          lead="Kurze Antworten für die erste Orientierung."
          align="editorial"
        />
        <div className="section-grid-top grid gap-5 md:grid-cols-3">
          {faq.map((item) => (
            <article key={item.question} className="rounded-3xl border border-premium-beige/60 bg-white/70 p-6">
              <h2 className="font-display text-lg font-medium text-premium-ink">
                {item.question}
              </h2>
              <p className="mt-4 text-sm leading-7 text-premium-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </HomeSection>

      <PremiumCtaSection
        title="Sie müssen nicht allein durch Kataloge vergleichen."
        lead="Nennen Sie Raumgröße, Stückzahl und gewünschte Nutzung. Wir schlagen passende Stapelstühle und Zubehör vor."
        primaryHref="/kontakt"
        primaryLabel="Beratung anfragen"
        secondaryHref="/produkte/kategorien/stapelstuehle"
        secondaryLabel="Kategorie öffnen"
      />
    </div>
  );
}

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { StructuredData } from "@/components/StructuredData";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { categoryPlaceholders } from "@/lib/category-placeholders";
import { getProductCategoryById } from "@/lib/product-categories";
import { getProductsByCategory, type ProductCategoryId } from "@/lib/products";
import { absoluteUrl, siteName } from "@/lib/seo";

interface ProductCategoryOverviewProps {
  categoryId: ProductCategoryId;
}

const categoryDecisionHelp: Record<
  ProductCategoryId,
  {
    suitable: string[];
    decision: string[];
    faq: { question: string; answer: string }[];
  }
> = {
  stapelstuehle: {
    suitable: [
      "Gemeinden und Kirchen mit Reihenbestuhlung",
      "Vereine, Seminarräume und Mehrzwecksäle mit häufigem Umbau",
      "Kommunale Räume, in denen robuste Serienbestuhlung gefragt ist",
    ],
    decision: [
      "Stapelverhalten, Gestellqualität und Bodenschutz früh klären",
      "Reihenverbinder, Buchablage und Transportwagen direkt mitdenken",
      "Sitzkomfort nach typischer Nutzungsdauer auswählen",
    ],
    faq: [
      {
        question: "Welche Stapelstühle eignen sich für Gemeinden?",
        answer:
          "Für Gemeinden eignen sich robuste Stapelstühle mit gutem Stapelverhalten, stabiler Stahlrohrkonstruktion und passendem Zubehör wie Reihenverbindern, Buchablagen und Gleitern.",
      },
      {
        question: "Was ist bei Kirchenstühlen oder Gemeindestühlen wichtig?",
        answer:
          "Wichtig sind ein ruhiges Gesamtbild, zuverlässige Reihenbildung, angenehmer Sitzkomfort und eine Lager- oder Transportlösung, die Ehrenamt und Hausmeisterteam im Alltag entlastet.",
      },
    ],
  },
  klapptische: {
    suitable: [
      "Gemeindecafés, Seminarräume, Vereinsheime und Säle",
      "Räume mit Buffet, Gruppenarbeit, Feiern oder wechselnden Tischformen",
      "Projekte mit Sondermaß, Trapezform oder vorhandenen Beständen",
    ],
    decision: [
      "Maße nach Nutzung und Handling wählen, nicht nur nach maximaler Fläche",
      "Oberfläche, Kante und Gestell auf häufiges Auf- und Abbauen abstimmen",
      "Transportwagen und Lagerfläche passend zum Tischmaß planen",
    ],
    faq: [
      {
        question: "Welche Klapptische sind für Gemeinden sinnvoll?",
        answer:
          "Sinnvoll sind stabile Klapptische mit widerstandsfähiger Oberfläche, robuster Kante und einem Format, das sich von wenigen Personen gut bewegen, lagern und kombinieren lässt.",
      },
      {
        question: "Sind Klapptische im Sondermaß möglich?",
        answer:
          "Ja. Klapptische können je nach Projekt in Sondermaß, Sonderform oder mit angepasster Transportlogik geplant werden. Dafür sind Raummaß, gewünschte Nutzung und Lagerweg hilfreich.",
      },
    ],
  },
  "gemeindestuehle-bankettmoebel": {
    suitable: [
      "Gemeindesäle, Bankette, Feierstunden und repräsentative Veranstaltungen",
      "Räume, in denen Komfort und ein einheitliches Bild wichtig sind",
      "Ergänzungsbestuhlung für Foyer, Café oder Sonderbelegung",
    ],
    decision: [
      "Optik und Komfort mit Stapelbarkeit oder Klappbarkeit abgleichen",
      "Reihenabstände, Wege und typische Veranstaltungsdauer berücksichtigen",
      "Reservebestände und Zusatzbestuhlung realistisch einplanen",
    ],
    faq: [
      {
        question: "Was unterscheidet Gemeindestühle von einfachen Saalstühlen?",
        answer:
          "Gemeindestühle müssen neben Stabilität und Stapelbarkeit oft auch Reihenwirkung, Komfort, Zubehör und eine würdige Atmosphäre für Gottesdienst, Feiern und Begegnung verbinden.",
      },
      {
        question: "Welche Stühle passen zu Bankett und Gemeindesaal?",
        answer:
          "Geeignet sind Modelle, die bei längerer Nutzung bequem bleiben, in Reihen ordentlich wirken und sich nach der Veranstaltung gut stapeln, transportieren oder ergänzen lassen.",
      },
    ],
  },
  "transportwagen-zubehoer": {
    suitable: [
      "Hausmeisterteams, Ehrenamt und Veranstaltungslogistik",
      "Gemeinden, Säle und Kommunen mit häufigem Auf- und Abbau",
      "Bestände, die bodenschonend, geordnet und schneller bewegt werden sollen",
    ],
    decision: [
      "Transportwagen passend zu Stuhltyp, Tischmaß und Lagerweg wählen",
      "Reihenverbinder, Gleiter und Buchablagen auf vorhandene Modelle abstimmen",
      "Zubehör als Teil der Ausstattung kalkulieren, nicht als Nachgedanke",
    ],
    faq: [
      {
        question: "Wann lohnt sich ein Transportwagen für Stühle und Tische?",
        answer:
          "Ein Transportwagen lohnt sich, sobald größere Mengen regelmäßig bewegt werden. Er spart Zeit, schützt Material und macht Umbauten in Gemeindesaal, Verein oder Kommune deutlich leichter.",
      },
      {
        question: "Kann Zubehör zu vorhandenen Stühlen nachgerüstet werden?",
        answer:
          "Viele Zubehörteile wie Reihenverbinder, Gleiter oder Buchablagen können passend zu vorhandenen Stahlrohrstühlen geprüft und nachgerüstet werden. Entscheidend sind Maße und Gestellform.",
      },
    ],
  },
};

export default function ProductCategoryOverview({
  categoryId,
}: ProductCategoryOverviewProps) {
  const category = getProductCategoryById(categoryId);

  if (!category) {
    return null;
  }

  const categoryProducts = getProductsByCategory(category.id);
  const placeholder = categoryPlaceholders[category.id];
  const decisionHelp = categoryDecisionHelp[category.id];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": absoluteUrl(`/produkte/kategorien/${category.id}#products`),
        name: `${category.name} von ${siteName}`,
        description: category.description,
        url: absoluteUrl(`/produkte/kategorien/${category.id}`),
        itemListElement: categoryProducts.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.title,
          url: absoluteUrl(`/produkte/${product.slug}`),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl(`/produkte/kategorien/${category.id}#faq`),
        mainEntity: decisionHelp.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="page-stack">
      <StructuredData data={structuredData} />

      <CinematicPageHero
        eyebrow={category.name}
        title={`${category.name} für Gemeinden, Säle und flexible Räume`}
        lead={category.description}
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Produkte", href: "/produkte" },
          { label: "Kategorien", href: "/produkte/kategorien" },
          { label: category.name },
        ]}
        mediaAriaLabel={placeholder.ariaLabel}
        mood={placeholder.mood}
        actions={
          <>
            <Link href="/kontakt" className="btn-hero-primary text-center">
              Diese Kategorie anfragen
            </Link>
            <Link
              href="/produkte/kategorien"
              className="btn-hero-secondary text-center"
            >
              Alle Kategorien
            </Link>
          </>
        }
        visual={
          <img
            src={category.image}
            alt={`${category.name} für Gemeinden und Säle`}
            className="min-h-[220px] w-full object-cover sm:min-h-[260px] md:min-h-[280px]"
          />
        }
      />

      <HomeSection>
        <SectionHeader
          eyebrow="Überblick"
          title="Für wen geeignet, worauf achten, welche Modelle passen?"
          lead="Kompakte Orientierung zu Merkmalen, Einsatzbereichen und Anfrageweg."
          align="editorial"
        />

        <div className="section-grid-top grid gap-5 md:grid-cols-3 lg:gap-6">
          <article className="premium-card premium-card-hover p-7 md:p-8">
            <p className="section-eyebrow text-[0.65rem]">Umfang</p>
            <p className="mt-4 font-display text-4xl font-medium tracking-[-0.03em] text-premium-ink">
              {categoryProducts.length}
            </p>
            <p className="mt-3 text-sm leading-[1.75] text-premium-muted">
              Modelle mit Detailseite, Einsatzgebieten und direkter Anfrage.
            </p>
          </article>

          <article className="premium-card premium-card-hover rounded-4xl border border-premium-beige/50 bg-gradient-to-br from-premium-warm to-premium-canvas/80 p-7 md:p-8">
            <p className="section-eyebrow text-[0.65rem]">Vorteile</p>
            <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-premium-muted">
              {category.highlights.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="premium-card premium-card-hover rounded-4xl bg-premium-ink p-7 text-premium-canvas md:p-8">
            <p className="section-eyebrow text-[0.65rem] text-premium-sand">
              Einsatzbereiche
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-white/75">
              {category.useCases.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">Entscheidungshilfe</p>
            <h2 className="section-title mt-5 text-balance">
              Passt diese Kategorie zu Ihrem Raum?
            </h2>
            <p className="section-lead mt-6">
              Für Gemeinden, Vereine, Seminarräume und kommunale Einrichtungen
              zählt nicht nur das einzelne Produkt. Entscheidend sind Nutzung,
              Lagerung, Transport und die Wirkung im Raum.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/kontakt" className="btn-primary text-center">
                Auswahl besprechen
              </Link>
              <a href="tel:+499342915353" className="btn-secondary text-center">
                Direkt anrufen
              </a>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="premium-card p-7 md:p-8">
              <p className="section-eyebrow text-[0.65rem]">
                Besonders geeignet für
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-premium-muted">
                {decisionHelp.suitable.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="text-premium-sand" aria-hidden>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="premium-card p-7 md:p-8">
              <p className="section-eyebrow text-[0.65rem]">
                Vor der Anfrage klären
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-premium-muted">
                {decisionHelp.decision.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="text-premium-sand" aria-hidden>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Modelle"
          title="Produkte in dieser Kategorie"
          lead="Alle Modelle mit Bild, Einsatzbereichen, Vorteilen und direktem Kontakt zur Beratung."
          href="/kontakt"
          linkLabel="Beratung zur Auswahl"
          align="editorial"
        />

        <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {categoryProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </HomeSection>

      <HomeSection>
        <SectionHeader
          eyebrow="Häufige Fragen"
          title={`Kurz geklärt: ${category.name}`}
          lead="Antworten auf typische Fragen, bevor Sie konkrete Stückzahlen oder Maße anfragen."
          align="editorial"
        />

        <div className="section-grid-top grid gap-5 md:grid-cols-2">
          {decisionHelp.faq.map((item) => (
            <article key={item.question} className="premium-card p-7 md:p-8">
              <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
                {item.question}
              </h2>
              <p className="mt-4 text-sm leading-[1.8] text-premium-muted">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </HomeSection>

      <PremiumCtaSection
        eyebrow="Beratung"
        title={`Planen Sie mit ${category.name}?`}
        lead="Wir helfen bei Modellauswahl, Stückzahlen, Zubehör, Varianten und Raumwirkung."
        primaryHref="/kontakt"
        primaryLabel="Projekt besprechen"
        secondaryHref="/produkte"
        secondaryLabel="Weitere Produkte"
      />
    </div>
  );
}

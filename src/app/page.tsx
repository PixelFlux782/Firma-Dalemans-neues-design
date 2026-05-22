import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CinematicMediaPlaceholder from "@/components/CinematicMediaPlaceholder";
import HeroSection from "@/components/home/HeroSection";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import CategoryShowcaseCard from "@/components/home/CategoryShowcaseCard";
import { productCategories } from "@/lib/product-categories";
import { products } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

const featuredProducts = products.slice(0, 3);

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle, Klapptische und Lösungen für Gemeinde und Saal",
  description:
    "Dalemans bietet Stapelstühle, Klapptische und durchdachte Raumlösungen für Gemeinden, Vereine, Säle und Veranstaltungsräume — mit persönlicher Beratung und langlebiger Qualität.",
  path: "/",
  keywords: [
    "Stapelstühle",
    "Klapptische",
    "Gemeindemobiliar",
    "Saalmöbel",
    "Veranstaltungsmobiliar",
  ],
});

const trustMetrics = [
  {
    title: "Persönliche Beratung",
    text: "Vom ersten Gespräch bis zur Bestuhlung — mit Blick auf Nutzung, Raumwirkung und Budget.",
  },
  {
    title: "Flexible Raumlösungen",
    text: "Stapelbar, klapbar, kombinierbar: Möbel, die mit Ihren Räumen mitdenken.",
  },
  {
    title: "Für Gemeinden, Kommunen & Veranstalter",
    text: "Erfahrung aus Gottesdiensträumen, Sälen, Seminaren und festlichen Anlässen.",
  },
  {
    title: "Langlebige Möbelkonzepte",
    text: "Robuste Konstruktionen für häufige Nutzung — investiert in Jahrzehnte, nicht in Saisons.",
  },
] as const;

const storyBlocks = [
  {
    title: "Begegnung im Mittelpunkt",
    text: "Gute Räume laden ein zum Zuhören, Feiern und Zusammensein. Wir gestalten Bestuhlung und Mobiliar so, dass Atmosphäre und Funktion zusammenpassen.",
  },
  {
    title: "Flexibel statt starr",
    text: "Mehrzweckräume brauchen schnelle Umbauten. Stapelstühle, Klapptische und durchdachtes Zubehör halten Abläufe ruhig und übersichtlich.",
  },
  {
    title: "Beratung mit Raumgefühl",
    text: "Nicht nur Produkte liefern — sondern Konzepte: Reihenbild, Wegeführung, Lagerung und Wirkung im leeren wie im vollen Saal.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="page-stack">
      <HeroSection />

      <HomeSection>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {trustMetrics.map((item, index) => (
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

        <div className="image-depth mt-10 overflow-hidden rounded-5xl md:mt-12">
          <CinematicMediaPlaceholder
            ariaLabel="Vertrauenspartner — editorial Fläche für Referenzen"
            mood="soft-partners"
            variant="strip"
            className="min-h-[140px] md:min-h-[160px]"
          />
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Raumdenken"
          title="Mehr als Möbel — Atmosphäre, die bleibt"
          lead="Wir unterstützen Gemeinden, Vereine und Veranstalter dabei, Räume zu schaffen, die einladend wirken und im Alltag zuverlässig funktionieren."
          align="editorial"
        />

        <div className="section-grid-top grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="space-y-14 md:space-y-16">
            {storyBlocks.map((block, i) => (
              <article
                key={block.title}
                className={`max-w-lg animate-fade-up ${
                  i === 1 ? "animate-fade-up-delay-1 md:pl-6" : i === 2 ? "animate-fade-up-delay-2" : ""
                }`}
              >
                <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink">
                  {block.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.8] text-premium-muted md:text-base">
                  {block.text}
                </p>
              </article>
            ))}
          </div>

          <div className="image-depth overflow-hidden rounded-6xl shadow-premium-xl lg:sticky lg:top-28 lg:self-start">
            <img
              src={encodeURI("/pictures/Über uns/Realisierte-11.jpg")}
              alt="Realisierte Bestuhlung in einem Begegnungsraum"
              className="min-h-[420px] w-full object-cover lg:min-h-[520px]"
            />
          </div>
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Lösungswelten"
          title="Räume gestalten — Kategorie für Kategorie"
          lead="Editorial inszeniert statt Katalog: entdecken Sie Stapelstühle, Tische und ergänzende Lösungen für Ihre Nutzungssituation."
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

      <section className="relative overflow-hidden rounded-6xl bg-premium-espresso text-premium-canvas shadow-premium-xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_50%,rgba(196,165,116,0.12),transparent_55%)]"
          aria-hidden
        />
        <div className="grid lg:grid-cols-2">
          <div className="image-depth relative min-h-[360px] overflow-hidden lg:min-h-[520px]">
            <img
              src={encodeURI("/pictures/Über uns/Passbild_Stefan_F_edit.jpg")}
              alt="Stefan Dalemans — persönliche Beratung"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-premium-espresso via-premium-espresso/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-premium-espresso/30 lg:to-premium-espresso"
              aria-hidden
            />
          </div>

          <div className="relative flex flex-col justify-center px-8 py-14 md:px-14 md:py-20 lg:px-16">
            <p className="section-eyebrow text-premium-sand">Familienunternehmen</p>
            <h2 className="font-display mt-5 text-3xl font-medium leading-[1.12] tracking-[-0.02em] md:text-4xl lg:text-[2.75rem]">
              Vertrauen, das man im Raum spürt
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-[1.8] text-white/72 md:text-base">
              Dalemans verbindet generationsübergreifende Erfahrung mit einem
              klaren Blick für moderne Begegnungsorte. Persönlich, ehrlich und
              nah an der Praxis von Gemeinden, Vereinen und Veranstaltern.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-[1.8] text-white/55">
              Wir denken in Nutzungsszenarien — nicht in anonymen Listen.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/firma" className="btn-on-dark text-center">
                Unsere Geschichte
              </Link>
              <Link href="/kontakt" className="btn-outline-dark text-center">
                Persönlich anfragen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Ausgewählte Lösungen"
          title="Produkte, die im Raum überzeugen"
          lead="Ein Einblick in bewährte Stapelstühle und Klapptische — mit direktem Weg zu Details und Beratung."
          href="/produkte"
          linkLabel="Gesamtes Sortiment"
        />

        <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product, i) => (
            <div
              key={product.slug}
              className={`animate-fade-up ${i === 1 ? "animate-fade-up-delay-1" : i === 2 ? "animate-fade-up-delay-2" : ""}`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col justify-center lg:py-4">
            <p className="section-eyebrow">Sonderlösungen</p>
            <h2 className="section-title mt-5 text-balance">
              Wenn der Raum mehr verlangt als Standard
            </h2>
            <p className="section-lead mt-6">
              CAD-Entwicklung, angepasste Formate und lösungsorientierte Planung
              — für Projekte, in denen Funktion, Ästhetik und Alltagstauglichkeit
              zusammenpassen müssen.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/firma" className="btn-primary text-center">
                Entwicklung & Firma
              </Link>
              <Link href="/kontakt" className="btn-secondary text-center">
                Projekt besprechen
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="image-depth overflow-hidden rounded-5xl shadow-premium sm:col-span-2">
              <img
                src={encodeURI("/pictures/Über uns/Werkstatt-24.jpg")}
                alt="Werkstatt und Fertigung bei Dalemans"
                className="h-full min-h-[220px] w-full object-cover"
              />
            </div>
            <div className="image-depth overflow-hidden rounded-5xl shadow-premium">
              <img
                src={encodeURI("/pictures/Über uns/Technische-03.jpg")}
                alt="Technische Entwicklung bei Dalemans"
                className="h-full min-h-[220px] w-full object-cover"
              />
            </div>
            <div className="image-depth overflow-hidden rounded-5xl shadow-premium">
              <img
                src={encodeURI("/pictures/Über uns/CAD-Entwicklung1zu1.png")}
                alt="CAD-Entwicklung bei Dalemans"
                className="h-full min-h-[220px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </HomeSection>

      <PremiumCtaSection
        title="Sie planen einen neuen Raum?"
        lead="Wir helfen bei Bestuhlung, Möbelauswahl und Raumwirkung — ruhig, persönlich und mit Blick auf Ihre Nutzung vor Ort."
        primaryHref="/kontakt"
        primaryLabel="Projekt besprechen"
        secondaryHref="/produkte"
        secondaryLabel="Lösungen ansehen"
      />
    </div>
  );
}

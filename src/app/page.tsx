import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/home/HeroSection";
import SectionHeader from "@/components/home/SectionHeader";
import CategoryShowcaseCard from "@/components/home/CategoryShowcaseCard";
import PremiumImagePlaceholder from "@/components/PremiumImagePlaceholder";
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
    <div className="space-y-20 md:space-y-28 lg:space-y-32">
      <HeroSection />

      {/* Vertrauen / Social Proof */}
      <section className="animate-fade-up">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustMetrics.map((item, index) => (
            <article
              key={item.title}
              className={[
                "premium-card animate-fade-up p-6 md:p-7",
                index === 1 && "animate-fade-up-delay-1",
                index === 2 && "animate-fade-up-delay-2",
                index === 3 && "animate-fade-up-delay-3",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <h2 className="text-lg font-semibold tracking-tight text-premium-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-premium-muted">
                {item.text}
              </p>
            </article>
          ))}
        </div>

        {/* TODO: Kundenlogos / Referenzen einfügen */}
        <div className="mt-8 rounded-4xl border border-dashed border-premium-beige/80 bg-premium-warm/40 px-6 py-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-premium-subtle">
            TODO: Kundenlogos & Referenzen
          </p>
          <p className="mt-2 text-sm text-premium-muted">
            Platzhalter für spätere Partner aus Gemeinden, Kommunen, Vereinen
            und Veranstaltungen
          </p>
        </div>
      </section>

      {/* Storytelling */}
      <section className="space-y-12">
        <SectionHeader
          eyebrow="Raumdenken"
          title="Mehr als Möbel — Atmosphäre, die bleibt"
          lead="Wir unterstützen Gemeinden, Vereine und Veranstalter dabei, Räume zu schaffen, die einladend wirken und im Alltag zuverlässig funktionieren."
        />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-10">
            {storyBlocks.map((block) => (
              <article key={block.title} className="max-w-lg">
                <h3 className="text-xl font-semibold tracking-tight text-premium-ink">
                  {block.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-premium-muted md:text-base md:leading-8">
                  {block.text}
                </p>
              </article>
            ))}
          </div>

          <div className="image-zoom-hover overflow-hidden rounded-5xl shadow-premium-lg">
            <PremiumImagePlaceholder
              label="Begegnungsraum — Editorial"
              todoNote="TODO: Premium-Raumfoto für Storytelling"
              variant="editorial"
              className="min-h-[400px] lg:min-h-full"
            />
          </div>
        </div>
      </section>

      {/* Kategorien */}
      <section className="space-y-10 md:space-y-12">
        <SectionHeader
          eyebrow="Lösungswelten"
          title="Räume gestalten — Kategorie für Kategorie"
          lead="Editorial inszeniert statt Katalog: entdecken Sie Stapelstühle, Tische und ergänzende Lösungen für Ihre Nutzungssituation."
          href="/produkte/kategorien"
          linkLabel="Alle Kategorien"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {productCategories.map((category, index) => (
            <CategoryShowcaseCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Firmengeschichte */}
      <section className="overflow-hidden rounded-5xl bg-premium-ink text-premium-canvas shadow-premium-lg">
        <div className="grid lg:grid-cols-2">
          <div className="image-zoom-hover relative min-h-[320px] overflow-hidden lg:min-h-[480px]">
            <img
              src={encodeURI("/pictures/Über uns/Passbild_Stefan_F_edit.jpg")}
              alt="Stefan Dalemans — persönliche Beratung"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-premium-ink/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-premium-ink/40"
              aria-hidden
            />
          </div>

          <div className="flex flex-col justify-center px-8 py-12 md:px-12 md:py-16">
            <p className="section-eyebrow text-premium-sand">Familienunternehmen</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Vertrauen, das man im Raum spürt
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 md:text-base md:leading-8">
              Dalemans verbindet generationsübergreifende Erfahrung mit einem
              klaren Blick für moderne Begegnungsorte. Persönlich, ehrlich und
              nah an der Praxis von Gemeinden, Vereinen und Veranstaltern.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/60">
              Wir denken in Nutzungsszenarien — nicht in anonymen Listen. So
              entstehen Lösungen, die Bestuhlung, Lagerung und Raumwirkung
              zusammenbringen.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

      {/* Featured Products */}
      <section className="space-y-10 md:space-y-12">
        <SectionHeader
          eyebrow="Ausgewählte Lösungen"
          title="Produkte, die im Raum überzeugen"
          lead="Ein Einblick in bewährte Stapelstühle und Klapptische — mit direktem Weg zu Details und Beratung."
          href="/produkte"
          linkLabel="Gesamtes Sortiment"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Sonderlösungen */}
      <section className="overflow-hidden rounded-5xl border border-premium-beige/50 bg-gradient-to-br from-premium-warm via-premium-canvas to-white shadow-premium">
        <div className="grid gap-10 p-8 md:p-12 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col justify-center">
            <p className="section-eyebrow">Sonderlösungen</p>
            <h2 className="section-title mt-4">
              Wenn der Raum mehr verlangt als Standard
            </h2>
            <p className="section-lead mt-5">
              CAD-Entwicklung, angepasste Formate und lösungsorientierte Planung
              — für Projekte, in denen Funktion, Ästhetik und Alltagstauglichkeit
              zusammenpassen müssen.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/firma" className="btn-primary text-center">
                Entwicklung & Firma
              </Link>
              <Link href="/kontakt" className="btn-secondary text-center">
                Projekt besprechen
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="image-zoom-hover overflow-hidden rounded-4xl shadow-premium sm:col-span-2">
              <PremiumImagePlaceholder
                label="CAD & Sonderentwicklung"
                todoNote="TODO: Premium-Bild Sonderlösungen / CAD"
                variant="editorial"
                className="min-h-[200px]"
              />
            </div>
            <div className="image-zoom-hover overflow-hidden rounded-4xl shadow-premium">
              <img
                src={encodeURI("/pictures/Über uns/Technische-03.jpg")}
                alt="Technische Entwicklung bei Dalemans"
                className="h-full min-h-[200px] w-full object-cover"
              />
            </div>
            <div className="image-zoom-hover overflow-hidden rounded-4xl shadow-premium">
              <img
                src={encodeURI("/pictures/Über uns/CAD-Entwicklung1zu1.png")}
                alt="CAD-Entwicklung bei Dalemans"
                className="h-full min-h-[200px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="relative overflow-hidden rounded-5xl bg-premium-charcoal px-8 py-14 text-center shadow-premium-lg md:px-14 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-premium-sand/10 via-transparent to-premium-ink/30"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="section-eyebrow text-premium-sand">Gemeinsam planen</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Sie planen einen neuen Raum?
          </h2>
          <p className="mt-5 text-base leading-8 text-white/70 md:text-lg">
            Wir helfen bei Bestuhlung, Möbelauswahl und Raumwirkung — ruhig,
            persönlich und mit Blick auf Ihre Nutzung vor Ort.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/kontakt" className="btn-on-dark">
              Projekt besprechen
            </Link>
            <Link href="/produkte" className="btn-outline-dark">
              Lösungen ansehen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

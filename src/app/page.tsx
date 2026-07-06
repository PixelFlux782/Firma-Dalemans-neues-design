import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { StructuredData } from "@/components/StructuredData";
import HeroSection from "@/components/home/HeroSection";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { productCategories } from "@/lib/product-categories";
import { products } from "@/lib/products";
import { absoluteUrl, buildMetadata, siteName } from "@/lib/seo";

const featuredProducts = [
  "stapelstuhl-mod-1021c",
  "klapptisch-310c",
  "trapezklapptisch-310c",
  "stuhltransportwagen",
]
  .map((slug) => products.find((product) => product.slug === slug))
  .filter(Boolean)
  .slice(0, 4);

export const metadata: Metadata = buildMetadata({
  title: "DLMNS Stapelstühle & Klapptische für Gemeinden und Säle",
  description:
    "DLMNS Stapelstühle & Klapptische liefert robuste Stapelstühle, Klapptische, Zubehör und persönliche Beratung für Gemeinden, Säle, Vereine und flexible Räume.",
  path: "/",
  keywords: [
    "Stapelstühle für Gemeinden",
    "Klapptische für Gemeinden",
    "Gemeindestühle",
    "Saalmöbel",
    "Transportwagen Stühle",
    "DLMNS",
  ],
});

const orientation = [
  {
    title: "Stapelstühle",
    href: "/produkte/kategorien/stapelstuehle",
    text: "Robuste Reihen- und Flächenbestuhlung für Gemeinden, Säle und Veranstaltungen.",
  },
  {
    title: "Klapptische",
    href: "/produkte/kategorien/klapptische",
    text: "Flexible Tischlösungen für Seminare, Gemeindecafé, Buffet und Sondermaße.",
  },
  {
    title: "Gemeindestühle & Bankett",
    href: "/produkte/kategorien/gemeindestuehle-bankettmoebel",
    text: "Komfort und ein ruhiges Gesamtbild für Gottesdienste, Feiern und Bankette.",
  },
  {
    title: "Transportwagen & Zubehör",
    href: "/produkte/kategorien/transportwagen-zubehoer",
    text: "Zubehör, Reihenverbinder, Buchablagen und Wagen für klare Abläufe.",
  },
] as const;

const reasons = [
  "langlebig statt billig",
  "persönliche Beratung zu Nutzung, Bestand und Budget",
  "Erfahrung mit Gemeinden, Sälen und Vereinen",
  "Sonderlösungen mit Skizze, CAD und praktischer Umsetzung",
  "Ersatzteile, Zubehör und Transportlogik mitgedacht",
] as const;

const finder = [
  {
    title: "Ich richte einen Gemeindesaal ein",
    href: "/raumloesungen/gemeindesaal",
    text: "Bestuhlung, Tische, Reihen, Wege und Lagerung gemeinsam planen.",
  },
  {
    title: "Ich brauche flexible Tische",
    href: "/produkte/kategorien/klapptische",
    text: "Klapptische, Trapeztische und Sondermaße für wechselnde Nutzung.",
  },
  {
    title: "Ich brauche viele robuste Stühle",
    href: "/produkte/kategorien/stapelstuehle",
    text: "Stapelstühle für hohe Stückzahlen, häufige Umbauten und lange Nutzung.",
  },
  {
    title: "Ich suche Zubehör oder Transportwagen",
    href: "/produkte/kategorien/transportwagen-zubehoer",
    text: "Transport, Reihenverbindung, Gleiter und Buchablagen passend zum Bestand.",
  },
  {
    title: "Ich habe Sondermaße oder Sonderwünsche",
    href: "/sonderloesungen",
    text: "Von der Skizze über CAD bis zur umsetzbaren Sonderlösung.",
  },
] as const;

const rooms = [
  "Gemeindesaal",
  "Seminarraum",
  "Mehrzweckraum",
  "Veranstaltungssaal",
  "Kantine / Sozialraum",
] as const;

const planningTopics = [
  "Raumgröße und Laufwege",
  "Reihenbestuhlung und Sichtachsen",
  "Stapelung und Lagerfläche",
  "Transportwagen und Zubehör",
  "Budget, Pflege und Ersatzteile",
  "Auf- und Abbau mit Ehrenamtlichen",
] as const;

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": absoluteUrl("/#business"),
      name: siteName,
      alternateName: "DLMNS Stapelstühle & Klapptische",
      url: absoluteUrl("/"),
      image: absoluteUrl("/pictures/Produkte/Stühle/1021c-01.jpg"),
      logo: absoluteUrl("/pictures/Über uns/dalemans_logo1.png"),
      description:
        "Robuste Stapelstühle, Klapptische, Gemeindestühle, Zubehör und Beratung für Gemeinden, Säle, Vereine und flexible Räume.",
      telephone: "+49 9342 9153-53",
      email: "info@dalemans.de",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bollenwaldstraße 108a",
        postalCode: "63743",
        addressLocality: "Aschaffenburg",
        addressCountry: "DE",
      },
      areaServed: "DE",
      knowsAbout: [
        "Stapelstühle",
        "Klapptische",
        "Gemeindemobiliar",
        "Transportwagen",
        "Sonderlösungen",
      ],
    },
    {
      "@type": "ItemList",
      "@id": absoluteUrl("/#categories"),
      name: "Produktkategorien",
      itemListElement: productCategories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: category.name,
        url: absoluteUrl(`/produkte/kategorien/${category.id}`),
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <div className="page-stack">
      <StructuredData data={homeStructuredData} />
      <HeroSection />

      <HomeSection>
        <div className="grid gap-8 rounded-5xl border border-premium-sage/70 bg-premium-warm/70 p-6 shadow-premium md:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:p-10">
          <div className="flex flex-col justify-center">
            <p className="section-eyebrow">Beratung zuerst</p>
            <h2 className="section-title mt-4 text-balance">
              Gemeindesaal planen, bevor Stühle und Tische einzeln entschieden
              werden.
            </h2>
            <p className="section-lead mt-5">
              Wir schauen früh auf Raumgröße, Reihenbestuhlung, Lagerung,
              Transportwagen, Budget und Pflege. So entsteht eine Ausstattung,
              die im Gottesdienst, beim Gemeindecafé und beim schnellen Umbau
              funktioniert.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/kontakt" className="btn-primary text-center">
                Gemeindesaal planen
              </Link>
              <Link href="/produkte" className="btn-secondary text-center">
                Produkte ansehen
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {planningTopics.map((topic) => (
              <div
                key={topic}
                className="rounded-3xl border border-white/70 bg-white/62 px-5 py-4 text-sm font-medium leading-7 text-premium-charcoal shadow-inner-soft"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {orientation.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group border-t border-premium-sage/80 pt-5 transition hover:border-premium-forest"
            >
              <p className="section-eyebrow text-[0.65rem]">Direkt finden</p>
              <h2 className="mt-3 font-display text-xl font-medium text-premium-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-premium-muted">
                {item.text}
              </p>
              <span className="mt-4 inline-flex text-sm font-medium text-premium-bronze transition group-hover:text-premium-forest">
                Kategorie öffnen
              </span>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">Warum DLMNS</p>
            <h2 className="section-title mt-5 text-balance">
              Praktische Ausstattung für Räume, die wirklich genutzt werden.
            </h2>
            <p className="section-lead mt-6">
              DLMNS Stapelstühle & Klapptische ist die praktische Wurzel der
              Gruppe: langlebige Produkte, persönliche Beratung und Lösungen,
              die Auf- und Abbau, Lagerung und Raumwirkung zusammendenken.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/kontakt" className="btn-primary text-center">
                Beratung anfragen
              </Link>
              <Link href="/beratung/stapelstuehle-kaufen" className="btn-secondary text-center">
                Kaufberatung lesen
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => (
              <div
                key={reason}
                className="rounded-3xl border border-premium-beige/60 bg-white/70 p-5 shadow-premium"
              >
                <span className="block h-px w-8 bg-premium-sand" aria-hidden />
                <p className="mt-4 text-sm font-medium leading-7 text-premium-charcoal">
                  {reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader
          eyebrow="Produkt- und Raumfinder"
          title="Welcher Einstieg passt zu Ihrem Vorhaben?"
          lead="Schnell zur passenden Kategorie, Raumlösung oder Sonderberatung."
          align="editorial"
        />

        <div className="section-grid-top grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {finder.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="premium-card premium-card-hover flex h-full flex-col p-6"
            >
              <h3 className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
                {item.title}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-7 text-premium-muted">
                {item.text}
              </p>
              <span className="mt-6 text-sm font-medium text-premium-bronze">
                Einstieg öffnen
              </span>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection>
        <SectionHeader
          eyebrow="Ausgewählte Produkte"
          title="Produkte, die im Raum überzeugen"
          lead="Produktkarten mit Bild, Einsatzbereich, Vorteilen und direktem Weg zur Anfrage."
          href="/produkte"
          linkLabel="Alle Produkte"
          align="editorial"
        />

        <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) =>
            product ? <ProductCard key={product.slug} product={product} /> : null,
          )}
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">Raumlösungen</p>
            <h2 className="section-title mt-5 text-balance">
              Ausstattung nach Nutzung statt nach Katalogseite.
            </h2>
            <p className="section-lead mt-6">
              Ob Gemeindesaal, Seminarraum oder Sozialraum: Entscheidend ist,
              wie Menschen den Raum nutzen, wie schnell umgebaut wird und wo
              Stühle, Tische und Zubehör nachher sauber lagern.
            </p>
            <Link href="/raumloesungen/gemeindesaal" className="btn-primary mt-9 inline-flex">
              Gemeindesaal planen
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room) => (
              <div key={room} className="premium-card p-6">
                <p className="font-display text-xl font-medium text-premium-ink">
                  {room}
                </p>
                <p className="mt-3 text-sm leading-7 text-premium-muted">
                  Stühle, Tische, Wege, Lagerung und Zubehör passend zur realen
                  Nutzung abstimmen.
                </p>
              </div>
            ))}
          </div>
        </div>
      </HomeSection>

      <section className="relative overflow-hidden rounded-6xl bg-premium-espresso text-premium-canvas shadow-premium-xl">
        <div className="grid lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3 p-5 md:p-8">
            <Image
              src={encodeURI("/pictures/Über uns/Skizze01.jpg")}
              alt="Skizze einer Sonderlösung"
              width={420}
              height={320}
              sizes="(min-width: 1024px) 24vw, 50vw"
              className="h-48 w-full rounded-4xl object-cover md:h-64"
            />
            <Image
              src={encodeURI("/pictures/Über uns/CAD-Entwicklung1zu1.png")}
              alt="CAD Planung für Sonderlösung"
              width={420}
              height={320}
              sizes="(min-width: 1024px) 24vw, 50vw"
              className="h-48 w-full rounded-4xl object-cover md:h-64"
            />
            <Image
              src={encodeURI("/pictures/Über uns/Werkstatt-24.jpg")}
              alt="Umsetzung in Werkstatt und Fertigung"
              width={860}
              height={420}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="col-span-2 h-56 w-full rounded-4xl object-cover md:h-72"
            />
          </div>

          <div className="flex flex-col justify-center px-8 py-14 md:px-14 md:py-20">
            <p className="section-eyebrow text-premium-sand">Sonderlösungen</p>
            <h2 className="font-display mt-5 text-3xl font-medium leading-[1.12] tracking-[-0.02em] md:text-4xl">
              Skizze, Planung, Umsetzung: wenn Standard nicht reicht.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-[1.8] text-white/72 md:text-base">
              Sondermaße, besondere Tischformen, Zubehör oder Anpassungen an
              vorhandene Bestände werden nicht als Randthema behandelt, sondern
              als Teil der Beratung.
            </p>
            <Link href="/sonderloesungen" className="btn-on-dark mt-10 w-fit">
              Sonderlösung besprechen
            </Link>
          </div>
        </div>
      </section>

      <HomeSection variant="elevated">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="image-depth overflow-hidden rounded-5xl shadow-premium-lg">
            <Image
              src={encodeURI("/pictures/Über uns/Passbild_Stefan_F_edit.jpg")}
              alt="Stefan Dalemans als persönlicher Ansprechpartner"
              width={560}
              height={640}
              sizes="(min-width: 1024px) 32vw, 100vw"
              className="h-full min-h-[320px] w-full object-cover object-top"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="section-eyebrow">Familiengeschichte</p>
            <h2 className="section-title mt-5 text-balance">
              Gewachsen aus Beratung, Werkstatt und Gemeindepraxis.
            </h2>
            <p className="section-lead mt-6">
              Die christlichen Gemeindewurzeln gehören ehrlich zur Geschichte:
              nicht als lange Textwand, sondern als Grund dafür, warum DLMNS
              Räume für Begegnung, Gottesdienst, Vereine und Veranstaltungen so
              praktisch versteht.
            </p>
            <Link href="/firma" className="btn-secondary mt-9 w-fit">
              Firma kennenlernen
            </Link>
          </div>
        </div>
      </HomeSection>

      <PremiumCtaSection
        title="Sie planen Bestuhlung, Tische oder Zubehör?"
        lead="Senden Sie Stückzahlen, Raumgröße oder ein Foto vom Raum. Wir helfen bei Auswahl, Varianten, Transport und Sonderlösungen."
        primaryHref="/kontakt"
        primaryLabel="Beratung anfragen"
        secondaryHref="/produkte"
        secondaryLabel="Produkte ansehen"
      />
    </div>
  );
}

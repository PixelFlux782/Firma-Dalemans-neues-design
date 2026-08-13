import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductVisual from "@/components/ProductVisual";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Räume & Planung für flexible Gemeinderäume",
  description: "Gemeindesaal, Gottesdienstraum und Mehrzweckraum ganzheitlich planen: Bestuhlung, Tische, Fluchtwege, Umbau, Transport und Lagerung.",
  path: "/raeume-planung",
  image: "/neue bilder/Sonderlösungen/Räume-u-Planung.png",
  keywords: ["flexible Gemeinderäume", "Kirchenbestuhlung", "Bestuhlungsplanung", "Ausstattung Gemeindezentrum"],
});

const rooms = [
  ["Gottesdienstraum", "Reihen, Sicht, Buchablagen und unterschiedliche Besucherzahlen."],
  ["Gemeindesaal", "Gottesdienst, Essen, Begegnung und Veranstaltung in einem Raum."],
  ["Mehrzweckraum", "Schneller Wechsel zwischen Bestuhlung, Tischen und freier Fläche."],
  ["Seminarraum", "Tischordnungen für Vortrag, Gruppenarbeit und Gespräch."],
  ["Kinder- & Jugendraum", "Robuste, gut handhabbare Ausstattung für wechselnde Programme."],
  ["Gemeindecafé & Speisesaal", "Tische, Stühle und Laufwege für Begegnung und Bewirtung."],
  ["Foyer", "Flexible Nebenflächen für Empfang, Austausch und Zusatznutzung."],
] as const;

const challenges = [
  ["Schwierige Geometrie oder Säulen", "/raeume-planung/raumplanung#geometrie", "Geometrie und Nutzungsvarianten im Plan prüfen."],
  ["Fluchtwege und Reihen", "/raeume-planung/raumplanung#stellplaene", "Stellpläne und Wege projektbezogen betrachten."],
  ["Wenig Lagerfläche", "#transport", "Stapelung, Wagen und verfügbare Flächen zusammendenken."],
  ["Häufiger Auf- und Abbau", "/beratung-service#ablauf", "Handgriffe und Transportwege für Helfer vereinfachen."],
  ["Vorhandene Bestuhlung ergänzen", "/beratung-service#langfristig", "Modell, Ausführung und passende Ergänzung klären."],
  ["Stoff- und Farbauswahl", "/beratung-service#bemusterung", "Materialwirkung mit Musterstuhl und Stoffmustern prüfen."],
] as const;

export default function RaeumePlanungPage() {
  return (
    <div className="page-stack">
      <section className="products-hero relative -mx-5 min-h-[650px] overflow-hidden sm:-mx-6 md:mx-0 md:min-h-[560px]">
          <div className="products-hero-media absolute inset-0">
          <Image
            src={encodeURI("/neue bilder/Sonderlösungen/Räume-u-Planung.png")}
            alt="Vom CAD-Entwurf zum eingerichteten Gemeinderaum mit flexibler Tischbestuhlung"
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="origin-left scale-[1.1] object-cover object-left"
          />
        </div>
        <div className="raeume-planung-hero-shade pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-20 flex min-h-[650px] items-end px-5 pb-14 pt-20 sm:px-8 md:min-h-[560px] md:items-center md:px-12 md:py-16 lg:px-16">
          <div className="max-w-[42rem] md:w-[61%]">
            <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Räume & Planung" }]} currentPath="/raeume-planung" />
            <p className="section-eyebrow mt-7">Räume & Planung</p>
            <h1 className="mt-3 max-w-[17ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Ausstattung entsteht aus Raum, Nutzung und Alltag.</h1>
            <p className="mt-4 max-w-[38rem] text-base leading-7 text-premium-muted">Wir betrachten nicht nur einzelne Stühle und Tische, sondern auch Reihen, Wege, Umbau, Transport, Lagerung und die Menschen, die den Raum täglich nutzen.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kontakt?raum=Raumplanung" className="btn-primary px-6 py-3">Raum besprechen</Link>
              <Link href="/raeume-planung/raumplanung" className="btn-secondary px-6 py-3">Planungsleistungen</Link>
            </div>
          </div>
        </div>
      </section>

      <HomeSection>
        <SectionHeader eyebrow="Nutzungssituationen" title="Welcher Alltag soll in Ihrem Raum funktionieren?" lead="Nicht jeder Raum braucht eine eigene Produktliste. Entscheidend ist, wie sich Veranstaltungen, Besucherzahlen und Abläufe verändern." align="editorial" />
        <div className="section-grid-top grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map(([title, text]) => <article key={title} className="premium-card p-6"><h2 className="font-display text-xl font-medium text-premium-ink">{title}</h2><p className="mt-3 text-sm leading-7 text-premium-muted">{text}</p></article>)}
        </div>
        <Link href="/raumloesungen/gemeindesaal" className="btn-secondary mt-8 inline-flex">Gemeindesaal im Detail planen</Link>
      </HomeSection>

      <HomeSection id="herausforderungen" variant="elevated">
        <SectionHeader eyebrow="Vom Problem zur Leistung" title="Typische Herausforderungen gezielt lösen" lead="Jede Frage führt zu der Leistung, die sie tatsächlich klären kann." align="editorial" />
        <div className="section-grid-top grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map(([title, href, text]) => <Link key={title} href={href} className="premium-card premium-card-hover p-7"><h2 className="font-display text-xl font-medium text-premium-ink">{title}</h2><p className="mt-3 text-sm leading-7 text-premium-muted">{text}</p><span className="mt-5 inline-flex text-sm font-medium text-premium-bronze">Passenden Weg öffnen →</span></Link>)}
        </div>
      </HomeSection>

      <HomeSection>
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="premium-card overflow-hidden">
            <Image src={encodeURI("/neue bilder/planung-schritt-3.png")} alt="CAD-Planung für eine individuelle Raumlösung" width={760} height={440} sizes="(min-width: 1024px) 50vw, 100vw" className="h-64 w-full object-cover" />
            <div className="p-7"><p className="section-eyebrow">Raum- & Bestuhlungsplanung</p><h2 className="mt-4 font-display text-3xl font-medium text-premium-ink">Nutzungsvarianten vor der Bestellung prüfen.</h2><p className="mt-4 text-sm leading-7 text-premium-muted">Je nach Projekt helfen 2D- oder 3D-Darstellungen, Stellpläne, Tischanordnungen und die Prüfung schwieriger Geometrien.</p><Link href="/raeume-planung/raumplanung" className="btn-primary mt-7 inline-flex">Raumplanung im Detail</Link></div>
          </article>
          <article id="transport">
            <ProductVisual src="/neue bilder/Zubehör/Tischtransportwagen_02.png" alt="Tischtransportwagen für Lagerung und Saalumbau" sizes="(min-width: 1024px) 50vw, 100vw" aspectRatio="3 / 2" imageInset="5%" backgroundTone="canvas" />
            <div className="p-7"><p className="section-eyebrow">Transport- & Lagerplanung</p><h2 className="mt-4 font-display text-3xl font-medium text-premium-ink">Auf- und Abbau von Anfang an mitdenken.</h2><p className="mt-4 text-sm leading-7 text-premium-muted">Passende Wagen, Lagerflächen, Transportwege und sichere Handhabung schützen Möbel und Böden und entlasten ehrenamtliche Teams.</p><Link href="/kontakt?anliegen=Lager%20und%20Transport" className="btn-primary mt-7 inline-flex">Lager und Transport mitplanen</Link></div>
          </article>
        </div>
      </HomeSection>

      <PremiumCtaSection title="Passt die geplante Ausstattung wirklich in Ihren Raum?" lead="Senden Sie einen vorhandenen Grundriss, Fotos oder eine kurze Beschreibung der Nutzungen. Wir klären den sinnvollen nächsten Schritt." primaryHref="/kontakt?raum=Raumplanung" primaryLabel="Raumplan prüfen lassen" secondaryHref="/produkte" secondaryLabel="Produktgruppen ansehen" reassurance="Auch eine kurze Beschreibung ohne fertigen Grundriss reicht für den Einstieg." showDirectContact />
    </div>
  );
}

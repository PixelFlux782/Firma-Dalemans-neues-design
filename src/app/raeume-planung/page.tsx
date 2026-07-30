import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Räume & Planung für flexible Gemeinderäume",
  description: "Gemeindesaal, Gottesdienstraum und Mehrzweckraum ganzheitlich planen: Bestuhlung, Tische, Fluchtwege, Umbau, Transport und Lagerung.",
  path: "/raeume-planung",
  image: "/pictures/Über uns/Realisierte-11.jpg",
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
      <CinematicPageHero
        eyebrow="Räume & Planung"
        title="Ausstattung entsteht aus Raum, Nutzung und Alltag."
        lead="Wir betrachten nicht nur einzelne Stühle und Tische, sondern auch Reihen, Wege, Umbau, Transport, Lagerung und die Menschen, die den Raum täglich nutzen."
        breadcrumbs={[{ label: "Start", href: "/" }, { label: "Räume & Planung" }]}
        mediaAriaLabel="Flexibler Gemeinderaum"
        mood="stone-arch"
        actions={<><Link href="/kontakt?raum=Raumplanung" className="btn-hero-primary">Raum besprechen</Link><Link href="/raeume-planung/raumplanung" className="btn-hero-secondary">Planungsleistungen</Link></>}
        visual={<Image src={encodeURI("/pictures/Über uns/Realisierte-11.jpg")} alt="Bestuhlter Gemeinderaum als Grundlage der Raumplanung" width={760} height={500} priority sizes="(min-width: 1024px) 42vw, 100vw" className="min-h-72 w-full object-cover" />}
      />

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
            <Image src={encodeURI("/pictures/Über uns/CAD-Entwicklung.png")} alt="CAD-Planung für eine individuelle Raumlösung" width={760} height={440} sizes="(min-width: 1024px) 50vw, 100vw" className="h-64 w-full object-cover" />
            <div className="p-7"><p className="section-eyebrow">Raum- & Bestuhlungsplanung</p><h2 className="mt-4 font-display text-3xl font-medium text-premium-ink">Nutzungsvarianten vor der Bestellung prüfen.</h2><p className="mt-4 text-sm leading-7 text-premium-muted">Je nach Projekt helfen 2D- oder 3D-Darstellungen, Stellpläne, Tischanordnungen und die Prüfung schwieriger Geometrien.</p><Link href="/raeume-planung/raumplanung" className="btn-primary mt-7 inline-flex">Raumplanung im Detail</Link></div>
          </article>
          <article id="transport" className="premium-card overflow-hidden">
            <Image src={encodeURI("/pictures/Produkte/Zubehör/Tischtransportwagen_02.jpg")} alt="Tischtransportwagen für Lagerung und Saalumbau" width={760} height={440} sizes="(min-width: 1024px) 50vw, 100vw" className="h-64 w-full object-cover" />
            <div className="p-7"><p className="section-eyebrow">Transport- & Lagerplanung</p><h2 className="mt-4 font-display text-3xl font-medium text-premium-ink">Auf- und Abbau von Anfang an mitdenken.</h2><p className="mt-4 text-sm leading-7 text-premium-muted">Passende Wagen, Lagerflächen, Transportwege und sichere Handhabung schützen Möbel und Böden und entlasten ehrenamtliche Teams.</p><Link href="/kontakt?anliegen=Lager%20und%20Transport" className="btn-primary mt-7 inline-flex">Lager und Transport mitplanen</Link></div>
          </article>
        </div>
      </HomeSection>

      <PremiumCtaSection title="Passt die geplante Ausstattung wirklich in Ihren Raum?" lead="Senden Sie einen vorhandenen Grundriss, Fotos oder eine kurze Beschreibung der Nutzungen. Wir klären den sinnvollen nächsten Schritt." primaryHref="/kontakt?raum=Raumplanung" primaryLabel="Raumplan prüfen lassen" secondaryHref="/produkte" secondaryLabel="Produktgruppen ansehen" />
    </div>
  );
}

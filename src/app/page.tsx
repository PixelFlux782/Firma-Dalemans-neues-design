import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { organizationStructuredData } from "@/lib/company";

export const metadata: Metadata = buildMetadata({
  title: "Flexible Ausstattung für Gemeinderäume",
  description:
    "DLMNS plant Stapelstühle, Klapptische, Raumaufteilung, Transport und langfristige Ausstattung für Gemeinden und flexible Räume – persönlich seit 1994.",
  path: "/",
  image: "/pictures/Über uns/Realisierte-11.jpg",
  keywords: ["Stapelstühle für Gemeinden", "Klapptische für Gemeinden", "Bestuhlungsplanung", "flexible Gemeinderäume"],
});

const entries = [
  { title: "Produkte auswählen", text: "Sie wissen schon, ob Stühle, Tische oder Zubehör fehlen.", href: "/produkte", label: "Produktgruppen öffnen" },
  { title: "Raum planen", text: "Nutzung, Bestuhlung, Wege und Lagerung sollen zusammenpassen.", href: "/raeume-planung", label: "Räume & Planung ansehen" },
  { title: "Herausforderung lösen", text: "Säulen, wenig Lagerfläche oder schnelle Umbauten brauchen eine praktische Antwort.", href: "/raeume-planung#herausforderungen", label: "Typische Lösungen finden" },
  { title: "Persönlich beraten lassen", text: "Sie möchten erst klären, welche Lösung wirklich zum Raum passt.", href: "/beratung-service", label: "Beratung & Service ansehen" },
] as const;

const groups = [
  { title: "Stapelstühle", text: "Für Reihen, häufige Umbauten und platzsparende Lagerung.", href: "/produkte/kategorien/stapelstuehle", cta: "Stapelstühle ansehen", image: "/images/optimized/stapelstuhl-1021c.webp", featured: true },
  { title: "Klapptische", text: "Für Gemeindecafé, Seminar, Feier und wechselnde Tischordnungen.", href: "/produkte/kategorien/klapptische", cta: "Klapptische ansehen", image: "/pictures/Produkte/Tische/Klapptisch_Stapeltisch_t310ccolor_02.jpg", featured: true },
  { title: "Buchablagen", text: "Praktische Ergänzung für Gottesdienst und Gemeindesaal.", href: "/produkte/buchablage", cta: "Buchablage prüfen", image: "/pictures/Über uns/Zubehor-06.jpg", featured: false },
  { title: "Transportwagen", text: "Damit Auf- und Abbau mit wenigen Helfern verlässlich gelingt.", href: "/produkte/stuhltransportwagen", cta: "Transportwagen ansehen", image: "/pictures/Produkte/Zubehör/Stapelstuhl_Stuhltransportwagen_02.jpg", featured: false },
  { title: "Reihenverbinder & Zubehör", text: "Für geordnete Reihen und die Abstimmung mit dem vorhandenen Bestand.", href: "/produkte/reihenverbinder", cta: "Reihenverbinder prüfen", image: "/neue bilder/Stapelstühle/stuhlverbinder1.png", featured: false },
  { title: "Ersatzteile & Gleiter", text: "Passende Teile am Gestell und am vorhandenen Boden prüfen lassen.", href: "/produkte/stuhlgleiter", cta: "Ersatzteil finden", image: "/neue bilder/Zubehör/gummistopfen-schwarz1.png", featured: false },
] as const;

const challenges = [
  ["Säulen und schwierige Raumformen", "/raeume-planung/raumplanung#geometrie", "Raumgeometrie planen"],
  ["Wenig Lagerfläche", "/raeume-planung#transport", "Lager und Transport mitplanen"],
  ["Schnelle Umbauten", "/beratung-service#ablauf", "Abläufe beraten lassen"],
  ["Sichere Reihenverbindung", "/produkte/reihenverbinder", "Reihenverbinder prüfen"],
  ["Stellpläne und Fluchtwege", "/raeume-planung/raumplanung", "Raumplan prüfen lassen"],
  ["Ergänzung nach vielen Jahren", "/beratung-service#langfristig", "Bestand ergänzen"],
] as const;

const process = [
  ["01", "Raum und Nutzung verstehen", "Welche Veranstaltungen, Wege und Umbauten prägen den Alltag?"],
  ["02", "Produkte und Varianten auswählen", "Stühle, Tische, Zubehör und Materialien werden gemeinsam betrachtet."],
  ["03", "In 2D oder 3D planen", "Je nach Projekt prüfen wir Anordnungen, Geometrien und Nutzungsvarianten."],
  ["04", "Muster und Materialien prüfen", "Musterstuhl, Stoffe und Farben geben Entscheidungssicherheit."],
  ["05", "Lieferung und Betreuung", "Einweisung, Ersatzteile und Nachbestellungen bleiben mitgedacht."],
] as const;

export default function HomePage() {
  const heroDesktop = getImageProps({
    src: "/images/optimized/hero/gemeinderaum-bestuhlung-desktop.jpg",
    alt: "Heller Gemeindesaal mit Reihen aus Holzstühlen und freiem Mittelgang",
    width: 1536,
    height: 1024,
    priority: true,
    sizes: "(min-width: 1024px) 58vw, 100vw",
  }).props;
  const heroMobile = getImageProps({
    src: "/images/optimized/hero/gemeinderaum-bestuhlung-mobile.jpg",
    alt: "Heller Gemeindesaal mit Reihen aus Holzstühlen und freiem Mittelgang",
    width: 900,
    height: 1120,
    sizes: "100vw",
  }).props;

  return (
    <div className="page-stack">
      <StructuredData data={{ "@context": "https://schema.org", "@graph": [organizationStructuredData, { "@type": "WebSite", name: "DLMNS Stapelstühle & Klapptische", url: absoluteUrl("/") }] }} />

      <section className="hero-architectural relative -mx-5 overflow-hidden border-y border-premium-beige bg-premium-highlight shadow-premium-xl sm:-mx-6 md:mx-0 md:rounded-[2.5rem] md:border">
        <div className="grid lg:min-h-[min(72vh,760px)] lg:grid-cols-[.88fr_1.12fr]">
          <div className="relative z-10 flex flex-col justify-center px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-14 xl:px-16">
            <div className="absolute inset-y-8 right-0 hidden w-px bg-premium-beige lg:block" aria-hidden />
            <p className="section-eyebrow">DLMNS Stapelstühle & Klapptische</p>
            <div className="mt-5 flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-premium-muted">
              <span>Seit 1994</span><span className="h-px w-8 bg-premium-stone" aria-hidden /><span>Persönlich geplant</span>
            </div>
            <h1 className="mt-6 max-w-[13ch] font-display text-[2.35rem] font-medium leading-[1.04] tracking-[-0.035em] text-premium-ink sm:text-[3.15rem] lg:text-[3.5rem]">
              Flexible Ausstattung für Räume, in denen Gemeinde lebt.
            </h1>
            <p className="mt-6 max-w-xl text-[0.95rem] leading-7 text-premium-muted md:text-base md:leading-8">
              Kein anonymer Möbelshop, sondern persönliche Raum- und Ausstattungsberatung für Bestuhlung, Tische und langfristige Nutzung.
            </p>
            <p className="mt-6 border-l border-premium-stone pl-4 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-premium-bronze">
              Raumplanung · Bestuhlung · Sonderlösungen
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/kontakt?anliegen=Raum%20und%20Bestuhlung" className="btn-primary group justify-center rounded-xl px-6">
                Raum & Bestuhlung besprechen <span aria-hidden className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link href="/produkte/kategorien/stapelstuehle" className="btn-secondary justify-center rounded-xl px-6">Produkte ansehen</Link>
            </div>
            <a href="tel:+499342915353" className="mt-6 inline-flex w-fit items-center gap-3 text-sm font-semibold text-premium-ink transition hover:text-premium-bronze">
              <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-premium-subtle">Direktkontakt</span>
              +49 9342 9153-53
            </a>
          </div>
          <div className="relative min-h-[360px] overflow-hidden sm:min-h-[440px] lg:min-h-full">
            <picture>
              <source media="(max-width: 639px)" srcSet={heroMobile.srcSet} />
              <img
                {...heroDesktop}
                alt="Heller Gemeindesaal mit Reihen aus Holzstühlen und freiem Mittelgang"
                className="absolute inset-0 h-full w-full object-cover object-[55%_50%]"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-premium-espresso/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-premium-highlight/20 lg:via-transparent lg:to-transparent" aria-hidden />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between border-t border-white/70 pt-3 text-white drop-shadow-[0_1px_5px_rgba(0,0,0,.55)] sm:bottom-7 sm:left-7 sm:right-7">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]">Gemeinderaum · flexibel bestuhlt</span>
              <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.14em] sm:block">Planung / Nutzung / Bestand</span>
            </div>
          </div>
        </div>
      </section>

      <HomeSection>
        <div className="company-intro-grid grid gap-10 border-y border-premium-beige py-10 md:py-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div className="lg:pr-6">
            <p className="section-eyebrow">Erfahrung, die den ganzen Raum sieht</p>
            <h2 className="mt-5 max-w-xl font-display text-3xl font-medium leading-[1.14] tracking-[-0.025em] text-premium-ink md:text-4xl">
              Planung, Gemeindeverständnis und langfristige Betreuung gehören zusammen.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-premium-muted md:text-base md:leading-8">
              Seit 1994 begleitet Dalemans Gemeinden, Kirchen und flexible Veranstaltungsräume bei Auswahl, Planung und langfristiger Nutzung ihrer Ausstattung. Wir betrachten nicht nur Stuhl oder Tisch, sondern den gesamten Raum – von Bestuhlung und Fluchtwegen bis zu Transport, Lagerung und Nachbestellung.
            </p>
            <p className="mt-5 max-w-xl border-l-2 border-premium-sand pl-5 text-sm font-medium leading-7 text-premium-charcoal">
              Gemeinde ist für uns nicht nur eine Zielgruppe, sondern Teil unserer eigenen Geschichte.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-premium-beige bg-premium-beige sm:grid-cols-2">
            <div className="bg-premium-forest p-6 text-white sm:p-7">
              <span className="font-mono text-[0.62rem] tracking-[0.18em] text-premium-sand">01 / ERFAHRUNG</span>
              <strong className="mt-7 block font-display text-4xl font-medium">Seit 1994</strong>
              <span className="mt-2 block text-sm text-white/70">persönlich begleitet und geplant</span>
            </div>
            <div className="bg-premium-warm p-6 sm:p-7">
              <span className="font-mono text-[0.62rem] tracking-[0.18em] text-premium-bronze">02 / RÄUME</span>
              <strong className="mt-7 block font-display text-4xl font-medium text-premium-ink">1.000+</strong>
              <span className="mt-2 block text-sm text-premium-muted">ausgestattete Räume und Gemeinden</span>
            </div>
            {[
              ["03", "Gemeindenähe", "Rund 90 % Kunden aus dem freikirchlichen Umfeld"],
              ["04", "Raumplanung", "2D- und 3D-Planung für konkrete Nutzungen"],
              ["05", "Werkstatt", "Eigene Werkstatt für praktische Lösungen"],
              ["06", "Langfristig", "Ersatzteile und Nachbestellungen auch nach Jahren"],
            ].map(([number, title, text]) => (
              <div key={number} className="bg-white/70 p-5 sm:p-6">
                <span className="font-mono text-[0.6rem] tracking-[0.16em] text-premium-bronze">{number}</span>
                <h3 className="mt-4 text-sm font-semibold text-premium-ink">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-premium-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader eyebrow="Ihr Einstieg" title="Was möchten Sie als Nächstes klären?" lead="Produkte, Raum und Beratung greifen ineinander. Starten Sie dort, wo Ihr Projekt gerade steht." align="editorial" />
        <div className="section-grid-top grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {entries.map((item, index) => (
            <Link key={item.title} href={item.href} className={`premium-card premium-card-hover flex min-h-64 flex-col p-7 ${index === 1 ? "bg-premium-warm/70" : ""}`}>
              <span className="font-mono text-xs text-premium-bronze">0{index + 1}</span>
              <h2 className="mt-5 font-display text-2xl font-medium text-premium-ink">{item.title}</h2>
              <p className="mt-4 flex-1 text-sm leading-7 text-premium-muted">{item.text}</p>
              <span className="mt-6 text-sm font-medium text-premium-bronze">{item.label} →</span>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection>
        <SectionHeader eyebrow="Kernprodukte" title="Vom Hauptmöbel bis zum passenden Detail" lead="Stapelstühle und Klapptische bilden die Basis. Zubehör, Transport und Ersatzteile machen die Ausstattung im Alltag vollständig." href="/produkte" linkLabel="Alle Produktgruppen" align="editorial" />
        <div className="section-grid-top grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {groups.map((group) => (
            <Link key={group.title} href={group.href} className={`premium-card premium-card-hover overflow-hidden ${group.featured ? "lg:col-span-3" : "lg:col-span-2"}`}>
              <Image src={encodeURI(group.image)} alt={`${group.title} für flexible Gemeinderäume`} width={720} height={440} sizes={group.featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"} className={`w-full object-cover ${group.featured ? "h-64" : "h-52"}`} />
              <div className="p-6">
                <h2 className="font-display text-2xl font-medium text-premium-ink">{group.title}</h2>
                <p className="mt-3 text-sm leading-7 text-premium-muted">{group.text}</p>
                <span className="mt-5 inline-flex text-sm font-medium text-premium-bronze">{group.cta} →</span>
              </div>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="section-eyebrow">Räume statt Einzelprodukte</p>
            <h2 className="section-title mt-5">Ein Raum muss nicht nur gut aussehen. Er muss im Alltag funktionieren.</h2>
            <p className="section-lead mt-6">Gottesdienst, Gemeindecafé, Seminar und Kinderprogramm stellen unterschiedliche Anforderungen. Wir planen Reihen, Tische, Wege, Lagerung und Transport als zusammenhängende Lösung.</p>
            <Link href="/raeume-planung" className="btn-primary mt-8 inline-flex">Raumtypen und Planung ansehen</Link>
          </div>
          <Image src={encodeURI("/pictures/Über uns/main_carousel_06.jpg")} alt="Gemeinderaum mit Bestuhlung für unterschiedliche Nutzungen" width={760} height={560} sizes="(min-width: 1024px) 50vw, 100vw" className="h-80 w-full rounded-5xl object-cover shadow-premium-lg" />
        </div>
      </HomeSection>

      <HomeSection id="herausforderungen">
        <SectionHeader eyebrow="Typische Herausforderungen" title="Konkrete Probleme brauchen konkrete Wege" lead="Nicht jede Frage beginnt mit einem Produkt. Oft beginnt sie mit einem Raum, einem Ablauf oder einem vorhandenen Bestand." align="editorial" />
        <div className="section-grid-top grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map(([title, href, label]) => (
            <Link key={title} href={href} className="premium-card premium-card-hover p-6">
              <h3 className="font-display text-xl font-medium text-premium-ink">{title}</h3>
              <span className="mt-5 inline-flex text-sm font-medium text-premium-bronze">{label} →</span>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <SectionHeader eyebrow="Planungsweg" title="Orientierung vom ersten Gespräch bis zur Nutzung" lead="Der genaue Ablauf bleibt projektabhängig. Diese fünf Schritte zeigen, welche Fragen wir gemeinsam klären." align="editorial" />
        <ol className="section-grid-top grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {process.map(([number, title, text]) => (
            <li key={number} className="border-t border-premium-sage pt-5">
              <span className="font-mono text-xs text-premium-bronze">{number}</span>
              <h3 className="mt-4 font-display text-xl font-medium text-premium-ink">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-premium-muted">{text}</p>
            </li>
          ))}
        </ol>
      </HomeSection>

      <HomeSection>
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="premium-card overflow-hidden lg:col-span-2">
            <Image src={encodeURI("/pictures/Über uns/CAD-Entwicklung.png")} alt="CAD-Ansicht für die Planung einer Raumausstattung" width={900} height={520} sizes="(min-width: 1024px) 66vw, 100vw" className="h-72 w-full object-cover" />
            <div className="p-7 md:p-9">
              <p className="section-eyebrow">Raum- und Bestuhlungsplanung</p>
              <h2 className="section-title mt-4">Vor der Bestellung sehen, ob die Lösung im Raum wirklich funktioniert.</h2>
              <p className="section-lead mt-5">2D- und 3D-Planung, Stellpläne, Reihenabstände, Fluchtwege, Tischordnungen und schwierige Geometrien werden je nach Projekt konkret geprüft.</p>
              <Link href="/raeume-planung/raumplanung" className="btn-primary mt-7 inline-flex">Raumplanung ansehen</Link>
            </div>
          </article>
          <article id="transport" className="premium-card overflow-hidden">
            <Image src={encodeURI("/pictures/Produkte/Zubehör/TransportwagenundZubehör.png")} alt="Transportwagen für den sicheren Transport von Stühlen" width={600} height={420} sizes="(min-width: 1024px) 33vw, 100vw" className="h-60 w-full object-cover" />
            <div className="p-7">
              <p className="section-eyebrow">Transport & Lagerung</p>
              <h2 className="mt-4 font-display text-2xl font-medium text-premium-ink">Flexibel wird Ausstattung erst mit guten Abläufen.</h2>
              <p className="mt-4 text-sm leading-7 text-premium-muted">Wagen, Stapelung, Lagerflächen und Transportwege werden für die Menschen geplant, die später auf- und abbauen.</p>
              <Link href="/kontakt?anliegen=Lager%20und%20Transport" className="mt-6 inline-flex text-sm font-medium text-premium-bronze">Lager und Transport mitplanen →</Link>
            </div>
          </article>
        </div>
      </HomeSection>

      <HomeSection variant="elevated">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="grid grid-cols-2 gap-3">
            <Image src={encodeURI("/neue bilder/Stoffe-Farben/Textilproben.png")} alt="Stoffmuster für die Auswahl von Bezugsfarben" width={520} height={420} sizes="(min-width: 1024px) 25vw, 50vw" className="h-56 w-full rounded-4xl object-cover" />
            <Image src={encodeURI("/neue bilder/Stoffe-Farben/beize-varianten.png")} alt="Beizmuster in unterschiedlichen Farbtönen" width={520} height={420} sizes="(min-width: 1024px) 25vw, 50vw" className="h-56 w-full rounded-4xl object-cover" />
            <Image src={encodeURI("/neue bilder/Produktion-Lager/Polster-Montage.png")} alt="Montage eines Sitzpolsters in der Werkstatt" width={900} height={480} sizes="(min-width: 1024px) 50vw, 100vw" className="col-span-2 h-56 w-full rounded-4xl object-cover" />
          </div>
          <div>
            <p className="section-eyebrow">Materialien & Bemusterung</p>
            <h2 className="section-title mt-5">Farben und Materialien im echten Raum entscheiden.</h2>
            <p className="section-lead mt-6">Stoffmuster, Holzbeizen und ein Musterstuhl helfen, Wirkung, Handhabung und die Abstimmung auf den Bestand sicherer zu beurteilen. Technische Eigenschaften klären wir produktbezogen.</p>
            <Link href="/kontakt?service=Stoffmuster%20und%20Musterstuhl" className="btn-primary mt-8 inline-flex">Stoffmuster oder Musterstuhl anfragen</Link>
          </div>
        </div>
      </HomeSection>

      <HomeSection>
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-5xl bg-premium-espresso p-8 text-white md:p-10">
            <p className="section-eyebrow text-premium-sand">Sonderlösungen</p>
            <h2 className="mt-5 font-display text-3xl font-medium">Wenn ein Standardprodukt nicht zum Raum passt, prüfen wir gemeinsam eine praktische Sonderlösung.</h2>
            <p className="mt-5 text-sm leading-7 text-white/72">Von Skizze und CAD über Konstruktion und Sondermaß bis zur Umsetzung in eigener Werkstatt oder mit passenden Fertigungspartnern.</p>
            <Link href="/sonderloesungen" className="btn-on-dark mt-8 inline-flex">Sonderlösung besprechen</Link>
          </article>
          <article className="premium-card p-8 md:p-10">
            <p className="section-eyebrow">Praxisrahmen: flexibler Gemeindesaal</p>
            <h2 className="mt-5 font-display text-3xl font-medium text-premium-ink">Vom wechselnden Nutzungsbild zur abgestimmten Ausstattung.</h2>
            <p className="mt-5 text-sm leading-7 text-premium-muted">Belegt ist die typische Planungsaufgabe: Gottesdienst, Begegnung und Veranstaltung in einem Raum; dazu Bestuhlung, Tische, Zubehör, Transport und Lagerung gemeinsam betrachten. Projektspezifische Zahlen und Kundendetails werden erst nach Freigabe ergänzt.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/raumloesungen/gemeindesaal" className="btn-secondary">Gemeindesaal planen</Link>
              <Link href="/produkte" className="btn-secondary">Passende Produkte</Link>
            </div>
          </article>
        </div>
      </HomeSection>

      <HomeSection variant="breathing">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <Image src={encodeURI("/pictures/Über uns/Passbild_Stefan_F_edit.jpg")} alt="Stefan Dalemans, persönlicher Ansprechpartner bei DLMNS" width={560} height={640} sizes="(min-width: 1024px) 35vw, 100vw" className="h-80 w-full rounded-5xl object-cover object-top shadow-premium-lg" />
          <div>
            <p className="section-eyebrow">Familie & Gemeinde</p>
            <h2 className="section-title mt-5">Gemeinde ist für uns nicht nur eine Zielgruppe, sondern Teil unserer eigenen Geschichte.</h2>
            <p className="section-lead mt-6">1994 von Hubert Dalemans gegründet und heute von Stefan Dalemans geführt, verbindet DLMNS persönliche Ansprechpartner mit eigener Erfahrung aus Gemeinde und Gemeindebau. Daraus entstehen langfristige Kundenbeziehungen und Lösungen, die den Alltag ernst nehmen.</p>
            <Link href="/firma" className="btn-secondary mt-8 inline-flex">DLMNS kennenlernen</Link>
          </div>
        </div>
      </HomeSection>

      <HomeSection id="langfristig">
        <div className="grid gap-8 rounded-5xl border border-premium-sage bg-premium-warm/60 p-7 md:p-10 lg:grid-cols-2">
          <div>
            <p className="section-eyebrow">Langfristige Betreuung</p>
            <h2 className="section-title mt-5">Die Zusammenarbeit endet nicht mit der Lieferung.</h2>
          </div>
          <div>
            <p className="section-lead">Ersatzteile, Reparatur, Gleiter, Zubehör, Nachbestellungen und die Ergänzung bestehender Bestuhlung bleiben auch nach Jahren relevante Themen.</p>
            <Link href="/beratung-service#langfristig" className="btn-primary mt-7 inline-flex">Service für bestehenden Bestand</Link>
          </div>
        </div>
      </HomeSection>

      <PremiumCtaSection
        eyebrow="Einfach anfangen"
        title="Lassen Sie uns Raum und Ausstattung besprechen."
        lead="Ein kurzer Anruf, eine Nachricht oder ein vorhandener Raumplan reichen für den Einstieg. Musterstuhl und Stoffmuster können direkt mit angefragt werden."
        primaryHref="/kontakt?anliegen=Raum%20und%20Ausstattung"
        primaryLabel="Raum und Ausstattung besprechen"
        secondaryHref="tel:+499342915353"
        secondaryLabel="Direkt anrufen"
      />
    </div>
  );
}

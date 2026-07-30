import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Beratung & Service für Gemeindemöbel",
  description: "Persönliche Kaufberatung, Bemusterung, Musterstuhl, Stoff- und Farbberatung, Ersatzteile, Reparatur und Nachbestellung bei DLMNS.",
  path: "/beratung-service",
  image: "/neue bilder/Stoffe-Farben/Textilproben.png",
  keywords: ["Musterstuhl anfragen", "Stoffmuster Stühle", "Ersatzteile Stapelstühle", "Kaufberatung Gemeindestühle"],
});

const services = [
  ["Persönliche Beratung", "Raum, Nutzung, Bestand und gewünschte Veränderung gemeinsam einordnen.", "Beratung anfragen", "/kontakt?service=Persönliche%20Beratung"],
  ["Raumplanung", "Bestuhlung, Tische, Wege und Nutzungsvarianten vor der Entscheidung prüfen.", "Raumplan prüfen lassen", "/kontakt?service=Raumplanung"],
  ["Musterstuhl", "Sitzwirkung, Handhabung und Raumwirkung anhand eines Musters beurteilen.", "Musterstuhl anfragen", "/kontakt?service=Musterstuhl"],
  ["Stoff- & Farbberatung", "Bezüge, Farbtöne und Holzbeizen auf den vorhandenen Raum abstimmen.", "Stoffmuster anfragen", "/kontakt?service=Stoffmuster"],
  ["Sondermaße", "Prüfen, ob Standard passt oder eine praktische Sonderlösung sinnvoll ist.", "Sondermaß besprechen", "/kontakt?service=Sondermaß"],
  ["Einweisung", "Projektbezogen klären, welche Hinweise für Handhabung und Abläufe sinnvoll sind.", "Einweisung anfragen", "/kontakt?service=Einweisung"],
] as const;

export default function BeratungServicePage() {
  return <div className="page-stack">
    <CinematicPageHero eyebrow="Beratung & Service" title="Persönlich klären, was zu Raum und Alltag passt." lead="Wir kennen uns aus, sprechen direkt mit unseren Kunden und empfehlen nur Lösungen, von deren Qualität wir selbst überzeugt sind." breadcrumbs={[{ label: "Start", href: "/" }, { label: "Beratung & Service" }]} mediaAriaLabel="Persönliche Material- und Produktberatung" mood="stone-arch" actions={<><Link href="/kontakt?anliegen=Beratung" className="btn-hero-primary">Beratung anfragen</Link><a href="tel:+499342915353" className="btn-hero-secondary">Direkt anrufen</a></>} visual={<Image src={encodeURI("/neue bilder/Stoffe-Farben/Textilproben.png")} alt="Stoffmuster und Stühle für eine persönliche Materialberatung" width={760} height={500} priority sizes="(min-width: 1024px) 42vw, 100vw" className="min-h-72 w-full object-cover" />} />
    <HomeSection>
      <SectionHeader eyebrow="Von Auswahl bis Nutzung" title="Beratung, die an konkreten Alltagssituationen ansetzt" lead="Sie müssen nicht vorab wissen, welches Modell richtig ist. Ein Raum, ein Bestand oder eine praktische Frage genügt als Einstieg." align="editorial" />
      <div className="section-grid-top grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map(([title, text, label, href]) => <article key={title} className="premium-card flex flex-col p-7"><h2 className="font-display text-2xl font-medium text-premium-ink">{title}</h2><p className="mt-4 flex-1 text-sm leading-7 text-premium-muted">{text}</p><Link href={href} className="mt-6 text-sm font-medium text-premium-bronze">{label} →</Link></article>)}</div>
    </HomeSection>
    <HomeSection id="bemusterung" variant="elevated"><div className="grid gap-10 lg:grid-cols-2 lg:items-center"><div className="grid grid-cols-2 gap-3"><Image src={encodeURI("/neue bilder/Stoffe-Farben/beize-varianten.png")} alt="Beizmuster für die Farbabstimmung" width={520} height={420} className="h-56 w-full rounded-4xl object-cover" /><Image src={encodeURI("/neue bilder/Stoffe-Farben/holz-varianten.png")} alt="Holzmuster zur Materialauswahl" width={520} height={420} className="h-56 w-full rounded-4xl object-cover" /></div><div><p className="section-eyebrow">Bemusterung</p><h2 className="section-title mt-5">Entscheidungssicherheit vor der Ausstattung.</h2><p className="section-lead mt-6">Musterstuhl, Stoffe, Farben und Holzbeizen helfen dabei, die Wirkung im vorhandenen Raum zu beurteilen. Verfügbarkeit und geeignete Ausführung werden im konkreten Projekt abgestimmt.</p><Link href="/kontakt?service=Musterstuhl%20und%20Stoffmuster" className="btn-primary mt-8 inline-flex">Bemusterung anfragen</Link></div></div></HomeSection>
    <HomeSection id="ablauf"><div className="grid gap-10 lg:grid-cols-2 lg:items-center"><div><p className="section-eyebrow">Umbau & Handhabung</p><h2 className="section-title mt-5">Ausstattung muss auch mit wenigen Helfern funktionieren.</h2><p className="section-lead mt-6">Wir betrachten Transportwege, Stapelung, Wagen und wiederkehrende Handgriffe. Beratung vor Ort erfolgt projektabhängig; einen pauschalen Aufbau-Service versprechen wir nicht.</p><Link href="/kontakt?anliegen=Aufbau%20und%20Handhabung" className="btn-secondary mt-8 inline-flex">Abläufe besprechen</Link></div><Image src={encodeURI("/neue bilder/Produktion-Lager/Polster-Montage.png")} alt="Handarbeit bei der Montage eines Stuhlpolsters" width={720} height={480} className="h-80 w-full rounded-5xl object-cover" /></div></HomeSection>
    <HomeSection id="langfristig" variant="breathing"><SectionHeader eyebrow="Nach der Lieferung" title="Bestehende Ausstattung erhalten und sinnvoll ergänzen" lead="Ersatzteile, Reparaturen, Nachbestellungen und Zubehör werden anhand des vorhandenen Produkts und seines Zustands geprüft." align="editorial" /><div className="section-grid-top grid gap-5 md:grid-cols-3"><Link href="/produkte/stuhlgleiter" className="premium-card premium-card-hover p-7"><h2 className="font-display text-2xl font-medium text-premium-ink">Gleiter & Ersatzteile</h2><p className="mt-4 text-sm leading-7 text-premium-muted">Gestell, Maße und Boden bestimmen, welche Ausführung passt.</p><span className="mt-5 inline-flex text-sm font-medium text-premium-bronze">Ersatzteil finden →</span></Link><Link href="/kontakt?service=Reparatur" className="premium-card premium-card-hover p-7"><h2 className="font-display text-2xl font-medium text-premium-ink">Reparatur prüfen</h2><p className="mt-4 text-sm leading-7 text-premium-muted">Fotos und Produktangaben helfen bei der ersten Einschätzung.</p><span className="mt-5 inline-flex text-sm font-medium text-premium-bronze">Reparatur anfragen →</span></Link><Link href="/kontakt?service=Nachbestellung" className="premium-card premium-card-hover p-7"><h2 className="font-display text-2xl font-medium text-premium-ink">Nachbestellung</h2><p className="mt-4 text-sm leading-7 text-premium-muted">Vorhandene Bestuhlung möglichst passend ergänzen.</p><span className="mt-5 inline-flex text-sm font-medium text-premium-bronze">Bestand ergänzen →</span></Link></div></HomeSection>
    <PremiumCtaSection title="Welche Frage können wir für Sie klären?" lead="Rufen Sie direkt an oder senden Sie eine kurze Anfrage mit Raum, Produkt oder vorhandenem Bestand." primaryHref="/kontakt?anliegen=Beratung%20und%20Service" primaryLabel="Kurze Anfrage senden" secondaryHref="tel:+499342915353" secondaryLabel="Direkt anrufen" />
  </div>;
}

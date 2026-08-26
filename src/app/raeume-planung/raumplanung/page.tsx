import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Raum- und Bestuhlungsplanung in 2D und 3D",
  description: "Stellpläne, Reihenbestuhlung, Fluchtwege, schwierige Raumgeometrien und Tischanordnungen für flexible Gemeinderäume projektbezogen planen.",
  path: "/raeume-planung/raumplanung",
  image: "/pictures/Über uns/CAD-Entwicklung.png",
  keywords: ["Bestuhlungsplanung", "2D Raumplanung", "3D Raumplanung", "Reihenbestuhlung", "Stellplan Gemeinde"],
});

const topics = ["2D-Planung und Grundriss", "3D-Ansichten je nach Projekt", "Stellpläne und Bestuhlungsvarianten", "Reihenbestuhlung und Abstände", "Fluchtwege im Planungskontext", "Tischanordnungen für verschiedene Nutzungen", "Säulen und schwierige Raumgeometrien", "Lager- und Transportwege"];

const tableArrangements = [
  {
    src: "/neue bilder/Stellbeispiele/trtst01.JPG",
    title: "Kompakte Gesprächsrunde",
    description: "Zwei Trapeztische bilden eine geschlossene Runde mit sechs Sitzplätzen.",
    alt: "Stellbeispiel aus zwei Trapeztischen als kompakte Gesprächsrunde",
  },
  {
    src: "/neue bilder/Stellbeispiele/trtst02.JPG",
    title: "Große Gruppenrunde",
    description: "Sechs Tische schaffen eine großzügige Mitte und Platz für größere Gruppen.",
    alt: "Stellbeispiel aus sechs Trapeztischen als große Gruppenrunde",
  },
  {
    src: "/neue bilder/Stellbeispiele/trtst03.JPG",
    title: "Lange Tafel",
    description: "Mit Rechteck- und Trapeztischen entsteht eine klare Tafel für Besprechungen.",
    alt: "Stellbeispiel aus Trapez- und Rechtecktischen als lange Tafel",
  },
  {
    src: "/neue bilder/Stellbeispiele/trtst04.JPG",
    title: "Freie Sonderform",
    description: "Auch ungewöhnliche Geometrien lassen sich aus wenigen Elementen entwickeln.",
    alt: "Dreieckige Sonderform aus mehreren Trapeztischen",
  },
];

export default function RaumplanungPage() {
  return <div className="page-stack">
    <StructuredData data={{ "@context": "https://schema.org", "@type": "Service", name: "Raum- und Bestuhlungsplanung", serviceType: "2D- und 3D-Raumplanung", provider: { "@type": "LocalBusiness", name: "Dalemans Stapelstühle & Klapptische", url: absoluteUrl("/") }, url: absoluteUrl("/raeume-planung/raumplanung") }} />
    <CinematicPageHero eyebrow="Raum- & Bestuhlungsplanung" title="Vor der Bestellung sehen, ob die Lösung im Raum funktioniert." lead="Planung schafft Sicherheit bei Reihen, Wegen, Tischen, schwierigen Geometrien und unterschiedlichen Nutzungsszenarien." breadcrumbs={[{ label: "Start", href: "/" }, { label: "Räume & Planung", href: "/raeume-planung" }, { label: "Raumplanung" }]} breadcrumbPath="/raeume-planung/raumplanung" mediaAriaLabel="CAD- und Bestuhlungsplanung" mood="bronze-glow" actions={<><Link href="/kontakt?service=Raumplan%20prüfen" className="btn-hero-primary">Raumplan prüfen lassen</Link><Link href="/produkte" className="btn-hero-secondary">Produkte einbeziehen</Link></>} visual={<Image src={encodeURI("/pictures/Über uns/CAD-Entwicklung.png")} alt="CAD-Darstellung als Teil einer Raumplanung" width={760} height={500} priority sizes="(min-width: 1024px) 42vw, 100vw" className="min-h-72 w-full object-cover" />} />
    <HomeSection id="stellbeispiele" variant="elevated">
      <SectionHeader eyebrow="Stellbeispiele" title="Ein Tischsystem, viele Möglichkeiten." lead="Trapez- und Rechtecktische lassen sich immer wieder neu kombinieren – passend zu Gruppengröße, Anlass und Raum. So wird aus derselben Ausstattung eine Gesprächsrunde, eine große Gruppenform oder eine lange Tafel." align="editorial" />
      <div className="section-grid-top grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tableArrangements.map((arrangement, index) => (
          <figure key={arrangement.src} className="premium-card group overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden bg-white p-5">
              <Image src={encodeURI(arrangement.src)} alt={arrangement.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-contain p-4 transition duration-500 group-hover:scale-[1.03]" />
              <span className="absolute left-4 top-4 rounded-full bg-premium-ink px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-premium-canvas">0{index + 1}</span>
            </div>
            <figcaption className="border-t border-premium-beige/70 p-6">
              <h3 className="font-display text-xl font-medium text-premium-ink">{arrangement.title}</h3>
              <p className="mt-3 text-sm leading-6 text-premium-muted">{arrangement.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-6 grid overflow-hidden rounded-5xl border border-premium-beige/70 bg-premium-canvas shadow-premium lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div className="relative min-h-72 bg-white sm:min-h-96">
          <Image src={encodeURI("/neue bilder/Stellbeispiele/Stellbeispiel_Trapeztische-quer.jpg")} alt="Übersicht verschiedener Aufstellungsvorschläge und Maße für Trapeztische" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain p-5 sm:p-8" />
        </div>
        <div className="border-t border-premium-beige/70 p-7 sm:p-9 lg:border-l lg:border-t-0">
          <p className="section-eyebrow">Planbar bis ins Detail</p>
          <h3 className="mt-4 font-display text-3xl font-medium text-premium-ink">Varianten und Platzbedarf vorab vergleichen.</h3>
          <p className="mt-5 text-sm leading-7 text-premium-muted">Die Übersicht zeigt, wie sich Tischform, Sitzplatzzahl und benötigte Fläche verändern. In der Raumplanung übertragen wir passende Varianten auf Ihren Grundriss.</p>
          <Link href="/kontakt?service=Raumplan%20prüfen" className="btn-secondary mt-7 inline-flex">Eigene Stellvariante planen</Link>
        </div>
      </div>
    </HomeSection>
    <HomeSection id="stellplaene">
      <SectionHeader eyebrow="Planungsumfang" title="So konkret wie das Projekt es braucht" lead="Nicht jedes Projekt benötigt dieselbe Planungstiefe. Wir wählen die Darstellung passend zu Raum, Nutzung und Entscheidungsstand." align="editorial" />
      <div className="section-grid-top grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{topics.map((topic) => <div key={topic} className="premium-card p-6 text-sm font-medium leading-7 text-premium-charcoal">{topic}</div>)}</div>
    </HomeSection>
    <HomeSection id="geometrie" variant="elevated"><div className="grid gap-10 lg:grid-cols-2 lg:items-center"><Image src={encodeURI("/neue bilder/planung-schritt-3.png")} alt="Skizze zur Lösung einer besonderen Raumgeometrie" width={720} height={520} sizes="(min-width: 1024px) 50vw, 100vw" className="h-80 w-full rounded-5xl object-cover" /><div><p className="section-eyebrow">Geometrie & Varianten</p><h2 className="section-title mt-5">Säulen, Winkel und wechselnde Nutzungen sichtbar machen.</h2><p className="section-lead mt-6">Ein Grundriss kann zeigen, wie unterschiedliche Bestuhlungen, Tischordnungen und Bewegungsflächen zusammenpassen. Vorgaben zu Fluchtwegen werden projektbezogen berücksichtigt; eine behördliche Fachplanung wird dadurch nicht ersetzt.</p><Link href="/kontakt?anliegen=Schwierige%20Raumgeometrie" className="btn-primary mt-8 inline-flex">Raumgeometrie besprechen</Link></div></div></HomeSection>
    <PremiumCtaSection title="Sie haben bereits einen Grundriss oder Stellplan?" lead="Senden Sie den vorhandenen Stand mit einer kurzen Beschreibung der geplanten Nutzungen. Wir prüfen, welche Planungstiefe sinnvoll ist." primaryHref="/kontakt?service=Raumplan%20prüfen" primaryLabel="Raumplan prüfen lassen" secondaryHref="/raeume-planung" secondaryLabel="Alle Raumthemen" />
  </div>;
}

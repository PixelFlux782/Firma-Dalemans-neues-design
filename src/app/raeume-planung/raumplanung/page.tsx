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

export default function RaumplanungPage() {
  return <div className="page-stack">
    <StructuredData data={{ "@context": "https://schema.org", "@type": "Service", name: "Raum- und Bestuhlungsplanung", serviceType: "2D- und 3D-Raumplanung", provider: { "@type": "LocalBusiness", name: "DLMNS Stapelstühle & Klapptische", url: absoluteUrl("/") }, url: absoluteUrl("/raeume-planung/raumplanung") }} />
    <CinematicPageHero eyebrow="Raum- & Bestuhlungsplanung" title="Vor der Bestellung sehen, ob die Lösung im Raum funktioniert." lead="Planung schafft Sicherheit bei Reihen, Wegen, Tischen, schwierigen Geometrien und unterschiedlichen Nutzungsszenarien." breadcrumbs={[{ label: "Start", href: "/" }, { label: "Räume & Planung", href: "/raeume-planung" }, { label: "Raumplanung" }]} mediaAriaLabel="CAD- und Bestuhlungsplanung" mood="bronze-glow" actions={<><Link href="/kontakt?service=Raumplan%20prüfen" className="btn-hero-primary">Raumplan prüfen lassen</Link><Link href="/produkte" className="btn-hero-secondary">Produkte einbeziehen</Link></>} visual={<Image src={encodeURI("/pictures/Über uns/CAD-Entwicklung.png")} alt="CAD-Darstellung als Teil einer Raumplanung" width={760} height={500} priority sizes="(min-width: 1024px) 42vw, 100vw" className="min-h-72 w-full object-cover" />} />
    <HomeSection id="stellplaene">
      <SectionHeader eyebrow="Planungsumfang" title="So konkret wie das Projekt es braucht" lead="Nicht jedes Projekt benötigt dieselbe Planungstiefe. Wir wählen die Darstellung passend zu Raum, Nutzung und Entscheidungsstand." align="editorial" />
      <div className="section-grid-top grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{topics.map((topic) => <div key={topic} className="premium-card p-6 text-sm font-medium leading-7 text-premium-charcoal">{topic}</div>)}</div>
    </HomeSection>
    <HomeSection id="geometrie" variant="elevated"><div className="grid gap-10 lg:grid-cols-2 lg:items-center"><Image src={encodeURI("/pictures/Über uns/Skizze01.jpg")} alt="Skizze zur Lösung einer besonderen Raumgeometrie" width={720} height={520} sizes="(min-width: 1024px) 50vw, 100vw" className="h-80 w-full rounded-5xl object-cover" /><div><p className="section-eyebrow">Geometrie & Varianten</p><h2 className="section-title mt-5">Säulen, Winkel und wechselnde Nutzungen sichtbar machen.</h2><p className="section-lead mt-6">Ein Grundriss kann zeigen, wie unterschiedliche Bestuhlungen, Tischordnungen und Bewegungsflächen zusammenpassen. Vorgaben zu Fluchtwegen werden projektbezogen berücksichtigt; eine behördliche Fachplanung wird dadurch nicht ersetzt.</p><Link href="/kontakt?anliegen=Schwierige%20Raumgeometrie" className="btn-primary mt-8 inline-flex">Raumgeometrie besprechen</Link></div></div></HomeSection>
    <PremiumCtaSection title="Sie haben bereits einen Grundriss oder Stellplan?" lead="Senden Sie den vorhandenen Stand mit einer kurzen Beschreibung der geplanten Nutzungen. Wir prüfen, welche Planungstiefe sinnvoll ist." primaryHref="/kontakt?service=Raumplan%20prüfen" primaryLabel="Raumplan prüfen lassen" secondaryHref="/raeume-planung" secondaryLabel="Alle Raumthemen" />
  </div>;
}

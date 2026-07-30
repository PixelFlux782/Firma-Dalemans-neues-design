import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { products } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

const groups = [
  { name: "Stapelstühle", href: "/produkte/kategorien/stapelstuehle", image: "/images/optimized/stapelstuhl-1021c.webp", text: "Für flexible Reihen, häufige Umbauten und platzsparende Lagerung.", cta: "Stapelstühle vergleichen", featured: true },
  { name: "Klapptische", href: "/produkte/kategorien/klapptische", image: "/pictures/Produkte/Tische/Klapptisch_Stapeltisch_t310ccolor_02.jpg", text: "Für Gemeindecafé, Seminar, Feier und wechselnde Tischordnungen.", cta: "Klapptische vergleichen", featured: true },
  { name: "Buchablagen", href: "/produkte/buchablage", image: "/pictures/Über uns/Zubehor-06.jpg", text: "Für Bücher und Unterlagen, passend zum vorgesehenen Stuhl prüfen.", cta: "Buchablage ansehen", featured: false },
  { name: "Transportwagen", href: "/produkte/stuhltransportwagen", image: "/pictures/Produkte/Zubehör/Stapelstuhl_Stuhltransportwagen_02.jpg", text: "Für geordnete Lagerung und einfachere Wege beim Saalumbau.", cta: "Transportwagen ansehen", featured: false },
  { name: "Reihenverbinder & Zubehör", href: "/produkte/reihenverbinder", image: "/neue bilder/Stapelstühle/stuhlverbinder1.png", text: "Für geordnete Reihen und sinnvolle Ergänzungen am vorhandenen Bestand.", cta: "Zubehör prüfen", featured: false },
  { name: "Ersatzteile & Gleiter", href: "/produkte/stuhlgleiter", image: "/neue bilder/Zubehör/gummistopfen-schwarz1.png", text: "Für Bodenschutz, Reparatur und langfristige Nutzung vorhandener Stühle.", cta: "Ersatzteil finden", featured: false },
] as const;

const featured = ["stapelstuhl-mod-1021c", "klapptisch-310c", "buchablage", "stuhltransportwagen", "reihenverbinder", "stuhlgleiter"]
  .map((slug) => products.find((product) => product.slug === slug))
  .filter((product): product is NonNullable<typeof product> => Boolean(product));

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle, Klapptische und Zubehör",
  description: "DLMNS Produktgruppen für flexible Gemeinderäume: Stapelstühle, Klapptische, Buchablagen, Transportwagen, Reihenverbinder, Ersatzteile und Gleiter.",
  path: "/produkte",
  image: "/images/optimized/stapelstuhl-1021c.webp",
  keywords: ["Stapelstühle", "Klapptische", "Buchablagen Kirchenstühle", "Transportwagen Stapelstühle", "Reihenverbinder", "Stuhlgleiter"],
});

export default function ProductsPage() {
  return <div className="page-stack">
    <CinematicPageHero eyebrow="Produkte" title="Stapelstühle und Klapptische – ergänzt für den ganzen Raum." lead="Beginnen Sie mit der passenden Produktgruppe. Wir beraten dazu, wie Auswahl, Reihen, Tischnutzung, Zubehör, Transport und Lagerung zusammenwirken." breadcrumbs={[{ label: "Start", href: "/" }, { label: "Produkte" }]} mediaAriaLabel="Stapelstuhl als Kernprodukt" mood="stone-arch" actions={<><Link href="#produktgruppen" className="btn-hero-primary">Produktgruppen ansehen</Link><Link href="/kontakt?anliegen=Produktauswahl" className="btn-hero-secondary">Auswahl besprechen</Link></>} visual={<Image src={encodeURI("/pictures/Produkte/Stühle/1021c-01.jpg")} alt="Stapelstuhl als Kernprodukt der flexiblen Raumausstattung" width={760} height={500} priority sizes="(min-width: 1024px) 42vw, 100vw" className="min-h-72 w-full object-cover" />} />
    <HomeSection id="produktgruppen">
      <SectionHeader eyebrow="Produktgruppen" title="Nach Aufgabe geordnet – nicht nur nach Modell" lead="Stapelstühle und Klapptische bilden sichtbar den Schwerpunkt. Zubehör und Serviceprodukte schließen praktische Lücken." align="editorial" />
      <div className="section-grid-top grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        {groups.map((group) => <Link key={group.name} href={group.href} className={`premium-card premium-card-hover overflow-hidden ${group.featured ? "lg:col-span-3" : "lg:col-span-2"}`}><Image src={encodeURI(group.image)} alt={`${group.name} von DLMNS`} width={720} height={420} sizes={group.featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"} className={`w-full object-cover ${group.featured ? "h-64" : "h-52"}`} /><div className="p-6"><h2 className="font-display text-2xl font-medium text-premium-ink">{group.name}</h2><p className="mt-3 text-sm leading-7 text-premium-muted">{group.text}</p><span className="mt-5 inline-flex text-sm font-medium text-premium-bronze">{group.cta} →</span></div></Link>)}
      </div>
      <p className="mt-8 max-w-3xl text-sm leading-7 text-premium-muted">Rednerpulte werden derzeit nicht als eigene Produktgruppe hervorgehoben, weil noch keine ausreichend belegte Auswahl mit eigenständigem Inhalt vorliegt.</p>
    </HomeSection>
    <HomeSection variant="breathing">
      <SectionHeader eyebrow="Belegte Produkte" title="Direkt zu ausgewählten Modellen und Ergänzungen" lead="Details, Einsatzbereiche und kontextbezogene Anfragewege für bestehende Inhalte." align="editorial" />
      <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">{featured.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
    </HomeSection>
    <HomeSection variant="elevated"><div className="grid gap-10 lg:grid-cols-2"><div><p className="section-eyebrow">Vom Produkt zum Raum</p><h2 className="section-title mt-5">Die richtige Gruppe ist nur der Anfang.</h2><p className="section-lead mt-6">Wie viele Möbel sinnvoll sind, welches Zubehör passt und wie Transport und Lagerung funktionieren, hängt vom Raum und seinen Nutzungen ab.</p><Link href="/raeume-planung" className="btn-primary mt-8 inline-flex">Räume & Planung einbeziehen</Link></div><div><p className="section-eyebrow">Noch nicht entschieden?</p><h2 className="section-title mt-5">Kaufberatung ohne Shop-Logik.</h2><p className="section-lead mt-6">Wir klären persönlich, welche Ausführung zur Nutzung, zum Bestand und zur geplanten Handhabung passt.</p><Link href="/beratung-service" className="btn-secondary mt-8 inline-flex">Beratung & Service ansehen</Link></div></div></HomeSection>
    <PremiumCtaSection title="Welche Produktgruppe passt zu Ihrem Raum?" lead="Beschreiben Sie Nutzung, vorhandenen Bestand und geplante Stückzahl. Wir helfen bei der sinnvollen Eingrenzung." primaryHref="/kontakt?anliegen=Produktauswahl" primaryLabel="Produktauswahl besprechen" secondaryHref="/raeume-planung" secondaryLabel="Vom Raum aus starten" />
  </div>;
}

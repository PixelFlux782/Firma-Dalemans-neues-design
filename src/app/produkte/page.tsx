import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { productOverviewCategories, productOverviewHero, productOverviewSolutions, type ProductOverviewCard } from "@/lib/category-media";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle, Klapptische und Zubehör",
  description: "Stapelstühle und Klapptische für flexible Räume – ergänzt durch Zubehör, Transportlösungen, Sonderlösungen und persönliche Beratung.",
  path: "/produkte",
  image: productOverviewHero.src,
  keywords: ["Stapelstühle", "Klapptische", "Zubehör", "Transportwagen", "Sonderlösungen"],
});

function CategoryCard({ item }: { item: ProductOverviewCard }) {
  return <Link href={item.href} className={`premium-card premium-card-hover group flex h-full flex-col overflow-hidden ${item.featured ? "lg:col-span-3" : "lg:col-span-2"}`}>
    <div className={`relative bg-white ${item.featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
      <Image src={item.image.src} alt={item.image.alt} fill sizes={item.featured ? "(min-width: 1024px) 45vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"} className="object-cover object-center transition duration-500 group-hover:scale-[1.02]" />
    </div>
    <div className="flex flex-1 flex-col p-6 md:p-7"><p className="section-eyebrow text-[0.65rem]">{item.category}</p><h2 className="mt-3 font-display text-2xl font-medium text-premium-ink">{item.title}</h2><p className="mt-3 flex-1 text-sm leading-7 text-premium-muted">{item.text}</p><span className="mt-5 inline-flex text-sm font-medium text-premium-bronze">Bereich ansehen →</span></div>
  </Link>;
}

function SolutionCard({ item }: { item: ProductOverviewCard }) {
  return <article className="premium-card premium-card-hover group flex h-full flex-col overflow-hidden">
    <div className="relative aspect-[4/3] bg-white"><Image src={item.image.src} alt={item.image.alt} fill sizes="(min-width: 1280px) 27vw, (min-width: 768px) 45vw, 100vw" className="object-contain p-4 transition duration-500 group-hover:scale-[1.02]" /></div>
    <div className="flex flex-1 flex-col border-t border-premium-beige/60 p-6 md:p-7"><p className="section-eyebrow text-[0.65rem]">{item.category}</p><h3 className="mt-3 font-display text-xl font-medium text-premium-ink md:text-2xl">{item.title}</h3><p className="mt-4 flex-1 text-sm leading-7 text-premium-muted">{item.text}</p><Link href={item.href} className="mt-6 inline-flex text-sm font-medium text-premium-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">Details ansehen →</Link></div>
  </article>;
}

export default function ProductsPage() {
  return <div className="page-stack">
    <CinematicPageHero eyebrow="Produktübersicht" title="Stapelstühle und Klapptische für Räume, die flexibel bleiben." lead="Zubehör, Transportlösungen und Sonderlösungen ergänzen das Kernsortiment. Gemeinsam wählen wir aus, was zu Raum, Nutzung, Lagerung und regelmäßigem Umbau passt." breadcrumbs={[{ label: "Start", href: "/" }, { label: "Produkte" }]} mediaAriaLabel="Gestapelte Stühle als Kernprodukt" mood="stone-arch" actions={<><Link href="#sortiment" className="btn-hero-primary">Sortiment ansehen</Link><Link href="/kontakt?anliegen=Produktauswahl" className="btn-hero-secondary">Beratung anfragen</Link></>} visual={<Image src={productOverviewHero.src} alt={productOverviewHero.alt} width={760} height={950} priority sizes="(min-width: 1280px) 570px, (min-width: 1024px) 42vw, 100vw" className="h-full min-h-72 w-full object-cover object-center" />} />

    <HomeSection id="sortiment">
      <SectionHeader eyebrow="Sortimentsübersicht" title="Unser Sortiment für flexible Räume" lead="Entdecken Sie Stapelstühle, Klapptische und praktische Ergänzungen für Räume, die regelmäßig neu genutzt, umgebaut und bestuhlt werden." align="editorial" />
      <div className="section-grid-top grid gap-6 md:grid-cols-2 lg:grid-cols-6">{productOverviewCategories.map((item) => <CategoryCard key={item.title} item={item} />)}</div>
    </HomeSection>

    <HomeSection variant="breathing">
      <SectionHeader eyebrow="Kuratierte Auswahl" title="Ausgewählte Produkte und Lösungen" lead="Eine kompakte Auswahl zeigt die Breite des Sortiments – von der Bestuhlung über Tischflächen und Zubehör bis zur individuellen Lösung." align="editorial" />
      <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">{productOverviewSolutions.map((item) => <SolutionCard key={item.title} item={item} />)}</div>
      <div className="mt-10"><Link href="/kontakt?anliegen=Produktauswahl" className="btn-primary inline-flex">Auswahl gemeinsam eingrenzen</Link></div>
    </HomeSection>

    <HomeSection variant="elevated"><div className="grid items-center gap-10 lg:grid-cols-[1.25fr_.75fr]"><div><p className="section-eyebrow">Beratung und Planung</p><h2 className="section-title mt-5">Nicht jedes Produkt passt zu jedem Raum.</h2><p className="section-lead mt-6">Wir unterstützen Sie bei Auswahl, Bestuhlungsplanung, Zubehör sowie Transport und Lagerung – abgestimmt auf Nutzung, vorhandenen Bestand und die Abläufe vor Ort.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link href="/kontakt?anliegen=Projektbesprechung" className="btn-primary text-center">Projekt besprechen</Link><Link href="/raeume-planung/raumplanung" className="btn-secondary text-center">Raumplanung anfragen</Link></div></div></HomeSection>

    <PremiumCtaSection title="Welche Lösung passt zu Ihrem Raum?" lead="Beschreiben Sie Raum, Nutzung und geplante Abläufe. Wir helfen Ihnen persönlich bei der sinnvollen Auswahl." primaryHref="/kontakt?anliegen=Produktauswahl" primaryLabel="Beratung anfragen" secondaryHref="/raeume-planung" secondaryLabel="Vom Raum aus starten" />
  </div>;
}

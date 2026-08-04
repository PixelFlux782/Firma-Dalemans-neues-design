import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductVisual from "@/components/ProductVisual";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { productOverviewHero } from "@/lib/category-media";
import { productCategories } from "@/lib/product-categories";
import { products } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle, Klapptische und Zubehör",
  description: "Stapelstühle und Klapptische für flexible Räume – ergänzt durch Zubehör, Transportlösungen, Sonderlösungen und persönliche Beratung.",
  path: "/produkte", image: productOverviewHero.src,
  keywords: ["Stapelstühle", "Klapptische", "Zubehör", "Transportwagen", "Gemeindemöbel"],
});

const featuredSlugs = ["stapelstuhl-mod-1021c", "klapptisch-310c", "stuhltransportwagen"];

export default function ProductsPage() {
  const featuredProducts = featuredSlugs.map((slug) => products.find((product) => product.slug === slug)).filter((product): product is (typeof products)[number] => Boolean(product));
  return <div className="flex min-w-0 flex-col gap-14 md:gap-20">
    <section>
      <div className="grid md:grid-cols-[58%_42%]">
        <div className="relative z-20 flex flex-col justify-center py-8 md:min-h-[520px] md:pr-14 lg:min-h-[560px] lg:pr-16">
          <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte" }]} />
          <p className="section-eyebrow mt-7">Digitaler Beratungskatalog</p>
          <h1 className="mt-3 max-w-[17ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Langlebige Ausstattung für flexible Räume.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-premium-muted">Stapelstühle, Klapptische und praktische Ergänzungen für Gemeinden, Säle und Mehrzweckräume – persönlich ausgewählt und langfristig betreut.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="#sortiment" className="btn-primary px-6 py-3">Sortiment entdecken</Link><Link href="/kontakt?anliegen=Produktauswahl" className="btn-secondary px-6 py-3">Beratung zur Auswahl</Link></div>
        </div>
        <div className="relative min-h-[420px] md:min-h-[520px] lg:min-h-[560px]">
          <ProductVisual src={productOverviewHero.src} alt={productOverviewHero.alt} priority sizes="(min-width: 768px) 42vw, 100vw" aspectRatio="3 / 4" objectPosition="58% 52%" imageInset="5%" backgroundTone="canvas" className="h-full min-h-[420px] md:min-h-[520px] lg:min-h-[560px]" />
        </div>
      </div>
    </section>

    <section id="sortiment" className="scroll-mt-28" aria-labelledby="sortiment-title">
      <p className="section-eyebrow">Sortimentsübersicht</p><h2 id="sortiment-title" className="mt-3 font-display text-3xl font-medium text-premium-ink md:text-4xl">Drei Wege zum passenden Produkt</h2>
      <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{productCategories.map((category) => {
        const count = products.filter((product) => product.categoryId === category.id).length;
        return <Link key={category.id} href={`/produkte/kategorien/${category.id}`} className="group flex min-h-full flex-col">
          <ProductVisual src={category.image} alt={category.name} sizes="(min-width: 1024px) 24vw, (min-width: 768px) 50vw, 100vw" imageInset="5%" backgroundTone="canvas" />
          <div className="flex flex-1 flex-col p-5"><p className="section-eyebrow text-[.62rem]">{count} Produkte</p><h3 className="mt-2 font-display text-xl font-medium text-premium-ink">{category.name}</h3><p className="mt-3 flex-1 text-sm leading-6 text-premium-muted">{category.intro}</p><span className="mt-4 text-sm font-medium text-premium-forest">Kategorie ansehen →</span></div>
        </Link>;
      })}</div>
    </section>

    <HomeSection><SectionHeader eyebrow="Häufig nachgefragt" title="Direkt zu ausgewählten Produkten" lead="Ein schneller Einstieg in bewährte Lösungen aus den wichtigsten Sortimentsbereichen." align="editorial" /><div className="section-grid-top grid gap-6 md:grid-cols-2 xl:grid-cols-3">{featuredProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div></HomeSection>

    <HomeSection variant="elevated"><div className="grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><p className="section-eyebrow">Kurze Auswahlhilfe</p><h2 className="section-title mt-4">Vom Raum zur passenden Ausstattung</h2><p className="section-lead mt-5">Nutzung, Personenzahl, Umbauhäufigkeit, Lagerweg und gewünschte Raumwirkung grenzen die Auswahl schnell ein.</p></div><div className="grid gap-3 sm:grid-cols-2"><Link href="/raeume-planung/raumplanung" className="btn-primary text-center">Raumplanung ansehen</Link><Link href="/kontakt?anliegen=Produktauswahl" className="btn-secondary text-center">Ausführung klären</Link></div></div></HomeSection>
    <HomeSection><div className="grid gap-8 border-y border-premium-beige py-10 md:grid-cols-3"><div><p className="section-eyebrow">01 · Auswahl</p><p className="mt-3 text-sm leading-7 text-premium-muted">Produkte nach Nutzung, Komfort und Handhabung vergleichen.</p></div><div><p className="section-eyebrow">02 · Raumplanung</p><p className="mt-3 text-sm leading-7 text-premium-muted">Stückzahlen, Reihen, Wege und Lagerung sinnvoll zusammendenken.</p></div><div><p className="section-eyebrow">03 · Betreuung</p><p className="mt-3 text-sm leading-7 text-premium-muted">Zubehör, Nachbestellung und Ersatzteile langfristig persönlich klären.</p></div></div></HomeSection>
    <PremiumCtaSection title="Welche Ausstattung passt zu Ihrem Raum?" lead="Beschreiben Sie Raum, Nutzung und geplante Abläufe. Wir helfen persönlich bei der Auswahl." primaryHref="/kontakt?anliegen=Produktauswahl" primaryLabel="Beratung anfragen" secondaryHref="tel:+499342915353" secondaryLabel="Direkt anrufen" />
  </div>;
}

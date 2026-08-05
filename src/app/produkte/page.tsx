import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import ProductCategoryFeature from "@/components/home/ProductCategoryFeature";
import SectionHeader from "@/components/home/SectionHeader";
import { productOverviewHero } from "@/lib/category-media";
import { products } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle, Klapptische und Zubehör",
  description: "Stapelstühle und Klapptische für flexible Räume – ergänzt durch Zubehör, Transportlösungen, Sonderlösungen und persönliche Beratung.",
  path: "/produkte", image: productOverviewHero.src,
  keywords: ["Stapelstühle", "Klapptische", "Zubehör", "Transportwagen", "Gemeindemöbel"],
});

const featuredSlugs = ["stapelstuhl-mod-1021c", "klapptisch-310c", "stuhltransportwagen"];

const productGroups = [
  { title: "Stapelstühle", text: "Robuste, komfortable Stühle für flexible Räume und eine langjährige Nutzung.", href: "/produkte/kategorien/stapelstuehle", cta: "Stapelstühle ansehen", image: "/images/curated/Stapelstühle/Stapelstuhl_Stapelstuhle_Stapelstuehle_Buende_01.webp", alt: "Vollständig sichtbarer Stapel gepolsterter Stapelstühle", backgroundTone: "#F8F7F1", imageInset: "2%", imageScale: 1, objectPosition: "50% 54%", aspectRatio: "4 / 3", fadeStrength: 0.88 },
  { title: "Klapptische", text: "Stabile Tischlösungen für schnelle Umbauten, Veranstaltungen und flexibel genutzte Räume.", href: "/produkte/kategorien/klapptische", cta: "Klapptische ansehen", image: "/images/curated/Tische/Klapptisch_Stapeltisch_t310ccolor_02.webp", alt: "Vollständig sichtbarer Klapptisch mit verchromtem Gestell", backgroundTone: "#F8F7F1", imageInset: "2%", imageScale: 1, objectPosition: "50% 51%", aspectRatio: "4 / 3", fadeStrength: 0.88 },
  { title: "Rednerpulte", text: "Klare und funktionale Lösungen für Gottesdienste, Vorträge und Veranstaltungen.", href: "/produkte/rednerpulte", cta: "Rednerpulte ansehen", image: "/neue bilder/Rednerpulte/Rednerpult_Acrylglas_Plexiglas_TypA.png", alt: "Vollständig sichtbares Rednerpult aus Acrylglas, Typ A", backgroundTone: "#F8F7F1", imageInset: "1% 3%", imageScale: 1, objectPosition: "50% 50%", aspectRatio: "4 / 3", fadeStrength: 0.78 },
  { title: "Zubehör & Transport", text: "Buchablagen, Reihenverbinder, Gleiter, Ersatzteile und Transportlösungen für den praktischen Alltag.", href: "/produkte/kategorien/transportwagen-zubehoer", cta: "Zubehör & Transport ansehen", image: "/neue bilder/Zubehör/zubehör-hero.png", alt: "Transportwagen mit Tischen sowie verschiedene Zubehör- und Ersatzteile", backgroundTone: "#F8F7F1", imageInset: "2%", imageScale: 1, objectPosition: "50% 54%", aspectRatio: "4 / 3", fadeStrength: 0.9 },
] as const;

export default function ProductsPage() {
  const featuredProducts = featuredSlugs.map((slug) => products.find((product) => product.slug === slug)).filter((product): product is (typeof products)[number] => Boolean(product));
  return <div className="flex min-w-0 flex-col gap-14 md:gap-20">
    <section className="products-hero relative -mx-5 min-h-[650px] overflow-hidden sm:-mx-6 md:mx-0 md:min-h-[560px]">
      <div className="products-hero-media absolute inset-0" aria-hidden="true">
        <Image
          src={encodeURI("/neue bilder/Stapelstühle/hero-bestuhlung.png")}
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover object-[52%_center] md:object-center"
        />
      </div>
      <div className="products-hero-shade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-20 flex min-h-[650px] items-end px-5 pb-14 pt-20 sm:px-8 md:min-h-[560px] md:items-center md:px-12 md:py-16 lg:px-16">
        <div className="max-w-[42rem] md:w-[61%]">
          <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte" }]} />
          <p className="section-eyebrow mt-7">Digitaler Beratungskatalog</p>
          <h1 className="mt-3 max-w-[17ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Langlebige Ausstattung für flexible Räume.</h1>
          <p className="mt-4 max-w-[38rem] text-base leading-7 text-premium-muted">Stapelstühle, Klapptische und praktische Ergänzungen für Gemeinden, Säle und Mehrzweckräume – persönlich ausgewählt und langfristig betreut.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="#sortiment" className="btn-primary px-6 py-3">Sortiment entdecken</Link><Link href="/kontakt?anliegen=Produktauswahl" className="btn-secondary px-6 py-3">Beratung zur Auswahl</Link></div>
        </div>
      </div>
    </section>

    <section id="sortiment" className="scroll-mt-28" aria-labelledby="sortiment-title">
      <p className="section-eyebrow">Sortimentsübersicht</p><h2 id="sortiment-title" className="mt-3 font-display text-3xl font-medium text-premium-ink md:text-4xl">Vier Produktbereiche für flexible Räume</h2>
      <div className="mt-9 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:gap-x-12 lg:gap-y-20">
        {productGroups.map((group) => <ProductCategoryFeature key={group.title} title={group.title} description={group.text} href={group.href} image={group.image} alt={group.alt} linkLabel={group.cta} imageScale={group.imageScale} objectPosition={group.objectPosition} imageInset={group.imageInset} aspectRatio={group.aspectRatio} fadeStrength={group.fadeStrength} backgroundTone={group.backgroundTone} />)}
      </div>
    </section>

    <HomeSection><SectionHeader eyebrow="Häufig nachgefragt" title="Direkt zu ausgewählten Produkten" lead="Ein schneller Einstieg in bewährte Lösungen aus den wichtigsten Sortimentsbereichen." align="editorial" /><div className="section-grid-top grid gap-6 md:grid-cols-2 xl:grid-cols-3">{featuredProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div></HomeSection>

    <HomeSection variant="elevated"><div className="grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><p className="section-eyebrow">Kurze Auswahlhilfe</p><h2 className="section-title mt-4">Vom Raum zur passenden Ausstattung</h2><p className="section-lead mt-5">Nutzung, Personenzahl, Umbauhäufigkeit, Lagerweg und gewünschte Raumwirkung grenzen die Auswahl schnell ein.</p></div><div className="grid gap-3 sm:grid-cols-2"><Link href="/raeume-planung/raumplanung" className="btn-primary text-center">Raumplanung ansehen</Link><Link href="/kontakt?anliegen=Produktauswahl" className="btn-secondary text-center">Ausführung klären</Link></div></div></HomeSection>
    <HomeSection><div className="grid gap-8 border-y border-premium-beige py-10 md:grid-cols-3"><div><p className="section-eyebrow">01 · Auswahl</p><p className="mt-3 text-sm leading-7 text-premium-muted">Produkte nach Nutzung, Komfort und Handhabung vergleichen.</p></div><div><p className="section-eyebrow">02 · Raumplanung</p><p className="mt-3 text-sm leading-7 text-premium-muted">Stückzahlen, Reihen, Wege und Lagerung sinnvoll zusammendenken.</p></div><div><p className="section-eyebrow">03 · Betreuung</p><p className="mt-3 text-sm leading-7 text-premium-muted">Zubehör, Nachbestellung und Ersatzteile langfristig persönlich klären.</p></div></div></HomeSection>
    <PremiumCtaSection title="Welche Ausstattung passt zu Ihrem Raum?" lead="Beschreiben Sie Raum, Nutzung und geplante Abläufe. Wir helfen persönlich bei der Auswahl." primaryHref="/kontakt?anliegen=Produktauswahl" primaryLabel="Beratung anfragen" secondaryHref="tel:+499342915353" secondaryLabel="Direkt anrufen" />
  </div>;
}

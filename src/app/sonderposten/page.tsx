import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import HomeSection from "@/components/home/HomeSection";
import { activeSpecialOffers } from "@/lib/special-offers";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sonderposten: künftige Angebote im Überblick",
  description: "Vorschau auf mögliche Lagerware, Einzelstücke und Restbestände. Konkrete Angebote werden erst nach Prüfung veröffentlicht.",
  path: "/sonderposten",
  image: "/images/curated/Sonderposten/kunstoffschalenstuhl-restposten.webp",
  keywords: ["Sonderposten Stühle", "Lagerware Möbel", "B-Ware Stühle", "Restbestände Tische"],
});

export default function SonderpostenPage() {
  return <div className="page-stack">
    <section className="products-hero relative -mx-5 min-h-[650px] overflow-hidden sm:-mx-6 md:mx-0 md:min-h-[560px]">
      <div className="products-hero-media absolute inset-0" aria-hidden="true">
        <Image
          src={encodeURI("/images/curated/Sonderposten/kunstoffschalenstuhl-restposten.webp")}
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="products-hero-shade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-20 flex min-h-[650px] items-end px-5 pb-14 pt-20 sm:px-8 md:min-h-[560px] md:items-center md:px-12 md:py-16 lg:px-16">
        <div className="max-w-[42rem] md:w-[61%]">
          <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Sonderposten" }]} />
          <p className="section-eyebrow mt-7">Vorschau · wechselndes Sortiment</p>
          <h1 className="mt-3 max-w-[17ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Sonderposten nach sorgfältiger Prüfung</h1>
          <p className="mt-4 max-w-[38rem] text-base leading-7 text-premium-muted">Wenn konkrete Lagerware, Einzelstücke oder Restbestände vorliegen, veröffentlichen wir sie hier mit eindeutigen Angaben. Die derzeit gezeigten Produkte dienen ausschließlich als Vorschau.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="#angebote" className="btn-primary px-6 py-3">Vorschau ansehen</Link>
            <Link href="/kontakt?anliegen=Sonderposten" className="btn-secondary px-6 py-3">Sonderposten vormerken</Link>
          </div>
        </div>
      </div>
    </section>

    <HomeSection id="angebote">
      <p className="section-eyebrow">Sortimentsvorschau</p>
      <h2 className="section-title mt-5">Welche Artikel hier erscheinen können</h2>
      {!activeSpecialOffers.length ? <p className="mt-5 max-w-4xl text-sm leading-7 text-premium-muted">Die gezeigten Produkte sind Beispiele für mögliche Lagerware, Einzelstücke oder Restbestände und stellen keine aktuelle Verfügbarkeitszusage dar.</p> : null}
      {activeSpecialOffers.length ? (
        <div className="section-grid-top grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {activeSpecialOffers.map((offer) => (
            <article key={offer.id}>
              <ProductVisual src={offer.images[0]} alt={offer.title} sizes="(min-width: 1024px) 33vw, 100vw" imageInset="5%" backgroundTone="canvas" />
              <div className="px-1 pt-5"><span className="text-xs font-semibold text-premium-forest">{offer.condition ?? "Sonderposten"}</span><h3 className="mt-4 font-display text-2xl text-premium-ink">{offer.title}</h3><p className="mt-3 text-sm leading-7 text-premium-muted">{offer.shortDescription}</p><p className="mt-5 font-semibold text-premium-ink">{offer.salePrice != null ? `${offer.salePrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}` : offer.priceNote ?? "Sonderpreis auf Anfrage"}</p><Link href={`/kontakt?anliegen=${encodeURIComponent(offer.contactSubject)}`} className="btn-primary mt-6">Angebot anfragen</Link></div>
            </article>
          ))}
        </div>
      ) : (
        <div className="section-grid-top grid gap-8 sm:grid-cols-2 lg:grid-cols-[.7fr_.7fr_1.1fr] lg:items-center">
          <ProductVisual src="/images/curated/Sonderposten/barstuhl-restposten.webp" alt="Grauer Barstuhl als Beispiel für wechselnde Lagerware" sizes="(min-width: 1024px) 28vw, 50vw" imageInset="6%" backgroundTone="canvas" />
          <ProductVisual src="/images/curated/Sonderposten/kunstoffschalenstuhl-restposten.webp" alt="Grauer Kunststoffschalenstuhl als Beispiel für künftige Sonderposten" sizes="(min-width: 1024px) 28vw, 50vw" imageInset="6%" backgroundTone="canvas" />
          <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1"><h3 className="font-display text-3xl font-medium text-premium-ink">Aktuell werden unsere Sonderposten neu zusammengestellt.</h3><p className="mt-5 text-sm leading-7 text-premium-muted">Hier veröffentlichen wir künftig verfügbare Lagerware, Einzelstücke, Auslaufmodelle und Artikel mit kleinen optischen Besonderheiten. Die gezeigten Stühle sind Beispiele und nicht als aktuell verfügbar gekennzeichnet.</p><Link href="/kontakt?anliegen=Sonderposten%20vormerken" className="btn-primary mt-7 w-fit">Bei Interesse vormerken</Link></div>
        </div>
      )}
    </HomeSection>

    <HomeSection variant="elevated"><div className="grid gap-8 md:grid-cols-3">{[["Begrenzte Bestände", "Lagerware und Einzelstücke sind nur in vorhandener Menge verfügbar."], ["Transparent beschrieben", "Zustand und mögliche optische Besonderheiten werden vor dem Kauf ehrlich geklärt."], ["Persönlich abgestimmt", "Wir prüfen gemeinsam, ob Modell, Ausführung und Stückzahl zu Ihrem Raum passen."]].map(([title,text]) => <article key={title}><h2 className="font-display text-2xl text-premium-ink">{title}</h2><p className="mt-3 text-sm leading-7 text-premium-muted">{text}</p></article>)}</div></HomeSection>
  </div>;
}

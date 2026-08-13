"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductVisual from "@/components/ProductVisual";
import type { Product } from "@/lib/products";

type CategoryProduct = Pick<Product, "title" | "slug" | "image" | "imageAlt" | "shortDescription" | "highlights" | "overviewGroup">;

const accessoryFilters = [
  { id: "all", label: "Alle" },
  { id: "transport", label: "Transportwagen" },
  { id: "chair-accessories", label: "Stuhlzubehör" },
  { id: "table-accessories", label: "Tischzubehör" },
  { id: "spares", label: "Ersatzteile" },
] as const;

interface Props {
  heroImage: string;
  products: readonly CategoryProduct[];
  variant?: "chairs" | "tables" | "lecterns" | "accessories";
}

interface ProductImageTreatment {
  imagePosition: string;
  imageScale: number;
  mobileImagePosition: string;
  mobileImageScale: number;
}

const productImageTreatments: Record<string, ProductImageTreatment> = {
  "stapelstuhl-mod-1021c": { imagePosition: "50% 52%", imageScale: 1.08, mobileImagePosition: "50% 51%", mobileImageScale: 1.02 },
  "stapelstuhl-1010i": { imagePosition: "50% 50%", imageScale: 1.1, mobileImagePosition: "50% 50%", mobileImageScale: 1.03 },
  "stapelstuhl-1010a": { imagePosition: "49% 51%", imageScale: 1.07, mobileImagePosition: "49% 50%", mobileImageScale: 1.01 },
  "stapelstuhl-1010b": { imagePosition: "49% 51%", imageScale: 1.09, mobileImagePosition: "49% 50%", mobileImageScale: 1.02 },
  "stapelstuhl-e1000": { imagePosition: "51% 52%", imageScale: 1.07, mobileImagePosition: "51% 51%", mobileImageScale: 1.01 },
};

function ProductActions({ product, requestSample, variant }: { product: CategoryProduct; requestSample: boolean; variant: "chairs" | "tables" | "lecterns" | "accessories" }) {
  if (variant === "lecterns") {
    return (
      <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
        <Link href={`/kontakt?produkt=${encodeURIComponent(product.title)}`} className="btn-primary justify-center px-5 py-2.5 text-sm">
          Rednerpult anfragen
        </Link>
        <a href="tel:+499342915353" className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-premium-forest underline-offset-4 hover:underline sm:justify-start">
          Persönlich beraten lassen
        </a>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
      <Link href={`/produkte/${product.slug}`} className="btn-primary justify-center px-5 py-2.5 text-sm">
        Modell ansehen
      </Link>
      <Link
        href={`/kontakt?produkt=${encodeURIComponent(product.title)}`}
        className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4 sm:justify-start"
      >
        {variant === "accessories" ? "Passende Ausführung anfragen" : variant === "tables" ? "Ausführung besprechen" : requestSample ? "Musterstuhl anfragen" : "Ausführung besprechen"}
      </Link>
    </div>
  );
}

export default function StackingChairsCategory({ heroImage, products, variant = "chairs" }: Props) {
  const isTables = variant === "tables";
  const isLecterns = variant === "lecterns";
  const isAccessories = variant === "accessories";
  const [activeFilter, setActiveFilter] = useState("all");
  const categoryName = isAccessories ? "Transportwagen & Zubehör" : isLecterns ? "Rednerpulte" : isTables ? "Klapptische" : "Stapelstühle";
  const categoryQuery = encodeURIComponent(categoryName);
  const visibleProducts = isAccessories && activeFilter !== "all"
    ? products.filter((product) => product.overviewGroup === activeFilter)
    : products;
  const countForFilter = (id: string) => id === "all"
    ? products.length
    : products.filter((product) => product.overviewGroup === id).length;
  const categoryPath = isAccessories
    ? "/produkte/kategorien/transportwagen-zubehoer"
    : isLecterns
      ? "/produkte/rednerpulte"
      : isTables
        ? "/produkte/kategorien/klapptische"
        : "/produkte/kategorien/stapelstuehle";

  return (
    <div className="flex min-w-0 flex-col gap-12 md:gap-14">
      <section>
        <div className="stacking-chairs-hero products-hero relative -mx-5 min-h-[650px] overflow-hidden sm:-mx-6 md:mx-0 md:min-h-[620px]">
          <div className="stacking-chairs-hero__media products-hero-media absolute inset-0">
            <Image
              src={heroImage}
              alt={isAccessories ? "Transportwagen mit gestapelten Stühlen für Lagerung und Saalumbau" : isLecterns ? "Rednerpult für Gottesdienste, Vorträge und Veranstaltungen" : isTables ? "Klappbare Tische für flexibel genutzte Gemeinde- und Mehrzweckräume" : "Stapelbare Stühle für flexible Reihenbestuhlung in Gemeinde- und Veranstaltungsräumen"}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1280px) 1216px, 100vw"
              className={isTables || isLecterns || isAccessories ? "object-cover object-center" : "object-cover object-[72%_center] md:object-[80%_center]"}
            />
          </div>
          <div className="stacking-chairs-hero__shade pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative z-20 flex min-h-[650px] items-end px-5 pb-14 pt-20 sm:px-8 md:min-h-[620px] md:items-center md:px-12 md:py-16 lg:px-16">
            <div className="max-w-[42rem] md:w-[61%]">
              <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: categoryName }]} currentPath={categoryPath} />
              <p className="section-eyebrow mt-7">Produktkategorie · {products.length} Produkte</p>
              <h1 className="mt-3 max-w-[17ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">{isAccessories ? "Transportwagen & Zubehör für flexible Räume." : isLecterns ? "Rednerpulte für einen klaren Auftritt." : isTables ? "Klapptische für flexible Räume." : "Stapelstühle für flexible Räume."}</h1>
              <p className="mt-4 max-w-[38rem] text-base leading-7 text-premium-muted">{isAccessories ? "Praktische Lösungen für Transport, Lagerung, Reihenbestuhlung und den langfristigen Erhalt Ihrer Ausstattung." : isLecterns ? "Klare und funktionale Lösungen für Gottesdienste, Vorträge und Veranstaltungen." : isTables ? "Schnell aufgebaut, stabil im Einsatz und nach der Veranstaltung wieder kompakt verstaut." : "Vielseitige Bestuhlung für Gottesdienste, Mehrzweckräume und Veranstaltungen mit hoher Frequenz."}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="#products" className="btn-primary px-6 py-3">Sortiment entdecken</Link>
                <Link href={`/kontakt?${isAccessories ? "anliegen=Ersatzteilanfrage" : isLecterns ? "anliegen=Rednerpulte" : `kategorie=${categoryQuery}`}`} className="btn-secondary px-6 py-3">{isAccessories ? "Zubehör anfragen" : isLecterns ? "Rednerpult anfragen" : isTables ? "Beratung anfragen" : "Musterstuhl anfragen"}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAccessories && (
        <section aria-label="Zubehör filtern" className="-mt-5 md:-mt-7">
          <p className="section-eyebrow mb-3">Schnellauswahl</p>
          <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-2" role="group" aria-label="Produkte filtern">
              {accessoryFilters.map((filter) => {
                const selected = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-forest focus-visible:ring-offset-2 ${selected ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white/80 text-premium-charcoal hover:border-premium-leaf"}`}
                  >
                    {filter.label} <span className={selected ? "text-white/70" : "text-premium-muted"}>{countForFilter(filter.id)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-sm text-premium-muted" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? "Produkt" : "Produkte"} angezeigt</p>
        </section>
      )}

      <section id="products" aria-labelledby="products-title" className="scroll-mt-28">
        <p className="section-eyebrow">Sortiment</p>
        <h2 id="products-title" className="mt-3 max-w-3xl font-display text-3xl font-medium leading-tight text-premium-ink sm:text-4xl">{isAccessories ? `${products.length} Lösungen für Transport, Ausstattung und Werterhalt` : isLecterns ? "Zwei Rednerpulte für unterschiedliche Räume und Anlässe" : isTables ? `${products.length} Klapptische für unterschiedliche Räume und Anforderungen` : "Fünf Stapelstühle für unterschiedliche Räume und Anforderungen"}</h2>
        <p className="mt-4 max-w-2xl leading-7 text-premium-muted">{isAccessories ? "Vom passenden Transportwagen bis zum kleinen Ersatzteil – abgestimmt auf Ihren Bestand, Ihre Räume und Ihre täglichen Abläufe." : isLecterns ? "Transparente Acrylglas-Ausführungen mit ruhiger Formensprache – für eine präsente, aber zurückhaltende Wirkung im Raum." : isTables ? "Vom vielseitigen Rechtecktisch bis zur kommunikativen Bistro-Lösung – passend zu Nutzung, Raum und Lagerung ausgewählt." : "Von der robusten Grundausstattung bis zur gepolsterten Komfortlösung – persönlich ausgewählt und langfristig betreut."}</p>

        <div className="mt-4 sm:mt-5">
          {visibleProducts.map((product, index) => {
            const imageRight = index % 2 === 1;
            const imageTreatment = productImageTreatments[product.slug] ?? {
              imagePosition: "50% 52%",
              imageScale: 1.05,
              mobileImagePosition: "50% 52%",
              mobileImageScale: 1,
            };

            return (
              <article
                key={product.slug}
                className={`grid min-w-0 gap-7 py-12 sm:gap-10 sm:py-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] lg:items-center lg:gap-16 lg:py-20 ${index > 0 ? "border-t border-premium-beige/55" : ""}`}
              >
                <ProductVisual src={product.image} alt={product.imageAlt ?? product.title} sizes="(min-width: 1280px) 570px, (min-width: 1024px) 48vw, 100vw" aspectRatio="4 / 5" objectPosition={imageTreatment.imagePosition} imageScale={Math.min(imageTreatment.imageScale, 1)} imageInset="5%" backgroundTone="canvas" className={`min-w-0 sm:[--visual-ratio:5/4] lg:min-h-[580px] ${imageRight ? "lg:order-2" : ""}`} />
                <div className={`flex min-w-0 flex-col justify-center px-1 sm:px-2 lg:px-0 ${imageRight ? "lg:order-1" : ""}`}>
                  <p className="section-eyebrow">{categoryName}</p>
                  <h3 className="mt-2 font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink sm:text-3xl">{product.title}</h3>
                  <p className="mt-4 max-w-xl leading-7 text-premium-muted">{product.shortDescription}</p>
                  <ul className="mt-6 grid max-w-xl gap-3 border-y border-premium-beige/60 py-5 text-sm leading-6 text-premium-charcoal/90" aria-label={`Merkmale von ${product.title}`}>
                    {product.highlights.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="mt-[0.65rem] size-1.5 shrink-0 rounded-full bg-premium-sand" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <ProductActions product={product} requestSample={index % 2 === 0} variant={variant} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-premium-beige/70 bg-white/55 p-6 shadow-premium sm:p-8 lg:p-10" aria-labelledby="selection-title">
        <div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="section-eyebrow">Auswahlhilfe</p>
            <h2 id="selection-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">{isAccessories ? "Welches Zubehör passt zu Ihrer Ausstattung?" : isLecterns ? "Welches Rednerpult passt zu Ihrem Raum?" : isTables ? "Welcher Klapptisch passt zu Ihrem Raum?" : "Welcher Stapelstuhl passt zu Ihrem Raum?"}</h2>
            <p className="mt-4 text-sm leading-7 text-premium-muted">{isAccessories ? "Modell, Gestellform, Maße, Kaufjahr und Einsatzbereich helfen uns, Transportlösung, Zubehör oder Ersatzteil zuverlässig einzuordnen." : isLecterns ? "Raumwirkung, Anlass, Ablagefläche und gewünschte Form entscheiden über die passende Ausführung." : isTables ? "Raumgröße, Nutzung, Tischform, Oberfläche, Transportweg und Lagerfläche entscheiden über die passende Ausführung." : "Nutzungshäufigkeit, Stapelhöhe, Sitzkomfort, Boden, Reihenbildung und Raumwirkung entscheiden über die passende Ausführung."}</p>
          </div>
          <div>
            <ul className="grid gap-3 sm:grid-cols-3">
              {(isAccessories ? ["Modell und Maße", "Fotos und Kaufjahr", "Einsatz und Stückzahl"] : isLecterns ? ["Raum und Anlass", "Form und Ablage", "Material und Wirkung"] : isTables ? ["Maße und Nutzung", "Transport und Lagerung", "Oberflächen und Gestelle"] : ["Komfort und Nutzung", "Transport und Lagerung", "Stoffe, Farben und Zubehör"]).map((item) => (
                <li key={item} className="rounded-xl bg-premium-warm/70 px-4 py-4 text-sm font-medium text-premium-ink">{item}</li>
              ))}
            </ul>
            <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
              <Link href={`/kontakt?${isAccessories ? "anliegen=Ersatzteilanfrage" : isLecterns ? "anliegen=Rednerpulte" : `kategorie=${categoryQuery}`}`} className="btn-primary justify-center px-5 py-2.5 text-sm">{isAccessories ? "Zubehör anfragen" : "Beratung zur Auswahl"}</Link>
              {isLecterns ? (
                <a href="tel:+499342915353" className="btn-secondary justify-center px-5 py-2.5 text-sm">Direkt anrufen</a>
              ) : (
                <Link href={`/kontakt?${isAccessories ? "anliegen=Ersatzteilanfrage" : `kategorie=${categoryQuery}`}`} className="btn-secondary justify-center px-5 py-2.5 text-sm">{isAccessories ? "Ersatzteil anfragen" : isTables ? "Ausführung besprechen" : "Musterstuhl anfragen"}</Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

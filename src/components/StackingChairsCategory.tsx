import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Product } from "@/lib/products";

interface Props {
  heroImage: string;
  products: Product[];
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

function ProductActions({ product, requestSample }: { product: Product; requestSample: boolean }) {
  return (
    <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
      <Link href={`/produkte/${product.slug}`} className="btn-primary justify-center px-5 py-2.5 text-sm">
        Modell ansehen
      </Link>
      <Link
        href={`/kontakt?produkt=${encodeURIComponent(product.title)}`}
        className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4 sm:justify-start"
      >
        {requestSample ? "Musterstuhl anfragen" : "Ausführung besprechen"}
      </Link>
    </div>
  );
}

export default function StackingChairsCategory({ heroImage, products }: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-12 md:gap-14">
      <section className="overflow-hidden rounded-4xl bg-[#f8f4ec]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
          <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-10 lg:pr-5">
            <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: "Stapelstühle" }]} />
            <p className="section-eyebrow mt-6">Produktkategorie · {products.length} Produkte</p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Stapelstühle</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-premium-muted">Vielseitige Bestuhlung für Gottesdienste, Mehrzweckräume und Veranstaltungen mit hoher Frequenz.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="btn-primary px-6 py-3">Musterstuhl anfragen</Link>
              <a href="tel:+499342915353" className="btn-secondary px-6 py-3">Beratung</a>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden bg-premium-warm sm:min-h-[520px] lg:min-h-[620px]">
            <Image src={heroImage} alt="Fünf gepolsterte Stapelstühle in einem hellen Raum" fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover object-[50%_58%] sm:object-[50%_56%] lg:object-[50%_55%]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#f8f4ec] to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-24 lg:bg-gradient-to-r" />
          </div>
        </div>
      </section>

      <section id="products" aria-labelledby="products-title" className="scroll-mt-28">
        <p className="section-eyebrow">Sortiment</p>
        <h2 id="products-title" className="mt-3 max-w-3xl font-display text-3xl font-medium leading-tight text-premium-ink sm:text-4xl">Fünf Stapelstühle für unterschiedliche Räume und Anforderungen</h2>
        <p className="mt-4 max-w-2xl leading-7 text-premium-muted">Von der robusten Grundausstattung bis zur gepolsterten Komfortlösung – persönlich ausgewählt und langfristig betreut.</p>

        <div className="mt-4 sm:mt-5">
          {products.map((product, index) => {
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
                <div className={`relative aspect-[4/5] min-w-0 overflow-hidden sm:aspect-[5/4] lg:aspect-auto lg:min-h-[580px] ${imageRight ? "lg:order-2" : ""}`}>
                  <div aria-hidden="true" className="absolute inset-[8%_3%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(238,229,214,.58)_0%,rgba(248,244,236,.28)_48%,transparent_74%)]" />
                  <Image
                    src={product.image}
                    alt={product.imageAlt ?? product.title}
                    fill
                    sizes="(min-width: 1280px) 570px, (min-width: 1024px) 48vw, 100vw"
                    className="hidden object-contain sm:block"
                    style={{ objectPosition: imageTreatment.imagePosition, transform: `scale(${imageTreatment.imageScale})` }}
                  />
                  <Image
                    src={product.image}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(max-width: 639px) 100vw, 1px"
                    className="object-contain sm:hidden"
                    style={{ objectPosition: imageTreatment.mobileImagePosition, transform: `scale(${imageTreatment.mobileImageScale})` }}
                  />
                </div>
                <div className={`flex min-w-0 flex-col justify-center px-1 sm:px-2 lg:px-0 ${imageRight ? "lg:order-1" : ""}`}>
                  <p className="section-eyebrow">Stapelstühle</p>
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
                  <ProductActions product={product} requestSample={index % 2 === 0} />
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
            <h2 id="selection-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">Welcher Stapelstuhl passt zu Ihrem Raum?</h2>
            <p className="mt-4 text-sm leading-7 text-premium-muted">Nutzungshäufigkeit, Stapelhöhe, Sitzkomfort, Boden, Reihenbildung und Raumwirkung entscheiden über die passende Ausführung.</p>
          </div>
          <div>
            <ul className="grid gap-3 sm:grid-cols-3">
              {["Komfort und Nutzung", "Transport und Lagerung", "Stoffe, Farben und Zubehör"].map((item) => (
                <li key={item} className="rounded-xl bg-premium-warm/70 px-4 py-4 text-sm font-medium text-premium-ink">{item}</li>
              ))}
            </ul>
            <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="btn-primary justify-center px-5 py-2.5 text-sm">Beratung zur Auswahl</Link>
              <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="btn-secondary justify-center px-5 py-2.5 text-sm">Musterstuhl anfragen</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

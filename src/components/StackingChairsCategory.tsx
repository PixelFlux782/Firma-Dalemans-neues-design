import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Product } from "@/lib/products";

interface Props {
  heroImage: string;
  products: Product[];
}

const imagePositions: Record<string, string> = {
  "stapelstuhl-mod-1021c": "object-[50%_52%]",
  "stapelstuhl-1010i": "object-[50%_50%]",
  "stapelstuhl-1010a": "object-[50%_51%]",
  "stapelstuhl-1010b": "object-[50%_52%]",
  "stapelstuhl-e1000": "object-[50%_49%]",
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
      <section className="overflow-hidden rounded-4xl border border-premium-beige/70 bg-white/70 shadow-premium">
        <div className="grid lg:grid-cols-[1.02fr_.98fr]">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-9">
            <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: "Stapelstühle" }]} />
            <p className="section-eyebrow mt-6">Produktkategorie · {products.length} Produkte</p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Stapelstühle</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-premium-muted">Vielseitige Bestuhlung für Gottesdienste, Mehrzweckräume und Veranstaltungen mit hoher Frequenz.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="btn-primary px-6 py-3">Musterstuhl anfragen</Link>
              <a href="tel:+499342915353" className="btn-secondary px-6 py-3">Beratung</a>
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden bg-premium-warm sm:min-h-[350px] lg:min-h-[370px]">
            <Image src={heroImage} alt="Fünf gepolsterte Stapelstühle in einem hellen Raum" fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover object-[50%_62%]" />
          </div>
        </div>
      </section>

      <section id="products" aria-labelledby="products-title" className="scroll-mt-28">
        <p className="section-eyebrow">Sortiment</p>
        <h2 id="products-title" className="mt-3 max-w-3xl font-display text-3xl font-medium leading-tight text-premium-ink sm:text-4xl">Fünf Stapelstühle für unterschiedliche Räume und Anforderungen</h2>
        <p className="mt-4 max-w-2xl leading-7 text-premium-muted">Von der robusten Grundausstattung bis zur gepolsterten Komfortlösung – persönlich ausgewählt und langfristig betreut.</p>

        <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
          {products.map((product, index) => {
            const imageRight = index % 2 === 1;

            return (
              <article
                key={product.slug}
                className="grid min-w-0 overflow-hidden rounded-2xl border border-premium-beige/75 bg-[#fbfaf5] shadow-[0_7px_24px_rgba(20,18,16,.045)] lg:grid-cols-[38%_62%]"
              >
                <div className={`relative min-h-[320px] overflow-hidden bg-premium-warm/70 sm:min-h-[360px] lg:min-h-[390px] ${imageRight ? "lg:order-2" : ""}`}>
                  <Image
                    src={product.image}
                    alt={product.imageAlt ?? product.title}
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className={`object-contain ${imagePositions[product.slug] ?? "object-center"}`}
                  />
                </div>
                <div className={`flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:px-10 lg:py-8 ${imageRight ? "lg:order-1" : ""}`}>
                  <p className="section-eyebrow">Stapelstühle</p>
                  <h3 className="mt-2 font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink sm:text-3xl">{product.title}</h3>
                  <p className="mt-3 max-w-2xl leading-7 text-premium-muted">{product.shortDescription}</p>
                  <ul className="mt-4 grid gap-2 text-sm leading-6 text-premium-charcoal/90 sm:grid-cols-3 sm:gap-4" aria-label={`Merkmale von ${product.title}`}>
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

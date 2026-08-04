import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Product } from "@/lib/products";

interface Props {
  heroImage: string;
  products: Product[];
}

const imagePositions: Record<string, string> = {
  "stapelstuhl-1010i": "object-center",
  "stapelstuhl-1010a": "object-[50%_46%]",
  "stapelstuhl-1010b": "object-[50%_48%]",
  "stapelstuhl-e1000": "object-[50%_44%]",
};

function ProductActions({ product, sample = false }: { product: Product; sample?: boolean }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
      <Link href={`/produkte/${product.slug}`} className="btn-primary px-5 py-2.5 text-sm">
        Modell ansehen
      </Link>
      <Link
        href={`/kontakt?produkt=${encodeURIComponent(product.title)}`}
        className="inline-flex min-h-11 items-center text-sm font-medium text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4"
      >
        {sample ? "Musterstuhl anfragen" : "Ausführung besprechen"}
      </Link>
    </div>
  );
}

export default function StackingChairsCategory({ heroImage, products }: Props) {
  const featured = products.find((product) => product.slug === "stapelstuhl-mod-1021c") ?? products[0];
  const remaining = products.filter((product) => product.slug !== featured.slug);

  return (
    <div className="flex min-w-0 flex-col gap-12 md:gap-16">
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

        <article className="group mt-8 grid overflow-hidden rounded-4xl border border-premium-beige/70 bg-[#fbfaf5] shadow-premium transition duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg lg:grid-cols-[1.12fr_.88fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-premium-warm/60 sm:min-h-[440px] lg:min-h-[500px]">
            <Image src={featured.image} alt={featured.imageAlt ?? featured.title} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain p-2 transition duration-500 group-hover:scale-[1.015] sm:p-4" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="section-eyebrow">Unsere Empfehlung</p>
            <h3 className="mt-3 font-display text-3xl font-medium tracking-[-0.02em] text-premium-ink">{featured.title}</h3>
            <p className="mt-4 leading-7 text-premium-muted">{featured.shortDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {featured.highlights.slice(0, 3).map((item) => <span key={item} className="rounded-full bg-white px-3.5 py-2 text-xs leading-5 text-premium-charcoal shadow-sm">{item}</span>)}
            </div>
            <ProductActions product={featured} sample />
          </div>
        </article>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {remaining.map((product) => (
            <article key={product.slug} className="group flex min-h-0 flex-col overflow-hidden rounded-3xl border border-premium-beige/70 bg-[#fbfaf5] shadow-[0_8px_28px_rgba(20,18,16,.055)] transition duration-300 hover:-translate-y-0.5 hover:shadow-premium">
              <div className="relative aspect-[5/4] min-h-[310px] overflow-hidden bg-premium-warm/55 sm:min-h-[360px]">
                <Image src={product.image} alt={product.imageAlt ?? product.title} fill sizes="(min-width: 768px) 50vw, 100vw" className={`object-contain p-2 transition duration-500 group-hover:scale-[1.02] sm:p-3 ${imagePositions[product.slug] ?? "object-center"}`} />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink">{product.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-premium-muted">{product.shortDescription}</p>
                <p className="mt-4 text-sm leading-6 text-premium-charcoal/90">{product.highlights.slice(0, 3).join(" · ")}</p>
                <ProductActions product={product} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-4xl border border-premium-beige/70 bg-white/55 p-6 shadow-premium sm:p-8 lg:p-10" aria-labelledby="selection-title">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="section-eyebrow">Auswahlhilfe</p>
            <h2 id="selection-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">Welcher Stapelstuhl passt zu Ihrem Raum?</h2>
            <p className="mt-4 text-sm leading-7 text-premium-muted">Entscheidend sind Nutzungshäufigkeit, Stapelhöhe, Sitzkomfort, Boden, Reihenbildung und die gewünschte Raumwirkung.</p>
          </div>
          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Nutzung und Komfort", "Transport und Lagerung", "Stoffe, Farben und Zubehör"].map((item) => <p key={item} className="rounded-2xl bg-premium-warm/70 px-4 py-4 text-sm font-medium text-premium-ink">{item}</p>)}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="btn-primary px-5 py-2.5 text-sm">Beratung zur Auswahl</Link>
              <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="btn-secondary px-5 py-2.5 text-sm">Musterstuhl anfragen</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-4xl border border-premium-beige/70 bg-premium-warm/55 shadow-premium lg:grid-cols-2" aria-labelledby="materials-title">
        <div className="relative min-h-[290px] lg:min-h-[380px]">
          <Image src="/images/curated/Stoffe-Farben/Textilproben.webp" alt="Stoffmuster in verschiedenen Farben" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
          <p className="section-eyebrow">Material und Ausführung</p>
          <h2 id="materials-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">Farben und Materialien passend zum Raum</h2>
          <p className="mt-4 leading-7 text-premium-muted">Stoffe, Holzoberflächen und Gestellfarben prägen die Raumwirkung. Wir stimmen verfügbare Ausführungen modellbezogen mit Ihnen ab.</p>
          <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="mt-5 inline-flex min-h-11 w-fit items-center text-sm font-medium text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">Ausführung besprechen →</Link>
        </div>
      </section>

      <section className="rounded-4xl bg-premium-forest px-6 py-10 text-premium-highlight shadow-premium-lg sm:px-10 lg:px-12" aria-labelledby="cta-title">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.32em] text-premium-sage">Persönliche Beratung</p>
            <h2 id="cta-title" className="mt-3 font-display text-3xl font-medium sm:text-4xl">Probesitzen, vergleichen, sicher entscheiden</h2>
            <p className="mt-4 leading-7 text-white/75">Wir klären Raum, Nutzung, Stückzahl und Ausstattung persönlich – auf Wunsch mit einem Musterstuhl.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/kontakt?kategorie=Stapelst%C3%BChle" className="btn-light px-6 py-3">Musterstuhl anfragen</Link>
            <a href="tel:+499342915353" className="btn-outline-light px-6 py-3">Beratung</a>
          </div>
        </div>
      </section>
    </div>
  );
}

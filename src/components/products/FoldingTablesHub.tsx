import Link from "next/link";
import CategoryHero from "@/components/products/CategoryHero";
import CommerceProductCard from "@/components/commerce/CommerceProductCard";
import type { CommerceCollection } from "@/lib/commerce/types";
import type { ProductCategory } from "@/lib/product-categories";

export const foldingTableFaq = [
  { question: "Welche Klapptische sind für Gemeinden sinnvoll?", answer: "Stabile Tische mit widerstandsfähiger Oberfläche und einem Format, das sich gut bewegen, lagern und kombinieren lässt." },
  { question: "Sind Klapptische im Sondermaß möglich?", answer: "Ja, je nach Modell und Konstruktion. Senden Sie uns Raummaß, gewünschte Nutzung und Angaben zum Lagerweg; wir prüfen die passende Ausführung." },
] as const;

export default function FoldingTablesHub({ collection, category }: { collection: CommerceCollection; category: ProductCategory }) {
  return (
    <div className="flex min-w-0 flex-col gap-16 md:gap-20 lg:gap-24">
      <CategoryHero data={{
        slug: "/produkte/sortiment/klapptische",
        breadcrumbItems: [{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: "Klapptische" }],
        eyebrow: `${collection.products.length} Modelle · verschiedene Maße und Kanten`,
        title: "Klapptische für flexible Räume.",
        description: `${category.intro} ${collection.description}`,
        primaryCta: { label: "Modelle ansehen", href: "#produkte" },
        secondaryCta: { label: "Beratung erhalten", href: "/kontakt?kategorie=Klapptische" },
        metaLine: "Seit 1994 persönlich beraten · Sondermaße auf Anfrage · Raum- und Tischplanung",
        image: { src: "/neue bilder/Tische/Klapptisch-collage-detail.png", alt: "Klapptisch-Collage mit Details zu Tischplatte und Gestell", inset: "2%", backgroundTone: "#f1ece1" },
      }} />

      <section id="produkte" aria-labelledby="table-models-heading" className="scroll-mt-28">
        <div className="grid gap-6 border-b border-premium-beige/70 pb-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div><p className="section-eyebrow">Modellübersicht</p><h2 id="table-models-heading" className="mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink sm:text-4xl">Drei Modelle. Klar vergleichbar.</h2></div>
          <p className="max-w-2xl text-sm leading-7 text-premium-muted lg:justify-self-end">Rechtecktisch 310c, Seminar-Klapptisch 210c und Trapez-Klapptisch 310c decken unterschiedliche Aufstellungen ab. Maße und Kanten wählen Sie am Modell.</p>
        </div>
        <div className="grid gap-x-8 gap-y-14 pt-10 md:grid-cols-2">
          {collection.products.map((product, index) => <CommerceProductCard key={product.id} product={product} priority={index < 2} />)}
        </div>
      </section>

      <section aria-labelledby="table-guidance" className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div><p className="section-eyebrow">Kaufberatung</p><h2 id="table-guidance" className="section-title mt-4">Welcher Klapptisch passt zu Ihrem Raum?</h2><p className="mt-5 text-sm leading-7 text-premium-muted">{category.description}</p><div className="mt-5 flex flex-col items-start gap-2"><Link href="/wissen/klapptische-richtig-waehlen" className="inline-flex min-h-11 items-center font-semibold text-premium-forest underline underline-offset-4">Maße, Sitzplätze, 2:1-Prinzip und Gestelle</Link><Link href="/wissen/tischplatten-und-kanten" className="inline-flex min-h-11 items-center font-semibold text-premium-forest underline underline-offset-4">HPL, Melamin und Tischkanten vergleichen</Link></div></div>
        <div className="divide-y divide-premium-beige/80 border-y border-premium-beige/80">
          {[["Maße und Nutzung", "Wählen Sie Tischform und Format nach Personenanzahl, Aufstellung und Handhabung."], ["Oberfläche und Kante", "Oberfläche, ABS- oder Buchekante und Gestell stimmen wir auf die Beanspruchung ab."], ["Transport und Lagerung", "Lagerfläche, Transportwagen und Laufwege gehören zur Auswahl des passenden Tischs."]].map(([title, description], index) => <article key={title} className="grid gap-3 py-6 sm:grid-cols-[3rem_.7fr_1.3fr] sm:items-start sm:gap-6"><span className="font-display text-2xl text-premium-sand" aria-hidden>0{index + 1}</span><h3 className="font-semibold text-premium-ink">{title}</h3><p className="text-sm leading-7 text-premium-muted">{description}</p></article>)}
        </div>
        <p className="text-sm leading-7 text-premium-muted lg:col-span-2">Für kompakte Begegnungsflächen finden Sie den <Link className="font-medium text-premium-forest underline" href="/produkte/sortiment/bistrotische">Bistrotisch in der eigenen Kategorie</Link>.</p>
      </section>

      <section className="grid gap-8 border-y border-premium-beige/80 py-12 md:py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-16" aria-labelledby="table-planning-heading">
        <div><p className="section-eyebrow">Raumkompetenz</p><h2 id="table-planning-heading" className="section-title mt-4">Tische passend zum ganzen Raum planen.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-premium-muted">Tischanordnungen, Laufwege, Lagerflächen und Transport gehören zusammen. Wir unterstützen Sie bei der Planung für flexibel genutzte Räume.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/raeume-planung/raumplanung" className="btn-primary">Raumplanung ansehen</Link><Link href="/raumplaner" className="btn-secondary">3D-Raumplaner ausprobieren</Link></div></div>
        <ul className="grid gap-3 border-l border-premium-beige/80 pl-6 text-sm leading-7 text-premium-muted">{["Tischmaße und Aufstellungen", "Laufwege und Bewegungsflächen", "Lagerung und Transport", "Sondermaß für bestehende Räume"].map((item) => <li key={item} className="flex gap-3"><span aria-hidden className="text-premium-bronze">—</span>{item}</li>)}</ul>
      </section>

      <section className="grid gap-8 rounded-[2rem] bg-premium-warm/75 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-12" aria-labelledby="table-consultation-heading"><div><p className="section-eyebrow">Persönliche Beratung</p><h2 id="table-consultation-heading" className="section-title-functional mt-4">Die passende Ausführung gemeinsam klären.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-premium-muted">Teilen Sie uns Raummaß, Nutzung, gewünschte Tischform und Lagerweg mit. Wir helfen bei Modell, Oberfläche und Sondermaß.</p></div><Link href="/kontakt?kategorie=Klapptische" className="btn-primary shrink-0">Beratung anfragen</Link></section>

      <section aria-labelledby="table-faq-heading" className="mx-auto w-full max-w-4xl"><div className="text-center"><p className="section-eyebrow">Häufige Fragen</p><h2 id="table-faq-heading" className="mx-auto mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink sm:text-4xl">Klapptische kurz geklärt.</h2></div><div className="mt-8 divide-y divide-premium-beige/80 border-y border-premium-beige/80">{foldingTableFaq.map((item) => <details key={item.question} className="group py-5"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">{item.question}<span className="text-premium-bronze transition group-open:rotate-45" aria-hidden>＋</span></summary><p className="max-w-3xl pb-2 pt-4 text-sm leading-7 text-premium-muted">{item.answer}</p></details>)}</div></section>
    </div>
  );
}

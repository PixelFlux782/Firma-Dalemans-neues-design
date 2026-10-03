import Link from "next/link";
import type { ReactNode } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductTechnicalData from "@/components/chairs/ProductTechnicalData";
import type { CommerceFaqItem, CommerceSpecification } from "@/lib/commerce/types";

export interface ProductDetailData {
  path: string;
  category: string;
  categoryHref: string;
  name: string;
  shortDescription: string;
  description: string;
  editorialTitle?: string;
  highlights: string[];
  compatibility?: string[];
  useCases?: string[];
  variants?: string[];
  editorialNotes?: string[];
  specifications?: CommerceSpecification[];
  help?: { eyebrow: string; title: string; text: string; href: string; label: string; secondaryHref?: string; secondaryLabel?: string };
  consultation?: { eyebrow: string; title: string; text: string; href: string; label: string };
  faq?: CommerceFaqItem[];
  continuation?: { title: string; text: string; href: string; label: string };
  downloads?: { title: string; url: string }[];
}

export default function ProductDetailPage({ data, media, purchase, children }: {
  data: ProductDetailData;
  media: ReactNode;
  purchase: ReactNode;
  children?: ReactNode;
}) {
  const headingId = `product-${data.path.replace(/[^a-z0-9]/gi, "-")}`;
  return <div className="flex min-w-0 flex-col gap-16 md:gap-20 lg:gap-24">
    <section>
      <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: data.category, href: data.categoryHref }, { label: data.name }]} currentPath={data.path} />
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.06fr_.94fr] lg:gap-14">
        <div className="min-w-0 lg:sticky lg:top-28">{media}</div>
        <div className="min-w-0 lg:pt-3">
          <p className="section-eyebrow">{data.category}</p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-[1.04] tracking-[-0.035em] text-premium-ink sm:text-5xl lg:text-[3.65rem]">{data.name}</h1>
          <p className="mt-6 text-lg leading-8 text-premium-charcoal">{data.shortDescription}</p>
          {data.highlights.length ? <ul className="my-7 grid gap-3 border-y border-premium-beige/80 py-5 text-sm text-premium-muted sm:grid-cols-3">{data.highlights.map(item => <li key={item}>{item}</li>)}</ul> : null}
          {data.compatibility?.length ? <div className="mb-6 text-sm leading-7 text-premium-muted"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-premium-bronze">Kompatibilität</p><p>{data.compatibility.join(" ")}</p></div> : null}
          {purchase}
        </div>
      </div>
    </section>
    {data.description ? <section className="grid gap-10 border-y border-premium-beige/80 py-12 md:py-16 lg:grid-cols-[.75fr_1.25fr] lg:gap-16" aria-labelledby={`${headingId}-use`}>
      <div><p className="section-eyebrow">Modell &amp; Einsatz</p><h2 id={`${headingId}-use`} className="section-title mt-4">{data.editorialTitle ?? `${data.name} im Einsatz.`}</h2></div>
      <div><p className="text-lg leading-8 text-premium-charcoal">{data.description}</p>{data.useCases?.length ? <p className="mt-5 text-sm leading-7 text-premium-muted">Einsatzbereiche: {data.useCases.join(", ")}.</p> : null}</div>
    </section> : null}
    {data.variants?.length ? <section aria-labelledby={`${headingId}-variants`}><p className="section-eyebrow">Varianten &amp; Ausführungen</p><h2 id={`${headingId}-variants`} className="section-title mt-4">Passend zum Bedarf auswählen.</h2><div className="mt-9 grid gap-6 md:grid-cols-3">{data.variants.map((variant, index) => <article key={variant} className="border-t border-premium-beige/80 pt-5"><span className="font-display text-2xl text-premium-sand" aria-hidden>{String(index + 1).padStart(2, "0")}</span><p className="mt-3 text-sm leading-7 text-premium-muted">{variant}</p></article>)}</div></section> : null}
    {data.editorialNotes?.length ? <section aria-labelledby={`${headingId}-notes`}><p className="section-eyebrow">Planung &amp; Anwendung</p><h2 id={`${headingId}-notes`} className="section-title mt-4">Worauf es im Einsatz ankommt.</h2><ul className="mt-7 grid gap-4 text-sm leading-7 text-premium-muted md:grid-cols-2">{data.editorialNotes.map(note => <li key={note} className="border-t border-premium-beige/80 pt-4">{note}</li>)}</ul></section> : null}
    {children}
    <ProductTechnicalData items={data.specifications ?? []} />
    {data.downloads?.length ? <section><p className="section-eyebrow">Downloads</p><h2 className="section-title-functional mt-4">Unterlagen zum Produkt.</h2><div className="mt-7 divide-y divide-premium-beige/80 border-y border-premium-beige/80">{data.downloads.map(item => <a key={item.url} href={item.url} className="flex min-h-14 items-center justify-between gap-5 py-4 text-sm font-semibold text-premium-forest hover:underline">{item.title}<span aria-hidden>↓</span></a>)}</div></section> : null}
    {data.help ? <section className="relative overflow-hidden rounded-[2rem] bg-premium-warm/80 px-7 py-10 sm:px-10 lg:px-14 lg:py-14"><div className="grid items-end gap-9 lg:grid-cols-[1fr_auto] lg:gap-14"><div><p className="section-eyebrow">{data.help.eyebrow}</p><h2 className="section-title mt-4">{data.help.title}</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-premium-muted sm:text-base">{data.help.text}</p></div><div className="flex flex-wrap gap-3"><Link href={data.help.href} className="btn-primary text-center">{data.help.label}</Link>{data.help.secondaryHref ? <Link href={data.help.secondaryHref} className="btn-secondary text-center">{data.help.secondaryLabel}</Link> : null}</div></div></section> : null}
    {data.consultation ? <section className="grid gap-8 border-y border-premium-beige/80 py-12 md:py-16 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="section-eyebrow">{data.consultation.eyebrow}</p><h2 className="section-title-functional mt-4">{data.consultation.title}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-premium-muted">{data.consultation.text}</p></div><Link href={data.consultation.href} className="btn-secondary shrink-0 text-center">{data.consultation.label}</Link></section> : null}
    {data.faq?.length ? <section className="mx-auto w-full max-w-4xl"><div className="text-center"><p className="section-eyebrow">Häufige Fragen</p><h2 className="mx-auto mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink sm:text-4xl">{data.name} kurz geklärt.</h2></div><div className="mt-8 divide-y divide-premium-beige/80 border-y border-premium-beige/80">{data.faq.map(item => <details key={item.question} className="group py-5"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">{item.question}<span className="text-premium-bronze transition group-open:rotate-45" aria-hidden>＋</span></summary><p className="max-w-3xl pb-2 pt-4 text-sm leading-7 text-premium-muted">{item.answer}</p></details>)}</div></section> : null}
    {data.continuation ? <section className="flex flex-col items-start gap-5 border-t border-premium-beige/80 pt-9 sm:flex-row sm:items-center sm:justify-between"><div><p className="section-eyebrow">Weitere Produkte</p><h2 className="mt-2 font-display text-2xl text-premium-ink">{data.continuation.title}</h2><p className="mt-2 text-sm leading-7 text-premium-muted">{data.continuation.text}</p></div><Link href={data.continuation.href} className="btn-secondary">{data.continuation.label}</Link></section> : null}
  </div>;
}

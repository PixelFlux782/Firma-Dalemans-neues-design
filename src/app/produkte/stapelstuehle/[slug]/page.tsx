import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChairConfigurator from "@/components/chairs/ChairConfigurator";
import ChairGallery from "@/components/chairs/ChairGallery";
import ProductTechnicalData from "@/components/chairs/ProductTechnicalData";
import { StructuredData } from "@/components/StructuredData";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getProductByHandle, getProductsByCollection } from "@/lib/commerce/service";
import {
  chairConfigurationFromSearchParams,
  isStackingChairProduct,
} from "@/lib/commerce/stacking-chairs";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const modelPath = (slug: string) => `/produkte/stapelstuehle/${slug}`;

const referenceFaq = [
  {
    question: "Was bedeuten Stoffgruppe 2, 3 und 4?",
    answer: "Die Preisliste unterscheidet diese drei Gruppen bei gepolsterten Ausführungen. Verlässliche Angaben zu Material, Farbe oder Eigenschaften der Gruppen werden noch ergänzt.",
  },
  {
    question: "Kann ich einen Musterstuhl erhalten?",
    answer: "Ja. Ein Musterstuhl kann persönlich angefragt und passend zum Projekt abgestimmt werden.",
  },
  {
    question: "Kann ich später Stühle nachbestellen?",
    answer: "Dalemans begleitet Nachbestellungen persönlich. Die konkrete Ausführung und Verfügbarkeit werden anhand des vorhandenen Bestands geprüft.",
  },
  {
    question: "Gibt es Ersatzteile?",
    answer: "Ersatzteile und Reparaturen sind Teil des Dalemans-Service. Die Zuordnung erfolgt produktbezogen anhand von Modell, Fotos und Maßen.",
  },
  {
    question: "Unterstützt DLMNS bei der Bestuhlungsplanung?",
    answer: "Ja. Dalemans unterstützt mit Bestuhlungs- und Stellplänen sowie 2D- und 3D-Raumplanung, auch bei schwierigen Geometrien, Lagerung und Transportwegen.",
  },
] as const;

export async function generateStaticParams() {
  const products = await getProductsByCollection("stapelstuehle");
  return products.filter(isStackingChairProduct).map((product) => ({ slug: product.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);
  if (!product || !product.stackingChair) return {};

  return buildMetadata({
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? product.shortDescription,
    path: modelPath(product.handle),
    image: product.featuredImage?.url ?? null,
    keywords: [
      product.title,
      `Stapelstuhl ${product.stackingChair.modelCode}`,
      "Stapelstuhl Reihenverbindung",
      "Stapelstuhl Sitzpolster",
    ],
  });
}

export default async function StackingChairModelPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await getProductByHandle(slug);
  if (!product || !product.stackingChair) notFound();

  const initialConfiguration = chairConfigurationFromSearchParams(query);
  const isReference = product.stackingChair.editorialStatus === "reference";
  const faqs = isReference ? [...product.faq, ...referenceFaq] : product.faq;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": absoluteUrl(`${modelPath(product.handle)}#product`),
        name: product.title,
        description: product.description,
        url: absoluteUrl(modelPath(product.handle)),
        ...(product.featuredImage ? { image: product.images.map((image) => absoluteUrl(image.url)) } : {}),
        category: "Stapelstühle",
        additionalProperty: product.specifications.map((item) => ({
          "@type": "PropertyValue",
          name: item.name,
          value: item.value,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Produkte", item: absoluteUrl("/produkte") },
          { "@type": "ListItem", position: 3, name: "Stapelstühle", item: absoluteUrl("/produkte/stapelstuehle") },
          { "@type": "ListItem", position: 4, name: product.title, item: absoluteUrl(modelPath(product.handle)) },
        ],
      },
      ...(faqs.length ? [{
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }] : []),
    ],
  };

  return (
    <div className="flex min-w-0 flex-col gap-16 md:gap-20 lg:gap-24">
      <StructuredData data={structuredData} />

      <section>
        <Breadcrumbs
          items={[
            { label: "Start", href: "/" },
            { label: "Produkte", href: "/produkte" },
            { label: "Stapelstühle", href: "/produkte/stapelstuehle" },
            { label: `Modell ${product.stackingChair.modelCode}` },
          ]}
          currentPath={modelPath(product.handle)}
        />

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.06fr_.94fr] lg:gap-14">
          <div className="min-w-0 lg:sticky lg:top-28">
            <ChairGallery images={product.images} modelCode={product.stackingChair.modelCode} />
          </div>

          <div className="min-w-0 lg:pt-3">
            <p className="section-eyebrow">Stapelstuhl</p>
            <h1 className="mt-4 font-display text-4xl font-medium leading-[1.04] tracking-[-0.035em] text-premium-ink sm:text-5xl lg:text-[3.65rem]">
              Modell {product.stackingChair.modelCode}
            </h1>
            <p className="mt-6 text-lg leading-8 text-premium-charcoal">{product.shortDescription}</p>
            <div className="my-7 grid gap-3 border-y border-premium-beige/80 py-5 text-sm text-premium-muted sm:grid-cols-3">
              <span>stapelbar</span>
              <span>drei Polsterarten</span>
              <span>Reihenverbindung erhältlich</span>
            </div>

            {!isReference ? (
              <p className="mb-6 rounded-xl border border-premium-beige bg-premium-warm/70 px-4 py-3 text-sm leading-6 text-premium-muted">
                Preis und Konfiguration sind vollständig vorbereitet. Individuelle Produkttexte, technische Werte und eindeutig zugeordnete Bilder werden für dieses Modell noch ergänzt.
              </p>
            ) : null}

            <ChairConfigurator product={product} initialConfiguration={initialConfiguration} />
          </div>
        </div>
      </section>

      {isReference ? (
        <>
          <section className="grid gap-10 border-y border-premium-beige/80 py-12 md:py-16 lg:grid-cols-[.75fr_1.25fr] lg:gap-16" aria-labelledby="model-use-heading">
            <div>
              <p className="section-eyebrow">Modell &amp; Einsatz</p>
              <h2 id="model-use-heading" className="section-title mt-4">Für Räume, die regelmäßig wechseln.</h2>
            </div>
            <div>
              <p className="text-lg leading-8 text-premium-charcoal">{product.description}</p>
              <p className="mt-5 text-sm leading-7 text-premium-muted">Dalemans begleitet Gemeinden, Kirchen, Kommunen und andere Einrichtungen bei Bestuhlung, Nachbestellung und langfristiger Nutzung. Die konkrete Eignung wird für Raum, Menge und Ablauf persönlich geprüft.</p>
            </div>
          </section>

          <section aria-labelledby="upholstery-heading">
            <div className="max-w-3xl">
              <p className="section-eyebrow">Polsteroptionen</p>
              <h2 id="upholstery-heading" className="section-title mt-4">Komfort passend zur Nutzungsdauer wählen.</h2>
              <p className="mt-5 text-sm leading-7 text-premium-muted">Die Preisliste unterscheidet drei Polsterarten. Bei gepolsterten Varianten wählen Sie zusätzlich Stoffgruppe 2, 3 oder 4; weitere Stoffinformationen werden erst nach fachlicher Ergänzung angezeigt.</p>
            </div>
            <div className="mt-9 grid gap-6 md:grid-cols-3">
              {[
                ["Ungepolstert", "Ohne zusätzliche Stoffgruppe; für eine sachliche, flexible Grundausführung."],
                ["Sitzpolster", "Sitzfläche gepolstert; Stoffgruppe 2, 3 oder 4 wird separat gewählt."],
                ["Sitz- und Rückenpolster", "Sitz und Rücken gepolstert; ebenfalls in drei Stoffgruppen geführt."],
              ].map(([title, text], index) => (
                <article key={title} className="border-t border-premium-beige/80 pt-5">
                  <span className="font-display text-2xl text-premium-sand" aria-hidden>0{index + 1}</span>
                  <h3 className="mt-3 font-display text-2xl font-medium text-premium-ink">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-premium-muted">{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid overflow-hidden rounded-[2rem] bg-premium-ink text-white lg:grid-cols-2" aria-labelledby="row-heading">
            <div className="px-7 py-10 sm:px-10 lg:px-14 lg:py-14">
              <p className="section-eyebrow text-premium-sand">Reihenbestuhlung</p>
              <h2 id="row-heading" className="mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-white sm:text-4xl">Reihenverbindung bewusst mitplanen.</h2>
              <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">Jede Ausführung von Modell 1021 ist laut Preisliste mit und ohne Reihenverbindung geführt. Für geordnete Reihen sollten Raum, Wege und Veranstaltungsablauf gemeinsam betrachtet werden.</p>
            </div>
            <div className="border-t border-white/15 px-7 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-14 lg:py-14">
              <p className="section-eyebrow text-premium-sand">Flexible Raumnutzung</p>
              <h2 className="mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-white">Umbau, Lagerung und Transport zusammendenken.</h2>
              <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">Dalemans plant nicht nur Stellbilder, sondern auch Wege zwischen Nutzung, Umbau und Lagerung. Konkrete Stapelmengen oder Transportkapazitäten werden erst mit verifizierten technischen Daten benannt.</p>
            </div>
          </section>
        </>
      ) : null}

      <ProductTechnicalData items={product.specifications} />

      {product.downloads?.length ? (
        <section aria-labelledby="downloads-heading">
          <p className="section-eyebrow">Downloads</p>
          <h2 id="downloads-heading" className="section-title-functional mt-4">Unterlagen zum Modell.</h2>
          <div className="mt-7 divide-y divide-premium-beige/80 border-y border-premium-beige/80">
            {product.downloads.map((download) => (
              <a key={download.url} href={download.url} className="flex min-h-14 items-center justify-between gap-5 py-4 text-sm font-semibold text-premium-forest hover:underline">
                {download.title}<span aria-hidden>↓</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[2rem] bg-premium-warm/80 px-7 py-10 sm:px-10 lg:px-14 lg:py-14" aria-labelledby="planning-heading">
        <div className="grid items-end gap-9 lg:grid-cols-[1fr_auto] lg:gap-14">
          <div>
            <p className="section-eyebrow">Raum- und Bestuhlungsplanung</p>
            <h2 id="planning-heading" className="section-title mt-4">Nicht nur den Stuhl planen – den ganzen Raum.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-premium-muted sm:text-base">Stellpläne, 2D-/3D-Planung, Tischanordnungen, schwierige Geometrien sowie Lagerung und Transport bilden ein gemeinsames Konzept.</p>
          </div>
          <Link href={`/raeume-planung/raumplanung?produkt=${encodeURIComponent(product.title)}`} className="btn-primary shrink-0 text-center">Raumplanung ansehen</Link>
        </div>
      </section>

      <section className="grid gap-8 border-y border-premium-beige/80 py-12 md:py-16 lg:grid-cols-[1fr_auto] lg:items-center" aria-labelledby="sample-chair-heading">
        <div>
          <p className="section-eyebrow">Musterstuhl &amp; Beratung</p>
          <h2 id="sample-chair-heading" className="section-title-functional mt-4">Ausführung vor größerer Bestellung persönlich prüfen.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-premium-muted">Unsicher bei Polsterung, Stoff oder Menge? Ein echter Ansprechpartner klärt die nächsten Schritte mit Ihnen – ohne Chatbot und ohne unnötig langes Formular.</p>
        </div>
        <Link href={`/kontakt?anliegen=Musterstuhl&produkt=${encodeURIComponent(product.title)}#anfrage`} className="btn-secondary shrink-0 text-center">Musterstuhl anfragen</Link>
      </section>

      {faqs.length ? (
        <section className="mx-auto w-full max-w-4xl" aria-labelledby="model-faq-heading">
          <div className="text-center">
            <p className="section-eyebrow">Häufige Fragen</p>
            <h2 id="model-faq-heading" className="mx-auto mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink sm:text-4xl">Modell {product.stackingChair.modelCode} kurz geklärt.</h2>
          </div>
          <div className="mt-8 divide-y divide-premium-beige/80 border-y border-premium-beige/80">
            {faqs.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                  {item.question}<span className="text-premium-bronze transition group-open:rotate-45" aria-hidden>＋</span>
                </summary>
                <p className="max-w-3xl pb-2 pt-4 text-sm leading-7 text-premium-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col items-start gap-5 border-t border-premium-beige/80 pt-9 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-eyebrow">Weitere Modelle</p>
          <p className="mt-2 text-sm leading-7 text-premium-muted">Alle fünf Stapelstuhlmodelle vergleichen und konfigurieren.</p>
        </div>
        <Link href="/produkte/stapelstuehle#modelle" className="btn-secondary">Zur Modellübersicht</Link>
      </section>
    </div>
  );
}

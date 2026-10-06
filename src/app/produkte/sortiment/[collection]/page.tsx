import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommerceProductCard from "@/components/commerce/CommerceProductCard";
import CategoryHero from "@/components/products/CategoryHero";
import FoldingTablesHub, { foldingTableFaq } from "@/components/products/FoldingTablesHub";
import { StructuredData } from "@/components/StructuredData";
import { getCollectionByHandle, getCollections } from "@/lib/commerce/service";
import { getProductCategoryById } from "@/lib/product-categories";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

interface CollectionPageProps { params: Promise<{ collection: string }>; }

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ collection: collection.handle }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { collection: handle } = await params;
  const collection = await getCollectionByHandle(handle);
  if (!collection) return {};

  return buildMetadata({
    title: collection.seo.title ?? collection.title,
    description: collection.seo.description ?? collection.description,
    path: `/produkte/sortiment/${collection.handle}`,
    image: handle === "klapptische" ? "/neue bilder/Tische/Klapptisch-collage-detail.png" : collection.image?.url ?? null,
    keywords: [collection.title, "Dalemans Zubehör", "Nachrüstung"],
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection: handle } = await params;
  const collection = await getCollectionByHandle(handle);
  if (!collection) notFound();
  const isTables = handle === "klapptische";
  const isLecterns = handle === "rednerpulte";
  const tableCategory = isTables ? getProductCategoryById("klapptische") : null;
  const path = `/produkte/sortiment/${handle}`;
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", "@id": absoluteUrl(`${path}#produkte`), name: collection.title, itemListElement: collection.products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.title, url: absoluteUrl(`/produkte/artikel/${product.handle}`) })) };
  const accessory = ["gleiter-bodenschutz", "reihenverbinder-nachruestung", "transport-lagerung"].includes(handle);
  const heroTitle = handle === "bistrotische"
    ? "Bistrotische für Begegnung und Empfang."
    : handle === "rednerpulte"
      ? "Rednerpulte für einen klaren Auftritt."
      : collection.title;

  if (isTables && tableCategory) return <>
    <StructuredData data={itemList} />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: foldingTableFaq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />
    <FoldingTablesHub collection={collection} category={tableCategory} />
  </>;

  return (
    <div className="page-stack">
      <StructuredData data={itemList} />
      <CategoryHero data={{
        slug: path,
        breadcrumbItems: [{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, ...(accessory ? [{ label: "Zubehör", href: "/produkte/kategorien/transportwagen-zubehoer" }] : []), { label: collection.title }],
        eyebrow: `Produktkategorie · ${collection.products.length} ${collection.products.length === 1 ? "Produkt" : "Produkte"}`,
        title: heroTitle,
        description: collection.description,
        primaryCta: { label: collection.products.length ? "Produkte ansehen" : "Aktuellen Stand ansehen", href: "#produkte" },
        secondaryCta: { label: "Beratung erhalten", href: `/kontakt?kategorie=${encodeURIComponent(collection.title)}` },
        metaLine: "Persönliche Auswahlhilfe · Passende Ausführung · Langfristige Betreuung",
        image: {
          src: collection.image?.url ?? null,
          alt: collection.image?.altText ?? `${collection.title} für flexible Räume`,
          inset: collection.handle === "transport-lagerung" ? "3%" : "6%",
          backgroundTone: "#f1ece1",
        },
      }} />

      {isLecterns ? <section className="rounded-[2rem] bg-premium-warm/70 p-7 sm:p-10" aria-labelledby="lectern-guidance">
        <p className="section-eyebrow">Auswahlhilfe</p><h2 id="lectern-guidance" className="section-title-functional mt-3">Das passende Rednerpult auswählen</h2>
        <p className="mt-4 max-w-3xl leading-7 text-premium-muted">Raumwirkung, Anlass, Ablagefläche und gewünschte Form entscheiden über die passende Ausführung. Typ A und Typ E bestehen aus transparentem Acrylglas; Typ AH hat eine massive Furnierplatte. Maße, Ausstattung und Verfügbarkeit klären wir persönlich.</p>
        <ul className="mt-6 grid gap-3 text-sm leading-7 text-premium-muted md:grid-cols-3"><li><strong>Typ A:</strong> klare Linienführung und großzügige Ablage für Manuskript und Unterlagen.</li><li><strong>Typ E:</strong> eigenständige Acrylglas-Ausführung mit offener Raumwirkung.</li><li><strong>Typ AH:</strong> Ausführung mit massiver Furnierplatte.</li></ul>
      </section> : null}

      <section id="produkte">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Produkte</p>
            <h2 className="section-title mt-4">Passend eingeordnet und klar beschrieben.</h2>
          </div>
          {collection.products.length ? <p className="text-sm text-premium-muted">{collection.products.length} {collection.products.length === 1 ? "Produkt" : "Produkte"}</p> : null}
        </div>

        {collection.products.length ? (
          <div className="section-grid-top grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {collection.products.map((product, index) => <CommerceProductCard key={product.id} product={product} priority={index < 3} />)}
          </div>
        ) : (
          <div className="section-grid-top rounded-[2rem] border border-premium-beige/80 bg-premium-warm/65 p-7 sm:p-10 lg:p-12" data-testid="collection-empty-state">
            <p className="section-eyebrow">Sortiment in Vorbereitung</p>
            <h2 className="section-title-functional mt-4">Noch kein Produkt zur direkten Auswahl.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-premium-muted sm:text-base">
              Dieser Bereich wird auf Basis geprüfter Produktdaten aufgebaut. Wenn Sie bereits ein Muster, ein Ersatzteil oder Hilfe bei der Zuordnung benötigen, beraten wir Sie persönlich.
            </p>
            <Link href="/kontakt?anliegen=Muster%20und%20Beratung" className="btn-primary mt-7 text-center">Bedarf persönlich klären</Link>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] bg-premium-ink px-6 py-9 text-white sm:px-9 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-12">
        <div>
          <p className="section-eyebrow text-premium-sand">Kompatibilität prüfen</p>
          <h2 className="mt-4 font-display text-2xl font-medium tracking-[-0.02em] text-white sm:text-3xl">Nicht sicher, welche Ausführung passt?</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">Foto, Maß und vorhandenes Modell bereithalten – wir helfen bei der Zuordnung.</p>
        </div>
        <Link href="/kontakt?anliegen=Kompatibilitaetspruefung" className="btn-on-dark mt-7 shrink-0 text-center lg:mt-0">Beratung kontaktieren</Link>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommerceMedia from "@/components/commerce/CommerceMedia";
import CommerceProductCard from "@/components/commerce/CommerceProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getCollectionByHandle, getCollections } from "@/lib/commerce/service";
import { buildMetadata } from "@/lib/seo";

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
    path: `/shop/${collection.handle}`,
    image: collection.image?.url ?? null,
    keywords: [collection.title, "Dalemans Zubehör", "Nachrüstung"],
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection: handle } = await params;
  const collection = await getCollectionByHandle(handle);
  if (!collection) notFound();

  return (
    <div className="page-stack">
      <section className="grid overflow-hidden rounded-[2.5rem] border border-premium-beige/70 bg-white/55 shadow-premium lg:grid-cols-[.92fr_1.08fr]">
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Shop", href: "/shop" }, { label: collection.title }]} currentPath={`/shop/${collection.handle}`} />
          <p className="section-eyebrow mt-10">Shop-Bereich</p>
          <h1 className="mt-4 max-w-[14ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">{collection.title}</h1>
          <p className="section-lead mt-6 max-w-xl">{collection.description}</p>
          <Link href="#produkte" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:text-premium-bronze hover:underline">
            {collection.products.length ? "Produkte ansehen" : "Aktuellen Stand ansehen"} <span className="ml-2" aria-hidden>↓</span>
          </Link>
        </div>
        <CommerceMedia image={collection.image} fallbackLabel={collection.title} priority sizes="(min-width: 1024px) 52vw, 100vw" aspectRatio="5 / 4" imageInset={collection.handle === "transport-lagerung" ? "3%" : "6%"} className="min-h-[320px] lg:min-h-[580px]" />
      </section>

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

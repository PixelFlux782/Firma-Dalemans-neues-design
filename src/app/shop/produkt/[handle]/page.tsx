import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommerceMedia from "@/components/commerce/CommerceMedia";
import CommerceProductCard from "@/components/commerce/CommerceProductCard";
import ProductVariantSelector from "@/components/commerce/ProductVariantSelector";
import { StructuredData } from "@/components/StructuredData";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  getCollectionByHandle,
  getProductByHandle,
  getProducts,
} from "@/lib/commerce/service";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};

  return buildMetadata({
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? product.shortDescription,
    path: `/shop/produkt/${product.handle}`,
    image: product.featuredImage?.url ?? null,
    keywords: [product.title, ...product.suitableFor],
  });
}

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3 text-sm leading-7 text-premium-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[.7rem] h-px w-4 shrink-0 bg-premium-bronze/70" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const collectionHandle = product.collectionHandles[0];
  const collection = collectionHandle ? await getCollectionByHandle(collectionHandle) : null;
  const accessories = (
    await Promise.all(product.accessories.map((reference) => getProductByHandle(reference.handle)))
  ).filter((entry) => entry !== null);

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/shop/produkt/${product.handle}#product`),
    name: product.title,
    description: product.description,
    url: absoluteUrl(`/shop/produkt/${product.handle}`),
    ...(product.featuredImage ? { image: [absoluteUrl(product.featuredImage.url)] } : {}),
    ...(collection ? { category: collection.title } : {}),
    additionalProperty: product.specifications.map((specification) => ({
      "@type": "PropertyValue",
      name: specification.name,
      value: specification.value,
    })),
  };

  return (
    <div className="page-stack">
      <StructuredData data={productStructuredData} />

      <section>
        <Breadcrumbs
          items={[
            { label: "Start", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(collection
              ? [{ label: collection.title, href: `/shop/${collection.handle}` }]
              : []),
            { label: product.title },
          ]}
          currentPath={`/shop/produkt/${product.handle}`}
        />

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
          <CommerceMedia
            image={product.featuredImage}
            fallbackLabel={product.title}
            priority
            sizes="(min-width: 1024px) 54vw, 100vw"
            aspectRatio="5 / 4"
            imageInset={product.handle === "stuhltransportwagen" ? "2%" : "6%"}
            className="min-h-[330px] rounded-[2.25rem] sm:min-h-[500px] lg:sticky lg:top-28 lg:min-h-[620px]"
          />

          <div className="min-w-0 lg:pt-4">
            <p className="section-eyebrow">{collection?.title ?? "Shop-Produkt"}</p>
            <h1 className="mt-4 font-display text-4xl font-medium leading-[1.06] tracking-[-0.035em] text-premium-ink sm:text-5xl lg:text-[3.5rem]">
              {product.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-premium-charcoal">{product.shortDescription}</p>
            <p className="mt-5 text-sm leading-7 text-premium-muted sm:text-base">{product.description}</p>

            {(product.compatibility.length || product.suitableFor.length) ? (
              <div className="my-8 grid gap-5 border-y border-premium-beige/80 py-6 sm:grid-cols-2">
                {product.compatibility.length ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-premium-bronze">Kompatibilität</p>
                    <p className="mt-2 text-sm leading-6 text-premium-muted">{product.compatibility[0]}</p>
                  </div>
                ) : null}
                {product.suitableFor.length ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-premium-bronze">Einsatzbereich</p>
                    <p className="mt-2 text-sm leading-6 text-premium-muted">{product.suitableFor.join(", ")}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <ProductVariantSelector
              product={product}
              initialVariantId={Array.isArray(query.variant) ? query.variant[0] : query.variant}
            />
          </div>
        </div>
      </section>

      {product.specifications.length ? (
        <section className="grid gap-10 border-y border-premium-beige/80 py-12 md:py-16 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">Technische Informationen</p>
            <h2 className="section-title-functional mt-4">Das Wesentliche auf einen Blick.</h2>
          </div>
          <dl className="divide-y divide-premium-beige/80 border-t border-premium-beige/80">
            {product.specifications.map((item) => (
              <div key={item.name} className="grid gap-2 py-5 sm:grid-cols-[.75fr_1.25fr] sm:gap-6">
                <dt className="text-sm font-semibold text-premium-ink">{item.name}</dt>
                <dd className="text-sm leading-6 text-premium-muted">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {(product.measureGuide.length || product.applicationNotes.length) ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {product.measureGuide.length ? (
            <article className="rounded-[2rem] bg-premium-warm/75 p-7 sm:p-9">
              <p className="section-eyebrow">Messhilfe</p>
              <h2 className="section-title-functional mt-4">Vor der Auswahl richtig prüfen.</h2>
              <DetailList items={product.measureGuide} />
            </article>
          ) : null}
          {product.applicationNotes.length ? (
            <article className="rounded-[2rem] border border-premium-beige/80 bg-white/55 p-7 sm:p-9">
              <p className="section-eyebrow">Anwendung</p>
              <h2 className="section-title-functional mt-4">Hinweise für den Einsatz.</h2>
              <DetailList items={product.applicationNotes} />
            </article>
          ) : null}
        </section>
      ) : null}

      {product.variants.some((variant) => variant.finderAttributes) ? (
        <section className="rounded-[2rem] border border-premium-beige/80 bg-premium-warm/70 px-6 py-8 sm:px-9 sm:py-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="section-eyebrow">Noch nicht sicher?</p>
              <h2 className="section-title-functional mt-3">Welche Variante passt zu Ihrem Gestell?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-premium-muted">Der Gleiter-Finder führt durch Rohrform, Außenmaß, Boden und benötigte Menge.</p>
            </div>
            <Link href="/shop/gleiter-finder" prefetch={false} className="btn-primary text-center">Gleiter-Finder starten</Link>
          </div>
        </section>
      ) : null}

      {accessories.length ? (
        <section>
          <p className="section-eyebrow">Passende Ergänzungen</p>
          <h2 className="section-title mt-4">Im Zusammenhang betrachten.</h2>
          <div className="section-grid-top grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {accessories.map((accessory) => (
              <CommerceProductCard key={accessory.id} product={accessory} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[2.5rem] bg-premium-ink px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-premium-leaf/20 blur-3xl" aria-hidden />
        <div className="relative grid items-end gap-9 lg:grid-cols-[1fr_auto] lg:gap-14">
          <div>
            <p className="section-eyebrow text-premium-sand">Musterset &amp; Beratung</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium leading-tight tracking-[-0.025em] text-white sm:text-4xl">
              Nicht sicher, welche Ausführung wirklich passt?
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              {product.consultationNote ?? "Halten Sie Foto, Maße und vorhandenes Modell bereit. Wir unterstützen persönlich bei der Zuordnung."}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
              <span>Maße prüfen</span><span aria-hidden>·</span><span>Foto bereithalten</span><span aria-hidden>·</span><span>Modell notieren</span>
            </div>
          </div>
          <Link href={`/kontakt?anliegen=Produktberatung&produkt=${encodeURIComponent(product.title)}`} className="btn-on-dark shrink-0 text-center">
            Persönlich beraten lassen
          </Link>
        </div>
      </section>

      {product.faq.length ? (
        <section className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <p className="section-eyebrow">Häufige Frage</p>
            <h2 className="mx-auto mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-premium-ink">Was vor der Auswahl wichtig ist.</h2>
          </div>
          <div className="mt-8 divide-y divide-premium-beige/80 border-y border-premium-beige/80">
            {product.faq.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                  {item.question}<span className="text-premium-bronze transition group-open:rotate-45" aria-hidden>＋</span>
                </summary>
                <p className="max-w-3xl pb-2 pt-4 text-sm leading-7 text-premium-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {product.notes.length ? (
        <aside className="text-xs leading-6 text-premium-subtle">
          <p>{product.notes.join(" ")}</p>
        </aside>
      ) : null}
    </div>
  );
}

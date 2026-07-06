import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CinematicPageHero from "@/components/home/CinematicPageHero";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { StructuredData } from "@/components/StructuredData";
import { categoryPlaceholders } from "@/lib/category-placeholders";
import { getProductCategoryById } from "@/lib/product-categories";
import { getProductBySlug, getProductsByCategory, products } from "@/lib/products";
import { absoluteUrl, buildMetadata, siteName } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return buildMetadata({
    title: product.title,
    description: product.shortDescription,
    path: `/produkte/${product.slug}`,
    image: product.image,
    keywords: [product.title, product.categoryName, ...product.suitableFor],
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getProductCategoryById(product.categoryId);
  const relatedProducts = getProductsByCategory(product.categoryId).filter(
    (entry) => entry.slug !== product.slug,
  );
  const mood = categoryPlaceholders[product.categoryId].mood;

  const productStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": absoluteUrl(`/produkte/${product.slug}#product`),
        name: product.title,
        description: product.description,
        image: [absoluteUrl(product.image)],
        category: product.categoryName,
        brand: {
          "@type": "Brand",
          name: siteName,
        },
        manufacturer: {
          "@type": "Organization",
          name: siteName,
          url: absoluteUrl("/"),
        },
        audience: {
          "@type": "Audience",
          audienceType: product.suitableFor.join(", "),
        },
        url: absoluteUrl(`/produkte/${product.slug}`),
        keywords: [product.categoryName, ...product.suitableFor].join(", "),
        additionalProperty: [
          ...product.highlights.map((item) => ({
            "@type": "PropertyValue",
            name: "Produktmerkmal",
            value: item,
          })),
          ...(product.variants ?? []).map((item) => ({
            "@type": "PropertyValue",
            name: "Variante",
            value: item,
          })),
          ...(product.details ?? []).map((item) => ({
            "@type": "PropertyValue",
            name: "Detail",
            value: item,
          })),
        ],
        offers: {
          "@type": "Offer",
          url: absoluteUrl(`/produkte/${product.slug}`),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: siteName,
            url: absoluteUrl("/"),
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": absoluteUrl(`/produkte/${product.slug}#breadcrumb`),
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Start",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Produkte",
            item: absoluteUrl("/produkte"),
          },
          ...(category
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: category.name,
                  item: absoluteUrl(`/produkte/kategorien/${category.id}`),
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: category ? 4 : 3,
            name: product.title,
            item: absoluteUrl(`/produkte/${product.slug}`),
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: "Start", href: "/" },
    { label: "Produkte", href: "/produkte" },
    ...(category
      ? [
          {
            label: category.name,
            href: `/produkte/kategorien/${category.id}`,
          },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <div className="page-stack">
      <StructuredData data={productStructuredData} />

      <CinematicPageHero
        eyebrow={product.categoryName}
        title={product.title}
        lead={product.description}
        breadcrumbs={breadcrumbItems}
        mediaAriaLabel={`${product.title} — Produktkomposition`}
        mood={mood}
        actions={
          <>
            <Link href="/kontakt" className="btn-hero-primary text-center">
              Produkt anfragen
            </Link>
            {category ? (
              <Link
                href={`/produkte/kategorien/${category.id}`}
                className="btn-hero-secondary text-center"
              >
                Zur Kategorie
              </Link>
            ) : null}
          </>
        }
        visual={
          <Image
            src={product.image}
            alt={product.title}
            width={720}
            height={460}
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="min-h-[220px] w-full object-cover sm:min-h-[260px] md:min-h-[280px]"
          />
        }
      />

      <HomeSection>
        <SectionHeader
          eyebrow="Vorteile"
          title="Was dieses Modell im Alltag leistet"
          lead="Die wichtigsten Merkmale und typischen Einsatzgebiete — klar strukturiert, ohne technischen Überbau."
          align="editorial"
        />

        <div className="section-grid-top grid gap-5 md:grid-cols-2 lg:gap-6">
          <article className="premium-card premium-card-hover animate-fade-up rounded-4xl border border-premium-beige/50 bg-gradient-to-br from-premium-warm to-premium-canvas/80 p-7 md:p-9">
            <span
              className="mb-4 block h-px w-8 bg-gradient-to-r from-premium-bronze/50 to-transparent"
              aria-hidden
            />
            <p className="section-eyebrow text-[0.65rem]">Besondere Merkmale</p>
            <ul className="mt-6 space-y-3.5 text-sm leading-[1.8] text-premium-muted">
              {product.highlights.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="shrink-0 text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="premium-card premium-card-hover animate-fade-up animate-fade-up-delay-1 rounded-4xl bg-premium-ink p-7 text-premium-canvas md:p-9">
            <span
              className="mb-4 block h-px w-8 bg-gradient-to-r from-premium-sand/60 to-transparent"
              aria-hidden
            />
            <p className="section-eyebrow text-[0.65rem] text-premium-sand">
              Typische Einsatzgebiete
            </p>
            <ul className="mt-6 grid gap-3.5 text-sm leading-[1.8] text-white/75 sm:grid-cols-2">
              {product.suitableFor.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="shrink-0 text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </HomeSection>

      {product.details?.length ? (
        <HomeSection variant="breathing">
          <article className="premium-card p-8 md:p-10 lg:p-12">
            <span
              className="mb-5 block h-px w-10 bg-gradient-to-r from-premium-bronze/50 to-transparent"
              aria-hidden
            />
            <p className="section-eyebrow">Ausführung & Informationen</p>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink md:text-[1.65rem]">
                  Wissenswert zum Produkt
                </h2>
                <ul className="mt-6 space-y-3.5 border-t border-premium-warm/80 pt-6 text-sm leading-[1.8] text-premium-muted">
                  {product.details.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="shrink-0 text-premium-sand" aria-hidden>
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-4xl border border-premium-beige/50 bg-gradient-to-br from-premium-warm/90 to-premium-canvas/60 p-7 md:p-8">
                <p className="font-display text-lg font-medium tracking-[-0.02em] text-premium-ink">
                  Beratung & Planung
                </p>
                <p className="mt-4 text-sm leading-[1.8] text-premium-muted">
                  Wir stimmen Maße, Ausführung, Zubehör und Stückzahlen auf Ihre
                  Räume und Abläufe ab — damit die Lösung im Alltag zuverlässig
                  funktioniert.
                </p>
                <Link href="/kontakt" className="btn-primary mt-7 inline-flex">
                  Beratung anfragen
                </Link>
              </div>
            </div>
          </article>
        </HomeSection>
      ) : null}

      {product.variants?.length ? (
        <HomeSection variant={product.details?.length ? "default" : "breathing"}>
          <article className="premium-card p-8 md:p-10 lg:p-12">
            <span
              className="mb-5 block h-px w-10 bg-gradient-to-r from-premium-bronze/50 to-transparent"
              aria-hidden
            />
            <p className="section-eyebrow">Varianten & Hinweise</p>
            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink md:text-[1.65rem]">
                  Mögliche Ausführungen
                </h2>
                <ul className="mt-6 space-y-3.5 border-t border-premium-warm/80 pt-6 text-sm leading-[1.8] text-premium-muted">
                  {product.variants.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="shrink-0 text-premium-sand" aria-hidden>
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-premium-ink md:text-[1.65rem]">
                  Gut zu wissen
                </h2>
                <p className="mt-6 border-t border-premium-warm/80 pt-6 text-sm leading-[1.8] text-premium-muted">
                  {product.note ??
                    "Für konkrete Stückzahlen, Oberflächen, Zubehör oder Sondermaße kann dieses Produkt individuell auf Ihren Bedarf abgestimmt werden."}
                </p>
              </div>
            </div>
          </article>
        </HomeSection>
      ) : product.note ? (
        <HomeSection variant="breathing">
          <article className="premium-card p-8 md:p-10 lg:p-12">
            <span
              className="mb-5 block h-px w-10 bg-gradient-to-r from-premium-bronze/50 to-transparent"
              aria-hidden
            />
            <p className="section-eyebrow">Gut zu wissen</p>
            <p className="mt-6 max-w-3xl text-base leading-[1.85] text-premium-muted">
              {product.note}
            </p>
          </article>
        </HomeSection>
      ) : null}

      {relatedProducts.length ? (
        <HomeSection variant="breathing">
          <SectionHeader
            eyebrow="Weitere Lösungen"
            title="Passende Modelle aus dieser Kategorie"
            lead="Ähnliche Produkte für Ihr Raumkonzept — mit direktem Einstieg in Details und Beratung."
            href={
              category ? `/produkte/kategorien/${category.id}` : undefined
            }
            linkLabel={category ? "Ganze Kategorie ansehen" : undefined}
            align="editorial"
          />

          <div className="section-grid-top grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.slice(0, 3).map((entry, index) => (
              <div
                key={entry.slug}
                className={[
                  "animate-fade-up",
                  index === 1 && "animate-fade-up-delay-1",
                  index === 2 && "animate-fade-up-delay-2",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <ProductCard product={entry} />
              </div>
            ))}
          </div>
        </HomeSection>
      ) : null}

      <PremiumCtaSection
        eyebrow="Beratung"
        title={`Interesse an ${product.title}?`}
        lead="Wir beraten zu Stückzahlen, Varianten, Zubehör und Einbindung in Ihr Raumkonzept — persönlich und mit Blick auf Raumwirkung."
        primaryHref="/kontakt"
        primaryLabel="Projekt besprechen"
        secondaryHref={category ? `/produkte/kategorien/${category.id}` : "/produkte"}
        secondaryLabel={category ? "Mehr aus der Kategorie" : "Alle Produkte"}
      />
    </div>
  );
}

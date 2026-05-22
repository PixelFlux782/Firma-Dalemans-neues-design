import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/home/SectionHeader";
import { StructuredData } from "@/components/StructuredData";
import PageHero from "@/components/ui/PageHero";
import CtaBanner from "@/components/ui/CtaBanner";
import InfoPanel from "@/components/ui/InfoPanel";
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
    <div className="space-y-20 md:space-y-28">
      <StructuredData data={productStructuredData} />

      <PageHero
        eyebrow={product.categoryName}
        title={product.title}
        lead={product.description}
        breadcrumbs={breadcrumbItems}
        actions={
          <>
            <Link href="/kontakt" className="btn-primary text-center">
              Produkt anfragen
            </Link>
            {category ? (
              <Link
                href={`/produkte/kategorien/${category.id}`}
                className="btn-secondary text-center"
              >
                Zur Kategorie
              </Link>
            ) : null}
          </>
        }
        visual={
          <img
            src={product.image}
            alt={product.title}
            className="min-h-[320px] w-full object-cover"
          />
        }
      />

      <section className="grid gap-6 md:grid-cols-2">
        <InfoPanel title="Besondere Merkmale" variant="warm">
          <ul className="space-y-3">
            {product.highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-premium-sand" aria-hidden>
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </InfoPanel>

        <InfoPanel title="Typische Einsatzgebiete" variant="dark">
          <ul className="grid gap-3 sm:grid-cols-2">
            {product.suitableFor.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-premium-sand" aria-hidden>
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </InfoPanel>
      </section>

      {product.details?.length ? (
        <section className="premium-card p-8 md:p-10">
          <p className="section-eyebrow">Ausführung & Informationen</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-premium-ink md:text-2xl">
                Wissenswert zum Produkt
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-premium-muted">
                {product.details.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-premium-sand" aria-hidden>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <InfoPanel title="Beratung & Planung" variant="warm">
              <p>
                Wir stimmen Maße, Ausführung, Zubehör und Stückzahlen auf Ihre
                Räume und Abläufe ab — damit die Lösung im Alltag zuverlässig
                funktioniert.
              </p>
            </InfoPanel>
          </div>
        </section>
      ) : null}

      {product.variants?.length ? (
        <section className="premium-card p-8 md:p-10">
          <p className="section-eyebrow">Varianten & Hinweise</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-premium-ink md:text-2xl">
                Mögliche Ausführungen
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-premium-muted">
                {product.variants.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-premium-sand" aria-hidden>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-premium-ink md:text-2xl">
                Gut zu wissen
              </h2>
              <p className="mt-5 text-sm leading-7 text-premium-muted">
                {product.note ??
                  "Für konkrete Stückzahlen, Oberflächen, Zubehör oder Sondermaße kann dieses Produkt individuell auf Ihren Bedarf abgestimmt werden."}
              </p>
            </div>
          </div>
        </section>
      ) : product.note ? (
        <section className="premium-card p-8 md:p-10">
          <p className="section-eyebrow">Gut zu wissen</p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-premium-muted">
            {product.note}
          </p>
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className="space-y-10 md:space-y-12">
          <SectionHeader
            eyebrow="Weitere Produkte"
            title="Passende Modelle aus dieser Kategorie"
            href={
              category ? `/produkte/kategorien/${category.id}` : undefined
            }
            linkLabel={category ? "Ganze Kategorie ansehen" : undefined}
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.slice(0, 3).map((entry) => (
              <ProductCard key={entry.slug} product={entry} />
            ))}
          </div>
        </section>
      ) : null}

      <CtaBanner
        title={`Interesse an ${product.title}?`}
        lead="Wir beraten zu Stückzahlen, Varianten, Zubehör und Einbindung in Ihr Raumkonzept."
        primaryHref="/kontakt"
        primaryLabel="Projekt besprechen"
        secondaryHref={category ? `/produkte/kategorien/${category.id}` : "/produkte"}
        secondaryLabel={category ? "Mehr aus der Kategorie" : "Alle Produkte"}
      />
    </div>
  );
}

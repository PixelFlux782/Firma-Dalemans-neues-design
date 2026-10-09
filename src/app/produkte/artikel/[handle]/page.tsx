import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import CommerceMedia from "@/components/commerce/CommerceMedia";
import ProductVariantSelector from "@/components/commerce/ProductVariantSelector";
import ProductDetailPage from "@/components/product-detail/ProductDetailPage";
import { StructuredData } from "@/components/StructuredData";
import { getCollectionByHandle, getProductByHandle, getProducts } from "@/lib/commerce/service";
import { commerceDetailData } from "@/lib/product-detail-data";
import { getRelatedGuidesForProduct } from "@/lib/knowledge/advisory-integration";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

interface Props { params: Promise<{ handle: string }>; searchParams: Promise<{ variant?: string | string[] }> }
export async function generateStaticParams() {
  return (await getProducts()).filter(product => !product.stackingChair).map(product => ({ handle: product.handle }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductByHandle((await params).handle);
  if (!product) return {};
  if (product.stackingChair) return { alternates: { canonical: `/produkte/stapelstuehle/${product.handle}` } };
  return buildMetadata({ title: product.seo.title ?? product.title, description: product.seo.description ?? product.shortDescription,
    path: `/produkte/artikel/${product.handle}`, image: product.featuredImage?.url ?? null,
    keywords: [product.title, ...product.suitableFor] });
}
export default async function ProductPage({ params, searchParams }: Props) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const product = await getProductByHandle(handle);
  if (!product) notFound();
  if (product.stackingChair) permanentRedirect(`/produkte/stapelstuehle/${handle}`);
  const collection = product.collectionHandles[0] ? await getCollectionByHandle(product.collectionHandles[0]) : null;
  const path = `/produkte/artikel/${product.handle}`;
  const data = commerceDetailData(product, collection?.title ?? "Produkt", collection ? `/produkte/sortiment/${collection.handle}` : "/produkte", path);
  const relatedGuides = getRelatedGuidesForProduct({ handle: product.handle, collectionHandles: product.collectionHandles });
  const structuredData = { "@context": "https://schema.org", "@type": "Product", "@id": absoluteUrl(`${path}#product`),
    name: product.title, description: product.description, url: absoluteUrl(path),
    ...(product.images.length ? { image: product.images.map(image => absoluteUrl(image.url)) } : {}),
    ...(collection ? { category: collection.title } : {}),
    additionalProperty: product.specifications.map(item => ({ "@type": "PropertyValue", name: item.name, value: item.value })) };
  return <><StructuredData data={structuredData} /><ProductDetailPage data={data} relatedGuides={relatedGuides}
    media={<CommerceMedia image={product.featuredImage} images={product.images} fallbackLabel={product.title} priority sizes="(min-width: 1024px) 54vw, 100vw" aspectRatio="5 / 4" imageInset={product.handle === "stuhltransportwagen" ? "2%" : "6%"} className="min-h-[330px] rounded-[2.25rem] sm:min-h-[500px] lg:min-h-[620px]" />}
    purchase={<ProductVariantSelector product={product} initialVariantId={Array.isArray(query.variant) ? query.variant[0] : query.variant} />}
  /></>;
}

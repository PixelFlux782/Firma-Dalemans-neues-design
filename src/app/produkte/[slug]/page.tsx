import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductVisual from "@/components/ProductVisual";
import ProductDetailPage from "@/components/product-detail/ProductDetailPage";
import InquiryPurchase from "@/components/product-detail/InquiryPurchase";
import { StructuredData } from "@/components/StructuredData";
import { getProductBySlug, products } from "@/lib/products";
import { legacyDetailData } from "@/lib/product-detail-data";
import { absoluteUrl, buildMetadata, siteName } from "@/lib/seo";

interface Props { params: Promise<{ slug: string }> }
export function generateStaticParams() { return products.map(product => ({ slug: product.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  if (!product) return {};
  return buildMetadata({ title: product.title, description: product.shortDescription,
    path: `/produkte/${product.slug}`, image: product.image,
    keywords: [product.title, product.categoryName, ...product.suitableFor] });
}
export default async function LegacyProductPage({ params }: Props) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();
  const data = legacyDetailData(product);
  const structuredData = { "@context": "https://schema.org", "@type": "Product", "@id": absoluteUrl(`${data.path}#product`),
    name: product.title, description: product.description, image: [absoluteUrl(product.image)],
    category: product.categoryName, brand: { "@type": "Brand", name: siteName }, url: absoluteUrl(data.path),
    additionalProperty: product.highlights.map(item => ({ "@type": "PropertyValue", name: "Produktmerkmal", value: item })) };
  return <><StructuredData data={structuredData} /><ProductDetailPage data={data}
    media={<ProductVisual src={product.image} alt={product.imageAlt ?? product.title} priority sizes="(min-width: 1024px) 52vw, 100vw" aspectRatio={product.categoryId === "klapptische" ? "5 / 4" : "4 / 3"} imageInset="7%" backgroundTone="canvas" className="min-h-[330px] rounded-[2rem] sm:min-h-[500px] lg:min-h-[620px]" />}
    purchase={<InquiryPurchase name={product.title} />}
  /></>;
}

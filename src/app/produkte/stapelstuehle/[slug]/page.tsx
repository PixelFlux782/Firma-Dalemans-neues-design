import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChairDetail from "@/components/product-detail/ChairDetail";
import { StructuredData } from "@/components/StructuredData";
import { getProductByHandle, getProductsByCollection } from "@/lib/commerce/service";
import { chairConfigurationFromSearchParams, isStackingChairProduct } from "@/lib/commerce/stacking-chairs";
import { commerceDetailData } from "@/lib/product-detail-data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
const modelPath = (slug: string) => `/produkte/stapelstuehle/${slug}`;
const referenceFaq = [
  { question: "Was bedeuten Stoffgruppe 2, 3 und 4?", answer: "Die Preisliste unterscheidet diese drei Gruppen bei gepolsterten Ausführungen. Verlässliche Angaben zu Material, Farbe oder Eigenschaften der Gruppen werden noch ergänzt." },
  { question: "Kann ich einen Musterstuhl erhalten?", answer: "Ja. Ein Musterstuhl kann persönlich angefragt und passend zum Projekt abgestimmt werden." },
  { question: "Kann ich später Stühle nachbestellen?", answer: "Dalemans begleitet Nachbestellungen persönlich. Die konkrete Ausführung und Verfügbarkeit werden anhand des vorhandenen Bestands geprüft." },
  { question: "Gibt es Ersatzteile?", answer: "Ersatzteile und Reparaturen sind Teil des Dalemans-Service. Die Zuordnung erfolgt produktbezogen anhand von Modell, Fotos und Maßen." },
  { question: "Unterstützt DLMNS bei der Bestuhlungsplanung?", answer: "Ja. Dalemans unterstützt mit Bestuhlungs- und Stellplänen sowie 2D- und 3D-Raumplanung, auch bei schwierigen Geometrien, Lagerung und Transportwegen." },
];
export async function generateStaticParams() {
  return (await getProductsByCollection("stapelstuehle")).filter(isStackingChairProduct).map(product => ({ slug: product.handle }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductByHandle((await params).slug);
  if (!product?.stackingChair) return {};
  return buildMetadata({ title: product.seo.title ?? product.title, description: product.seo.description ?? product.shortDescription,
    path: modelPath(product.handle), image: product.featuredImage?.url ?? null,
    keywords: [product.title, `Stapelstuhl ${product.stackingChair.modelCode}`, "Stapelstuhl Reihenverbindung", "Stapelstuhl Sitzpolster"] });
}
export default async function StackingChairModelPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await getProductByHandle(slug);
  if (!product?.stackingChair) notFound();
  const path = modelPath(product.handle);
  const data = commerceDetailData(product, "Stapelstuhl", "/produkte/stapelstuehle", path);
  if (product.stackingChair.editorialStatus === "reference") {
    data.editorialTitle = "Für Räume, die regelmäßig wechseln.";
    data.faq = [...product.faq, ...referenceFaq];
  }
  const structuredData = { "@context": "https://schema.org", "@graph": [
    { "@type": "Product", "@id": absoluteUrl(`${path}#product`), name: product.title, description: product.description,
      url: absoluteUrl(path), ...(product.images.length ? { image: product.images.map(image => absoluteUrl(image.url)) } : {}),
      category: "Stapelstühle", additionalProperty: product.specifications.map(item => ({ "@type": "PropertyValue", name: item.name, value: item.value })) },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Produkte", item: absoluteUrl("/produkte") },
      { "@type": "ListItem", position: 3, name: "Stapelstühle", item: absoluteUrl("/produkte/stapelstuehle") },
      { "@type": "ListItem", position: 4, name: product.title, item: absoluteUrl(path) }] },
    ...(data.faq?.length ? [{ "@type": "FAQPage", mainEntity: data.faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }] : []),
  ] };
  return <><StructuredData data={structuredData} /><ChairDetail product={product} data={data}
    configuration={chairConfigurationFromSearchParams(query)} quantity={Number(Array.isArray(query.menge) ? query.menge[0] : query.menge) || 1} /></>;
}

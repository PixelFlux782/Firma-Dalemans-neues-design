import type { Metadata } from "next";
import StackingChairHub, { stackingChairCategoryFaq } from "@/components/chairs/StackingChairHub";
import { StructuredData } from "@/components/StructuredData";
import { getProductsByCollection } from "@/lib/commerce/service";
import { isStackingChairProduct } from "@/lib/commerce/stacking-chairs";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

const path = "/produkte/stapelstuehle";

export const metadata: Metadata = buildMetadata({
  title: "Stapelstühle für flexible Räume",
  description: "Fünf Stapelstuhlmodelle vergleichen, Polsterung und Reihenverbindung wählen und persönlich zu Menge, Musterstuhl und Raumplanung beraten lassen.",
  path,
  image: "/images/curated/Stapelstühle/1021c.webp",
  keywords: ["Stapelstühle", "Stapelstühle Gemeinden", "Stapelstühle Kirchen", "Reihenverbindung", "gepolsterte Stapelstühle"],
});

export default async function StackingChairsPage() {
  const products = (await getProductsByCollection("stapelstuehle"))
    .filter(isStackingChairProduct);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": absoluteUrl(`${path}#modelle`),
        name: "DLMNS Stapelstuhlmodelle",
        url: absoluteUrl(path),
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.title,
          url: absoluteUrl(`${path}/${product.handle}`),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Produkte", item: absoluteUrl("/produkte") },
          { "@type": "ListItem", position: 3, name: "Stapelstühle", item: absoluteUrl(path) },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: stackingChairCategoryFaq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StackingChairHub products={products} />
    </>
  );
}

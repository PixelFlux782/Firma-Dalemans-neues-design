import type { Metadata } from "next";
import ProductCategoryOverview from "@/components/ProductCategoryOverview";
import { getProductCategoryById } from "@/lib/product-categories";
import { buildMetadata } from "@/lib/seo";

const category = getProductCategoryById("stapelstuehle");

export const metadata: Metadata = category
  ? buildMetadata({
      title: "Stapelstühle für Gemeinden, Kirchen und Säle kaufen",
      description:
        "Robuste Stapelstühle, Kirchenstühle und Gemeindestühle für Gemeindesaal, Saalbestuhlung und Veranstaltungen mit Zubehör und persönlicher Beratung.",
      path: "/produkte/kategorien/stapelstuehle",
      image: category.image,
      keywords: [
        "Stapelstühle für Gemeinden",
        "Kirchenstuhl",
        "Gemeindestuhl",
        "Stapelstuhl Saal",
        ...category.useCases,
      ],
    })
  : {};

export default function StapelstuehlePage() {
  return <ProductCategoryOverview categoryId="stapelstuehle" />;
}

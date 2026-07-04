import type { Metadata } from "next";
import ProductCategoryOverview from "@/components/ProductCategoryOverview";
import { getProductCategoryById } from "@/lib/product-categories";
import { buildMetadata } from "@/lib/seo";

const category = getProductCategoryById("klapptische");

export const metadata: Metadata = category
  ? buildMetadata({
      title: "Klapptische für Gemeinden, Seminarräume und Säle kaufen",
      description:
        "Klapptische für Gemeinden, Seminartische, Trapezklapptische und Klapptische nach Sondermaß mit Beratung zu Nutzung, Lagerung und Zubehör.",
      path: "/produkte/kategorien/klapptische",
      image: category.image,
      keywords: [
        "Klapptische für Gemeinden",
        "Seminartisch",
        "Trapezklapptisch",
        "Klapptisch Sondermaß",
        ...category.useCases,
      ],
    })
  : {};

export default function KlapptischePage() {
  return <ProductCategoryOverview categoryId="klapptische" />;
}

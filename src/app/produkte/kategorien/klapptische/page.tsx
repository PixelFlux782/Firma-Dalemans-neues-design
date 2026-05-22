import type { Metadata } from "next";
import ProductCategoryOverview from "@/components/ProductCategoryOverview";
import { getProductCategoryById } from "@/lib/product-categories";
import { buildMetadata } from "@/lib/seo";

const category = getProductCategoryById("klapptische");

export const metadata: Metadata = category
  ? buildMetadata({
      title: `${category.name} kaufen`,
      description: category.description,
      path: "/produkte/kategorien/klapptische",
      image: category.image,
      keywords: [category.name, ...category.useCases],
    })
  : {};

export default function KlapptischePage() {
  return <ProductCategoryOverview categoryId="klapptische" />;
}

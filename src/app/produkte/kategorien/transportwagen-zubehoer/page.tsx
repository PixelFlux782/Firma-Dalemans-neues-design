import type { Metadata } from "next";
import ProductCategoryOverview from "@/components/ProductCategoryOverview";
import { getProductCategoryById } from "@/lib/product-categories";
import { buildMetadata } from "@/lib/seo";

const category = getProductCategoryById("transportwagen-zubehoer");

export const metadata: Metadata = category
  ? buildMetadata({
      title: `${category.name} kaufen`,
      description: category.description,
      path: "/produkte/kategorien/transportwagen-zubehoer",
      image: category.image,
      keywords: [category.name, ...category.useCases],
    })
  : {};

export default function TransportwagenZubehoerPage() {
  return <ProductCategoryOverview categoryId="transportwagen-zubehoer" />;
}

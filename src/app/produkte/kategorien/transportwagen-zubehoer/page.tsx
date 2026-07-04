import type { Metadata } from "next";
import ProductCategoryOverview from "@/components/ProductCategoryOverview";
import { getProductCategoryById } from "@/lib/product-categories";
import { buildMetadata } from "@/lib/seo";

const category = getProductCategoryById("transportwagen-zubehoer");

export const metadata: Metadata = category
  ? buildMetadata({
      title: "Transportwagen und Zubehör für Stühle und Tische",
      description:
        "Transportwagen für Stühle und Tische, Reihenverbinder, Buchablagen, Stuhlgleiter und Zubehör für Gemeinden, Säle und Veranstaltungslogistik.",
      path: "/produkte/kategorien/transportwagen-zubehoer",
      image: category.image,
      keywords: [
        "Transportwagen für Stühle",
        "Transportwagen für Tische",
        "Stuhltransportwagen",
        "Tischtransportwagen",
        "Reihenverbinder",
        ...category.useCases,
      ],
    })
  : {};

export default function TransportwagenZubehoerPage() {
  return <ProductCategoryOverview categoryId="transportwagen-zubehoer" />;
}

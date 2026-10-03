import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductCategoryOverview from "@/components/ProductCategoryOverview";
import AccessoriesHub from "@/components/AccessoriesHub";
import { getProductCategoryById, productCategories } from "@/lib/product-categories";
import { type ProductCategoryId } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ category: string }>;
}

const categoryTitles: Record<string, string> = {
  stapelstuehle: "Stapelstühle für Gemeinden und Kirchen",
  klapptische: "Klapptische für Gemeinden und Mehrzweckräume",
  "transportwagen-zubehoer": "Transportwagen, Zubehör und Ersatzteile",
};

export function generateStaticParams() {
  return productCategories.filter((category) => category.id !== "klapptische").map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const categoryId = rawCategory as ProductCategoryId;
  if (categoryId === "klapptische") return { alternates: { canonical: "/produkte/sortiment/klapptische" } };
  const category = getProductCategoryById(categoryId);

  if (!category) {
    return {};
  }

  return buildMetadata({
    title: categoryTitles[category.id] ?? category.name,
    description: category.description,
    path: `/produkte/kategorien/${category.id}`,
    image: category.image,
    keywords: [category.name, ...category.useCases],
  });
}

export default async function ProductCategoryDetailPage({ params }: Props) {
  const { category: rawCategory } = await params;
  const categoryId = rawCategory as ProductCategoryId;
  if (categoryId === "klapptische") permanentRedirect("/produkte/sortiment/klapptische");

  if (!getProductCategoryById(categoryId)) {
    notFound();
  }

  return categoryId === "transportwagen-zubehoer" ? <AccessoriesHub /> : <ProductCategoryOverview categoryId={categoryId} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCategoryOverview from "@/components/ProductCategoryOverview";
import { getProductCategoryById, productCategories } from "@/lib/product-categories";
import { type ProductCategoryId } from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return productCategories.map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const categoryId = rawCategory as ProductCategoryId;
  const category = getProductCategoryById(categoryId);

  if (!category) {
    return {};
  }

  return buildMetadata({
    title: `${category.name} kaufen`,
    description: category.description,
    path: `/produkte/kategorien/${category.id}`,
    image: category.image,
    keywords: [category.name, ...category.useCases],
  });
}

export default async function ProductCategoryDetailPage({ params }: Props) {
  const { category: rawCategory } = await params;
  const categoryId = rawCategory as ProductCategoryId;

  if (!getProductCategoryById(categoryId)) {
    notFound();
  }

  return <ProductCategoryOverview categoryId={categoryId} />;
}

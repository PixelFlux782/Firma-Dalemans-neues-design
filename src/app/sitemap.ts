import type { MetadataRoute } from "next";
import { productCategories } from "@/lib/product-categories";
import { products } from "@/lib/products";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["/", "/produkte", "/produkte/kategorien", "/firma", "/kontakt"];

  const staticEntries = staticRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const categoryEntries = productCategories.map((category) => ({
    url: `${siteUrl}/produkte/kategorien/${category.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const productEntries = products.map((product) => ({
    url: `${siteUrl}/produkte/${product.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}

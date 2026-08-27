import type { MetadataRoute } from "next";
import { productCategories } from "@/lib/product-categories";
import { products } from "@/lib/products";
import { getCollections, getProducts } from "@/lib/commerce/service";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [shopCollections, shopProducts] = await Promise.all([
    getCollections(),
    getProducts(),
  ]);

  const staticRoutes = [
    "/",
    "/produkte",
    "/produkte/stapelstuehle",
    "/shop",
    "/shop/gleiter-finder",
    "/produkte/rednerpulte",
    "/raeume-planung",
    "/raeume-planung/raumplanung",
    "/raumloesungen/gemeindesaal",
    "/beratung-service",
    "/beratung/stapelstuehle-kaufen",
    "/sonderloesungen",
    "/sonderposten",
    "/firma",
    "/kontakt",
  ];

  const staticEntries = staticRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const categoryEntries = productCategories.filter((category) => category.id !== "stapelstuehle").map((category) => ({
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

  const shopCollectionEntries = shopCollections.filter((collection) => collection.handle !== "stapelstuehle").map((collection) => ({
    url: `${siteUrl}/shop/${collection.handle}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const shopProductEntries = shopProducts.filter((product) => !product.stackingChair).map((product) => ({
    url: `${siteUrl}/shop/produkt/${product.handle}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...productEntries,
    ...shopCollectionEntries,
    ...shopProductEntries,
    ...shopProducts.filter((product) => product.stackingChair).map((product) => ({
      url: `${siteUrl}/produkte/stapelstuehle/${product.handle}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

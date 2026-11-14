import { displayedMoney } from "@/lib/commerce/price-display";
import type { CommerceProduct, CommerceProductVariant } from "@/lib/commerce/types";
import { absoluteUrl } from "@/lib/seo";

type JsonLd = Record<string, unknown>;

function realPublicPrice(variant: CommerceProductVariant) {
  const amount = Number(variant.price?.amount);
  if (variant.priceDataStatus !== "verified"
    || (variant.priceStatus !== "fixed" && variant.priceStatus !== "from")
    || variant.availability === "out_of_stock"
    || !variant.price || variant.price.currencyCode !== "EUR"
    || !Number.isFinite(amount) || amount <= 0) return null;
  return displayedMoney(variant.price, "private").amount;
}

function buildOffer(variant: CommerceProductVariant, path: string): JsonLd | null {
  const price = realPublicPrice(variant);
  if (!price) return null;
  const url = new URL(absoluteUrl(path));
  url.searchParams.set("variant", variant.id);
  return {
    "@type": "Offer", url: url.toString(), price, priceCurrency: "EUR",
    itemCondition: "https://schema.org/NewCondition",
    ...(variant.availability === "in_stock" ? { availability: "https://schema.org/InStock" } : {}),
    ...(variant.sku ? { sku: variant.sku } : {}),
  };
}

/** Returns null instead of emitting an invalid Product for inquiry-only data. */
export function buildCommerceProductStructuredData(product: CommerceProduct, path: string, category?: string | null): JsonLd | null {
  const offers = product.variants.flatMap((variant) => {
    const offer = buildOffer(variant, path);
    return offer ? [offer] : [];
  });
  if (!offers.length) return null;
  return {
    "@type": "Product", "@id": absoluteUrl(`${path}#product`), name: product.title, url: absoluteUrl(path),
    brand: { "@type": "Brand", name: "Dalemans" },
    ...(product.description.trim() ? { description: product.description } : {}),
    ...(product.images.length ? { image: product.images.map((image) => absoluteUrl(image.url)) } : {}),
    ...(category ? { category } : {}),
    ...(product.specifications.length ? { additionalProperty: product.specifications.map((item) => ({ "@type": "PropertyValue", name: item.name, value: item.value })) } : {}),
    offers: offers.length === 1 ? offers[0] : offers,
  };
}

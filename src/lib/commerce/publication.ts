import type { CommerceProduct } from "@/lib/commerce/types";

/**
 * Unverified fixtures may remain available to isolated development tests, but
 * they must never cross the public commerce-provider boundary in any environment.
 */
export function hasUnverifiedDevelopmentData(product: CommerceProduct) {
  return product.variants.some((variant) =>
    variant.sku?.startsWith("DEV-")
    || variant.priceDataStatus === "development"
    || variant.finderAttributes?.dataStatus === "development",
  );
}

export function publicCommerceProducts(products: readonly CommerceProduct[], environment = process.env.NODE_ENV) {
  void environment;
  return products.filter((product) => !hasUnverifiedDevelopmentData(product));
}

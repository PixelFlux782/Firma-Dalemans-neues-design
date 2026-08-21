import "server-only";
import type { CommerceProvider } from "@/lib/commerce/types";
import { localCommerceProvider } from "@/lib/commerce/providers/local";

type CommerceProviderName = "local" | "shopify";

function selectedProviderName(): CommerceProviderName {
  const configured = process.env.COMMERCE_PROVIDER?.trim().toLowerCase() || "local";

  if (configured === "local" || configured === "shopify") {
    return configured;
  }

  throw new Error(`Unsupported COMMERCE_PROVIDER: ${configured}`);
}

function getProvider(): CommerceProvider {
  const providerName = selectedProviderName();

  if (providerName === "local") {
    return localCommerceProvider;
  }

  throw new Error(
    "COMMERCE_PROVIDER=shopify is reserved for the future Shopify provider and is not active yet.",
  );
}

export const commerceService: CommerceProvider = {
  getCollections: () => getProvider().getCollections(),
  getCollectionByHandle: (handle) => getProvider().getCollectionByHandle(handle),
  getProducts: () => getProvider().getProducts(),
  getProductsByCollection: (collectionHandle) =>
    getProvider().getProductsByCollection(collectionHandle),
  getProductByHandle: (handle) => getProvider().getProductByHandle(handle),
};

export const getCollections = commerceService.getCollections;
export const getCollectionByHandle = commerceService.getCollectionByHandle;
export const getProducts = commerceService.getProducts;
export const getProductsByCollection = commerceService.getProductsByCollection;
export const getProductByHandle = commerceService.getProductByHandle;

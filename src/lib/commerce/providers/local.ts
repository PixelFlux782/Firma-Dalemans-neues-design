import "server-only";
import type { CommerceCollection, CommerceProvider } from "@/lib/commerce/types";
import { localCollectionRecords, localProducts } from "@/lib/commerce/providers/local-data";
import { publicCommerceProducts } from "@/lib/commerce/publication";

function availableProducts() {
  return publicCommerceProducts(localProducts);
}

function productsForCollection(handle: string) {
  return availableProducts().filter((product) => product.collectionHandles.includes(handle));
}

function hydrateCollection(
  collection: (typeof localCollectionRecords)[number],
): CommerceCollection {
  return {
    ...collection,
    products: productsForCollection(collection.handle),
  };
}

export const localCommerceProvider: CommerceProvider = {
  async getCollections() {
    return localCollectionRecords.map(hydrateCollection);
  },

  async getCollectionByHandle(handle) {
    const collection = localCollectionRecords.find((entry) => entry.handle === handle);
    return collection ? hydrateCollection(collection) : null;
  },

  async getProducts() {
    return availableProducts();
  },

  async getProductsByCollection(collectionHandle) {
    return productsForCollection(collectionHandle);
  },

  async getProductByHandle(handle) {
    return availableProducts().find((product) => product.handle === handle) ?? null;
  },
};

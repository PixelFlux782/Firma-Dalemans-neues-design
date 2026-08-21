import type {
  CommerceCollection,
  CommerceImage,
  CommerceMoney,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";
import type {
  ShopifyCollection,
  ShopifyImage,
  ShopifyMoneyV2,
  ShopifyProduct,
  ShopifyProductVariant,
} from "@/lib/shopify/types/storefront";

function mapMoney(money: ShopifyMoneyV2): CommerceMoney {
  return {
    amount: money.amount,
    currencyCode: money.currencyCode,
  };
}

function mapImage(image: ShopifyImage | null): CommerceImage | null {
  if (!image) return null;

  return {
    url: image.url,
    altText: image.altText,
    width: image.width,
    height: image.height,
  };
}

function mapProductVariant(
  variant: ShopifyProductVariant,
): CommerceProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    sku: variant.sku,
    selectedOptions: variant.selectedOptions.map((option) => ({ ...option })),
    price: mapMoney(variant.price),
    compareAtPrice: variant.compareAtPrice
      ? mapMoney(variant.compareAtPrice)
      : null,
    image: mapImage(variant.image),
    priceStatus: "fixed",
    priceDataStatus: "verified",
    availability: variant.availableForSale ? "in_stock" : "out_of_stock",
    availabilityNote: null,
    // Reserved for a later metafield/metaobject mapping.
    finderAttributes: null,
  };
}

export function mapShopifyProduct(product: ShopifyProduct): CommerceProduct {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    shortDescription: product.description,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    availableForSale: product.availableForSale,
    featuredImage: mapImage(product.featuredImage),
    images: product.images.nodes
      .map(mapImage)
      .filter((image): image is CommerceImage => image !== null),
    variants: product.variants.nodes.map(mapProductVariant),
    priceRange: {
      min: mapMoney(product.priceRange.minVariantPrice),
      max: mapMoney(product.priceRange.maxVariantPrice),
    },
    priceStatus: "fixed",
    availability: product.availableForSale ? "in_stock" : "out_of_stock",
    availabilityNote: null,
    collectionHandles: [],
    specifications: [],
    compatibility: [],
    suitableFor: [],
    quantity: {
      unit: "piece",
      unitLabel: "Stück",
      minimum: 1,
      step: 1,
      note: null,
    },
    measureGuide: [],
    applicationNotes: [],
    notes: [],
    accessories: [],
    consultationNote: null,
    faq: [],
    seo: { ...product.seo },
    updatedAt: product.updatedAt,
  };
}

export function mapShopifyCollection(
  collection: ShopifyCollection,
): CommerceCollection {
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    shortDescription: collection.description,
    description: collection.description,
    image: mapImage(collection.image),
    products: collection.products.nodes.map(mapShopifyProduct),
    seo: {
      title: collection.title,
      description: collection.description,
    },
  };
}

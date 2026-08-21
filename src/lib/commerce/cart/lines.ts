import type {
  CartInputLine,
  CommerceCartLineSource,
  CommerceFinderCartContext,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";

export function canAddVariantToCart(variant: CommerceProductVariant | null) {
  return Boolean(
    variant
      && variant.availableForSale
      && variant.availability === "in_stock"
      && variant.priceStatus === "fixed"
      && variant.price,
  );
}

export function cartQuantityRules(
  product: CommerceProduct,
  variant: CommerceProductVariant,
) {
  const packSize = variant.finderAttributes?.packSize ?? null;
  return {
    packSize,
    minimumQuantity: Math.max(product.quantity.minimum, packSize ?? 1),
    quantityStep: Math.max(product.quantity.step, packSize ?? 1),
  };
}

export function cartLineFromProduct({
  product,
  variant,
  quantity,
  source = "product",
  finderContext,
}: {
  product: CommerceProduct;
  variant: CommerceProductVariant;
  quantity: number;
  source?: CommerceCartLineSource;
  finderContext?: CommerceFinderCartContext;
}): CartInputLine {
  const rules = cartQuantityRules(product, variant);
  return {
    productId: product.id,
    productHandle: product.handle,
    productTitle: product.title,
    variantId: variant.id,
    variantTitle: variant.title,
    image: variant.image ?? product.featuredImage,
    quantity,
    unitPrice: variant.price,
    priceStatus: variant.priceStatus,
    priceDataStatus: variant.priceDataStatus,
    ...rules,
    unitLabel: product.quantity.unitLabel,
    availability: variant.availability,
    source,
    finderContext,
  };
}

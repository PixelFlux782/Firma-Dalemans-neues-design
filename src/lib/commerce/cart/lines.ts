import type {
  CartInputLine,
  CommerceCartLineSource,
  CommerceFinderCartContext,
  CommerceProduct,
  CommerceProductVariant,
} from "@/lib/commerce/types";
import { configuredChairPriceTiers } from "@/lib/commerce/chair-addons";

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

export function priceForQuantity(
  variant: CommerceProductVariant,
  quantity: number,
) {
  return variant.priceTiers?.find((tier) =>
    (tier.minimumQuantity === null || quantity >= tier.minimumQuantity)
      && (tier.maximumQuantity === null || quantity <= tier.maximumQuantity),
  )?.price ?? variant.price;
}

export function cartLineFromProduct({
  product,
  variant,
  quantity,
  source = "product",
  finderContext,
  selectedAddonSkus = [],
}: {
  product: CommerceProduct;
  variant: CommerceProductVariant;
  quantity: number;
  source?: CommerceCartLineSource;
  finderContext?: CommerceFinderCartContext;
  selectedAddonSkus?: string[];
}): CartInputLine {
  const rules = cartQuantityRules(product, variant);
  const priceTiers = product.stackingChair
    ? configuredChairPriceTiers(variant, selectedAddonSkus)
    : variant.priceTiers;
  const unitPrice = priceTiers?.find((tier) =>
    (tier.minimumQuantity === null || quantity >= tier.minimumQuantity)
      && (tier.maximumQuantity === null || quantity <= tier.maximumQuantity),
  )?.price ?? priceForQuantity(variant, quantity);
  return {
    productId: product.id,
    productHandle: product.handle,
    productTitle: product.title,
    variantId: variant.id,
    variantTitle: variant.title,
    image: variant.image ?? product.featuredImage,
    quantity,
    erpArticleNumber: variant.erpArticleNumber ?? null,
    unitPrice,
    priceTiers,
    priceStatus: variant.priceStatus,
    priceDataStatus: variant.priceDataStatus,
    ...rules,
    unitLabel: product.quantity.unitLabel,
    availability: variant.availability,
    source,
    finderContext,
    ...(selectedAddonSkus.length > 0 ? { selectedAddons: selectedAddonSkus.slice().sort() } : {}),
  };
}

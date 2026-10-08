import type { CommerceMoney, CommerceProduct } from "@/lib/commerce/types";

export interface LowestProductUnitPrice {
  price: CommerceMoney;
  minimumQuantity: number;
  variantId: string;
  priceTierId: string | null;
}

function isValidMoney(money: CommerceMoney | null | undefined): money is CommerceMoney {
  return Boolean(
    money && money.currencyCode.trim() && Number.isFinite(Number(money.amount)) && Number(money.amount) > 0,
  );
}

/** Finds the lowest real unit price and keeps its exact tier quantity attached. */
export function lowestProductUnitPrice(product: CommerceProduct): LowestProductUnitPrice | null {
  const currency = product.priceRange.min?.currencyCode?.trim();
  if (!currency) return null;
  let lowest: LowestProductUnitPrice | null = null;

  for (const variant of product.variants) {
    const purchasableByInquiry = variant.availability === "on_request";
    if ((!variant.availableForSale && !purchasableByInquiry) || variant.availability === "out_of_stock" || variant.priceStatus === "unavailable") continue;
    const candidates = [
      ...(isValidMoney(variant.price) ? [{ price: variant.price, minimumQuantity: product.quantity.minimum, priceTierId: null }] : []),
      ...(variant.priceTiers ?? []).flatMap((tier) =>
        isValidMoney(tier.price) && Number.isInteger(tier.minimumQuantity) && tier.minimumQuantity! >= 1
          ? [{ price: tier.price, minimumQuantity: tier.minimumQuantity!, priceTierId: tier.id }]
          : [],
      ),
    ];
    for (const candidate of candidates) {
      if (candidate.price.currencyCode !== currency) continue;
      if (!lowest || Number(candidate.price.amount) < Number(lowest.price.amount)) lowest = { ...candidate, variantId: variant.id };
    }
  }
  return lowest;
}

export function formatCommerceMoney(money: CommerceMoney) {
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) return null;

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: money.currencyCode,
  }).format(amount);
}

export function multiplyCommerceMoney(
  money: CommerceMoney | null,
  quantity: number,
): CommerceMoney | null {
  if (!money || !Number.isInteger(quantity) || quantity < 1) return null;
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) return null;

  return {
    amount: (amount * quantity).toFixed(2),
    currencyCode: money.currencyCode,
  };
}

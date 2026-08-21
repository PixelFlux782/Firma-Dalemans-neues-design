import type { CommerceMoney } from "@/lib/commerce/types";

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

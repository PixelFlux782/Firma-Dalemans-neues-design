import type { CommerceMoney } from "./types";

export type CustomerPriceMode = "business" | "private";
export const GERMAN_VAT_RATE = 0.19;

export function displayedMoney(money: CommerceMoney, mode: CustomerPriceMode): CommerceMoney {
  if (mode === "business") return money;
  return { ...money, amount: (Number(money.amount) * (1 + GERMAN_VAT_RATE)).toFixed(2) };
}

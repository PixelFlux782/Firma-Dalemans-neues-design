"use client";

import type { CommerceMoney } from "@/lib/commerce/types";
import { usePriceDisplay } from "@/components/commerce/PriceDisplayProvider";

export default function DisplayedMoney({ money }: { money: CommerceMoney }) {
  const { formatPrice } = usePriceDisplay();
  return <>{formatPrice(money)}</>;
}

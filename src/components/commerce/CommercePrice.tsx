"use client";

import type { CommerceMoney, CommercePriceStatus } from "@/lib/commerce/types";
import { usePriceDisplay } from "@/components/commerce/PriceDisplayProvider";

interface CommercePriceProps {
  status: CommercePriceStatus;
  price?: CommerceMoney | null;
  maxPrice?: CommerceMoney | null;
  compareAtPrice?: CommerceMoney | null;
  className?: string;
}

export default function CommercePrice({
  status,
  price,
  compareAtPrice,
  className = "",
}: CommercePriceProps) {
  const { formatPrice, priceLabel } = usePriceDisplay();
  const formattedPrice = price ? formatPrice(price) : null;
  const formattedCompareAt = compareAtPrice ? formatPrice(compareAtPrice) : null;

  let label: string;
  if (status === "on_request") {
    label = "Preis auf Anfrage";
  } else if (status === "unavailable" || !formattedPrice) {
    label = "Nicht verfügbar";
  } else if (status === "from") {
    label = `ab ${formattedPrice}`;
  } else {
    label = formattedPrice;
  }

  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}
      data-price-status={status}
    >
      <span className="font-display text-xl font-medium tracking-[-0.02em] text-premium-ink">
        {label}
      </span>
      {formattedCompareAt && formattedPrice ? (
        <span className="text-sm text-premium-muted line-through">
          {formattedCompareAt}
        </span>
      ) : null}
      {formattedPrice ? <span className="basis-full text-xs font-normal text-premium-muted">{priceLabel}</span> : null}
    </div>
  );
}

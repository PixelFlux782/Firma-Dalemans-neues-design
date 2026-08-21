import type { CommerceMoney, CommercePriceStatus } from "@/lib/commerce/types";
import { formatCommerceMoney } from "@/lib/commerce/money";

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
  const formattedPrice = price ? formatCommerceMoney(price) : null;
  const formattedCompareAt = compareAtPrice ? formatCommerceMoney(compareAtPrice) : null;

  let label: string;
  if (status === "on_request") {
    label = "Preis auf Anfrage";
  } else if (status === "unavailable" || !formattedPrice) {
    label = "Preis folgt";
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
    </div>
  );
}

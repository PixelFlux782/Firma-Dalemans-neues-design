"use client";

import { useCart } from "@/components/commerce/cart/CartProvider";

export default function CartTrigger({
  compact = false,
  onOpen,
}: {
  compact?: boolean;
  onOpen?: () => void;
}) {
  const { cart, hydrated, openCart } = useCart();
  const count = hydrated ? cart.totalQuantity : 0;

  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.();
        openCart();
      }}
      aria-label={`Warenkorb öffnen, ${count} ${count === 1 ? "Artikel" : "Artikel"}`}
      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-premium-beige bg-white/45 px-3 py-2 text-xs font-semibold tabular-nums text-premium-ink transition hover:border-premium-leaf hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2"
      data-testid="cart-trigger"
    >
      <span>{compact ? "Korb" : "Warenkorb"}</span>
      <span aria-hidden className="mx-1.5 text-premium-subtle">·</span>
      <span className="inline-block min-w-[4ch] text-center" aria-hidden>{count}</span>
    </button>
  );
}

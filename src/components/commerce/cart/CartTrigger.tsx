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
      className={`relative inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg text-xs font-medium tabular-nums text-premium-ink transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2 ${compact ? "min-w-11 px-2" : "gap-2 px-2.5"}`}
      data-testid="cart-trigger"
    >
      <svg viewBox="0 0 24 24" className="size-[1.05rem] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8.5h14l-1 11H6l-1-11Z" />
        <path strokeLinecap="round" d="M9 9V6.8a3 3 0 0 1 6 0V9" />
      </svg>
      {compact ? (
        <span className="absolute right-0.5 top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-premium-forest px-1 text-[0.58rem] font-semibold leading-none text-white" aria-hidden>{count}</span>
      ) : (
        <>
          <span>Warenkorb</span>
          <span aria-hidden className="text-premium-subtle">·</span>
          <span className="inline-block min-w-[2ch] text-center" aria-hidden>{count}</span>
        </>
      )}
    </button>
  );
}

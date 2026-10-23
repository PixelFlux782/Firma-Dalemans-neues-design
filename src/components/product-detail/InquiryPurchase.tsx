"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/commerce/cart/CartProvider";
import { isInquiryMode } from "@/lib/commerce/config";

export default function InquiryPurchase({ name, handle }: { name: string; handle: string }) {
  const [quantity, setQuantity] = useState(1);
  const { addLines, pending } = useCart();
  const href = `/kontakt?${new URLSearchParams({
    anliegen: "Produktberatung",
    produkt: name,
    menge: String(quantity),
    nachricht: `Produkt: ${name}\nMenge: ${quantity}`,
  }).toString()}#anfrage`;

  return <div className="rounded-[2rem] border border-premium-beige/80 bg-white/65 p-6 shadow-premium sm:p-8">
    <p className="text-sm leading-7 text-premium-muted">Preis und Ausführung stimmen wir persönlich mit Ihnen ab.</p>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-premium-beige/70 pt-6">
      <label htmlFor="inquiry-quantity" className="text-sm font-semibold text-premium-ink">Menge</label>
      <div className="inline-grid grid-cols-[2.75rem_4.5rem_2.75rem] overflow-hidden rounded-full border border-premium-beige bg-white">
        <button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} disabled={quantity <= 1} className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35" aria-label="Menge verringern">−</button>
        <input id="inquiry-quantity" type="number" inputMode="numeric" min={1} max={100000} value={quantity} onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value > 0) setQuantity(Math.min(value, 100000)); }} className="min-h-11 w-full border-x border-premium-beige bg-transparent text-center text-sm font-semibold tabular-nums outline-none" />
        <button type="button" onClick={() => setQuantity(value => Math.min(100000, value + 1))} disabled={quantity >= 100000} className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35" aria-label="Menge erhöhen">+</button>
      </div>
    </div>
    <button type="button" disabled={pending} onClick={() => addLines([{
      productId: `legacy-product-${handle}`,
      productHandle: handle,
      productTitle: name,
      variantId: `legacy-variant-${handle}`,
      variantTitle: "Ausführung nach Beratung",
      erpArticleNumber: null,
      image: null,
      quantity,
      unitPrice: null,
      priceStatus: "on_request",
      priceDataStatus: null,
      packSize: null,
      unitLabel: "Stück",
      minimumQuantity: 1,
      quantityStep: 1,
      availability: "on_request",
      source: "product",
    }])} className="btn-primary mt-6 w-full text-center disabled:cursor-wait disabled:opacity-60">
      {pending ? "Wird hinzugefügt …" : isInquiryMode ? "Zur Auswahl hinzufügen" : "In den Warenkorb"}
    </button>
    {isInquiryMode ? <p className="mt-3 text-center text-xs leading-5 text-premium-muted">Unverbindlich zusammenstellen · Angebot im Warenkorb anfragen</p> : null}
    <Link href={href} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:underline">Fragen zu diesem Modell? Persönlich beraten lassen →</Link>
  </div>;
}

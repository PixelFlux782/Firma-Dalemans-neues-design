"use client";

import Link from "next/link";
import { useState } from "react";

export default function InquiryPurchase({ name }: { name: string }) {
  const [quantity, setQuantity] = useState(1);
  const href = (concern: string) => `/kontakt?anliegen=${encodeURIComponent(concern)}&produkt=${encodeURIComponent(name)}&menge=${quantity}#anfrage`;
  return <div className="rounded-[2rem] border border-premium-beige/80 bg-white/65 p-6 shadow-premium sm:p-8">
    <p className="text-sm leading-7 text-premium-muted">Preis und konkrete Ausführung werden für dieses Produkt persönlich abgestimmt.</p>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-premium-beige/70 pt-6"><label htmlFor="inquiry-quantity" className="text-sm font-semibold text-premium-ink">Menge</label><div className="inline-grid grid-cols-[2.75rem_4.5rem_2.75rem] overflow-hidden rounded-full border border-premium-beige bg-white"><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} disabled={quantity <= 1} className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35" aria-label="Menge verringern">−</button><input id="inquiry-quantity" type="number" inputMode="numeric" min={1} max={100000} value={quantity} onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value > 0) setQuantity(Math.min(value, 100000)); }} className="min-h-11 w-full border-x border-premium-beige bg-transparent text-center text-sm font-semibold tabular-nums outline-none" /><button type="button" onClick={() => setQuantity(value => Math.min(100000, value + 1))} disabled={quantity >= 100000} className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35" aria-label="Menge erhöhen">+</button></div></div>
    <Link href={href("Angebot")} className="btn-primary mt-6 block text-center">Angebot anfragen</Link>
    <Link href={href("Produktberatung")} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest hover:underline">Persönlich beraten lassen →</Link>
  </div>;
}

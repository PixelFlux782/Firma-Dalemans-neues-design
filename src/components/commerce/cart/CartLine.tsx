"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/commerce/cart/CartProvider";
import { formatCommerceMoney } from "@/lib/commerce/money";
import type { CommerceCartLine as CommerceCartLineModel } from "@/lib/commerce/types";

export default function CartLine({ line }: { line: CommerceCartLineModel }) {
  const { pending, updateLine, removeLine, closeCart } = useCart();
  const unitPrice = line.unitPrice ? formatCommerceMoney(line.unitPrice) : null;
  const lineTotal = line.lineTotal ? formatCommerceMoney(line.lineTotal) : null;
  const packCount = line.packSize ? line.quantity / line.packSize : null;

  return (
    <article className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 border-b border-premium-beige/80 py-6" data-testid="cart-line">
      <Link
        href={`/shop/produkt/${line.productHandle}?variant=${encodeURIComponent(line.variantId)}`}
        onClick={closeCart}
        className="relative h-20 overflow-hidden rounded-2xl bg-premium-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
      >
        {line.image ? (
          <Image
            src={line.image.url}
            alt={line.image.altText ?? line.productTitle}
            fill
            sizes="80px"
            className="object-contain p-2"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-premium-subtle">DLMNS</span>
        )}
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/shop/produkt/${line.productHandle}?variant=${encodeURIComponent(line.variantId)}`}
              onClick={closeCart}
              className="font-semibold leading-5 text-premium-ink hover:text-premium-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
            >
              {line.productTitle}
            </Link>
            <p className="mt-1 text-xs leading-5 text-premium-muted">{line.variantTitle}</p>
          </div>
          <button
            type="button"
            onClick={() => removeLine(line.id)}
            disabled={pending}
            className="min-h-11 shrink-0 px-1 text-xs font-medium text-premium-muted underline decoration-premium-beige underline-offset-4 hover:text-premium-ink disabled:opacity-50"
            aria-label={`${line.productTitle} entfernen`}
          >
            Entfernen
          </button>
        </div>

        {line.finderContext ? (
          <p className="mt-3 rounded-xl bg-premium-warm/80 px-3 py-2 text-xs leading-5 text-premium-muted">
            Bedarf {line.finderContext.requiredQuantity}, mit Reserve {line.finderContext.recommendedQuantity}, bestellbar {line.finderContext.orderQuantity} Stück.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <label htmlFor={`cart-quantity-${line.id}`} className="sr-only">
              Menge für {line.productTitle}
            </label>
            <div className="inline-grid grid-cols-[2.75rem_4.25rem_2.75rem] overflow-hidden rounded-full border border-premium-beige bg-white">
              <button
                type="button"
                onClick={() => updateLine(line.id, line.quantity - line.quantityStep)}
                disabled={pending || line.quantity <= line.minimumQuantity}
                className="min-h-11 text-lg text-premium-ink transition hover:bg-premium-warm disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Menge von ${line.productTitle} verringern`}
              >
                −
              </button>
              <input
                id={`cart-quantity-${line.id}`}
                type="number"
                inputMode="numeric"
                min={line.minimumQuantity}
                max={100000}
                step={line.quantityStep}
                value={line.quantity}
                onChange={(event) => {
                  const quantity = Number(event.target.value);
                  if (Number.isInteger(quantity) && quantity > 0) void updateLine(line.id, quantity);
                }}
                className="min-h-11 w-full border-x border-premium-beige bg-transparent text-center text-sm font-semibold tabular-nums text-premium-ink outline-none focus:bg-premium-warm/60"
              />
              <button
                type="button"
                onClick={() => updateLine(line.id, line.quantity + line.quantityStep)}
                disabled={pending || line.quantity + line.quantityStep > 100000}
                className="min-h-11 text-lg text-premium-ink transition hover:bg-premium-warm disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Menge von ${line.productTitle} erhöhen`}
              >
                +
              </button>
            </div>
            <p className="mt-1.5 text-[.68rem] text-premium-subtle">
              {packCount !== null ? `${packCount} × ${line.packSize} Stück` : line.unitLabel}
            </p>
          </div>

          <div className="text-right text-sm">
            {unitPrice ? <p className="text-xs text-premium-muted">{unitPrice} je {line.unitLabel.toLowerCase()}</p> : null}
            <p className="mt-1 font-semibold tabular-nums text-premium-ink">
              {lineTotal ?? "Preis auf Anfrage"}
            </p>
          </div>
        </div>

        {line.priceDataStatus === "development" ? (
          <p className="mt-3 text-[.68rem] font-semibold uppercase tracking-[0.12em] text-premium-bronze">
            Development-Preis · unverbindlich
          </p>
        ) : null}
      </div>
    </article>
  );
}

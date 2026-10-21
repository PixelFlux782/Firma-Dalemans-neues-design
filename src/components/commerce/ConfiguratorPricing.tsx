"use client";

import type { CommerceMoney, CommercePriceStatus, CommercePriceTier } from "@/lib/commerce/types";
import { usePriceDisplay } from "@/components/commerce/PriceDisplayProvider";

const MAX_QUANTITY = 100000;

export function normalizeConfiguratorQuantity(
  value: number,
  minimum = 1,
  step = 1,
) {
  const safeMinimum = Math.max(1, Math.round(minimum));
  const safeStep = Math.max(1, Math.round(step));
  const maximum = safeMinimum + Math.floor((MAX_QUANTITY - safeMinimum) / safeStep) * safeStep;
  if (!Number.isFinite(value)) return safeMinimum;
  const requested = Math.min(maximum, Math.max(safeMinimum, Math.round(value)));
  return Math.min(
    maximum,
    safeMinimum + Math.ceil((requested - safeMinimum) / safeStep) * safeStep,
  );
}

export function CurrentUnitPrice({
  status,
  price,
  compareAtPrice,
  testId,
}: {
  status: CommercePriceStatus;
  price: CommerceMoney | null;
  compareAtPrice?: CommerceMoney | null;
  testId?: string;
}) {
  const { formatPrice, priceLabel } = usePriceDisplay();
  const formatted = price ? formatPrice(price) : null;
  const compareAt = compareAtPrice ? formatPrice(compareAtPrice) : null;
  const showNumericPrice = status !== "on_request" && status !== "unavailable" && Boolean(formatted);

  return (
    <div
      className="text-right"
      aria-live="polite"
      data-testid={testId}
      data-price-status={status}
    >
      <p className="text-xs uppercase tracking-[.14em] text-premium-subtle">Aktueller Stückpreis</p>
      <div className="mt-1 flex flex-wrap items-baseline justify-end gap-x-2">
        <p className="text-2xl font-semibold tabular-nums text-premium-forest">
          {status === "on_request" ? "Auf Anfrage" : showNumericPrice ? formatted : "Nicht verfügbar"}
        </p>
        {compareAt && showNumericPrice ? <span className="text-sm text-premium-muted line-through">{compareAt}</span> : null}
      </div>
      {showNumericPrice ? <p className="mt-1 text-xs text-premium-muted">{priceLabel}</p> : null}
    </div>
  );
}

export function PriceTierCards({
  tiers,
  quantity,
  unitLabel = "Stück",
  titleId = "price-tiers-title",
  className = "mt-5",
}: {
  tiers: CommercePriceTier[];
  quantity: number;
  unitLabel?: string;
  titleId?: string;
  className?: string;
}) {
  const { formatPrice, priceLabel } = usePriceDisplay();
  if (!tiers.length) return null;

  return (
    <section className={className} aria-labelledby={titleId} data-testid="price-tiers">
      <div className="flex items-end justify-between gap-3">
        <h2 id={titleId} className="text-sm font-semibold text-premium-ink">Mengenstaffeln</h2>
        <span className="text-xs text-premium-muted">{priceLabel}</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {tiers.map((tier) => {
          const active = quantity >= (tier.minimumQuantity ?? 0)
            && (tier.maximumQuantity === null || quantity <= tier.maximumQuantity);
          return (
            <div
              key={tier.id}
              data-active={active ? "true" : "false"}
              className={`rounded-xl border px-3 py-3 text-sm ${active ? "border-premium-forest bg-premium-forest text-white" : "border-premium-beige bg-white/60 text-premium-muted"}`}
            >
              <p className="font-semibold">{tier.label}</p>
              <p className={`mt-1 tabular-nums ${active ? "text-white" : "text-premium-ink"}`}>
                {formatPrice(tier.price)} / {unitLabel}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ConfiguratorPriceSummary({
  basePrice,
  configuredPrice,
  totalPrice,
  quantity,
  adjustments = [],
  simple = false,
  unitLabel = "Stück",
  testId = "price-breakdown",
  totalTestId = "total-price",
}: {
  basePrice: CommerceMoney;
  configuredPrice: CommerceMoney;
  totalPrice: CommerceMoney;
  quantity: number;
  adjustments?: Array<{ id: string; label: string; price: CommerceMoney | null }>;
  simple?: boolean;
  unitLabel?: string;
  testId?: string;
  totalTestId?: string;
}) {
  const { formatPrice, priceLabel } = usePriceDisplay();
  return (
    <div className="mt-7 rounded-2xl border border-premium-beige/80 bg-white/55 p-5" data-testid={testId}>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-premium-muted">{simple ? "Stückpreis" : "Basispreis"}</span>
        <span className="font-semibold tabular-nums text-premium-ink">{formatPrice(basePrice)} / {unitLabel}</span>
      </div>
      {!simple ? adjustments.map((adjustment) => (
        <div key={adjustment.id} className="mt-2 flex items-center justify-between gap-4 text-sm">
          <span className="text-premium-muted">+ {adjustment.label}</span>
          <span className="font-semibold tabular-nums text-premium-ink">
            {adjustment.price ? formatPrice(adjustment.price) : "Preis auf Anfrage"}
          </span>
        </div>
      )) : null}
      {!simple ? (
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-premium-beige/80 pt-4">
          <span className="font-semibold text-premium-ink">Konfigurierter Stückpreis</span>
          <span className="font-semibold tabular-nums text-premium-forest">{formatPrice(configuredPrice)} / {unitLabel}</span>
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-4 text-sm">
        <span className="text-premium-muted">Menge</span>
        <span className="font-semibold tabular-nums text-premium-ink">{quantity} {unitLabel}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 border-t border-premium-beige/80 pt-3" data-testid={totalTestId}>
        <span className="font-semibold text-premium-ink">Gesamtpreis</span>
        <span className="font-semibold tabular-nums text-premium-forest">{formatPrice(totalPrice)}</span>
      </div>
      <p className="mt-2 text-right text-xs text-premium-muted">{priceLabel}</p>
    </div>
  );
}

export function QuantityControl({
  id,
  quantity,
  onChange,
  minimum = 1,
  step = 1,
  label = "Menge",
  inputLabel = "Menge",
}: {
  id: string;
  quantity: number;
  onChange: (quantity: number) => void;
  minimum?: number;
  step?: number;
  label?: string;
  inputLabel?: string;
}) {
  const setQuantity = (value: number) => onChange(normalizeConfiguratorQuantity(value, minimum, step));
  const maximum = Math.max(minimum, minimum + Math.floor((MAX_QUANTITY - minimum) / step) * step);
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[.14em] text-premium-subtle">{label}</label>
      <div className="mt-2 inline-grid grid-cols-[2.75rem_5rem_2.75rem] overflow-hidden rounded-full border border-premium-beige bg-white">
        <button
          type="button"
          onClick={() => setQuantity(quantity - step)}
          disabled={quantity <= minimum}
          className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35"
          aria-label="Menge verringern"
        >−</button>
        <input
          id={id}
          aria-label={inputLabel}
          type="number"
          inputMode="numeric"
          min={minimum}
          max={maximum}
          step={step}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="min-h-11 w-full border-x border-premium-beige bg-transparent text-center text-base font-semibold tabular-nums outline-none focus:bg-premium-warm/60"
        />
        <button
          type="button"
          onClick={() => setQuantity(quantity + step)}
          disabled={quantity + step > maximum}
          className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35"
          aria-label="Menge erhöhen"
        >+</button>
      </div>
      {minimum > 1 || step > 1 ? (
        <p className="mt-2 text-xs text-premium-muted">Mindestmenge {minimum} · Schrittweite {step}</p>
      ) : null}
    </div>
  );
}

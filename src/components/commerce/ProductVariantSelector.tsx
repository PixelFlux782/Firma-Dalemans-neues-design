"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CommerceAvailability from "@/components/commerce/CommerceAvailability";
import CommercePrice from "@/components/commerce/CommercePrice";
import { useCart } from "@/components/commerce/cart/CartProvider";
import {
  canAddVariantToCart,
  cartLineFromProduct,
  cartQuantityRules,
} from "@/lib/commerce/cart/lines";
import type { CommerceProduct, CommerceProductVariant } from "@/lib/commerce/types";

function selectionFromVariant(variant: CommerceProductVariant) {
  return Object.fromEntries(variant.selectedOptions.map((option) => [option.name, option.value]));
}

function matchesSelection(variant: CommerceProductVariant, selection: Record<string, string>) {
  return variant.selectedOptions.every((option) => selection[option.name] === option.value);
}

export default function ProductVariantSelector({
  product,
  initialVariantId,
}: {
  product: CommerceProduct;
  initialVariantId?: string;
}) {
  const { addLines, pending } = useCart();
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    product.variants[0]
      ? selectionFromVariant(
          product.variants.find((variant) => variant.id === initialVariantId) ?? product.variants[0],
        )
      : {},
  );

  const optionGroups = useMemo(() => {
    const groups = new Map<string, string[]>();

    for (const variant of product.variants) {
      for (const option of variant.selectedOptions) {
        const values = groups.get(option.name) ?? [];
        if (!values.includes(option.value)) values.push(option.value);
        groups.set(option.name, values);
      }
    }

    return [...groups.entries()].map(([name, values]) => ({ name, values }));
  }, [product.variants]);

  const selectedVariant =
    product.variants.find((variant) => matchesSelection(variant, selection)) ?? product.variants[0] ?? null;
  const selectedRules = selectedVariant ? cartQuantityRules(product, selectedVariant) : null;
  const selectedMinimumQuantity = selectedRules?.minimumQuantity;
  const [quantity, setQuantity] = useState(product.quantity.minimum);

  useEffect(() => {
    if (selectedMinimumQuantity) setQuantity(selectedMinimumQuantity);
  }, [selectedMinimumQuantity, selectedVariant?.id]);

  function selectOption(name: string, value: string) {
    const nextSelection = { ...selection, [name]: value };
    const exactMatch = product.variants.find((variant) => matchesSelection(variant, nextSelection));
    const compatibleFallback = product.variants.find((variant) =>
      variant.selectedOptions.some((option) => option.name === name && option.value === value),
    );
    const nextVariant = exactMatch ?? compatibleFallback;

    setSelection(nextVariant ? selectionFromVariant(nextVariant) : nextSelection);
  }

  const priceStatus = selectedVariant?.priceStatus ?? product.priceStatus;
  const price = selectedVariant?.price ?? product.priceRange.min;
  const availability = selectedVariant?.availability ?? product.availability;
  const availabilityNote = selectedVariant?.availabilityNote ?? product.availabilityNote;
  const cartable = canAddVariantToCart(selectedVariant);
  const contactParameters = new URLSearchParams({
    anliegen: "Shop-Produktberatung",
    produkt: product.title,
    ...(selectedVariant ? { variante: selectedVariant.title } : {}),
  });

  return (
    <div className="rounded-[2rem] border border-premium-beige/80 bg-white/65 p-6 shadow-premium sm:p-8">
      <CommercePrice
        status={priceStatus}
        price={price}
        compareAtPrice={selectedVariant?.compareAtPrice}
      />

      {optionGroups.length ? (
        <div className="mt-7 space-y-6" data-testid="variant-selector">
          {optionGroups.map((group) => (
            <fieldset key={group.name}>
              <legend className="text-sm font-semibold text-premium-ink">{group.name}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const active = selection[group.name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectOption(group.name, value)}
                      className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2 ${
                        active
                          ? "border-premium-forest bg-premium-forest text-white"
                          : "border-premium-beige bg-premium-canvas/70 text-premium-charcoal hover:border-premium-leaf hover:bg-white"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}

      {selectedVariant ? (
        <div className="mt-6">
          <p className="text-sm leading-6 text-premium-muted" aria-live="polite" data-testid="selected-variant">
            Gewählt: <span className="font-medium text-premium-charcoal">{selectedVariant.title}</span>
          </p>
          {process.env.NODE_ENV === "development" && selectedVariant.finderAttributes?.dataStatus === "development" ? (
            <p className="mt-2 inline-flex rounded-full bg-premium-sand/25 px-3 py-1 text-xs font-semibold text-premium-ink">
              Development-Daten
            </p>
          ) : null}
        </div>
      ) : null}

      <CommerceAvailability
        status={availability}
        note={availabilityNote}
        className="mt-6 border-t border-premium-beige/70 pt-6"
      />

      <div className="mt-6 rounded-2xl bg-premium-warm/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-premium-bronze">Mengeneinheit</p>
        <p className="mt-2 text-sm leading-6 text-premium-charcoal">
          {product.quantity.unitLabel}
          {product.quantity.minimum > 1 ? ` · Mindestmenge ${product.quantity.minimum}` : ""}
        </p>
        {product.quantity.note ? (
          <p className="mt-1 text-sm leading-6 text-premium-muted">{product.quantity.note}</p>
        ) : null}
      </div>

      {cartable && selectedVariant && selectedRules ? (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-premium-beige/70 pt-6">
            <div>
              <p className="text-sm font-semibold text-premium-ink">Bestellmenge</p>
              <p className="mt-1 text-xs text-premium-muted">
                Schrittweite {selectedRules.quantityStep} {product.quantity.unitLabel}
              </p>
            </div>
            <div className="inline-grid grid-cols-[2.75rem_4.5rem_2.75rem] overflow-hidden rounded-full border border-premium-beige bg-white">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(selectedRules.minimumQuantity, value - selectedRules.quantityStep))}
                disabled={quantity <= selectedRules.minimumQuantity}
                className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35"
                aria-label="Menge verringern"
              >
                −
              </button>
              <input
                aria-label="Bestellmenge"
                type="number"
                inputMode="numeric"
                min={selectedRules.minimumQuantity}
                max={100000}
                step={selectedRules.quantityStep}
                value={quantity}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isInteger(next) && next > 0) {
                    const steps = Math.ceil((Math.max(next, selectedRules.minimumQuantity) - selectedRules.minimumQuantity) / selectedRules.quantityStep);
                    setQuantity(selectedRules.minimumQuantity + Math.max(0, steps) * selectedRules.quantityStep);
                  }
                }}
                className="min-h-11 w-full border-x border-premium-beige bg-transparent text-center text-sm font-semibold tabular-nums outline-none focus:bg-premium-warm/60"
              />
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(100000, value + selectedRules.quantityStep))}
                disabled={quantity + selectedRules.quantityStep > 100000}
                className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35"
                aria-label="Menge erhöhen"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => addLines([cartLineFromProduct({ product, variant: selectedVariant, quantity })])}
            className="btn-primary mt-7 w-full text-center disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Wird hinzugefügt …" : "In den Warenkorb"}
          </button>
          {selectedVariant.priceDataStatus === "development" ? (
            <p className="mt-3 text-center text-xs leading-5 text-premium-bronze">
              Unverbindlicher Development-Preis für den technischen Warenkorb-Test.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <Link
            href={`/kontakt?${contactParameters.toString()}`}
            className="btn-primary mt-7 w-full text-center"
          >
            Ausführung persönlich klären
          </Link>
          <p className="mt-3 text-center text-xs leading-5 text-premium-muted">
            Diese Ausführung ist nicht klassisch bestellbar und wird deshalb nicht als Warenkorbposition geführt.
          </p>
        </>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CommerceAvailability from "@/components/commerce/CommerceAvailability";
import {
  ConfiguratorPriceSummary,
  CurrentUnitPrice,
  PriceTierCards,
  QuantityControl,
} from "@/components/commerce/ConfiguratorPricing";
import { lowestProductUnitPrice, multiplyCommerceMoney } from "@/lib/commerce/money";
import { usePriceDisplay } from "@/components/commerce/PriceDisplayProvider";
import { useCart } from "@/components/commerce/cart/CartProvider";
import {
  canAddVariantToCart,
  cartLineFromProduct,
  cartQuantityRules,
  priceForQuantity,
} from "@/lib/commerce/cart/lines";
import type { CommerceProduct, CommerceProductVariant } from "@/lib/commerce/types";
import KnowledgeInfoTrigger from "@/components/knowledge/KnowledgeInfoTrigger";
import { getKnowledgeOptionIdForProductOption } from "@/lib/knowledge/product-options";

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
  const { formatPrice } = usePriceDisplay();
  const isTableConfigurator = [
    "klapptisch-310c",
    "seminarklapptisch-210c",
    "trapez-klapptisch-310c",
  ].includes(product.handle);
  const productUnavailable = product.priceStatus === "unavailable" || product.availability === "out_of_stock";
  const selectableVariants = useMemo(
    () => productUnavailable
      ? []
      : product.variants.filter((variant) =>
          variant.priceStatus !== "unavailable" && variant.availability !== "out_of_stock",
        ),
    [product.variants, productUnavailable],
  );
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    selectableVariants[0]
      ? selectionFromVariant(
          selectableVariants.find((variant) => variant.id === initialVariantId) ?? selectableVariants[0],
        )
      : {},
  );

  const optionGroups = useMemo(() => {
    const groups = new Map<string, string[]>();

    for (const variant of selectableVariants) {
      for (const option of variant.selectedOptions) {
        const values = groups.get(option.name) ?? [];
        if (!values.includes(option.value)) values.push(option.value);
        groups.set(option.name, values);
      }
    }

    return [...groups.entries()]
      .filter(([, values]) => !isTableConfigurator || values.length > 1)
      .map(([name, values]) => ({ name, values }));
  }, [isTableConfigurator, selectableVariants]);

  const selectedVariant =
    selectableVariants.find((variant) => matchesSelection(variant, selection)) ?? selectableVariants[0] ?? null;
  const selectedRules = selectedVariant ? cartQuantityRules(product, selectedVariant) : null;
  const lowestPrice = useMemo(() => lowestProductUnitPrice(product), [product]);
  const selectedMinimumQuantity = selectedRules?.minimumQuantity;
  const [quantity, setQuantity] = useState(product.quantity.minimum);
  const [requestedAccessories, setRequestedAccessories] = useState<string[]>([]);

  useEffect(() => {
    if (selectedMinimumQuantity) setQuantity(selectedMinimumQuantity);
  }, [selectedMinimumQuantity, selectedVariant?.id]);

  function selectOption(name: string, value: string) {
    const nextSelection = { ...selection, [name]: value };
    const exactMatch = selectableVariants.find((variant) => matchesSelection(variant, nextSelection));
    const compatibleFallback = selectableVariants.find((variant) =>
      variant.selectedOptions.some((option) => option.name === name && option.value === value),
    );
    const nextVariant = exactMatch ?? compatibleFallback;

    setSelection(nextVariant ? selectionFromVariant(nextVariant) : nextSelection);
  }

  const priceStatus = selectedVariant?.priceStatus ?? product.priceStatus;
  const price = selectedVariant ? priceForQuantity(selectedVariant, quantity) : product.priceRange.min;
  const pricedVariants = selectableVariants.flatMap((variant) => {
    if (variant.priceStatus !== "fixed") return [];
    const variantPrice = priceForQuantity(variant, quantity);
    return variantPrice ? [{ variant, price: variantPrice }] : [];
  });
  const basePriceEntry = pricedVariants.reduce<(typeof pricedVariants)[number] | null>(
    (lowest, entry) => !lowest || Number(entry.price.amount) < Number(lowest.price.amount) ? entry : lowest,
    null,
  );
  const basePrice = basePriceEntry?.price ?? price;
  const totalPrice = multiplyCommerceMoney(price ?? null, quantity);
  const configurationSurcharge = price && basePrice && price.currencyCode === basePrice.currencyCode
    ? {
        amount: Math.max(0, Number(price.amount) - Number(basePrice.amount)).toFixed(2),
        currencyCode: price.currencyCode,
      }
    : null;
  const availability = selectedVariant?.availability ?? product.availability;
  const availabilityNote = selectedVariant?.availabilityNote ?? product.availabilityNote;
  const cartable = canAddVariantToCart(selectedVariant);
  const selectedAdvisory = product.variantAdvisories?.find((item) => item.variantId === selectedVariant?.id);
  const compatibleAccessories = product.optionalAccessories?.filter((item) =>
    selectedVariant ? item.compatibleVariantIds.includes(selectedVariant.id) : false,
  ) ?? [];
  const selectedAccessoryTitles = compatibleAccessories
    .filter((item) => requestedAccessories.includes(item.title))
    .map((item) => item.title);
  const inquiryMessage = selectedVariant
    ? [
        `Produkt: ${product.title}`,
        `Wagenvariante: ${selectedVariant.title}`,
        ...(selectedVariant.erpArticleNumber ? [`Artikelnummer: ${selectedVariant.erpArticleNumber}`] : []),
        ...(selectedAccessoryTitles.length ? [`Zubehörwunsch: ${selectedAccessoryTitles.join(", ")} (auf Anfrage)`] : []),
      ].join("\n")
    : "";
  const contactParameters = new URLSearchParams({
    anliegen: "Shop-Produktberatung",
    produkt: product.title,
    menge: String(quantity),
    ...(selectedVariant ? { variante: selectedVariant.title } : {}),
    ...(selectedVariant?.erpArticleNumber ? { artikelnummer: selectedVariant.erpArticleNumber } : {}),
    ...(selectedVariant ? { nachricht: `${inquiryMessage}\nMenge: ${quantity}` } : {}),
  });

  return (
    <div className="rounded-[2rem] border border-premium-beige/80 bg-white/65 p-6 shadow-premium sm:p-8">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="section-eyebrow">Ihre Ausführung</p>
          <p className="mt-2 text-sm leading-6 text-premium-muted">
            {optionGroups.length ? "Optionen auswählen und Preis direkt vergleichen." : "Stückzahl wählen und Gesamtpreis prüfen."}
          </p>
        </div>
        <CurrentUnitPrice
          status={priceStatus}
          price={price ?? null}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
      </div>
      {lowestPrice?.priceTierId && lowestPrice.minimumQuantity > 1 ? (
        <div className="mt-3 text-right" data-testid="lowest-tier-price">
          <p className="text-sm font-semibold tabular-nums text-premium-forest">ab {formatPrice(lowestPrice.price)} / Stück</p>
          <p className="mt-1 text-xs leading-5 text-premium-muted">Bei Abnahme von mindestens {lowestPrice.minimumQuantity} Stück</p>
        </div>
      ) : null}

      {isTableConfigurator && optionGroups.length ? (
        <div className="mt-6 border-t border-premium-beige/70 pt-6">
          <p className="font-display text-2xl font-medium text-premium-ink">Tisch konfigurieren</p>
          <p className="mt-2 text-sm leading-6 text-premium-muted">
            Wählen Sie die passende Größe{optionGroups.length > 1 ? " und anschließend die gewünschte Kante" : ""}.
          </p>
        </div>
      ) : null}

      {optionGroups.length ? (
        <div className={`${isTableConfigurator ? "mt-6 space-y-7" : "mt-7 space-y-6"}`} data-testid="variant-selector">
          {optionGroups.map((group) => (
            <fieldset key={group.name}>
              <legend className="text-sm font-semibold text-premium-ink">
                {isTableConfigurator && group.name === "Tischmaß"
                  ? "Größe"
                  : isTableConfigurator && group.name === "Kantenart"
                    ? "Kante"
                    : group.name}
              </legend>
              <div className={isTableConfigurator && group.name === "Tischmaß"
                ? "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
                : "mt-3 flex flex-wrap gap-2"}>
                {group.values.map((value) => {
                  const active = selection[group.name] === value;
                  const optionSelection = { ...selection, [group.name]: value };
                  const optionVariant = selectableVariants.find((variant) => matchesSelection(variant, optionSelection))
                    ?? selectableVariants.find((variant) => variant.selectedOptions.some((option) => option.name === group.name && option.value === value));
                  const optionPrice = optionVariant?.priceStatus === "fixed" ? priceForQuantity(optionVariant, quantity) : null;
                  const optionSurcharge = optionPrice && basePrice && optionPrice.currencyCode === basePrice.currencyCode
                    ? Math.max(0, Number(optionPrice.amount) - Number(basePrice.amount))
                    : null;
                  return (
                    <div key={value} className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectOption(group.name, value)}
                        className={`${isTableConfigurator ? "min-h-12" : "min-h-11"} rounded-2xl border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2 ${
                          active
                            ? "border-premium-forest bg-premium-forest text-white"
                            : "border-premium-beige bg-premium-canvas/70 text-premium-charcoal hover:border-premium-leaf hover:bg-white"
                        }`}
                      >
                        <span className="block">{value}</span>
                        {optionSurcharge !== null ? (
                          <span className={`mt-1 block text-xs ${active ? "text-white/75" : "text-premium-muted"}`}>
                            {optionSurcharge > 0
                              ? `+ ${formatPrice({ amount: optionSurcharge.toFixed(2), currencyCode: basePrice!.currencyCode })} / ${product.quantity.unitLabel}`
                              : "ohne Aufpreis"}
                          </span>
                        ) : null}
                      </button>
                      {isTableConfigurator && group.name === "Kantenart" ? (
                        <KnowledgeInfoTrigger
                          optionId={getKnowledgeOptionIdForProductOption(group.name, value)}
                          label={`Tischkante ${value}`}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}

      {selectedVariant ? (
        <div className={`${isTableConfigurator ? "mt-7 rounded-2xl bg-premium-warm/65 px-5 py-4" : "mt-6"}`}>
          <p className="text-sm leading-6 text-premium-muted" aria-live="polite" data-testid="selected-variant">
            {isTableConfigurator ? "Ihre Auswahl: " : "Gewählt: "}<span className="font-medium text-premium-charcoal">{selectedVariant.title}</span>
          </p>
          {selectedVariant.erpArticleNumber ? (
            <p className="mt-1 text-xs leading-5 text-premium-muted" data-testid="selected-sku">
              {isTableConfigurator ? "Art.-Nr.: " : "Artikelnummer: "}<span className="font-medium text-premium-charcoal">{selectedVariant.erpArticleNumber}</span>
            </p>
          ) : null}
          {process.env.NODE_ENV === "development" && selectedVariant.finderAttributes?.dataStatus === "development" ? (
            <p className="mt-2 inline-flex rounded-full bg-premium-sand/25 px-3 py-1 text-xs font-semibold text-premium-ink">
              Development-Daten
            </p>
          ) : null}
        </div>
      ) : null}

      {selectedVariant?.priceTiers?.length ? <PriceTierCards
        tiers={selectedVariant.priceTiers}
        quantity={quantity}
        unitLabel={product.quantity.unitLabel}
        className="mt-6"
      /> : null}

      {priceStatus === "fixed" && price && basePrice && totalPrice ? <ConfiguratorPriceSummary
        basePrice={optionGroups.length ? basePrice : price}
        configuredPrice={price}
        totalPrice={totalPrice}
        quantity={quantity}
        unitLabel={product.quantity.unitLabel}
        simple={!optionGroups.length}
        adjustments={configurationSurcharge && Number(configurationSurcharge.amount) > 0 && selectedVariant ? [{
          id: selectedVariant.id,
          label: selectedVariant.title,
          price: configurationSurcharge,
        }] : []}
      /> : null}

      {selectedAdvisory ? (
        <section className="mt-6 rounded-2xl border border-premium-beige/80 bg-premium-warm/55 p-5" aria-labelledby="variant-advisory-title" data-testid="variant-advisory">
          <h2 id="variant-advisory-title" className="font-display text-xl font-medium leading-7 text-premium-ink">
            {selectedAdvisory.title}
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-premium-muted">
            {selectedAdvisory.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-premium-forest">Vorteil</dt>
              <dd className="mt-2 text-sm leading-6 text-premium-charcoal">{selectedAdvisory.advantage}</dd>
            </div>
            <div className="rounded-xl bg-white/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-premium-bronze">Nachteil</dt>
              <dd className="mt-2 text-sm leading-6 text-premium-charcoal">{selectedAdvisory.disadvantage}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {compatibleAccessories.map((accessory) => {
        const requested = requestedAccessories.includes(accessory.title);
        return (
          <section key={accessory.title} className="mt-6 rounded-2xl border border-premium-beige/80 p-5" aria-labelledby={`accessory-${accessory.title}`} data-testid="optional-accessory">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 id={`accessory-${accessory.title}`} className="font-display text-xl font-medium text-premium-ink">{accessory.title}</h2>
              <span className="rounded-full bg-premium-sand/25 px-3 py-1 text-xs font-semibold text-premium-ink">{accessory.availabilityLabel}</span>
            </div>
            <div className="mt-3 space-y-3 text-sm leading-6 text-premium-muted">
              {accessory.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-premium-warm/70 px-4 py-3 text-sm font-semibold text-premium-ink">
              <input
                type="checkbox"
                checked={requested}
                onChange={(event) => setRequestedAccessories((current) => event.target.checked
                  ? [...current, accessory.title]
                  : current.filter((title) => title !== accessory.title))}
                className="h-4 w-4 accent-premium-forest"
              />
              Bei der Anfrage vormerken
            </label>
          </section>
        );
      })}

      <CommerceAvailability
        status={availability}
        note={availabilityNote}
        className="mt-6 border-t border-premium-beige/70 pt-6"
      />

      {!isTableConfigurator ? <div className="mt-6 rounded-2xl bg-premium-warm/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-premium-bronze">Mengeneinheit</p>
        <p className="mt-2 text-sm leading-6 text-premium-charcoal">
          {product.quantity.unitLabel}
          {product.quantity.minimum > 1 ? ` · Mindestmenge ${product.quantity.minimum}` : ""}
        </p>
        {product.quantity.note ? (
          <p className="mt-1 text-sm leading-6 text-premium-muted">{product.quantity.note}</p>
        ) : null}
      </div> : null}

      {selectedVariant && selectedRules ? (
        <div className="mt-6 flex flex-wrap items-start justify-end gap-4 border-t border-premium-beige/70 pt-6">
          <QuantityControl
            id="product-quantity"
            quantity={quantity}
            onChange={setQuantity}
            minimum={selectedRules.minimumQuantity}
            step={selectedRules.quantityStep}
            label={isTableConfigurator ? "Anzahl" : "Bestellmenge"}
            inputLabel="Bestellmenge"
          />
        </div>
      ) : null}

      {cartable && selectedVariant ? (
        <>
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
          {selectedVariant.priceDataStatus === "source_unreleased" ? (
            <p className="mt-3 text-center text-xs leading-5 text-premium-bronze">
              VK aus der Datentabelle · nicht als Verkaufspreis freigegeben.
            </p>
          ) : null}
        </>
      ) : priceStatus === "unavailable" || availability === "out_of_stock" ? (
        <p className="mt-7 rounded-2xl bg-premium-warm/80 p-4 text-center text-sm font-medium text-premium-charcoal" data-testid="unavailable-product">
          Diese Ausführung ist derzeit nicht verfügbar.
        </p>
      ) : (
        <>
          <Link
            href={`/kontakt?${contactParameters.toString()}`}
            className="btn-primary mt-7 w-full text-center"
          >
            Angebot anfragen
          </Link>
          <p className="mt-3 text-center text-xs leading-5 text-premium-muted">Wir klären Ausführung, Preis und Verfügbarkeit persönlich.</p>
          {selectedVariant.priceDataStatus === "source_unreleased" ? (
            <p className="mt-2 text-center text-xs leading-5 text-premium-bronze">
              VK aus der Datentabelle · nicht als Verkaufspreis freigegeben.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

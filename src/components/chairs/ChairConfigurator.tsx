"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { recordChairAction } from "@/lib/analytics";
import { useCart } from "@/components/commerce/cart/CartProvider";
import { formatCommerceMoney, lowestProductUnitPrice } from "@/lib/commerce/money";
import { cartLineFromProduct, priceForQuantity } from "@/lib/commerce/cart/lines";
import {
  chairAddonBySku,
  chairAddonPriceForQuantity,
  compatibleChairAddons,
  isChairAddonCompatible,
} from "@/lib/commerce/chair-addons";
import {
  CHAIR_OPTION_VALUES,
  resolveChairVariant,
  type ChairConfiguration,
  type ChairFabricGroup,
  type ChairUpholstery,
} from "@/lib/commerce/stacking-chairs";
import type { CommerceProduct } from "@/lib/commerce/types";
import type { CommerceImage } from "@/lib/commerce/types";

const upholsteryOptions: Array<{ value: ChairUpholstery; label: string; note: string }> = [
  { value: "none", label: "Ungepolstert", note: "ohne Stoffgruppe" },
  { value: "seat", label: "Sitzpolster", note: "Stoffgruppe wählen" },
  { value: "seat-back", label: "Sitz + Rücken", note: "Stoffgruppe wählen" },
];
const fabricGroups: ChairFabricGroup[] = [2, 3, 4];

function normalizedQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(100000, Math.max(1, Math.round(value)));
}

function contactHref(
  product: CommerceProduct,
  configuration: ChairConfiguration,
  quantity: number,
  intent: "Angebot" | "Musterstuhl" | "Beratung",
  selectedAddonSkus: string[],
) {
  const upholstery = CHAIR_OPTION_VALUES.upholstery[configuration.upholstery];
  const rowConnector = configuration.rowConnector ? "ja" : "nein";
  const message = [
    `Modell: ${product.stackingChair?.modelCode ?? product.title}`,
    `Polsterung: ${upholstery}`,
    ...(configuration.fabricGroup ? [`Stoffgruppe: ${configuration.fabricGroup}`] : []),
    `Reihenverbindung: ${rowConnector}`,
    ...(selectedAddonSkus.length > 0
      ? [`Erweiterungen: ${selectedAddonSkus.map((sku) => chairAddonBySku(sku)?.name ?? sku).join(", ")}`]
      : []),
    `Menge: ${quantity}`,
  ].join("\n");
  const parameters = new URLSearchParams({
    anliegen: `${intent} Stapelstuhl`,
    produkt: product.title,
    variante: [
      upholstery,
      configuration.fabricGroup ? `Gruppe ${configuration.fabricGroup}` : null,
      configuration.rowConnector ? "mit Reihenverbindung" : "ohne Reihenverbindung",
    ].filter(Boolean).join(" · "),
    nachricht: message,
  });
  return `/kontakt?${parameters.toString()}#anfrage`;
}

export default function ChairConfigurator({
  product,
  initialConfiguration,
  initialQuantity = 1,
  onVariantImageChange,
}: {
  product: CommerceProduct;
  initialConfiguration: ChairConfiguration;
  initialQuantity?: number;
  onVariantImageChange?: (image: CommerceImage | null) => void;
}) {
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [selectedAddonSkus, setSelectedAddonSkus] = useState<string[]>(
    initialConfiguration.rowConnector ? ["APRV"] : [],
  );
  const [quantity, setQuantity] = useState(() => normalizedQuantity(initialQuantity));
  const { addLines, pending } = useCart();
  const firstVariantEffect = useRef(true);
  const selectedVariant = useMemo(
    () => resolveChairVariant(product, configuration),
    [configuration, product],
  );
  useEffect(() => {
    onVariantImageChange?.(selectedVariant?.image ?? null);
  }, [onVariantImageChange, selectedVariant?.id, selectedVariant?.image]);
  const baseVariant = useMemo(
    () => resolveChairVariant(product, { ...configuration, rowConnector: false }),
    [configuration, product],
  );
  const basePrice = baseVariant ? priceForQuantity(baseVariant, quantity) : null;
  const lowestPrice = useMemo(() => lowestProductUnitPrice(product), [product]);
  const availableAddons = useMemo(
    () => compatibleChairAddons(product.stackingChair?.modelCode, selectedVariant?.id),
    [product.stackingChair?.modelCode, selectedVariant?.id],
  );
  const selectedAddons = selectedAddonSkus
    .map(chairAddonBySku)
    .filter((addon) => addon !== null);
  const addonPrices = selectedAddons.map((addon) => ({
    addon,
    price: chairAddonPriceForQuantity(addon, quantity),
  }));
  const configuredPrice = basePrice ? {
    amount: (
      Number(basePrice.amount)
      + addonPrices.reduce((sum, entry) => sum + Number(entry.price?.amount ?? 0), 0)
    ).toFixed(2),
    currencyCode: basePrice.currencyCode,
  } : null;
  const totalPrice = configuredPrice ? {
    amount: (Number(configuredPrice.amount) * quantity).toFixed(2),
    currencyCode: configuredPrice.currencyCode,
  } : null;

  useEffect(() => {
    setSelectedAddonSkus((current) => current.filter((sku) => {
      const addon = chairAddonBySku(sku);
      return addon && isChairAddonCompatible(
        addon,
        product.stackingChair?.modelCode,
        selectedVariant?.id,
      );
    }));
    const rowConnectorAddon = chairAddonBySku("APRV");
    if (configuration.rowConnector && rowConnectorAddon && !isChairAddonCompatible(
      rowConnectorAddon,
      product.stackingChair?.modelCode,
      selectedVariant?.id,
    )) {
      setConfiguration((current) => ({ ...current, rowConnector: false }));
    }
  }, [configuration.rowConnector, product.stackingChair?.modelCode, selectedVariant?.id]);

  useEffect(() => {
    recordChairAction({ action: "chair_model_view", model: product.stackingChair?.modelCode });
  }, [product.stackingChair?.modelCode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("polster", configuration.upholstery === "none" ? "ungepolstert" : configuration.upholstery === "seat" ? "sitz" : "sitz-ruecken");
    if (configuration.fabricGroup) params.set("gruppe", String(configuration.fabricGroup));
    else params.delete("gruppe");
    params.set("reihe", configuration.rowConnector ? "ja" : "nein");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);

    if (firstVariantEffect.current) {
      firstVariantEffect.current = false;
      return;
    }
    recordChairAction({
      action: "chair_variant_change",
      model: product.stackingChair?.modelCode,
      variantId: selectedVariant?.id,
    });
  }, [configuration, product.stackingChair?.modelCode, selectedVariant?.id]);

  function selectUpholstery(upholstery: ChairUpholstery) {
    setConfiguration((current) => ({
      ...current,
      upholstery,
      ...(upholstery === "none"
        ? { fabricGroup: undefined }
        : { fabricGroup: current.fabricGroup ?? 2 }),
    }));
  }

  function setNextQuantity(value: number) {
    const next = normalizedQuantity(value);
    setQuantity(next);
    recordChairAction({
      action: "chair_quantity_change",
      model: product.stackingChair?.modelCode,
      quantity: next,
    });
  }

  function toggleAddon(sku: string) {
    const selected = selectedAddonSkus.includes(sku);
    setSelectedAddonSkus((current) => selected
      ? current.filter((entry) => entry !== sku)
      : [...current, sku]);
    if (sku === "APRV") {
      setConfiguration((current) => ({ ...current, rowConnector: !selected }));
    }
  }

  const price = configuredPrice ? formatCommerceMoney(configuredPrice) : null;
  const configurationSummary = selectedVariant?.title ?? "Keine gültige Ausführung";

  return (
    <div className="border-t border-premium-beige/80 pt-7" data-testid="chair-configurator">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="section-eyebrow">Ihre Ausführung</p>
          <p className="mt-2 text-sm leading-6 text-premium-muted">Drei Entscheidungen statt 14 Varianten.</p>
        </div>
        <div className="shrink-0 text-right" aria-live="polite" data-testid="chair-price">
          <p className="text-xs uppercase tracking-[.14em] text-premium-subtle">Preis je Stück</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-premium-forest">{price ?? "Auf Anfrage"}</p>
        </div>
      </div>
      {lowestPrice?.priceTierId && lowestPrice.minimumQuantity > 1 ? (
        <div className="mt-3 text-right" data-testid="lowest-tier-price">
          <p className="text-sm font-semibold tabular-nums text-premium-forest">ab {formatCommerceMoney(lowestPrice.price)} / Stück</p>
          <p className="mt-1 text-xs leading-5 text-premium-muted">Bei Abnahme von mindestens {lowestPrice.minimumQuantity} Stück</p>
        </div>
      ) : null}

      <div className="mt-7 space-y-7">
        <fieldset>
          <legend className="text-sm font-semibold text-premium-ink">1. Polsterung</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {upholsteryOptions.map((option) => (
              <label key={option.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="upholstery"
                  value={option.value}
                  checked={configuration.upholstery === option.value}
                  onChange={() => selectUpholstery(option.value)}
                  className="peer sr-only"
                />
                <span className="flex min-h-[4.75rem] flex-col justify-center rounded-xl border border-premium-beige bg-white/65 px-4 py-3 transition peer-checked:border-premium-forest peer-checked:bg-premium-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-premium-sand peer-focus-visible:ring-offset-2">
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 text-xs opacity-70">{option.note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {configuration.upholstery !== "none" ? (
          <fieldset data-testid="fabric-group-selector">
            <legend className="text-sm font-semibold text-premium-ink">2. Stoffgruppe</legend>
            <p className="mt-1 text-xs leading-5 text-premium-muted">Material- und Farbinformationen zu den Gruppen werden noch ergänzt.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {fabricGroups.map((group) => (
                <label key={group} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="fabricGroup"
                    value={group}
                    checked={configuration.fabricGroup === group}
                    onChange={() => setConfiguration((current) => ({ ...current, fabricGroup: group }))}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-12 items-center justify-center rounded-xl border border-premium-beige bg-white/65 px-3 text-sm font-semibold transition peer-checked:border-premium-forest peer-checked:bg-premium-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-premium-sand peer-focus-visible:ring-offset-2">
                    Gruppe {group}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset data-testid="chair-addons">
          <legend className="text-sm font-semibold text-premium-ink">Ausstattung &amp; Erweiterungen</legend>
          <p className="mt-1 text-xs leading-5 text-premium-muted">Mehrere Erweiterungen können miteinander kombiniert werden.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {availableAddons.map((addon) => {
              const addonPrice = chairAddonPriceForQuantity(addon, quantity);
              return (
                <label key={addon.sku} className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    name="chairAddon"
                    value={addon.sku}
                    checked={selectedAddonSkus.includes(addon.sku)}
                    onChange={() => toggleAddon(addon.sku)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-24 flex-col justify-center rounded-xl border border-premium-beige bg-white/65 px-4 py-3 transition peer-checked:border-premium-forest peer-checked:bg-premium-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-premium-sand peer-focus-visible:ring-offset-2">
                    <span className="text-sm font-semibold">{addon.name}</span>
                    <span className="mt-1 text-xs opacity-70">{addon.description}</span>
                    <span className="mt-2 text-xs font-semibold">
                      + {addonPrice ? formatCommerceMoney(addonPrice) : "Preis auf Anfrage"} / Stuhl
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {basePrice && configuredPrice ? (
        <div className="mt-7 rounded-2xl border border-premium-beige/80 bg-white/55 p-5" data-testid="chair-price-breakdown">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-premium-muted">Basispreis</span>
            <span className="font-semibold tabular-nums text-premium-ink">{formatCommerceMoney(basePrice)} / Stuhl</span>
          </div>
          {addonPrices.map(({ addon, price: addonPrice }) => (
            <div key={addon.sku} className="mt-2 flex items-center justify-between gap-4 text-sm">
              <span className="text-premium-muted">+ {addon.name}</span>
              <span className="font-semibold tabular-nums text-premium-ink">{addonPrice ? formatCommerceMoney(addonPrice) : "Preis auf Anfrage"}</span>
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-premium-beige/80 pt-4">
            <span className="font-semibold text-premium-ink">Konfiguriert</span>
            <span className="font-semibold tabular-nums text-premium-forest">{formatCommerceMoney(configuredPrice)} / Stuhl</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4 text-sm" data-testid="chair-total-price">
            <span className="text-premium-muted">Gesamt für {quantity} Stück</span>
            <span className="font-semibold tabular-nums text-premium-ink">{totalPrice ? formatCommerceMoney(totalPrice) : "–"}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-7 grid gap-5 border-y border-premium-beige/75 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[.14em] text-premium-subtle">Gewählte Ausführung</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-premium-ink" aria-live="polite" data-testid="selected-chair-variant">{configurationSummary}</p>
        </div>
        <div>
          <label htmlFor="chair-quantity" className="text-xs font-semibold uppercase tracking-[.14em] text-premium-subtle">Menge</label>
          <div className="mt-2 inline-grid grid-cols-[2.75rem_5rem_2.75rem] overflow-hidden rounded-full border border-premium-beige bg-white">
            <button type="button" onClick={() => setNextQuantity(quantity - 1)} disabled={quantity <= 1} className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35" aria-label="Menge verringern">−</button>
            <input
              id="chair-quantity"
              aria-label="Menge"
              type="number"
              inputMode="numeric"
              min={1}
              max={100000}
              step={1}
              value={quantity}
              onChange={(event) => setNextQuantity(Number(event.target.value))}
              className="min-h-11 w-full border-x border-premium-beige bg-transparent text-center text-base font-semibold tabular-nums outline-none focus:bg-premium-warm/60"
            />
            <button type="button" onClick={() => setNextQuantity(quantity + 1)} disabled={quantity >= 100000} className="min-h-11 text-lg hover:bg-premium-warm disabled:opacity-35" aria-label="Menge erhöhen">+</button>
          </div>
        </div>
      </div>

      {!selectedVariant ? (
        <p role="alert" className="mt-5 rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-900">Diese Kombination ist nicht verfügbar. Bitte wählen Sie eine andere Ausführung.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => addLines([cartLineFromProduct({ product, variant: selectedVariant, quantity, selectedAddonSkus })])}
              disabled={pending || !selectedVariant?.price || !selectedVariant.priceTiers?.length}
              className="btn-primary text-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              In den Warenkorb
            </button>
            <Link
              href={contactHref(product, configuration, quantity, "Angebot", selectedAddonSkus)}
              onClick={() => recordChairAction({ action: "chair_quote_request", model: product.stackingChair?.modelCode, variantId: selectedVariant.id, quantity })}
              className="btn-primary text-center"
            >
              Angebot anfragen
            </Link>
            <Link
              href={contactHref(product, configuration, quantity, "Musterstuhl", selectedAddonSkus)}
              onClick={() => recordChairAction({ action: "chair_sample_request", model: product.stackingChair?.modelCode, variantId: selectedVariant.id, quantity })}
              className="btn-secondary text-center"
            >
              Musterstuhl anfragen
            </Link>
          </div>
          <Link href={contactHref(product, configuration, quantity, "Beratung", selectedAddonSkus)} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
            Fragen zum Modell? Persönlich beraten lassen →
          </Link>
        </>
      )}

      <p className="mt-5 text-xs leading-5 text-premium-subtle">
        * Mengenpreis für die gewählte Stückzahl. Verbindlich wird der Preis im Angebot.
      </p>
    </div>
  );
}

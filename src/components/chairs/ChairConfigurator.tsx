"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { recordChairAction } from "@/lib/analytics";
import { formatCommerceMoney } from "@/lib/commerce/money";
import { priceForQuantity } from "@/lib/commerce/cart/lines";
import {
  CHAIR_OPTION_VALUES,
  resolveChairVariant,
  type ChairConfiguration,
  type ChairFabricGroup,
  type ChairUpholstery,
} from "@/lib/commerce/stacking-chairs";
import type { CommerceProduct } from "@/lib/commerce/types";

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
) {
  const upholstery = CHAIR_OPTION_VALUES.upholstery[configuration.upholstery];
  const rowConnector = configuration.rowConnector ? "ja" : "nein";
  const message = [
    `Modell: ${product.stackingChair?.modelCode ?? product.title}`,
    `Polsterung: ${upholstery}`,
    ...(configuration.fabricGroup ? [`Stoffgruppe: ${configuration.fabricGroup}`] : []),
    `Reihenverbindung: ${rowConnector}`,
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
}: {
  product: CommerceProduct;
  initialConfiguration: ChairConfiguration;
}) {
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [quantity, setQuantity] = useState(1);
  const firstVariantEffect = useRef(true);
  const selectedVariant = useMemo(
    () => resolveChairVariant(product, configuration),
    [configuration, product],
  );
  const baseVariant = useMemo(
    () => resolveChairVariant(product, { ...configuration, rowConnector: false }),
    [configuration, product],
  );
  const connectorVariant = useMemo(
    () => resolveChairVariant(product, { ...configuration, rowConnector: true }),
    [configuration, product],
  );
  const basePrice = baseVariant ? priceForQuantity(baseVariant, quantity) : null;
  const connectorPrice = connectorVariant ? priceForQuantity(connectorVariant, quantity) : null;
  const connectorDelta = basePrice && connectorPrice
    ? Number(connectorPrice.amount) - Number(basePrice.amount)
    : null;

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

  const selectedPrice = selectedVariant ? priceForQuantity(selectedVariant, quantity) : null;
  const price = selectedPrice ? formatCommerceMoney(selectedPrice) : null;
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

        <fieldset>
          <legend className="text-sm font-semibold text-premium-ink">{configuration.upholstery === "none" ? "2" : "3"}. Reihenverbindung</legend>
          <p className="mt-1 text-xs leading-5 text-premium-muted">Für geordnete Reihenbestuhlung; die konkrete Raumplanung wird separat geprüft.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[false, true].map((rowConnector) => (
              <label key={String(rowConnector)} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="rowConnector"
                  value={String(rowConnector)}
                  checked={configuration.rowConnector === rowConnector}
                  onChange={() => setConfiguration((current) => ({ ...current, rowConnector }))}
                  className="peer sr-only"
                />
                <span className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-premium-beige bg-white/65 px-4 py-3 text-sm font-semibold transition peer-checked:border-premium-forest peer-checked:bg-premium-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-premium-sand peer-focus-visible:ring-offset-2">
                  {rowConnector ? "Mit Reihenverbindung" : "Ohne Reihenverbindung"}
                  {rowConnector && connectorDelta !== null && connectorDelta > 0 ? (
                    <span className="text-xs opacity-75">+ {formatCommerceMoney({ amount: connectorDelta.toFixed(2), currencyCode: "EUR" })}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

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
            <Link
              href={contactHref(product, configuration, quantity, "Angebot")}
              onClick={() => recordChairAction({ action: "chair_quote_request", model: product.stackingChair?.modelCode, variantId: selectedVariant.id, quantity })}
              className="btn-primary text-center"
            >
              Angebot anfragen
            </Link>
            <Link
              href={contactHref(product, configuration, quantity, "Musterstuhl")}
              onClick={() => recordChairAction({ action: "chair_sample_request", model: product.stackingChair?.modelCode, variantId: selectedVariant.id, quantity })}
              className="btn-secondary text-center"
            >
              Musterstuhl anfragen
            </Link>
          </div>
          <Link href={contactHref(product, configuration, quantity, "Beratung")} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
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

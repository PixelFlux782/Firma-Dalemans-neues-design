"use client";

import Link from "next/link";
import { isInquiryMode } from "@/lib/commerce/config";
import { useEffect, useMemo, useRef, useState } from "react";
import { recordChairAction } from "@/lib/analytics";
import { useCart } from "@/components/commerce/cart/CartProvider";
import { lowestProductUnitPrice } from "@/lib/commerce/money";
import { usePriceDisplay } from "@/components/commerce/PriceDisplayProvider";
import {
  ConfiguratorPriceSummary,
  CurrentUnitPrice,
  PriceTierCards,
  QuantityControl,
  normalizeConfiguratorQuantity,
} from "@/components/commerce/ConfiguratorPricing";
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
import FabricSelectionDialog, { type FabricSelection } from "@/components/chairs/FabricSelectionDialog";
import KnowledgeInfoTrigger from "@/components/knowledge/KnowledgeInfoTrigger";
import { fabricById } from "@/lib/fabrics";

const upholsteryOptions: Array<{ value: ChairUpholstery; label: string; note: string }> = [
  { value: "none", label: "Ungepolstert", note: "ohne Stoffgruppe" },
  { value: "seat", label: "Sitzpolster", note: "Stoffgruppe wählen" },
  { value: "seat-back", label: "Sitz + Rücken", note: "Stoffgruppe wählen" },
];
const fabricGroups: ChairFabricGroup[] = [2, 3, 4];

function contactHref(
  product: CommerceProduct,
  configuration: ChairConfiguration,
  quantity: number,
  intent: "Angebot" | "Musterstuhl" | "Stoffmuster" | "Beratung",
  selectedAddonSkus: string[],
  fabricSelection: FabricSelection | null,
) {
  const upholstery = CHAIR_OPTION_VALUES.upholstery[configuration.upholstery];
  const rowConnector = configuration.rowConnector ? "ja" : "nein";
  const collection = fabricById(fabricSelection?.collectionId);
  const color = collection?.colors.find((entry) => entry.code === fabricSelection?.colorCode);
  const message = [
    `Modell: ${product.stackingChair?.modelCode ?? product.title}`,
    `Polsterung: ${upholstery}`,
    ...(configuration.fabricGroup ? [`Stoffgruppe: ${configuration.fabricGroup}`] : []),
    ...(collection ? [`Stoffkollektion: ${collection.name}`] : []),
    ...(color ? [`Farbe: ${color.name}`, `Farbcode: ${color.code}`] : []),
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
      collection?.name,
      color ? `${color.name} ${color.code}` : null,
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
  const { formatPrice } = usePriceDisplay();
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [fabricSelection, setFabricSelection] = useState<FabricSelection | null>(null);
  const [fabricDialogOpen, setFabricDialogOpen] = useState(false);
  const [fabricAdviceGroup, setFabricAdviceGroup] = useState<ChairFabricGroup>(() => initialConfiguration.fabricGroup ?? 2);
  const [fabricUrlReady, setFabricUrlReady] = useState(false);
  const [selectedAddonSkus, setSelectedAddonSkus] = useState<string[]>(
    initialConfiguration.rowConnector ? ["APRV"] : [],
  );
  const [quantity, setQuantity] = useState(() => normalizeConfiguratorQuantity(initialQuantity));
  const { addLines, pending } = useCart();
  const firstVariantEffect = useRef(true);
  const selectedVariant = useMemo(
    () => resolveChairVariant(product, configuration),
    [configuration, product],
  );
  const selectedAddonImage = selectedAddonSkus
    .map((sku) => chairAddonBySku(sku)?.image)
    .find((image): image is CommerceImage => Boolean(image)) ?? null;
  useEffect(() => {
    onVariantImageChange?.(selectedAddonImage ?? selectedVariant?.image ?? null);
  }, [onVariantImageChange, selectedAddonImage, selectedVariant?.id, selectedVariant?.image]);
  const baseVariant = useMemo(
    () => resolveChairVariant(product, { ...configuration, rowConnector: false }),
    [configuration, product],
  );
  const basePrice = baseVariant ? priceForQuantity(baseVariant, quantity) : null;
  const lowestPrice = useMemo(() => lowestProductUnitPrice(product), [product]);
  const availableAddons = useMemo(
    () => compatibleChairAddons(product.stackingChair?.modelCode, selectedVariant),
    [product.stackingChair?.modelCode, selectedVariant],
  );
  const compatibleSelectedAddonSkus = selectedAddonSkus.filter((sku) => {
    const addon = chairAddonBySku(sku);
    return addon && isChairAddonCompatible(addon, product.stackingChair?.modelCode, selectedVariant);
  });
  const selectedAddons = compatibleSelectedAddonSkus
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
        selectedVariant,
      );
    }));
    const rowConnectorAddon = chairAddonBySku("APRV");
    if (configuration.rowConnector && rowConnectorAddon && !isChairAddonCompatible(
      rowConnectorAddon,
      product.stackingChair?.modelCode,
      selectedVariant,
    )) {
      setConfiguration((current) => ({ ...current, rowConnector: false }));
    }
  }, [configuration.rowConnector, product.stackingChair?.modelCode, selectedVariant]);

  useEffect(() => {
    recordChairAction({ action: "chair_model_view", model: product.stackingChair?.modelCode });
  }, [product.stackingChair?.modelCode]);

  useEffect(() => {
    if (!fabricUrlReady) return;
    const params = new URLSearchParams(window.location.search);
    params.set("polster", configuration.upholstery === "none" ? "ungepolstert" : configuration.upholstery === "seat" ? "sitz" : "sitz-ruecken");
    if (configuration.fabricGroup) params.set("gruppe", String(configuration.fabricGroup));
    else params.delete("gruppe");
    if (fabricSelection) params.set("stoff", fabricSelection.collectionId);
    else params.delete("stoff");
    if (fabricSelection?.colorCode) params.set("farbe", fabricSelection.colorCode);
    else params.delete("farbe");
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
  }, [configuration, fabricSelection, fabricUrlReady, product.stackingChair?.modelCode, selectedVariant?.id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collection = fabricById(params.get("stoff"));
    if (collection && collection.group === configuration.fabricGroup) {
      const colorCode = params.get("farbe") ?? undefined;
      setFabricSelection({
        collectionId: collection.id,
        ...(collection.colors.some((color) => color.code === colorCode) ? { colorCode } : {}),
      });
    }
    setFabricUrlReady(true);
  // Initial URL state only; later changes are controlled locally.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectUpholstery(upholstery: ChairUpholstery) {
    setConfiguration((current) => ({
      ...current,
      upholstery,
      ...(upholstery === "none"
        ? { fabricGroup: undefined }
        : { fabricGroup: current.fabricGroup ?? 2 }),
    }));
    if (upholstery === "none") setFabricSelection(null);
  }

  function selectFabricGroup(group: ChairFabricGroup) {
    setConfiguration((current) => ({ ...current, fabricGroup: group }));
    if (fabricById(fabricSelection?.collectionId)?.group !== group) setFabricSelection(null);
  }

  function setNextQuantity(value: number) {
    const next = normalizeConfiguratorQuantity(value);
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

  const selectedFabric = fabricById(fabricSelection?.collectionId);
  const selectedFabricColor = selectedFabric?.colors.find((color) => color.code === fabricSelection?.colorCode);
  const configurationSummary = selectedVariant
    ? [selectedVariant.title, selectedFabric?.name, selectedFabricColor ? `${selectedFabricColor.name} ${selectedFabricColor.code}` : null].filter(Boolean).join(" · ")
    : "Keine gültige Ausführung";
  return (
    <div className="border-t border-premium-beige/80 pt-7" data-testid="chair-configurator">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="section-eyebrow">Ihre Ausführung</p>
          <p className="mt-2 text-sm leading-6 text-premium-muted">Drei Entscheidungen statt 14 Varianten.</p>
        </div>
        <CurrentUnitPrice
          status={selectedVariant?.priceStatus ?? product.priceStatus}
          price={configuredPrice}
          compareAtPrice={selectedVariant?.compareAtPrice}
          testId="chair-price"
        />
      </div>
      {lowestPrice?.priceTierId && lowestPrice.minimumQuantity > 1 ? (
        <div className="mt-3 text-right" data-testid="lowest-tier-price">
          <p className="text-sm font-semibold tabular-nums text-premium-forest">ab {formatPrice(lowestPrice.price)} / Stück</p>
          <p className="mt-1 text-xs leading-5 text-premium-muted">Bei Abnahme von mindestens {lowestPrice.minimumQuantity} Stück</p>
        </div>
      ) : null}
      {selectedVariant?.priceTiers?.length ? <PriceTierCards
        tiers={selectedVariant.priceTiers}
        quantity={quantity}
        unitLabel="Stück"
        titleId="chair-price-tiers-title"
      /> : null}

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
            <p className="mt-1 text-xs leading-5 text-premium-muted">Alle Modelle nutzen dieselben Gruppen. Kollektion und Farbe können Sie anschließend im Detail prüfen.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {fabricGroups.map((group) => (
                <div key={group} className="relative min-w-0">
                  <label className="relative block cursor-pointer">
                    <input
                      type="radio"
                      name="fabricGroup"
                      value={group}
                      checked={configuration.fabricGroup === group}
                      onChange={() => selectFabricGroup(group)}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-12 items-center justify-center rounded-xl border border-premium-beige bg-white/65 px-10 text-sm font-semibold transition peer-checked:border-premium-forest peer-checked:bg-premium-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-premium-sand peer-focus-visible:ring-offset-2">
                      Gruppe {group}
                    </span>
                  </label>
                  <KnowledgeInfoTrigger
                    optionId={`fabric-group-${group}`}
                    label={`Stoffgruppe ${group}`}
                    className="absolute left-2 top-2"
                  />
                  <button
                    type="button"
                    aria-label={`Materialberater für Stoffgruppe ${group} öffnen`}
                    aria-haspopup="dialog"
                    onClick={() => {
                      setFabricAdviceGroup(group);
                      setFabricDialogOpen(true);
                    }}
                    className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border border-premium-beige bg-white/95 text-sm font-semibold text-premium-forest shadow-sm transition hover:border-premium-leaf hover:bg-premium-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2"
                  >
                    <span aria-hidden="true">ⓘ</span>
                  </button>
                </div>
              ))}
            </div>
            {selectedFabric ? <p className="mt-3 text-sm font-semibold text-premium-ink" data-testid="selected-fabric">Ausgewählt: {selectedFabric.name}{selectedFabricColor ? ` · ${selectedFabricColor.name} · ${selectedFabricColor.code}` : ""}</p> : null}
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
                      + {addonPrice ? formatPrice(addonPrice) : "Preis auf Anfrage"} / Stuhl
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {basePrice && configuredPrice && totalPrice ? <ConfiguratorPriceSummary
        basePrice={basePrice}
        configuredPrice={configuredPrice}
        totalPrice={totalPrice}
        quantity={quantity}
        unitLabel="Stück"
        adjustments={addonPrices.map(({ addon, price: addonPrice }) => ({
          id: addon.sku,
          label: addon.name,
          price: addonPrice,
        }))}
        testId="chair-price-breakdown"
        totalTestId="chair-total-price"
      /> : null}

      <div className="mt-7 grid gap-5 border-y border-premium-beige/75 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[.14em] text-premium-subtle">Gewählte Ausführung</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-premium-ink" aria-live="polite" data-testid="selected-chair-variant">{configurationSummary}</p>
        </div>
        <QuantityControl id="chair-quantity" quantity={quantity} onChange={setNextQuantity} />
      </div>

      {!selectedVariant ? (
        <p role="alert" className="mt-5 rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-900">Diese Kombination ist nicht verfügbar. Bitte wählen Sie eine andere Ausführung.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => addLines([cartLineFromProduct({ product, variant: selectedVariant, quantity, selectedAddonSkus: compatibleSelectedAddonSkus, variantTitle: configurationSummary })])}
              disabled={pending || !selectedVariant?.price || !selectedVariant.priceTiers?.length}
              className="btn-primary text-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInquiryMode ? "Zur Auswahl hinzufügen" : "In den Warenkorb"}
            </button>
            <Link
              href={contactHref(product, configuration, quantity, "Musterstuhl", compatibleSelectedAddonSkus, fabricSelection)}
              onClick={() => recordChairAction({ action: "chair_sample_request", model: product.stackingChair?.modelCode, variantId: selectedVariant.id, quantity })}
              className="btn-secondary text-center"
            >
              Musterstuhl anfragen
            </Link>
          </div>
          {isInquiryMode ? <p className="mt-3 text-center text-xs leading-5 text-premium-muted">Unverbindlich zusammenstellen · Angebot im Warenkorb anfragen</p> : null}
          {configuration.upholstery !== "none" ? <Link href={contactHref(product, configuration, quantity, "Stoffmuster", compatibleSelectedAddonSkus, fabricSelection)} className="mt-4 mr-6 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">Stoffmuster anfragen →</Link> : null}
          <Link href={contactHref(product, configuration, quantity, "Beratung", compatibleSelectedAddonSkus, fabricSelection)} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-premium-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
            Fragen zu diesem Modell? Persönlich beraten lassen →
          </Link>
        </>
      )}

      <p className="mt-5 text-xs leading-5 text-premium-subtle">
        * Mengenpreis für die gewählte Stückzahl. Verbindlich wird der Preis im Angebot.
      </p>
      {configuration.upholstery !== "none" ? <FabricSelectionDialog
        open={fabricDialogOpen}
        group={fabricAdviceGroup}
        value={fabricSelection}
        model={product.stackingChair?.modelCode ?? product.title}
        onGroupChange={setFabricAdviceGroup}
        onChange={(selection) => {
          setConfiguration((current) => ({ ...current, fabricGroup: fabricAdviceGroup }));
          setFabricSelection(selection);
        }}
        onClose={() => setFabricDialogOpen(false)}
      /> : null}
    </div>
  );
}

import type {
  CommerceMoney,
  CommercePriceTier,
  CommerceProductVariant,
} from "@/lib/commerce/types";

export interface ChairAddon {
  sku: string;
  name: string;
  description: string;
  priceTiers: CommercePriceTier[];
  compatibleModels?: string[];
  compatibleVariants?: string[];
  pricingSource: "documented-tiers" | "base-price-only";
}

function money(amount: number): CommerceMoney {
  return { amount: amount.toFixed(2), currencyCode: "EUR" };
}

function fixedAddon(
  sku: string,
  name: string,
  description: string,
  amount: number,
): ChairAddon {
  return {
    sku,
    name,
    description,
    priceTiers: [{
      id: `${sku}-base`,
      price: money(amount),
      minimumQuantity: 1,
      maximumQuantity: null,
      label: "Basis-Aufpreis",
    }],
    pricingSource: "base-price-only",
  };
}

/** Aufpreispositionen aus Export_Flo, Zeilen 36–42. */
export const CHAIR_ADDONS: ChairAddon[] = [
  fixedAddon("APRV", "Reihenverbindung", "Für geordnete Reihenbestuhlung", 3.63),
  fixedAddon("APGSTR22", "Bogengestell, 22 mm", "Alternative Gestellausführung", 3.38),
  fixedAddon("A1021FG", "Filzgelenkgleiter", "Für empfindliche Hartböden", 6.90),
  fixedAddon("A1021TG", "Teppichboden-Gelenkgleiter", "Für textile Bodenbeläge", 6.59),
  fixedAddon("A1021BEI", "Gebeizte Schale", "Holzschale in gebeizter Ausführung", 4.16),
  fixedAddon("AP1021GRL", "Griffloch im Rückenteil", "Erleichtert das Tragen und Umstellen", 4.55),
  {
    sku: "BU1021C",
    name: "Buchablage aus Stahlblech",
    description: "Ablage unter der Sitzfläche",
    priceTiers: [
      { id: "BU1021C-1-100", price: money(27.50), minimumQuantity: 1, maximumQuantity: 100, label: "bis 100 Stück" },
      { id: "BU1021C-101-250", price: money(26.87), minimumQuantity: 101, maximumQuantity: 250, label: "101–250 Stück" },
      { id: "BU1021C-251", price: money(26.45), minimumQuantity: 251, maximumQuantity: null, label: "ab 251 Stück" },
    ],
    pricingSource: "documented-tiers",
  },
];

export function chairAddonBySku(sku: string) {
  return CHAIR_ADDONS.find((addon) => addon.sku === sku) ?? null;
}

export function chairAddonPriceForQuantity(addon: ChairAddon, quantity: number) {
  return addon.priceTiers.find((tier) =>
    (tier.minimumQuantity === null || quantity >= tier.minimumQuantity)
      && (tier.maximumQuantity === null || quantity <= tier.maximumQuantity),
  )?.price ?? null;
}

export function isChairAddonCompatible(
  addon: ChairAddon,
  modelCode: string | undefined,
  variantId: string | undefined,
) {
  return (!addon.compatibleModels || Boolean(modelCode && addon.compatibleModels.includes(modelCode)))
    && (!addon.compatibleVariants || Boolean(variantId && addon.compatibleVariants.includes(variantId)));
}

export function compatibleChairAddons(modelCode: string | undefined, variantId: string | undefined) {
  return CHAIR_ADDONS.filter((addon) => isChairAddonCompatible(addon, modelCode, variantId));
}

export function configuredChairPriceTiers(
  variant: CommerceProductVariant,
  selectedAddonSkus: string[],
) {
  if (!variant.priceTiers?.length) return variant.priceTiers;
  const additionalAddons = selectedAddonSkus
    .filter((sku) => sku !== "APRV")
    .map(chairAddonBySku)
    .filter((addon): addon is ChairAddon => addon !== null);

  return variant.priceTiers.map((tier) => {
    const quantity = tier.minimumQuantity ?? 1;
    const surcharge = additionalAddons.reduce((sum, addon) => {
      return sum + Number(chairAddonPriceForQuantity(addon, quantity)?.amount ?? 0);
    }, 0);
    return {
      ...tier,
      id: `${tier.id}-${selectedAddonSkus.slice().sort().join("-") || "no-addons"}`,
      price: money(Number(tier.price.amount) + surcharge),
    };
  });
}

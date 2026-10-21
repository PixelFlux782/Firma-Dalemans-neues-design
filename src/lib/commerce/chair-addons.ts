import type {
  CommerceImage,
  CommerceMoney,
  CommercePriceTier,
  CommerceProductVariant,
} from "@/lib/commerce/types";
import { chairConfigurationFromVariant } from "@/lib/commerce/stacking-chairs";

export interface ChairAddon {
  sku: string;
  name: string;
  description: string;
  priceTiers: CommercePriceTier[];
  compatibleModels?: string[];
  compatibleVariants?: string[];
  pricingSource: "documented-tiers" | "base-price-only";
  image?: CommerceImage;
}

function money(amount: number): CommerceMoney {
  return { amount: amount.toFixed(2), currencyCode: "EUR" };
}

function fixedAddon(
  sku: string,
  name: string,
  description: string,
  amount: number,
  image?: CommerceImage,
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
    image,
  };
}

/** Aufpreispositionen aus Export_Flo, Zeilen 36–42. */
export const CHAIR_ADDONS: ChairAddon[] = [
  fixedAddon("APRV", "Reihenverbindung", "Für geordnete Reihenbestuhlung", 3.63),
  fixedAddon(
    "APGSTR22",
    "Bogengestell, 22 mm",
    "Alternative Gestellausführung",
    3.38,
    {
      url: encodeURI("/neue bilder/Stapelstühle/reihenverbinder/Bogengestell_22_mm-optimiert.webp"),
      altText: "Stapelstuhl mit Bogengestell aus 22-mm-Rohr",
      width: null,
      height: null,
    },
  ),
  fixedAddon("A1021FG", "Filzgelenkgleiter", "Für empfindliche Hartböden", 6.90),
  fixedAddon("A1021TG", "Teppichboden-Gelenkgleiter", "Für textile Bodenbeläge", 6.59),
  fixedAddon("A1021BEI", "Gebeizte Schale", "Holzschale in gebeizter Ausführung", 4.16),
  fixedAddon("AP1021GRL", "Griffloch im Rückenteil", "Erleichtert das Tragen und Umstellen", 4.55),
  {
    sku: "BU1021C",
    name: "Buchablage aus Stahlblech",
    description: "Ablage unter der Sitzfläche",
    priceTiers: [
      { id: "BU1021C-1-99", price: money(27.50), minimumQuantity: 1, maximumQuantity: 99, label: "1–99 Stück" },
      { id: "BU1021C-100-249", price: money(26.87), minimumQuantity: 100, maximumQuantity: 249, label: "100–249 Stück" },
      { id: "BU1021C-250", price: money(26.45), minimumQuantity: 250, maximumQuantity: null, label: "ab 250 Stück" },
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
  variant: CommerceProductVariant | null | undefined,
) {
  const configuration = variant ? chairConfigurationFromVariant(variant) : null;
  const upholsteryCompatible = addon.sku !== "AP1021GRL"
    || configuration?.upholstery === "none"
    || configuration?.upholstery === "seat";

  return (!addon.compatibleModels || Boolean(modelCode && addon.compatibleModels.includes(modelCode)))
    && (!addon.compatibleVariants || Boolean(variant && addon.compatibleVariants.includes(variant.id)))
    && upholsteryCompatible;
}

export function compatibleChairAddons(modelCode: string | undefined, variant: CommerceProductVariant | null | undefined) {
  return CHAIR_ADDONS.filter((addon) => isChairAddonCompatible(addon, modelCode, variant));
}

export function chairAddonGalleryImages() {
  return CHAIR_ADDONS.flatMap((addon) => addon.image ? [addon.image] : []);
}

export function configuredChairPriceTiers(
  variant: CommerceProductVariant,
  selectedAddonSkus: string[],
  modelCode?: string,
) {
  if (!variant.priceTiers?.length) return variant.priceTiers;
  const additionalAddons = selectedAddonSkus
    .filter((sku) => sku !== "APRV")
    .map(chairAddonBySku)
    .filter((addon): addon is ChairAddon => addon !== null && isChairAddonCompatible(addon, modelCode, variant));

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

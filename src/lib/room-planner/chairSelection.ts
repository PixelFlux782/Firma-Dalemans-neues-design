import { localStackingChairProducts } from "@/lib/commerce/providers/local-stacking-chairs";
import type { RoomPlan } from "./objects";
import { canAddVariantToCart } from "@/lib/commerce/cart/lines";
import { chairConfigurationFromVariant } from "@/lib/commerce/stacking-chairs";

export type ChairSelection = { productId: string; variantId: string; width: number; depth: number };
export const chairProducts = localStackingChairProducts;
export const DEFAULT_CHAIR_SELECTION: ChairSelection = {
  productId: chairProducts[0].id,
  variantId: chairProducts[0].variants[0].id,
  width: 0.5,
  depth: 0.55,
};
export function resolveChair(selection: ChairSelection = DEFAULT_CHAIR_SELECTION) {
  const product = chairProducts.find((item) => item.id === selection.productId);
  const variant = product?.variants.find((item) => item.id === selection.variantId);
  return { product, variant };
}
export function calculatePlanDemand(plan: RoomPlan) {
  const selection = plan.chairSelection ?? DEFAULT_CHAIR_SELECTION;
  const { product, variant } = resolveChair(selection);
  return {
    selection, product, variant,
    quantity: plan.seating?.blocks.reduce((sum, block) => sum + block.seats.length, 0) ?? 0,
    blocks: plan.seating?.blocks.filter((block) => block.seats.length > 0).length ?? 0,
  };
}
export function resolveChairShopTarget(plan: RoomPlan) {
  const { product, variant, quantity } = calculatePlanDemand(plan);
  if (!product || !variant) return null;
  const configuration = chairConfigurationFromVariant(variant);
  if (!configuration) return null;
  const params = new URLSearchParams({
    polster: configuration.upholstery === "seat" ? "sitz" : configuration.upholstery === "seat-back" ? "sitz-ruecken" : "ohne",
    reihe: configuration.rowConnector ? "ja" : "nein",
    ...(configuration.fabricGroup ? { gruppe: String(configuration.fabricGroup) } : {}),
    ...(quantity > 0 ? { menge: String(quantity) } : {}),
  });
  return { href: `/produkte/stapelstuehle/${product.handle}?${params}`, canAddToCart: canAddVariantToCart(variant) };
}
export function changeChairSelection(plan: RoomPlan, selection: ChairSelection): RoomPlan {
  return {
    ...plan,
    chairSelection: selection,
    seating: plan.seating ? {
      ...plan.seating,
      rules: { ...plan.seating.rules, chairWidth: selection.width, chairDepth: selection.depth },
    } : undefined,
  };
}

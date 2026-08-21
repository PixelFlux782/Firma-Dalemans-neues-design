import type {
  CartInputLine,
  CartUpdateLine,
  CommerceCartProvider,
} from "@/lib/commerce/types";

/**
 * Stable UI-facing boundary. A later Shopify cart provider only replaces the
 * injected provider; context, drawer, product and finder actions stay intact.
 */
export function createCommerceCartService(provider: CommerceCartProvider): CommerceCartProvider {
  return {
    getCart: () => provider.getCart(),
    addLines: (lines: CartInputLine[]) => provider.addLines(lines),
    updateLines: (lines: CartUpdateLine[]) => provider.updateLines(lines),
    removeLines: (lineIds: string[]) => provider.removeLines(lineIds),
    clearCart: () => provider.clearCart(),
  };
}

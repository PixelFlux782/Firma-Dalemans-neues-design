import "server-only";
import { getCollectionByHandle } from "@/lib/commerce/service";
import { commerceProductPath } from "@/lib/product-routes";

/** Uses the same public collection boundary as the assortment page. No separate cache or filters. */
export async function getGliderNavigation() {
  const collection = await getCollectionByHandle("gleiter-bodenschutz");
  return (collection?.products ?? []).map(product => ({
    label: product.title,
    href: commerceProductPath(product),
  }));
}
